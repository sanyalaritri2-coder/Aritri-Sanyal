import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
} from 'lucide-react';
import { Track } from '../types';

interface MusicPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
  duration: number;
  volume: number;
  onVolumeChange: (newVol: number) => void;
  isHissActive: boolean;
  onToggleHiss: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  isHissActive,
  onToggleHiss
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.8);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragValue, setDragValue] = useState<number>(0);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVolumeIconClick = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVolume > 0 ? prevVolume : 0.7);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setDragValue(val);
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekEnd = () => {
    setIsDragging(false);
    onSeek(dragValue);
  };

  const displayTime = isDragging ? dragValue : currentTime;
  const seekProgressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-2">
      {/* Compact Stadium Pill Container */}
      <div 
        id="floating-music-player-pill"
        className="w-full rounded-full bg-stone-950/60 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shadow-2xl transition-all border border-white/20 border-t-white/40"
      >
        {/* Left: Compact Vinyl + Track Info + Inline Seekbar */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto min-w-0 flex-1">
          {/* Miniature spinning vinyl album art */}
          <div className="relative flex-shrink-0">
            <div 
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-stone-800 shadow-[0_0_10px_rgba(0,0,0,0.8)] relative flex items-center justify-center ${
                isPlaying ? 'animate-spin-slow' : 'paused'
              }`}
              style={{
                background: 'radial-gradient(circle, #292524 25%, #1c1917 50%, #0c0a09 100%)'
              }}
            >
              <img 
                src={currentTrack.coverUrl} 
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm"
              />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-200 border border-stone-900"></div>
            </div>
            
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </div>

          {/* Track metadata + inline seekbar */}
          <div className="flex-1 min-w-0 pr-1 sm:pr-2">
            {/* Top row: Song title on left, timestamp on right */}
            <div className="flex items-center justify-between gap-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                {currentTrack.title}
              </h4>
              
              {/* Live timestamp */}
              <div className="font-mono-num text-[10px] sm:text-[11px] text-amber-200/90 font-semibold flex-shrink-0">
                <span>{formatTime(displayTime)}</span>
                <span className="text-stone-400 mx-0.5">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Second row: Artist names directly under the song title */}
            <p className="text-[10px] sm:text-[11px] text-amber-300/90 font-medium truncate mb-1">
              {currentTrack.artist}
            </p>

            {/* Inline Seekbar */}
            <div className="flex items-center">
              <input
                id="music-seekbar"
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={displayTime}
                onChange={handleSeekChange}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                aria-label="Track playback progress"
                className="w-full h-1 bg-stone-900/80 rounded-lg appearance-none cursor-pointer focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #fbbf24 ${seekProgressPercent}%, rgba(255,255,255,0.18) ${seekProgressPercent}%, rgba(255,255,255,0.18) 100%)`
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Controls + Volume + Hiss */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-shrink-0">
          {/* Controls: Prev, Play, Next */}
          <div className="flex items-center gap-1">
            <button
              id="player-prev-track-btn"
              onClick={onPrevTrack}
              aria-label="Previous track"
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <SkipBack className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              id="player-toggle-play-btn"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 hover:bg-white text-stone-950 flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-stone-950 text-stone-950" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-stone-950 text-stone-950 ml-0.5" />
              )}
            </button>

            <button
              id="player-next-track-btn"
              onClick={onNextTrack}
              aria-label="Next track"
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <SkipForward className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 bg-stone-900/60 px-2 py-0.5 rounded-full border border-white/10">
            <button
              id="player-volume-toggle-btn"
              onClick={handleVolumeIconClick}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="text-stone-300 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3 h-3 text-rose-400" />
              ) : (
                <Volume2 className="w-3 h-3 text-amber-300" />
              )}
            </button>
            <input
              id="player-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                if (isMuted) setIsMuted(false);
                onVolumeChange(parseFloat(e.target.value));
              }}
              aria-label="Volume slider"
              className="w-12 sm:w-16 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                  (isMuted ? 0 : volume) * 100
                }%, rgba(255,255,255,0.2) ${
                  (isMuted ? 0 : volume) * 100
                }%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Hiss Toggle */}
          <button
            id="player-hiss-toggle-btn"
            onClick={onToggleHiss}
            aria-label="Toggle vintage vinyl hiss"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
              isHissActive 
                ? 'bg-amber-500 text-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-amber-300'
                : 'glass-button text-amber-200/90 hover:text-white'
            }`}
          >
            <span>📻</span>
            <span>Hiss</span>
          </button>
        </div>
      </div>

      {/* Subtle Centered Contact Text below player */}
      <div className="mt-1.5 text-center">
        <p className="text-[10px] text-stone-300/80 font-mono-num tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          contact: <a href="mailto:aritrisanyal@gmail.com" className="text-amber-300 hover:text-amber-200 underline underline-offset-1">aritrisanyal@gmail.com</a>
        </p>
      </div>
    </div>
  );
};
