
import React from 'react';
import { UtensilsCrossed, ChevronDown } from 'lucide-react';
import { MenuItem } from '../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuSectionProps {
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
  selectedCategory?: string; 
  allCategories?: string[];
  onCategoryChange?: (category: string) => void;
  isAdmin?: boolean; 
  onAddItem?: () => void; 
}

export const MenuSection: React.FC<MenuSectionProps> = ({ 
  items, 
  onItemClick,
  onAddToCart,
  selectedCategory,
  allCategories,
  onCategoryChange
}) => {
  return (
    <div className="mt-2">
      
      {/* HEADER WITH DROPDOWN */}
      <div className="flex items-center justify-between mb-5 mt-1">
        <div>
          <h2 className="font-serif text-xl font-bold text-pawon-dark leading-none">
            Daftar Menu
          </h2>
          <p className="text-[10px] text-pawon-textGray mt-1">
            Menampilkan kategori: <span className="font-bold text-pawon-accent">{selectedCategory}</span>
          </p>
        </div>

        {/* Custom Dropdown Styling */}
        {allCategories && onCategoryChange && (
          <div className="relative group">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-pawon-dark text-xs font-bold py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pawon-accent/20 focus:border-pawon-accent cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-pawon-accent transition-colors">
              <ChevronDown size={14} strokeWidth={2.5} />
            </div>
          </div>
        )}
      </div>

      {/* Grid - Increased gap for premium feel */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-28">
        {items.length > 0 ? (
            items.map((item) => (
            <MenuItemCard 
                key={item.id} 
                item={item} 
                onClick={onItemClick}
                onAddToCart={onAddToCart}
            />
            ))
        ) : (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-400 opacity-60">
                <UtensilsCrossed size={48} strokeWidth={1} className="mb-2" />
                <p className="text-sm">Belum ada menu di kategori ini</p>
            </div>
        )}
      </div>
    </div>
  );
};
