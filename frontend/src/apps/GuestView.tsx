import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CategoryFilter } from '../components/CategoryFilter';
import { MenuSection } from '../components/MenuSection';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { PromoCarousel } from '../components/PromoCarousel';
import { Cart } from '../components/Cart';
import { useCartStore } from '../store/cartStore';
import { useMenuStore } from '../store/menuStore';
import { usePromoStore } from '../store/promoStore';
import { MenuItem } from '../types';
import { Loader2, ShoppingBag } from 'lucide-react';
import { InstallPWA } from '../components/InstallPWA'; 
import { WelcomeModal } from '../components/WelcomeModal'; 

const VALID_TABLES = Array.from({ length: 10 }, (_, i) => `A${i + 1}`);

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-pawon-bg p-6 text-center">
          <h1 className="text-red-600 font-bold text-xl mb-2">Terjadi Kesalahan Aplikasi</h1>
          <p className="text-sm text-gray-600 mb-4">{this.state.error?.message || "Unknown error"}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-pawon-accent text-white px-4 py-2 rounded-xl font-bold text-xs"
          >
            Muat Ulang
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export const GuestView: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  // Dukung parameter 'meja' (Bawaan) maupun 'table' (Uji coba)
  const tableNumber = searchParams.get('meja') || searchParams.get('table'); 
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { addItem, totalItems } = useCartStore();
  const { items, categories, isLoading, headerImage, loadData } = useMenuStore();
  const { activePromo, loadActivePromo } = usePromoStore();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Terlaris');

  const isValidTable = tableNumber ? VALID_TABLES.includes(tableNumber) : false;
  const [showWelcome, setShowWelcome] = useState(!!tableNumber && isValidTable);

  const SHORTCUT_CATEGORIES = ['Terlaris', 'Makanan', 'Minuman'];

  useEffect(() => {
    loadData();
    loadActivePromo();
  }, []);

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
    <ErrorBoundary>
      <div className="min-h-screen bg-pawon-bg flex justify-center">
        <InstallPWA />

        <div className="w-full max-w-[480px] bg-pawon-bg h-screen shadow-2xl overflow-hidden flex flex-col relative">
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

          <div className="flex-none px-6 z-20 bg-pawon-bg pt-0 relative">
             <PromoCarousel 
                headerImage={headerImage}
                menuItems={items}
                onSecretAdminTrigger={handleSecretTrigger} 
                tableNumber={tableNumber || undefined}
             />
             
             {/* Premium Promo Banner */}
             {activePromo && (
               <div className="mt-4 bg-gradient-to-r from-[#D32F2F] to-[#EF5350] text-white p-4 rounded-2xl shadow-lg flex justify-between items-center active:scale-[0.98] transition-all border border-white/10">
                 <div>
                   <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">Promo Spesial Aktif</p>
                   <h3 className="font-serif font-bold text-lg">{activePromo.name}</h3>
                 </div>
                 <div className="bg-white text-[#D32F2F] font-black text-xl px-3 py-1.5 rounded-xl shadow-inner">
                   -{Math.round(activePromo.discount_percent)}%
                 </div>
               </div>
             )}
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

          {/* Floating Cart Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-pawon-accent text-white flex items-center justify-center shadow-lg shadow-pawon-accent/30 active:scale-95 transition-all z-40"
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span data-testid="cart-badge" className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </ErrorBoundary>
  );
};
