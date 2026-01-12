
import React, { useState } from 'react';
import { MapPin, Phone, ShoppingBag } from 'lucide-react';
import { Logo } from './Logo';

// --- Partner Logo Component ---
interface PartnerLinkProps {
  href: string;
  src: string;
  alt: string;
  fallbackText: string;
  imgClassName?: string;
}

const PartnerLink: React.FC<PartnerLinkProps> = ({ href, src, alt, fallbackText, imgClassName }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      aria-label={alt}
      title={alt}
      className="group inline-flex items-center justify-center w-16 h-11 bg-white rounded-lg shadow-lg opacity-90 hover:opacity-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pawon-accent focus:ring-offset-2 hover:-translate-y-1 p-2"
    >
      {!hasError ? (
        <img 
          src={src} 
          alt={alt} 
          className={`block w-full h-full object-contain transition-transform duration-200 ${imgClassName || ''}`}
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-[8px] font-bold text-pawon-dark px-1 whitespace-nowrap overflow-hidden text-ellipsis">{fallbackText}</span>
      )}
    </a>
  );
};

interface PromoCarouselProps {
  onSecretAdminTrigger?: () => void;
  tableNumber?: string;
  headerImage?: string;
  cartItemCount?: number;
  onCartClick?: () => void;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ onSecretAdminTrigger, tableNumber, headerImage, cartItemCount = 0, onCartClick }) => {
  const [tapCount, setTapCount] = useState(0);

  const bgImage = headerImage || "https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=800&q=80";

  const MERCHANT_LINKS = {
    gofood: "https://gofood.co.id/", 
    grabfood: "https://food.grab.com/", 
    shopeefood: "https://shopee.co.id/" 
  };

  const handleLogoClick = () => {
    if (!onSecretAdminTrigger) return;

    setTapCount(prev => prev + 1);
    setTimeout(() => {
      setTapCount(0);
    }, 2000);

    if (tapCount + 1 >= 5) {
      onSecretAdminTrigger();
      setTapCount(0);
    }
  };

  return (
    <div className="mb-6 -mx-6">
      <div className="relative h-[280px] w-full overflow-hidden shadow-xl rounded-b-[32px] md:mx-auto md:w-full">
        
        <img 
          src={bgImage} 
          alt="Pawon Salam Banner" 
          className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
          onError={(e) => {
             (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=800&q=80";
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-pawon-dark/95 via-pawon-dark/40 to-black/30"></div>

        {/* --- HEADER CONTENT --- */}
        <div className="absolute top-0 left-0 w-full p-6 z-30 flex justify-between items-start">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 opacity-100 transition-opacity active:scale-95 duration-200 outline-none group text-left"
          >
            <div className="flex-shrink-0 drop-shadow-md">
               {/* Logo diperkecil agar lebih compact */}
               <Logo size="md" variant="light" showText={false} />
            </div>
            <div className="flex flex-col items-start text-white drop-shadow-md">
              <h1 className="font-serif text-2xl font-bold leading-tight tracking-normal group-active:text-gray-200 transition-colors">
                Pawon Salam
              </h1>
              {/* Info Sub-header yang lebih Rapi */}
              <div className="flex items-center divide-x divide-white/30 mt-1.5 bg-black/20 px-2.5 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                  <span className="pr-2.5 text-[9px] font-medium tracking-wider uppercase text-white/80">Resto & Catering</span>
                  <div className="pl-2.5 flex items-center gap-1.5">
                      <Phone size={10} className="text-white/80" />
                      <span className="text-[9px] font-bold tracking-wider text-white">0822-1045-6729</span>
                  </div>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {tableNumber && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-in slide-in-from-right-2 fade-in">
                <MapPin size={12} className="text-red-400 fill-red-400" />
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] uppercase tracking-wider opacity-80 font-medium">Meja</span>
                  <span className="text-sm font-bold">{tableNumber}</span>
                </div>
              </div>
            )}
            <button onClick={onCartClick} className="p-2.5 bg-white/90 backdrop-blur-md text-pawon-dark rounded-full shadow-lg hover:shadow-md border border-white/50 transition-all relative active:scale-95">
              <ShoppingBag size={20} strokeWidth={2} />
              {cartItemCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-pawon-bg flex items-center justify-center">{cartItemCount > 9 ? '9+' : cartItemCount}</span>}
            </button>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end items-center pb-6 z-20 pointer-events-none">
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-2 fade-in duration-700 delay-100 pointer-events-auto mb-4">
            <span className="text-[9px] text-white/70 font-medium mb-2 tracking-wide">Kami juga ada di</span>
            <div className="flex items-center gap-3">
              <PartnerLink 
                href={MERCHANT_LINKS.gofood} 
                src="https://upload.wikimedia.org/wikipedia/commons/8/86/Gojek_logo_2019.svg" 
                alt="GoFood"
                fallbackText="GoFood"
              />
              <PartnerLink 
                href={MERCHANT_LINKS.grabfood} 
                src="https://assets.grab.com/wp-content/uploads/sites/4/2021/04/15151634/Grab_Logo_2021.jpg" 
                alt="GrabFood"
                fallbackText="GrabFood"
                imgClassName="mix-blend-multiply"
              />
              <PartnerLink 
                href={MERCHANT_LINKS.shopeefood} 
                src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg" 
                alt="ShopeeFood"
                fallbackText="Shopee"
              />
            </div>
          </div>
          <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-sm text-center pointer-events-auto">
            <div className="flex items-center gap-2 mb-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">Jam Operasional</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-0.5 text-[10px] font-medium leading-tight">
              <span className="whitespace-nowrap text-white/90">
                Senin-Jumat <span className="text-green-400 font-bold ml-0.5">10.00 - 21.00</span>
              </span>
              <span className="hidden sm:inline w-0.5 h-0.5 rounded-full bg-white/50"></span>
              <span className="whitespace-nowrap text-white/90">
                Sabtu-Minggu <span className="text-green-400 font-bold ml-0.5">08.00 - 21.00</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};