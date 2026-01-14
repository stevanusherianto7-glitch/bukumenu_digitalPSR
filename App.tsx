
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
import { MENU_ITEMS, CATEGORIES } from './data';
import { WaiterTableSection } from './components/WaiterTableSection';
import { TableMapSection } from './components/TableMapSection';
import { SEED_VERSION } from './seed-version';
import { InstallPWA } from './components/InstallPWA'; // Import PWA Installer

const App: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const urlMode = searchParams.get('mode');
  const tableNumber = searchParams.get('meja'); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addItem, totalItems } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);

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
  
  // Foto Header Utama: Soto Pindang Kudus (Hyperrealistic Quality)
  const DEFAULT_HEADER_IMG = "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";
  
  const [headerImage, setHeaderImage] = useState<string>(DEFAULT_HEADER_IMG);
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');
  const [activeTab, setActiveTab] = useState<'meja' | 'peta' | 'admin'>('meja');

  const SHORTCUT_CATEGORIES = ['Terlaris', 'Makanan', 'Minuman'];

  // Cleanup blob URLs to prevent memory leaks
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

  const loadDataFromDB = useCallback(async () => {
    setIsLoading(true);
    try {
      const localVersion = localStorage.getItem('SEED_VERSION');
      let shouldSeed = false;

      // Check version for cache invalidation
      if (localVersion !== SEED_VERSION) {
        console.log(`New version detected (${SEED_VERSION}). Resetting local database...`);
        
        await resetDatabase();
        
        // Clean up legacy localStorage keys
        Object.keys(localStorage).forEach(key => {
           if (key.startsWith('pawon_db_seeded_')) {
             localStorage.removeItem(key);
           }
        });
        localStorage.removeItem('pawon_categories_custom');
        
        localStorage.setItem('SEED_VERSION', SEED_VERSION);
        shouldSeed = true;
      } else {
        const storedItems = await getAllMenuItems();
        if (storedItems.length === 0) {
          shouldSeed = true;
        }
      }

      if (shouldSeed) {
        console.log("Seeding database with fresh data...");
        await Promise.all(MENU_ITEMS.map(async (item) => {
          try {
            if (item.imageUrl.startsWith('http')) {
                const response = await fetch(item.imageUrl);
                if (!response.ok) throw new Error(`Failed to fetch image: ${item.imageUrl}`);
                const blob = await response.blob();
                await saveAsset(`menu_image_${item.id}`, blob);
            }
          } catch (error) {
            console.error(`Could not seed image for ${item.name}:`, error);
          }
        }));
        await saveMenuItems(MENU_ITEMS);
        localStorage.setItem('pawon_categories_custom', JSON.stringify(CATEGORIES));
      }

      // Load data from DB
      const storedItems = await getAllMenuItems();
      const baseItems = storedItems.length > 0 ? storedItems : MENU_ITEMS;

      const storedCategories = localStorage.getItem('pawon_categories_custom');
      setCategories(storedCategories ? JSON.parse(storedCategories) : CATEGORIES);

      const hydratedItems = await Promise.all(
        baseItems.map(async (item: MenuItem) => {
          try {
            const imageBlob = await getAsset('menu_image_' as string + item.id);
            return imageBlob ? { ...item, imageUrl: URL.createObjectURL(imageBlob) } : item;
          } catch (error) {
            return item;
          }
        })
      );
      setItems(hydratedItems);

      const headerImageBlob = await getAsset('headerImage_v2');
      setHeaderImage(headerImageBlob ? URL.createObjectURL(headerImageBlob) : DEFAULT_HEADER_IMG);

    } catch (error) {
      console.error("Failed to load data:", error);
      setItems(MENU_ITEMS);
      setCategories(CATEGORIES);
      setHeaderImage(DEFAULT_HEADER_IMG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromDB();
  }, [loadDataFromDB]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory, activeTab]);

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
      await Promise.all(draftItems.map(async (item) => {
        if (item.imageFile) {
          await saveAsset('menu_image_' + item.id, item.imageFile);
        } else if (item.imageUrl.startsWith('data:image')) {
          const imageBlob = base64ToBlob(item.imageUrl);
          await saveAsset('menu_image_' + item.id, imageBlob);
        }
      }));
      const itemsToSaveInDB = draftItems.map(item => {
        const { imageFile, ...restOfItem } = item;
        const originalItem = MENU_ITEMS.find(i => i.id === restOfItem.id);
        if (originalItem) {
          restOfItem.imageUrl = originalItem.imageUrl;
        } else {
          if (restOfItem.imageUrl.startsWith('blob:') || restOfItem.imageUrl.startsWith('data:')) {
             restOfItem.imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }
        }
        return { ...restOfItem, updatedAt: new Date() };
      });
      await saveMenuItems(itemsToSaveInDB);
      await loadDataFromDB();
      alert('Sukses! Semua perubahan telah disimpan.');
      setActiveTab('meja');
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
       setIsLoading(false);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = items.find(i => i.id === itemId);
    if (!itemToDelete) return;

    if (window.confirm(`Yakin ingin menghapus menu "${itemToDelete.name}"?`)) {
        setIsLoading(true);
        try {
            const updatedItems = items.filter(item => item.id !== itemId);
            await saveMenuItems(updatedItems);
            await deleteAsset(`menu_image_${itemId}`);
            setItems(updatedItems);
            alert(`Menu "${itemToDelete.name}" berhasil dihapus.`);
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Terjadi kesalahan.");
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Yakin reset semua data?')) {
      setIsLoading(true);
      try {
        localStorage.removeItem('pawon_categories_custom');
        localStorage.removeItem('SEED_VERSION');
        await resetDatabase();
        window.location.reload(); 
      } catch (error) {
        console.error("Reset failed:", error);
        alert('Gagal mereset data.');
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
      {/* PWA Install Prompt Component */}
      <InstallPWA />

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
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-pawon-accent" size={48} />
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
