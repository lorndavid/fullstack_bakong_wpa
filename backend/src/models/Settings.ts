import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettingsDocument extends Document {
  // Theme Colors
  colors: {
    primary: string;
    accent: string;
    surface: string;
  };
  // Custom site text (overrides for i18n)
  textOverrides: Record<string, string>;
  // Site branding
  siteName: string;
  siteDescription: string;
  // Custom logo
  logo?: {
    public_id: string;
    secure_url: string;
  };
  // Flash Sale
  flashSale?: {
    endTime: Date;
    products: mongoose.Types.ObjectId[];
  };
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettingsDocument>(
  {
    colors: {
      primary: { type: String, default: '#0055A4' },
      accent: { type: String, default: '#00C853' },
      surface: { type: String, default: '#F8FAFC' },
    },
    textOverrides: {
      type: Map,
      of: String,
      default: {},
    },
    siteName: {
      type: String,
      default: 'MY SHOP',
    },
    siteDescription: {
      type: String,
      default: 'Premium Cambodian Shopping Experience',
    },
    logo: {
      public_id: { type: String },
      secure_url: { type: String },
    },
    flashSale: {
      endTime: { type: Date },
      products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },
  },
  {
    timestamps: true,
  }
);

export interface ISettingsModel extends Model<ISettingsDocument> {
  getSingleton(): Promise<ISettingsDocument>;
}

// Ensure only one settings document exists (singleton pattern)
settingsSchema.statics.getSingleton = async function () {
  const settings = await this.findOne();
  if (settings) return settings;
  return this.create({});
};

export default mongoose.model<ISettingsDocument, ISettingsModel>('Settings', settingsSchema);
