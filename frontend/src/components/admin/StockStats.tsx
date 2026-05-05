import React from 'react';

    interface StockStatsProps {
      totalMenu: number;
      outOfStockCount: number;
      totalCategories: number;
    }

    export const StockStats: React.FC<StockStatsProps> = ({
      totalMenu,
      outOfStockCount,
      totalCategories
    }) => {
      return (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Menu</span>
            <span className="text-xl font-bold text-gray-900">{totalMenu}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Habis</span>
            <span className="text-xl font-bold text-red-500">{outOfStockCount}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Kategori</span>
            <span className="text-xl font-bold text-pawon-accent">{totalCategories}</span>
          </div>
        </div>
      );
    };
