import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderItem } from '../types';

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
            { menuName: 'Nasi Ayam Lengkuas Semarang', quantity: 2, price: 34000, notes: 'Jangan pedas' },
            { menuName: 'Es Teler', quantity: 1, price: 20000 },
        ]
    },
    {
        id: `ord-${Math.random().toString(36).substr(2, 4)}`,
        tableNumber: 'A3',
        status: 'pending',
        timestamp: Date.now() - 300000, // 5 menit lalu
        items: [
            { menuName: 'Soto Ayam Semarang', quantity: 1, price: 30000 },
        ]
    },
    {
        id: `ord-${Math.random().toString(36).substr(2, 4)}`,
        tableNumber: 'A7',
        status: 'pending',
        timestamp: Date.now() - 600000, // 10 menit lalu
        items: [
            { menuName: 'Rawon Semarang', quantity: 1, price: 35000 },
            { menuName: 'Ayam Goreng Penyet Semarang', quantity: 1, price: 34000, notes: 'Sambal dipisah' },
            { menuName: 'Tahu Gimbal Semarang', quantity: 1, price: 28000 },
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
      name: 'pawon-salam-order-storage',
    }
  )
);