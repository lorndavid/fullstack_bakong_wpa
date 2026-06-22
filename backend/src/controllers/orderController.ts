import { Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../types';

const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No order items',
      });
      return;
    }

    const orderProducts = [];
    let subtotal = 0;

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
        return;
      }

      const discountPrice =
        product.discount > 0
          ? product.price * (1 - product.discount / 100)
          : product.price;

      orderProducts.push({
        productId: product._id.toString(),
        name: product.name,
        image: product.images[0]?.secure_url || '',
        price: discountPrice,
        quantity: item.quantity,
      });

      subtotal += discountPrice * item.quantity;
    }

    const shipping = subtotal >= 50 ? 0 : 5;
    const total = subtotal + shipping;

    const order = await Order.create({
      userId: req.user!.id,
      products: orderProducts,
      subtotal,
      shipping,
      total,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    });

    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: Record<string, any> = { userId: req.user!.id };
    if (status && status !== 'all') filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (
      order.userId.toString() !== req.user!.id &&
      req.user!.role !== 'admin'
    ) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
      return;
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const filter: Record<string, any> = {};
    if (status && status !== 'all') filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Valid: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Restore stock if cancelled
    if (status === 'cancelled') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        });
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.userId.toString() !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
      return;
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
      return;
    }

    order.status = 'cancelled';
    await order.save();

    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
