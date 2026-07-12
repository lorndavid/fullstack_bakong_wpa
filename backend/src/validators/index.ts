import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
}).strict();

export const googleLoginSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required'),
}).strict();

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════════

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(30, 'Name cannot exceed 30 characters'),
  icon: z.string().min(1, 'Icon is required'),
}).strict();

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(30).optional(),
  icon: z.string().min(1).optional(),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════════

export const createProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  discount: z.coerce.number().min(0).max(100).default(0).optional(),
  category: z.string().min(1, 'Category is required'),
  featured: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  imageUrl: z.string().optional(),
}).strict();

export const updateProductSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  price: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  category: z.string().min(1).optional(),
  featured: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  imageUrl: z.string().optional(),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════

const orderProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string().optional(),
  image: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  category: z.string().optional(),
});

const appliedPromotionSchema = z.object({
  promotionId: z.string(),
  name: z.string(),
  discountPercent: z.number(),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
});

export const createOrderSchema = z.object({
  products: z.array(orderProductSchema).min(1, 'At least one product is required'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['khqr', 'cod', 'aba_payway']),
  promotionDiscount: z.number().min(0).default(0).optional(),
  appliedPromotions: z.array(appliedPromotionSchema).default([]).optional(),
  coupon: z.string().optional(),
  discountAmount: z.number().min(0).default(0).optional(),
}).strict();

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']),
}).strict();

export const bulkDeleteOrdersSchema = z.object({
  ids: z.array(z.string()).min(1, 'Order IDs array is required'),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  COUPONS
// ═══════════════════════════════════════════════════════════════

export const createCouponSchema = z.object({
  name: z.string().min(1, 'Coupon name is required').max(100),
  code: z.string().max(20).optional(),
  description: z.string().max(500).default('').optional(),
  discountType: z.enum(['percentage', 'fixed', 'free_shipping']),
  discountValue: z.coerce.number().min(0, 'Discount value cannot be negative').default(0),
  minimumPurchase: z.coerce.number().min(0).default(0).optional(),
  maximumDiscount: z.coerce.number().min(0).default(0).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  usageLimit: z.coerce.number().int().min(0).default(0).optional(),
  limitPerUser: z.coerce.number().int().min(1).default(1).optional(),
  status: z.enum(['active', 'inactive', 'expired']).default('active').optional(),
  applicableProducts: z.union([z.array(z.string()), z.string()]).default([]).optional(),
  applicableCategories: z.union([z.array(z.string()), z.string()]).default([]).optional(),
  excludedProducts: z.union([z.array(z.string()), z.string()]).default([]).optional(),
  excludedCategories: z.union([z.array(z.string()), z.string()]).default([]).optional(),
  applicableUsers: z.union([z.array(z.string()), z.string()]).default([]).optional(),
  newCustomerOnly: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(false).optional(),
  firstOrderOnly: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(false).optional(),
  allowGuest: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(false).optional(),
  stackable: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(false).optional(),
  priority: z.coerce.number().int().min(0).max(100).default(0).optional(),
  autoApply: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(false).optional(),
  themeColor: z.string().default('#6366F1').optional(),
  isHighlighted: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(false).optional(),
  sendNotification: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  notificationType: z.string().optional(),
  notificationTitle: z.string().optional(),
  notificationMessage: z.string().optional(),
  sendTo: z.string().optional(),
  notificationScheduledFor: z.string().optional(),
  notificationButtonText: z.string().optional(),
}).passthrough(); // passthrough for file upload fields like bannerImage (handled by multer)

export const updateCouponSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
  discountType: z.enum(['percentage', 'fixed', 'free_shipping']).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  minimumPurchase: z.coerce.number().min(0).optional(),
  maximumDiscount: z.coerce.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  limitPerUser: z.coerce.number().int().min(1).optional(),
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  applicableProducts: z.union([z.array(z.string()), z.string()]).optional(),
  applicableCategories: z.union([z.array(z.string()), z.string()]).optional(),
  excludedProducts: z.union([z.array(z.string()), z.string()]).optional(),
  excludedCategories: z.union([z.array(z.string()), z.string()]).optional(),
  applicableUsers: z.union([z.array(z.string()), z.string()]).optional(),
  newCustomerOnly: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  firstOrderOnly: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  allowGuest: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  stackable: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  priority: z.coerce.number().int().min(0).max(100).optional(),
  autoApply: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  themeColor: z.string().optional(),
  isHighlighted: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
}).passthrough();

export const updateCouponStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'expired']),
}).strict();

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  products: z.array(z.any()).optional().default([]),
  subtotal: z.number().min(0).optional().default(0),
  userId: z.string().optional(),
}).strict();

export const applyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  products: z.array(z.any()).optional().default([]),
  subtotal: z.number().min(0).optional().default(0),
}).strict();

export const findBestCouponSchema = z.object({
  products: z.array(z.any()).optional().default([]),
  subtotal: z.number().min(0).optional().default(0),
  categoryIds: z.array(z.string()).optional().default([]),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  HERO SLIDES
// ═══════════════════════════════════════════════════════════════

export const createHeroSlideSchema = z.object({
  title: z.string().max(100).default('').optional(),
  subtitle: z.string().max(100).default('').optional(),
  description: z.string().max(200).default('').optional(),
  link: z.string().default('/search').optional(),
  order: z.coerce.number().int().default(0).optional(),
  active: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(true).optional(),
}).strict();

export const updateHeroSlideSchema = z.object({
  title: z.string().max(100).optional(),
  subtitle: z.string().max(100).optional(),
  description: z.string().max(200).optional(),
  link: z.string().optional(),
  order: z.coerce.number().int().optional(),
  active: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  INVENTORY
// ═══════════════════════════════════════════════════════════════

export const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  address: z.string().default('').optional(),
  manager: z.string().default('').optional(),
  phone: z.string().default('').optional(),
  email: z.string().default('').optional(),
  capacity: z.number().min(0).default(10000).optional(),
  currentUtilization: z.number().min(0).default(0).optional(),
  isActive: z.boolean().default(true).optional(),
}).strict();

export const updateWarehouseSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  manager: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  capacity: z.number().min(0).optional(),
  currentUtilization: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const createSupplierSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  contactPerson: z.string().default('').optional(),
  phone: z.string().default('').optional(),
  email: z.string().default('').optional(),
  address: z.string().default('').optional(),
  products: z.array(z.string()).default([]).optional(),
  leadTime: z.number().int().min(1).default(7).optional(),
  rating: z.number().min(0).max(5).default(0).optional(),
  isActive: z.boolean().default(true).optional(),
}).strict();

export const updateSupplierSchema = z.object({
  company: z.string().min(1).optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  products: z.array(z.string()).optional(),
  leadTime: z.number().int().min(1).optional(),
  rating: z.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
}).strict();

const purchaseOrderProductSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitCost: z.number().min(0),
  received: z.number().default(0).optional(),
});

export const createPurchaseOrderSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  warehouse: z.string().min(1, 'Warehouse is required'),
  products: z.array(purchaseOrderProductSchema).min(1, 'At least one product is required'),
  expectedArrival: z.string().optional(),
  notes: z.string().default('').optional(),
}).strict();

export const updatePurchaseOrderSchema = z.object({
  supplier: z.string().min(1).optional(),
  warehouse: z.string().min(1).optional(),
  products: z.array(purchaseOrderProductSchema).min(1).optional(),
  expectedArrival: z.string().optional(),
  notes: z.string().optional(),
}).strict();

export const receivePurchaseOrderSchema = z.object({
  products: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'At least one product is required'),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const createNotificationSchema = z.object({
  type: z.string().default('admin_broadcast').optional(),
  title: z.string().min(1, 'Title is required').max(200),
  message: z.string().min(1, 'Message is required').max(1000),
  data: z.record(z.string(), z.any()).default({}).optional(),
  link: z.string().default('').optional(),
  channels: z.array(z.enum(['in_app', 'email', 'push'])).default(['in_app']).optional(),
  scheduledFor: z.string().optional(),
  expiresAt: z.string().optional(),
  audience: z.enum(['all_users', 'all_admins', 'single_user']).optional(),
  userId: z.string().optional(),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  PAYMENT
// ═══════════════════════════════════════════════════════════════

export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  orderId: z.string().min(1, 'Order ID is required'),
  provider: z.enum(['BAKONG', 'ABA_PAYWAY']).optional(),
}).strict();

export const checkPaymentSchema = z.object({
  tranId: z.string().optional(),
  provider: z.string().optional(),
}).strict();

export const saveTransactionSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive(),
  md5: z.string().min(1),
  tran: z.string().min(1),
  qr: z.string().min(1),
}).strict();

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PAID', 'EXPIRED']),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  PROMOTIONS
// ═══════════════════════════════════════════════════════════════

export const createPromotionSchema = z.object({
  name: z.string().min(1, 'Promotion name is required').max(100),
  description: z.string().max(500).default('').optional(),
  discountPercent: z.coerce.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  selectedProducts: z.union([z.array(z.string()), z.string()]).default([]).optional(),
  selectedCategories: z.union([z.array(z.string()), z.string()]).default([]).optional(),
  applyToAll: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(false).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.union([z.boolean(), z.literal('true'), z.literal('false')]).default(true).optional(),
}).passthrough();

export const updatePromotionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  selectedProducts: z.union([z.array(z.string()), z.string()]).optional(),
  selectedCategories: z.union([z.array(z.string()), z.string()]).optional(),
  applyToAll: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
}).passthrough();

// ═══════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════

export const updateSettingsSchema = z.object({
  colors: z.string().optional(), // JSON string when coming via FormData
  textOverrides: z.string().optional(),
  flashSale: z.string().optional(),
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  lowStockThreshold: z.number().int().min(1).optional(),
  payment: z.string().optional(),
  abaEnabled: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  bakongEnabled: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  abaMerchantLink: z.string().optional(),
  bakongAccountId: z.string().optional(),
  merchantName: z.string().optional(),
  merchantCity: z.string().optional(),
  social: z.string().optional(),
  removeLogo: z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
}).passthrough(); // passthrough for file upload fields

// ═══════════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════════

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['user', 'admin']).optional(),
  permissions: z.array(z.object({
    resource: z.string(),
    actions: z.array(z.string()),
  })).optional(),
}).strict();

export const createAdminUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  permissions: z.array(z.object({
    resource: z.string(),
    actions: z.array(z.string()),
  })).default([]).optional(),
}).strict();

export const bulkDeleteUsersSchema = z.object({
  ids: z.array(z.string()).min(1, 'User IDs array is required'),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  CHAT
// ═══════════════════════════════════════════════════════════════

export const sendMessageSchema = z.object({
  content: z.string().max(5000).optional().default(''),
  messageType: z.enum(['text', 'file']).default('text').optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
}).strict();

export const assignStaffSchema = z.object({
  adminId: z.string().optional(),
}).strict();

// ═══════════════════════════════════════════════════════════════
//  PARAMS / QUERY (shared)
// ═══════════════════════════════════════════════════════════════

export const mongoIdParam = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const couponCodeParam = z.object({
  code: z.string().min(1, 'Code is required'),
});

export const md5Param = z.object({
  md5: z.string().min(1, 'MD5 hash is required'),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.string().optional(),
  search: z.string().optional(),
});
