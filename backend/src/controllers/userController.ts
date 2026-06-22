import { Response, NextFunction } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../types';

const getUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(_req.query.page as string) || 1;
    const limit = parseInt(_req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const ordersCount = await Order.countDocuments({ userId: user._id });

    res.json({
      success: true,
      user,
      ordersCount,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    await Order.deleteMany({ userId: user._id });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenueResult,
      recentOrders,
      salesData,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email'),
      Order.aggregate([
        { $match: { createdAt: { $gte: lastMonth }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const revenue = totalRevenueResult[0]?.total || 0;

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const orderStatusCounts: Record<string, number> = {};
    statusCounts.forEach((s: { _id: string; count: number }) => {
      orderStatusCounts[s._id] = s.count;
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        revenue,
        orderStatusCounts,
        recentOrders,
        salesData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getUsers, getUser, updateUser, deleteUser, getDashboardStats };
