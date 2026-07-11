import pino from 'pino';
import pinoHttp from 'pino-http';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// ─── Environment ─────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

// ─── Root Logger ─────────────────────────────────────────────
// Base logger instance — all child loggers derive from this.
//
// Production:   Raw JSON output (piped to file or log aggregator).
// Development:  Pretty-print for readable console output.
//
// Log levels: trace, debug, info, warn, error, fatal
// Default: info in production, debug in development.
const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // ── Dev vs Production output ───────────────────────────
  // Production:  Raw newline-delimited JSON (piped to log aggregator)
  // Development: Human-readable colorized output via pino-pretty
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }),

  // ── Redact sensitive fields from ALL log output ────────
  // Prevents passwords, tokens, and secrets from appearing in logs.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'body.password',
      'body.passwordConfirm',
      'body.token',
      'body.refreshToken',
      'body.secret',
      'body.cardNumber',
      'body.cvv',
      'body.pin',
    ],
    censor: '[REDACTED]',
  },
});

// ─── Module-Specific Child Loggers ───────────────────────────
// Usage: import { dbLogger } from '../services/logger';
//        dbLogger.info('Connected to MongoDB');
export const dbLogger = logger.child({ module: 'database' });
export const authLogger = logger.child({ module: 'auth' });
export const paymentLogger = logger.child({ module: 'payment' });
export const socketLogger = logger.child({ module: 'socket' });
export const deployLogger = logger.child({ module: 'deploy' });

// ─── HTTP Request Logging Middleware ─────────────────────────
// Automatically logs every HTTP request with:
//   - Correlation ID (req.id) — a UUID for tracing requests across logs
//   - Request method, URL, and status code
//   - Response time in milliseconds
//   - Error details (if applicable)
//
// Usage: app.use(httpLogger);
export const httpLogger = pinoHttp({
  logger,

  // ── Correlation ID ──────────────────────────────────────
  // If the client sends an x-request-id header (e.g., from a proxy
  // or frontend), use it for distributed tracing. Otherwise generate
  // a random UUID so every request is uniquely identifiable.
  genReqId: (req) => {
    const existingId = req.headers['x-request-id'];
    if (existingId && typeof existingId === 'string') return existingId;
    return crypto.randomUUID();
  },

  // ── Log Message Format ──────────────────────────────────
  // e.g., "GET /api/health 200" (1.2s)
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode || 200}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode || 500} — ${err?.message || 'Error'}`;
  },

  // ── Log Level by Status Code ────────────────────────────
  // 5xx = error level (prod alert-worthy)
  // 4xx = warn level (client error, may indicate abuse)
  // 2xx/3xx = info level (normal operation)
  customLogLevel: (res, err) => {
    const code = res.statusCode || 500;
    if (code >= 500 || err) return 'error';
    if (code >= 400) return 'warn';
    return 'info';
  },

  // ── Skip Noisy Endpoints ────────────────────────────────
  // Health checks are polled frequently by monitoring tools.
  // Logging every health check would drown out meaningful logs.
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
});

// ─── Correlation ID Response Header Middleware ──────────────
// Echoes the correlation ID back to the client as an HTTP response
// header. Clients can include this ID in bug reports, allowing
// developers to trace the exact request in the logs.
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req as any).id;
  if (requestId) {
    res.setHeader('x-request-id', requestId);
  }
  next();
};

// ─── Default Export ─────────────────────────────────────────
// For ad-hoc logging anywhere in the codebase.
// Usage: import logger from '../services/logger';
//        logger.info({ userId }, 'User profile updated');
export default logger;
