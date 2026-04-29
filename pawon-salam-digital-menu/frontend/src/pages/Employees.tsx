
import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Users, Search, MoreVertical, Loader2 } from 'lucide-react';

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees');
        setEmployees(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat data karyawan.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Karyawan</h1>
          <p className="text-gray-500">Lihat, tambah, dan kelola semua karyawan Anda.</p>
        </div>
        <button className="bg-gray-900 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-black transition-colors">
          <Plus size={18} /> Tambah Karyawan
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-500" />
            <h3 className="font-bold text-lg">Daftar Karyawan ({employees.length})</h3>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Cari nama atau email..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3">Cabang</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tgl Bergabung</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{emp.employeeProfile?.position}</p>
                      <p className="text-xs text-gray-500">{emp.employeeProfile?.department}</p>
                    </td>
                    <td className="px-4 py-3">{emp.restaurant?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        emp.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.isActive ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(emp.employeeProfile.joinDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-2 rounded-full hover:bg-gray-200">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
