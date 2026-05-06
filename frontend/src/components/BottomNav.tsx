
import { MapPin, Settings, Bell, BarChart3, Sparkles } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';

interface BottomNavProps {
  activeTab: 'meja' | 'peta' | 'laporan' | 'marketing' | 'admin';
  onTabChange: (tab: 'meja' | 'peta' | 'laporan' | 'marketing' | 'admin') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { orders } = useOrderStore();
  const hasPendingOrders = orders.some(o => o.status === 'pending');

  const tabs = [
    { id: 'meja', label: 'Monitor', icon: Bell, badge: hasPendingOrders },
    { id: 'peta', label: 'QR Meja', icon: MapPin },
    { id: 'laporan', label: 'Report', icon: BarChart3 },
    { id: 'marketing', label: 'Promo', icon: Sparkles },
    { id: 'admin', label: 'Catalog', icon: Settings },
  ] as const;


  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] px-4 pb-4">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-[28px] h-20 shadow-2xl shadow-black/40 flex items-center justify-around px-2 relative overflow-hidden">
        {/* Active Indicator Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-pawon-accent/10 rounded-full blur-2xl -ml-12 -mt-12"></div>
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button 
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
            >
              {tab.badge && (
                <span className="absolute top-0.5 right-1/2 translate-x-[12px] w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse z-10"></span>
              )}
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'text-pawon-accent bg-white/5 shadow-inner' : 'text-white'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.15em] transition-colors ${isActive ? 'text-pawon-accent' : 'text-white'}`}>
                {tab.label}
              </span>
              
              {isActive && (
                <div className="absolute -bottom-2 w-1.5 h-1.5 bg-pawon-accent rounded-full shadow-[0_0_12px_rgba(255,107,0,0.8)]"></div>
              )}
            </button>
          );
        })}

      </div>
    </div>
  );
};
