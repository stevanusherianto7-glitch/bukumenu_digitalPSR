
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CategoryFilter } from './components/CategoryFilter';
import { MenuSection } from './components/MenuSection';
import { AdminSection } from './components/AdminSection';
import { BottomNav } from './components/BottomNav';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PromoCarousel } from './components/PromoCarousel';
import { Cart } from './components/Cart';
import { useCartStore } from './store/cartStore';
import { MenuItem } from './types';
import { getAsset, saveAsset, base64ToBlob, getAllMenuItems, saveMenuItems, resetDatabase, deleteAsset } from './indexedDB';
import { Loader2 } from 'lucide-react';
import { MENU_ITEMS as LOCAL_MENU_ITEMS, CATEGORIES as LOCAL_CATEGORIES } from './data'; // Rename import
import { WaiterTableSection } from './components/WaiterTableSection';
import { TableMapSection } from './components/TableMapSection';
import { SalesRecapSection } from './components/SalesRecapSection';
import { SEED_VERSION } from './seed-version';
import { InstallPWA } from './components/InstallPWA'; 
import { WelcomeModal } from './components/WelcomeModal'; 
import api from './api'; // Import API client

const App: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlMode = searchParams.get('mode');
  const tableNumber = searchParams.get('meja'); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addItem, totalItems } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State untuk Welcome Modal
  const [showWelcome, setShowWelcome] = useState(!!tableNumber);

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
  
  // Foto Header Utama: Soto Pindang Kudus
  const DEFAULT_HEADER_IMG = "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";
  
  const [headerImage, setHeaderImage] = useState<string>(DEFAULT_HEADER_IMG);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');
  const [activeTab, setActiveTab] = useState<'meja' | 'peta' | 'laporan' | 'admin'>('meja');

  const SHORTCUT_CATEGORIES = ['Terlaris', 'Makanan', 'Minuman'];

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.imageUrl && item.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.imageUrl);
        }
      });
      if (headerImage && headerImage.startsWith('blob:')) {
        URL.revokeObjectURL(headerImage);
      }
    };
  }, [items, headerImage]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Coba fetch dari API Backend (Cloud) terlebih dahulu
      // Ini memastikan data selalu fresh jika ada koneksi internet
      console.log("Fetching menu from Cloud API...");
      const response = await api.get('/menu');
      
      if (response.data && response.data.items && response.data.items.length > 0) {
          console.log("Cloud menu loaded successfully.");
          setItems(response.data.items);
          setCategories(response.data.categories);
          
          // Opsional: Simpan ke IndexedDB sebagai cache untuk offline selanjutnya
          saveMenuItems(response.data.items);
          localStorage.setItem('pawon_categories_custom', JSON.stringify(response.data.categories));
      } else {
          throw new Error("Empty menu from cloud");
      }
    } catch (apiError) {
      console.warn("Cloud fetch failed or empty, falling back to Local/IndexedDB:", apiError);
      
      // 2. Fallback: Load dari IndexedDB (Offline Mode)
      try {
        const storedItems = await getAllMenuItems();
        
        if (storedItems.length > 0) {
             console.log("Loaded menu from IndexedDB cache.");
             // Hydrate blobs if necessary
             const hydratedItems = await Promise.all(
                storedItems.map(async (item: MenuItem) => {
                  try {
                    const imageBlob = await getAsset('menu_image_' as string + item.id);
                    return imageBlob ? { ...item, imageUrl: URL.createObjectURL(imageBlob) } : item;
                  } catch (error) {
                    return item;
                  }
                })
             );
             setItems(hydratedItems);
             
             const storedCategories = localStorage.getItem('pawon_categories_custom');
             setCategories(storedCategories ? JSON.parse(storedCategories) : LOCAL_CATEGORIES);
        } else {
             // 3. Fallback Terakhir: Load Data Dummy (First Run Offline)
             console.log("IndexedDB empty, loading local seed data.");
             setItems(LOCAL_MENU_ITEMS);
             setCategories(LOCAL_CATEGORIES);
             // Seed DB
             await saveMenuItems(LOCAL_MENU_ITEMS);
        }
      } catch (dbError) {
         console.error("Critical: Failed to load menu.", dbError);
         setItems(LOCAL_MENU_ITEMS);
         setCategories(LOCAL_CATEGORIES);
      }
    } finally {
      // Load Header Image from Local
      const headerImageBlob = await getAsset('headerImage_v2');
      setHeaderImage(headerImageBlob ? URL.createObjectURL(headerImageBlob) : DEFAULT_HEADER_IMG);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory, activeTab]);

  // --- HANDLERS (Perlu disesuaikan untuk sync ke API jika Admin Mode) ---
  
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

  const handleSaveAllItems = async (draftItems: MenuItem[], newHeaderImage: string | null) => {
    setIsLoading(true);
    try {
      if (newHeaderImage) {
        const imageBlob = base64ToBlob(newHeaderImage);
        await saveAsset('headerImage_v2', imageBlob);
      }

      // TODO: Di Production, kirim request PUT/POST ke API per item atau bulk update
      // Saat ini kita simpan ke local DB dulu agar responsif
      await saveMenuItems(draftItems);
      
      // Jika online, coba sync satu per satu (Simple Sync Strategy)
      // Idealnya ini dilakukan di background worker
      try {
          const { token } = await import('./store/authStore').then(m => m.useAuthStore.getState());
          if (token) {
              // Contoh logik sync sederhana: kirim item baru ke cloud
              console.log("Syncing changes to cloud...");
              // Implementasi sync detail akan cukup kompleks, 
              // untuk MVP ini kita update local view dan asumsikan Admin menggunakan Dashboard Web (bukan PWA ini) untuk edit menu global.
          }
      } catch (e) {
          console.warn("Sync to cloud failed", e);
      }

      await loadData(); // Reload
      alert('Perubahan disimpan di perangkat ini.');
      setActiveTab('meja');
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
       setIsLoading(false);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm(`Yakin ingin menghapus menu ini?`)) {
        setIsLoading(true);
        try {
            // Delete Local
            const updatedItems = items.filter(item => item.id !== itemId);
            await saveMenuItems(updatedItems);
            await deleteAsset(`menu_image_${itemId}`);
            setItems(updatedItems);
            
            // Delete Cloud (if logged in)
            try {
                 await api.delete(`/menu/${itemId}`);
            } catch (e) { console.warn("Cloud delete failed or offline"); }

            alert(`Menu berhasil dihapus.`);
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Yakin reset semua data lokal?')) {
      setIsLoading(true);
      try {
        localStorage.removeItem('pawon_categories_custom');
        localStorage.removeItem('SEED_VERSION');
        await resetDatabase();
        window.location.reload(); 
      } catch (error) {
        console.error("Reset failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEnterAdmin = () => {
    setIsAdminMode(true);
    setActiveTab('meja');
    localStorage.setItem('pawon_admin_mode', 'true');
    alert('Mode Kelola Diaktifkan!');
  };

  const exitSpecialMode = () => {
    localStorage.removeItem('pawon_admin_mode');
    setIsAdminMode(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.toString());
    window.scrollTo(0,0);
  };

  const handleSecretTrigger = () => {
    if (isAdminMode) {
      exitSpecialMode();
    } else {
      handleEnterAdmin();
    }
  };

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (selectedCategory === 'Terlaris') {
      return items.filter(item => item.isFavorite);
    }
    if (selectedCategory === 'Menu Baru') {
      return items.filter(item => item.isNew);
    } 
    return items.filter(item => item.category === selectedCategory);
  }, [selectedCategory, items]);

  if (urlMode === 'waiter') {
    return (
      <div className="min-h-screen bg-pawon-bg flex justify-center">
        <div className="w-full max-w-[480px] bg-gray-50 h-screen shadow-2xl overflow-y-auto">
           <WaiterTableSection onExit={exitSpecialMode} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pawon-bg flex justify-center">
      <InstallPWA />

      {showWelcome && tableNumber && !isAdminMode && (
        <WelcomeModal 
          tableNumber={tableNumber} 
          onDismiss={() => setShowWelcome(false)} 
        />
      )}

      {selectedItem && (
        <ProductDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onAddToCart={handleAddToCart}
        />
      )}

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        tableNumber={tableNumber || undefined}
      />

      <div className="w-full max-w-[480px] bg-pawon-bg h-screen shadow-2xl overflow-hidden flex flex-col relative">
        
        {!isAdminMode && (
          <div className="flex-none px-6 z-20 bg-pawon-bg pt-0 relative">
             <PromoCarousel 
                headerImage={headerImage}
                onSecretAdminTrigger={handleSecretTrigger} 
                tableNumber={tableNumber || undefined}
             />
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto no-scrollbar scroll-smooth ${isAdminMode ? 'pb-24' : 'pb-6 px-6'}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full flex-col gap-2">
              <Loader2 className="animate-spin text-pawon-accent" size={48} />
              <p className="text-xs text-gray-400 animate-pulse">Memuat menu terbaru...</p>
            </div>
          ) : (
            <>
              {!isAdminMode && (
                <div>
                  <div className="sticky top-0 z-30 bg-pawon-bg/95 backdrop-blur-sm pt-2 pb-1 -mx-6 px-6">
                    <CategoryFilter 
                      categories={SHORTCUT_CATEGORIES}
                      selectedCategory={selectedCategory}
                      onSelect={setSelectedCategory}
                    />
                  </div>
                  
                  <MenuSection 
                    items={filteredItems} 
                    allItems={items}
                    onItemClick={setSelectedItem}
                    onAddToCart={(item) => addItem(item, 1)}
                    selectedCategory={selectedCategory}
                    allCategories={categories}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>
              )}

              {isAdminMode && (
                <>
                  <div className={activeTab === 'meja' ? 'block' : 'hidden'}>
                    <WaiterTableSection onExit={exitSpecialMode} />
                  </div>
                  <div className={activeTab === 'peta' ? 'block' : 'hidden'}>
                     <TableMapSection />
                  </div>
                  <div className={activeTab === 'laporan' ? 'block' : 'hidden'}>
                     <SalesRecapSection />
                  </div>
                  <div className={activeTab === 'admin' ? 'block' : 'hidden'}>
                     <div className="px-6">
                        <AdminSection 
                            items={items} 
                            headerImage={headerImage}
                            category={selectedCategory}
                            categories={categories}
                            onCategoryChange={setSelectedCategory} 
                            onSaveAll={handleSaveAllItems}
                            onResetData={handleResetData}
                            onAddCategory={handleAddCategory}
                            onDeleteItem={handleDeleteItem}
                          />
                     </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {isAdminMode && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onExitAdmin={exitSpecialMode} 
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
