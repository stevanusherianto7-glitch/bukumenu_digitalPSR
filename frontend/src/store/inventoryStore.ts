import { create } from 'zustand';
import { Ingredient, RecipeItem, MenuItem, Order } from '../types';

export interface DbRecipeItem {
  id: string;
  menu_id: string;
  ingredient_id: string;
  quantity: number;
}
import { supabase } from '../lib/supabase';

interface InventoryState {
  ingredients: Ingredient[];
  recipes: DbRecipeItem[]; // Store recipes fetched from DB
  processedOrderIds: string[];
  isLoading: boolean;
  
  // Actions
  fetchInventory: () => Promise<void>;
  updateStock: (ingredientId: string, quantity: number, type: 'IN' | 'OUT', referenceId?: string) => Promise<void>;
  deductStockFromOrder: (menuItems: MenuItem[], order: Order) => Promise<void>;
  getIngredient: (id: string) => Ingredient | undefined;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ingredients: [],
  recipes: [],
  processedOrderIds: [],
  isLoading: false,

  fetchInventory: async () => {
    set({ isLoading: true });
    try {
      // 1. Fetch Ingredients
      const { data: ingData, error: ingError } = await supabase
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true });

      if (ingError) throw ingError;

      // 2. Fetch Recipes
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*');

      if (recipeError) throw recipeError;

      const mappedIngredients: Ingredient[] = ingData.map(ing => ({
        id: ing.id,
        name: ing.name,
        unit: ing.unit,
        currentStock: ing.current_stock,
        minStock: ing.min_stock,
        safetyStock: ing.min_stock,
        pricePerUnit: ing.price_per_unit || 0
      }));

      set({ 
        ingredients: mappedIngredients, 
        recipes: recipeData,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch inventory from Supabase:", error);
      set({ isLoading: false });
    }
  },

  getIngredient: (id) => get().ingredients.find(ing => ing.id === id),

  updateStock: async (ingredientId, quantity, type, referenceId) => {
    try {
      const ingredient = get().getIngredient(ingredientId);
      if (!ingredient) return;

      const newStock = type === 'IN' 
        ? ingredient.currentStock + quantity 
        : ingredient.currentStock - quantity;

      // Persist to Supabase
      const { error } = await supabase
        .from('ingredients')
        .update({ current_stock: newStock })
        .eq('id', ingredientId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        ingredients: state.ingredients.map(ing => 
          ing.id === ingredientId ? { ...ing, currentStock: newStock } : ing
        )
      }));

      console.log(`Stock updated for ${ingredient.name}: ${newStock} (${type} ${quantity})`);
    } catch (error) {
      console.error("Failed to update stock in Supabase:", error);
    }
  },

  deductStockFromOrder: async (menuItems, order) => {
    const { processedOrderIds, recipes } = get();
    if (processedOrderIds.includes(order.id)) return;

    console.log(`🍳 Processing Stock Deduction for Order: ${order.id}`);

    for (const orderItem of order.items) {
      // Find recipes for this specific menu item
      const itemRecipes = recipes.filter(r => r.menu_id === orderItem.menuId);
      
      for (const recipe of itemRecipes) {
        const deductionQty = recipe.quantity * orderItem.quantity;
        await get().updateStock(recipe.ingredient_id, deductionQty, 'OUT', order.id);
      }
    }

    set(state => ({ processedOrderIds: [...state.processedOrderIds, order.id] }));
  }
}));
