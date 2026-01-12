
import React from 'react';
import { Plus, Star, Heart } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onClick?: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick, onAddToCart }) => {
  
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah trigger onClick pada div utama
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(item)}
      className="group bg-white p-2.5 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] border border-[#F2F2F2] transition-all duration-300 flex flex-col h-full cursor-pointer active:scale-[0.98]"
    >
      {/* Premium Image Frame (Matte Effect) */}
      <div className="relative aspect-[1/1] overflow-hidden rounded-[20px] bg-gray-50 mb-3 isolate">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Inner Border Ring for Detail (Subtle) */}
        <div className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-black/5 pointer-events-none z-10"></div>

        {/* Floating Gradient Overlay at bottom for contrast (Optional, kept subtle) */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges - Premium Positioning */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-20">
            {/* Rating Badge (Glassmorphism) */}
            {item.rating ? (
               <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/50">
                 <Star size={10} className="text-orange-400 fill-orange-400"/>
                 <span className="text-[10px] font-bold text-pawon-dark leading-none pt-0.5">{item.rating}</span>
               </div>
            ) : <div></div>}

            {/* Favorite Badge (Gold/Heart) */}
            {item.isFavorite && (
              <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 text-red-500">
                <Heart size={12} fill="currentColor" />
              </div>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow px-1.5 pb-1">
        
        {/* Title - Font size reduced to text-[13px] */}
        <h3 className="font-serif text-pawon-dark font-bold text-[13px] leading-tight mb-1.5 line-clamp-2 group-hover:text-pawon-accent transition-colors">
          {item.name}
        </h3>
        
        {/* Description (Smaller & lighter) */}
        <p className="text-pawon-textGray text-[10px] leading-relaxed line-clamp-2 mb-3 font-medium opacity-80">
          {item.description}
        </p>

        {/* Footer: Price & Add Button */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
             <span className="text-[9px] text-gray-400 font-medium tracking-wide uppercase mb-0.5">Harga</span>
             <span className="font-bold text-pawon-accent text-[15px] whitespace-nowrap leading-none">
                <span className="text-xs align-top mr-0.5">Rp</span>{item.price.toLocaleString('id-ID')}
             </span>
          </div>
          
          {/* Aesthetic Add Button (Squircle) */}
          <button 
            onClick={handleAddToCartClick}
            className="w-9 h-9 rounded-[14px] bg-pawon-dark text-white flex items-center justify-center hover:bg-black transition-all shadow-lg shadow-pawon-dark/20 group-active:scale-90 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
