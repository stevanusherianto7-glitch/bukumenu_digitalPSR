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
              className={`relative aspect-square rounded-3xl flex flex-col items-center justify-center border-2 transition-all group active:scale-95 ${
                hasOrder ? 'bg-white border-yellow-500 shadow-xl' : 'bg-white border-yellow-400/30'
              } ${pingingTables.has(tableNum) ? 'animate-pulse bg-orange-50' : ''}`}
            >
              {hasOrder && (
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${urgency.bg} ${urgency.pulse ? 'animate-bounce' : ''}`}>
                  {pendingOrders.length}
                </div>
              )}
              <div className={`mb-2 p-2.5 rounded-2xl ${hasOrder ? `${urgency.bg} text-white` : 'text-gray-300'}`}>
                <Utensils size={18} />
              </div>
              <span className={`font-bold text-xl ${hasOrder ? 'text-gray-900' : 'text-gray-400'}`}>
                {tableNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
