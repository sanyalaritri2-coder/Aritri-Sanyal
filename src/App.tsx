/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { AutoplayBanner } from './components/AutoplayBanner';
import { PlaylistsModal } from './components/PlaylistsModal';
import { SongsQueueModal } from './components/SongsQueueModal';
import { InstallModal } from './components/InstallModal';
import { TRACKS, PLAYLISTS } from './data/tracks';
import { Track, ActiveModal, DeviceView } from './types';
import { vinylHissEngine } from './utils/audioEngine';
import { backgroundAudioManager } from './utils/backgroundAudio';
import { QRCodeModal } from './components/QRCodeModal';
import cafeBgImage from './assets/images/pyaar_ka_mehfil_bg_1787113446993.jpg';

// YouTube Player global types
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, any>;
          events?: {
            onReady?: (event: any) => void;
            onStateChange?: (event: any) => void;
            onError?: (event: any) => void;
          };
        }
      ) => any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

export default function App() {
  // Audio state
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(TRACKS[0].duration);
  const [volume, setVolume] = useState<number>(0.8);
  const [isHissActive, setIsHissActive] = useState<boolean>(false);
  const [showAutoplayBanner, setShowAutoplayBanner] = useState<boolean>(true);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  // Modal State
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [deviceView, setDeviceView] = useState<DeviceView>('laptop');

  // YouTube Player instance ref
  const ytPlayerRef = useRef<any>(null);
  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0];

  // 1. Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT || !window.YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initYouTubePlayer();
      };
    } else {
      initYouTubePlayer();
    }

    return () => {
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // 2. Initialize YouTube Player
  const initYouTubePlayer = () => {
    if (ytPlayerRef.current) return;

    try {
      ytPlayerRef.current = new window.YT.Player('youtube-audio-engine-target', {
        height: '180',
        width: '180',
        videoId: TRACKS[0].youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            try {
              event.target.setVolume(volume * 100);
            } catch (e) {
              // ignore
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setShowAutoplayBanner(false);
              try {
                const dur = event.target.getDuration();
                if (dur && !isNaN(dur) && dur > 0) {
                  setDuration(dur);
                }
              } catch (e) {
                // ignore
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              handleNextTrack();
            }
          },
          onError: () => {
            // Auto skip to next track on error
            setTimeout(() => {
              handleNextTrack();
            }, 1000);
          }
        },
      });
    } catch (err) {
      console.error('Error initializing YouTube Player:', err);
    }
  };

  // 3. Track change effect
  useEffect(() => {
    if (ytPlayerRef.current && isPlayerReady) {
      try {
        ytPlayerRef.current.loadVideoById({
          videoId: currentTrack.youtubeId,
          startSeconds: 0,
        });
        setCurrentTime(0);
        setDuration(currentTrack.duration);
        if (isPlaying) {
          ytPlayerRef.current.playVideo();
        }
      } catch (err) {
        console.error('Error loading video by ID:', err);
      }
    }
  }, [currentTrackIndex, isPlayerReady]);

  // 4. Time synchronization polling when playing
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        try {
          if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
            const curr = ytPlayerRef.current.getCurrentTime();
            const dur = ytPlayerRef.current.getDuration();
            if (curr !== undefined && !isNaN(curr)) {
              setCurrentTime(curr);
            }
            if (dur && !isNaN(dur) && dur > 0) {
              setDuration(dur);
            }
          }
        } catch (e) {
          // ignore
        }
      }, 350);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // 5. Native OS MediaSession & Background Screen-Sleep Keepalive Synchronization
  useEffect(() => {
    if (isPlaying) {
      backgroundAudioManager.activateKeepAlive();
    } else {
      backgroundAudioManager.deactivateKeepAlive();
    }

    // Register MediaSession with iOS/Android Lock Screen & macOS/Windows Control Centers
    backgroundAudioManager.updateMediaSession(
      currentTrack,
      {
        onPlay: () => {
          if (ytPlayerRef.current && isPlayerReady) {
            try {
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
            } catch (e) {
              // ignore
            }
          }
        },
        onPause: () => {
          if (ytPlayerRef.current && isPlayerReady) {
            try {
              ytPlayerRef.current.pauseVideo();
              setIsPlaying(false);
            } catch (e) {
              // ignore
            }
          }
        },
        onNext: () => {
          handleNextTrack();
        },
        onPrev: () => {
          handlePrevTrack();
        },
        onSeek: (time) => {
          handleSeek(time);
        },
      },
      isPlaying ? 'playing' : 'paused',
      {
        duration: duration || currentTrack.duration,
        playbackRate: 1.0,
        position: currentTime,
      }
    );
  }, [currentTrack, isPlaying, currentTime, duration, isPlayerReady]);

  // Volume changes
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      try {
        ytPlayerRef.current.setVolume(newVol * 100);
      } catch (e) {
        // ignore
      }
    }
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    setShowAutoplayBanner(false);

    if (!ytPlayerRef.current || !isPlayerReady) {
      initYouTubePlayer();
      return;
    }

    try {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error toggling play/pause:', err);
    }
  };

  // Autoplay banner unblock click
  const handleAutoplayClick = () => {
    setShowAutoplayBanner(false);
    handleTogglePlay();
  };

  // Next Track
  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setCurrentTime(0);
  };

  // Previous Track
  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev === 0 ? TRACKS.length - 1 : prev - 1));
    setCurrentTime(0);
  };

  // Seek
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
      try {
        ytPlayerRef.current.seekTo(newTime, true);
      } catch (e) {
        // ignore
      }
    }
  };

  // Toggle Hiss (Vintage vinyl radio crackle via Web Audio API)
  const handleToggleHiss = () => {
    const newState = vinylHissEngine.toggle();
    setIsHissActive(newState);
  };

  // Select Track from modal
  const handleSelectTrack = (track: Track) => {
    const idx = TRACKS.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setCurrentTime(0);
      setIsPlaying(true);
      setShowAutoplayBanner(false);
      if (ytPlayerRef.current && isPlayerReady) {
        try {
          ytPlayerRef.current.loadVideoById({
            videoId: track.youtubeId,
            startSeconds: 0,
          });
          ytPlayerRef.current.playVideo();
        } catch (e) {
          // ignore
        }
      }
    }
  };

  // Keyboard shortcut listener (Space = play/pause, H = hiss)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'h' || e.key === 'H') {
        handleToggleHiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isHissActive, isPlayerReady]);

  return (
    <main 
      id="app-root-viewport"
      className="relative w-full h-screen h-[100dvh] min-h-[100dvh] overflow-hidden flex flex-col justify-between select-none"
      style={{
        backgroundImage: `url(${cafeBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Hidden YouTube IFrame Audio Engine Element (Kept active in DOM for sound streaming) */}
      <div 
        className="fixed -bottom-96 -right-96 opacity-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div id="youtube-audio-engine-target"></div>
      </div>

      {/* Subtle atmospheric vignette & warm sunbeam glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: deviceView === 'mobile'
            ? 'radial-gradient(ellipse at 50% 50%, rgba(12, 6, 4, 0.75) 0%, rgba(5, 2, 2, 0.94) 100%)'
            : 'radial-gradient(ellipse at 50% 20%, rgba(254, 240, 138, 0.08) 0%, rgba(28, 15, 10, 0.25) 60%, rgba(12, 6, 4, 0.65) 100%)'
        }}
      />

      {/* TOP HEADER WITH DEVICE SWITCHER */}
      <Header 
        onOpenModal={(modal) => setActiveModal(modal)} 
        activeModal={activeModal} 
        deviceView={deviceView}
        onToggleDeviceView={(mode) => setDeviceView(mode)}
      />

      {/* AUTOPLAY UNBLOCK BANNER */}
      <AutoplayBanner 
        isVisible={showAutoplayBanner && !isPlaying} 
        onStartAudio={handleAutoplayClick} 
      />

      {/* CONDITIONAL RENDER: LAPTOP (FULL BLEED) VS MOBILE (PHONE SIMULATOR) */}
      {deviceView === 'laptop' ? (
        /* --- LAPTOP / DESKTOP WIDESCREEN VIEW --- */
        <div className="absolute inset-x-0 bottom-2.5 sm:bottom-4 z-20 flex items-center justify-center pointer-events-none px-3 sm:px-6">
          <div className="w-full max-w-2xl pointer-events-auto">
            {/* Floating Compact Glass Pill Music Player Bar */}
            <MusicPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNextTrack={handleNextTrack}
              onPrevTrack={handlePrevTrack}
              onSeek={handleSeek}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              onVolumeChange={handleVolumeChange}
              isHissActive={isHissActive}
              onToggleHiss={handleToggleHiss}
            />
          </div>
        </div>
      ) : (
        /* --- MOBILE PHONE DEVICE PREVIEW VIEW --- */
        <div className="absolute inset-0 z-20 pt-14 pb-4 flex flex-col items-center justify-center pointer-events-none px-2 sm:px-4">
          {/* Framed Smartphone Simulator Chassis */}
          <div 
            id="mobile-phone-simulator-chassis"
            className="pointer-events-auto relative w-full max-w-[380px] h-[720px] max-h-[82vh] rounded-[42px] border-[8px] sm:border-[10px] border-stone-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col justify-between bg-stone-950 ring-1 ring-white/20"
            style={{
              backgroundImage: `url(${cafeBgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          >
            {/* Phone Top Dynamic Island & Status Bar */}
            <div className="relative z-30 pt-2 px-6 flex items-center justify-between pointer-events-none">
              <span className="text-[11px] font-mono-num font-bold text-stone-200">
                {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
              
              {/* Dynamic Island Pill */}
              <div className="w-24 h-4 bg-black rounded-full border border-stone-800 flex items-center justify-end pr-2 gap-1 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-stone-900 border border-stone-700"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-pulse"></div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-stone-200">
                <span className="text-[10px] font-bold">5G</span>
                <div className="w-4 h-2 rounded-sm border border-stone-300 p-0.5 flex items-center">
                  <div className="h-full w-3 bg-stone-200 rounded-2xs"></div>
                </div>
              </div>
            </div>

            {/* Subtle phone internal vignette */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 20%, rgba(254, 240, 138, 0.08) 0%, rgba(28, 15, 10, 0.2) 60%, rgba(12, 6, 4, 0.6) 100%)'
              }}
            />

            {/* Center spacing to keep the background painting artwork fully visible */}
            <div className="flex-1"></div>

            {/* Mobile Music Player Inside Phone */}
            <div className="relative z-20 w-full px-2 pb-3">
              <MusicPlayer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onNextTrack={handleNextTrack}
                onPrevTrack={handlePrevTrack}
                onSeek={handleSeek}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                onVolumeChange={handleVolumeChange}
                isHissActive={isHissActive}
                onToggleHiss={handleToggleHiss}
              />
            </div>

            {/* Bottom iOS Home Indicator Bar */}
            <div className="relative z-30 pb-2 flex justify-center pointer-events-none">
              <div className="w-32 h-1 bg-white/70 rounded-full shadow-sm"></div>
            </div>
          </div>

          {/* Quick Tip / Scan on Phone Prompt Below Simulator */}
          <div className="mt-2 pointer-events-auto flex items-center gap-2 bg-stone-950/80 px-3.5 py-1 rounded-full border border-white/10 shadow-lg text-[11px] text-stone-300">
            <span>Viewing in Phone Mode</span>
            <span className="text-stone-500">•</span>
            <button 
              onClick={() => setActiveModal('qrcode')}
              className="text-amber-300 hover:text-amber-200 font-bold underline underline-offset-2"
            >
              Scan QR Code to open on actual phone 📱
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <PlaylistsModal
        isOpen={activeModal === 'playlists'}
        onClose={() => setActiveModal('none')}
        playlists={PLAYLISTS}
        onSelectPlaylistTrack={handleSelectTrack}
        currentTrackId={currentTrack.id}
      />

      <SongsQueueModal
        isOpen={activeModal === 'songs'}
        onClose={() => setActiveModal('none')}
        tracks={TRACKS}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onSelectTrack={handleSelectTrack}
      />

      <InstallModal
        isOpen={activeModal === 'install'}
        onClose={() => setActiveModal('none')}
      />

      <QRCodeModal
        isOpen={activeModal === 'qrcode'}
        onClose={() => setActiveModal('none')}
      />
    </main>
  );
}
