import React, { useState, useEffect, useRef } from 'react';
import { WaiterTableSection } from '../../components/WaiterTableSection';
import { TableMapSection } from '../../components/TableMapSection';
import { SalesRecapSection } from '../../components/SalesRecapSection';
import { MarketingSection } from '../../components/MarketingSection';
import { AdminSection } from '../../components/AdminSection';
import { BottomNav } from '../../components/BottomNav';
import { InstallPWA } from '../../components/InstallPWA';
import { useMenuStore } from '../../store/menuStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { useOrderStore } from '../../store/orderStore';
import { Loader2 } from 'lucide-react';

const AdminApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'meja' | 'peta' | 'laporan' | 'marketing' | 'admin'>('laporan');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');

  const { 
    items, 
    categories, 
    isLoading, 
    headerImage, 
    loadData, 
    saveAllItems, 
    deleteItem, 
    addCategory, 
    resetData 
  } = useMenuStore();

  useEffect(() => {
    loadData();
    useInventoryStore.getState().fetchInventory();
    useOrderStore.getState().fetchOrders();
  }, [loadData]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleSaveAll = async (draftItems: any[], newHeaderImage: string | null) => {
    try {
      await saveAllItems(draftItems, newHeaderImage);
      alert('Sukses! Semua perubahan telah disimpan.');
    } catch (error) {
      alert('Gagal menyimpan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus menu ini?')) {
      await deleteItem(id);
    }
  };

  const handleAddCat = (name: string) => {
    addCategory(name);
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
                <WaiterTableSection onExit={() => { window.location.href = '/'; }} />
              </div>
              <div className={activeTab === 'peta' ? 'block' : 'hidden'}>
                 <TableMapSection />
              </div>
              <div className={activeTab === 'laporan' ? 'block' : 'hidden'}>
                 <SalesRecapSection />
              </div>
              <div className={activeTab === 'marketing' ? 'block' : 'hidden'}>
                 <div className="px-6 py-4">
                   <MarketingSection />
                 </div>
              </div>
              <div className={activeTab === 'admin' ? 'block' : 'hidden'}>
                 <div className="px-6">
                    <AdminSection 
                        items={items} 
                        headerImage={headerImage}
                        category={selectedCategory}
                        categories={categories}
                        onCategoryChange={setSelectedCategory} 
                        onSaveAll={handleSaveAll}
                        onResetData={resetData}
                        onAddCategory={handleAddCat}
                        onDeleteItem={handleDelete}
                      />
                 </div>
              </div>
            </>
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AdminApp;
