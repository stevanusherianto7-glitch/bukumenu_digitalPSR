
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem, Addon } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: MenuItem, quantity: number, notes?: string, selectedAddons?: Addon[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number; // Re-add totalItems for badge
  orderType: 'dine-in' | 'take-away';
  setOrderType: (type: 'dine-in' | 'take-away') => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const calculateTotals = (items: CartItem[]) => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
          const addonPrice = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
          return sum + (item.price + addonPrice) * item.quantity;
        }, 0);
        return { totalItems, totalPrice };
      };

      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,

        addItem: (item, quantity, notes = '', selectedAddons = []) => {
          const { items } = get();
          
          // Generate a unique key for the item based on ID, Notes, and ADDONS
          // This allows multiple instances of the same dish with different toppings
          const addonIds = [...selectedAddons].map(a => a.id).sort().join('-');
          const itemKey = `${item.id}-${notes}-${addonIds}`;

          const existingItemIndex = items.findIndex(i => {
            const iAddonIds = i.selectedAddons?.map(a => a.id).sort().join('-') || '';
            return i.id === item.id && i.notes === notes && iAddonIds === addonIds;
          });

          let updatedItems;
          if (existingItemIndex > -1) {
            updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += quantity;
          } else {
            updatedItems = [...items, { ...item, quantity, notes, selectedAddons, cartId: itemKey }];
          }
          
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          set({ items: updatedItems, totalItems, totalPrice });
        },

        removeItem: (cartId: string) => {
          const updatedItems = get().items.filter(i => i.cartId !== cartId);
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          set({ items: updatedItems, totalItems, totalPrice });
        },

        updateQuantity: (cartId: string, quantity: number) => {
          if (quantity < 1) {
            get().removeItem(cartId);
            return;
          }
          const updatedItems = get().items.map(i =>
            i.cartId === cartId ? { ...i, quantity } : i
          );
          const { totalItems, totalPrice } = calculateTotals(updatedItems);
          set({ items: updatedItems, totalItems, totalPrice });
        },

        clearCart: () => {
          set({ items: [], totalItems: 0, totalPrice: 0 });
        },

        orderType: 'dine-in',
        setOrderType: (type) => set({ orderType: type }),
      };
    },
    {
      name: 'pawon-salam-cart-storage',
      onRehydrateStorage: () => (state) => {
        // Recalculate totals on rehydration
        if (state) {
            const { totalItems, totalPrice } = state.items.reduce(
                (acc, item) => {
                    const addonPrice = item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0;
                    acc.totalItems += item.quantity;
                    acc.totalPrice += (item.price + addonPrice) * item.quantity;
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
