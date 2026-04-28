
import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, ShoppingBag, CheckCircle, Zap, Gift, Plus, Box, Cake, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useSettingsStore } from '../store/settingsStore';
import { OrderItem, Addon, MenuItem } from '../types';
import { MENU_ITEMS } from '../data';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: string;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, tableNumber }) => {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, orderType, setOrderType } = useCartStore();
  const { addOrder } = useOrderStore();
  const marketing = useSettingsStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressBarRef.current && marketing.isProgressBarEnabled) {
      const progress = Math.min((totalPrice / marketing.progressBarTarget) * 100, 100);
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, [totalPrice, marketing.isProgressBarEnabled, marketing.progressBarTarget]);

  const handleConfirmOrder = () => {
    if (totalItems === 0) return;

    // 1. Proses Data Pesanan
    if (tableNumber) {
        const orderItems: OrderItem[] = items.map(item => {
            const addonNames = item.selectedAddons?.map(a => a.name).join(', ');
            const fullNotes = [
              orderType === 'take-away' ? '[TAKE AWAY]' : '',
              addonNames ? `[ADDONS: ${addonNames}]` : '',
              item.notes
            ].filter(Boolean).join(' ');

            return {
                menuName: item.name,
                quantity: item.quantity,
                price: item.price + (item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0),
                notes: fullNotes,
            };
        });
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

        {/* Progress Bar Reward (Take Away Only) */}
        {marketing.isProgressBarEnabled && orderType === 'take-away' && items.length > 0 && (
          <div className="flex-none px-5 pt-2">
            <div className="bg-gradient-to-r from-pawon-accent/10 to-orange-50 p-3 rounded-2xl border border-orange-100/50">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 rounded-lg bg-pawon-accent text-white">
                      <Gift size={12} />
                   </div>
                   <span className="text-[10px] font-bold text-pawon-dark uppercase tracking-wider">Mengejar Bonus</span>
                </div>
                <span className="text-[10px] font-bold text-pawon-accent">
                   {totalPrice >= marketing.progressBarTarget 
                    ? 'Target Tercapai!' 
                    : `Sisa Rp ${(marketing.progressBarTarget - totalPrice).toLocaleString('id-ID')}`
                   }
                </span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  ref={progressBarRef}
                  className="h-full bg-pawon-accent transition-all duration-1000"
                />
              </div>
              <p className="text-[9px] text-gray-500 mt-2 italic flex items-center gap-1">
                 <Zap size={10} className="text-orange-500" /> 
                 {totalPrice >= marketing.progressBarTarget 
                  ? `Selamat! Anda berhak mendapatkan ${marketing.progressBarReward}.`
                  : `Tambah Rp ${(marketing.progressBarTarget - totalPrice).toLocaleString('id-ID')} lagi untuk mendapatkan ${marketing.progressBarReward}!`
                 }
              </p>
            </div>
          </div>
        )}

        {/* Cart Items */}
        {items.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.map(item => {
              const itemAddonPrice = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
              const unitPriceTotal = item.price + itemAddonPrice;

              return (
                <div key={item.cartId} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1 flex flex-col">
                    <p className="font-bold text-sm text-pawon-dark line-clamp-1">{item.name}</p>
                    
                    {/* Addons Display */}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedAddons.map(addon => (
                          <span key={addon.id} className="text-[9px] font-bold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md border border-green-100">
                            + {addon.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.notes && <p className="text-[10px] text-gray-500 italic mt-1 line-clamp-1">"{item.notes}"</p>}
                    <p className="font-bold text-pawon-accent text-xs mt-1.5">
                      Rp {unitPriceTotal.toLocaleString('id-ID')}
                    </p>
                    
                    <div className="mt-auto flex justify-between items-center pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-gray-100 rounded-full px-1 py-0.5">
                        <button 
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)} 
                          disabled={isSuccess}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-pawon-dark active:bg-gray-200 disabled:opacity-50"
                          title="Kurangi"
                          aria-label="Kurangi Jumlah"
                        >-</button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)} 
                          disabled={isSuccess}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-pawon-dark active:bg-gray-200 disabled:opacity-50"
                          title="Tambah"
                          aria-label="Tambah Jumlah"
                        >+</button>
                      </div>
                      {/* Remove Button */}
                      <button 
                          onClick={() => removeItem(item.cartId)} 
                          disabled={isSuccess}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Hapus"
                          aria-label="Hapus Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Smart Cross-Selling (Recommendations) */}
            {marketing.isCrossSellEnabled && items.length > 0 && (
              <div className="pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                   <Zap size={14} className="text-orange-500" />
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Biar Makin Mantap</h4>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                   {MENU_ITEMS.filter(i => (i.category === 'Minuman' || i.category === 'Snack') && !items.find(ci => ci.id === i.id)).slice(0, 3).map(rec => (
                     <div key={rec.id} className="min-w-[140px] bg-white rounded-xl border border-gray-100 p-2 shadow-sm flex flex-col gap-2">
                        <img src={rec.imageUrl} alt={rec.name} className="w-full h-20 object-cover rounded-lg" />
                        <div className="px-1">
                           <p className="text-[10px] font-bold text-pawon-dark line-clamp-1">{rec.name}</p>
                           <p className="text-[9px] font-bold text-pawon-accent">Rp {rec.price.toLocaleString('id-ID')}</p>
                        </div>
                        <button 
                          onClick={() => useCartStore.getState().addItem(rec, 1)}
                          className="w-full py-1.5 rounded-lg bg-gray-50 text-pawon-dark text-[9px] font-bold flex items-center justify-center gap-1 hover:bg-pawon-accent hover:text-white transition-all"
                        >
                          <Plus size={10} /> Tambah
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            )}
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
            
            {/* Auto Bundle Suggestion */}
            {marketing.isBundleEnabled && items.find(i => i.id === '9') && items.find(i => i.category === 'Minuman') && (
               <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-xl flex gap-3 animate-pulse">
                  <Box size={18} className="text-purple-500 shrink-0" />
                  <p className="text-[10px] text-purple-800 font-medium leading-relaxed">
                    Wah, Anda memesan Nasi Goreng + Minuman. Ambil <strong>Paket Puas</strong> saja di kasir nanti, hemat Rp 2.000!
                  </p>
               </div>
            )}

            {/* Discount Summary */}
            <div className="space-y-2 mb-4">
               <div className="flex justify-between items-center text-sm text-pawon-textGray">
                 <span>Subtotal</span>
                 <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
               </div>
               
               {marketing.isBirthdayPromoEnabled && (
                  <div className="flex justify-between items-center text-xs font-bold text-pink-600">
                    <span className="flex items-center gap-1"><Cake size={12} /> Birthday Discount ({marketing.birthdayDiscountPercent}%)</span>
                    <span>- Rp {Math.round(totalPrice * (marketing.birthdayDiscountPercent/100)).toLocaleString('id-ID')}</span>
                  </div>
               )}

               {marketing.isBuffetPromoEnabled && totalPrice > 500000 && (
                  <div className="flex justify-between items-center text-xs font-bold text-cyan-600">
                    <span className="flex items-center gap-1"><UtensilsCrossed size={12} /> Buffet Package Discount ({marketing.buffetDiscountPercent}%)</span>
                    <span>- Rp {Math.round(totalPrice * (marketing.buffetDiscountPercent/100)).toLocaleString('id-ID')}</span>
                  </div>
               )}

               <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                 <span className="font-bold text-pawon-dark">Total Akhir</span>
                 <span className="font-bold text-xl text-pawon-dark">
                   Rp {Math.round(totalPrice * (1 - (marketing.isBirthdayPromoEnabled ? marketing.birthdayDiscountPercent/100 : 0) - (marketing.isBuffetPromoEnabled && totalPrice > 500000 ? marketing.buffetDiscountPercent/100 : 0))).toLocaleString('id-ID')}
                 </span>
               </div>
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
