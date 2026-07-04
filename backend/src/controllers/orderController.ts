import { Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../types';
import { createAndSendNotification } from '../services/notificationService';

const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { products, shippingAddress, paymentMethod, promotionDiscount, appliedPromotions } = req.body;

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

      // Use the price sent from frontend (which includes product discount)
      const itemPrice = item.price ||
        (product.discount > 0
          ? product.price * (1 - product.discount / 100)
          : product.price);

      orderProducts.push({
        productId: product._id.toString(),
        name: product.name,
        image: product.images[0]?.secure_url || '',
        price: itemPrice,
        quantity: item.quantity,
      });

      subtotal += itemPrice * item.quantity;
    }

    const shipping = 0;
    const rawPromoDiscount = Math.max(0, Number(promotionDiscount) || 0);
    const promoDiscount = Math.min(rawPromoDiscount, subtotal);
    const total = subtotal + shipping - promoDiscount;

    const order = await Order.create({
      userId: req.user!.id,
      products: orderProducts,
      subtotal,
      shipping,
      promotionDiscount: promoDiscount,
      total,
      appliedPromotions: appliedPromotions || [],
      shippingAddress,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
    });

    // Deduct stock for all payment methods (restored if cancelled)
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Notify: Order confirmed (for COD) / Order pending (for payment)
    if (order.status === 'confirmed') {
      // COD orders auto-confirm
      createAndSendNotification({
        recipient: { userId: req.user!.id },
        type: 'order_confirmed',
        title: 'Order Confirmed',
        message: `Your order #${order._id.toString().slice(-8)} has been confirmed. Total: $${order.total.toFixed(2)}`,
        data: { orderId: order._id.toString(), total: order.total, status: 'confirmed' },
        link: `/order/${order._id}`,
      }).catch(() => {});
    } else {
      // Payment required — notify about pending order
      createAndSendNotification({
        recipient: { userId: req.user!.id },
        type: 'order_confirmed',
        title: 'Order Placed',
        message: `Your order #${order._id.toString().slice(-8)} has been placed. Please complete payment.`,
        data: { orderId: order._id.toString(), total: order.total, status: 'pending' },
        link: `/payment/${order._id}`,
      }).catch(() => {});
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

    if (order.userId.toString() !== req.user!.id) {
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

    // Notify: Shipping update
    if (status === 'shipping') {
      createAndSendNotification({
        recipient: { userId: order.userId.toString() },
        type: 'shipping_update',
        title: 'Order Shipped',
        message: `Your order #${order._id.toString().slice(-8)} is on its way! Estimated delivery soon.`,
        data: { orderId: order._id.toString(), status: 'shipping' },
        link: `/order/${order._id}`,
      }).catch(() => {});
    }

    // Notify: Order delivered
    if (status === 'delivered') {
      createAndSendNotification({
        recipient: { userId: order.userId.toString() },
        type: 'shipping_update',
        title: 'Order Delivered',
        message: `Your order #${order._id.toString().slice(-8)} has been delivered. Enjoy!`,
        data: { orderId: order._id.toString(), status: 'delivered' },
        link: `/order/${order._id}`,
      }).catch(() => {});
    }

    // Notify: Order cancelled
    if (status === 'cancelled') {
      createAndSendNotification({
        recipient: { userId: order.userId.toString() },
        type: 'order_confirmed',
        title: 'Order Cancelled',
        message: `Your order #${order._id.toString().slice(-8)} has been cancelled.`,
        data: { orderId: order._id.toString(), status: 'cancelled' },
        link: `/order/${order._id}`,
      }).catch(() => {});
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (
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

    // Restore stock for all products in the order
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Order deleted successfully' });
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

const bulkDeleteOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'Order IDs array is required' });
      return;
    }

    const orders = await Order.find({ _id: { $in: ids } });
    for (const order of orders) {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        });
      }
    }
    await Order.deleteMany({ _id: { $in: ids } });

    res.json({ success: true, message: `${ids.length} orders deleted successfully` });
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
  deleteOrder,
  bulkDeleteOrders,
};
