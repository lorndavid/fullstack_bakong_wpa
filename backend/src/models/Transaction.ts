import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionDocument extends Document {
  orderId: string;
  amount: number;
  tran?: string;
  md5?: string;
  qr?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    tran: {
      type: String,
    },
    md5: {
      type: String,
    },
    qr: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'EXPIRED', 'failed'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ md5: 1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ status: 1 });

export default mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
