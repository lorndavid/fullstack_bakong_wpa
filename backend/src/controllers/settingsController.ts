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
