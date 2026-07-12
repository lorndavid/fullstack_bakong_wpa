import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// ─── IP Whitelist ─────────────────────────────────────────────
// These IPs bypass rate limiting entirely (e.g., internal services,
// monitoring tools, your home/office IP)
const WHITELISTED_IPS: string[] = [
  '127.0.0.1',
  '::1',
  // Add your office/home static IP here
  // '203.0.113.1',
];

const isWhitelisted = (req: Request): boolean => {
  const ip = req.ip || req.socket.remoteAddress || '';
  return WHITELISTED_IPS.includes(ip);
};

// ─── Global API Limiter ──────────────────────────────────────
// Applied to ALL /api/* routes. Prevents general API abuse.
// Since all users behind an Nginx reverse proxy share the same IP,
// the limit must be generous enough to accommodate concurrent users.
// 500 requests per 15 minutes per IP — allows real traffic while
// still blocking runaway abuse.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: 'draft-7', // Send RateLimit-* headers
  legacyHeaders: false,       // Disable X-RateLimit-* headers
  skip: (req: Request) => isWhitelisted(req),
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

// ─── Auth Limiter ────────────────────────────────────────────
// Applied specifically to login/register endpoints.
// Prevents brute-force password attacks.
// 60 requests per 15 minutes — generous enough for multiple users
// behind a single proxy IP, but still blocks brute-force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req: Request) => isWhitelisted(req),
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
    });
  },
});

// ─── Authenticated User Limiter ──────────────────────────────
// Only applies to authenticated requests — keyed by user ID
// instead of IP. This prevents a single user from hammering
// protected endpoints while not affecting other users.
// ─── Authenticated User Limiter ──────────────────────────────
// Only applies to authenticated requests — keyed by user ID
// instead of IP. This prevents a single user from hammering
// protected endpoints while not affecting other users.
// Must be applied AFTER `protect` middleware so req.user is set.
export const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const authReq = req as Request & { user?: { id: string } };
    return authReq.user?.id || req.ip || 'unknown';
  },
  skip: (req: Request) => isWhitelisted(req),
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

