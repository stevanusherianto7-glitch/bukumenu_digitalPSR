
import React from 'react';
import { UtensilsCrossed, CheckCircle2 } from 'lucide-react';

interface WelcomeModalProps {
  tableNumber: string;
  onDismiss: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ tableNumber, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-pawon-accent"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-pawon-bg rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-white">
            <UtensilsCrossed size={32} className="text-pawon-accent" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-pawon-dark mb-1">
            Selamat Datang!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            di Pawon Salam Resto & Catering
          </p>

          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 mb-6 flex items-center gap-3 w-full justify-center">
            <CheckCircle2 size={24} className="text-green-600 shrink-0" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-green-800 tracking-wider">Anda duduk di</p>
              <p className="text-xl font-bold text-green-700 leading-none">Meja {tableNumber}</p>
            </div>
          </div>

          <button 
            onClick={onDismiss}
            className="w-full bg-pawon-dark text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-black transition-all active:scale-[0.98]"
          >
            Mulai Pesan
          </button>
        </div>
      </div>
    </div>
  );
};
