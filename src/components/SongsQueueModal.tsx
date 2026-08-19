import React, { useState } from 'react';
import { X, Play, Pause, Music, Search, ExternalLink, Volume2, Sparkles } from 'lucide-react';
import { Track } from '../types';

interface SongsQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  onSelectTrack: (track: Track) => void;
}

export const SongsQueueModal: React.FC<SongsQueueModalProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Drawer */}
      <div 
        id="songs-queue-modal-drawer"
        className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl glass-panel p-5 sm:p-7 flex flex-col shadow-2xl z-10 border border-white/20 border-t-white/50 text-stone-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Saloon Radio Queue</h2>
              <p className="text-xs text-amber-200/80">Live continuous playback sequence</p>
            </div>
          </div>
          <button
            id="close-songs-queue-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="search-songs-queue-input"
            type="text"
            placeholder="Search Hindi cafe songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-900/60 border border-white/10 text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        {/* Songs List */}
        <div className="overflow-y-auto pr-1 space-y-1.5 flex-1">
          {filteredTracks.map((track, idx) => {
            const isCurrent = track.id === currentTrack.id;

            return (
              <div
                key={track.id}
                onClick={() => {
                  onSelectTrack(track);
                }}
                className={`p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-amber-500/20 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-900/40 hover:bg-stone-900/70 border border-white/5'
                }`}
              >
                {/* Left: Index / Waveform + Thumbnail + Meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Status / Index */}
                  <div className="w-6 text-center flex-shrink-0">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-center justify-center gap-0.5">
                        <span className="w-1 h-3.5 bg-amber-400 rounded-full animate-pulse"></span>
                        <span className="w-1 h-5 bg-amber-300 rounded-full animate-pulse delay-75"></span>
                        <span className="w-1 h-2.5 bg-amber-400 rounded-full animate-pulse delay-150"></span>
                      </div>
                    ) : (
                      <span className="font-mono-num text-xs text-stone-400 font-semibold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-amber-950/40 flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-amber-300" />
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-stone-100'}`}>
                        {track.title}
                      </h4>
                      {track.vibeTag && (
                        <span className="hidden xs:inline-block px-1.5 py-0.2 text-[9px] font-semibold text-amber-200/80 bg-amber-950/50 rounded border border-amber-500/20">
                          {track.vibeTag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-stone-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Right: Duration + Play button / External Link */}
                <div className="flex items-center gap-2.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className="font-mono-num text-xs text-stone-400">
                    {formatDuration(track.duration)}
                  </span>

                  <button
                    onClick={() => onSelectTrack(track)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCurrent && isPlaying
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'glass-button text-stone-300 hover:text-white'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  {track.youtubeUrl && (
                    <a
                      href={track.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-red-400 transition-colors p-1"
                      title="Listen on YouTube"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-400 font-mono-num">
          <span>{tracks.length} tracks in Mehfil rotation</span>
          <span className="text-amber-300">OPEN ALL HOURS</span>
        </div>
      </div>
    </div>
  );
};
