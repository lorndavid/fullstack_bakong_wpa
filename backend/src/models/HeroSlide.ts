import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroSlideDocument extends Document {
  image: {
    public_id: string;
    secure_url: string;
  };
  title: string;
  subtitle: string;
  description: string;
  link: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const heroSlideSchema = new Schema<IHeroSlideDocument>(
  {
    image: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    title: {
      type: String,
      default: '',
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      default: '',
      maxlength: [100, 'Subtitle cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    link: {
      type: String,
      default: '/search',
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

heroSlideSchema.index({ order: 1 });

export default mongoose.model<IHeroSlideDocument>('HeroSlide', heroSlideSchema);
