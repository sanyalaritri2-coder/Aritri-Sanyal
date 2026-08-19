import React, { useState, useEffect } from 'react';
import { Radio, Music2, ListMusic, Download, ExternalLink, Laptop, Smartphone, QrCode } from 'lucide-react';
import { ActiveModal, DeviceView } from '../types';
import coffeeMusicIcon from '../assets/images/coffee_music_icon_1787072123077.jpg';

interface HeaderProps {
  onOpenModal: (modal: ActiveModal) => void;
  activeModal: ActiveModal;
  deviceView: DeviceView;
  onToggleDeviceView: (mode: DeviceView) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenModal, 
  activeModal,
  deviceView,
  onToggleDeviceView
}) => {
  // Live 12-hour clock (e.g., "6:11 PM") in Roboto Mono
  const [timeString, setTimeString] = useState<string>('');
  
  // Listener count dynamically fluctuating between 400-900
  const [listenerCount, setListenerCount] = useState<number>(643);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      setTimeString(`${hours}:${minStr} ${ampm}`);
    };

    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    // Dynamic listener count fluctuation with natural realistic drifting
    const listenerInterval = setInterval(() => {
      setListenerCount((prev) => {
        const delta = Math.floor(Math.random() * 19) - 9; // -9 to +9
        const next = prev + delta;
        if (next < 420) return 430 + Math.floor(Math.random() * 30);
        if (next > 890) return 860 - Math.floor(Math.random() * 30);
        return next;
      });
    }, 4500);

    return () => clearInterval(listenerInterval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-2 sm:px-6 py-2 sm:py-3.5 flex items-center justify-between pointer-events-none">
      {/* Top-Left: App Icon Badge + Live 12-hour clock */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
        <div 
          id="app-brand-badge"
          className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full glass-pill text-stone-100 shadow-lg border border-amber-500/30"
        >
          <img 
            src={coffeeMusicIcon} 
            alt="Pyaar Ka Mehfil coffee and music logo"
            referrerPolicy="no-referrer"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shadow-sm ring-1 ring-amber-400/50"
          />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-amber-200 hidden xs:inline">
            Pyaar ka Mehfil
          </span>
        </div>

        <div 
          id="live-clock-badge"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full glass-pill text-stone-100 shadow-lg"
        >
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400/80 animate-pulse"></span>
          <span className="font-mono-num text-xs sm:text-sm font-semibold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {timeString || '6:11 PM'}
          </span>
        </div>
      </div>

      {/* Top-Center: On-Screen Device View Shift Switcher [ 💻 Laptop | 📱 Mobile ] */}
      <div 
        id="device-mode-switcher-pill"
        className="pointer-events-auto flex items-center p-1 rounded-full glass-pill border border-amber-400/50 shadow-xl bg-stone-950/70"
      >
        <button
          id="switch-to-laptop-view-btn"
          onClick={() => onToggleDeviceView('laptop')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
            deviceView === 'laptop'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white'
          }`}
          title="Switch to Full Laptop / Desktop View"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Laptop</span>
        </button>

        <button
          id="switch-to-mobile-view-btn"
          onClick={() => onToggleDeviceView('mobile')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
            deviceView === 'mobile'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white'
          }`}
          title="Switch to Mobile Phone View"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile</span>
        </button>

        {/* Quick QR Code Scan Button */}
        <button
          id="open-qr-code-modal-btn"
          onClick={() => onOpenModal('qrcode')}
          className="ml-0.5 p-1 rounded-full hover:bg-white/15 text-amber-300 hover:text-amber-200 transition-colors"
          title="Scan QR Code to open on your phone"
        >
          <QrCode className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top-Right: 5 pill glass buttons */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 max-w-[50vw] sm:max-w-none overflow-x-auto no-scrollbar py-1">
        {/* 1. Spotify Button */}
        <a
          id="nav-btn-spotify"
          href="https://open.spotify.com/search/pyaar%20ka%20mehfil%20hindi%20acoustic"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full glass-button text-[11px] sm:text-xs font-semibold text-stone-100 whitespace-nowrap group hover:text-emerald-400"
          title="Open in Spotify"
        >
          <svg className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform fill-current flex-shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 0 1-.858.207c-2.352-1.438-5.312-1.763-8.8-0.966a.625.625 0 1 1-.278-1.22c3.818-.872 7.098-.497 9.728 1.121a.623.623 0 0 1 .208.858zm1.224-2.723a.78.78 0 0 1-1.074.258c-2.693-1.656-6.797-2.133-9.982-1.166a.781.781 0 0 1-.469-1.492c3.642-1.106 8.18-.574 11.267 1.326a.78.78 0 0 1 .258 1.074zm.105-2.835C14.69 8.93 9.387 8.755 6.305 9.69a.937.937 0 1 1-.548-1.792c3.565-1.082 9.43-.878 13.197 1.357a.938.938 0 1 1-.98 1.597z"/>
          </svg>
          <span className="hidden md:inline">Spotify</span>
        </a>

        {/* 2. YT Music Button */}
        <a
          id="nav-btn-ytmusic"
          href="https://youtube.com/playlist?list=PLYma9X_12d-c&si=qYHhWF7fMh07O1Yo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full glass-button text-[11px] sm:text-xs font-semibold text-stone-100 whitespace-nowrap group hover:text-red-400"
          title="Open in YouTube Playlist"
        >
          <svg className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform fill-current flex-shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
          </svg>
          <span className="hidden md:inline">YT Music</span>
        </a>

        {/* 3. Playlists Drawer Button */}
        <button
          id="nav-btn-playlists"
          onClick={() => onOpenModal(activeModal === 'playlists' ? 'none' : 'playlists')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full glass-button text-[11px] sm:text-xs font-semibold whitespace-nowrap ${
            activeModal === 'playlists' ? 'bg-amber-600/60 border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'text-stone-100'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="hidden sm:inline">Playlists</span>
        </button>

        {/* 4. Songs Queue Drawer Button */}
        <button
          id="nav-btn-songs"
          onClick={() => onOpenModal(activeModal === 'songs' ? 'none' : 'songs')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full glass-button text-[11px] sm:text-xs font-semibold whitespace-nowrap ${
            activeModal === 'songs' ? 'bg-amber-600/60 border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'text-stone-100'
          }`}
        >
          <Music2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="hidden sm:inline">Songs</span>
        </button>

        {/* 5. Install PWA Button */}
        <button
          id="nav-btn-install"
          onClick={() => onOpenModal(activeModal === 'install' ? 'none' : 'install')}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full glass-button text-[11px] sm:text-xs font-semibold whitespace-nowrap ${
            activeModal === 'install' ? 'bg-amber-600/60 border-amber-300 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'text-stone-100'
          }`}
          title="Install as Phone / Desktop App"
        >
          <Download className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <span>Install</span>
        </button>

        {/* 6. Open in Full Tab for Lock Screen Playback */}
        <a
          id="nav-btn-open-tab"
          href={typeof window !== 'undefined' ? window.location.href : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full glass-button text-[11px] sm:text-xs font-semibold whitespace-nowrap text-amber-300 hover:text-amber-200 border-amber-400/40"
          title="Open in new tab for native lock screen controls and background sleep playback"
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden lg:inline">Open Tab</span>
        </a>
      </div>
    </header>
  );
};

