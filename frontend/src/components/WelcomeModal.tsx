
import React from 'react';
import { Sparkles, Utensils, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  tableNumber: string;
  onDismiss: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ tableNumber, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
      
      {/* Main Glass Modal */}
      <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-xl border border-white/40 rounded-[2rem] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 delay-100 slide-in-from-bottom-4">
        
        {/* Decorative Blobs */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-700"></div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Logo Section with Glow */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-rose-400 rounded-full blur-md opacity-60 animate-pulse"></div>
            <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white bg-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
               <img 
                 src="https://res.cloudinary.com/dwdaydzsh/image/upload/v1768382524/gemini-2.5-flash-image-preview_nano-banana__a_jadikan_ikon_ukuran__vj1ytb.png" 
                 alt="Pawon Salam Logo" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg animate-bounce">
              <Utensils size={16} strokeWidth={2.5} />
            </div>
          </div>

          {/* Greeting Typography */}
          <h2 className="font-serif text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Selamat Datang
          </h2>
          <p className="text-sm font-medium text-gray-500 mb-8 flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-orange-400" />
            Pawon Salam Resto & Catering
            <Sparkles size={14} className="text-orange-400" />
          </p>

          {/* Table Indicator - Ticket Style */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl px-6 py-4 mb-8 w-full shadow-inner overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">
              Posisi Meja Anda
            </p>
            <div className="flex items-center justify-center gap-2 text-pawon-dark">
              <span className="text-4xl font-black tracking-tighter">{tableNumber}</span>
            </div>
          </div>

          {/* Call to Action Button */}
          <button 
            onClick={onDismiss}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 shadow-[0_8px_20px_rgba(249,115,22,0.4)] transition-all hover:shadow-[0_8px_25px_rgba(225,29,72,0.5)] hover:-translate-y-1 active:translate-y-0 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <div className="relative flex items-center justify-center gap-2 text-lg tracking-wide">
              Mulai Memesan
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
