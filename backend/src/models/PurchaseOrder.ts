import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrderProduct {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  received: number;
  unitCost: number;
}

export interface IPurchaseOrderDocument extends Document {
  supplier: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  products: IPurchaseOrderProduct[];
  status: 'pending' | 'approved' | 'shipping' | 'received' | 'cancelled';
  expectedArrival: Date;
  orderDate: Date;
  receivedDate?: Date;
  totalCost: number;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrderDocument>(
  {
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse is required'],
    },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        received: { type: Number, default: 0 },
        unitCost: { type: Number, required: true, min: 0 },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'shipping', 'received', 'cancelled'],
      default: 'pending',
    },
    expectedArrival: {
      type: Date,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    receivedDate: {
      type: Date,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

purchaseOrderSchema.index({ supplier: 1, status: 1 });
purchaseOrderSchema.index({ status: 1, expectedArrival: 1 });

// Calculate total cost before saving
purchaseOrderSchema.pre('save', function (next) {
  this.totalCost = this.products.reduce(
    (sum, p) => sum + p.quantity * p.unitCost,
    0
  );
  next();
});

export default mongoose.model<IPurchaseOrderDocument>('PurchaseOrder', purchaseOrderSchema);
