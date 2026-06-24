import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPermission {
  resource: string;
  actions: string[];
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  permissions?: IPermission[];
  googleId?: string;
  avatar?: string;
  provider: string;
  isVerified: boolean;
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    permissions: {
      type: [{
        resource: { type: String, required: true },
        actions: [{ type: String }],
      }],
      default: [],
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    provider: {
      type: String,
      default: 'google',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUserDocument>('User', userSchema);
