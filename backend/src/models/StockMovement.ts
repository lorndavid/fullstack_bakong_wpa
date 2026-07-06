import mongoose, { Schema, Document } from 'mongoose';

export interface IStockMovementDocument extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'customer_order' | 'order_cancelled' | 'purchase_received' | 'transfer' | 'return' | 'damaged' | 'lost';
  quantity: number;
  referenceNumber: string;
  reason: string;
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  reference?: string;
  oldStock: number;
  newStock: number;
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovementDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },
    type: {
      type: String,
      enum: ['stock_in', 'stock_out', 'adjustment', 'customer_order', 'order_cancelled', 'purchase_received', 'transfer', 'return', 'damaged', 'lost'],
      required: [true, 'Movement type is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    reference: {
      type: String,
    },
    oldStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.index({ product: 1, createdAt: -1 });
stockMovementSchema.index({ warehouse: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ createdAt: -1 });

export default mongoose.model<IStockMovementDocument>('StockMovement', stockMovementSchema);
