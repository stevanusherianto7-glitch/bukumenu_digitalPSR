
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Share2, Minus, Plus, ShoppingBag, Clock, Flame, Star, Heart } from 'lucide-react';
import { MenuItem } from '../types';

interface ProductDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart?: (item: MenuItem, qty: number, notes: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddToCartClick = () => {
    if (onAddToCart) {
        onAddToCart(item, quantity, notes);
    } else {
        alert('Fitur pemesanan belum tersedia.');
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. New Navigation Header (Transparent to Content) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-pawon-dark shadow-lg hover:bg-white transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-pawon-dark shadow-lg hover:text-red-500 transition-colors active:scale-90">
              <Heart size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-pawon-dark shadow-lg hover:text-blue-500 transition-colors active:scale-90">
              <Share2 size={20} />
            </button>
        </div>
      </div>

      {/* 2. Full Image Header */}
      <div className="relative h-[45vh] w-full bg-gray-100">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay for text readability if needed */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
      </div>

      {/* 3. Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white -mt-8 rounded-t-[32px] relative z-10 px-6 pt-8 pb-32 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        
        {/* Title & Price Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="w-3/4">
             {item.isFavorite && (
              <span className="inline-block bg-pawon-green/10 text-pawon-green text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                Paling Laris
              </span>
            )}
            <h2 className="font-serif text-2xl font-bold text-pawon-dark leading-tight">
              {item.name}
            </h2>
          </div>
          <div className="flex flex-col items-end">
             <span className="font-bold text-xl text-pawon-accent whitespace-nowrap">
              Rp {item.price.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Quick Stats Row (Delight Factor) */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {item.rating && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-100 shrink-0">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-pawon-dark">{item.rating}</span>
              <span className="text-[10px] text-gray-400">(50+)</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 shrink-0">
            <Clock size={14} className="text-blue-500" />
            <span className="text-xs font-bold text-pawon-dark">{item.prepTime || 15} mnt</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 shrink-0">
            <Flame size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-pawon-dark">{item.calories || 350} kkal</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          <section>
            <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider mb-2">Deskripsi Menu</h3>
            <p className="text-pawon-textGray leading-relaxed text-sm">
              {item.description}
            </p>
          </section>

          <section>
            <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider mb-3">Catatan Khusus (Opsional)</h3>
            <div className="relative">
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Jangan pedas, saus dipisah, tanpa bawang..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-pawon-accent resize-none h-24 transition-all"
              ></textarea>
            </div>
          </section>
        </div>
      </div>

      {/* 4. Fixed Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
        <div className="flex items-center gap-4 max-w-[480px] mx-auto">
          
          {/* Quantity Stepper */}
          <div className="flex items-center bg-gray-100 rounded-full px-1 py-1">
            <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-white text-pawon-dark flex items-center justify-center shadow-sm active:scale-95 transition-transform disabled:opacity-50 hover:bg-gray-50"
            >
              <Minus size={18} />
            </button>
            <span className="w-10 text-center font-bold text-lg text-pawon-dark">{quantity}</span>
            <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-pawon-dark text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform hover:bg-black"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCartClick}
            className="flex-1 bg-pawon-accent text-white h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-pawon-accent/30 active:scale-[0.98] transition-all hover:bg-orange-700"
          >
            <ShoppingBag size={18} />
            Tambah ke Keranjang - Rp {(item.price * quantity).toLocaleString('id-ID')}
          </button>

        </div>
      </div>

    </div>
  );
};
