import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplierDocument extends Document {
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  products: mongoose.Types.ObjectId[];
  leadTime: number;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplierDocument>(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    contactPerson: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    leadTime: {
      type: Number,
      default: 7,
      min: 1,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISupplierDocument>('Supplier', supplierSchema);
