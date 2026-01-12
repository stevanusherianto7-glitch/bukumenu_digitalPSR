
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CategoryFilter } from './components/CategoryFilter';
import { MenuSection } from './components/MenuSection';
import { AdminSection } from './components/AdminSection';
import { BottomNav } from './components/BottomNav';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PromoCarousel } from './components/PromoCarousel';
import { Cart } from './components/Cart';
import { useCartStore } from './store/cartStore';
import { MenuItem } from './types';
import { getMenuItems, saveMenuItems, deleteMenuItems } from './db';
import { Loader2 } from 'lucide-react';
import { MENU_ITEMS, CATEGORIES } from './data'; // Import local data as fallback
import { api, BACKEND_URL } from './api';

const App: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlMode = searchParams.get('mode');
  const tableNumber = searchParams.get('meja'); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cart Store
  const { addItem, totalItems, clearCart } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Simplified admin mode
  const [isAdminMode, setIsAdminMode] = useState(() => {
    if (urlMode === 'admin') {
      localStorage.setItem('pawon_admin_mode', 'true');
      return true;
    }
    return localStorage.getItem('pawon_admin_mode') === 'true';
  });

  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Load initial data from IndexedDB, with local data.ts as fallback
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const storedItems = await getMenuItems();
        const baseItems = storedItems || MENU_ITEMS;
        
        // If it's the first run, populate IndexedDB with default data
        if (!storedItems) {
          await saveMenuItems(MENU_ITEMS);
        }

        const storedCategories = localStorage.getItem('pawon_categories_custom');
        setCategories(storedCategories ? JSON.parse(storedCategories) : CATEGORIES);

        // No more image hydration needed, URLs are now permanent from the server
        setItems(baseItems);

      } catch (error) {
        console.error("Gagal memuat data menu:", error);
        alert('Gagal memuat menu. Coba muat ulang halaman.');
        setItems(MENU_ITEMS); // Fallback to static data on error
        setCategories(CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const DEFAULT_HEADER_IMG = "https://images.unsplash.com/photo-1572656631137-7935297eff55?auto-format&fit=crop&w=800&q=80";
  const [headerImage, setHeaderImage] = useState<string>(DEFAULT_HEADER_IMG);

  useEffect(() => {
    const storedHeaderUrl = localStorage.getItem('pawon_header_image');
    if (storedHeaderUrl) {
      setHeaderImage(storedHeaderUrl);
    }
  }, []);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');
  const [activeTab, setActiveTab] = useState<'menu' | 'admin'>('menu');

  const SHORTCUT_CATEGORIES = ['Terlaris', 'Menu Baru', 'Paket Keluarga'];

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (!isAdminMode) setActiveTab('menu');
  }, [isAdminMode]);

  const handleAddCategory = (newCategoryName: string) => {
    if (categories.includes(newCategoryName)) {
      alert('Kategori tersebut sudah ada!');
      return;
    }
    const updatedCategories = [...categories, newCategoryName];
    setCategories(updatedCategories);
    localStorage.setItem('pawon_categories_custom', JSON.stringify(updatedCategories));
    alert(`Kategori "${newCategoryName}" berhasil ditambahkan!`);
  };

  const handleAddToCart = (item: MenuItem, quantity: number, notes: string) => {
    addItem(item, quantity, notes);
    setSelectedItem(null);
    setIsCartOpen(true);
  };
  
  const handleConfirmOrder = () => {
    const cartItems = useCartStore.getState().items;
    if (cartItems.length === 0) return;

    const tableInfo = tableNumber ? `dari Meja ${tableNumber}` : 'untuk Take Away';
    alert(`Pesanan ${tableInfo} telah dikirim ke dapur! Mohon tunggu sebentar.`);
    
    clearCart();
    setIsCartOpen(false);
  };

  const handleSaveAllItems = async (newItems: MenuItem[]) => {
    try {
      const itemsToSave = newItems.map(draftItem => {
        // Now, we save the permanent URLs from the backend directly.
        // The logic to handle blob: URLs is no longer needed here,
        // as the upload component provides a permanent URL.
        return { ...draftItem, updatedAt: new Date() };
      });

      await saveMenuItems(itemsToSave);
      
      setItems(newItems);
      alert('Sukses! Perubahan menu telah disimpan.');
      setActiveTab('menu');
    } catch (error)
 {
      console.error("Gagal menyimpan menu ke IndexedDB:", error);
      alert('Gagal menyimpan perubahan. Penyimpanan browser mungkin penuh.');
    }
  };

  const handleUpdateHeaderImage = async (newImageBase64: string) => {
    try {
      const response = await api.post('/upload', { image: newImageBase64 });
      const newImageUrl = BACKEND_URL + response.data.url;
      
      setHeaderImage(newImageUrl);
      localStorage.setItem('pawon_header_image', newImageUrl);
      alert('Foto Header Berhasil Diperbarui!');
    } catch (error) {
      console.error("Gagal mengunggah foto header:", error);
      alert('Gagal menyimpan foto header. Pastikan server backend berjalan.');
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Yakin reset semua data ke pengaturan awal? Semua perubahan dan foto yang diunggah akan hilang.')) {
      setIsLoading(true);
      
      localStorage.removeItem('pawon_categories_custom');
      localStorage.removeItem('pawon_header_image');
      
      try {
        await deleteMenuItems(); // Clear menu data from DB
      } catch (error) {
        console.error("Gagal menghapus data dari DB:", error);
      }
      
      alert('Data lokal berhasil di-reset! Memuat ulang aplikasi...');
      window.location.reload();
    }
  };

  const handleEnterAdmin = () => {
    setIsAdminMode(true);
    localStorage.setItem('pawon_admin_mode', 'true');
    alert('Mode Kelola Diaktifkan!');
  };

  const handleExitAdmin = () => {
    localStorage.removeItem('pawon_admin_mode');
    setIsAdminMode(false);
    setActiveTab('menu');
    if (window.location.search.includes('mode=admin')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      window.history.replaceState({}, '', url.toString());
    }
    window.scrollTo(0,0);
  };

  const handleSecretTrigger = () => {
    if (isAdminMode) {
      handleExitAdmin();
    } else {
      handleEnterAdmin();
    }
  };

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Terlaris') {
      return items.filter(item => item.isFavorite);
    } 
    return items.filter(item => item.category === selectedCategory);
  }, [selectedCategory, items]);

  return (
    <div className="min-h-screen bg-pawon-bg flex justify-center">
      {selectedItem && (
        <ProductDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={handleAddToCart}
        />
      )}

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onConfirmOrder={handleConfirmOrder} />

      <div className="w-full max-w-[480px] bg-pawon-bg h-screen shadow-2xl overflow-hidden flex flex-col relative">
        
        {activeTab === 'menu' && (
          <div className="flex-none px-6 z-20 bg-pawon-bg pt-0 relative">
             <PromoCarousel 
                headerImage={headerImage}
                onSecretAdminTrigger={handleSecretTrigger} 
                tableNumber={tableNumber || undefined}
                cartItemCount={totalItems}
                onCartClick={() => setIsCartOpen(true)}
             />
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className={`flex-1 px-6 overflow-y-auto no-scrollbar scroll-smooth ${isAdminMode ? 'pb-24' : 'pb-6'}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-pawon-accent" size={48} />
            </div>
          ) : (
            <>
              {/* Menu View */}
              <div className={activeTab === 'menu' ? 'block' : 'hidden'}>
                <div className="sticky top-0 z-30 bg-pawon-bg/95 backdrop-blur-sm pt-2 pb-1 -mx-6 px-6">
                  <CategoryFilter 
                    categories={SHORTCUT_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                  />
                </div>
                
                <MenuSection 
                  items={filteredItems} 
                  onItemClick={setSelectedItem}
                  onAddToCart={(item) => addItem(item, 1)}
                  selectedCategory={selectedCategory}
                  allCategories={categories}
                  onCategoryChange={setSelectedCategory}
                />
              </div>

              {/* Admin View */}
              {isAdminMode && (
                  <div className={activeTab === 'admin' ? 'block' : 'hidden'}>
                    <AdminSection 
                        items={items} 
                        headerImage={headerImage}
                        category={selectedCategory}
                        categories={categories}
                        onCategoryChange={setSelectedCategory} 
                        onSaveAll={handleSaveAllItems}
                        onUpdateHeaderImage={handleUpdateHeaderImage}
                        onResetData={handleResetData}
                        onAddCategory={handleAddCategory}
                      />
                  </div>
              )}
            </>
          )}
        </div>

        {isAdminMode && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onExitAdmin={handleExitAdmin} 
          />
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
