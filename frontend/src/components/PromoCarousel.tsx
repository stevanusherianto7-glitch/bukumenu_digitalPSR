
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Logo } from './Logo';
import { MenuItem } from '../types';

interface PromoCarouselProps {
  onSecretAdminTrigger?: () => void;
  tableNumber?: string;
  headerImage?: string;
  menuItems?: MenuItem[];
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ onSecretAdminTrigger, tableNumber, headerImage, menuItems = [] }) => {
  const [tapCount, setTapCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Derive up to 28 images from menu items that have images
  const CAROUSEL_IMAGES = React.useMemo(() => {
    const imagesFromMenu = menuItems
      .filter(item => item.imageUrl && !item.imageUrl.includes('placehold.co'))
      .map(item => ({ url: item.imageUrl, alt: item.name }));
    
    const combined = [
      headerImage ? { url: headerImage, alt: 'Banner Utama' } : null,
      ...imagesFromMenu
    ].filter(Boolean) as { url: string; alt: string }[];
    
    return combined.slice(0, 28); // Limit to 28 as requested
  }, [headerImage, menuItems]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [CAROUSEL_IMAGES.length]);

  const [isTapping, setIsTapping] = useState(false);

  const handleAction = (e: React.MouseEvent | React.TouchEvent) => {
    // Zero Error Tolerance: Check if onSecretAdminTrigger exists
    if (!onSecretAdminTrigger) return;

    // Visual feedback
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 150);

    // Reset timer
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        onSecretAdminTrigger();
        return 0;
      }
      return newCount;
    });

    // Step 3.3: 5-tap secret with strict 500ms threshold
    timerRef.current = setTimeout(() => {
      setTapCount(0);
    }, 500); 
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Pawon Salam Resto',
      text: 'Lihat menu digital Pawon Salam Resto & Catering!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link menu berhasil disalin!');
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  // Step 3.2: Header & Logo Rules
  // If tableNumber exists (Guest Mode) and it's not a secret trigger from Admin view, hide it.
  // Note: We check if onSecretAdminTrigger is passed to determine if it should be interactive.
  const isLogoVisible = onSecretAdminTrigger !== undefined;

  return (
    <div className="mb-6 -mx-6">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-scrolling {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      <div className="relative aspect-[4/3] w-full overflow-hidden shadow-xl rounded-b-[32px] md:mx-auto md:w-full group">
        
        <div className="absolute inset-0 transition-transform duration-700 ease-in-out">
          {CAROUSEL_IMAGES.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={item.url}
                alt={item.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                   (e.target as HTMLImageElement).src = "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-pawon-dark/95 via-pawon-dark/20 to-black/30"></div>

        {/* --- HEADER CONTENT --- */}
        <div className="absolute top-0 left-0 w-full p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] z-40 flex justify-between items-start">
          <div className="flex flex-col items-start text-white drop-shadow-md">
            <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight">
              Pawon Salam
            </h1>
            <span className="text-[10px] font-medium tracking-wider uppercase text-white/90 mt-0.5">
              Resto & Catering
            </span>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-lg active:scale-95"
                  title="Bagikan Menu"
                  aria-label="Bagikan Menu"
                >
                  <Share2 size={16} />
                </button>

                {isLogoVisible && (
                  <button
                    onClick={handleAction}
                    onTouchStart={handleAction}
                    className={`flex-shrink-0 drop-shadow-xl transition-all bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-md z-50 touch-manipulation ${isTapping && tapCount >= 3 ? 'scale-110 bg-white/30' : 'scale-100'} ${tableNumber ? 'cursor-default' : 'cursor-pointer'}`}
                    aria-label="Admin Access Logo"
                  >
                     <Logo size="sm" variant="light" showText={false} />
                  </button>
                )}

            </div>

            {tableNumber && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <MapPin size={12} className="text-red-400 fill-red-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] uppercase tracking-wider opacity-80 font-medium">Meja</span>
                  <span className="text-sm font-bold">{tableNumber}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end items-center pb-4 z-40 pointer-events-none">
          <div className="w-[85%] max-w-sm pointer-events-auto">
             <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-full h-9 flex items-center overflow-hidden shadow-2xl">
                
                <div className="bg-pawon-accent h-full px-3 flex items-center gap-1.5 z-10 shrink-0 border-r border-white/10 shadow-md">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"/>
                   <span className="text-[9px] font-bold text-white uppercase tracking-wider">Buka</span>
                </div>

                <div className="flex-1 relative overflow-hidden h-full flex items-center">
                   {/* Marquee Content Duplicated for seamless loop with no gap */}
                   <div className="whitespace-nowrap animate-marquee-scrolling text-[10px] text-white font-medium flex items-center gap-4 pl-4">
                      <span>Senin - Jumat: <span className="text-green-300 font-bold">10.00 - 21.00</span></span>
                      <span className="text-white/40">•</span>
                      <span>Sabtu - Minggu: <span className="text-green-300 font-bold">08.00 - 21.00</span></span>
                      <span className="text-white/40">•</span>
                      <div className="flex items-center gap-1 text-orange-200">
                         <Phone size={10} className="fill-orange-200" />
                         <span className="font-bold">0823-2033-6007</span>
                      </div>
                      <span className="text-white/40">•</span>
                      <span>Senin - Jumat: <span className="text-green-300 font-bold">10.00 - 21.00</span></span>
                      <span className="text-white/40">•</span>
                      <span>Sabtu - Minggu: <span className="text-green-300 font-bold">08.00 - 21.00</span></span>
                      <span className="text-white/40">•</span>
                      <div className="flex items-center gap-1 text-orange-200">
                         <Phone size={10} className="fill-orange-200" />
                         <span className="font-bold">0823-2033-6007</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
