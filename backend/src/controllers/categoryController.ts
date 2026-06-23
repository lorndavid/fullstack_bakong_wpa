import { Response, NextFunction } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import { AuthRequest } from '../types';


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
    res.json({ success: true, categories });
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
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, category });
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
    res.status(201).json({ success: true, category });
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
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, category });
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
      res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productsCount} product(s) are using it. Remove or reassign them first.`,
      });
      return;
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, message: 'Category deleted successfully' });
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
      res.status(404).json({ success: false, message: 'Category not found' });
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

    res.json({
      success: true,
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
