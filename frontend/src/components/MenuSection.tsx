
import React, { useMemo } from 'react';
import { UtensilsCrossed, ChevronDown, Search, X } from 'lucide-react';
import { MenuItem } from '../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuSectionProps {
  items: MenuItem[];
  allItems: MenuItem[]; // Ditambahkan untuk menghitung total item per kategori
  onItemClick?: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
  selectedCategory?: string;
  allCategories?: string[];
  onCategoryChange?: (category: string) => void;
  isAdmin?: boolean;
  onAddItem?: () => void;
  isLoading?: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  allItems,
  onItemClick,
  onAddToCart,
  selectedCategory,
  allCategories,
  onCategoryChange,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);
  const categoryCounts = useMemo(() => {
    if (!allCategories || !allItems) return {};
    
    const counts: Record<string, number> = {};
    for (const category of allCategories) {
        if (category === 'Terlaris') {
            counts[category] = allItems.filter(item => item.isFavorite).length;
        } else if (category === 'Menu Baru') {
            counts[category] = allItems.filter(item => item.isNew).length;
        } else {
            counts[category] = allItems.filter(item => item.category === category).length;
        }
    }
    return counts;
  }, [allItems, allCategories]);

  return (
    <div className="mt-2">

      {/* HEADER WITH DROPDOWN */}
      <div className="mb-5 mt-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-pawon-dark leading-none">
              Daftar Menu
            </h2>
            <p className="text-[10px] text-pawon-textGray mt-1 capitalize">
              Kategori: <span className="font-bold text-pawon-accent">{selectedCategory}</span>
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
                  {cat} ({categoryCounts[cat] ?? 0})
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

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl text-sm text-pawon-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pawon-accent/20 focus:border-pawon-accent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-28">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid - Increased gap for premium feel */
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 pb-28">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
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
              <p className="text-sm">
                {searchQuery ? 'Menu tidak ditemukan' : 'Belum ada menu di kategori ini'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
    </div>
  );
};
