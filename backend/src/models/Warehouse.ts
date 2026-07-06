import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouseDocument extends Document {
  name: string;
  address: string;
  manager: string;
  phone: string;
  email: string;
  capacity: number;
  currentUtilization: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const warehouseSchema = new Schema<IWarehouseDocument>(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      default: '',
    },
    manager: {
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
    capacity: {
      type: Number,
      default: 10000,
      min: 0,
    },
    currentUtilization: {
      type: Number,
      default: 0,
      min: 0,
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

export default mongoose.model<IWarehouseDocument>('Warehouse', warehouseSchema);
