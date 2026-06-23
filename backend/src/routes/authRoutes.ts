import { Router } from 'express';
import { login, googleLogin, refreshToken, logout, getMe } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
