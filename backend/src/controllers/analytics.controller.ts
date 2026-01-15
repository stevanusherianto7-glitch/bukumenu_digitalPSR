import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { analyticsQuerySchema } from '../lib/validators';

// GET /api/analytics/sales
export const getSalesRecap = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const user = authReq.user;
    
    // Input validation
    const { period } = analyticsQuerySchema.parse(req.query);
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

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
      status: 'completed' // Fixed: lowercase to match schema
    };

    if (user?.role === 'RESTAURANT_MANAGER' || user?.role === 'STAFF_FOH') {
      if (user.restaurantId) {
        whereClause.restaurantId = user.restaurantId;
      }
    }
    // Note: Owner & Super Admin gets all data if restaurantId not specified in params

    // 1. Hitung Total Revenue & Transaksi
    const aggregator = await prisma.order.aggregate({
      _sum: {
        total: true // Fixed: use 'total' not 'totalAmount'
      },
      _count: {
        id: true
      },
      where: whereClause
    });

    const totalRevenue = aggregator._sum.total || 0;
    const totalTransactions = aggregator._count.id || 0;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // 2. Cari Menu Terlaris (Best Seller)
    // Since items are stored as JSON, we need to use raw query or process in memory
    // For now, get all completed orders and process items
    const completedOrders = await prisma.order.findMany({
      where: whereClause,
      select: { items: true }
    });

    // Process items from JSON to calculate best sellers
    const menuStats: Record<string, { qty: number; revenue: number }> = {};
    
    completedOrders.forEach(order => {
      const items = order.items as any[];
      if (Array.isArray(items)) {
        items.forEach(item => {
          const menuName = item.menuName || item.name;
          if (!menuStats[menuName]) {
            menuStats[menuName] = { qty: 0, revenue: 0 };
          }
          menuStats[menuName].qty += item.quantity || 0;
          menuStats[menuName].revenue += (item.price || 0) * (item.quantity || 0);
        });
      }
    });

    // Convert to array and sort by quantity
    const sortedMenu = Object.entries(menuStats)
      .map(([name, stats]) => ({
        name,
        qty: stats.qty,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5); // Top 5

    res.json({
      totalRevenue,
      totalTransactions,
      avgTransaction,
      sortedMenu,
      period
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        message: 'Parameter tidak valid', 
        errors: error.errors 
      });
    }
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data laporan penjualan' });
  }
};
