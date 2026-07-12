import { Response, NextFunction } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import LoginHistory from '../models/LoginHistory';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendCreated, sendDeleted } from '../utils/response';

const getUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(_req.query.page as string) || 1;
    const limit = parseInt(_req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'userId',
            as: 'orders',
          },
        },
        {
          $addFields: {
            ordersCount: { $size: '$orders' },
          },
        },
        {
          $project: {
            password: 0,
            orders: 0,
          },
        },
      ]),
    ]);

    sendSuccess(res, {
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
      sendError(res, 'User not found', 404);
      return;
    }

    const [ordersCount, totalSpentResult] = await Promise.all([
      Order.countDocuments({ userId: user._id }),
      Order.aggregate([
        { $match: { userId: user._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const totalSpent = totalSpentResult[0]?.total || 0;

    sendSuccess(res, {
      user,
      ordersCount,
      totalSpent,
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
    const { name, role, permissions } = req.body;
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = permissions;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const [orders, total] = await Promise.all([
      Order.find({ userId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId: id }),
    ]);

    sendSuccess(res, {
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
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
      sendError(res, 'User not found', 404);
      return;
    }

    await Order.deleteMany({ userId: user._id });

    sendDeleted(res);
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
      totalPromotionDiscountResult,
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
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$promotionDiscount' } } },
      ]),
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
    const totalPromotionDiscount = totalPromotionDiscountResult[0]?.total || 0;

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const orderStatusCounts: Record<string, number> = {};
    statusCounts.forEach((s: { _id: string; count: number }) => {
      orderStatusCounts[s._id] = s.count;
    });

    sendSuccess(res, {
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        revenue,
        totalPromotionDiscount,
        orderStatusCounts,
        recentOrders,
        salesData,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserLoginHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const [events, total] = await Promise.all([
      LoginHistory.find({ userId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LoginHistory.countDocuments({ userId: id }),
    ]);

    sendSuccess(res, {
      events,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const createAdminUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
      sendError(res, 'Name, email, and password are required', 400);
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'A user with this email already exists', 409);
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      provider: 'local',
      isVerified: true,
      permissions: permissions || [],
    });

    sendCreated(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const bulkDeleteUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      sendError(res, 'User IDs array is required', 400);
      return;
    }

    // Don't allow deleting yourself
    const filteredIds = ids.filter((id: string) => id !== req.user?.id);

    await User.deleteMany({ _id: { $in: filteredIds } });

    sendDeleted(res, `${filteredIds.length} users deleted successfully`);
  } catch (error) {
    next(error);
  }
};

const getPermissionsList = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissionDefs = [
      { resource: 'dashboard', label: 'Dashboard', description: 'View dashboard analytics' },
      { resource: 'products', label: 'Products', description: 'Manage products (CRUD)' },
      { resource: 'categories', label: 'Categories', description: 'Manage categories' },
      { resource: 'orders', label: 'Orders', description: 'Manage orders and status' },
      { resource: 'users', label: 'Users', description: 'Manage users' },
      { resource: 'roles', label: 'Roles & Permissions', description: 'Manage admin roles and permissions' },
      { resource: 'transactions', label: 'Transactions', description: 'View and manage transactions' },
      { resource: 'heroSlides', label: 'Hero Slides', description: 'Manage hero slideshows' },
      { resource: 'settings', label: 'Settings', description: 'Manage site settings' },
    ];

    sendSuccess(res, { permissions: permissionDefs });
  } catch (error) {
    next(error);
  }
};

export { getUsers, getUser, updateUser, deleteUser, getUserOrders, getUserLoginHistory, getUserLoginHistory as getUserLoginHistoryAlt, getDashboardStats, createAdminUser, bulkDeleteUsers, getPermissionsList };
