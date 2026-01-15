
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderItem } from '../types';
import api from '../api'; // Import axios instance

interface OrderState {
  orders: Order[];
  addOrder: (tableNumber: string, items: OrderItem[]) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>; // Diubah menjadi async
  setOrders: (orders: Order[]) => void; // Fungsi baru untuk sinkronisasi
  isLoading: boolean;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,

      // Fungsi ini dijalankan di HP PELANGGAN
      addOrder: async (tableNumber: string, items: OrderItem[]) => {
        set({ isLoading: true });
        
        // Kirim ke Google Cloud (Backend)
        try {
            await api.post('/orders', {
                tableNumber,
                items
            });
            console.log("Pesanan berhasil dikirim ke Cloud");
            // Tidak perlu update state lokal di sini, karena HP waiter akan mengambilnya dari server
        } catch (error) {
            console.error("Gagal kirim ke Cloud:", error);
            // Handle error, mungkin tampilkan pesan ke pelanggan
        } finally {
            set({ isLoading: false });
        }
      },
      
      // Fungsi ini dijalankan di HP WAITER
      completeOrder: async (orderId: string) => {
        // 1. Optimistic UI Update: Langsung update di layar agar terasa cepat
        const originalOrders = get().orders;
        set({
          orders: get().orders.filter(order => order.id !== orderId)
        });

        // 2. Kirim update status ke backend
        try {
            await api.patch(`/orders/${orderId}/complete`);
            console.log(`Order ${orderId} marked as complete on server.`);
        } catch (error) {
            console.error("Gagal menyelesaikan pesanan di server, mengembalikan state:", error);
            // Jika gagal, kembalikan state seperti semula
            set({ orders: originalOrders });
            alert("Gagal menyelesaikan pesanan. Periksa koneksi internet Anda.");
        }
      },

      // Fungsi ini untuk menerima data fresh dari server (dipanggil oleh poller)
      setOrders: (orders: Order[]) => {
        set({ orders });
      }
    }),
    {
      name: 'pawon-salam-order-storage',
    }
  )
);
