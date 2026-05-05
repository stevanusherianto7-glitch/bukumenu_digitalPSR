import React from 'react';
import { Utensils, ShoppingBag } from 'lucide-react';

interface TableGridProps {
  tables: string[];
  pingingTables: Set<string>;
  onSelectTable: (num: string) => void;
  getTableOrders: (num: string) => any[];
  getUrgencyColor: (mins: number) => { bg: string; pulse: boolean };
  getMinutesAgo: (time: string) => number;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables,
  pingingTables,
  onSelectTable,
  getTableOrders,
  getUrgencyColor,
  getMinutesAgo
}) => {
  return (
    <div className="px-6 pb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif font-bold text-lg text-gray-800">Peta Meja</h3>
        <div className="flex items-center gap-4 text-[9px] font-bold text-gray-400 uppercase">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Kosong</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Ada Order</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {tables.map((tableNum) => {
          const pendingOrders = getTableOrders(tableNum);
          const hasOrder = pendingOrders.length > 0;
          const oldestOrderTime = hasOrder 
            ? Math.min(...pendingOrders.map(o => new Date(o.createdAt).getTime()))
            : Date.now();
          const minsAgo = hasOrder ? getMinutesAgo(new Date(oldestOrderTime).toISOString()) : 0;
          const urgency = getUrgencyColor(minsAgo);

          return (
            <button 
              key={tableNum} 
              onClick={() => onSelectTable(tableNum)} 
              className={`relative aspect-square rounded-[32px] flex flex-col items-center justify-center border-2 transition-all duration-300 group active:scale-95 ${
                hasOrder 
                  ? 'bg-red-50 border-red-500 shadow-lg shadow-red-200/50' 
                  : 'bg-white border-gray-100 hover:border-pawon-accent/30'
              } ${pingingTables.has(tableNum) ? 'animate-pulse bg-orange-50 !border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]' : ''}`}
            >
              {hasOrder && (
                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-lg z-10 ${urgency.bg} ${urgency.pulse ? 'animate-pulse' : ''}`}>
                  {pendingOrders.length}
                </div>
              )}
              
              <div className={`mb-2 p-3 rounded-2xl transition-colors ${
                hasOrder 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-gray-50 text-gray-300'
              }`}>
                <Utensils size={24} />
              </div>

              <span className={`font-black text-2xl tracking-tighter ${
                hasOrder ? 'text-red-900' : 'text-gray-400'
              }`}>
                {tableNum}
              </span>

              {hasOrder && (
                <div className="absolute bottom-3 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                  <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse delay-75" />
                  <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse delay-150" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
