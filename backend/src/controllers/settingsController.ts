import { Response, NextFunction } from 'express';
import Settings from '../models/Settings';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary';
import { AuthRequest } from '../types';

const getSettings = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await Settings.getSingleton();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Parse JSON fields (they come as strings when sent via FormData with file upload)
    const colors = typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors;
    const textOverrides = typeof req.body.textOverrides === 'string' ? JSON.parse(req.body.textOverrides) : req.body.textOverrides;
    const flashSale = typeof req.body.flashSale === 'string' ? JSON.parse(req.body.flashSale) : req.body.flashSale;
    const { siteName, siteDescription } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    if (colors) {
      if (colors.primary) settings.colors.primary = colors.primary;
      if (colors.accent) settings.colors.accent = colors.accent;
      if (colors.surface) settings.colors.surface = colors.surface;
    }

    if (textOverrides) {
      settings.textOverrides = new Map(Object.entries(textOverrides)) as any;
    }

    if (siteName !== undefined) settings.siteName = siteName;
    if (siteDescription !== undefined) settings.siteDescription = siteDescription;

    if (flashSale) {
      settings.flashSale = {
        endTime: flashSale.endTime ? new Date(flashSale.endTime) : new Date(),
        products: flashSale.products || [],
      };
    }

    if (req.body.lowStockThreshold !== undefined) {
      settings.lowStockThreshold = parseInt(req.body.lowStockThreshold, 10) || 5;
    }

    // ─── Payment Gateway Settings ────────────────────────────────
    if (!settings.payment) {
      settings.payment = {
        abaEnabled: true,
        bakongEnabled: true,
        abaMerchantLink: '',
        bakongAccountId: '',
        merchantName: 'MY SHOP',
        merchantCity: 'Phnom Penh',
      };
    }

    // Support either a `payment` JSON blob or flat fields for convenience.
    const paymentPayload =
      typeof req.body.payment === 'string'
        ? JSON.parse(req.body.payment)
        : req.body.payment;

    const toBool = (v: unknown): boolean => {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') return v.toLowerCase() === 'true';
      return Boolean(v);
    };

    if (paymentPayload && typeof paymentPayload === 'object') {
      if (paymentPayload.abaEnabled !== undefined) settings.payment.abaEnabled = toBool(paymentPayload.abaEnabled);
      if (paymentPayload.bakongEnabled !== undefined) settings.payment.bakongEnabled = toBool(paymentPayload.bakongEnabled);
      if (paymentPayload.abaMerchantLink !== undefined) settings.payment.abaMerchantLink = String(paymentPayload.abaMerchantLink);
      if (paymentPayload.bakongAccountId !== undefined) settings.payment.bakongAccountId = String(paymentPayload.bakongAccountId);
      if (paymentPayload.merchantName !== undefined) settings.payment.merchantName = String(paymentPayload.merchantName);
      if (paymentPayload.merchantCity !== undefined) settings.payment.merchantCity = String(paymentPayload.merchantCity);
    }

    if (req.body.abaEnabled !== undefined) settings.payment.abaEnabled = toBool(req.body.abaEnabled);
    if (req.body.bakongEnabled !== undefined) settings.payment.bakongEnabled = toBool(req.body.bakongEnabled);
    if (req.body.abaMerchantLink !== undefined) settings.payment.abaMerchantLink = String(req.body.abaMerchantLink);
    if (req.body.bakongAccountId !== undefined) settings.payment.bakongAccountId = String(req.body.bakongAccountId);
    if (req.body.merchantName !== undefined) settings.payment.merchantName = String(req.body.merchantName);
    if (req.body.merchantCity !== undefined) settings.payment.merchantCity = String(req.body.merchantCity);

    // Handle logo upload
    if (req.file) {
      try {
        // Delete old logo if exists
        if (settings.logo?.public_id) {
          await deleteFromCloudinary(settings.logo.public_id).catch(() => {});
        }
        const result = await uploadToCloudinary(req.file, 'logos');
        settings.logo = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      } catch (uploadError: any) {
        res.status(400).json({
          success: false,
          message: 'Logo upload failed: ' + uploadError.message,
        });
        return;
      }
    }

    // Handle logo removal (if logoRemoved flag is set)
    if (req.body.removeLogo === 'true' || req.body.removeLogo === true) {
      if (settings.logo?.public_id) {
        await deleteFromCloudinary(settings.logo.public_id).catch(() => {});
      }
      settings.logo = undefined;
    }

    await settings.save();

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export { getSettings, updateSettings };
