
import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, Wallet, ShoppingBag, ArrowUpRight, Award, Search, Filter } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';

type TimeRange = 'today' | '7days' | '30days' | 'custom';

export const SalesRecapSection: React.FC = () => {
  const { orders } = useOrderStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  // State untuk Custom Date Picker
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Logic Pengolahan Data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    let startCutoff = startOfDay;
    let endCutoff = Date.now();

    if (timeRange === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        d.setHours(0,0,0,0);
        startCutoff = d.getTime();
    } else if (timeRange === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        d.setHours(0,0,0,0);
        startCutoff = d.getTime();
    } else if (timeRange === 'custom') {
        const s = new Date(startDate);
        s.setHours(0,0,0,0);
        startCutoff = s.getTime();

        const e = new Date(endDate);
        e.setHours(23,59,59,999);
        endCutoff = e.getTime();
    }

    // 1. Filter Orders (Completed & Within Time Range)
    const validOrders = orders.filter(o => {
        const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : o.timestamp || 0;
        return o.status === 'completed' && orderTime >= startCutoff && orderTime <= endCutoff;
    });

    // 2. Calculate Totals
    const totalRevenue = validOrders.reduce((sum, order) => {
        return sum + (order.total || 0);
    }, 0);

    const totalTransactions = validOrders.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // 3. Aggregate Menu Sales
    const menuStats: Record<string, { name: string; qty: number; revenue: number }> = {};

    validOrders.forEach(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item: any) => {
            const name = item.menuName || item.name;
            if (!menuStats[name]) {
                menuStats[name] = { name, qty: 0, revenue: 0 };
            }
            menuStats[name].qty += item.quantity;
            menuStats[name].revenue += (item.price * item.quantity);
        });
    });

    const sortedMenu = Object.values(menuStats).sort((a, b) => b.qty - a.qty);

    return {
        totalRevenue,
        totalTransactions,
        avgTransaction,
        sortedMenu,
        topItem: sortedMenu.length > 0 ? sortedMenu[0] : null
    };
  }, [orders, timeRange, startDate, endDate]);

  return (
    <div className="p-6 pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="font-serif text-2xl font-bold text-pawon-dark">Laporan Penjualan</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">Retensi data hingga 10 tahun</p>
        </div>
        <div className="bg-orange-100 p-2 rounded-xl text-orange-600 shadow-sm">
            <BarChart3 size={24} />
        </div>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4 border border-gray-200">
        {[
            { id: 'today', label: 'Hari Ini' },
            { id: '7days', label: '7 Hari' },
            { id: '30days', label: '30 Hari' },
            { id: 'custom', label: 'Custom' }
        ].map((range) => (
            <button
                key={range.id}
                onClick={() => setTimeRange(range.id as TimeRange)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                    timeRange === range.id 
                    ? 'bg-white text-pawon-dark shadow-md scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
            >
                {range.label}
            </button>
        ))}
      </div>

      {/* Date Picker (Visible when Custom is selected) */}
      {timeRange === 'custom' && (
        <div className="grid grid-cols-2 gap-3 mb-6 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Dari Tanggal</label>
                <div className="relative">
                    <input
                        type="date"
                        title="Dari Tanggal"
                        aria-label="Dari Tanggal"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-pawon-dark focus:ring-2 focus:ring-pawon-accent/20 focus:border-pawon-accent outline-none shadow-sm"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sampai Tanggal</label>
                <div className="relative">
                    <input
                        type="date"
                        title="Sampai Tanggal"
                        aria-label="Sampai Tanggal"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-pawon-dark focus:ring-2 focus:ring-pawon-accent/20 focus:border-pawon-accent outline-none shadow-sm"
                    />
                </div>
            </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         {/* Omset Card */}
         <div className="col-span-2 bg-gradient-to-br from-gray-900 via-pawon-dark to-black text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                    <p className="text-[10px] text-white/50 font-bold mb-1 uppercase tracking-widest">Total Pendapatan</p>
                    <h3 className="text-3xl font-black tracking-tight">Rp {analyticsData.totalRevenue.toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-inner">
                    <Wallet size={20} className="text-orange-400" />
                </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-[10px] px-3 py-1 rounded-full font-black border border-green-500/20 shadow-sm">
                    <TrendingUp size={12} />
                    <span>Live Cloud Sync</span>
                </div>
                {timeRange === 'custom' && (
                    <span className="text-[9px] text-white/40 font-medium">{startDate} s/d {endDate}</span>
                )}
            </div>
         </div>

         {/* Transaksi Card */}
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 mb-3">
                <ShoppingBag size={18} />
            </div>
            <div>
                <h4 className="text-2xl font-black text-pawon-dark leading-none mb-1">{analyticsData.totalTransactions}</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Transaksi</p>
            </div>
         </div>

         {/* Rata-rata Card */}
         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 mb-3">
                <ArrowUpRight size={18} />
            </div>
            <div>
                <h4 className="text-sm font-black text-pawon-dark leading-none mb-1">Rp {analyticsData.avgTransaction.toLocaleString('id-ID')}</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Rata-rata / Bon</p>
            </div>
         </div>
      </div>

      {/* Best Seller Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 p-6 overflow-hidden relative">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                    <Award size={18} />
                </div>
                <h3 className="font-black text-sm text-pawon-dark uppercase tracking-wider">Ranking Menu</h3>
            </div>
            <Filter size={14} className="text-gray-300" />
         </div>

         {analyticsData.sortedMenu.length > 0 ? (
             <div className="space-y-6">
                 {analyticsData.sortedMenu.map((item, index) => {
                     const maxQty = analyticsData.sortedMenu[0].qty;
                     const percentage = (item.qty / maxQty) * 100;
                     
                     return (
                         <div key={item.name} className="relative group">
                             <div className="flex justify-between items-end mb-2 relative z-10">
                                 <div className="flex items-center gap-4">
                                     <div className={`
                                        w-6 h-6 flex items-center justify-center text-[10px] font-black rounded-lg shadow-sm
                                        ${index === 0 ? 'bg-yellow-400 text-white' :
                                          index === 1 ? 'bg-gray-200 text-gray-600' :
                                          index === 2 ? 'bg-orange-200 text-orange-700' : 'bg-gray-50 text-gray-400'}
                                     `}>
                                        {index + 1}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-sm font-bold text-pawon-dark leading-none group-hover:text-pawon-accent transition-colors">{item.name}</span>
                                        <span className="text-[10px] text-gray-400 mt-1 font-medium">Rp {item.revenue.toLocaleString('id-ID')}</span>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className="text-xs font-black text-pawon-dark">{item.qty}</span>
                                     <span className="text-[9px] text-gray-400 font-bold ml-1 uppercase">Porsi</span>
                                 </div>
                             </div>
                             
                             <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${index === 0 ? 'bg-pawon-accent' : 'bg-gray-300'}`}
                                    ref={(el) => { if (el) el.style.width = `${percentage}%`; }}
                                 />
                             </div>
                         </div>
                     );
                 })}
             </div>
         ) : (
             <div className="text-center py-16 flex flex-col items-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                    <Calendar size={32} />
                 </div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Tidak Ditemukan</p>
                 <p className="text-[10px] text-gray-300 mt-1">Coba sesuaikan filter periode waktu Anda.</p>
             </div>
         )}
      </div>

    </div>
  );
};
