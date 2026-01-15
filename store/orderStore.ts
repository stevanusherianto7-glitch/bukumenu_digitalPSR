
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, OrderItem } from '../types';
import api from '../lib/api'; // Import API client untuk kirim ke backend

interface OrderState {
  orders: Order[];
  addOrder: (tableNumber: string, items: OrderItem[]) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  setOrders: (orders: Order[]) => void; // Untuk sinkronisasi dari polling
  isLoading: boolean;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,

      // Fungsi ini dijalankan di HP PELANGGAN - KIRIM KE BACKEND
      addOrder: async (tableNumber: string, items: OrderItem[]) => {
        set({ isLoading: true });
        
        try {
            // Kirim pesanan ke backend API
            const response = await api.post('/orders', {
                tableNumber,
                items
            });
            
            console.log("✅ Pesanan berhasil dikirim ke server:", response.data);
            
            // Pesanan sudah tersimpan di database, waiter akan mendapatkannya via polling
            // Tidak perlu update state lokal karena waiter akan fetch dari server
        } catch (error: any) {
            console.error("❌ Gagal kirim pesanan ke server:", error);
            const errorMessage = error.response?.data?.message || "Gagal mengirim pesanan. Silakan coba lagi.";
            alert(errorMessage);
            throw error; // Re-throw agar bisa di-handle di component
        } finally {
            set({ isLoading: false });
        }
      },
      
      // Fungsi ini dijalankan di HP WAITER - UPDATE STATUS DI BACKEND
      completeOrder: async (orderId: string) => {
        const originalOrders = get().orders;
        
        // Optimistic update: langsung hapus dari UI
        set({
          orders: get().orders.filter(order => order.id !== orderId)
        });

        try {
            // Update status di backend
            await api.patch(`/orders/${orderId}/complete`);
            console.log(`✅ Order ${orderId} marked as complete on server.`);
        } catch (error) {
            console.error("❌ Gagal menyelesaikan pesanan di server:", error);
            // Rollback jika gagal
            set({ orders: originalOrders });
            alert("Gagal menyelesaikan pesanan. Periksa koneksi internet Anda.");
            throw error;
        }
      },

      // Fungsi untuk sinkronisasi data dari server (dipanggil oleh polling di WaiterTableSection)
      setOrders: (orders: Order[]) => {
        set({ orders });
      }
    }),
    {
      name: 'pawon-salam-order-storage',
    }
  )
);
