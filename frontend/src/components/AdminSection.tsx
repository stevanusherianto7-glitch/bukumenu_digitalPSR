import React, { useState, useEffect, useMemo } from 'react';
import { Settings, RotateCcw, Save, X, AlertCircle, Plus, Utensils, Image as ImageIcon, Link, ChevronDown, Check } from 'lucide-react';
import { MenuItem } from '../types';
import { AdminMenuCard } from './AdminMenuCard';
import { CategoryFilter } from './CategoryFilter'; 
import { ImageEditor } from './ImageEditor';

interface AdminSectionProps {
  items: MenuItem[]; 
  headerImage: string; 
  category: string; 
  categories: string[]; // List Kategori Dinamis
  onCategoryChange: (category: string) => void;
  onSaveAll: (items: MenuItem[], newHeaderImage: string | null) => void;
  onResetData: () => void;
  onAddCategory: (newCategory: string) => void; // Handler Baru
  onDeleteItem: (id: string) => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ 
  items, 
  headerImage, 
  category, 
  categories,
  onCategoryChange, 
  onSaveAll, 
  onResetData,
  onAddCategory,
  onDeleteItem
}) => {
  // Header Editor State
  const [headerUrlInput, setHeaderUrlInput] = useState(headerImage);
  const [headerUrlError, setHeaderUrlError] = useState(false);

  // Add Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Local Draft State
  const [draftItems, setDraftItems] = useState<MenuItem[]>(items);
  const [draftHeaderImage, setDraftHeaderImage] = useState<string | null>(null);

  // Sync draft when parent items change (e.g., after a save)
  useEffect(() => {
    setDraftItems(items);
  }, [items]);
  
  useEffect(() => {
    setDraftHeaderImage(null);
    setHeaderUrlInput(headerImage);
  }, [headerImage]);

  // Check for unsaved changes (now includes header image)
  const hasUnsavedChanges = useMemo(() => {
    const itemsChanged = JSON.stringify(items) !== JSON.stringify(draftItems);
    const headerChanged = draftHeaderImage !== null;
    return itemsChanged || headerChanged;
  }, [items, draftItems, draftHeaderImage]);

  const SHORTCUT_CATEGORIES = ['Terlaris', 'Makanan', 'Minuman'];

  const handleHeaderUrlApply = () => {
    const trimmed = headerUrlInput.trim();
    if (!trimmed.startsWith('http')) {
      setHeaderUrlError(true);
      return;
    }
    setHeaderUrlError(false);
    setDraftHeaderImage(trimmed);
  };

  // --- MENU HANDLERS ---
  const handleDraftUpdate = (id: string, updates: Partial<MenuItem>) => {
    setDraftItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleAddDraftItem = () => {
    let targetCategory = category;
    if (category === 'Terlaris') {
      targetCategory = 'Makanan';
      onCategoryChange('Makanan');
    }
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: 'Menu Baru',
      description: 'Deskripsi menu baru',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      category: targetCategory,
      isFavorite: false,
      isAvailable: true,
    };
    setDraftItems(prev => [newItem, ...prev]);
  };

  const handleDiscard = () => {
    if (window.confirm('Batalkan semua perubahan yang belum disimpan?')) {
      setDraftItems(items);
      setDraftHeaderImage(null); // Also reset header draft
    }
  };

  const handleSave = () => {
    onSaveAll(draftItems, draftHeaderImage);
  };

  const submitNewCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddingCategory(false);
    onCategoryChange(newCategoryName.trim());
  };

  const displayItems = useMemo(() => {
    if (category === 'Terlaris') {
      return draftItems.filter(item => item.isFavorite);
    }
    if (category === 'Menu Baru') {
        return draftItems.filter(item => item.isNew);
    } 
    return draftItems.filter(item => item.category === category);
  }, [draftItems, category]);

  return (
    <div className="mt-2 relative">
      

      <div className="sticky top-0 z-40 mb-4">
        <div className={`p-3 rounded-xl shadow-xl flex items-center justify-between gap-3 transition-colors duration-300 ${hasUnsavedChanges ? 'bg-pawon-dark text-white' : 'bg-white text-pawon-dark border border-gray-100'}`}>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <AlertCircle size={18} className="text-orange-400 shrink-0" />
            ) : (
              <Check size={18} className="text-green-500 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-none mb-0.5">
                {hasUnsavedChanges ? 'Belum Disimpan' : 'Semua Tersimpan'}
              </span>
              <span className={`text-[10px] leading-none ${hasUnsavedChanges ? 'opacity-80' : 'text-gray-400'}`}>
                {hasUnsavedChanges ? 'Segera simpan data' : 'Data menu sudah sinkron'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasUnsavedChanges && (
              <button 
                onClick={handleDiscard}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Batalkan"
              >
                <X size={16} />
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="px-3 py-1.5 rounded-lg bg-pawon-accent font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <Save size={14} /> Simpan
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-[24px] shadow-xl border border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pawon-accent/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-pawon-accent/20 transition-all duration-700"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-pawon-accent border border-white/10 shadow-inner backdrop-blur-md">
            <Settings size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-white leading-none mb-1">Manager Dashboard</h2>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Pawon Salam • Admin Console</p>
          </div>
        </div>
        
        <button 
          onClick={onResetData}
          className="relative z-10 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 border border-white/5"
          title="Reset Data"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Menu</span>
              <span className="text-xl font-bold text-gray-900">{draftItems.length}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Habis</span>
              <span className="text-xl font-bold text-red-500">{draftItems.filter(i => !i.isAvailable).length}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Kategori</span>
              <span className="text-xl font-bold text-pawon-accent">{categories.length}</span>
          </div>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
           <ImageIcon size={16} className="text-pawon-accent" />
           <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider">Foto Header Utama</h3>
        </div>
        
        <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
           <img 
              src={draftHeaderImage || headerImage} 
              alt="Current Header" 
              className="w-full h-full object-cover"
           />
        </div>

        {/* URL Input untuk Header */}
        <div className="flex gap-2">
          <input
            type="url"
            value={headerUrlInput}
            onChange={(e) => { setHeaderUrlInput(e.target.value); setHeaderUrlError(false); }}
            onBlur={handleHeaderUrlApply}
            onKeyDown={(e) => e.key === 'Enter' && handleHeaderUrlApply()}
            className={`flex-1 text-[10px] text-pawon-dark border rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-pawon-accent ${
              headerUrlError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-pawon-accent'
            }`}
            placeholder="https://...supabase.co/storage/v1/object/public/menu-images/..."
          />
          <button
            onClick={handleHeaderUrlApply}
            className="px-3 py-2 bg-pawon-accent text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-orange-700 transition-colors shrink-0"
          >
            <Link size={10}/> Terapkan
          </button>
        </div>
        {headerUrlError && <p className="text-[9px] text-red-500 mt-1">URL tidak valid. Harus dimulai dengan https://</p>}
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Upload foto ke Supabase Storage → salin URL Public → paste di atas
        </p>
      </div>

      <div className="mb-4 sticky top-[72px] bg-pawon-bg/95 backdrop-blur-sm z-20 pt-2 pb-1 -mx-4 px-4">
        <CategoryFilter 
           categories={SHORTCUT_CATEGORIES} 
           selectedCategory={category} 
           onSelect={onCategoryChange} 
        />
      </div>

      <div className="flex flex-col gap-3 mb-4 mt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-pawon-dark leading-none">
              Daftar Menu
            </h3>
            <p className="text-[10px] text-pawon-textGray mt-1">
              Edit: <span className="font-bold text-pawon-accent">{category}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isAddingCategory && (
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-pawon-dark flex items-center justify-center hover:bg-pawon-accent hover:text-white transition-colors"
                title="Tambah Kategori Baru"
              >
                <Plus size={16} />
              </button>
            )}

            <div className="relative group">
              <select
                title="Filter kategori menu"
                aria-label="Filter kategori menu"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-pawon-dark text-xs font-bold py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pawon-accent/20 focus:border-pawon-accent cursor-pointer hover:bg-gray-50 transition-colors max-w-[140px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-pawon-accent transition-colors">
                <ChevronDown size={14} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {isAddingCategory && (
          <div className="bg-white p-3 rounded-xl border border-pawon-accent/30 shadow-sm animate-in fade-in slide-in-from-top-1">
            <label className="text-[10px] font-bold text-pawon-accent uppercase mb-1 block">Tambah Kategori Baru</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Contoh: Dessert"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-pawon-accent focus:ring-1 focus:ring-pawon-accent"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && submitNewCategory()}
              />
              <button 
                title="Batalkan"
                aria-label="Batalkan tambah kategori"
                onClick={() => setIsAddingCategory(false)}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
              <button 
                title="Simpan kategori baru"
                aria-label="Simpan kategori baru"
                onClick={submitNewCategory}
                disabled={!newCategoryName.trim()}
                className="px-3 py-2 rounded-lg bg-pawon-accent text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Adding Menu */}
      <div className="fixed bottom-28 right-6 z-50">
        <button 
          onClick={handleAddDraftItem}
          className="w-16 h-16 rounded-full bg-pawon-accent text-white flex items-center justify-center shadow-[0_8px_25px_rgba(255,107,0,0.4)] hover:bg-orange-700 active:scale-90 transition-all duration-300"
          title="Tambah Menu Baru (Draft)"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-32">
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <AdminMenuCard 
              key={item.id} 
              item={item} 
              onUpdate={handleDraftUpdate}
              onDelete={onDeleteItem}
              availableCategories={categories}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-10 text-gray-400 text-sm">
            Tidak ada menu di kategori ini.
          </div>
        )}
      </div>
    </div>
  );
};