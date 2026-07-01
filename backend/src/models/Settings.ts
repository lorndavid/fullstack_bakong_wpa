import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentGatewaySettings {
  abaEnabled: boolean;
  bakongEnabled: boolean;
  abaMerchantLink: string;
  bakongAccountId: string;
  merchantName: string;
  merchantCity: string;
}

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
  // Low stock alert threshold
  lowStockThreshold: number;
  // Payment Gateway Configuration
  payment: IPaymentGatewaySettings;
  // Flat fields exposed for convenience (read from `payment` sub-doc)
  abaEnabled?: boolean;
  bakongEnabled?: boolean;
  abaMerchantLink?: string;
  bakongAccountId?: string;
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
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    payment: {
      abaEnabled: { type: Boolean, default: true },
      bakongEnabled: { type: Boolean, default: true },
      abaMerchantLink: {
        type: String,
        default: process.env.ABA_MERCHANT_LINK || 'https://link.payway.com.kh/ABAPAY0j459666x',
      },
      bakongAccountId: {
        type: String,
        default: process.env.MERCHANT_BAKONG_ID || '',
      },
      merchantName: {
        type: String,
        default: process.env.MERCHANT_NAME || 'MY SHOP',
      },
      merchantCity: {
        type: String,
        default: process.env.MERCHANT_CITY || 'Phnom Penh',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        // Surface payment fields at top-level so the frontend can read
        // `settings.abaEnabled` etc. while the schema keeps them grouped.
        if (ret.payment) {
          ret.abaEnabled = ret.payment.abaEnabled;
          ret.bakongEnabled = ret.payment.bakongEnabled;
          ret.abaMerchantLink = ret.payment.abaMerchantLink;
          ret.bakongAccountId = ret.payment.bakongAccountId;
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
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
