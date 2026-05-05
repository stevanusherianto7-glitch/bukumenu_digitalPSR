
import React from 'react';
import { Star, Heart } from 'lucide-react';
import { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onClick?: (item: MenuItem) => void;
  onAddToCart?: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick }) => {
  
  const isAvailable = item.isAvailable !== false;

  return (
    <div 
      onClick={() => isAvailable && onClick && onClick(item)}
      className={`group relative bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#F2F2F2] transition-all duration-500 flex flex-col h-full overflow-hidden ${isAvailable ? 'hover:shadow-[0_20px_50px_rgba(0,0,0,0.18)] hover:-translate-y-1 cursor-pointer active:scale-[0.98]' : 'opacity-60 cursor-not-allowed'}`}
    >
      <div className="p-2.5 flex flex-col h-full">
        {/* Premium "New Menu" Ribbon (Moved to Top-Left) */}
        {item.isNew && (
          <div className="absolute top-0 left-0 z-30 filter drop-shadow-md">
            <div
              className="w-8 bg-[#D32F2F] flex flex-col items-center pt-2 pb-3 shadow-inner ribbon-clip"
            >
              <div className="w-full h-[1px] bg-amber-200/50 absolute top-0 left-0"></div>
              <span className="text-[6px] text-amber-100 uppercase tracking-widest font-medium mb-0.5">
                MENU
              </span>
              <span className="text-[8px] text-white font-bold uppercase tracking-wider leading-none">
                BARU
              </span>
            </div>
          </div>
        )}

        {/* Premium Image Frame */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-gray-50 mb-3 isolate">
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={(e) => {
               (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
            }}
            className={`w-full h-full object-cover transition-all duration-700 ${isAvailable ? 'group-hover:scale-110' : 'grayscale'}`}
            loading="lazy"
          />

          <div className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-black/5 pointer-events-none z-10"></div>

          {/* Out of Stock Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[20px]">
              <span className="bg-white text-pawon-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Stok Habis</span>
            </div>
          )}

          {/* Badges (Star moved to bottom-left, Favorite at top-right) */}
          <div className="absolute top-2.5 right-2.5 z-20">
              {item.isFavorite && (
                <div className="w-6 h-6 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 text-red-500">
                  <Heart size={12} fill="currentColor" />
                </div>
              )}
          </div>

          {item.rating && (
            <div className="absolute bottom-2.5 left-2.5 z-20 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/50 animate-in fade-in zoom-in-90 duration-500">
               <Star size={10} className="text-orange-400 fill-orange-400"/>
               <span className="text-[10px] font-bold text-pawon-dark leading-none pt-0.5">{item.rating}</span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-grow px-1.5 pb-1">
          <h3 className="font-serif text-[#1b4d3e] font-bold text-[13px] leading-tight mb-1.5 line-clamp-2 group-hover:text-pawon-accent transition-colors">
            {item.name}
          </h3>

          <p className="text-pawon-textGray text-[10px] leading-relaxed line-clamp-2 mb-3 font-medium opacity-80">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer: Orange Block at the very bottom of the card */}
      <div className="mt-auto bg-pawon-accent py-2.5 px-4 flex justify-start items-center">
         <span className="font-bold text-white text-[15px] whitespace-nowrap leading-none flex items-center drop-shadow-sm">
            <span className="text-[10px] opacity-90 mr-1.5 font-bold">Rp</span>
            {(Number(item.price) || 0).toLocaleString('id-ID')}
         </span>
      </div>
    </div>
  );
};
