import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Order, OrderItem } from '../types';

/** Raw DB row shape from Supabase `orders` table */
interface DbOrder {
  id: string;
  status: string;
  order_type?: string;
  table_number?: string;
  total?: number;
  notes?: string;
  created_at?: string;
}

/** Raw DB row shape from Supabase `order_items` table */
interface DbOrderItem {
  id: string;
  order_id: string;
  menu_id?: string;
  menuId?: string;
  menu_name?: string;
  menuName?: string;
  quantity: number;
  unit_price?: number;
  price?: number;
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

const recentlyNotifiedOrders = new Set<string>();
const clearNotificationDelayMs = 5000;

const parseOrderMetadata = (notes?: string | null) => {
  const rawNotes = typeof notes === 'string' ? notes : '';
  const orderTypeMatch = rawNotes.match(/\[(DINE IN|TAKE AWAY)\]/i);
  const tableNumberMatch = rawNotes.match(/\[Meja\s*([^\]]+)\]/i);
  const isCompleted = rawNotes.includes('[COMPLETED]');

  const orderType = orderTypeMatch
    ? /take/i.test(orderTypeMatch[1])
      ? 'take-away'
      : 'dine-in'
    : 'dine-in';

  const tableNumber = tableNumberMatch
    ? tableNumberMatch[1].trim().toUpperCase()
    : 'A1';

  const cleanedNotes = rawNotes
    .replace(/\[(DINE IN|TAKE AWAY)\]/gi, '')
    .replace(/\[Meja\s*[^\]]+\]/gi, '')
    .replace(/\[COMPLETED\]/gi, '')
    .trim();

  return { orderType, tableNumber, notes: cleanedNotes, isCompleted };
};

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  addOrder: (tableNumber: string, items: OrderItem[], orderType?: string, finalTotal?: number) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  clearStalePendingOrders: (maxAgeMinutes?: number) => Promise<number>;
  subscribeToOrders: () => () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      // Fetch both orders and order_items to get complete order data with status
      const [orderItemsResult, ordersResult] = await Promise.all([
        supabase
          .from('order_items')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (orderItemsResult.error) throw orderItemsResult.error;

      // Create a map of order statuses from the orders table (if it exists)
      const orderStatusMap = new Map<string, { status: string; orderType?: string }>();
      if (ordersResult.data) {
        ordersResult.data.forEach((order: DbOrder) => {
          orderStatusMap.set(order.id, {
            status: order.status || 'pending',
            orderType: order.order_type
          });
        });
      }

      // Grouping item berdasarkan order_id
      const ordersMap = new Map<string, Order>();

      orderItemsResult.data.forEach((item: DbOrderItem) => {
        const orderId = item.order_id;
        const parsed = parseOrderMetadata(item.notes);

        if (!ordersMap.has(orderId)) {
          const orderData = orderStatusMap.get(orderId);
          
          // Determine status: if it has [COMPLETED] in notes, it's completed, otherwise fallback to orders table or pending
          const status = parsed.isCompleted ? 'completed' : (orderData?.status as Order['status'] || 'pending');

          ordersMap.set(orderId, {
            id: orderId,
            tableNumber: parsed.tableNumber,
            orderType: (orderData?.orderType || parsed.orderType) as Order['orderType'],
            status: status,
            totalAmount: 0,
            items: [],
            createdAt: item.created_at || item.createdAt || new Date().toISOString()
          });
        }

        const order = ordersMap.get(orderId)!;
        order.items.push({
          menuId: item.menu_id || item.menuId,
          menuName: item.menu_name || item.menuName,
          quantity: Number(item.quantity) || 0,
          price: Number(item.unit_price || item.price) || 0,
          notes: parsed.notes || undefined
        });
        order.totalAmount += (Number(item.quantity) || 0) * (Number(item.unit_price || item.price) || 0);
      });

      set({ orders: Array.from(ordersMap.values()), isLoading: false });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      set({ isLoading: false });
    }
  },

  addOrder: async (tableNumber: string, items: OrderItem[], orderType: string = 'dine-in', finalTotal?: number) => {
    try {
      // Generate order_id baru (UUID)
      const orderId = crypto.randomUUID();
      const typeStr = orderType === 'take-away' ? 'TAKE AWAY' : 'DINE IN';

      // Calculate total from items
      const calculatedTotal = finalTotal ?? items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      // Insert into orders table first (required for completeOrder to work)
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          table_number: tableNumber,
          status: 'pending',
          order_type: orderType,
          total: calculatedTotal,
          notes: `[${typeStr}] [Meja ${tableNumber}]`
        });

      if (orderError) {
        console.warn('Could not insert into orders table (may not exist yet):', orderError);
        // Continue anyway - order_items is the primary data source
      }

      const orderItems = items.map(item => ({
        order_id: orderId,
        menu_id: item.menuId,
        menu_name: item.menuName,
        quantity: item.quantity,
        unit_price: item.price,
        notes: `[${typeStr}] [Meja ${tableNumber}] ${item.notes || ''}`
      }));

      console.log('[DEBUG] Menyimpan order_items ke Supabase...', orderItems);

      const { error } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (error) throw error;

      await get().fetchOrders();
    } catch (error) {
      console.error("Failed to add order:", error);
      throw error;
    }
  },

  completeOrder: async (orderId: string) => {
    console.log('🔄 Selesaikan pesanan untuk ID:', orderId);

    // Update local state optimistically for immediate UI feedback
    set((state) => ({
      orders: state.orders.map(order =>
        order.id === orderId ? { ...order, status: 'completed' } : order
      ),
    }));

    // Persist to database - karena tabel orders tidak ada, kita update notes di order_items
    try {
      const { data: items, error: fetchError } = await supabase
        .from('order_items')
        .select('id, notes')
        .eq('order_id', orderId);

      if (fetchError) throw fetchError;

      if (items && items.length > 0) {
        // Update all items to have [COMPLETED] in their notes
        await Promise.all(items.map(item => {
          if (!item.notes?.includes('[COMPLETED]')) {
            return supabase
              .from('order_items')
              .update({ notes: `${item.notes || ''} [COMPLETED]` })
              .eq('id', item.id);
          }
          return Promise.resolve();
        }));
      }

      console.log(`✅ Order ${orderId} marked as completed in database via order_items notes`);
      
      // Paksa sinkronisasi ulang agar semua klien up-to-date
      await get().fetchOrders();
    } catch (error) {
      console.error('Failed to complete order:', error);
      // Revert local state on error
      set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId ? { ...order, status: 'pending' } : order
        ),
      }));
      throw error;
    }
  },

  clearStalePendingOrders: async (maxAgeMinutes: number = 180) => {
    const threshold = Math.max(1, Math.floor(maxAgeMinutes));
    const cutoff = Date.now() - threshold * 60000;
    set((state) => ({
      orders: state.orders.filter(order => {
        const createdTime = new Date(order.createdAt).getTime();
        return order.status !== 'pending' || Number.isNaN(createdTime) || createdTime >= cutoff;
      })
    }));
    return Promise.resolve(0);
  },

  subscribeToOrders: () => {
    console.log('🔔 Subscribing to order_items changes...');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items'
        },
        async (payload) => {
          console.log('📦 order_items Change Detected:', payload);
          await get().fetchOrders();

          if (payload.eventType === 'INSERT' && payload.new?.order_id) {
            const orderId = payload.new.order_id;
            if (!recentlyNotifiedOrders.has(orderId)) {
              const createdOrder = get().orders.find(order => order.id === orderId);
              if (createdOrder) {
                recentlyNotifiedOrders.add(orderId);
                setTimeout(() => recentlyNotifiedOrders.delete(orderId), clearNotificationDelayMs);
                window.dispatchEvent(new CustomEvent('new-order-ping', { detail: createdOrder }));
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Real-time status: ${status}`);
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setTimeout(() => get().subscribeToOrders(), 5000);
        }
      });

    // Fallback polling tetap dipertahankan
    const pollInterval = setInterval(() => {
      get().fetchOrders();
    }, 15000);

    return () => {
      console.log('🔕 Unsubscribing from order_items...');
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  },
}));
