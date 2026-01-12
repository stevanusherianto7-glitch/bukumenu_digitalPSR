

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isFavorite?: boolean;
  category: string;
  rating?: number; // New: 4.5, 4.8 etc
  prepTime?: number; // New: in minutes
  calories?: number; // New: in kcal
  updatedAt?: Date;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export type Category = 
  | 'Terlaris' 
  | 'Menu Baru' 
  | 'Menu Paket 2 Orang' 
  | 'Paket 4 Orang' 
  | 'Paket Keluarga'
  | 'Makanan Utama' 
  | 'Minuman' 
  | 'Snack' 
  | 'Oleh-oleh';

// FIX: Add Order and OrderItem interfaces for WaiterTableSection component
export interface OrderItem {
  menuName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  status: 'pending' | 'completed';
  timestamp: number;
  items: OrderItem[];
}