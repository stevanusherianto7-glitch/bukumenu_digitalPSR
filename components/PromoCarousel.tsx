
import React, { useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';

interface PromoCarouselProps {
  onSecretAdminTrigger?: () => void;
  tableNumber?: string;
  headerImage?: string;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ onSecretAdminTrigger, tableNumber, headerImage }) => {
  const [tapCount, setTapCount] = useState(0);

  // Foto Default: Soto Pindang Kudus (Hyperrealistic)
  const bgImage = headerImage || "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";

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
      <div className="relative aspect-[4/3] w-full overflow-hidden shadow-xl rounded-b-[32px] md:mx-auto md:w-full">
        
        <img 
          src={bgImage} 
          alt="Pawon Salam Banner" 
          className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
          onError={(e) => {
             (e.target as HTMLImageElement).src = "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-pawon-dark/95 via-pawon-dark/40 to-black/30"></div>

        {/* --- HEADER CONTENT (Updated: Added padding-top for safe area/notch) --- */}
        <div className="absolute top-0 left-0 w-full p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] z-30 flex justify-between items-start">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-4 opacity-100 transition-opacity active:scale-95 duration-200 outline-none group text-left"
          >
            <div className="flex-shrink-0 drop-shadow-md">
               <Logo size="lg" variant="light" showText={false} />
            </div>
            <div className="flex flex-col items-start text-white drop-shadow-md">
              {/* Teks "Pawon Salam" di atas */}
              <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight group-active:text-gray-200 transition-colors">
                Pawon Salam
              </h1>
              {/* Teks "Resto & Catering" di bawah */}
              <span className="text-xs font-medium tracking-wider uppercase text-white/80 mt-1">
                Resto & Catering
              </span>
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
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end items-center pb-6 z-20 pointer-events-none">
          {/* Info kontak dipindahkan ke sini */}
          <div className="flex items-center gap-1.5 mb-2.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 text-white shadow-sm pointer-events-auto">
              <Phone size={10} className="text-white/80" />
              <span className="text-[10px] font-bold tracking-wider text-white">0823-2033-6007</span>
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
