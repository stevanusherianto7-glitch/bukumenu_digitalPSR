import { 
  Zap, 
  ShoppingBag, 
  Box, 
  Target, 
  Sparkles, 
  Cake, 
  UtensilsCrossed, 
  ChevronRight,
  Info,
  Plus,
  Trash2,
  Clock,
  Gift
} from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { usePromoStore } from '../store/promoStore';

export const MarketingSection: React.FC = () => {
  const settings = useSettingsStore();
  const { allPromos, fetchAllPromos, createPromo, deletePromo } = usePromoStore();
  
  const [isAdding, setIsAdding] = React.useState(false);
  const [newPromo, setNewPromo] = React.useState({
    name: '',
    starts_at: '',
    ends_at: '',
    discount_percent: 0,
    status: 'active' as 'draft' | 'active' | 'expired'
  });

  React.useEffect(() => {
    console.log("MarketingSection Mounted. Current Settings:", settings);
    fetchAllPromos();
  }, [fetchAllPromos]);

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

      <div className="grid gap-4">
        {programs.map((prog) => {
          const isActive = settings[prog.id as keyof typeof settings];
          
          return (
            <div 
              key={prog.id}
              className={`bg-white rounded-[28px] border transition-all duration-500 overflow-hidden ${isActive ? 'border-pawon-accent/30 shadow-lg' : 'border-gray-100 shadow-sm'}`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${prog.bg} ${prog.color} rounded-[18px] flex items-center justify-center shadow-inner`}>
                      {prog.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-pawon-dark leading-none mb-1">{prog.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isActive ? 'Aktif' : 'Nonaktif'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => settings.setMarketingSetting(prog.id as any, !isActive)}
                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${isActive ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-gray-200'}`}
                    title={`Toggle ${prog.title}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${isActive ? 'left-8' : 'left-1'}`}></div>
                  </button>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-4 font-medium">{prog.desc}</p>

                {/* Configuration Fields (Visible when active) */}
                {isActive && (
                  <div className="pt-4 border-t border-gray-50 space-y-4 animate-in slide-in-from-top-2 duration-500">
                    {prog.id === 'isProgressBarEnabled' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label htmlFor="target-rp" className="text-[9px] font-black text-gray-400 uppercase ml-1">Target (Rp)</label>
                          <input 
                            id="target-rp"
                            type="number"
                            title="Target amount in Rupiah"
                            placeholder="e.g. 100000"
                            value={settings.progressBarTarget}
                            onChange={(e) => settings.setMarketingSetting('progressBarTarget', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="reward-desc" className="text-[9px] font-black text-gray-400 uppercase ml-1">Reward</label>
                          <input 
                            id="reward-desc"
                            type="text"
                            title="Reward description"
                            placeholder="e.g. Es Teh Gratis"
                            value={settings.progressBarReward}
                            onChange={(e) => settings.setMarketingSetting('progressBarReward', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                          />
                        </div>
                      </div>
                    )}

                    {prog.id === 'isBirthdayPromoEnabled' && (
                      <div className="space-y-1">
                        <label htmlFor="birthday-discount" className="text-[9px] font-black text-gray-400 uppercase ml-1">Diskon Ultah (%)</label>
                        <input 
                          id="birthday-discount"
                          type="number"
                          title="Birthday discount percentage"
                          placeholder="e.g. 15"
                          value={settings.birthdayDiscountPercent}
                          onChange={(e) => settings.setMarketingSetting('birthdayDiscountPercent', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                        />
                      </div>
                    )}

                    {prog.id === 'isBuffetPromoEnabled' && (
                      <div className="space-y-1">
                        <label htmlFor="buffet-discount" className="text-[9px] font-black text-gray-400 uppercase ml-1">Diskon Buffet (%)</label>
                        <input 
                          id="buffet-discount"
                          type="number"
                          title="Buffet discount percentage"
                          placeholder="e.g. 10"
                          value={settings.buffetDiscountPercent}
                          onChange={(e) => settings.setMarketingSetting('buffetDiscountPercent', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Promo Terjadwal Section */}
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden mt-6 mb-6">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-[18px] flex items-center justify-center shadow-inner">
                <Gift size={18} />
              </div>
              <div>
                <h4 className="text-base font-bold text-pawon-dark leading-none mb-1">Event Promo Terjadwal</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kelola Promo Supabase</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-all active:scale-90"
              title="Tambah Promo"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Form Tambah Promo */}
          {isAdding && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Nama Promo</label>
                <input 
                  type="text"
                  placeholder="e.g. Promo Ramadan"
                  value={newPromo.name}
                  onChange={(e) => setNewPromo({...newPromo, name: e.target.value})}
                  className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Mulai</label>
                  <input 
                    type="datetime-local"
                    value={newPromo.starts_at}
                    onChange={(e) => setNewPromo({...newPromo, starts_at: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Selesai</label>
                  <input 
                    type="datetime-local"
                    value={newPromo.ends_at}
                    onChange={(e) => setNewPromo({...newPromo, ends_at: e.target.value})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Diskon (%)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 10"
                    value={newPromo.discount_percent}
                    onChange={(e) => setNewPromo({...newPromo, discount_percent: parseFloat(e.target.value)})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Status</label>
                  <select 
                    value={newPromo.status}
                    onChange={(e) => setNewPromo({...newPromo, status: e.target.value as any})}
                    className="w-full bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-pawon-accent"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!newPromo.name || !newPromo.starts_at || !newPromo.ends_at || !newPromo.discount_percent) {
                    alert('Mohon isi semua field!');
                    return;
                  }
                  try {
                    await createPromo({
                      name: newPromo.name,
                      starts_at: new Date(newPromo.starts_at).toISOString(),
                      ends_at: new Date(newPromo.ends_at).toISOString(),
                      discount_percent: newPromo.discount_percent,
                      status: newPromo.status
                    });
                    setIsAdding(false);
                    setNewPromo({ name: '', starts_at: '', ends_at: '', discount_percent: 0, status: 'active' });
                    alert('Promo berhasil ditambahkan!');
                  } catch (e) {
                    alert('Gagal menambahkan promo.');
                  }
                }}
                className="w-full bg-red-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-red-700 transition-colors"
              >
                Simpan Promo
              </button>
            </div>
          )}

          {/* List Promo */}
          <div className="space-y-3">
            {allPromos.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada promo yang dibuat.</p>
            ) : (
              allPromos.map(promo => (
                <div key={promo.id} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center border border-gray-100">
                  <div>
                    <h5 className="text-sm font-bold text-pawon-dark">{promo.name}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-1">
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {new Date(promo.starts_at).toLocaleDateString()}</span>
                      <span>-</span>
                      <span>{new Date(promo.ends_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      promo.status === 'active' ? 'bg-green-100 text-green-600' :
                      promo.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {promo.status}
                    </span>
                    <span className="font-black text-sm text-red-600">
                      -{Math.round(promo.discount_percent)}%
                    </span>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Yakin ingin menghapus promo ini?')) {
                          await deletePromo(promo.id);
                        }
                      }}
                      className="p-1.5 bg-white hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 border border-gray-100 transition-colors"
                      title="Hapus Promo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-pawon-dark rounded-[32px] border border-white/5 flex gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pawon-accent/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
        <div className="text-pawon-accent shrink-0">
          <Info size={24} />
        </div>
        <div>
           <p className="text-xs font-bold text-white mb-1 uppercase tracking-widest">Tip Strategis</p>
           <p className="text-[11px] text-white/60 leading-relaxed italic">
              "Aktifkan **Fitur Add-ons** dan **Smart Recommendation** bersamaan untuk meningkatkan rata-rata nilai keranjang hingga 15-20% melalui strategi psikologi belanja impulsif."
           </p>
        </div>
      </div>
    </div>
  );
};
