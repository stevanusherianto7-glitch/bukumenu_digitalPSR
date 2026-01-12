
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem, quantity: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const calculateTotals = (items: CartItem[]) => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        return { totalItems, totalPrice };
      };

      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,

        addItem: (item, quantity, notes = '') => {
          const { items } = get();
          const existingItemIndex = items.findIndex(i => i.id === item.id && i.notes === notes);

          let updatedItems;
          if (existingItemIndex > -1) {
            // Item yang sama dengan catatan yang sama sudah ada, update quantity-nya saja
            updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity;
          } else {
            // Tambahkan sebagai item baru
            updatedItems = [...items, { ...item, quantity, notes }];
          }
          
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          set({ items: updatedItems, totalItems, totalPrice });
        },

        removeItem: (itemId: string) => {
          const updatedItems = get().items.filter(i => i.id !== itemId);
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          set({ items: updatedItems, totalItems, totalPrice });
        },

        updateQuantity: (itemId: string, quantity: number) => {
          if (quantity < 1) {
            get().removeItem(itemId);
            return;
          }
          const updatedItems = get().items.map(i =>
            i.id === itemId ? { ...i, quantity } : i
          );
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          set({ items: updatedItems, totalItems, totalPrice });
        },

        clearCart: () => {
          set({ items: [], totalItems: 0, totalPrice: 0 });
        },
      };
    },
    {
      name: 'pawon-salam-cart-storage',
      onRehydrateStorage: () => (state) => {
        // Recalculate totals on rehydration
        if (state) {
            const { totalItems, totalPrice } = state.items.reduce(
                (acc, item) => {
                    acc.totalItems += item.quantity;
                    acc.totalPrice += item.price * item.quantity;
                    return acc;
                },
                { totalItems: 0, totalPrice: 0 }
            );
            state.totalItems = totalItems;
            state.totalPrice = totalPrice;
        }
      }
    }
  )
);
