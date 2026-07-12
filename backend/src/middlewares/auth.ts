import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/generateToken';
import { AuthRequest } from '../types';
import { userLimiter } from './rateLimiter';

const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
      return;
    }

    const decoded = verifyAccessToken(token);

    req.user = { id: decoded.id, role: decoded.role || 'user' };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired',
    });
  }
};

// ─── Combined: protect + user rate limiter ────────────────────
// Wraps the existing `protect` middleware and chains `userLimiter`
// after authentication succeeds. Uses a wrapper pattern so that if
// `protect` logic changes, this middleware stays in sync automatically.
// Usage: router.post('/', protectWithRateLimit, handler)
const protectWithRateLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Intercept protect's next() — only apply userLimiter when auth succeeds
  const wrappedNext: NextFunction = (err?: any) => {
    if (err) return next(err);
    userLimiter(req, res, next);
  };
  await protect(req, res, wrappedNext);
};

const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this route',
      });
      return;
    }
    next();
  };
};

export { protect, protectWithRateLimit, authorize };
