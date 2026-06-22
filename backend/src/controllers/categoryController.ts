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
    const categories = await Category.find().sort({ name: 1 });
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

export { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
