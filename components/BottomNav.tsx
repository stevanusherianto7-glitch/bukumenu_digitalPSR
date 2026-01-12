
import React from 'react';
import { BookOpen, Settings, LogOut } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'menu' | 'admin';
  onTabChange: (tab: 'menu' | 'admin') => void;
  onExitAdmin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onExitAdmin }) => {
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-2 flex justify-around items-center z-50 max-w-[480px] mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      {/* Tab Menu */}
      <button 
        type="button"
        onClick={() => onTabChange('menu')}
        className={`flex-1 flex flex-col items-center gap-1 transition-colors duration-300 ${activeTab === 'menu' ? 'text-pawon-accent' : 'text-gray-400'}`}
      >
        <BookOpen size={24} strokeWidth={activeTab === 'menu' ? 2.5 : 2} />
        <span className="text-[10px] font-bold tracking-wide uppercase">Menu</span>
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
