import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import HeroSlide from '../models/HeroSlide';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary';

const getHeroSlides = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slides = await HeroSlide.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, slides });
  } catch (error) {
    next(error);
  }
};

const getAllHeroSlides = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json({ success: true, slides });
  } catch (error) {
    next(error);
  }
};

const createHeroSlide = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, subtitle, description, link, order, active } = req.body;

    let image = { public_id: '', secure_url: '' };

    // Handle image upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'hero-slides');
        image = { public_id: result.public_id, secure_url: result.secure_url };
      } catch (uploadError: any) {
        res.status(400).json({
          success: false,
          message: 'Image upload failed: ' + uploadError.message,
        });
        return;
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
      return;
    }

    const slide = await HeroSlide.create({
      image,
      title: title || '',
      subtitle: subtitle || '',
      description: description || '',
      link: link || '/search',
      order: order || 0,
      active: active === 'true' || active === true,
    });

    res.status(201).json({ success: true, slide });
  } catch (error) {
    next(error);
  }
};

const updateHeroSlide = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      res.status(404).json({ success: false, message: 'Slide not found' });
      return;
    }

    const { title, subtitle, description, link, order, active } = req.body;

    // Handle image upload if new file provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary
        if (slide.image.public_id) {
          await deleteFromCloudinary(slide.image.public_id).catch(() => {});
        }
        const result = await uploadToCloudinary(req.file, 'hero-slides');
        slide.image = { public_id: result.public_id, secure_url: result.secure_url };
      } catch (uploadError: any) {
        res.status(400).json({
          success: false,
          message: 'Image upload failed: ' + uploadError.message,
        });
        return;
      }
    }

    if (title !== undefined) slide.title = title;
    if (subtitle !== undefined) slide.subtitle = subtitle;
    if (description !== undefined) slide.description = description;
    if (link !== undefined) slide.link = link;
    if (order !== undefined) slide.order = Number(order);
    if (active !== undefined) slide.active = active === 'true' || active === true;

    await slide.save();

    res.json({ success: true, slide });
  } catch (error) {
    next(error);
  }
};

const deleteHeroSlide = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      res.status(404).json({ success: false, message: 'Slide not found' });
      return;
    }

    // Delete image from Cloudinary
    if (slide.image.public_id) {
      await deleteFromCloudinary(slide.image.public_id).catch(() => {});
    }

    await HeroSlide.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Slide deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export { getHeroSlides, getAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide };
