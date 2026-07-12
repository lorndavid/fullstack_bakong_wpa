import { Router } from 'express';
import { login, googleLogin, refreshToken, logout, getMe } from '../controllers/authController';
import { protect } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';
import { validate } from '../middlewares/validate';
import { loginSchema, googleLoginSchema, refreshTokenSchema } from '../validators';

const router = Router();

// ── Auth Rate Limiting ───────────────────────────────────────
// Auth endpoints are the highest-value attack target (brute force,
// credential stuffing). The authLimiter allows 10 requests per 
// 15 minutes per IP — strict but reasonable for legitimate users.
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', authLimiter, validate(googleLoginSchema), googleLogin);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
