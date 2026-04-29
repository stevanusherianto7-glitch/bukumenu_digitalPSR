
import React, { useState } from 'react';
import { Package, Plus, Search, AlertTriangle, ArrowUpRight, ArrowDownRight, History, Settings, Trash2 } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import { Ingredient } from '../types';

export const StockManagementSection: React.FC = () => {
  const { ingredients, transactions, updateStock, setIngredients } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [newIng, setNewIng] = useState<Partial<Ingredient>>({
    name: '',
    unit: 'Kg',
    currentStock: 0,
    safetyStock: 0,
    pricePerUnit: 0
  });

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIngredient = () => {
    if (!newIng.name) return;
    const ingredient: Ingredient = {
      id: Math.random().toString(36).substr(2, 9),
      name: newIng.name as string,
      unit: newIng.unit as any,
      currentStock: newIng.currentStock || 0,
      safetyStock: newIng.safetyStock || 0,
      pricePerUnit: newIng.pricePerUnit || 0
    };
    setIngredients([...ingredients, ingredient]);
    setIsAddingIngredient(false);
    setNewIng({ name: '', unit: 'Kg', currentStock: 0, safetyStock: 0, pricePerUnit: 0 });
  };

  const handleAdjustStock = (id: string, amount: number, type: 'IN' | 'OUT') => {
    updateStock(id, amount, type, 'Manual Adjustment');
  };

  const handleDeleteIngredient = (id: string) => {
    if (window.confirm('Hapus bahan baku ini?')) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6 bg-gradient-to-br from-pawon-primary to-pawon-dark p-6 rounded-[24px] shadow-xl border border-white/10 relative overflow-hidden group">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-pawon-accent border border-white/10 shadow-inner backdrop-blur-md">
            <Package size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-white leading-none mb-1">Stok & Gudang</h2>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Resto ERP Engine</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddingIngredient(true)}
          className="relative z-10 w-10 h-10 rounded-xl bg-pawon-accent flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-all active:scale-90"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Cari bahan baku..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pawon-accent/20 focus:border-pawon-accent"
          />
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
            <AlertTriangle size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-orange-800 uppercase block leading-none mb-1">Peringatan Stok</span>
            <span className="text-xs font-bold text-orange-900">
              {ingredients.filter(ing => ing.currentStock <= ing.safetyStock).length} Bahan hampir habis
            </span>
          </div>
        </div>
      </div>

      {/* Ingredient List */}
      <div className="space-y-3 mb-8">
        {filteredIngredients.map((ing) => (
          <div key={ing.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{ing.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Satuan: {ing.unit}</p>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${ing.currentStock <= ing.safetyStock ? 'text-red-500' : 'text-emerald-600'}`}>
                  {ing.currentStock.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 ml-1 font-bold">{ing.unit}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
               <button 
                onClick={() => {
                  const amount = prompt('Jumlah stok masuk:');
                  if (amount) handleAdjustStock(ing.id, Number(amount), 'IN');
                }}
                className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
               >
                 <ArrowUpRight size={14} /> Stok Masuk
               </button>
               <button 
                onClick={() => {
                  const amount = prompt('Jumlah stok keluar:');
                  if (amount) handleAdjustStock(ing.id, Number(amount), 'OUT');
                }}
                className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-100 transition-colors"
               >
                 <ArrowDownRight size={14} /> Stok Keluar
               </button>
               <button 
                onClick={() => handleDeleteIngredient(ing.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
               >
                 <Trash2 size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Ingredient Modal (Overlay) */}
      {isAddingIngredient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Tambah Bahan Baku</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nama Bahan</label>
                <input 
                  type="text" 
                  value={newIng.name}
                  onChange={(e) => setNewIng({...newIng, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-pawon-accent focus:outline-none"
                  placeholder="Contoh: Ayam Karkas"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Satuan</label>
                  <select 
                    value={newIng.unit}
                    onChange={(e) => setNewIng({...newIng, unit: e.target.value as any})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-pawon-accent focus:outline-none bg-white"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="L">L</option>
                    <option value="Ml">Ml</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">HPP / Unit</label>
                  <input 
                    type="number" 
                    value={newIng.pricePerUnit}
                    onChange={(e) => setNewIng({...newIng, pricePerUnit: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-pawon-accent focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Stok Awal</label>
                  <input 
                    type="number" 
                    value={newIng.currentStock}
                    onChange={(e) => setNewIng({...newIng, currentStock: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-pawon-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Safety Stock</label>
                  <input 
                    type="number" 
                    value={newIng.safetyStock}
                    onChange={(e) => setNewIng({...newIng, safetyStock: Number(e.target.value)})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-pawon-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsAddingIngredient(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleAddIngredient}
                className="flex-1 py-3 text-sm font-bold text-white bg-pawon-accent rounded-2xl shadow-lg shadow-orange-600/20 hover:bg-orange-600 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
