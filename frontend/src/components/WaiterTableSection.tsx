
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Coffee, MapPin, ChevronLeft, Receipt, AlertCircle, Utensils, History, LayoutGrid, CalendarDays, Info, FileClock, Timer, Users, ShoppingBag } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';

// Live clock hook
const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

// Hitung berapa menit sejak order masuk
const getMinutesAgo = (timestamp: number) => Math.floor((Date.now() - timestamp) / 60000);

// Warna urgency berdasarkan waktu tunggu
const getUrgencyColor = (mins: number) => {
  if (mins >= 15) return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-500', pulse: true };
  if (mins >= 8) return { bg: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-400', pulse: false };
  return { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-400', pulse: false };
};

export const WaiterTableSection: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const now = useClock();
  const { orders, completeOrder } = useOrderStore();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  
  // Tab untuk Dashboard Utama (Monitor vs Global History)
  const [activeTab, setActiveTab] = useState<'monitor' | 'history'>('monitor');
  
  // Tab untuk Detail Meja (Aktif vs Riwayat Meja Ini)
  const [tableDetailTab, setTableDetailTab] = useState<'active' | 'history'>('active');

  // Reset tab detail ke 'active' setiap kali ganti meja
  useEffect(() => {
    if (selectedTable) {
        setTableDetailTab('active');
    }
  }, [selectedTable]);

  // Safety check: ensure orders is an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Generate Tables A1-A12 (Expanded)
  const tables = Array.from({ length: 12 }, (_, i) => `A${i + 1}`);

  const getTableOrders = (tableNum: string) => {
    return safeOrders.filter(o => o.tableNumber === tableNum && o.status === 'pending');
  };
  
  // Ambil history order SPESIFIK untuk meja tertentu
  const getTableHistory = (tableNum: string) => {
      return safeOrders
        .filter(o => o.tableNumber === tableNum && o.status === 'completed')
        .sort((a, b) => b.timestamp - a.timestamp);
  };
  
  // Ambil global order history (status completed), urutkan dari yang terbaru
  const globalHistoryOrders = safeOrders
    .filter(o => o.status === 'completed')
    .sort((a, b) => b.timestamp - a.timestamp);

  const activeTablesCount = new Set(safeOrders.filter(o => o.status === 'pending').map(o => o.tableNumber)).size;
  const totalPendingItems = safeOrders
    .filter(o => o.status === 'pending')
    .reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  const calculateTotal = (items: any[]) => {
      return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  // --- Tampilan Detail Meja (Fullscreen) ---
  if (selectedTable) {
    const activeOrders = getTableOrders(selectedTable).sort((a, b) => a.timestamp - b.timestamp);
    const tableHistory = getTableHistory(selectedTable);

    return (
      <div className="bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300 min-h-screen">
        
        {/* Navbar Detail Meja - PREMIUM DARK STYLE */}
        <div className="bg-gray-900 text-white p-6 pb-8 rounded-b-[40px] shadow-xl shadow-gray-900/20 sticky top-0 z-30 relative overflow-hidden -mt-0">
           
           {/* Background Glow Effect */}
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none"></div>

           <div className="relative z-10">
               {/* Top Row: Back & Title */}
               <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => setSelectedTable(null)}
                        className="flex items-center gap-3 text-white/90 hover:text-white font-bold active:scale-95 transition-transform group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 flex items-center justify-center transition-colors border border-white/5">
                            <ChevronLeft size={24} />
                        </div>
                        <span className="text-sm font-sans tracking-wide">Kembali</span>
                    </button>
                    
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <div className="bg-orange-500/20 p-1.5 rounded-lg backdrop-blur-sm border border-orange-500/30">
                                <MapPin size={18} className="text-orange-400" />
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-white leading-none tracking-wide">Meja {selectedTable}</h2>
                        </div>
                    </div>
               </div>

               {/* Tab Switcher Detail Meja - GLASSMORPHISM */}
               <div className="flex bg-white/10 p-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                    <button 
                        onClick={() => setTableDetailTab('active')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${tableDetailTab === 'active' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Utensils size={14} className={tableDetailTab === 'active' ? 'text-orange-600' : ''} /> 
                        Pesanan Aktif 
                        {activeOrders.length > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${tableDetailTab === 'active' ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>
                                {activeOrders.length}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setTableDetailTab('history')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${tableDetailTab === 'history' ? 'bg-white text-gray-900 shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                        <FileClock size={14} className={tableDetailTab === 'history' ? 'text-blue-600' : ''} /> 
                        Riwayat Meja
                        {tableHistory.length > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${tableDetailTab === 'history' ? 'bg-gray-200 text-gray-800' : 'bg-white/20 text-white'}`}>
                                {tableHistory.length}
                            </span>
                        )}
                    </button>
               </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-32 -mt-2">
           
           {/* KONTEN TAB: PESANAN AKTIF */}
           {tableDetailTab === 'active' && (
               <>
                {activeOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-gray-100">
                            <Coffee size={40} className="opacity-30 text-gray-900" />
                        </div>
                        <h2 className="font-bold text-xl text-gray-800 mb-1 font-serif">Meja Kosong</h2>
                        <p className="text-sm opacity-70 font-sans">Belum ada pesanan aktif saat ini.</p>
                        <button onClick={() => setSelectedTable(null)} className="mt-6 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                            Kembali ke Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeOrders.map((order) => {
                          const minsAgo = getMinutesAgo(order.timestamp);
                          const urgency = getUrgencyColor(minsAgo);
                          
                          return (
                            <div key={order.id} className={`bg-white border-2 ${urgency.border} rounded-[32px] overflow-hidden shadow-xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                {/* Card Header with Timer & ID */}
                                <div className={`${urgency.bg} p-4 flex justify-between items-center text-white`}>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                            <Timer size={18} className={urgency.pulse ? 'animate-pulse' : ''} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none mb-1">Waktu Tunggu</p>
                                            <p className="text-sm font-mono font-bold leading-none">{minsAgo} Menit</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none mb-1">Order ID</p>
                                        <p className="text-sm font-mono font-bold leading-none">#{order.id.slice(-6).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Items List */}
                                    <div className="space-y-5 mb-8">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-900 shrink-0 border border-gray-200">
                                                    {item.quantity}x
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-bold text-gray-900 text-lg leading-tight">{item.menuName}</p>
                                                        <p className="text-sm font-bold text-gray-400 font-mono">{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                                    </div>
                                                    
                                                    {item.notes && item.notes.trim() !== '' && (
                                                        <div className="mt-2 bg-orange-50 rounded-2xl border border-orange-100 p-3 flex items-start gap-2.5 animate-in zoom-in-95">
                                                            <Info size={16} className="text-orange-600 shrink-0 mt-0.5" />
                                                            <p className="text-sm text-orange-900 font-medium italic leading-snug">
                                                                "{item.notes}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        onClick={() => { if(window.confirm('Tandai pesanan ini sudah diantar/selesai?')) { completeOrder(order.id); } }} 
                                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-[20px] flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all group"
                                    >
                                        <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-lg">Selesaikan Pesanan</span>
                                    </button>

                                    {/* Footer Info */}
                                    <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        <div className="flex items-center gap-1">
                                            <Users size={12} />
                                            Waiter Terminal
                                        </div>
                                    </div>
                                </div>
                            </div>
                          );
                        })}
                    </div>
                )}
           </>
           )}

           {/* KONTEN TAB: RIWAYAT MEJA */}
           {tableDetailTab === 'history' && (
               <div className="space-y-4">
                   {tableHistory.length === 0 ? (
                       <div className="text-center py-20 text-gray-400">
                           <FileClock size={48} className="mx-auto mb-3 opacity-20" />
                           <p className="font-bold">Riwayat Kosong</p>
                           <p className="text-xs">Belum ada pesanan yang diselesaikan di meja ini hari ini.</p>
                       </div>
                   ) : (
                       tableHistory.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 opacity-80 hover:opacity-100 transition-opacity">
                            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selesai</span>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                                        <Clock size={12} />
                                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">#{order.id.slice(-4)}</span>
                            </div>
                            <div className="space-y-1 mb-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs">
                                        <span className="text-gray-600"><span className="font-bold">{item.quantity}x</span> {item.menuName}</span>
                                        <span className="text-gray-400">{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-right border-t border-dashed border-gray-200 pt-2">
                                <span className="text-xs font-bold text-gray-900">Total: Rp {calculateTotal(order.items).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                       ))
                   )}
               </div>
           )}

        </div>
      </div>
    );
  }

  // --- Tampilan Utama (Grid Meja / History Global) ---
  return (
    <div className="animate-in fade-in pb-20">
      
      {/* Header Dashboard with Real-time Clock & Stats */}
      <div className="bg-gray-900 text-white p-6 pb-12 rounded-b-[40px] shadow-2xl shadow-gray-900/20 mb-4 relative overflow-hidden mx-0 -mt-2">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-8">
          <div>
             <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <h2 className="text-xl font-serif font-bold tracking-tight">Waiter Terminal</h2>
             </div>
             <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Pawon Salam • Terminal 01</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-mono font-bold text-white leading-none mb-1">
                {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </div>
             <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
             </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <Users size={20} />
                </div>
                <div>
                    <span className="block text-xl font-bold leading-none mb-1">{activeTablesCount}</span>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Meja Aktif</p>
                </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShoppingBag size={20} />
                </div>
                <div>
                    <span className="block text-xl font-bold leading-none mb-1">{totalPendingItems}</span>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Total Item</p>
                </div>
            </div>
        </div>

        {/* Tab Switcher Utama */}
        <div className="relative z-10 bg-white/5 p-1.5 rounded-2xl flex backdrop-blur-md border border-white/10 shadow-inner">
            <button 
                onClick={() => setActiveTab('monitor')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'monitor' ? 'bg-white text-gray-900 shadow-xl scale-[1.02]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
                <LayoutGrid size={18} strokeWidth={2.5} /> Monitor Meja
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-xl scale-[1.02]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
                <History size={18} strokeWidth={2.5} /> Riwayat
            </button>
        </div>
      </div>

      {activeTab === 'monitor' ? (
        <div className="px-6 pb-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-bold text-lg text-gray-800">Peta Meja</h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Kosong</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase">Ada Order</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {tables.map((tableNum) => {
                const pendingOrders = getTableOrders(tableNum);
                const hasOrder = pendingOrders.length > 0;
                
                // Cari order paling lama untuk menentukan urgency di grid
                const oldestOrderTime = hasOrder 
                    ? Math.min(...pendingOrders.map(o => o.timestamp))
                    : Date.now();
                const minsAgo = hasOrder ? getMinutesAgo(oldestOrderTime) : 0;
                const urgency = getUrgencyColor(minsAgo);

                return (
                    <button 
                        key={tableNum} 
                        onClick={() => setSelectedTable(tableNum)} 
                        className={`relative aspect-[1/1] rounded-3xl flex flex-col items-center justify-center border-2 transition-all duration-300 group active:scale-95 ${
                            hasOrder 
                            ? `bg-white ${urgency.border} shadow-xl shadow-gray-200` 
                            : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-200'
                        }`}
                    >
                    {hasOrder && (
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg z-10 ${urgency.bg} ${urgency.pulse ? 'animate-bounce' : ''}`}>
                            {pendingOrders.length}
                        </div>
                    )}
                    
                    <div className={`mb-2 p-2.5 rounded-2xl transition-all duration-300 ${
                        hasOrder 
                        ? `${urgency.bg} text-white shadow-lg` 
                        : 'bg-white text-gray-300 group-hover:text-gray-400 border border-gray-100 shadow-sm'
                    }`}>
                        <Utensils size={18} strokeWidth={hasOrder ? 2.5 : 2} />
                    </div>
                    
                    <span className={`text-xl font-bold leading-none mb-0.5 font-sans ${hasOrder ? 'text-gray-900' : 'text-gray-400'}`}>
                        {tableNum}
                    </span>
                    
                    {hasOrder && (
                        <div className={`flex items-center gap-1 mt-1 ${urgency.text}`}>
                            <Timer size={10} />
                            <span className="text-[9px] font-bold">{minsAgo}m</span>
                        </div>
                    )}
                    </button>
                );
                })}
            </div>
        </div>
      ) : (
          <div className="px-6 space-y-4">
              {globalHistoryOrders.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                      <History size={48} className="mx-auto mb-3 opacity-20" />
                      <p className="font-bold">Belum ada riwayat</p>
                      <p className="text-xs">Pesanan yang selesai akan muncul di sini.</p>
                  </div>
              ) : (
                   globalHistoryOrders.map((order) => {
                       const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                       return (
                         <div key={order.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-3">
                                     <div className="w-12 h-12 bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-lg shadow-gray-200">
                                         <span className="text-[8px] uppercase tracking-wider text-white/40 leading-none mb-1">Meja</span>
                                         <span className="text-xl leading-none">{order.tableNumber}</span>
                                     </div>
                                     <div>
                                         <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-0.5">Order Verified</p>
                                         <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                                             <Clock size={12} className="text-gray-400" />
                                             {new Date(order.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                         </div>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider border border-emerald-100">
                                         Selesai
                                     </span>
                                     <p className="text-[10px] text-gray-400 mt-2 font-mono">#{order.id.slice(-6).toUpperCase()}</p>
                                 </div>
                             </div>
                             
                             <div className="space-y-2 mb-4 bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
                                 {order.items.map((item, idx) => (
                                     <div key={idx} className="flex justify-between items-center text-xs">
                                         <div className="flex items-center gap-2">
                                             <div className="w-5 h-5 rounded-md bg-white border border-gray-100 flex items-center justify-center font-bold text-[10px]">{item.quantity}x</div>
                                             <span className="font-medium text-gray-700">{item.menuName}</span>
                                         </div>
                                         <span className="text-gray-400 font-mono">{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                     </div>
                                 ))}
                             </div>

                             <div className="flex justify-between items-center pt-2">
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                     <ShoppingBag size={12} />
                                     {totalItems} Item
                                 </div>
                                 <div className="text-right">
                                     <span className="text-xs font-bold text-gray-900 text-lg">Rp {calculateTotal(order.items).toLocaleString('id-ID')}</span>
                                 </div>
                             </div>
                         </div>
                       );
                   })
              )}
          </div>
      )}
    </div>
  );
};
