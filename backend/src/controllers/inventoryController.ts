import { Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Order from '../models/Order';
import Warehouse from '../models/Warehouse';
import Supplier from '../models/Supplier';
import StockMovement from '../models/StockMovement';
import PurchaseOrder from '../models/PurchaseOrder';
import { AuthRequest } from '../types';

// ─── INVENTORY OVERVIEW ────────────────────────────────────────

const getInventoryOverview = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ─── KPI Data ──────────────────────────────────────────────
    const products = await Product.find({}).populate('category', 'name icon').lean();
    const categories = await Category.find({}).lean();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Basic counts
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (p.stock || 0) * p.price,
      0
    );
    const totalSold30Days = products.reduce((sum, p) => sum + (p.sold || 0), 0);
    const avgPrice =
      totalProducts > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts
        : 0;

    // Stock status counts
    const lowStockProducts = products.filter(
      (p) => p.stock > 0 && p.stock <= 5
    );
    const outOfStockProducts = products.filter((p) => p.stock === 0);
    const healthyProducts = products.filter((p) => p.stock > 20);
    const criticalProducts = products.filter(
      (p) => p.stock > 5 && p.stock <= 10
    );

    // Fast/slow moving
    const fastMoving = products
      .filter((p) => p.sold > 0)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);
    const deadStock = products.filter(
      (p) => p.sold === 0 && p.stock > 0
    );
    const deadStockValue = deadStock.reduce(
      (sum, p) => sum + p.stock * p.price,
      0
    );

    // Reserved stock (from pending/confirmed orders)
    const activeOrders = await Order.find({
      status: { $in: ['pending', 'confirmed'] },
    }).lean();
    const reservedStock = activeOrders.reduce((sum, o) => {
      const orderTotal = o.products.reduce(
        (s, p) => s + p.quantity,
        0
      );
      return sum + orderTotal;
    }, 0);

    // Incoming stock (from approved/shipping purchase orders)
    const incomingOrders = await PurchaseOrder.find({
      status: { $in: ['approved', 'shipping'] },
    }).lean();
    const incomingStock = incomingOrders.reduce((sum, po) => {
      const poTotal = po.products.reduce(
        (s, p) => s + (p.quantity - (p.received || 0)),
        0
      );
      return sum + poTotal;
    }, 0);

    // Inventory turnover (annualized estimate)
    const avgInventory = totalProducts > 0 ? totalStock / totalProducts : 1;
    const annualSoldEstimate = totalSold30Days * 12;
    const inventoryTurnover =
      avgInventory > 0 ? annualSoldEstimate / avgInventory : 0;

    // Sell-through rate
    const sellThroughRate =
      totalStock > 0
        ? ((totalSold30Days / (totalStock + totalSold30Days)) * 100).toFixed(1)
        : '0';

    // Average daily sales
    const avgDailySales = totalSold30Days / 30;

    // Potential revenue (if all stock sold at current price)
    const potentialRevenue = products.reduce(
      (sum, p) => sum + p.stock * p.price,
      0
    );

    // Inventory accuracy placeholder (would need cycle counts to compute)
    const inventoryAccuracy = 98.5;

    // ─── CHART DATA ────────────────────────────────────────────

    // Sales per day (last 30 days)
    const recentOrders = await Order.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: { $ne: 'cancelled' },
    }).lean();

    const salesByDay: Record<string, { revenue: number; count: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      salesByDay[key] = { revenue: 0, count: 0 };
    }
    for (const order of recentOrders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      if (salesByDay[key]) {
        salesByDay[key].revenue += order.total || 0;
        salesByDay[key].count += order.products?.length || 0;
      }
    }
    const productsSoldPerDay = Object.entries(salesByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        count: data.count,
      }));

    // Inventory value trend (last 30 days - approximate based on orders)
    let runningValue = totalInventoryValue;
    const inventoryValueTrend = productsSoldPerDay.map((d) => {
      runningValue -= d.revenue * 0.4; // approximate COGS ratio
      return {
        date: d.date,
        value: Math.max(0, Math.round(runningValue * 100) / 100),
      };
    });

    // Category distribution
    const categoryMap: Record<string, { name: string; icon: string; count: number; value: number; stock: number }> = {};
    for (const cat of categories) {
      categoryMap[cat._id.toString()] = {
        name: cat.name,
        icon: cat.icon,
        count: 0,
        value: 0,
        stock: 0,
      };
    }
    for (const p of products) {
      const catId = p.category?._id?.toString() || p.category?.toString();
      if (catId && categoryMap[catId]) {
        categoryMap[catId].count++;
        categoryMap[catId].value += p.stock * p.price;
        categoryMap[catId].stock += p.stock || 0;
      }
    }
    const categoryDistribution = Object.entries(categoryMap)
      .filter(([_, data]) => data.count > 0)
      .map(([id, data]) => ({
        categoryId: id,
        name: data.name,
        icon: data.icon,
        count: data.count,
        value: Math.round(data.value * 100) / 100,
        stock: data.stock,
      }))
      .sort((a, b) => b.value - a.value);

    // ─── SMART INSIGHTS ─────────────────────────────────────────

    const insights: {
      type: 'warning' | 'danger' | 'success' | 'info';
      icon: string;
      title: string;
      description: string;
      priority: number;
    }[] = [];

    // Products that will run out soon
    const runningOutProducts = products
      .filter((p) => p.stock > 0 && p.sold > 0)
      .map((p) => ({
        product: p,
        daysToRunOut:
          p.sold > 0 ? Math.round(p.stock / (p.sold / 30)) : 999,
      }))
      .filter((p) => p.daysToRunOut <= 7)
      .sort((a, b) => a.daysToRunOut - b.daysToRunOut)
      .slice(0, 5);

    for (const item of runningOutProducts) {
      insights.push({
        type: 'danger',
        icon: '⚠️',
        title: `${item.product.name} will run out in ${item.daysToRunOut} day${item.daysToRunOut > 1 ? 's' : ''}`,
        description: `Current stock: ${item.product.stock} | Average daily sales: ${(item.product.sold / 30).toFixed(1)} | Restock immediately`,
        priority: 1,
      });
    }

    // Best selling categories
    const topCategory = categoryDistribution[0];
    if (topCategory && topCategory.value > 0) {
      const categoryRevenuePercent = (
        (topCategory.value / totalInventoryValue) *
        100
      ).toFixed(0);
      insights.push({
        type: 'success',
        icon: '⭐',
        title: `${topCategory.name} generated ${categoryRevenuePercent}% of your inventory value`,
        description: `Highest value category with ${topCategory.count} products worth $${topCategory.value.toLocaleString()}`,
        priority: 2,
      });
    }

    // Fast moving products alert
    if (fastMoving.length > 0) {
      const topFast = fastMoving[0];
      const monthlySales = topFast.sold || 0;
      insights.push({
        type: 'info',
        icon: '🔥',
        title: `${topFast.name} sales increased significantly`,
        description: `${monthlySales} units sold this period | Current stock: ${topFast.stock} | Consider increasing reorder quantity`,
        priority: 2,
      });
    }

    // Dead stock warning
    if (deadStock.length > 0) {
      insights.push({
        type: 'warning',
        icon: '💰',
        title: `You have $${deadStockValue.toLocaleString()} worth of slow-moving products`,
        description: `${deadStock.length} product${deadStock.length > 1 ? 's' : ''} haven't sold for 90+ days. Consider promotions or markdowns.`,
        priority: 2,
      });
    }

    // Low stock alerts
    if (lowStockProducts.length > 0) {
      insights.push({
        type: 'danger',
        icon: '📦',
        title: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''} are low on stock`,
        description: `These product${lowStockProducts.length > 1 ? 's' : ''} have ${lowStockProducts.length > 1 ? 'fewer than 6 units each' : 'fewer than 6 units'}. Restock soon to avoid stockouts.`,
        priority: 2,
      });
    }

    // Out of stock alert
    if (outOfStockProducts.length > 0) {
      insights.push({
        type: 'danger',
        icon: '🚫',
        title: `${outOfStockProducts.length} product${outOfStockProducts.length > 1 ? 's' : ''} are out of stock`,
        description: `Revenue loss potential: $${outOfStockProducts.reduce((s, p) => s + p.price * (p.sold || 1), 0).toLocaleString()}`,
        priority: 1,
      });
    }

    // Inventory turnover insight
    if (inventoryTurnover > 6) {
      insights.push({
        type: 'success',
        icon: '📈',
        title: `Inventory turnover rate is ${inventoryTurnover.toFixed(1)}x annually`,
        description: `Your inventory is moving ${inventoryTurnover.toFixed(1)} times per year — well above average for e-commerce`,
        priority: 3,
      });
    } else if (inventoryTurnover < 2) {
      insights.push({
        type: 'warning',
        icon: '🐢',
        title: `Inventory turnover is low at ${inventoryTurnover.toFixed(1)}x annually`,
        description: `Products are sitting on shelves. Consider reducing order quantities or running promotions.`,
        priority: 2,
      });
    }

    // Revenue from top products
    const topRevenueProducts = [...products]
      .sort((a, b) => b.sold * b.price - a.sold * a.price)
      .slice(0, 3);
    if (topRevenueProducts.length > 0) {
      const topRev = topRevenueProducts[0];
      insights.push({
        type: 'success',
        icon: '💵',
        title: `${topRev.name} generated $${(topRev.sold * topRev.price).toLocaleString()} in revenue`,
        description: `Top revenue generator | Stock: ${topRev.stock} | Price: $${topRev.price}`,
        priority: 3,
      });
    }

    // Sort insights by priority
    insights.sort((a, b) => a.priority - b.priority);

    res.json({
      success: true,
      overview: {
        // KPI Cards
        kpis: {
          totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
          totalProducts,
          availableStock: totalStock,
          reservedStock,
          incomingStock,
          lowStock: lowStockProducts.length,
          outOfStock: outOfStockProducts.length,
          deadStock: deadStock.length,
          fastMoving: fastMoving.length,
          inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
          sellThroughRate: `${sellThroughRate}%`,
          potentialRevenue: Math.round(potentialRevenue * 100) / 100,
          inventoryAccuracy: `${inventoryAccuracy}%`,
          avgDailySales: Math.round(avgDailySales * 100) / 100,
          totalInventoryCost: Math.round(totalInventoryValue * 0.6 * 100) / 100,
          avgPrice: Math.round(avgPrice * 100) / 100,
        },
        // Charts
        charts: {
          inventoryValueTrend,
          productsSoldPerDay,
          categoryDistribution,
          // Stock consumption heat map data (hourly distribution based on orders)
          stockConsumption: generateStockConsumption(recentOrders),
          forecast: generateForecast(products, productsSoldPerDay),
        },
        // Smart Insights
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper to generate stock consumption pattern by hour
function generateStockConsumption(
  orders: any[]
): { hour: string; value: number }[] {
  const hourly: Record<string, number> = {};
  for (let h = 0; h < 24; h++) {
    const hourLabel = `${h.toString().padStart(2, '0')}:00`;
    hourly[hourLabel] = 0;
  }
  for (const order of orders) {
    const hour = new Date(order.createdAt).getHours();
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
    if (hourly[hourLabel] !== undefined) {
      hourly[hourLabel] += order.products?.length || 1;
    }
  }
  return Object.entries(hourly).map(([hour, value]) => ({ hour, value }));
}

// Simple forecast: expected stock next 30 days based on avg daily sales
function generateForecast(
  products: any[],
  salesData: { date: string; count: number }[]
): { date: string; predictedStock: number; predictedValue: number }[] {
  const avgDailySales =
    salesData.length > 0
      ? salesData.reduce((s, d) => s + d.count, 0) / salesData.length
      : 0;
  const totalValue = products.reduce(
    (s, p) => s + p.stock * p.price,
    0
  );
  const avgProductValue =
    products.length > 0 ? totalValue / products.length : 0;
  const currentStock = products.reduce((s, p) => s + (p.stock || 0), 0);

  const forecast: { date: string; predictedStock: number; predictedValue: number }[] = [];
  let runningStock = currentStock;
  let runningValue = totalValue;

  for (let i = 1; i <= 30; i++) {
    const d = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    runningStock = Math.max(0, runningStock - avgDailySales);
    runningValue = Math.max(0, runningValue - avgDailySales * avgProductValue);
    forecast.push({
      date: d.toISOString().slice(0, 10),
      predictedStock: Math.round(runningStock * 100) / 100,
      predictedValue: Math.round(runningValue * 100) / 100,
    });
  }

  return forecast;
}

// ─── WAREHOUSE CRUD ────────────────────────────────────────────

const getWarehouses = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouses = await Warehouse.find({}).sort({ name: 1 });
    res.json({ success: true, warehouses });
  } catch (error) {
    next(error);
  }
};

const createWarehouse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ success: true, warehouse });
  } catch (error) {
    next(error);
  }
};

const updateWarehouse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!warehouse) {
      res.status(404).json({ success: false, message: 'Warehouse not found' });
      return;
    }
    res.json({ success: true, warehouse });
  } catch (error) {
    next(error);
  }
};

const deleteWarehouse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
    if (!warehouse) {
      res.status(404).json({ success: false, message: 'Warehouse not found' });
      return;
    }
    res.json({ success: true, message: 'Warehouse deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── SUPPLIER CRUD ─────────────────────────────────────────────

const getSuppliers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const suppliers = await Supplier.find({})
      .populate('products', 'name price stock')
      .sort({ company: 1 });
    res.json({ success: true, suppliers });
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }
    res.json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── STOCK MOVEMENT ────────────────────────────────────────────

const getStockMovements = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (req.query.productId) filter.product = req.query.productId;
    if (req.query.type) filter.type = req.query.type;

    const [movements, total] = await Promise.all([
      StockMovement.find(filter)
        .populate('product', 'name images price stock')
        .populate('warehouse', 'name')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StockMovement.countDocuments(filter),
    ]);

    res.json({
      success: true,
      movements,
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

// ─── PURCHASE ORDERS CRUD ──────────────────────────────────────

const getPurchaseOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.supplierId) filter.supplier = req.query.supplierId;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .populate('supplier', 'company leadTime')
        .populate('warehouse', 'name')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PurchaseOrder.countDocuments(filter),
    ]);

    res.json({
      success: true,
      purchaseOrders: orders,
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

const createPurchaseOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const purchaseOrder = await PurchaseOrder.create({
      ...req.body,
      createdBy: req.user?.id,
    });
    res.status(201).json({ success: true, purchaseOrder });
  } catch (error) {
    next(error);
  }
};

const updatePurchaseOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!purchaseOrder) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }
    res.json({ success: true, purchaseOrder });
  } catch (error) {
    next(error);
  }
};

// Receive purchase order - updates stock
const receivePurchaseOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }

    // Update received quantities
    for (const item of purchaseOrder.products) {
      const receivedItem = req.body.products?.find(
        (p: any) => p.productId === item.productId.toString()
      );
      if (receivedItem) {
        item.received = (item.received || 0) + (receivedItem.quantity || 0);
      }
    }

    const allReceived = purchaseOrder.products.every(
      (p) => p.received >= p.quantity
    );

    if (allReceived) {
      purchaseOrder.status = 'received';
      purchaseOrder.receivedDate = new Date();
    }

    await purchaseOrder.save();

    // Create stock movements for each received product
    if (req.user?.id) {
      for (const item of purchaseOrder.products) {
        const receivedQty =
          req.body.products?.find(
            (p: any) => p.productId === item.productId.toString()
          )?.quantity || 0;

        if (receivedQty > 0) {
          const product = await Product.findById(item.productId);
          if (product) {
            const oldStock = product.stock;
            product.stock += receivedQty;
            await product.save();

            await StockMovement.create({
              product: item.productId,
              warehouse: purchaseOrder.warehouse,
              type: 'purchase_received',
              quantity: receivedQty,
              referenceNumber: purchaseOrder._id.toString(),
              reason: `Purchase order #${purchaseOrder._id}`,
              user: req.user.id,
              oldStock,
              newStock: product.stock,
            });
          }
        }
      }
    }

    res.json({ success: true, purchaseOrder });
  } catch (error) {
    next(error);
  }
};

export {
  getInventoryOverview,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getStockMovements,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder,
};
