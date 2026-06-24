import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotionDocument extends Document {
  name: string;
  description: string;
  discountPercent: number;
  // If selectedProducts is set, only these specific products get the promotion
  selectedProducts: mongoose.Types.ObjectId[];
  // If selectedCategories is set, all products in these categories get the promotion
  selectedCategories: mongoose.Types.ObjectId[];
  // Apply to all products
  applyToAll: boolean;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  bannerImage?: {
    public_id: string;
    secure_url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const promotionSchema = new Schema<IPromotionDocument>(
  {
    name: {
      type: String,
      required: [true, 'Promotion name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    discountPercent: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
    },
    selectedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    selectedCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applyToAll: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bannerImage: {
      public_id: { type: String },
      secure_url: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ selectedProducts: 1 });
promotionSchema.index({ selectedCategories: 1 });

export default mongoose.model<IPromotionDocument>('Promotion', promotionSchema);
