
import React, { useState } from 'react';
import { Plus, Trash2, UtensilsCrossed, Calculator } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import { RecipeItem } from '../types';

interface RecipeEditorProps {
  recipe?: RecipeItem[];
  onChange: (recipe: RecipeItem[]) => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ recipe = [], onChange }) => {
  const { ingredients, calculateHPP } = useInventoryStore();
  
  const handleAddIngredient = () => {
    if (ingredients.length === 0) {
      alert('Tambahkan bahan baku di modul Gudang terlebih dahulu!');
      return;
    }
    const newItem: RecipeItem = {
      ingredientId: ingredients[0].id,
      quantity: 0,
      unit: ingredients[0].unit
    };
    onChange([...recipe, newItem]);
  };

  const handleUpdateItem = (index: number, updates: Partial<RecipeItem>) => {
    const newRecipe = [...recipe];
    newRecipe[index] = { ...newRecipe[index], ...updates };
    
    // Update unit automatically if ingredientId changes
    if (updates.ingredientId) {
      const ing = ingredients.find(i => i.id === updates.ingredientId);
      if (ing) newRecipe[index].unit = ing.unit;
    }
    
    onChange(newRecipe);
  };

  const handleRemoveItem = (index: number) => {
    onChange(recipe.filter((_, i) => i !== index));
  };

  const hppTotal = calculateHPP(recipe);

  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={16} className="text-pawon-accent" />
          <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Takaran Resep (ERP)</h3>
        </div>
        <button 
          onClick={handleAddIngredient}
          className="text-[10px] font-bold text-pawon-accent flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50"
        >
          <Plus size={12} /> Tambah Bahan
        </button>
      </div>

      {recipe.length === 0 ? (
        <p className="text-[10px] text-gray-400 italic text-center py-4">Belum ada resep yang didefinisikan.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {recipe.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
              <select 
                value={item.ingredientId}
                onChange={(e) => handleUpdateItem(idx, { ingredientId: e.target.value })}
                className="flex-1 text-[10px] font-bold bg-transparent focus:outline-none"
              >
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
              <input 
                type="number"
                value={item.quantity}
                onChange={(e) => handleUpdateItem(idx, { quantity: Number(e.target.value) })}
                className="w-16 text-[10px] font-bold text-center border-x border-gray-100 focus:outline-none"
                placeholder="Qty"
              />
              <span className="text-[10px] text-gray-400 font-bold w-10 text-center">{item.unit}</span>
              <button 
                onClick={() => handleRemoveItem(idx)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/50 rounded-xl p-3 border border-dashed border-gray-200 flex items-center justify-between">
         <div className="flex items-center gap-1.5">
            <Calculator size={14} className="text-gray-400" />
            <span className="text-[9px] font-bold text-gray-400 uppercase">Estimasi HPP</span>
         </div>
         <span className="text-xs font-bold text-gray-900">
           Rp {hppTotal.toLocaleString('id-ID')}
         </span>
      </div>
      <p className="text-[8px] text-gray-400 mt-2 italic">
        *HPP dihitung otomatis berdasarkan harga beli bahan baku & takaran resep.
      </p>
    </div>
  );
};
