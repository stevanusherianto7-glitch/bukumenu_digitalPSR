import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { CheckCircle2, Clock, ShoppingBag, History } from 'lucide-react';

// New Waiter Sub-components
import { WaiterDashboardHeader } from './waiter/WaiterDashboardHeader';
import { TableGrid } from './waiter/TableGrid';
import { OrderDetailView } from './waiter/OrderDetailView';

// Live clock hook
const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

// Helpers
const getMinutesAgo = (createdAt: string | number) => {
  const time = typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt;
  return Math.floor((Date.now() - time) / 60000);
};

const getUrgencyColor = (mins: number) => {
  if (mins >= 15) return { bg: 'bg-red-500', border: 'border-red-500', pulse: true };
  if (mins >= 8) return { bg: 'bg-orange-500', border: 'border-orange-400', pulse: false };
  return { bg: 'bg-emerald-500', border: 'border-emerald-400', pulse: false };
};

export const WaiterTableSection: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const now = useClock();
  const { orders, completeOrder, subscribeToOrders, fetchOrders } = useOrderStore();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [pingingTables, setPingingTables] = useState<Set<string>>(new Set());
  const [completingOrderIds, setCompletingOrderIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'monitor' | 'history'>('monitor');
  const [tableDetailTab, setTableDetailTab] = useState<'active' | 'history'>('active');

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; orderId: string | null }>({
    isOpen: false,
    orderId: null
  });

  useEffect(() => {
    fetchOrders();
    const unsubscribe = subscribeToOrders();
    
    // Suara Bel & TTS
    const playNotification = (tableNum: string) => {
      try {
        // 1. Bunyi Bel (Beep)
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.6);

        // 2. Suara Orang (TTS)
        setTimeout(() => {
          const msg = new SpeechSynthesisUtterance(`Ada pesanan baru dari meja ${tableNum}`);
          msg.lang = 'id-ID';
          msg.rate = 1.0;
          msg.pitch = 1.1;
          window.speechSynthesis.speak(msg);
        }, 600);
      } catch (err) {
        console.error("Audio error:", err);
      }
    };

    const handlePing = (e: any) => {
      const newOrder = e.detail;
      if (newOrder.tableNumber) {
        playNotification(newOrder.tableNumber);
        
        // INSTANT REFRESH: Update data immediately when ping occurs
        fetchOrders(); 

        setPingingTables(prev => new Set([...prev, newOrder.tableNumber]));
        setTimeout(() => setPingingTables(prev => {
          const next = new Set(prev);
          next.delete(newOrder.tableNumber);
          return next;
        }), 10000); 
      }
    };

    window.addEventListener('new-order-ping', handlePing);
    return () => {
      unsubscribe();
      window.removeEventListener('new-order-ping', handlePing);
    };
  }, [subscribeToOrders, fetchOrders]);

  useEffect(() => { if (selectedTable) setTableDetailTab('active'); }, [selectedTable]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const tables = Array.from({ length: 10 }, (_, i) => `A${i + 1}`);

  const getTableOrders = (num: string) => safeOrders.filter(o => o.tableNumber === num && o.status === 'pending');
  const getTableHistory = (num: string) => safeOrders.filter(o => o.tableNumber === num && o.status === 'completed').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const globalHistoryOrders = safeOrders.filter(o => o.status === 'completed').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeTablesCount = new Set(safeOrders.filter(o => o.status === 'pending').map(o => o.tableNumber)).size;
  const totalPendingItems = safeOrders.filter(o => o.status === 'pending').reduce((acc, o) => acc + o.items.reduce((sum, item) => sum + item.quantity, 0), 0);

  const handleCompleteRequest = async (orderId: string) => {
    setConfirmDialog({ isOpen: true, orderId });
  };

  const executeComplete = async () => {
    if (confirmDialog.orderId) {
      const id = confirmDialog.orderId;
      setCompletingOrderIds(prev => new Set([...prev, id]));
      setConfirmDialog({ isOpen: false, orderId: null });
      try {
        await completeOrder(id);
      } finally {
        setCompletingOrderIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  if (selectedTable) {
    return (
      <OrderDetailView 
        selectedTable={selectedTable}
        activeOrders={getTableOrders(selectedTable)}
        tableHistory={getTableHistory(selectedTable)}
        tableDetailTab={tableDetailTab}
        setTableDetailTab={setTableDetailTab}
        onBack={() => setSelectedTable(null)}
        onCompleteOrder={handleCompleteRequest}
        isCompleting={(id) => completingOrderIds.has(id)}
        getMinutesAgo={getMinutesAgo}
        getUrgencyColor={getUrgencyColor}
      />
    );
  }

  return (
    <div className="pb-20">
      <WaiterDashboardHeader 
        now={now}
        activeTablesCount={activeTablesCount}
        totalPendingItems={totalPendingItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === 'monitor' ? (
        <TableGrid 
          tables={tables}
          pingingTables={pingingTables}
          onSelectTable={setSelectedTable}
          getTableOrders={getTableOrders}
          getUrgencyColor={getUrgencyColor}
          getMinutesAgo={getMinutesAgo}
        />
      ) : (
        <div className="px-6 space-y-4">
          {globalHistoryOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
               <History size={48} className="mx-auto mb-3 opacity-20" />
               <p className="font-bold">Belum ada riwayat</p>
            </div>
          ) : (
            globalHistoryOrders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-white font-bold">
                       <span className="text-[8px] uppercase text-white/40">Meja</span>
                       <span className="text-xl">{order.tableNumber}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      <p className="text-[10px] text-gray-400">#{order.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase">Selesai</span>
                </div>
                <div className="space-y-1 bg-gray-50/50 rounded-xl p-3 border border-gray-100 mb-2">
                   {order.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-700">{item.quantity}x {item.menuName}</span>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                   <div className="flex items-center gap-1 text-gray-400 uppercase tracking-widest text-[9px]">
                     <ShoppingBag size={12} /> {order.items.reduce((s, i) => s + i.quantity, 0)} Item
                   </div>
                   <span>Rp {order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDialog({ isOpen: false, orderId: null })} />
          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
              <CheckCircle2 size={40} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">Konfirmasi Pesanan</h3>
            <p className="text-gray-500 text-sm mb-8">Tandai pesanan ini sudah selesai?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDialog({ isOpen: false, orderId: null })} className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-white border border-gray-200">Batal</button>
              <button onClick={executeComplete} className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white bg-emerald-600 shadow-lg shadow-emerald-600/20">Ya, Selesai</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
