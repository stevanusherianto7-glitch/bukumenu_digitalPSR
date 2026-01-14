
import React from 'react';
import { MapPin, Settings, LogOut, Bell } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';

interface BottomNavProps {
  activeTab: 'meja' | 'peta' | 'admin';
  onTabChange: (tab: 'meja' | 'peta' | 'admin') => void;
  onExitAdmin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onExitAdmin }) => {
  const { orders } = useOrderStore();
  const hasPendingOrders = orders.some(o => o.status === 'pending');

  return (
    // Updated padding-bottom to handle safe area (iPhone home indicator)
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] px-2 flex justify-around items-center z-50 max-w-[480px] mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      {/* Tab Meja (Monitor Pesanan) */}
      <button 
        type="button"
        onClick={() => onTabChange('meja')}
        className={`relative flex-1 flex flex-col items-center gap-1 transition-colors duration-300 ${activeTab === 'meja' ? 'text-pawon-accent' : 'text-gray-400'}`}
      >
        {hasPendingOrders && (
          <span className="absolute top-0 right-1/2 translate-x-[20px] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
        <Bell size={24} strokeWidth={activeTab === 'meja' ? 2.5 : 2} />
        <span className="text-[10px] font-bold tracking-wide uppercase">Pesanan</span>
      </button>
      
      {/* Tab Peta Meja & QR */}
      <button 
        type="button"
        onClick={() => onTabChange('peta')}
        className={`relative flex-1 flex flex-col items-center gap-1 transition-colors duration-300 ${activeTab === 'peta' ? 'text-pawon-accent' : 'text-gray-400'}`}
      >
        <MapPin size={24} strokeWidth={activeTab === 'peta' ? 2.5 : 2} />
        <span className="text-[10px] font-bold tracking-wide uppercase">Peta Meja</span>
      </button>

      {/* Tab Kelola (Admin) */}
      <button 
        type="button"
        onClick={() => onTabChange('admin')}
        className={`flex-1 flex flex-col items-center gap-1 transition-colors duration-300 ${activeTab === 'admin' ? 'text-pawon-accent' : 'text-gray-400'}`}
      >
        <Settings size={24} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
        <span className="text-[10px] font-bold tracking-wide uppercase">Kelola</span>
      </button>

      {/* Tombol Keluar (Exit Admin) */}
      <button 
        type="button"
        onClick={onExitAdmin}
        className="flex-1 flex flex-col items-center gap-1 text-gray-400 hover:text-red-600 transition-colors duration-300 group"
      >
        <LogOut size={24} strokeWidth={2} className="group-hover:stroke-red-600" />
        <span className="text-[10px] font-bold tracking-wide uppercase group-hover:text-red-600">Keluar</span>
      </button>

    </div>
  );
};
