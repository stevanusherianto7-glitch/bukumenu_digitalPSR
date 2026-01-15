
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isFavorite?: boolean;
  isAvailable?: boolean; // New: true for available, false for out of stock
  isNew?: boolean; // New: To mark new menu items
  // FIX: Improved type safety by using the Category union type instead of a generic string.
  category: Category;
  rating?: number; // New: 4.5, 4.8 etc
  prepTime?: number; // New: in minutes
  calories?: number; // New: in kcal
  updatedAt?: Date;
  imageFile?: File; // For handling new image uploads
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
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