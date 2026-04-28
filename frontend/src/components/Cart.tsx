
import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { OrderItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: string;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, tableNumber }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, orderType, setOrderType } = useCartStore();
  const { addOrder } = useOrderStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmOrder = () => {
    if (totalItems === 0) return;

    // 1. Proses Data Pesanan
    if (tableNumber) {
        const orderItems: OrderItem[] = items.map(item => ({
            menuName: item.name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes ? `${orderType === 'take-away' ? '[TAKE AWAY] ' : ''}${item.notes}` : (orderType === 'take-away' ? '[TAKE AWAY]' : ''),
        }));
        addOrder(tableNumber, orderItems);
    } 
    
    // 2. Ubah UI Button menjadi Sukses (Hijau & Teks Berubah)
    setIsSuccess(true);

    // 3. Tunggu 2 detik agar user membaca pesan, lalu tutup & bersihkan
    setTimeout(() => {
        clearCart();
        onClose();
        // Reset state setelah modal tertutup agar siap untuk order berikutnya
        setTimeout(() => setIsSuccess(false), 300); 
    }, 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={() => !isSuccess && onClose()}
        className={`fixed inset-0 z-[70] bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Cart Panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-pawon-bg flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-pawon-dark">Keranjang Saya</h2>
            {tableNumber ? (
              <p className="text-xs font-bold text-pawon-accent bg-orange-50 px-2 py-0.5 rounded-full mt-1.5 inline-block border border-orange-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Pesanan untuk Meja: {tableNumber}
              </p>
            ) : (
               <p className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                Take Away / Bungkus
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            disabled={isSuccess}
            className="p-2 text-gray-400 hover:text-pawon-dark transition-colors rounded-full hover:bg-gray-100 disabled:opacity-50"
            title="Tutup Keranjang"
            aria-label="Tutup Keranjang"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="flex-none p-4 pb-2">
            <div className="bg-gray-100/80 p-1 rounded-xl flex gap-1 border border-gray-200">
                <button 
                    onClick={() => setOrderType('dine-in')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orderType === 'dine-in' ? 'bg-white text-pawon-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${orderType === 'dine-in' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    Dine In
                </button>
                <button 
                    onClick={() => setOrderType('take-away')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${orderType === 'take-away' ? 'bg-white text-pawon-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${orderType === 'take-away' ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    Take Away
                </button>
            </div>
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
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        disabled={isSuccess}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-pawon-dark active:bg-gray-200 disabled:opacity-50"
                        title="Kurangi Jumlah"
                        aria-label="Kurangi Jumlah"
                      >-</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        disabled={isSuccess}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-pawon-dark active:bg-gray-200 disabled:opacity-50"
                        title="Tambah Jumlah"
                        aria-label="Tambah Jumlah"
                      >+</button>
                    </div>
                    {/* Remove Button */}
                    <button 
                        onClick={() => removeItem(item.id)} 
                        disabled={isSuccess}
                        className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-50"
                        title="Hapus Item"
                        aria-label="Hapus Item"
                    >
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
              onClick={handleConfirmOrder}
              disabled={isSuccess}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 active:scale-[0.98]
                ${isSuccess 
                    ? 'bg-green-600 text-white shadow-green-600/30 scale-100 cursor-default' 
                    : 'bg-pawon-accent text-white shadow-pawon-accent/30 hover:bg-orange-700'
                }`}
            >
              {isSuccess ? (
                  <>
                    <CheckCircle size={20} className="animate-bounce" />
                    <span>Terima Kasih atas Pesanan Anda</span>
                  </>
              ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Kirim Pesanan</span>
                  </>
              )}
            </button>
          </div>
        )}

      </div>
    </>
  );
};
