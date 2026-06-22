import { Request } from 'express';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  googleId?: string;
  avatar?: string;
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
  total: number;
  coupon?: string;
  discountAmount?: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    zipCode: string;
  };
  paymentMethod: 'khqr' | 'cod';
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  _id: string;
  orderId: string;
  bakongId?: string;
  tran?: string;
  md5?: string;
  amount: number;
  status: 'pending' | 'PAID' | 'expired' | 'failed';
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
