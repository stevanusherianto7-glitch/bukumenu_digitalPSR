import { z } from 'zod';

// Menu Item Validation
export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Nama menu wajib diisi').max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive('Harga harus positif').max(10000000),
  imageUrl: z.string().url('URL gambar tidak valid').optional().or(z.literal('')),
  category: z.string().min(1, 'Kategori wajib diisi'),
  isFavorite: z.boolean().default(false),
  isNew: z.boolean().default(false),
  rating: z.number().min(0).max(5).optional(),
  prepTime: z.number().int().positive().max(300).optional(),
  calories: z.number().int().positive().max(10000).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

// Order Validation
export const orderItemSchema = z.object({
  menuName: z.string().min(1, 'Nama menu wajib diisi'),
  quantity: z.number().int().positive('Quantity harus positif').max(100),
  price: z.number().positive('Harga harus positif'),
  notes: z.string().max(200).optional(),
});

export const createOrderSchema = z.object({
  tableNumber: z.string().max(20).optional(),
  items: z.array(orderItemSchema).min(1, 'Pesanan tidak boleh kosong'),
  notes: z.string().max(500).optional(),
});

// Analytics Query Validation
export const analyticsQuerySchema = z.object({
  period: z.enum(['today', '7days', '30days']).optional().default('today'),
});
