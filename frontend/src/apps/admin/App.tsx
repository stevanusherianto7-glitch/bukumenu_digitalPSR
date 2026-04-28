import React, { useState, useCallback, useEffect, useRef } from 'react';
import { WaiterTableSection } from '../../components/WaiterTableSection';
import { TableMapSection } from '../../components/TableMapSection';
import { SalesRecapSection } from '../../components/SalesRecapSection';
import { AdminSection } from '../../components/AdminSection';
import { BottomNav } from '../../components/BottomNav';
import { InstallPWA } from '../../components/InstallPWA';
import { MenuItem } from '../../types';
import { getAsset, saveAsset, base64ToBlob, getAllMenuItems, saveMenuItems, resetDatabase, deleteAsset } from '../../indexedDB';
import { MENU_ITEMS, CATEGORIES } from '../../data';
import { Loader2 } from 'lucide-react';

const AdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meja' | 'peta' | 'laporan' | 'admin'>('laporan');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  const DEFAULT_HEADER_IMG = "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";
  const [headerImage, setHeaderImage] = useState<string>(DEFAULT_HEADER_IMG);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');

  const loadDataFromDB = useCallback(async () => {
    setIsLoading(true);
    try {
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
  }, [activeTab]);

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
        
        // Jika imageUrl adalah URL publik (bukan data: atau blob:), biarkan apa adanya.
        // Tapi kita perlu memastikan bahwa jika ada aset lokal lama, itu dihapus agar tidak menimpa URL ini saat load.
        return { ...restOfItem, updatedAt: new Date() };
      });

      // Cleanup local assets if item now uses a public URL
      await Promise.all(draftItems.map(async (item) => {
          if (item.imageUrl.startsWith('http') && !item.imageUrl.startsWith('blob:')) {
              await deleteAsset('menu_image_' + item.id);
          }
      }));

      await saveMenuItems(itemsToSaveInDB);
      await loadDataFromDB();
      alert('Sukses! Semua perubahan telah disimpan.');
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

  return (
    <div className="min-h-screen bg-pawon-bg flex justify-center">
      <InstallPWA />
      <div className="w-full max-w-[480px] bg-pawon-bg h-screen shadow-2xl overflow-hidden flex flex-col relative">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-24">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-pawon-accent" size={48} />
            </div>
          ) : (
            <>
              <div className={activeTab === 'meja' ? 'block' : 'hidden'}>
                <WaiterTableSection onExit={() => {}} />
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
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onExitAdmin={() => { window.location.href = '/'; }} />
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminApp;
