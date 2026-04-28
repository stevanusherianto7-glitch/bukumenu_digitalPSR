import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { CategoryFilter } from '../../components/CategoryFilter';
import { MenuSection } from '../../components/MenuSection';
import { ProductDetailModal } from '../../components/ProductDetailModal';
import { PromoCarousel } from '../../components/PromoCarousel';
import { Cart } from '../../components/Cart';
import { useCartStore } from '../../store/cartStore';
import { MenuItem } from '../../types';
import { getAsset, getAllMenuItems, resetDatabase } from '../../indexedDB';
import { Loader2 } from 'lucide-react';
import { MENU_ITEMS, CATEGORIES } from '../../data';
import { SEED_VERSION } from '../../seed-version';
import { InstallPWA } from '../../components/InstallPWA'; 
import { WelcomeModal } from '../../components/WelcomeModal'; 

const VALID_TABLES = Array.from({ length: 9 }, (_, i) => `A${i + 1}`);
const CustomerApp: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const tableNumber = searchParams.get('meja'); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCartStore();
  const isValidTable = tableNumber ? VALID_TABLES.includes(tableNumber) : false;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!!tableNumber && isValidTable);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  const DEFAULT_HEADER_IMG = "https://res.cloudinary.com/dwdaydzsh/image/upload/v1768368455/Soto_Pindang_Kudus_orwjnb.jpg";
  const [headerImage, setHeaderImage] = useState<string>(DEFAULT_HEADER_IMG);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');
  
  const SHORTCUT_CATEGORIES = ['Terlaris', 'Makanan', 'Minuman'];

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
      if (localVersion !== SEED_VERSION) {
        await resetDatabase();
        localStorage.setItem('SEED_VERSION', SEED_VERSION);
      }
      
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
  }, [selectedCategory]);

  const handleAddToCart = (item: MenuItem, quantity: number, notes: string) => {
    addItem(item, quantity, notes);
    setSelectedItem(null);
    setIsCartOpen(true);
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

  return (
    <div className="min-h-screen bg-pawon-bg flex justify-center">
      <InstallPWA />
      {showWelcome && tableNumber && (
        <WelcomeModal tableNumber={tableNumber} onDismiss={() => setShowWelcome(false)} />
      )}
      {selectedItem && (
        <ProductDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} onAddToCart={handleAddToCart} />
      )}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} tableNumber={tableNumber || undefined} />

      <div className="w-full max-w-[480px] bg-pawon-bg h-screen shadow-2xl overflow-hidden flex flex-col relative">
        <div className="flex-none px-6 z-20 bg-pawon-bg pt-0 relative">
            <PromoCarousel headerImage={headerImage} onSecretAdminTrigger={() => {}} tableNumber={tableNumber || undefined} />
        </div>
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-pawon-accent" size={48} />
            </div>
          ) : (
            <div>
              <div className="sticky top-0 z-30 bg-pawon-bg/95 backdrop-blur-sm pt-2 pb-1 -mx-6 px-6">
                <CategoryFilter categories={SHORTCUT_CATEGORIES} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
              </div>
              <MenuSection items={filteredItems} allItems={items} onItemClick={setSelectedItem} onAddToCart={(item) => addItem(item, 1)} selectedCategory={selectedCategory} allCategories={categories} onCategoryChange={setSelectedCategory} />
            </div>
          )}
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CustomerApp;
