import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [30, 'Name cannot exceed 30 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Category icon is required'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICategoryDocument>('Category', categorySchema);
