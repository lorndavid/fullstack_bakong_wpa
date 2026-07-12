import { Response, NextFunction } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendCreated, sendDeleted } from '../utils/response';


const getCategories = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.aggregate([
      { $sort: { name: 1 } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
    ]);
    sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
};

const getCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }
    sendSuccess(res, { category });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, icon } = req.body;
    const category = await Category.create({ name, icon });
    sendCreated(res, { category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, icon } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon },
      { new: true, runValidators: true }
    );
    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }
    sendSuccess(res, { category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productsCount = await Product.countDocuments({
      category: req.params.id,
    });
    if (productsCount > 0) {
      sendError(res, `Cannot delete category. ${productsCount} product(s) are using it. Remove or reassign them first.`, 400);
      return;
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};

const getCategoryProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Map frontend sort values to MongoDB sort options
    let sortOption: Record<string, any> = { createdAt: -1 };
    switch (req.query.sort) {
      case 'latest':      sortOption = { createdAt: -1 }; break;
      case 'lowhigh':     sortOption = { price: 1 };       break;
      case 'highlow':     sortOption = { price: -1 };      break;
      case 'bestselling': sortOption = { sold: -1 };       break;
      // also accept the product-route names
      case 'price_asc':  sortOption = { price: 1 };       break;
      case 'price_desc': sortOption = { price: -1 };      break;
      case 'newest':     sortOption = { createdAt: -1 };  break;
      case 'best_seller':sortOption = { sold: -1 };       break;
    }

    const filter = { category: req.params.id };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name icon')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    sendSuccess(res, {
      category,
      products,
      totalPages: Math.ceil(total / limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getCategories, getCategory, createCategory, updateCategory, deleteCategory, getCategoryProducts };
