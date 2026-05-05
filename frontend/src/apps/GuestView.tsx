import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CategoryFilter } from '../components/CategoryFilter';
import { MenuSection } from '../components/MenuSection';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { PromoCarousel } from '../components/PromoCarousel';
import { Cart } from '../components/Cart';
import { useCartStore } from '../store/cartStore';
import { useMenuStore } from '../store/menuStore';
import { MenuItem } from '../types';
import { Loader2 } from 'lucide-react';
import { InstallPWA } from '../components/InstallPWA'; 
import { WelcomeModal } from '../components/WelcomeModal'; 

const VALID_TABLES = Array.from({ length: 9 }, (_, i) => `A${i + 1}`);

export const GuestView: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const tableNumber = searchParams.get('meja'); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartStore();
  const { items, categories, isLoading, headerImage, loadData } = useMenuStore();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');

  const isValidTable = tableNumber ? VALID_TABLES.includes(tableNumber) : false;
  const [showWelcome, setShowWelcome] = useState(!!tableNumber && isValidTable);

  const SHORTCUT_CATEGORIES = ['Terlaris', 'Makanan', 'Minuman'];

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory]);

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

  const handleAddToCart = (item: MenuItem, quantity: number, notes: string) => {
    addItem(item, quantity, notes);
    setSelectedItem(null);
    setIsCartOpen(true);
  };

  const handleSecretTrigger = () => {
     window.location.href = '/admin';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-pawon-bg">
        <Loader2 className="animate-spin text-pawon-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pawon-bg flex justify-center">
      <InstallPWA />

      {showWelcome && tableNumber && (
        <WelcomeModal 
          tableNumber={isValidTable ? tableNumber : ''} 
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
        <div className="flex-none px-6 z-20 bg-pawon-bg pt-0 relative">
           <PromoCarousel 
              headerImage={headerImage}
              onSecretAdminTrigger={handleSecretTrigger} 
              tableNumber={tableNumber || undefined}
           />
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-6 px-6"
        >
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
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
