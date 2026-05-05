import React from 'react';
import { ChevronLeft, MapPin, Utensils, FileClock, Timer, Info, CheckCircle2, Clock, Users, ShoppingBag, UtensilsCrossed } from 'lucide-react';

interface OrderDetailViewProps {
  selectedTable: string;
  activeOrders: any[];
  tableHistory: any[];
  tableDetailTab: 'active' | 'history';
  setTableDetailTab: (tab: 'active' | 'history') => void;
  onBack: () => void;
  onCompleteOrder: (orderId: string) => void;
  isCompleting: (orderId: string) => boolean;
  getMinutesAgo: (time: string) => number;
  getUrgencyColor: (mins: number) => { bg: string; border: string; pulse: boolean };
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  selectedTable,
  activeOrders,
  tableHistory,
  tableDetailTab,
  setTableDetailTab,
  onBack,
  onCompleteOrder,
  isCompleting,
  getMinutesAgo,
  getUrgencyColor
}) => {
  return (
    <div className="bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300 min-h-screen">
      {/* Navbar Detail Meja */}
      <div className="bg-violet-950 text-white p-6 pb-8 rounded-b-[40px] shadow-xl sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-3 font-bold active:scale-95">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronLeft size={24} />
            </div>
            <span className="text-sm">Kembali</span>
          </button>
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-orange-400" />
            <h2 className="font-serif text-2xl font-bold">Meja {selectedTable}</h2>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/10 p-1.5 rounded-xl border border-white/10">
          <button 
            onClick={() => setTableDetailTab('active')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${tableDetailTab === 'active' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60'}`}
          >
            Pesanan Aktif
          </button>
          <button 
            onClick={() => setTableDetailTab('history')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${tableDetailTab === 'history' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60'}`}
          >
            Riwayat Meja
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32">
        {tableDetailTab === 'active' ? (
          activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
              <h2 className="font-bold text-xl text-gray-800">Meja Kosong</h2>
            </div>
          ) : (
            <div className="space-y-6">
              {activeOrders.map((order) => {
                const minsAgo = getMinutesAgo(order.createdAt);
                const urgency = getUrgencyColor(minsAgo);
                return (
                  <div key={order.id} className={`bg-white border-2 ${urgency.border} rounded-[32px] overflow-hidden shadow-xl`}>
                    <div className={`${urgency.bg} p-4 flex justify-between items-center text-white`}>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Timer size={18} className={urgency.pulse ? 'animate-pulse' : ''} />
                          <span className="text-sm font-bold">{minsAgo}m</span>
                        </div>
                        {/* TANDA DINE IN / TAKE AWAY */}
                        <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full border border-white/30">
                          {order.orderType === 'take-away' ? <ShoppingBag size={14} /> : <UtensilsCrossed size={14} />}
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {order.orderType === 'take-away' ? 'Take Away' : 'Dine In'}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-mono opacity-60">#{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="p-6">
                      <div className="space-y-5 mb-8">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-900 border border-gray-200">
                              {item.quantity}x
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg leading-tight">{item.menuName}</p>
                              {item.notes && (
                                <div className="mt-1.5 bg-orange-50 p-2 rounded-xl border border-orange-100 flex items-start gap-2">
                                  <Info size={12} className="text-orange-600 mt-0.5 shrink-0" />
                                  <p className="text-xs text-orange-900 font-bold italic leading-snug">
                                    Catatan: {item.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => onCompleteOrder(order.id)}
                        disabled={isCompleting(order.id)}
                        className={`w-full font-bold py-4 rounded-[20px] flex items-center justify-center gap-3 transition-all ${isCompleting(order.id) ? 'bg-gray-400' : 'bg-emerald-600 text-white active:scale-95'}`}
                      >
                        {isCompleting(order.id) ? 'Menyelesaikan...' : 'Selesaikan Pesanan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {tableHistory.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 opacity-80">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <span className="text-xs font-bold text-gray-700">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  <span className="text-[10px] bg-gray-100 px-2 rounded">#{order.id.slice(-4)}</span>
                </div>
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-600">
                    <span>{item.quantity}x {item.menuName}</span>
                    <span>{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
