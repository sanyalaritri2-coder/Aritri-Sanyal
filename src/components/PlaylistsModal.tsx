import React from 'react';
import { X, Play, ExternalLink, Disc, Sparkles, Heart } from 'lucide-react';
import { Playlist, Track } from '../types';

interface PlaylistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  onSelectPlaylistTrack: (track: Track) => void;
  currentTrackId: string;
}

export const PlaylistsModal: React.FC<PlaylistsModalProps> = ({
  isOpen,
  onClose,
  playlists,
  onSelectPlaylistTrack,
  currentTrackId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div 
        id="playlists-modal-drawer"
        className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl glass-panel p-5 sm:p-7 flex flex-col shadow-2xl z-10 border border-white/20 border-t-white/50 text-stone-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Disc className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Vintage Cafe Playlists</h2>
              <p className="text-xs text-amber-200/80">Hand-curated cassettes & nostalgic acoustic tapes</p>
            </div>
          </div>
          <button
            id="close-playlists-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist List */}
        <div className="overflow-y-auto pr-1 space-y-3.5 flex-1">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id}
              className="p-4 rounded-2xl bg-stone-900/50 hover:bg-stone-900/80 border border-white/10 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border border-amber-500/20 shadow-md">
                    <img 
                      src={playlist.coverImage} 
                      alt={playlist.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-xs text-stone-300/80 mt-0.5 line-clamp-2 leading-relaxed">
                      {playlist.tagline}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-amber-200/70 font-mono-num">
                      <span>{playlist.trackCount} Tracks</span>
                      <span>•</span>
                      <span>Mehfil Radio Collection</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {playlist.tracks && playlist.tracks.length > 0 && (
                    <button
                      onClick={() => {
                        onSelectPlaylistTrack(playlist.tracks[0]);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-stone-950" />
                      <span>Play</span>
                    </button>
                  )}

                  {playlist.externalUrl && (
                    <a
                      href={playlist.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full glass-button text-stone-300 hover:text-white"
                      title="Open in YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1 text-amber-200/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Updated weekly with new nostalgic acoustic drops
          </span>
          <span className="font-mono-num text-[11px]">PYAAR KA MEHFIL</span>
        </div>
      </div>
    </div>
  );
};
