
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Terima Pesanan dari Tablet/HP Pelanggan
export const createOrder = async (req: Request, res: Response) => {
  const { tableNumber, items, orderType } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Pesanan kosong' });
  }

  // Hitung total di server untuk keamanan
  const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  // Map orderType string to Prisma Enum
  const type = orderType === 'take-away' ? 'TAKE_AWAY' : 'DINE_IN';

  try {
    const newOrder = await prisma.order.create({
      data: {
        tableNumber,
        totalAmount,
        orderType: type,
        status: 'pending', // Status awal selalu 'pending'
        items: {
          create: items.map((item: any) => ({
            menuName: item.menuName,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || ''
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Gagal menyimpan pesanan ke Cloud' });
  }
};

// 2. Monitoring Pesanan (Untuk HP Waiter) - HANYA AMBIL YANG PENDING
export const getOrders = async (req: Request, res: Response) => {
  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'pending' // Kunci: Hanya ambil pesanan yang masih aktif
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' }, // Tampilkan yang paling lama masuk di atas
    });
    res.json(pendingOrders);
  } catch (error) {
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
  } catch (error) {
    console.error(`Error completing order ${id}:`, error);
    res.status(500).json({ message: 'Gagal menyelesaikan pesanan di server' });
  }
};


// 4. Analytics Sederhana (Total Omset Hari Ini)
export const getSalesAnalytics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const result = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: {
        createdAt: { gte: today },
        status: 'completed'
      }
    });

    res.json({
      date: today,
      totalRevenue: result._sum.totalAmount || 0,
      totalTransactions: result._count.id || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error analytics' });
  }
};
