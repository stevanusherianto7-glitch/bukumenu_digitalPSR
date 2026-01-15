import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createOrderSchema } from '../lib/validators';

// 1. Terima Pesanan dari Tablet/HP Pelanggan
export const createOrder = async (req: Request, res: Response) => {
  try {
    // Input validation
    const validatedData = createOrderSchema.parse(req.body);
    const { tableNumber, items, notes } = validatedData;

    // Hitung total di server untuk keamanan (prevent price manipulation)
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = await prisma.order.create({
      data: {
        tableNumber: tableNumber || null,
        status: 'pending',
        items: items as any, // Store as JSON array
        total,
        notes: notes || null,
      },
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Data tidak valid', 
        errors: error.errors 
      });
    }
    
    // Security: Don't expose error details
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Gagal menyimpan pesanan' });
  }
};

// 2. Monitoring Pesanan (Untuk HP Waiter) - HANYA AMBIL YANG PENDING
export const getOrders = async (req: Request, res: Response) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'pending' // Only get active orders
      },
      orderBy: { createdAt: 'asc' }, // Oldest first
    });
    res.json(pendingOrders);
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data pesanan' });
  }
};

// 3. Menyelesaikan Pesanan (Dipanggil dari HP Waiter)
export const completeOrderController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'completed' }
    });
    res.json(updatedOrder);
  } catch (error: any) {
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    console.error(`Error completing order ${id}:`, error);
    res.status(500).json({ message: 'Gagal menyelesaikan pesanan' });
  }
};


// 4. Analytics Sederhana (Total Omset Hari Ini)
export const getSalesAnalytics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.order.aggregate({
      _sum: { total: true }, // Fixed: use 'total' not 'totalAmount'
      _count: { id: true },
      where: {
        createdAt: { gte: today }, // Fixed: use 'createdAt' not 'timestamp'
        status: 'completed' // Fixed: lowercase to match schema default
      }
    });

    res.json({
      date: today,
      totalRevenue: result._sum.total || 0,
      totalTransactions: result._count.id || 0
    });
  } catch (error) {
    console.error('Sales Analytics Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data analytics' });
  }
};
