
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, Role } from '../store/authStore';
import { 
  LayoutDashboard, Users, Building2, CalendarClock, 
  Wallet, Megaphone, UtensilsCrossed, LogOut, Settings 
} from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: Role[];
}

const MENU_ITEMS: MenuItem[] = [
  { 
    label: 'Dashboard', 
    path: '/', 
    icon: LayoutDashboard, 
    roles: ['SUPER_ADMIN', 'OWNER', 'HR_MANAGER', 'RESTAURANT_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER', 'STAFF_FOH', 'STAFF_BOH'] 
  },
  { 
    label: 'Perusahaan & Cabang', 
    path: '/restaurants', 
    icon: Building2, 
    roles: ['SUPER_ADMIN', 'OWNER'] 
  },
  { 
    label: 'Karyawan', 
    path: '/employees', 
    icon: Users, 
    roles: ['SUPER_ADMIN', 'OWNER', 'HR_MANAGER', 'RESTAURANT_MANAGER'] 
  },
  { 
    label: 'Absensi & Jadwal', 
    path: '/attendance', 
    icon: CalendarClock, 
    roles: ['OWNER', 'HR_MANAGER', 'RESTAURANT_MANAGER', 'STAFF_FOH', 'STAFF_BOH'] 
  },
  { 
    label: 'Keuangan & Gaji', 
    path: '/finance', 
    icon: Wallet, 
    roles: ['OWNER', 'FINANCE_MANAGER'] 
  },
  { 
    label: 'Payslip Saya', 
    path: '/payslip', 
    icon: Wallet, 
    roles: ['STAFF_FOH', 'STAFF_BOH', 'RESTAURANT_MANAGER', 'HR_MANAGER'] 
  },
  { 
    label: 'Marketing & Events', 
    path: '/marketing', 
    icon: Megaphone, 
    roles: ['OWNER', 'MARKETING_MANAGER'] 
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const filteredMenu = MENU_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-1">
          <UtensilsCrossed className="text-orange-500" size={28} />
          <h1 className="text-xl font-bold tracking-tight">RestoHRIS</h1>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};
