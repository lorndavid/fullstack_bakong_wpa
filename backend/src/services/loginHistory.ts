import { Request } from 'express';
import LoginHistory from '../models/LoginHistory';

type LoginAction = 'login' | 'logout' | 'google_login' | 'token_refresh';

/**
 * Record a login/logout event in the database.
 * This is fire-and-forget — errors are silently caught so they never
 * interrupt the main request flow.
 */
export async function recordLoginEvent(
  userId: string,
  action: LoginAction,
  req?: Request
): Promise<void> {
  try {
    const ip = req?.ip || req?.socket?.remoteAddress || undefined;
    const userAgent = req?.headers?.['user-agent'] || undefined;

    await LoginHistory.create({
      userId,
      action,
      ip,
      userAgent,
    });
  } catch {
    // Silently ignore — login history is non-critical
  }
}
