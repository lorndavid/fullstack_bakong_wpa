import mongoose, { Schema, Document, Types } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed' | 'free_shipping';

export interface ICouponDocument extends Document {
  name: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  limitPerUser: number;
  status: 'active' | 'inactive' | 'expired';
  applicableProducts: Types.ObjectId[];
  applicableCategories: Types.ObjectId[];
  excludedProducts: Types.ObjectId[];
  excludedCategories: Types.ObjectId[];
  applicableUsers: Types.ObjectId[];
  newCustomerOnly: boolean;
  firstOrderOnly: boolean;
  allowGuest: boolean;
  stackable: boolean;
  priority: number;
  autoApply: boolean;
  bannerImage?: {
    public_id: string;
    secure_url: string;
  };
  themeColor: string;
  isHighlighted: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICouponDocument>(
  {
    name: {
      type: String,
      required: [true, 'Coupon name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Code cannot exceed 20 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
      default: 0,
    },
    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    usageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    limitPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    excludedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    excludedCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applicableUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    newCustomerOnly: {
      type: Boolean,
      default: false,
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },
    allowGuest: {
      type: Boolean,
      default: false,
    },
    stackable: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    autoApply: {
      type: Boolean,
      default: false,
    },
    bannerImage: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    themeColor: {
      type: String,
      default: '#6366F1',
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ status: 1, startDate: 1, endDate: 1 });
couponSchema.index({ autoApply: 1, status: 1 });
couponSchema.index({ applicableProducts: 1 });
couponSchema.index({ applicableCategories: 1 });

export default mongoose.model<ICouponDocument>('Coupon', couponSchema);
