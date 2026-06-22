import { Router } from 'express';
import { register, login, googleLogin, getMe } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

export default router;
