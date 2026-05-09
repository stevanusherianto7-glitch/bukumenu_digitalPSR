
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

// 5. Update order status to preparing
export const updateOrderToPreparing = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'preparing' }
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(`Error updating order ${id} to preparing:`, error);
    res.status(500).json({ message: 'Gagal mengupdate status pesanan ke preparing' });
  }
};

// 6. Update order status to ready
export const updateOrderToReady = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'ready' }
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(`Error updating order ${id} to ready:`, error);
    res.status(500).json({ message: 'Gagal mengupdate status pesanan ke ready' });
  }
};

// 7. Update order status to cancelled
export const cancelOrderController = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' }
    });
    res.json(updatedOrder);
  } catch (error) {
    console.error(`Error cancelling order ${id}:`, error);
    res.status(500).json({ message: 'Gagal membatalkan pesanan' });
  }
};

// 8. Get TTS Feed for waiter notifications
export const getTTSFeed = async (req: Request, res: Response) => {
  try {
    // Get orders that have recently changed status and haven't been acknowledged
    const pendingNotifications = await prisma.order.findMany({
      where: {
        status: {
          in: ['preparing', 'ready']
        }
      },
      include: { items: true },
      orderBy: { updatedAt: 'desc' }
    });

    // Format for TTS consumption
    const formattedFeed = pendingNotifications.map(order => ({
      id: order.id,
      tableNumber: order.tableNumber,
      orderType: order.orderType,
      status: order.status,
      items: order.items,
      message: order.status === 'preparing'
        ? `Pesanan untuk meja ${order.tableNumber} sedang disiapkan`
        : `Pesanan untuk meja ${order.tableNumber} sudah siap`,
      timestamp: order.updatedAt
    }));

    res.json(formattedFeed);
  } catch (error) {
    console.error('Error getting TTS feed:', error);
    res.status(500).json({ message: 'Gagal mengambil data notifikasi TTS' });
  }
};
