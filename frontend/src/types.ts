
export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isFavorite?: boolean;
  isAvailable?: boolean; 
  isNew?: boolean; 
  category: Category;
  rating?: number; 
  prepTime?: number; 
  calories?: number; 
  updatedAt?: Date;
  imageFile?: File; 
  addons?: Addon[]; // New: List of possible addons for this item
}

export interface CartItem extends MenuItem {
  cartId: string; // Unique ID for this specific configuration
  quantity: number;
  notes?: string;
  selectedAddons?: Addon[]; // New: Addons chosen by the user
}

// Tipe kategori disederhanakan agar sesuai dengan data menu baru dari pengguna.
export type Category = 
  | 'Terlaris' 
  | 'Menu Baru'
  | 'Makanan'
  | 'Minuman'
  | 'Snack';

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
