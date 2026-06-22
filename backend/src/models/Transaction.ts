import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  bakongId?: string;
  tran?: string;
  md5?: string;
  amount: number;
  status: 'pending' | 'PAID' | 'expired' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    bakongId: {
      type: String,
    },
    tran: {
      type: String,
    },
    md5: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'PAID', 'expired', 'failed'],
      default: 'pending',
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
