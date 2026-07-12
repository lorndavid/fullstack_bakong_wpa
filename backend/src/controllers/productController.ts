import { Response, NextFunction } from 'express';
import Product from '../models/Product';
import Settings from '../models/Settings';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary';
import { saveFileLocally, deleteLocalFile } from '../services/fileStorage';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, sendCreated, sendDeleted } from '../utils/response';

const getProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    let sortOption: Record<string, any> = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price_asc': sortOption = { price: 1 }; break;
        case 'price_desc': sortOption = { price: -1 }; break;
        case 'newest': sortOption = { createdAt: -1 }; break;
        case 'oldest': sortOption = { createdAt: 1 }; break;
        case 'best_seller': sortOption = { sold: -1 }; break;
        case 'rating': sortOption = { rating: -1 }; break;
        case 'discount': sortOption = { discount: -1 }; break;
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name icon')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    sendSuccess(res, {
      products,
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

const getProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'category',
      'name icon'
    );
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }
    sendSuccess(res, { product });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find({ featured: true })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .limit(10);
    sendSuccess(res, { products });
  } catch (error) {
    next(error);
  }
};

const getFlashSaleProducts = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.flashSale || !settings.flashSale.products) {
      sendSuccess(res, { products: [], endTime: null });
      return;
    }

    // Only return products if the flash sale hasn't expired
    if (settings.flashSale.endTime && new Date(settings.flashSale.endTime) < new Date()) {
      sendSuccess(res, { products: [], endTime: settings.flashSale.endTime });
      return;
    }

    const products = await Product.find({ _id: { $in: settings.flashSale.products } })
      .populate('category', 'name icon')
      .limit(8);
      
    sendSuccess(res, { products, endTime: settings.flashSale.endTime });
  } catch (error) {
    next(error);
  }
};

const getNewArrivals = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find()
      .populate('category', 'name icon')
      .sort({ createdAt: -1 })
      .limit(10);
    sendSuccess(res, { products });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, price, stock, discount, category, featured, imageUrl } = req.body;

    let images: { public_id: string; secure_url: string }[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Try Cloudinary first, fall back to local storage on failure
      const files = req.files as Express.Multer.File[];
      const results = await Promise.allSettled(
        files.map((file) => uploadToCloudinary(file, 'products'))
      );
      images = results.map((r) => {
        if (r.status === 'fulfilled') return r.value;
        // Cloudinary failed — save locally instead
        console.warn('[Product] ⚠️ Cloudinary upload failed, saving locally:', r.reason?.message);
        return saveFileLocally(files[results.indexOf(r)]);
      });
    } else if (imageUrl) {
      // Use direct image URL (external link or local path)
      images = [{ public_id: 'url_' + Date.now(), secure_url: imageUrl }];
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      discount: discount || 0,
      images,
      category,
      featured: featured === true || featured === 'true',
    });

    sendCreated(res, { product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, price, stock, discount, category, featured, imageUrl } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (discount !== undefined) product.discount = discount;
    if (category) product.category = category;
    if (featured !== undefined) product.featured = featured === true || featured === 'true';

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Delete old images (both Cloudinary and local)
      for (const img of product.images) {
        if (img.public_id.startsWith('local_')) {
          deleteLocalFile(img.public_id);
        } else if (!img.public_id.startsWith('url_')) {
          await deleteFromCloudinary(img.public_id).catch(() => {});
        }
      }

      // Upload new files — try Cloudinary first, fall back to local
      const files = req.files as Express.Multer.File[];
      const results = await Promise.allSettled(
        files.map((file) => uploadToCloudinary(file, 'products'))
      );
      product.images = results.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        console.warn('[Product] ⚠️ Cloudinary upload failed, saving locally:', r.reason?.message);
        return saveFileLocally(files[i]);
      });
    } else if (imageUrl && imageUrl !== product.images[0]?.secure_url) {
      // Update with direct image URL
      product.images = [{ public_id: 'url_' + Date.now(), secure_url: imageUrl }];
    }

    await product.save();

    sendSuccess(res, { product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    // Clean up images — Cloudinary + local files
    for (const img of product.images) {
      if (img.public_id.startsWith('local_')) {
        deleteLocalFile(img.public_id);
      } else if (!img.public_id.startsWith('url_')) {
        await deleteFromCloudinary(img.public_id).catch(() => {});
      }
    }

    await product.deleteOne();
    sendDeleted(res);
  } catch (error) {
    next(error);
  }
};

const getLowStockProducts = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await Settings.findOne();
    const threshold = parseInt(_req.query.threshold as string) || settings?.lowStockThreshold || 5;

    const products = await Product.find({ stock: { $lte: threshold } })
      .populate('category', 'name icon')
      .sort({ stock: 1 })
      .limit(50);

    sendSuccess(res, {
      products,
      count: products.length,
      threshold,
    });
  } catch (error) {
    next(error);
  }
};

const getRelatedProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .populate('category', 'name icon')
      .sort({ rating: -1 })
      .limit(4);

    sendSuccess(res, { products: related });
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getFlashSaleProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
  getLowStockProducts,
};
