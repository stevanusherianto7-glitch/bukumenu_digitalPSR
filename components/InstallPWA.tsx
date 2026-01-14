
import React, { useEffect, useState } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Android / Desktop Chrome 'Add to Home Screen' event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Tunggu sebentar sebelum menampilkan tombol agar tidak mengganggu loading awal
      setTimeout(() => setShowInstallBtn(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // Tampilkan hint iOS jika belum diinstal, belum didismiss, dan memang di iOS
    if (isIOS && !isStandalone && !isDismissed) {
         // Tampilkan instruksi iOS setelah 5 detik
         const timer = setTimeout(() => setShowIOSHint(true), 5000);
         return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  const dismiss = () => {
      setIsDismissed(true);
      setShowInstallBtn(false);
      setShowIOSHint(false);
  }

  if (isDismissed) return null;

  // --- Render Android/Chrome Install Button (Floating Bottom) ---
  if (showInstallBtn) {
     return (
        <div className="fixed bottom-24 left-4 right-4 z-[90] animate-in slide-in-from-bottom-4 fade-in duration-700">
           <div className="bg-pawon-dark/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-white/10">
              <div className="flex flex-col">
                 <span className="font-bold text-sm">Install Aplikasi</span>
                 <span className="text-[10px] text-white/70">Akses lebih cepat & hemat kuota</span>
              </div>
              <div className="flex items-center gap-3">
                 <button onClick={dismiss} className="p-2 text-white/50 hover:text-white transition-colors">
                    <X size={18} />
                 </button>
                 <button 
                   onClick={handleInstallClick}
                   className="bg-pawon-accent px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
                 >
                   Install
                 </button>
              </div>
           </div>
        </div>
     );
  }

  // --- Render iOS Hint (Bottom Sheet) ---
  if (showIOSHint) {
      return (
        <>
            <div className="fixed inset-0 bg-black/40 z-[99] animate-in fade-in" onClick={dismiss} />
            <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-[32px] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-full duration-500">
                <button onClick={dismiss} className="absolute top-4 right-4 text-gray-400 p-2 bg-gray-50 rounded-full">
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border border-gray-100 mb-4">
                        <img src="https://cdn-icons-png.flaticon.com/512/1046/1046751.png" alt="Icon" className="w-10 h-10" />
                    </div>
                    
                    <h3 className="font-serif font-bold text-pawon-dark text-xl mb-2">Install Pawon Salam</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs">
                        Tambahkan ke layar utama untuk pengalaman aplikasi native yang lebih baik.
                    </p>

                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-4 text-left p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <Share size={20} className="text-blue-500 shrink-0" />
                            <div className="text-sm text-gray-600">
                                1. Ketuk tombol <span className="font-bold text-gray-900">Share</span> di bawah browser
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-left p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <PlusSquare size={20} className="text-gray-900 shrink-0" />
                            <div className="text-sm text-gray-600">
                                2. Pilih <span className="font-bold text-gray-900">Add to Home Screen</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Panah penunjuk ke tombol share (Visual cue) */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 transform translate-y-1/2"></div>
            </div>
        </>
      );
  }

  return null;
};
