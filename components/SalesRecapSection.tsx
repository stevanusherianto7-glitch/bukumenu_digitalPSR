import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Wallet, ShoppingBag, ArrowUpRight, Award, Loader2 } from 'lucide-react';
import api from '../lib/api';

type TimeRange = 'today' | '7days' | '30days';

interface AnalyticsData {
  totalRevenue: number;
  totalTransactions: number;
  avgTransaction: number;
  sortedMenu: Array<{ name: string; qty: number; revenue: number }>;
}

export const SalesRecapSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransaction: 0,
    sortedMenu: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/analytics/sales', {
          params: { period: timeRange }
        });
        setAnalyticsData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        setError(err.response?.data?.message || 'Gagal memuat data analytics');
        // Set empty data on error
        setAnalyticsData({
          totalRevenue: 0,
          totalTransactions: 0,
          avgTransaction: 0,
          sortedMenu: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

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

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-pawon-accent" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
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
                         const percentage = maxQty > 0 ? (item.qty / maxQty) * 100 : 0;
                         
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
        </>
      )}

    </div>
  );
};
