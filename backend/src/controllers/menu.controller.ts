import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createMenuItemSchema, updateMenuItemSchema } from '../lib/validators';

// GET /api/menu (Public)
export const getMenu = async (req: Request, res: Response) => {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { category: 'asc' }
    });

    const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
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
    // Input validation
    const validatedData = createMenuItemSchema.parse(req.body);
    
    const newItem = await prisma.menuItem.create({
      data: validatedData
    });
    
    res.status(201).json(newItem);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: error.errors 
      });
    }
    console.error('Create Menu Error:', error);
    res.status(500).json({ message: 'Gagal membuat menu baru' });
  }
};

// PUT /api/menu/:id (Admin Only)
export const updateMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Input validation - only allow specific fields to be updated
        const validatedData = updateMenuItemSchema.parse(req.body);
        
        // Remove fields that shouldn't be updated
        const { id: _, createdAt: __, updatedAt: ___, ...updateData } = validatedData as any;
        
        const updatedItem = await prisma.menuItem.update({
            where: { id },
            data: updateData
        });
        res.json(updatedItem);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ 
                message: 'Data tidak valid', 
                errors: error.errors 
            });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        console.error('Update Menu Error:', error);
        res.status(500).json({ message: 'Gagal update menu' });
    }
};

// DELETE /api/menu/:id (Admin Only)
export const deleteMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.menuItem.delete({ where: { id } });
        res.json({ message: 'Menu berhasil dihapus' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }
        console.error('Delete Menu Error:', error);
        res.status(500).json({ message: 'Gagal menghapus menu' });
    }
};
