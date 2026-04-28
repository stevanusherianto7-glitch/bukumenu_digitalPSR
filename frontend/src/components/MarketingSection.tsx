import React from 'react';
import { 
  Zap, 
  ShoppingBag, 
  Box, 
  Target, 
  Sparkles, 
  Cake, 
  UtensilsCrossed, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export const MarketingSection: React.FC = () => {
  const settings = useSettingsStore();

  React.useEffect(() => {
    console.log("MarketingSection Mounted. Current Settings:", settings);
  }, []);

  const programs = [
    {
      id: 'isAddonEnabled',
      title: 'Fitur Add-ons',
      desc: 'Topping & Extra (e.g. Tambah Telur)',
      icon: <Zap size={18} />,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      id: 'isCrossSellEnabled',
      title: 'Smart Recommendation',
      desc: 'Saran minuman/snack di keranjang',
      icon: <ShoppingBag size={18} />,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      id: 'isBundleEnabled',
      title: 'Auto Combo Bundle',
      desc: 'Deteksi paket hemat otomatis',
      icon: <Box size={18} />,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      id: 'isProgressBarEnabled',
      title: 'Progress Reward',
      desc: 'Target belanja untuk bonus (TA)',
      icon: <Target size={18} />,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      id: 'isBestMatchEnabled',
      title: 'Label Best Match',
      desc: 'Pasangan menu di detail produk',
      icon: <Sparkles size={18} />,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      id: 'isBirthdayPromoEnabled',
      title: 'Birthday Promo',
      desc: 'Diskon khusus hari ulang tahun',
      icon: <Cake size={18} />,
      color: 'text-pink-500',
      bg: 'bg-pink-50',
    },
    {
      id: 'isBuffetPromoEnabled',
      title: 'Paket Buffet',
      desc: 'Diskon 10% untuk pesanan buffet',
      icon: <UtensilsCrossed size={18} />,
      color: 'text-cyan-500',
      bg: 'bg-cyan-50',
    },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Header Module */}
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-pawon-dark">Marketing Engine</h2>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Pawon Salam . Staff Console</p>
      </div>

      <div className="bg-gradient-to-br from-pawon-dark to-gray-800 p-6 rounded-[24px] text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pawon-accent/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <h3 className="font-serif text-xl font-bold mb-1 flex items-center gap-2">
          <Sparkles className="text-pawon-accent" /> Program Promo
        </h3>
        <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Tingkatkan Omzet & Up-Selling</p>
      </div>

      <div className="grid gap-3">
        {programs.map((prog) => (
          <div 
            key={prog.id}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-pawon-accent/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${prog.bg} ${prog.color} rounded-xl flex items-center justify-center shadow-inner`}>
                {prog.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-pawon-dark leading-none mb-1">{prog.title}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{prog.desc}</p>
              </div>
            </div>

            <button 
              onClick={() => settings.setMarketingSetting(prog.id as any, !settings[prog.id as keyof typeof settings])}
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${settings[prog.id as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings[prog.id as keyof typeof settings] ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
        <div className="text-orange-500 shrink-0">
          <Info size={18} />
        </div>
        <p className="text-[11px] text-orange-800 leading-relaxed">
          <strong>Tip Strategis:</strong> Aktifkan "Fitur Add-ons" dan "Smart Recommendation" bersamaan untuk meningkatkan rata-rata nilai keranjang hingga 15-20%.
        </p>
      </div>
    </div>
  );
};
