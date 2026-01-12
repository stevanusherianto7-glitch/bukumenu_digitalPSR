
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
    <div className="overflow-x-auto pb-4 pt-2 -mx-6 no-scrollbar scroll-smooth">
      {/* Changed min-w-max to w-max ensures right padding is respected in scroll view */}
      <div className="flex gap-3 px-6 w-max">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={(e) => {
                // Scroll the clicked button into the center of the view nicely
                e.currentTarget.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'nearest', 
                  inline: 'center' 
                });
                onSelect(cat);
              }}
              className={`
                /* Reduced horizontal padding from px-6 to px-5 */
                px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                ${isActive 
                  ? 'bg-pawon-dark text-white shadow-lg shadow-pawon-dark/20 scale-105' 
                  : 'bg-white text-pawon-textGray hover:bg-gray-50 active:scale-95'
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
