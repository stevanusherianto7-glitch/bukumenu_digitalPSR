
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Users, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

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
        return <ManagerDashboard />;
      case 'STAFF_FOH':
      case 'STAFF_BOH':
        return <StaffDashboard />;
      default:
        return <p className="text-gray-500">Selamat datang, {user.name}!</p>;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Pantau aktivitas operasional restoran hari ini.</p>
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

const ManagerDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Staff On Shift" value="12/15" icon={Users} color="bg-blue-500" />
      <StatCard title="Late Arrivals" value="3" icon={AlertCircle} color="bg-red-500" />
      <StatCard title="Pending Leave Requests" value="2" icon={Clock} color="bg-yellow-500" />
    </div>
    {/* Jadwal Hari Ini Section */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4">Shift Hari Ini</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Jadwal</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium">Budi Santoso</td>
              <td className="px-4 py-3">Chef (BOH)</td>
              <td className="px-4 py-3">08:00 - 16:00</td>
              <td className="px-4 py-3 text-green-600 font-bold">Present</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-3 font-medium">Siti Aminah</td>
              <td className="px-4 py-3">Waitress (FOH)</td>
              <td className="px-4 py-3">10:00 - 18:00</td>
              <td className="px-4 py-3 text-gray-400">Not Clocked In</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const StaffDashboard = () => (
  <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
    <div className="mb-6">
      <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        <Clock size={32} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-bold">Halo, Selamat Bekerja!</h2>
      <p className="text-gray-500">Kamis, 24 Oktober 2023</p>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-xs text-gray-500">Jadwal Shift</p>
        <p className="font-bold text-lg">09:00 - 17:00</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl">
        <p className="text-xs text-gray-500">Total Jam Kerja</p>
        <p className="font-bold text-lg">34 Jam</p>
      </div>
    </div>

    <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20 active:scale-95 transform transition-transform">
      CLOCK IN SEKARANG
    </button>
  </div>
);
