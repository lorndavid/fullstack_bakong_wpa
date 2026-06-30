import mongoose, { Schema, Document } from 'mongoose';

export type PaymentProvider = 'BAKONG' | 'ABA_PAYWAY';
export type TransactionStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export interface ITransactionDocument extends Document {
  orderId: string;
  amount: number;
  provider: PaymentProvider;
  tranId?: string;
  providerReference?: string;
  tran?: string;
  md5?: string;
  qr?: string;
  status: TransactionStatus;
  expireAt?: Date;
  paidAt?: Date;
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
    provider: {
      type: String,
      enum: ['BAKONG', 'ABA_PAYWAY'],
      default: 'BAKONG',
    },
    tranId: {
      type: String,
    },
    providerReference: {
      type: String,
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
      enum: ['PENDING', 'PAID', 'FAILED', 'EXPIRED'],
      default: 'PENDING',
    },
    expireAt: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ md5: 1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ tranId: 1 });
transactionSchema.index({ provider: 1 });

export default mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
