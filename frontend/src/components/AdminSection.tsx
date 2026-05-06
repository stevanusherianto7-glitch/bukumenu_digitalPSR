import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { AdminMenuCard } from './AdminMenuCard';
import { CategoryFilter } from './CategoryFilter'; 

// New Admin Sub-components
import { AdminDashboardHeader } from './admin/AdminDashboardHeader';

import { HeaderImageEditor } from './admin/HeaderImageEditor';
import { CategoryManager } from './admin/CategoryManager';

interface AdminSectionProps {
  items: MenuItem[]; 
  headerImage: string; 
  category: string; 
  categories: string[]; 
  onCategoryChange: (category: string) => void;
  onSaveAll: (items: MenuItem[], newHeaderImage: string | null) => void;
  onResetData: () => void;
  onAddCategory: (newCategory: string) => void; 
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
  // Local Draft State
  const [draftItems, setDraftItems] = useState<MenuItem[]>(items);
  const [draftHeaderImage, setDraftHeaderImage] = useState<string | null>(null);

  useEffect(() => {
    setDraftItems(items);
  }, [items]);
  
  useEffect(() => {
    setDraftHeaderImage(null);
  }, [headerImage]);

  const hasUnsavedChanges = useMemo(() => {
    const itemsChanged = JSON.stringify(items) !== JSON.stringify(draftItems);
    const headerChanged = draftHeaderImage !== null;
    return itemsChanged || headerChanged;
  }, [items, draftItems, draftHeaderImage]);

  const SHORTCUT_CATEGORIES = ['Terlaris', 'Makanan', 'Minuman'];

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
      setDraftHeaderImage(null);
    }
  };

  const displayItems = useMemo(() => {
    if (category === 'Terlaris') return draftItems.filter(item => item.isFavorite);
    if (category === 'Menu Baru') return draftItems.filter(item => item.isNew);
    return draftItems.filter(item => item.category === category);
  }, [draftItems, category]);

  return (
    <div className="mt-2 relative">
      <AdminDashboardHeader 
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={() => onSaveAll(draftItems, draftHeaderImage)}
        onDiscard={handleDiscard}
        onReset={onResetData}
      />



      <HeaderImageEditor 
        currentImage={draftHeaderImage || headerImage}
        onApplyUrl={(url) => setDraftHeaderImage(url)}
      />

      <div className="mb-4 sticky top-[72px] bg-pawon-bg/95 backdrop-blur-sm z-20 pt-2 pb-1 -mx-4 px-4">
        <CategoryFilter 
           categories={SHORTCUT_CATEGORIES} 
           selectedCategory={category} 
           onSelect={onCategoryChange} 
        />
      </div>

      <CategoryManager 
        currentCategory={category}
        categories={categories}
        onCategoryChange={onCategoryChange}
        onAddCategory={onAddCategory}
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-28 right-6 z-50">
        <button 
          onClick={handleAddDraftItem}
          className="w-16 h-16 rounded-full bg-pawon-accent text-white flex items-center justify-center shadow-[0_8px_25px_rgba(255,107,0,0.4)] hover:bg-orange-700 active:scale-90 transition-all duration-300"
          title="Tambah Menu Baru"
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