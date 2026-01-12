
import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, onConfirmOrder }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-[70] bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Cart Panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-pawon-bg flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-serif text-xl font-bold text-pawon-dark">Keranjang Saya</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-pawon-dark transition-colors rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        {items.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.map(item => (
              <div key={`${item.id}-${item.notes}`} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1 flex flex-col">
                  <p className="font-bold text-sm text-pawon-dark line-clamp-1">{item.name}</p>
                  {item.notes && <p className="text-[10px] text-gray-500 italic mt-0.5 line-clamp-1">"{item.notes}"</p>}
                  <p className="font-bold text-pawon-accent text-xs mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                  
                  <div className="mt-auto flex justify-between items-center pt-2">
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-gray-100 rounded-full px-1 py-0.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-pawon-dark active:bg-gray-200">-</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full flex items-center justify-center text-pawon-dark active:bg-gray-200">+</button>
                    </div>
                    {/* Remove Button */}
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-5">
            <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-50"/>
            <p className="font-bold text-pawon-dark">Keranjang Anda kosong</p>
            <p className="text-sm mt-1">Silakan pilih menu yang Anda inginkan.</p>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-none p-5 border-t border-gray-200 bg-white/50 backdrop-blur-sm shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-pawon-textGray">Total ({totalItems} item)</span>
              <span className="font-bold text-lg text-pawon-dark">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <button
              onClick={onConfirmOrder}
              className="w-full bg-pawon-accent text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-pawon-accent/30 hover:bg-orange-700 transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={18} />
              Kirim Pesanan
            </button>
          </div>
        )}

      </div>
    </>
  );
};
