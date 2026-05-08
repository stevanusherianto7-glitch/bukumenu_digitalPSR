import React, { useState, useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { CheckCircle2, Clock, ShoppingBag, History } from 'lucide-react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// Waiter module with glassmorphism modal, blinking timer, and clean header
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
  if (mins >= 15) return { bg: 'bg-red-600', border: 'border-red-500', pulse: true };
  if (mins >= 8) return { bg: 'bg-orange-500', border: 'border-orange-400', pulse: true };
  return { bg: 'bg-emerald-600', border: 'border-emerald-500', pulse: true };
};

export const WaiterTableSection: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const now = useClock();
  const { orders, completeOrder, subscribeToOrders, fetchOrders, clearStalePendingOrders } = useOrderStore();
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
    let isActive = true;

    const initializeOrders = async () => {
      // Auto-clean stale pending orders (>3 jam) to keep waiter counters accurate.
      await clearStalePendingOrders(180);
      if (isActive) {
        await fetchOrders();
      }
    };

    initializeOrders();
    const unsubscribe = subscribeToOrders();
    
    // Suara Bel & TTS
    const playNotification = (tableNum: string, order?: any) => {
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

        // 2. Suara Orang (TTS via Capacitor Plugin)
        setTimeout(async () => {
          try {
            let textToSpeak = `Ada pesanan baru dari meja ${tableNum}. `;
            
            if (order && Array.isArray(order.items)) {
              order.items.forEach((item: any) => {
                textToSpeak += `${item.quantity} porsi ${item.menuName}. `;
                if (item.notes) {
                  textToSpeak += `Catatan: ${item.notes}. `;
                }
              });
            }
            
            if (order && order.orderType) {
              textToSpeak += `Tipe pesanan: ${order.orderType === 'dine_in' ? 'Makan di tempat' : 'Bawa pulang'}.`;
            }

            await TextToSpeech.speak({
              text: textToSpeak,
              lang: 'id-ID',
              rate: 0.9,
              pitch: 1.0,
              volume: 1.0,
              category: 'ambient',
            });
          } catch (err) {
            console.error("Capacitor TTS Error:", err);
          }
        }, 600);
      } catch (err) {
        console.error("Audio error:", err);
      }
    };

    const handlePing = (e: any) => {
      const newOrder = e.detail;
      if (newOrder.tableNumber) {
        const normalizedTableNumber = normalizeTableNumber(newOrder.tableNumber);
        if (!normalizedTableNumber) {
          return;
        }

        playNotification(normalizedTableNumber, newOrder);
        
        // INSTANT REFRESH: Update data immediately when ping occurs
        fetchOrders(); 

        setPingingTables(prev => new Set([...prev, normalizedTableNumber]));
        setTimeout(() => setPingingTables(prev => {
          const next = new Set(prev);
          next.delete(normalizedTableNumber);
          return next;
        }), 10000); 
      }
    };

    window.addEventListener('new-order-ping', handlePing);
    return () => {
      isActive = false;
      unsubscribe();
      window.removeEventListener('new-order-ping', handlePing);
    };
  }, [subscribeToOrders, fetchOrders, clearStalePendingOrders]);

  useEffect(() => { if (selectedTable) setTableDetailTab('active'); }, [selectedTable]);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const tables = Array.from({ length: 10 }, (_, i) => `A${i + 1}`);

  const normalizeTableNumber = (value: unknown): string => {
    return typeof value === 'string' ? value.trim().toUpperCase() : '';
  };

  const isFreshPendingOrder = (createdAt: unknown, maxAgeMinutes: number = 180): boolean => {
    const createdTime = (() => {
      if (typeof createdAt === 'number') {
        return Number.isFinite(createdAt) ? createdAt : NaN;
      }
      if (typeof createdAt === 'string') {
        return new Date(createdAt).getTime();
      }
      return NaN;
    })();

    if (!Number.isFinite(createdTime)) {
      return false;
    }

    const ageMinutes = (Date.now() - createdTime) / 60000;
    return ageMinutes <= maxAgeMinutes;
  };

  const getTableOrders = (num: string) =>
    safeOrders.filter(
      (order) =>
        normalizeTableNumber(order.tableNumber) === normalizeTableNumber(num) &&
        order.status === 'pending' &&
        isFreshPendingOrder(order.createdAt)
    );

  const getTableHistory = (num: string) =>
    safeOrders
      .filter(
        (order) =>
          normalizeTableNumber(order.tableNumber) === normalizeTableNumber(num) &&
          order.status === 'completed'
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const globalHistoryOrders = safeOrders.filter(o => o.status === 'completed').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingOrders = safeOrders.filter(o => o.status === 'pending');
  const validTableSet = new Set(tables);
  const pendingTableOrders = pendingOrders.filter((order) => {
    const tableNumber = normalizeTableNumber(order.tableNumber);
    if (!validTableSet.has(tableNumber)) {
      return false;
    }

    const totalItems = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
      : 0;

    return totalItems > 0 && isFreshPendingOrder(order.createdAt);
  });

  const activeTablesCount = new Set(
    pendingTableOrders.map((order) => normalizeTableNumber(order.tableNumber))
  ).size;
  const totalPendingItems = pendingTableOrders.reduce(
    (acc, order) => acc + order.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
    0
  );

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
      <div className="pb-20">
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
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setConfirmDialog({ isOpen: false, orderId: null })} />
            <div className="relative overflow-hidden w-full max-w-[360px] rounded-[32px] text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] animate-in zoom-in-95 duration-300 bg-[linear-gradient(135deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.85)_100%)] backdrop-blur-[20px] border-[1px] border-[rgba(255,255,255,0.3)]">
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-emerald-500/80 via-teal-600/80 to-cyan-600/80 rounded-t-[32px]" />
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent" />
              <div className="relative z-10 pt-12 pb-8 px-8">
                <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-600/20 border border-white/40 animate-[floatIcon_3s_ease-in-out_infinite]">
                  <CheckCircle2 size={48} className="text-emerald-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Konfirmasi Pesanan</h3>
                <p className="text-gray-600 text-sm mb-2 font-medium leading-relaxed">Apakah pesanan meja</p>
                <p className="text-2xl font-black text-emerald-600 mb-6">{selectedTable}</p>
                <p className="text-gray-600 text-sm mb-8 font-medium">sudah benar-benar selesai?</p>
                <div className="flex flex-col gap-3">
                  <button onClick={executeComplete} className="w-full py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95 transition-all duration-200 transform hover:translate-y-[-2px] backdrop-blur-[10px]">YA, SUDAH SELESAI</button>
                  <button onClick={() => setConfirmDialog({ isOpen: false, orderId: null })} className="w-full py-4 rounded-2xl text-sm font-bold text-gray-600 bg-white/40 backdrop-blur-md hover:bg-white/60 border border-white/40 transition-all duration-200 transform hover:translate-y-[-2px] backdrop-blur-[10px]">NANTI DULU</button>
                </div>
              </div>
              <style>{`
                @keyframes floatIcon {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-8px); }
                }
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
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
                        <span className="text-gray-700">{item.quantity}x {item.menuName === 'Public-Images' ? 'Menu Terhapus' : item.menuName}</span>
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

      {/* Confirmation Dialog - Glassmorphism */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setConfirmDialog({ isOpen: false, orderId: null })} />
          <div className="relative overflow-hidden w-full max-w-[360px] rounded-[32px] text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] animate-in zoom-in-95 duration-300 bg-[linear-gradient(135deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.85)_100%)] backdrop-blur-[20px] border-[1px] border-[rgba(255,255,255,0.3)]">
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-emerald-500/80 via-teal-600/80 to-cyan-600/80 rounded-t-[32px]" />
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-emerald-400/10 via-transparent to-transparent" />
            <div className="relative z-10 pt-12 pb-8 px-8">
              <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-600/20 border border-white/40 animate-[floatIcon_3s_ease-in-out_infinite]">
                <CheckCircle2 size={48} className="text-emerald-500" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-serif font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">Konfirmasi Pesanan</h3>
              <p className="text-gray-600 text-sm mb-8 font-medium leading-relaxed">Apakah pesanan ini sudah benar-benar selesai?</p>
              <div className="flex flex-col gap-3">
                <button onClick={executeComplete} className="w-full py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95 transition-all duration-200 transform hover:translate-y-[-2px] backdrop-blur-[10px]">YA, SUDAH SELESAI</button>
                <button onClick={() => setConfirmDialog({ isOpen: false, orderId: null })} className="w-full py-4 rounded-2xl text-sm font-bold text-gray-600 bg-white/40 backdrop-blur-md hover:bg-white/60 border border-white/40 transition-all duration-200 transform hover:translate-y-[-2px] backdrop-blur-[10px]">NANTI DULU</button>
              </div>
            </div>
            <style>{`
              @keyframes floatIcon {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};