
import { MenuItem, Category } from './types';

// Data ini sekarang menjadi sumber utama untuk menu, menggantikan backend.
// Semua perubahan pada menu (misalnya melalui mode admin) akan di-handle di state React
// dan disimpan di localStorage/IndexedDB, bukan di sini.
export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Nasi Goreng Spesial',
    description: 'Nasi goreng dengan bumbu rahasia warisan keluarga, disajikan dengan telur mata sapi, kerupuk udang, dan acar segar.',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f571d70f2?auto=format&fit=crop&w=800&q=80',
    isFavorite: true,
    category: 'Makanan Utama',
    rating: 4.8,
    prepTime: 15,
    calories: 450
  },
  {
    id: '2',
    name: 'Sate Ayam Madura',
    description: 'Sate ayam daging paha juicy dengan bumbu kacang yang gurih dan legit, lengkap dengan irisan bawang merah dan cabai rawit.',
    price: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80',
    isFavorite: true,
    category: 'Makanan Utama',
    rating: 4.9,
    prepTime: 20,
    calories: 380
  },
  {
    id: '3',
    name: 'Beef Burger Premium',
    description: 'Burger daging sapi Australia 150gr dengan keju cheddar leleh, selada organik, tomat, dan saus spesial buatan sendiri.',
    price: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    isFavorite: false,
    category: 'Makanan Utama',
    rating: 4.5,
    prepTime: 15,
    calories: 620
  },
  {
    id: '4',
    name: 'Spaghetti Bolognese',
    description: 'Pasta spaghetti al dente dengan saus daging sapi cincang tomat klasik bertabur keju parmesan asli.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=800&q=80',
    isFavorite: false,
    category: 'Makanan Utama',
    rating: 4.6,
    prepTime: 18,
    calories: 410
  },
  {
    id: '5',
    name: 'Es Teh Manis',
    description: 'Teh melati pilihan diseduh dengan suhu pas, disajikan dingin menyegarkan dahaga.',
    price: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    isFavorite: false,
    category: 'Minuman',
    rating: 4.5,
    prepTime: 5,
    calories: 90
  },
  {
    id: '6',
    name: 'Kopi Susu Gula Aren',
    description: 'Kopi espresso robusta dicampur dengan susu segar creamy dan gula aren organik asli.',
    price: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    isFavorite: true,
    category: 'Minuman',
    rating: 4.9,
    prepTime: 5,
    calories: 180
  }
];

export const CATEGORIES: Category[] = [
  'Terlaris', 
  'Menu Baru',
  'Menu Paket 2 Orang',
  'Paket 4 Orang',
  'Paket Keluarga',
  'Makanan Utama', 
  'Minuman', 
  'Snack', 
  'Oleh-oleh'
];
