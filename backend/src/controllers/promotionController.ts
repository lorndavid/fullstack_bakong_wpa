import { Response, NextFunction } from 'express';
import Promotion from '../models/Promotion';
import Product from '../models/Product';
import { AuthRequest } from '../types';
import { uploadToCloudinary } from '../services/cloudinary';
import { saveFileLocally } from '../services/fileStorage';
import { sendSuccess, sendError, sendCreated, sendDeleted } from '../utils/response';

const getPromotions = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const promotions = await Promotion.find()
      .populate('selectedProducts', 'name price images')
      .populate('selectedCategories', 'name icon')
      .sort({ createdAt: -1 });
    sendSuccess(res, { promotions });
  } catch (error) {
    next(error);
  }
};

const getActivePromotions = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('selectedProducts', 'name price images discount')
      .populate('selectedCategories', 'name icon')
      .sort({ createdAt: -1 });
    sendSuccess(res, { promotions });
  } catch (error) {
    next(error);
  }
};

const getPromotion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('selectedProducts', 'name price images discount stock')
      .populate('selectedCategories', 'name icon');
    if (!promotion) {
      sendError(res, 'Promotion not found', 404);
      return;
    }
    sendSuccess(res, { promotion });
  } catch (error) {
    next(error);
  }
};

const createPromotion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      discountPercent,
      selectedProducts,
      selectedCategories,
      applyToAll,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      sendError(res, 'End date must be after start date', 400);
      return;
    }

    // Parse JSON strings if sent as FormData
    const parseJson = (val: any) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };

    const promotionData: any = {
      name,
      description: description || '',
      discountPercent: Number(discountPercent) || 0,
      selectedProducts: parseJson(selectedProducts) || [],
      selectedCategories: parseJson(selectedCategories) || [],
      applyToAll: applyToAll === true || applyToAll === 'true',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive === true || isActive === 'true' || isActive === undefined,
    };

    // Handle banner image upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'promotions');
        promotionData.bannerImage = result;
      } catch {
        const localResult = saveFileLocally(req.file);
        promotionData.bannerImage = {
          public_id: 'local_' + localResult.public_id,
          secure_url: localResult.secure_url,
        };
      }
    }

    const promotion = await Promotion.create(promotionData);

    sendCreated(res, { promotion });
  } catch (error) {
    next(error);
  }
};

const updatePromotion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      sendError(res, 'Promotion not found', 404);
      return;
    }

    const {
      name,
      description,
      discountPercent,
      selectedProducts,
      selectedCategories,
      applyToAll,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const parseJson = (val: any) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };

    if (name) promotion.name = name;
    if (description !== undefined) promotion.description = description;
    if (discountPercent !== undefined) promotion.discountPercent = Number(discountPercent);
    if (selectedProducts !== undefined) promotion.selectedProducts = parseJson(selectedProducts);
    if (selectedCategories !== undefined) promotion.selectedCategories = parseJson(selectedCategories);
    if (applyToAll !== undefined) promotion.applyToAll = applyToAll === true || applyToAll === 'true';
    if (startDate) promotion.startDate = new Date(startDate);
    if (endDate) promotion.endDate = new Date(endDate);
    if (isActive !== undefined) promotion.isActive = isActive === true || isActive === 'true';

    // Handle banner image
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'promotions');
        promotion.bannerImage = result;
      } catch {
        const localResult = saveFileLocally(req.file);
        promotion.bannerImage = {
          public_id: 'local_' + localResult.public_id,
          secure_url: localResult.secure_url,
        };
      }
    }

    // Validate dates
    if (promotion.endDate <= promotion.startDate) {
      sendError(res, 'End date must be after start date', 400);
      return;
    }

    await promotion.save();

    sendSuccess(res, { promotion });
  } catch (error) {
    next(error);
  }
};

const deletePromotion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      sendError(res, 'Promotion not found', 404);
      return;
    }
    await promotion.deleteOne();
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};

// Get products eligible for a promotion (for admin selection UI)
const getPromotionProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId } = req.query;
    const filter: Record<string, any> = {};
    if (categoryId) {
      filter.category = categoryId;
    }
    const products = await Product.find(filter)
      .populate('category', 'name icon')
      .sort({ name: 1 });
    sendSuccess(res, { products });
  } catch (error) {
    next(error);
  }
};

export {
  getPromotions,
  getActivePromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getPromotionProducts,
};
