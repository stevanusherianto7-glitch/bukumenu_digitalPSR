import { vi } from 'vitest';
import { MenuItem, CartItem, Addon } from '../../types';

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Soto Pindang Kudus',
    description: 'Soto tradisional dengan rasa gurih',
    price: 25000,
    imageUrl: 'https://example.com/soto.jpg',
    category: 'Makanan',
    isFavorite: true,
    isAvailable: true,
    isNew: false,
    rating: 4.5,
    prepTime: 10,
  },
  {
    id: '2',
    name: 'Teh Tarik',
    description: 'Minuman tradisional yang menyegarkan',
    price: 8000,
    imageUrl: 'https://example.com/tehtarik.jpg',
    category: 'Minuman',
    isFavorite: false,
    isAvailable: true,
    isNew: true,
    rating: 4.8,
    prepTime: 3,
  },
  {
    id: '3',
    name: 'Nasi Goreng',
    description: 'Nasi goreng dengan telur dan sayuran',
    price: 30000,
    imageUrl: 'https://example.com/nasigoreng.jpg',
    category: 'Makanan',
    isFavorite: false,
    isAvailable: true,
    isNew: false,
    rating: 4.2,
    prepTime: 12,
  },
];

export const mockAddons: Addon[] = [
  {
    id: 'a1',
    name: 'Telur Ekstra',
    price: 5000,
  },
  {
    id: 'a2',
    name: 'Ayam Tambahan',
    price: 10000,
  },
];

export const mockCartItems: CartItem[] = [
  {
    ...mockMenuItems[0],
    cartId: '1-notes-',
    quantity: 2,
    notes: 'Tidak pedas',
    selectedAddons: [mockAddons[0]],
  },
  {
    ...mockMenuItems[1],
    cartId: '2-notes-',
    quantity: 1,
    notes: '',
    selectedAddons: [],
  },
];

export const mockCategories = ['Terlaris', 'Makanan', 'Minuman', 'Menu Baru'];
