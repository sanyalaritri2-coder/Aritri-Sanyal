import React from 'react';
import { Play, Sparkles } from 'lucide-react';

interface AutoplayBannerProps {
  onStartAudio: () => void;
  isVisible: boolean;
}

export const AutoplayBanner: React.FC<AutoplayBannerProps> = ({ onStartAudio, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-bounce">
      <button
        id="autoplay-unblock-banner"
        onClick={onStartAudio}
        className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-panel border border-amber-400/60 text-amber-200 hover:text-white bg-amber-950/60 shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm font-bold"
      >
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span>Tap to play music 📻</span>
        <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center ml-1">
          <Play className="w-3 h-3 fill-current ml-0.5" />
        </div>
      </button>
    </div>
  );
};
