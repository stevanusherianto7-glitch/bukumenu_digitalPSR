
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderItem } from '../../types';

interface OrderState {
  orders: Order[];
  addOrder: (tableNumber: string, items: OrderItem[]) => void;
  completeOrder: (orderId: string) => void;
}

// Data pesanan awal untuk demonstrasi
const createDummyOrders = (): Order[] => [
    {
        id: `ord-${Math.random().toString(36).substr(2, 4)}`,
        tableNumber: 'A1',
        status: 'pending',
        timestamp: Date.now() - 120000, // 2 menit lalu
        items: [
            { menuName: 'Nasi Goreng Spesial', quantity: 1, price: 35000 },
            { menuName: 'Es Teh Manis', quantity: 2, price: 8000, notes: 'Jangan terlalu manis' },
        ]
    },
    {
        id: `ord-${Math.random().toString(36).substr(2, 4)}`,
        tableNumber: 'A3',
        status: 'pending',
        timestamp: Date.now() - 300000, // 5 menit lalu
        items: [
            { menuName: 'Sate Ayam Madura', quantity: 1, price: 40000 },
        ]
    }
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: createDummyOrders(),

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

      completeOrder: (orderId: string) => {
        set({
          orders: get().orders.map(order => 
            order.id === orderId ? { ...order, status: 'completed' } : order
          ),
        });
      },
    }),
    {
      name: 'restohris-order-storage', // Nama key di local storage
    }
  )
);
