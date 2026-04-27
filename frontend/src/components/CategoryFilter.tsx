
import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onSelect 
}) => {
  return (
    <div className="pb-6 pt-2">
      {/* Category Tabs with uniform size, green color, and floating drop-shadow */}
      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                onSelect(cat);
              }}
              className={`
                h-10 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center
                ${isActive 
                  ? 'bg-pawon-green text-white shadow-[0_10px_20px_rgba(106,126,82,0.4)] -translate-y-1'
                  : 'bg-white text-pawon-textGray hover:bg-gray-50 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] active:scale-95'
                }
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
