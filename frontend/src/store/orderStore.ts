import { create } from 'zustand';
import { Order, OrderItem } from '../types';
import { supabase } from '../lib/supabase';
import { useInventoryStore } from './inventoryStore';
import { useMenuStore } from './menuStore';

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (tableNumber: string, items: OrderItem[], orderType?: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  subscribeToOrders: () => () => void;
}

const mapOrderFromDB = (dbOrder: any): Order => ({
  id: dbOrder.id,
  tableNumber: dbOrder.table_number || dbOrder.tableNumber,
  status: dbOrder.status,
  orderType: dbOrder.order_type || dbOrder.orderType || 'DINE_IN',
  totalAmount: dbOrder.total || dbOrder.totalAmount || 0,
  createdAt: dbOrder.created_at || dbOrder.createdAt || new Date().toISOString(),
  items: (dbOrder.items || []).map((item: any) => ({
    menuName: item.menu_name || item.menuName,
    quantity: item.quantity,
    price: item.unit_price || item.price,
    notes: item.notes
  }))
});

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .in('status', ['pending', 'completed'])
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true }); // Assume created_at is snake_case

      if (error) throw error;
      set({ orders: (data || []).map(mapOrderFromDB) });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addOrder: async (tableNumber: string, items: OrderItem[], orderType: string = 'dine-in') => {
    try {
      const type = orderType === 'take-away' ? 'take-away' : 'dine-in';
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: tableNumber,
          order_type: type,
          status: 'pending',
          total: totalAmount
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        menu_id: item.menuId, // Link to menu for stock deduction
        menu_name: item.menuName,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.notes || ''
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);


      if (itemsError) throw itemsError;
      
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  completeOrder: async (orderId: string) => {
    console.log('🔄 START: Attempting to complete order ID:', orderId);
    try {
      console.log('📡 Calling Supabase update for order:', orderId);
      const { data, error, status, statusText } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Supabase ERROR:', error.message, 'Code:', error.code, 'Details:', error.details);
        alert(`Gagal menyelesaikan pesanan: ${error.message}`);
        throw error;
      }

      console.log('✅ Supabase SUCCESS:', data);
      console.log('📊 HTTP Status:', status, statusText);

      if (!data || data.length === 0) {
        console.warn('⚠️ Order ID not found or no rows updated.');
        alert('Peringatan: Pesanan tidak ditemukan atau tidak ada data yang berubah.');
      }

      set((state) => ({
        orders: state.orders.map(order =>
          String(order.id) === String(orderId) ? { ...order, status: 'completed' } : order
        ),
      }));

      // AUTO-DEDUCT STOCK (ERP Engine)
      const completedOrder = get().orders.find(o => String(o.id) === String(orderId));
      if (completedOrder) {
          const menuItems = useMenuStore.getState().items;
          useInventoryStore.getState().deductStockFromOrder(menuItems, completedOrder);
      }

      console.log('✨ Local state & inventory updated for order:', orderId);
    } catch (error: any) {
      console.error('❌ CATCH BLOCK ERROR:', error);
      alert(`Terjadi kesalahan sistem: ${error.message || 'Unknown error'}`);
    }
  },

  subscribeToOrders: () => {
    console.log('🔔 Subscribing to Supabase real-time orders...');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('📦 Order Change Detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const { data, error } = await supabase
              .from('orders')
              .select('*, items:order_items(*)')
              .eq('id', payload.new.id)
              .single();
              
            if (!error && data) {
               const mappedOrder = mapOrderFromDB(data);
               set({ orders: [mappedOrder, ...get().orders] });
               window.dispatchEvent(new CustomEvent('new-order-ping', { detail: mappedOrder }));
            }
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status === 'cancelled') {
               set({ orders: get().orders.filter(o => o.id !== payload.new.id) });
            } else {
                set({ 
                  orders: get().orders.map(o => {
                    if (String(o.id) === String(payload.new.id)) {
                      const mappedUpdate = mapOrderFromDB(payload.new);
                     // Preserve existing items if the real-time payload doesn't include joined items
                     mappedUpdate.items = payload.new.items ? mappedUpdate.items : o.items;
                     return { ...o, ...mappedUpdate };
                   }
                   return o;
                 }) 
               });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔕 Unsubscribing from orders...');
      supabase.removeChannel(channel);
    };
  },
}));
