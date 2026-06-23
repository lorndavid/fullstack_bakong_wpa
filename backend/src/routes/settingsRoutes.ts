import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, authorize } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

// Public route - anyone can read settings (for CSS vars, site name, etc.)
router.get('/', getSettings);

// Admin-only - update settings (with optional logo upload)
router.put('/', protect, authorize('admin'), upload.single('logo'), updateSettings);

export default router;
