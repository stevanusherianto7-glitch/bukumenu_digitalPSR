
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// GET /api/analytics/sales
export const getSalesRecap = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  
  // Filter berdasarkan periode
  const { period } = req.query; // 'today', '7days', '30days'
  
  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0); // Default Today start

  if (period === '7days') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === '30days') {
    startDate.setDate(startDate.getDate() - 30);
  }

  // Filter scope (Owner liat semua cabangnya, Manager liat cabangnya aja)
  const whereClause: any = {
    createdAt: {
      gte: startDate
    },
    status: 'COMPLETED' // Hanya hitung order yang selesai
  };

  if (user?.role === 'RESTAURANT_MANAGER' || user?.role === 'STAFF_FOH') {
     if (user.restaurantId) {
         whereClause.restaurantId = user.restaurantId;
     }
  }
  // Note: Owner & Super Admin gets all data if restaurantId not specified in params

  try {
    // 1. Hitung Total Revenue & Transaksi
    const aggregator = await prisma.order.aggregate({
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      },
      where: whereClause
    });

    const totalRevenue = aggregator._sum.totalAmount || 0;
    const totalTransactions = aggregator._count.id || 0;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // 2. Cari Menu Terlaris (Best Seller)
    // Group by menuName from OrderItem
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuName'],
      where: {
        order: whereClause // Filter item berdasarkan order yang valid
      },
      _sum: {
        quantity: true,
        price: true // Ini tricky, price * qty harusnya manual, tapi prisma groupBy terbatas. 
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5 // Top 5
    });
    
    // Perbaikan perhitungan Revenue per Item (karena groupBy Prisma limitasi)
    // Kita map manual agar format sesuai frontend
    const sortedMenu = topItems.map(item => ({
      name: item.menuName,
      qty: item._sum.quantity || 0,
      // Estimasi revenue per item (Average Price * Qty) - Untuk akurasi tinggi butuh raw query
      revenue: 0 // Placeholder, frontend bisa hitung atau kita pakai raw query nanti
    }));

    res.json({
      totalRevenue,
      totalTransactions,
      avgTransaction,
      sortedMenu,
      period
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data laporan penjualan.' });
  }
};
