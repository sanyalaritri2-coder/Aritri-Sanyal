/**
 * Background Audio & Screen-Sleep Keepalive Engine
 * 
 * Ensures continuous background audio playback when:
 * 1. Mobile phone screen is locked / turned off
 * 2. Laptop lid is closed / screen enters sleep mode
 * 3. Browser tab is placed in background or minimized
 * 4. User controls audio via Lock Screen / Notification Center / Headphone buttons (MediaSession API)
 */

import { Track } from '../types';

class BackgroundAudioManager {
  private silentAudio: HTMLAudioElement | null = null;
  private wakeLock: any = null;
  private isKeepAliveActive: boolean = false;
  private audioCtx: AudioContext | null = null;
  private silentOscillator: OscillatorNode | null = null;
  private silentGain: GainNode | null = null;

  constructor() {
    this.setupVisibilityListener();
  }

  /**
   * Initializes silent background audio loop and connects to MediaStream
   * This is required by iOS Safari & Android Chrome to trigger the OS Lock Screen widget and prevent the audio thread from suspending.
   */
  private initSilentAudioElement() {
    if (!this.silentAudio) {
      try {
        // Continuous audio element with playsinline and AirPlay capabilities
        this.silentAudio = new Audio();
        this.silentAudio.loop = true;
        this.silentAudio.volume = 0.05;
        this.silentAudio.setAttribute('playsinline', 'true');
        this.silentAudio.setAttribute('webkit-playsinline', 'true');
        this.silentAudio.setAttribute('x-webkit-airplay', 'allow');
        
        // 1-second silent WAV base64 data URI fallback
        const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        this.silentAudio.src = silentWav;
      } catch (e) {
        console.warn('Could not initialize silent audio element:', e);
      }
    }
  }

  /**
   * Web Audio API MediaStream Keepalive Node
   * Pipes an active audio stream directly into an HTML5 Audio element to trigger iOS / Android MediaSession
   */
  private initWebAudioKeepAlive() {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      if (!this.silentOscillator && this.audioCtx) {
        this.silentOscillator = this.audioCtx.createOscillator();
        this.silentGain = this.audioCtx.createGain();
        
        // Inaudible frequency with gentle gain (maintains audio subsystem active)
        this.silentOscillator.frequency.value = 40; // 40Hz sub-bass
        this.silentGain.gain.value = 0.001;

        // Create MediaStream destination for the HTML5 audio element
        if (typeof (this.audioCtx as any).createMediaStreamDestination === 'function') {
          const streamDest = (this.audioCtx as any).createMediaStreamDestination();
          this.silentGain.connect(streamDest);
          if (this.silentAudio) {
            try {
              this.silentAudio.srcObject = streamDest.stream;
            } catch (err) {
              // Fallback to data URI
            }
          }
        }

        this.silentGain.connect(this.audioCtx.destination);
        this.silentOscillator.connect(this.silentGain);
        this.silentOscillator.start();
      }
    } catch (e) {
      console.warn('Web Audio Keepalive init notice:', e);
    }
  }

  /**
   * Request Screen Wake Lock if supported
   */
  public async requestWakeLock() {
    if ('wakeLock' in navigator && (navigator as any).wakeLock) {
      try {
        if (!this.wakeLock) {
          this.wakeLock = await (navigator as any).wakeLock.request('screen');
          this.wakeLock.addEventListener('release', () => {
            this.wakeLock = null;
          });
        }
      } catch (err) {
        // WakeLock may fail if low battery or permission denied; graceful fallback
      }
    }
  }

  /**
   * Release Screen Wake Lock
   */
  public releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release();
      } catch (e) {
        // ignore
      }
      this.wakeLock = null;
    }
  }

  /**
   * Activate background audio keepalive when music starts playing
   */
  public activateKeepAlive() {
    this.isKeepAliveActive = true;
    this.initSilentAudioElement();
    this.initWebAudioKeepAlive();

    if (this.silentAudio) {
      this.silentAudio.play().catch(() => {
        // Handled after user gesture
      });
    }

    this.requestWakeLock();
  }

  /**
   * Deactivate keepalive when music is paused
   */
  public deactivateKeepAlive() {
    this.isKeepAliveActive = false;
    if (this.silentAudio) {
      try {
        this.silentAudio.pause();
      } catch (e) {
        // ignore
      }
    }
    this.releaseWakeLock();
  }

  /**
   * Re-acquire Wake Lock & keepalive on visibility change (e.g. returning from sleep or switching back)
   */
  private setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isKeepAliveActive) {
        this.requestWakeLock();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
      }
    });
  }

  /**
   * Update Native OS MediaSession Metadata & Lock Screen Handlers
   * Displays the track name, artist, and artwork on iOS Lock Screen / Dynamic Island, Android Notification, Windows & macOS Control Center.
   */
  public updateMediaSession(
    track: Track,
    handlers: {
      onPlay: () => void;
      onPause: () => void;
      onNext: () => void;
      onPrev: () => void;
      onSeek?: (time: number) => void;
    },
    playbackState: 'playing' | 'paused' | 'none' = 'playing',
    positionState?: { duration: number; playbackRate: number; position: number }
  ) {
    if (!('mediaSession' in navigator)) return;

    try {
      // 1. Set Track Metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: `${track.album} • Pyaar ka Mehfil Radio`,
        artwork: [
          {
            src: track.coverUrl,
            sizes: '512x512',
            type: 'image/jpeg',
          },
          {
            src: track.coverUrl,
            sizes: '256x256',
            type: 'image/jpeg',
          },
          {
            src: track.coverUrl,
            sizes: '128x128',
            type: 'image/jpeg',
          }
        ],
      });

      // 2. Set Playback State
      navigator.mediaSession.playbackState = playbackState;

      // 3. Set Action Handlers (Lock screen buttons, AirPods / headphone clicks)
      navigator.mediaSession.setActionHandler('play', () => {
        handlers.onPlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        handlers.onPause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlers.onPrev();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handlers.onNext();
      });

      if (handlers.onSeek) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && !isNaN(details.seekTime)) {
            handlers.onSeek!(details.seekTime);
          }
        });
      }

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset || 10;
        if (positionState && handlers.onSeek) {
          handlers.onSeek(Math.max(0, positionState.position - skip));
        }
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset || 10;
        if (positionState && handlers.onSeek) {
          handlers.onSeek(Math.min(positionState.duration, positionState.position + skip));
        }
      });

      // 4. Update Position State (for scrub bar on lockscreen)
      if (
        positionState &&
        'setPositionState' in navigator.mediaSession &&
        positionState.duration > 0 &&
        positionState.position >= 0 &&
        positionState.position <= positionState.duration
      ) {
        navigator.mediaSession.setPositionState({
          duration: positionState.duration,
          playbackRate: positionState.playbackRate || 1.0,
          position: Math.min(positionState.position, positionState.duration),
        });
      }
    } catch (err) {
      console.warn('Error updating MediaSession:', err);
    }
  }
}

export const backgroundAudioManager = new BackgroundAudioManager();
