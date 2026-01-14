
import React, { useState } from 'react';
import { CheckCircle2, Clock, Coffee, MapPin, ChevronLeft, Receipt, AlertCircle, Utensils, PlusSquare } from 'lucide-react';
import { Order } from '../../types';
import { useOrderStore } from '../store/orderStore';

// Data dummy untuk simulasi penambahan order
const dummyMenuItems = [
    { menuName: 'Beef Burger Premium', price: 55000 },
    { menuName: 'Spaghetti Bolognese', price: 45000 },
    { menuName: 'Kopi Susu Gula Aren', price: 18000 },
];

export const WaiterTableSection: React.FC = () => {
  const { orders, completeOrder, addOrder } = useOrderStore();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Generate Tables A1-A9
  const tables = Array.from({ length: 9 }, (_, i) => `A${i + 1}`);

  const getTableOrders = (tableNum: string) => {
    return orders.filter(o => o.tableNumber === tableNum && o.status === 'pending');
  };

  const activeTablesCount = new Set(orders.filter(o => o.status === 'pending').map(o => o.tableNumber)).size;

  const handleSimulateOrder = () => {
    // Pilih meja dan item secara acak
    const randomTable = tables[Math.floor(Math.random() * tables.length)];
    const randomItem = dummyMenuItems[Math.floor(Math.random() * dummyMenuItems.length)];
    const randomQuantity = Math.floor(Math.random() * 2) + 1;

    addOrder(randomTable, [{ ...randomItem, quantity: randomQuantity }]);
    alert(`Order simulasi untuk ${randomQuantity}x ${randomItem.menuName} di Meja ${randomTable} telah ditambahkan.`);
  };

  // --- Tampilan Detail Meja (Fullscreen) ---
  if (selectedTable) {
    const activeOrders = getTableOrders(selectedTable).sort((a, b) => a.timestamp - b.timestamp);

    return (
      <div className="bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300 -m-8 min-h-screen">
        <div className="bg-white px-5 py-4 border-b border-gray-200 shadow-sm flex items-center justify-between sticky top-0 z-20">
           <button 
             onClick={() => setSelectedTable(null)}
             className="flex items-center gap-3 text-gray-900 font-bold active:scale-95 transition-transform group"
           >
             <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
               <ChevronLeft size={24} />
             </div>
             <span className="text-sm font-sans">Kembali</span>
           </button>
           <div className="flex flex-col items-end">
             <div className="flex items-center gap-2">
               <MapPin size={18} className="text-orange-600" />
               <h2 className="font-serif text-2xl font-bold text-gray-900 leading-none">Meja {selectedTable}</h2>
             </div>
             <span className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 px-2 py-0.5 rounded-full font-sans">
               {activeOrders.length > 0 ? `${activeOrders.length} Pesanan Aktif` : 'Tidak ada pesanan'}
             </span>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-32">
           {activeOrders.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                 <Coffee size={40} className="opacity-30 text-gray-900" />
               </div>
               <h2 className="font-bold text-xl text-gray-800 mb-1">Meja Kosong</h2>
               <p className="text-sm opacity-70 font-sans">Belum ada pesanan masuk untuk meja ini.</p>
             </div>
           ) : (
             <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-red-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-50 text-red-500 p-1.5 rounded-lg"><Receipt size={16} /></div>
                        <div>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-sans">Order ID: #{order.id.slice(-4)}</span>
                           <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 font-sans">
                             <Clock size={12} className="text-gray-400" />
                             {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-red-200 font-sans">Baru</span>
                    </div>
                    <div className="pl-3 space-y-4 mb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start pb-3 border-b border-dashed border-gray-100 last:border-0 last:pb-0">
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center mt-0.5 shrink-0 font-sans">{item.quantity}x</div>
                            <div>
                              <p className="font-bold text-gray-900 text-base leading-tight">{item.menuName}</p>
                              {item.notes && (
                                <div className="flex items-start gap-1 mt-1.5 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                                   <AlertCircle size={10} className="text-yellow-600 mt-0.5 shrink-0" />
                                   <p className="text-xs text-yellow-800 italic leading-snug font-sans">"{item.notes}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-gray-500 shrink-0 font-sans">{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pl-3 mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => { if(window.confirm('Tandai pesanan ini sudah diantar/selesai?')) { completeOrder(order.id); } }} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-[0.98] transition-all font-sans">
                        <CheckCircle2 size={20} />
                        <span>Selesaikan Pesanan</span>
                      </button>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    );
  }

  // --- Tampilan Utama (Grid Meja) ---
  return (
    <div className="animate-in fade-in">
      <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-xl shadow-gray-900/10 mb-8 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">Monitor Meja</h2>
          <p className="text-xs text-white/70 font-sans">Pantau status & pesanan</p>
        </div>
        <div className="text-right relative z-10">
          <span className="block text-3xl font-bold text-orange-400 leading-none mb-1 font-sans">{activeTablesCount}</span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-sans">Meja Aktif</p>
        </div>
      </div>

      <div className="mb-6 text-right">
        <button onClick={handleSimulateOrder} className="bg-white border border-gray-200 text-sm text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm inline-flex">
          <PlusSquare size={16} /> Simulasi Order Baru
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-1">
        {tables.map((tableNum) => {
          const pendingOrders = getTableOrders(tableNum);
          const hasOrder = pendingOrders.length > 0;
          return (
            <button key={tableNum} onClick={() => setSelectedTable(tableNum)} className={`relative aspect-[4/5] rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 group ${hasOrder ? 'bg-white border-red-500 shadow-lg shadow-red-500/10' : 'bg-white border-transparent shadow-sm hover:border-gray-200 hover:shadow-md'}`}>
              <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${hasOrder ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}></div>
              <div className={`mb-3 p-3 rounded-full transition-colors ${hasOrder ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300 group-hover:text-gray-400'}`}><Utensils size={20} /></div>
              <span className={`text-2xl font-bold mb-1 font-sans ${hasOrder ? 'text-gray-900' : 'text-gray-400'}`}>{tableNum}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest font-sans ${hasOrder ? 'text-red-500' : 'text-gray-300'}`}>Meja</span>
              {hasOrder && <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10 font-sans">{pendingOrders.length}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
