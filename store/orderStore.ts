
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderItem } from '../types';

interface OrderState {
  orders: Order[];
  addOrder: (tableNumber: string, items: OrderItem[]) => void;
  completeOrder: (orderId: string) => void;
  setOrders: (orders: Order[]) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [], // Inisialisasi dengan array kosong (Data dummy dihapus)

      addOrder: (tableNumber: string, items: OrderItem[]) => {
        const newOrder: Order = {
          id: `ord-${Date.now().toString().slice(-4)}`,
          tableNumber,
          items,
          status: 'pending',
          timestamp: Date.now(),
        };
        set({ orders: [newOrder, ...get().orders] });
      },

      setOrders: (newOrders: Order[]) => {
        set({ orders: newOrders });
      },

      completeOrder: (orderId: string) => {
        set({
          orders: get().orders.map(order =>
            order.id === orderId ? { ...order, status: 'completed' } : order
          ),
        });
      },
    }),
    {
      name: 'pawon-salam-order-storage',
    }
  )
);
