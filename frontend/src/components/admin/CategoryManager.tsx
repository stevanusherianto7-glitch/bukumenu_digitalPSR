import React, { useState } from 'react';
    import { Plus, ChevronDown, X, Check } from 'lucide-react';

    interface CategoryManagerProps {
      currentCategory: string;
      categories: string[];
      onCategoryChange: (category: string) => void;
      onAddCategory: (name: string) => void;
    }

    export const CategoryManager: React.FC<CategoryManagerProps> = ({
      currentCategory,
      categories,
      onCategoryChange,
      onAddCategory
    }) => {
      const [isAdding, setIsAdding] = useState(false);
      const [newName, setNewName] = useState('');

      const handleSubmit = () => {
        if (!newName.trim()) return;
        onAddCategory(newName.trim());
        setNewName('');
        setIsAdding(false);
        onCategoryChange(newName.trim());
      };

      return (
        <div className="flex flex-col gap-3 mb-4 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-pawon-dark leading-none">
                Daftar Menu
              </h3>
              <p className="text-[10px] text-pawon-textGray mt-1">
                Edit: <span className="font-bold text-pawon-accent">{currentCategory}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!isAdding && (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="w-8 h-8 rounded-lg bg-gray-100 text-pawon-dark flex items-center justify-center hover:bg-pawon-accent hover:text-white transition-colors"
                  title="Tambah Kategori Baru"
                >
                  <Plus size={16} />
                </button>
              )}

              <div className="relative group">
                <select
                  title="Filter kategori menu"
                  value={currentCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-pawon-dark text-xs font-bold py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pawon-accent/20 focus:border-pawon-accent cursor-pointer hover:bg-gray-50 transition-colors max-w-[140px]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-pawon-accent transition-colors">
                  <ChevronDown size={14} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>

          {isAdding && (
            <div className="bg-white p-3 rounded-xl border border-pawon-accent/30 shadow-sm animate-in fade-in slide-in-from-top-1">
              <label className="text-[10px] font-bold text-pawon-accent uppercase mb-1 block">Tambah Kategori Baru</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Dessert"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-pawon-accent focus:ring-1 focus:ring-pawon-accent"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                  title="Batalkan"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!newName.trim()}
                  className="px-3 py-2 rounded-lg bg-pawon-accent text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Simpan Kategori Baru"
                >
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };
