
import React, { useState } from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
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
      {/* Inject Custom CSS for Animations */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-150%); }
        }
        .animate-marquee-scrolling {
          animation: marquee 20s linear infinite; /* Diperlambat sedikit agar lebih mudah dibaca */
        }

        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.95; }
        }
        .animate-pulse-slow {
          animation: pulse-scale 2s infinite ease-in-out;
        }
      `}</style>

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

        {/* --- HEADER CONTENT --- */}
        <div className="absolute top-0 left-0 w-full p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] z-30 flex justify-between items-start">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 opacity-100 transition-opacity active:scale-95 duration-200 outline-none group text-left"
          >
            <div className="flex-shrink-0 drop-shadow-md">
               <Logo size="md" variant="light" showText={false} />
            </div>
            <div className="flex flex-col items-start text-white drop-shadow-md">
              {/* Teks "Pawon Salam" di atas */}
              <h1 className="font-serif text-xl font-bold leading-tight tracking-tight group-active:text-gray-200 transition-colors">
                Pawon Salam
              </h1>
              {/* Teks "Resto & Catering" di bawah */}
              <span className="text-[10px] font-medium tracking-wider uppercase text-white/80 mt-0.5">
                Resto & Catering
              </span>

              {/* Info Kontak (Phone) - Moved Here & Animated */}
              <div className="flex items-center gap-1.5 mt-2 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 text-white shadow-sm animate-pulse-slow origin-left">
                  <Phone size={10} className="text-white fill-white" />
                  <span className="text-[10px] font-bold tracking-wider text-white">0823-2033-6007</span>
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
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end items-center pb-6 z-20 pointer-events-none">
          
          {/* Running Text Jam Operasional (Marquee) */}
          <div className="w-[85%] max-w-sm pointer-events-auto">
             <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-full h-9 flex items-center overflow-hidden shadow-lg">
                
                {/* Fixed Label Badge */}
                <div className="bg-pawon-accent/90 h-full px-3 flex items-center gap-1.5 z-10 shrink-0 border-r border-white/10 shadow-md">
                   <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"/>
                   <span className="text-[9px] font-bold text-white uppercase tracking-wider">Buka</span>
                </div>

                {/* Scrolling Area */}
                <div className="flex-1 relative overflow-hidden h-full flex items-center mask-linear-fade">
                   <div className="whitespace-nowrap animate-marquee-scrolling text-[10px] text-white/90 font-medium flex items-center gap-4 pl-4">
                      <span>Senin - Jumat: <span className="text-green-300 font-bold">10.00 - 21.00</span></span>
                      <span className="text-white/40">•</span>
                      <span>Sabtu - Minggu: <span className="text-green-300 font-bold">08.00 - 21.00</span></span>
                      <span className="text-white/40">•</span>
                      <span>Selamat Menikmati Hidangan Kami!</span>
                      <span className="text-white/40">•</span>
                      <span className="italic font-serif text-orange-200">"Hangat dari Rumah"</span>
                   </div>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
