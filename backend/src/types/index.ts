import { Request } from 'express';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  googleId?: string;
  avatar?: string;
  provider: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  discount: number;
  images: { public_id: string; secure_url: string }[];
  category: string;
  rating: number;
  numReviews: number;
  sold: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppliedPromotion {
  promotionId: string;
  name: string;
  discountPercent: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  products: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shipping: number;
  promotionDiscount: number;
  total: number;
  coupon?: string;
  discountAmount?: number;
  appliedPromotions: IAppliedPromotion[];
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    phone: string;
  };
  paymentMethod: 'khqr' | 'cod' | 'aba_payway';
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  _id: string;
  orderId: string;
  amount: number;
  provider: 'BAKONG' | 'ABA_PAYWAY';
  tranId?: string;
  providerReference?: string;
  tran?: string;
  md5?: string;
  qr?: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';
  expireAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export interface BakongCreateResponse {
  qr: string;
  md5: string;
  tran: string;
}

export interface BakongCheckResponse {
  responseCode: number;
  status: string;
  [key: string]: any;
}
