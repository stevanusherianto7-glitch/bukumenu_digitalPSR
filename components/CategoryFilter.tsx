
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
    <div className="pb-4 pt-2">
      {/* Distribute items evenly for a balanced, proportional look */}
      <div className="flex justify-evenly">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                onSelect(cat);
              }}
              className={`
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
