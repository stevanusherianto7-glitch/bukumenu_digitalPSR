
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings, RotateCcw, QrCode, Download, Save, X, AlertCircle, Plus, Smartphone, Utensils, Info, Image as ImageIcon, Camera, ChevronDown, Check } from 'lucide-react';
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
  onSaveAll: (items: MenuItem[]) => void;
  onUpdateHeaderImage: (url: string) => void;
  onResetData: () => void;
  onAddCategory: (newCategory: string) => void; // Handler Baru
}

export const AdminSection: React.FC<AdminSectionProps> = ({ 
  items, 
  headerImage, 
  category, 
  categories,
  onCategoryChange, 
  onSaveAll, 
  onUpdateHeaderImage, 
  onResetData,
  onAddCategory
}) => {
  const [showQrGenerator, setShowQrGenerator] = useState(false);
  const [qrMode, setQrMode] = useState<'table' | 'app'>('table');
  const [tableInput, setTableInput] = useState('A1');
  
  // Header Editor State
  const [showHeaderEditor, setShowHeaderEditor] = useState(false);
  const [headerEditorSource, setHeaderEditorSource] = useState<string | null>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  // Add Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Local Draft State
  const [draftItems, setDraftItems] = useState<MenuItem[]>(items);

  // Sync draft when parent items change
  useEffect(() => {
    setDraftItems(items);
  }, [items]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(items) !== JSON.stringify(draftItems);
  }, [items, draftItems]);

  // Shortcut Categories untuk Admin (Sama seperti Menu Utama)
  const SHORTCUT_CATEGORIES = ['Terlaris', 'Menu Baru', 'Paket Keluarga'];

  // QR Logic
  const baseUrl = window.location.origin + window.location.pathname;
  const qrData = qrMode === 'table' ? `${baseUrl}?meja=${tableInput}` : baseUrl;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&color=3E342D&bgcolor=FDFBF7`;
  const downloadName = qrMode === 'table' ? `QR-Meja-${tableInput}.png` : `QR-PawonSalam-App.png`;

  // --- HEADER IMAGE HANDLERS ---
  const handleHeaderFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHeaderEditorSource(event.target.result as string);
          setShowHeaderEditor(true);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (headerInputRef.current) {
      headerInputRef.current.value = '';
    }
  };

  const handleHeaderEditorSave = (base64: string) => {
    onUpdateHeaderImage(base64);
    setShowHeaderEditor(false);
    setHeaderEditorSource(null);
  };

  // --- MENU HANDLERS ---
  const handleDraftUpdate = (id: string, updates: Partial<MenuItem>) => {
    setDraftItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  // Handle Add Draft Item (Local)
  const handleAddDraftItem = () => {
    let targetCategory = category;

    // If currently on a view-only category like 'Terlaris', defaulting to 'Makanan Utama'
    if (category === 'Terlaris') {
      targetCategory = 'Makanan Utama';
      onCategoryChange('Makanan Utama');
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: 'Menu Baru',
      description: 'Deskripsi menu baru',
      price: 0,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      category: targetCategory,
      isFavorite: false,
    };
    setDraftItems(prev => [newItem, ...prev]);
  };

  // Handle Discard
  const handleDiscard = () => {
    if (window.confirm('Batalkan semua perubahan yang belum disimpan?')) {
      setDraftItems(items);
    }
  };

  // Handle Save
  const handleSave = () => {
    onSaveAll(draftItems);
  };

  // Handle Add Category
  const submitNewCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddingCategory(false);
    // Switch view to the new category
    onCategoryChange(newCategoryName.trim());
  };

  // Filter items
  const displayItems = useMemo(() => {
    if (category === 'Terlaris') {
      return draftItems.filter(item => item.isFavorite);
    } 
    return draftItems.filter(item => item.category === category);
  }, [draftItems, category]);

  return (
    <div className="mt-2 relative">
      
      {/* HEADER EDITOR COMPONENT */}
      {showHeaderEditor && headerEditorSource && (
        <ImageEditor 
          imageSrc={headerEditorSource}
          onSave={handleHeaderEditorSave}
          onCancel={() => { setShowHeaderEditor(false); setHeaderEditorSource(null); }}
        />
      )}

      {/* Save Bar (Sticky Top/Floating) */}
      {hasUnsavedChanges && (
        <div className="sticky top-0 z-40 mb-4 animate-in slide-in-from-top-2">
          <div className="bg-pawon-dark text-white p-3 rounded-xl shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-none mb-0.5">Belum Disimpan</span>
                <span className="text-[10px] opacity-80 leading-none">Segera simpan data</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handleDiscard}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Batalkan"
              >
                <X size={16} />
              </button>
              <button 
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg bg-pawon-accent font-bold text-xs flex items-center gap-1.5 shadow-lg hover:bg-orange-700 transition-colors"
              >
                <Save size={14} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
        <div className="flex items-center gap-3 text-pawon-dark">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pawon-accent shadow-sm">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold leading-none">Mode Kelola</h2>
            <p className="text-xs text-pawon-accent/80 mt-1 font-medium">Edit data & QR Code</p>
          </div>
        </div>
        
        <button 
          onClick={onResetData}
          className="flex flex-col items-center justify-center w-12 text-pawon-accent hover:text-red-600 transition-colors"
          title="Reset Data ke Awal"
        >
          <RotateCcw size={18} />
          <span className="text-[9px] font-bold uppercase mt-1">Reset</span>
        </button>
      </div>

      {/* --- HEADER IMAGE SETTING --- */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
           <ImageIcon size={16} className="text-pawon-accent" />
           <h3 className="font-bold text-sm text-pawon-dark uppercase tracking-wider">Foto Header Utama</h3>
        </div>
        
        <div className="relative w-full h-32 rounded-lg overflow-hidden group">
           <img 
              src={headerImage} 
              alt="Current Header" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
           />
           <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <input 
                type="file" 
                ref={headerInputRef}
                onChange={handleHeaderFileChange}
                accept="image/*"
                className="hidden" 
              />
              <button 
                 onClick={() => headerInputRef.current?.click()}
                 className="bg-white text-pawon-dark px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-pawon-accent hover:text-white transition-colors shadow-lg"
              >
                 <Camera size={14} /> Ganti Foto Header
              </button>
           </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Disarankan menggunakan foto landscape (lebar) resolusi tinggi.
        </p>
      </div>

      {/* QR Code Generator Toggle */}
      <div className="mb-6">
        <button 
          onClick={() => setShowQrGenerator(!showQrGenerator)}
          className="w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between group hover:border-pawon-accent transition-all"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${showQrGenerator ? 'bg-pawon-accent text-white' : 'bg-gray-100 text-pawon-dark'}`}>
              <QrCode size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-serif font-bold text-pawon-dark">Generator QR Code</h3>
              <p className="text-xs text-pawon-textGray">Cetak QR Meja atau Link Aplikasi</p>
            </div>
          </div>
          <span className="text-2xl text-gray-300 font-light group-hover:text-pawon-accent transition-colors">
            {showQrGenerator ? '−' : '+'}
          </span>
        </button>

        {/* QR Code Generator Panel */}
        {showQrGenerator && (
          <div className="mt-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col items-center">
              
              {/* Type Switcher */}
              <div className="bg-gray-100 p-1 rounded-lg flex w-full mb-4">
                <button 
                  onClick={() => setQrMode('table')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${qrMode === 'table' ? 'bg-white text-pawon-dark shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  <Utensils size={14} /> Khusus Meja
                </button>
                <button 
                  onClick={() => setQrMode('app')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${qrMode === 'app' ? 'bg-white text-pawon-dark shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  <Smartphone size={14} /> QR Utama (Umum)
                </button>
              </div>

              {/* Table Input (Only visible in Table Mode) */}
              {qrMode === 'table' && (
                <div className="w-full mb-4 animate-in fade-in">
                  <label className="block text-xs font-bold text-pawon-textGray uppercase mb-2">Nomor Meja</label>
                  <input 
                    type="text" 
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 font-bold text-lg text-center text-pawon-dark focus:ring-2 focus:ring-pawon-accent focus:border-pawon-accent outline-none"
                    placeholder="Contoh: A1"
                  />
                </div>
              )}

              {/* Info Text for App Mode */}
              {qrMode === 'app' && (
                <div className="flex gap-2 items-start bg-blue-50 p-3 rounded-lg mb-4 text-left w-full">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    <strong>QR Utama:</strong> Gunakan ini untuk Kasir, Brosur, atau Media Sosial. Tidak ada nomor meja yang terikat, pelanggan bebas memilih tempat duduk.
                  </p>
                </div>
              )}

              {/* QR Display */}
              <div className="bg-[#FDFBF7] p-6 rounded-xl border border-gray-200 mb-4 shadow-inner flex flex-col items-center text-center">
                 {/* Branding Text */}
                 <h3 className="font-serif font-bold text-pawon-dark text-lg mb-1">Pawon Salam Resto</h3>
                 <p className="text-[10px] font-medium text-pawon-accent uppercase tracking-widest mb-4">Buku Menu Digital</p>

                 <img src={qrImageUrl} alt="QR Code Preview" className="w-48 h-48 mix-blend-multiply" />
                 
                 <span className="mt-4 text-[12px] font-bold text-pawon-dark bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                   {qrMode === 'table' ? `Meja ${tableInput}` : 'Scan Menu'}
                 </span>
              </div>
              
              <div className="text-center mb-4 w-full">
                <p className="text-xs text-gray-500 mb-1">Link tujuan:</p>
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-[10px] text-pawon-accent break-all font-mono border border-gray-200">
                  {qrData}
                </div>
              </div>

              <a 
                href={qrImageUrl} 
                download={downloadName}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-pawon-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <Download size={18} /> {qrMode === 'table' ? 'Download QR Meja' : 'Download QR Utama'}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ADMIN SHORTCUT FILTER (LIMITED TO 3) */}
      <div className="mb-4 sticky top-0 bg-pawon-bg/95 backdrop-blur-sm z-20 pt-2 pb-1 -mx-4 px-4">
        <CategoryFilter 
           categories={SHORTCUT_CATEGORIES} 
           selectedCategory={category} 
           onSelect={onCategoryChange} 
        />
      </div>

      {/* Product List Header WITH DROPDOWN & ADD CATEGORY */}
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
            {/* Add Category Trigger Button */}
            {!isAddingCategory && (
              <button 
                onClick={() => setIsAddingCategory(true)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-pawon-dark flex items-center justify-center hover:bg-pawon-accent hover:text-white transition-colors"
                title="Tambah Kategori Baru"
              >
                <Plus size={16} />
              </button>
            )}

            {/* Admin Category Dropdown */}
            <div className="relative group">
              <select
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

        {/* INLINE ADD CATEGORY FORM */}
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
                onClick={() => setIsAddingCategory(false)}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
              <button 
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

      {/* Add New Button (Local Draft) */}
      <button 
        onClick={handleAddDraftItem}
        className="w-full border-2 border-dashed border-gray-200 rounded-[20px] py-4 flex items-center justify-center gap-2 text-pawon-textGray font-medium hover:border-pawon-accent hover:text-pawon-accent transition-colors mb-6 group active:scale-[0.98]"
      >
        <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-pawon-accent/10 flex items-center justify-center transition-colors">
          <Plus size={14} />
        </div>
        Tambah Menu (Draft)
      </button>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 pb-32">
        {displayItems.length > 0 ? (
          displayItems.map((item) => (
            <AdminMenuCard 
              key={item.id} 
              item={item} 
              onUpdate={handleDraftUpdate}
              availableCategories={categories} // PASSING DYNAMIC CATEGORIES
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
