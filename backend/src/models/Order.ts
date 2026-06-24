import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderProduct {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IAppliedPromotion {
  promotionId: string;
  name: string;
  discountPercent: number;
}

export interface IOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  products: IOrderProduct[];
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
  paymentMethod: 'khqr' | 'cod';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, default: '' },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping: {
      type: Number,
      required: true,
      default: 0,
    },
    promotionDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    coupon: {
      type: String,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    appliedPromotions: [
      {
        promotionId: { type: String },
        name: { type: String },
        discountPercent: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['khqr', 'cod'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export default mongoose.model<IOrderDocument>('Order', orderSchema);
