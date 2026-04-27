
import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, Wallet, ShoppingBag, ArrowUpRight, Award } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';

type TimeRange = 'today' | '7days' | '30days';

export const SalesRecapSection: React.FC = () => {
  const { orders } = useOrderStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  // Logic Pengolahan Data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    let cutoffTime = startOfDay; // Default today

    if (timeRange === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        cutoffTime = d.getTime();
    } else if (timeRange === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        cutoffTime = d.getTime();
    }

    // 1. Filter Orders (Completed & Within Time Range)
    const validOrders = orders.filter(o => 
        o.status === 'completed' && o.timestamp >= cutoffTime
    );

    // 2. Calculate Totals
    const totalRevenue = validOrders.reduce((sum, order) => {
        const orderTotal = order.items.reduce((sub, item) => sub + (item.price * item.quantity), 0);
        return sum + orderTotal;
    }, 0);

    const totalTransactions = validOrders.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // 3. Aggregate Menu Sales
    const menuStats: Record<string, { name: string; qty: number; revenue: number }> = {};

    validOrders.forEach(order => {
        order.items.forEach(item => {
            if (!menuStats[item.menuName]) {
                menuStats[item.menuName] = { name: item.menuName, qty: 0, revenue: 0 };
            }
            menuStats[item.menuName].qty += item.quantity;
            menuStats[item.menuName].revenue += (item.price * item.quantity);
        });
    });

    // 4. Convert to Array & Sort by Quantity (Best Seller)
    const sortedMenu = Object.values(menuStats).sort((a, b) => b.qty - a.qty);

    return {
        totalRevenue,
        totalTransactions,
        avgTransaction,
        sortedMenu,
        topItem: sortedMenu.length > 0 ? sortedMenu[0] : null
    };
  }, [orders, timeRange]);

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="font-serif text-2xl font-bold text-pawon-dark">Laporan Penjualan</h2>
            <p className="text-xs text-gray-500 mt-1">Evaluasi performa & menu terlaris</p>
        </div>
        <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
            <BarChart3 size={24} />
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        {[
            { id: 'today', label: 'Hari Ini' },
            { id: '7days', label: '7 Hari' },
            { id: '30days', label: '30 Hari' }
        ].map((range) => (
            <button
                key={range.id}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    timeRange === range.id 
                    ? 'bg-white text-pawon-dark shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {range.label}
            </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         {/* Omset Card */}
         <div className="col-span-2 bg-gradient-to-br from-pawon-dark to-black text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6 blur-xl"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                    <p className="text-xs text-white/70 font-medium mb-1 uppercase tracking-wider">Total Omset</p>
                    <h3 className="text-2xl font-bold">Rp {analyticsData.totalRevenue.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                    <Wallet size={20} className="text-orange-400" />
                </div>
            </div>
            {analyticsData.totalRevenue > 0 && (
                 <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-green-500/30">
                    <TrendingUp size={10} /> 
                    <span>Data Realtime</span>
                 </div>
            )}
         </div>

         {/* Transaksi Card */}
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="text-gray-500 mb-2"><ShoppingBag size={18} /></div>
            <div>
                <h4 className="text-xl font-bold text-pawon-dark">{analyticsData.totalTransactions}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Transaksi</p>
            </div>
         </div>

         {/* Rata-rata Card */}
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="text-gray-500 mb-2"><ArrowUpRight size={18} /></div>
            <div>
                <h4 className="text-sm font-bold text-pawon-dark">Rp {analyticsData.avgTransaction.toLocaleString('id-ID')}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Rata-rata / Bon</p>
            </div>
         </div>
      </div>

      {/* Best Seller Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
         <div className="flex items-center gap-2 mb-6">
            <Award size={18} className="text-orange-500" />
            <h3 className="font-bold text-pawon-dark">Ranking Menu Terlaris</h3>
         </div>

         {analyticsData.sortedMenu.length > 0 ? (
             <div className="space-y-5">
                 {analyticsData.sortedMenu.map((item, index) => {
                     // Calculate width percentage relative to top seller
                     const maxQty = analyticsData.sortedMenu[0].qty;
                     const percentage = (item.qty / maxQty) * 100;
                     
                     return (
                         <div key={item.name} className="relative">
                             <div className="flex justify-between items-end mb-1.5 relative z-10">
                                 <div className="flex items-center gap-3">
                                     <span className={`
                                        w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full 
                                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                          index === 1 ? 'bg-gray-100 text-gray-700' : 
                                          index === 2 ? 'bg-orange-50 text-orange-700' : 'text-gray-400'}
                                     `}>
                                        {index + 1}
                                     </span>
                                     <span className="text-sm font-bold text-pawon-dark line-clamp-1">{item.name}</span>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-xs font-bold text-pawon-dark block">{item.qty} Terjual</span>
                                 </div>
                             </div>
                             
                             {/* Progress Bar Container */}
                             <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${index === 0 ? 'bg-pawon-accent' : 'bg-gray-400/50'}`}
                                    style={{ width: `${percentage}%` }}
                                 />
                             </div>
                             
                             <div className="mt-1 text-right">
                                <span className="text-[10px] text-gray-400">Omset: Rp {item.revenue.toLocaleString('id-ID')}</span>
                             </div>
                         </div>
                     );
                 })}
             </div>
         ) : (
             <div className="text-center py-10 text-gray-400">
                 <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                 <p className="text-xs">Belum ada data penjualan pada periode ini.</p>
             </div>
         )}
      </div>

    </div>
  );
};
