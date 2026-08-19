import React, { useState } from 'react';
import { X, QrCode, Smartphone, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  
  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : 'https://ais-pre-5b2v66zz755vzsmf4z6gxw-863635746031.asia-east1.run.app';

  // High quality QR Code image generation URL
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&color=28-15-10&bgcolor=254-243-199&data=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div 
        id="qrcode-mobile-modal"
        className="relative w-full max-w-md rounded-3xl glass-panel p-5 sm:p-7 flex flex-col items-center shadow-2xl z-10 border border-white/20 border-t-white/50 text-stone-100 overflow-hidden"
      >
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Open on Mobile</h2>
              <p className="text-xs text-amber-200/80">Scan with your phone camera</p>
            </div>
          </div>
          <button
            id="close-qrcode-modal-btn"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Frame */}
        <div className="p-3.5 bg-amber-100/95 rounded-2xl shadow-xl border-2 border-amber-300/60 mb-4 flex flex-col items-center">
          <img 
            src={qrCodeImageUrl} 
            alt="Scan QR code to open Pyaar Ka Mehfil on mobile"
            referrerPolicy="no-referrer"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
          />
          <span className="text-[11px] font-bold text-stone-900 mt-2 font-mono-num">
            Scan to listen on your phone 📱
          </span>
        </div>

        {/* Copy Link Input Bar */}
        <div className="w-full flex items-center gap-2 bg-stone-950/60 p-2 rounded-2xl border border-white/10 mb-3">
          <input 
            type="text" 
            readOnly 
            value={currentUrl}
            className="w-full bg-transparent text-xs text-stone-300 px-2 font-mono-num truncate focus:outline-none"
          />
          <button
            id="copy-mobile-link-btn"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold whitespace-nowrap transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-stone-950 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-center text-stone-400">
          Tip: Open in Safari (iOS) or Chrome (Android) and tap <strong className="text-amber-300">"Add to Home Screen"</strong> for full-screen cafe radio.
        </p>
      </div>
    </div>
  );
};
