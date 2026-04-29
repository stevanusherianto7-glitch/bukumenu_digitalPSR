
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Users, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { WaiterTableSection } from '../components/WaiterTableSection';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  // Render konten dashboard spesifik role
  const renderContent = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'OWNER':
        return <OwnerDashboard />;
      case 'RESTAURANT_MANAGER':
      case 'STAFF_FOH':
      case 'STAFF_BOH':
        return <WaiterTableSection />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang, {user.name.split(' ')[0]}!</h1>
        <p className="text-gray-500">Berikut adalah ringkasan operasional Anda hari ini.</p>
      </div>
      {renderContent()}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="text-white" size={20} />
    </div>
  </div>
);

const OwnerDashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <StatCard title="Total Karyawan" value="124" icon={Users} color="bg-blue-500" />
    <StatCard title="Kehadiran Hari Ini" value="98%" icon={Clock} color="bg-green-500" />
    <StatCard title="Total Payroll (Bulan Ini)" value="Rp 450jt" icon={DollarSign} color="bg-purple-500" />
    <StatCard title="Revenue Cabang" value="+12%" icon={TrendingUp} color="bg-orange-500" />
  </div>
);

const DefaultDashboard = () => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Tampilan Dashboard Anda</h2>
        <p className="text-gray-500 mt-2">
            Fitur dan statistik yang relevan dengan peran Anda akan ditampilkan di sini.
        </p>
    </div>
);
