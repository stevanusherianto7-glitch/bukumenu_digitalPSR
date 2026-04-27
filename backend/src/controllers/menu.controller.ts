
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/menu (Public)
export const getMenu = async (req: Request, res: Response) => {
  try {
    // Ambil semua item menu dari database
    const items = await prisma.menuItem.findMany({
      orderBy: { category: 'asc' }
    });

    // Ambil kategori unik dari item yang ada
    const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
    
    // Tambahkan kategori default
    const categories = ['Terlaris', 'Menu Baru', ...uniqueCategories].filter((v, i, a) => a.indexOf(v) === i);

    res.json({ items, categories });
  } catch (error) {
    console.error('Get Menu Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data menu' });
  }
};

// POST /api/menu (Admin Only - akan diproteksi middleware di routes)
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, category, isFavorite, isNew, prepTime, calories } = req.body;
    
    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl,
        category,
        isFavorite: Boolean(isFavorite),
        isNew: Boolean(isNew),
        prepTime: Number(prepTime),
        calories: Number(calories)
      }
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat menu baru' });
  }
};

// PUT /api/menu/:id (Admin Only)
export const updateMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedItem = await prisma.menuItem.update({
            where: { id },
            data: req.body
        });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Gagal update menu' });
    }
};

// DELETE /api/menu/:id (Admin Only)
export const deleteMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.menuItem.delete({ where: { id } });
        res.json({ message: 'Menu berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus menu' });
    }
};
