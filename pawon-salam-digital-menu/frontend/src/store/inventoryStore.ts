
import { create } from 'zustand';
import { Ingredient, RecipeItem, MenuItem, StockTransaction } from '../types';

interface InventoryState {
  ingredients: Ingredient[];
  transactions: StockTransaction[];
  processedOrderIds: string[]; // Track processed orders to prevent double deduction
  isLoading: boolean;
  
  // Actions
  setIngredients: (ingredients: Ingredient[]) => void;
  updateStock: (ingredientId: string, quantity: number, type: 'IN' | 'OUT', referenceId?: string) => void;
  deductStockFromOrder: (menuItems: MenuItem[], order: any) => void;
  getIngredient: (id: string) => Ingredient | undefined;
  calculateHPP: (recipe: RecipeItem[]) => number;
}


export const useInventoryStore = create<InventoryState>((set, get) => ({
  ingredients: [],
  transactions: [],
  processedOrderIds: [],
  isLoading: false,


  setIngredients: (ingredients) => set({ ingredients }),

  getIngredient: (id) => get().ingredients.find(ing => ing.id === id),

  calculateHPP: (recipe) => {
    return recipe.reduce((total, item) => {
      const ingredient = get().ingredients.find(ing => ing.id === item.ingredientId);
      if (!ingredient) return total;
      
      // Basic conversion logic (Gram to Kg, Ml to L)
      let quantity = item.quantity;
      if (item.unit === 'Gram' && ingredient.unit === 'Kg') quantity /= 1000;
      if (item.unit === 'Ml' && ingredient.unit === 'L') quantity /= 1000;
      
      return total + (quantity * ingredient.pricePerUnit);
    }, 0);
  },

  updateStock: (ingredientId, quantity, type, referenceId) => {
    set((state) => {
      const updatedIngredients = state.ingredients.map((ing) => {
        if (ing.id === ingredientId) {
          const newStock = type === 'IN' 
            ? ing.currentStock + quantity 
            : ing.currentStock - quantity;
          return { ...ing, currentStock: newStock };
        }
        return ing;
      });

      const newTransaction: StockTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        ingredientId,
        type,
        quantity,
        referenceId,
        createdAt: new Date().toISOString(),
      };

      return { 
        ingredients: updatedIngredients,
        transactions: [newTransaction, ...state.transactions]
      };
    });
  },

  deductStockFromOrder: (menuItems, order) => {
    const { processedOrderIds } = get();
    if (processedOrderIds.includes(order.id)) return;

    order.items.forEach((orderItem: any) => {
      const menu = menuItems.find(m => m.id === orderItem.menuId);
      if (menu && menu.recipe) {
        menu.recipe.forEach((recipeItem) => {
          const ingredient = get().getIngredient(recipeItem.ingredientId);
          if (ingredient) {
            let deductionQty = recipeItem.quantity * orderItem.quantity;
            
            // Conversion logic for deduction
            if (recipeItem.unit === 'Gram' && ingredient.unit === 'Kg') deductionQty /= 1000;
            if (recipeItem.unit === 'Ml' && ingredient.unit === 'L') deductionQty /= 1000;
            
            get().updateStock(recipeItem.ingredientId, deductionQty, 'OUT', order.id);
          }
        });
      }
    });

    set(state => ({ processedOrderIds: [...state.processedOrderIds, order.id] }));
  }
}));
