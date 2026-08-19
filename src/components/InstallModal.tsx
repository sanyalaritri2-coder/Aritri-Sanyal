import React, { useState } from 'react';
import { X, Download, Smartphone, Apple, Check, Share, MoreVertical, PlusSquare, Sparkles } from 'lucide-react';
import coffeeMusicIcon from '../assets/images/coffee_music_icon_1787072123077.jpg';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div 
        id="install-pwa-modal-drawer"
        className="relative w-full max-w-lg max-h-[85vh] rounded-3xl glass-panel p-5 sm:p-7 flex flex-col shadow-2xl z-10 border border-white/20 border-t-white/50 text-stone-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={coffeeMusicIcon} 
              alt="Pyaar Ka Mehfil coffee and music app icon"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-2xl object-cover shadow-md ring-2 ring-amber-400/40"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Install Pyaar ka Mehfil</h2>
              <p className="text-xs text-amber-200/80">Add to your phone Home Screen for 24/7 cafe radio</p>
            </div>
          </div>
          <button
            id="close-install-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-stone-950/50 border border-white/10 mb-4">
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              platform === 'ios'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad (iOS)</span>
          </button>
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              platform === 'android'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (Chrome)</span>
          </button>
        </div>

        {/* Step by step guide */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {platform === 'ios' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-white/10 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    Open in Safari & Tap <Share className="w-3.5 h-3.5 text-blue-400" /> Share
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Tap the <strong>Share</strong> button at the bottom navigation bar in Apple Safari.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/60 border border-white/10 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    Scroll down & tap <PlusSquare className="w-3.5 h-3.5 text-amber-400" /> Add to Home Screen
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Select <strong>Add to Home Screen</strong> from the sharing sheet options.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/60 border border-white/10 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Tap "Add" in Top-Right
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Launch directly from your home screen anytime without browser bars.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-white/10 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    Tap the <MoreVertical className="w-3.5 h-3.5 text-amber-400" /> 3 dots in Chrome
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Open Google Chrome menu in the top right corner of the browser.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/60 border border-white/10 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    Tap <Download className="w-3.5 h-3.5 text-emerald-400" /> Install app / Add to Home screen
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/60 border border-white/10 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-white">
                    Confirm Installation
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Enjoy fullscreen nostalgic ambient audio with zero distractions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Perks Box */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Screen-sleep background playback & native lock screen controls enabled</span>
        </div>
      </div>
    </div>
  );
};
