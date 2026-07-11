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
// 100 requests per 15 minutes per IP — generous but protective.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
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

// ─── Strict Auth Limiter ─────────────────────────────────────
// Applied specifically to login/register endpoints.
// Prevents brute-force password attacks.
// 10 requests per 15 minutes — strict because auth is the
// highest-value target for attackers.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
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

