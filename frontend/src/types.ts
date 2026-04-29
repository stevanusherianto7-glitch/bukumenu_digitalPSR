
export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'Kg' | 'Gram' | 'L' | 'Ml' | 'Pcs' | 'Pack';
  currentStock: number;
  safetyStock: number;
  pricePerUnit: number;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // Jumlah yang dibutuhkan (dalam unit bahan baku atau unit konversi)
  unit: string;
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
  category: string; // Diubah jadi string karena kategori sekarang dinamis
  rating?: number; 
  prepTime?: number; 
  calories?: number; 
  updatedAt?: Date;
  imageFile?: File; 
  addons?: Addon[];
  recipe?: RecipeItem[]; // Takaran resep untuk HPP & Stok
  hpp?: number; // Harga Pokok Penjualan (HPP) total
}

export interface StockTransaction {
  id: string;
  ingredientId: string;
  type: 'IN' | 'OUT'; // IN (Pembelian/Masuk), OUT (Pemakaian/Penjualan/Penyusutan)
  quantity: number;
  referenceId?: string; // ID Pesanan atau ID Pembelian
  createdAt: string;
  note?: string;
}

export interface CartItem extends MenuItem {
  cartId: string;
  quantity: number;
  notes?: string;
  selectedAddons?: Addon[];
}

export type Category = string;

export interface OrderItem {
  id?: string;
  menuId?: string; // Menghubungkan ke menu untuk potong stok
  menuName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderType?: 'DINE_IN' | 'TAKE_AWAY';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

