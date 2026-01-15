
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Coffee, MapPin, ChevronLeft, Receipt, AlertCircle, Utensils, PlusSquare, History, LayoutGrid, CalendarDays, Info, FileClock, Loader2 } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import api from '../lib/api'; // Import API client untuk polling

// Data dummy untuk simulasi penambahan order
const dummyMenuItems = [
    { menuName: 'Beef Burger Premium', price: 55000 },
    { menuName: 'Spaghetti Bolognese', price: 45000 },
    { menuName: 'Kopi Susu Gula Aren', price: 18000 },
];

export const WaiterTableSection: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const { orders, completeOrder, addOrder, setOrders } = useOrderStore();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab untuk Dashboard Utama (Monitor vs Global History)
  const [activeTab, setActiveTab] = useState<'monitor' | 'history'>('monitor');
  
  // Tab untuk Detail Meja (Aktif vs Riwayat Meja Ini)
  const [tableDetailTab, setTableDetailTab] = useState<'active' | 'history'>('active');

  // --- REAL-TIME SYNC ENGINE (POLLING) ---
  // Ini yang mengambil data pesanan dari backend setiap 3 detik
  useEffect(() => {
    const fetchPendingOrders = async () => {
        try {
            const response = await api.get('/orders');
            // Transform data dari backend ke format frontend
            const transformedOrders = response.data.map((order: any) => ({
              ...order,
              // Pastikan timestamp tersedia
              timestamp: order.timestamp || (order.createdAt ? new Date(order.createdAt).getTime() : Date.now()),
              createdAt: order.createdAt || new Date(order.timestamp || Date.now()).toISOString(),
            }));
            // Update state dengan data fresh dari server
            setOrders(transformedOrders);
        } catch (error: any) {
            console.error("❌ Gagal sinkronisasi pesanan:", error);
            if (error.response) {
              console.error("Error response:", error.response.status, error.response.data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Panggil sekali saat komponen pertama kali dimuat
    fetchPendingOrders();

    // Set interval untuk polling setiap 3 detik (real-time feel)
    const intervalId = setInterval(fetchPendingOrders, 3000);

    // Cleanup: Hentikan interval saat komponen di-unmount
    return () => clearInterval(intervalId);
  }, [setOrders]);

  // Reset tab detail ke 'active' setiap kali ganti meja
  useEffect(() => {
    if (selectedTable) {
        setTableDetailTab('active');
    }
  }, [selectedTable]);

  // Safety check: ensure orders is an array
  const safeOrders = Array.isArray(orders) ? orders : [];

  // Generate Tables A1-A9
  const tables = Array.from({ length: 9 }, (_, i) => `A${i + 1}`);

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

  const handleSimulateOrder = async () => {
    // Pilih meja dan item secara acak
    const randomTable = tables[Math.floor(Math.random() * tables.length)];
    const randomItem = dummyMenuItems[Math.floor(Math.random() * dummyMenuItems.length)];
    const randomQuantity = Math.floor(Math.random() * 2) + 1;
    // Tambahkan catatan acak untuk testing
    const randomNote = Math.random() > 0.5 ? "Extra pedas, saus dipisah" : "";

    try {
        await addOrder(randomTable, [{ ...randomItem, quantity: randomQuantity, notes: randomNote }]);
        alert(`✅ Order simulasi untuk ${randomQuantity}x ${randomItem.menuName} di Meja ${randomTable} berhasil dikirim ke server.`);
    } catch (error) {
        alert("❌ Gagal mengirim order simulasi.");
    }
  };

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
                    <div className="space-y-4">
                        {activeOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                            <span className="text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-red-200 font-sans animate-pulse">Baru</span>
                            </div>
                            <div className="pl-3 space-y-4 mb-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-start pb-3 border-b border-dashed border-gray-100 last:border-0 last:pb-0">
                                <div className="flex gap-3 w-full">
                                    <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center mt-0.5 shrink-0 font-sans">{item.quantity}x</div>
                                    <div className="flex-1">
                                    <p className="font-bold text-gray-900 text-base leading-tight">{item.menuName}</p>
                                    
                                    {/* --- INTEGRASI CATATAN KHUSUS --- */}
                                    {item.notes && item.notes.trim() !== '' && (
                                        <div className="mt-2 w-full bg-yellow-50 rounded-lg border border-yellow-200 p-2.5 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={14} className="text-yellow-600 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wide mb-0.5 font-sans">
                                            Catatan Khusus:
                                            </p>
                                            <p className="text-sm text-gray-800 font-medium italic leading-snug break-words font-sans">
                                            "{item.notes}"
                                            </p>
                                        </div>
                                        </div>
                                    )}
                                    {/* -------------------------------- */}

                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-500 shrink-0 font-sans pl-2">{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                            </div>
                            <div className="pl-3 mt-4 pt-4 border-t border-gray-100">
                            <button onClick={async () => { 
                                if(window.confirm('Tandai pesanan ini sudah diantar/selesai?')) { 
                                    try {
                                        await completeOrder(order.id);
                                    } catch (error) {
                                        console.error("Error completing order:", error);
                                    }
                                } 
                            }} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-[0.98] transition-all font-sans">
                                <CheckCircle2 size={20} />
                                <span>Selesaikan Pesanan</span>
                            </button>
                            
                            {/* Reminder Repeat Order */}
                            <div className="mt-3 flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                <AlertCircle size={14} className="text-orange-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-orange-800 font-medium font-sans italic leading-snug">
                                Segera lakukan repeat order kepada pelanggan untuk memastikan ulang bahwa pesanan sudah benar.
                                </p>
                            </div>

                            {/* Reminder untuk Waiter */}
                            <div className="mt-2 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-800 font-medium font-sans italic leading-snug">
                                Perhatikan catatan khusus pelanggan sebelum menyajikan makanan.
                                </p>
                            </div>
                            </div>
                        </div>
                        ))}
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
      
      {/* Header Dashboard with Tabs */}
      <div className="bg-gray-900 text-white p-6 pb-12 rounded-b-[40px] shadow-xl shadow-gray-900/10 mb-4 relative overflow-hidden mx-0 -mt-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
             <h2 className="text-xl font-bold mb-1">Waiter Dashboard</h2>
             <p className="text-xs text-white/70 font-sans">Pawon Salam Resto</p>
          </div>
          {activeTab === 'monitor' && (
             <div className="text-right">
                <span className="block text-3xl font-bold text-orange-400 leading-none mb-1 font-sans">{activeTablesCount}</span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-sans">Meja Aktif</p>
             </div>
          )}
        </div>

        {/* Tab Switcher Utama */}
        <div className="relative z-10 bg-white/10 p-1 rounded-xl flex backdrop-blur-sm border border-white/10">
            <button 
                onClick={() => setActiveTab('monitor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'monitor' ? 'bg-white text-gray-900 shadow-md' : 'text-white/70 hover:bg-white/5'}`}
            >
                <LayoutGrid size={16} /> Monitor Meja
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-md' : 'text-white/70 hover:bg-white/5'}`}
            >
                <History size={16} /> Riwayat Global
            </button>
        </div>
      </div>

      {activeTab === 'monitor' ? (
        <>
            <div className="mb-6 px-6 text-right">
                <button onClick={handleSimulateOrder} className="bg-white border border-gray-200 text-sm text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm inline-flex">
                <PlusSquare size={16} /> Simulasi Order
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
            ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-6">
                {tables.map((tableNum) => {
                const pendingOrders = getTableOrders(tableNum);
                const hasOrder = pendingOrders.length > 0;
                return (
                    <button key={tableNum} onClick={() => setSelectedTable(tableNum)} className={`relative aspect-[4/5] rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 group ${hasOrder ? 'bg-white border-red-500 shadow-lg shadow-red-500/10 scale-105' : 'bg-white border-transparent shadow-sm hover:border-gray-200 hover:shadow-md'}`}>
                    <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${hasOrder ? 'bg-red-500 animate-pulse ring-4 ring-red-100' : 'bg-green-400'}`}></div>
                    <div className={`mb-3 p-3 rounded-full transition-colors ${hasOrder ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300 group-hover:text-gray-400'}`}><Utensils size={20} /></div>
                    <span className={`text-2xl font-bold mb-1 font-sans ${hasOrder ? 'text-gray-900' : 'text-gray-400'}`}>{tableNum}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest font-sans ${hasOrder ? 'text-red-500' : 'text-gray-300'}`}>Meja</span>
                    {hasOrder && <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10 font-sans">{pendingOrders.length}</div>}
                    </button>
                );
                    })}
            </div>
            )}
        </>
      ) : (
          /* --- GLOBAL HISTORY TAB CONTENT --- */
          <div className="px-6 space-y-4">
              {globalHistoryOrders.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                      <History size={48} className="mx-auto mb-3 opacity-20" />
                      <p className="font-bold">Belum ada riwayat</p>
                      <p className="text-xs">Pesanan yang selesai akan muncul di sini.</p>
                  </div>
              ) : (
                  globalHistoryOrders.map((order) => (
                      <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                          {/* Header Card */}
                          <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-700 font-bold border border-gray-200">
                                      <span className="text-[8px] uppercase tracking-wider text-gray-400">Meja</span>
                                      <span className="text-base leading-none">{order.tableNumber}</span>
                                  </div>
                                  <div>
                                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Order ID</p>
                                      <p className="font-mono text-xs font-bold text-gray-600">#{order.id.slice(-6).toUpperCase()}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="flex items-center gap-1.5 justify-end text-xs font-medium text-gray-500 mb-0.5">
                                      <CalendarDays size={12} />
                                      {new Date(order.timestamp).toLocaleDateString('id-ID', {
                                          day: 'numeric', month: 'short', year: 'numeric'
                                      })}
                                  </div>
                                  <div className="flex items-center gap-1.5 justify-end text-xs font-bold text-gray-800">
                                      <Clock size={12} />
                                      {new Date(order.timestamp).toLocaleTimeString('id-ID', {
                                          hour: '2-digit', minute: '2-digit'
                                      })}
                                  </div>
                              </div>
                          </div>
                          
                          {/* Items List (Summary) */}
                          <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                      <span className="text-gray-600">
                                          <span className="font-bold text-gray-900 mr-1">{item.quantity}x</span> 
                                          {item.menuName}
                                      </span>
                                      <span className="text-gray-400">{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                  </div>
                              ))}
                          </div>

                          {/* Footer Total */}
                          <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  Selesai
                              </span>
                              <div className="text-right">
                                  <span className="text-[10px] text-gray-400 mr-2">Total Transaksi</span>
                                  <span className="font-bold text-gray-900">Rp {calculateTotal(order.items).toLocaleString('id-ID')}</span>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}
    </div>
  );
};
