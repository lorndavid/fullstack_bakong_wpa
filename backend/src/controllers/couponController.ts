import { Response, NextFunction } from 'express';
import Coupon from '../models/Coupon';
import Order from '../models/Order';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';
import { AuthRequest } from '../types';
import { createAndSendNotification } from '../services/notificationService';
import { uploadToCloudinary } from '../services/cloudinary';
import { saveFileLocally } from '../services/fileStorage';
import { sendSuccess, sendError, sendCreated, sendDeleted } from '../utils/response';

// ─── Helpers ──────────────────────────────────────────────────────

function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function parseJson(val: any): any {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

// ─── Admin: List Coupons ──────────────────────────────────────────

const getCoupons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.discountType) {
      filter.discountType = req.query.discountType;
    }

    let sort: Record<string, any> = { createdAt: -1 };
    if (req.query.sort === 'name') sort = { name: 1 };
    if (req.query.sort === 'usage') sort = { usedCount: -1 };
    if (req.query.sort === 'priority') sort = { priority: -1 };
    if (req.query.sort === 'endDate') sort = { endDate: 1 };

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Coupon.countDocuments(filter),
    ]);

    sendSuccess(res, {
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Get Single Coupon ─────────────────────────────────────

const getCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('applicableProducts', 'name price images')
      .populate('applicableCategories', 'name icon')
      .populate('excludedProducts', 'name price images')
      .populate('excludedCategories', 'name icon')
      .populate('applicableUsers', 'name email');

    if (!coupon) {
      sendError(res, 'Coupon not found', 404);
      return;
    }

    sendSuccess(res, { coupon });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Create Coupon ─────────────────────────────────────────

const createCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      minimumPurchase,
      maximumDiscount,
      startDate,
      endDate,
      usageLimit,
      limitPerUser,
      status,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      applicableUsers,
      newCustomerOnly,
      firstOrderOnly,
      allowGuest,
      stackable,
      priority,
      autoApply,
      themeColor,
      isHighlighted,
      sendNotification,
      notificationType,
      notificationTitle,
      notificationMessage,
      sendTo,
      notificationScheduledFor,
      notificationButtonText,
    } = req.body;

    // Auto-generate code if not provided
    const couponCode = code?.trim() || generateCouponCode();

    // Check for duplicate code
    const existing = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (existing) {
      sendError(res, `Coupon code "${couponCode}" already exists`, 400);
      return;
    }

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      sendError(res, 'End date must be after start date', 400);
      return;
    }

    // Validate percentage
    if (discountType === 'percentage' && (Number(discountValue) < 0 || Number(discountValue) > 100)) {
      sendError(res, 'Percentage discount must be between 0 and 100', 400);
      return;
    }

    const couponData: any = {
      name,
      code: couponCode.toUpperCase(),
      description: description || '',
      discountType,
      discountValue: Number(discountValue) || 0,
      minimumPurchase: Number(minimumPurchase) || 0,
      maximumDiscount: Number(maximumDiscount) || 0,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: Number(usageLimit) || 0,
      limitPerUser: Number(limitPerUser) || 1,
      status: status || 'active',
      applicableProducts: parseJson(applicableProducts) || [],
      applicableCategories: parseJson(applicableCategories) || [],
      excludedProducts: parseJson(excludedProducts) || [],
      excludedCategories: parseJson(excludedCategories) || [],
      applicableUsers: parseJson(applicableUsers) || [],
      newCustomerOnly: newCustomerOnly === true || newCustomerOnly === 'true',
      firstOrderOnly: firstOrderOnly === true || firstOrderOnly === 'true',
      allowGuest: allowGuest === true || allowGuest === 'true',
      stackable: stackable === true || stackable === 'true',
      priority: Number(priority) || 0,
      autoApply: autoApply === true || autoApply === 'true',
      themeColor: themeColor || '#6366F1',
      isHighlighted: isHighlighted === true || isHighlighted === 'true',
      createdBy: req.user!.id,
    };

    // Handle banner image upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'coupons');
        couponData.bannerImage = result;
      } catch {
        const localResult = saveFileLocally(req.file);
        couponData.bannerImage = {
          public_id: 'local_' + localResult.public_id,
          secure_url: localResult.secure_url,
        };
      }
    }

    const coupon = await Coupon.create(couponData);

    // ── Handle notification sending ─────────────────────────
    if (sendNotification === true || sendNotification === 'true') {
      try {
        const notifAudience =
          sendTo === 'vip'
            ? 'all_users'
            : sendTo === 'selected'
            ? 'all_users'
            : 'all_users';

        const notifData: Record<string, any> = {
          couponId: coupon._id.toString(),
          couponCode: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        };

        let notifLink = `/coupons/${coupon._id}`;
        if (notificationButtonText) {
          notifData.buttonText = notificationButtonText;
        }

        await createAndSendNotification({
          recipient: { role: 'user' },
          type: 'new_coupon',
          title: notificationTitle || `🔥 ${coupon.name}`,
          message:
            notificationMessage ||
            `Get ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '$' + coupon.discountValue} OFF with code ${coupon.code}`,
          data: notifData,
          link: notifLink,
          channels: ['in_app'],
          scheduledFor: notificationScheduledFor
            ? new Date(notificationScheduledFor)
            : undefined,
        });
      } catch (notifErr) {
        console.warn('[Coupon] Failed to send notification:', notifErr);
      }
    }

    sendCreated(res, { coupon });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Update Coupon ─────────────────────────────────────────

const updateCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      sendError(res, 'Coupon not found', 404);
      return;
    }

    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      minimumPurchase,
      maximumDiscount,
      startDate,
      endDate,
      usageLimit,
      limitPerUser,
      status,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      applicableUsers,
      newCustomerOnly,
      firstOrderOnly,
      allowGuest,
      stackable,
      priority,
      autoApply,
      themeColor,
      isHighlighted,
    } = req.body;

    if (name) coupon.name = name;
    if (code) {
      const existing = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: coupon._id } });
      if (existing) {
        sendError(res, `Coupon code "${code}" already exists`, 400);
        return;
      }
      coupon.code = code.toUpperCase();
    }
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minimumPurchase !== undefined) coupon.minimumPurchase = Number(minimumPurchase);
    if (maximumDiscount !== undefined) coupon.maximumDiscount = Number(maximumDiscount);
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (limitPerUser !== undefined) coupon.limitPerUser = Number(limitPerUser);
    if (status) coupon.status = status;
    if (applicableProducts !== undefined) coupon.applicableProducts = parseJson(applicableProducts);
    if (applicableCategories !== undefined) coupon.applicableCategories = parseJson(applicableCategories);
    if (excludedProducts !== undefined) coupon.excludedProducts = parseJson(excludedProducts);
    if (excludedCategories !== undefined) coupon.excludedCategories = parseJson(excludedCategories);
    if (applicableUsers !== undefined) coupon.applicableUsers = parseJson(applicableUsers);
    if (newCustomerOnly !== undefined) coupon.newCustomerOnly = newCustomerOnly === true || newCustomerOnly === 'true';
    if (firstOrderOnly !== undefined) coupon.firstOrderOnly = firstOrderOnly === true || firstOrderOnly === 'true';
    if (allowGuest !== undefined) coupon.allowGuest = allowGuest === true || allowGuest === 'true';
    if (stackable !== undefined) coupon.stackable = stackable === true || stackable === 'true';
    if (priority !== undefined) coupon.priority = Number(priority);
    if (autoApply !== undefined) coupon.autoApply = autoApply === true || autoApply === 'true';
    if (themeColor) coupon.themeColor = themeColor;
    if (isHighlighted !== undefined) coupon.isHighlighted = isHighlighted === true || isHighlighted === 'true';

    // Handle banner image
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'coupons');
        coupon.bannerImage = result;
      } catch {
        const localResult = saveFileLocally(req.file);
        coupon.bannerImage = {
          public_id: 'local_' + localResult.public_id,
          secure_url: localResult.secure_url,
        };
      }
    }

    // Validate end > start
    if (coupon.endDate <= coupon.startDate) {
      sendError(res, 'End date must be after start date', 400);
      return;
    }

    await coupon.save();

    sendSuccess(res, { coupon });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Delete Coupon ─────────────────────────────────────────

const deleteCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      sendError(res, 'Coupon not found', 404);
      return;
    }
    await coupon.deleteOne();
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Update Coupon Status ─────────────────────────────────

const updateCouponStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!coupon) {
      sendError(res, 'Coupon not found', 404);
      return;
    }
    sendSuccess(res, { coupon });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Coupon Analytics ──────────────────────────────────────

const getCouponAnalytics = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();

    const [
      totalCoupons,
      activeCoupons,
      expiredCoupons,
      totalOrders,
      couponOrders,
      mostUsed,
      usageStats,
    ] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ status: 'active', startDate: { $lte: now }, endDate: { $gte: now } }),
      Coupon.countDocuments({ $or: [{ status: 'expired' }, { endDate: { $lt: now } }] }),
      Order.countDocuments(),
      Order.countDocuments({ coupon: { $exists: true, $ne: '' } }),
      Coupon.find().sort({ usedCount: -1 }).limit(5).select('name code usedCount discountValue discountType').lean(),
      Coupon.aggregate([
        { $group: { _id: null, totalUsed: { $sum: '$usedCount' }, avgUsage: { $avg: '$usedCount' } } },
      ]),
    ]);

    const totalUsed = usageStats[0]?.totalUsed || 0;
    const avgUsage = Math.round(usageStats[0]?.avgUsage || 0);

    // Daily redemption (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyRedemption = await Order.aggregate([
      {
        $match: {
          coupon: { $exists: true, $ne: '' },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
          discount: { $sum: { $ifNull: ['$discountAmount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top categories from coupon orders
    const orderIds = (await Order.find({ coupon: { $exists: true, $ne: '' } }).select('_id').lean()).map(
      (o: any) => o._id
    );

    // Coupon performance stats per coupon
    const couponPerformance = await Coupon.find()
      .sort({ usedCount: -1 })
      .limit(10)
      .select('name code usedCount discountValue discountType createdAt')
      .lean();

    sendSuccess(res, {
      analytics: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsed,
        avgUsage,
        totalOrdersWithCoupon: couponOrders,
        conversionRate: totalOrders > 0 ? ((couponOrders / totalOrders) * 100).toFixed(1) : '0',
        redemptionRate: totalCoupons > 0 ? ((totalUsed / totalCoupons) * 100).toFixed(1) : '0',
        mostUsedCoupons: mostUsed,
        dailyRedemption,
        couponPerformance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: Single Coupon Analytics ───────────────────────────────

const getSingleCouponAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      sendError(res, 'Coupon not found', 404);
      return;
    }

    const ordersWithCoupon = await Order.find({
      coupon: coupon.code,
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const totalRevenue = ordersWithCoupon.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const totalDiscount = ordersWithCoupon.reduce((sum: number, o: any) => sum + (o.discountAmount || 0), 0);

    sendSuccess(res, {
      analytics: {
        coupon,
        totalOrders: ordersWithCoupon.length,
        totalRevenue,
        totalDiscount,
        orders: ordersWithCoupon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── User: List Available Coupons ─────────────────────────────────

const getUserCoupons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const userId = req.user?.id;

    const filter: Record<string, any> = {
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    const coupons = await Coupon.find(filter)
      .populate('applicableCategories', 'name icon')
      .populate('applicableProducts', 'name price images')
      .sort({ priority: -1, createdAt: -1 });

    // Check if user has used each coupon and classify
    let userOrders: any[] = [];
    if (userId) {
      userOrders = await Order.find({ userId }).select('coupon').lean();
    }

    const usedCodes = userOrders
      .filter((o: any) => o.coupon)
      .map((o: any) => o.coupon);

    // Categorize coupons
    const available: any[] = [];
    const used: any[] = [];
    const expired: any[] = [];
    const upcoming: any[] = [];

    for (const coupon of coupons) {
      const isUsed = usedCodes.includes(coupon.code);

      // Count how many times this user has used this coupon
      const userUsedCount = userOrders.filter((o: any) => o.coupon === coupon.code).length;
      const reachedLimit = coupon.limitPerUser > 0 && userUsedCount >= coupon.limitPerUser;
      const usageExhausted = coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit;

      if (new Date(coupon.startDate) > now) {
        upcoming.push({ ...coupon.toObject(), userStatus: 'upcoming', reachedLimit, usageExhausted });
      } else if (isUsed || reachedLimit) {
        used.push({ ...coupon.toObject(), userStatus: 'used', reachedLimit, usageExhausted });
      } else if (new Date(coupon.endDate) < now) {
        expired.push({ ...coupon.toObject(), userStatus: 'expired' });
      } else if (usageExhausted) {
        expired.push({ ...coupon.toObject(), userStatus: 'exhausted' });
      } else {
        available.push({ ...coupon.toObject(), userStatus: 'available', reachedLimit, usageExhausted });
      }
    }

    // Also get user's expired coupons
    const expiredCoupons = await Coupon.find({
      status: { $ne: 'active' },
      endDate: { $lt: now },
    })
      .sort({ endDate: -1 })
      .limit(20);

    for (const coupon of expiredCoupons) {
      if (!expired.find((e: any) => e._id.toString() === coupon._id.toString())) {
        expired.push({ ...coupon.toObject(), userStatus: 'expired' });
      }
    }

    sendSuccess(res, {
      available,
      used,
      expired,
      upcoming,
    });
  } catch (error) {
    next(error);
  }
};

// ─── User: Auto-apply coupons ──────────────────────────────────

const getAutoApplyCoupons = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      status: 'active',
      autoApply: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: -1, discountValue: -1 });

    sendSuccess(res, { coupons });
  } catch (error) {
    next(error);
  }
};

// ─── User: Validate Coupon ────────────────────────────────────────

const validateCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code, products, subtotal, userId } = req.body;
    const now = new Date();

    if (!code) {
      sendError(res, 'Coupon code is required', 400);
      return;
    }

    // Convert product IDs to strings for comparison
    const productIds = (products || []).map((p: any) => p.productId?.toString() || p);
    const categoryIds = (products || []).map((p: any) => p.category?.toString()).filter(Boolean);

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      sendSuccess(res, { valid: false, message: 'Invalid coupon code' });
      return;
    }

    // Check status
    if (coupon.status !== 'active') {
      sendSuccess(res, { valid: false, message: 'This coupon is no longer active' });
      return;
    }

    // Check date range
    if (now < coupon.startDate) {
      sendSuccess(res, { valid: false, message: 'This coupon is not yet valid' });
      return;
    }

    if (now > coupon.endDate) {
      sendSuccess(res, { valid: false, message: 'This coupon has expired' });
      return;
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      sendSuccess(res, { valid: false, message: 'This coupon has reached its usage limit' });
      return;
    }

    // Check per-user limit
    const uid = userId || req.user?.id;
    if (uid) {
      const userOrderCount = await Order.countDocuments({
        userId: uid,
        coupon: coupon.code,
      });
      if (coupon.limitPerUser > 0 && userOrderCount >= coupon.limitPerUser) {
        sendSuccess(res, { valid: false, message: 'You have already used this coupon the maximum number of times' });
        return;
      }
    }

    // Check minimum purchase
    const orderSubtotal = Number(subtotal) || 0;
    if (coupon.minimumPurchase > 0 && orderSubtotal < coupon.minimumPurchase) {
      sendSuccess(res, {
        valid: false,
        message: `Minimum purchase of $${coupon.minimumPurchase.toFixed(2)} required`,
        minimumPurchase: coupon.minimumPurchase,
      });
      return;
    }

    // Check product eligibility
    if (coupon.applicableProducts.length > 0) {
      const hasEligible = productIds.some((pid: string) =>
        coupon.applicableProducts.some((ap: any) => ap.toString() === pid)
      );
      if (!hasEligible) {
        sendSuccess(res, { valid: false, message: 'This coupon is not applicable to the products in your cart' });
        return;
      }
    }

    // Check excluded products
    if (coupon.excludedProducts.length > 0) {
      const hasExcluded = productIds.some((pid: string) =>
        coupon.excludedProducts.some((ep: any) => ep.toString() === pid)
      );
      if (hasExcluded) {
        sendSuccess(res, { valid: false, message: 'This coupon cannot be applied to some products in your cart' });
        return;
      }
    }

    // Check category eligibility
    if (coupon.applicableCategories.length > 0) {
      const hasEligibleCat = categoryIds.some((cid: string) =>
        coupon.applicableCategories.some((ac: any) => ac.toString() === cid)
      );
      if (!hasEligibleCat) {
        sendSuccess(res, { valid: false, message: 'This coupon is not applicable to the categories in your cart' });
        return;
      }
    }

    // Check excluded categories
    if (coupon.excludedCategories.length > 0) {
      const hasExcludedCat = categoryIds.some((cid: string) =>
        coupon.excludedCategories.some((ec: any) => ec.toString() === cid)
      );
      if (hasExcludedCat) {
        sendSuccess(res, { valid: false, message: 'This coupon cannot be applied to some categories in your cart' });
        return;
      }
    }

    // Check new customer only
    if (coupon.newCustomerOnly && uid) {
      const orderCount = await Order.countDocuments({ userId: uid });
      if (orderCount > 0) {
        sendSuccess(res, { valid: false, message: 'This coupon is for new customers only' });
        return;
      }
    }

    // Check first order only
    if (coupon.firstOrderOnly && uid) {
      const orderCount = await Order.countDocuments({ userId: uid });
      if (orderCount > 0) {
        sendSuccess(res, { valid: false, message: 'This coupon is for first order only' });
        return;
      }
    }

    // Calculate discount
    let discountAmount = 0;
    let label = '';

    if (coupon.discountType === 'percentage') {
      discountAmount = orderSubtotal * (coupon.discountValue / 100);
      if (coupon.maximumDiscount > 0 && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount;
      }
      label = `${coupon.discountValue}% OFF`;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
      label = `$${coupon.discountValue.toFixed(2)} OFF`;
    } else if (coupon.discountType === 'free_shipping') {
      discountAmount = 0; // Shipping handled separately
      label = 'Free Shipping';
    }

    // Cap at subtotal
    if (discountAmount > orderSubtotal) {
      discountAmount = orderSubtotal;
    }

    sendSuccess(res, {
      valid: true,
      coupon: {
        _id: coupon._id,
        name: coupon.name,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        maximumDiscount: coupon.maximumDiscount,
        label,
        themeColor: coupon.themeColor,
        stackable: coupon.stackable,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── User: Apply Coupon ───────────────────────────────────────────

const applyCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // This is handled by the validate endpoint + order creation
    // The coupon is applied when the order is placed
    const { code, products, subtotal } = req.body;

    const validation = await validateCouponInternal(code, products, subtotal, req.user?.id);

    if (!validation.valid) {
      sendSuccess(res, { ...validation });
      return;
    }

    sendSuccess(res, {
      valid: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount,
      newTotal: (Number(subtotal) || 0) - validation.discountAmount,
    });
  } catch (error) {
    next(error);
  }
};

// Internal validation helper
async function validateCouponInternal(
  code: string,
  products: any[],
  subtotal: number,
  userId?: string
): Promise<any> {
  const now = new Date();
  const productIds = (products || []).map((p: any) => p.productId?.toString() || p);
  const categoryIds = (products || []).map((p: any) => p.category?.toString()).filter(Boolean);

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return { valid: false, message: 'Invalid coupon code' };
  if (coupon.status !== 'active') return { valid: false, message: 'This coupon is no longer active' };
  if (now < coupon.startDate) return { valid: false, message: 'This coupon is not yet valid' };
  if (now > coupon.endDate) return { valid: false, message: 'This coupon has expired' };
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return { valid: false, message: 'Usage limit reached' };

  if (userId) {
    const userOrderCount = await Order.countDocuments({ userId, coupon: coupon.code });
    if (coupon.limitPerUser > 0 && userOrderCount >= coupon.limitPerUser) return { valid: false, message: 'Per-user limit reached' };
    if (coupon.newCustomerOnly) {
      const orderCount = await Order.countDocuments({ userId });
      if (orderCount > 0) return { valid: false, message: 'New customers only' };
    }
    if (coupon.firstOrderOnly) {
      const orderCount = await Order.countDocuments({ userId });
      if (orderCount > 0) return { valid: false, message: 'First order only' };
    }
  }

  if (coupon.minimumPurchase > 0 && subtotal < coupon.minimumPurchase) return { valid: false, message: `Minimum $${coupon.minimumPurchase} required`, minimumPurchase: coupon.minimumPurchase };
  if (coupon.applicableProducts.length > 0) {
    const hasEligible = productIds.some((pid: string) => coupon.applicableProducts.some((ap: any) => ap.toString() === pid));
    if (!hasEligible) return { valid: false, message: 'Not applicable to your products' };
  }
  if (coupon.excludedProducts.length > 0) {
    const hasExcluded = productIds.some((pid: string) => coupon.excludedProducts.some((ep: any) => ep.toString() === pid));
    if (hasExcluded) return { valid: false, message: 'Excluded products in cart' };
  }

  let discountAmount = 0;
  let label = '';

  if (coupon.discountType === 'percentage') {
    discountAmount = subtotal * (coupon.discountValue / 100);
    if (coupon.maximumDiscount > 0 && discountAmount > coupon.maximumDiscount) discountAmount = coupon.maximumDiscount;
    label = `${coupon.discountValue}% OFF`;
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
    label = `$${coupon.discountValue.toFixed(2)} OFF`;
  } else if (coupon.discountType === 'free_shipping') {
    discountAmount = 0;
    label = 'Free Shipping';
  }

  if (discountAmount > subtotal) discountAmount = subtotal;

  return {
    valid: true,
    discountAmount,
    coupon: {
      _id: coupon._id,
      name: coupon.name,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      label,
      themeColor: coupon.themeColor,
      stackable: coupon.stackable,
    },
  };
}

// ─── User: Get Coupon by Code (for detail page) ───────────────────

const getCouponByCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() })
      .populate('applicableProducts', 'name price images')
      .populate('applicableCategories', 'name icon');

    if (!coupon) {
      sendError(res, 'Coupon not found', 404);
      return;
    }

    sendSuccess(res, { coupon });
  } catch (error) {
    next(error);
  }
};

// ─── User: Find Best Coupon for Cart ──────────────────────────────

const findBestCoupon = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { products, subtotal, categoryIds: catIds } = req.body;
    const userId = req.user?.id;
    const now = new Date();

    const productIds = (products || []).map((p: any) => p.productId?.toString() || p);
    const categoryIds = (catIds || []).map((c: string) => c.toString());

    // Get all active, valid coupons
    const coupons = await Coupon.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: 0 },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    }).sort({ priority: -1, discountValue: -1 });

    const validCoupons: any[] = [];

    for (const coupon of coupons) {
      // Check per-user limit
      if (userId && coupon.limitPerUser > 0) {
        const userOrderCount = await Order.countDocuments({ userId, coupon: coupon.code });
        if (userOrderCount >= coupon.limitPerUser) continue;
      }

      // Check new customer only
      if (coupon.newCustomerOnly && userId) {
        const orderCount = await Order.countDocuments({ userId });
        if (orderCount > 0) continue;
      }

      // Check first order only
      if (coupon.firstOrderOnly && userId) {
        const orderCount = await Order.countDocuments({ userId });
        if (orderCount > 0) continue;
      }

      // Check minimum purchase
      const orderSubtotal = Number(subtotal) || 0;
      if (coupon.minimumPurchase > 0 && orderSubtotal < coupon.minimumPurchase) continue;

      // Check product eligibility
      if (coupon.applicableProducts.length > 0) {
        const hasEligible = productIds.some((pid: string) =>
          coupon.applicableProducts.some((ap: any) => ap.toString() === pid)
        );
        if (!hasEligible) continue;
      }

      // Check excluded products
      if (coupon.excludedProducts.length > 0) {
        const hasExcluded = productIds.some((pid: string) =>
          coupon.excludedProducts.some((ep: any) => ep.toString() === pid)
        );
        if (hasExcluded) continue;
      }

      // Check category eligibility
      if (coupon.applicableCategories.length > 0) {
        const hasEligibleCat = categoryIds.some((cid: string) =>
          coupon.applicableCategories.some((ac: any) => ac.toString() === cid)
        );
        if (!hasEligibleCat) continue;
      }

      // Check excluded categories
      if (coupon.excludedCategories.length > 0) {
        const hasExcludedCat = categoryIds.some((cid: string) =>
          coupon.excludedCategories.some((ec: any) => ec.toString() === cid)
        );
        if (hasExcludedCat) continue;
      }

      // Calculate discount for this coupon
      let discountAmount = 0;
      let label = '';

      if (coupon.discountType === 'percentage') {
        discountAmount = orderSubtotal * (coupon.discountValue / 100);
        if (coupon.maximumDiscount > 0 && discountAmount > coupon.maximumDiscount) {
          discountAmount = coupon.maximumDiscount;
        }
        label = `${coupon.discountValue}% OFF`;
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue;
        label = `$${coupon.discountValue.toFixed(2)} OFF`;
      } else if (coupon.discountType === 'free_shipping') {
        discountAmount = 0;
        label = 'Free Shipping';
      }

      if (discountAmount > orderSubtotal) {
        discountAmount = orderSubtotal;
      }

      validCoupons.push({
        _id: coupon._id,
        name: coupon.name,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        maximumDiscount: coupon.maximumDiscount,
        minimumPurchase: coupon.minimumPurchase,
        label,
        themeColor: coupon.themeColor,
        stackable: coupon.stackable,
        autoApply: coupon.autoApply,
        priority: coupon.priority,
        bannerImage: coupon.bannerImage,
        endDate: coupon.endDate,
        usedCount: coupon.usedCount,
        usageLimit: coupon.usageLimit,
      });
    }

    // Sort by discount amount (best first), then priority
    validCoupons.sort((a: any, b: any) => {
      if (b.discountAmount !== a.discountAmount) return b.discountAmount - a.discountAmount;
      return b.priority - a.priority;
    });

    // The best non-auto-apply coupon and auto-apply coupons
    const bestCoupon = validCoupons.length > 0 ? validCoupons[0] : null;
    const autoApplyCoupons = validCoupons.filter((c: any) => c.autoApply);
    const suggestions = validCoupons.slice(0, 5);

    sendSuccess(res, {
      bestCoupon,
      autoApplyCoupons,
      suggestions,
      totalValid: validCoupons.length,
    });
  } catch (error) {
    next(error);
  }
};

// ─── User: Get Highlighted/Featured Coupons (for homepage) ────────

const getHighlightedCoupons = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      status: 'active',
      isHighlighted: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(6);

    sendSuccess(res, { coupons });
  } catch (error) {
    next(error);
  }
};

export {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateCouponStatus,
  getCouponAnalytics,
  getSingleCouponAnalytics,
  getUserCoupons,
  getAutoApplyCoupons,
  validateCoupon,
  applyCoupon,
  getCouponByCode,
  getHighlightedCoupons,
  findBestCoupon,
};
