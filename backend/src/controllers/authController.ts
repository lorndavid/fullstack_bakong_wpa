import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/generateToken';
import { AuthRequest } from '../types';
import { recordLoginEvent } from '../services/loginHistory';
import { sendSuccess, sendError } from '../utils/response';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    if (!user.password) {
      sendError(res, 'This account uses Google login. Please sign in with Google.', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    // Only admin users can login via this endpoint
    if (user.role !== 'admin') {
      sendError(res, 'Unauthorized: Admin access only', 403);
      return;
    }

    const token = generateToken(user._id.toString(), user.role, user.name);

    // Record login event (fire-and-forget)
    recordLoginEvent(user._id.toString(), 'login', req);

    sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      sendError(res, 'Google credential token is required', 400);
      return;
    }

    // Verify the Google ID Token on the backend
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      sendError(res, 'Invalid Google token', 401);
      return;
    }

    // Validate required fields
    if (!payload.email || !payload.sub) {
      sendError(res, 'Google token missing required fields', 401);
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user or create new one
    let user = await User.findOne({ email });

    if (user) {
      // Update googleId if this is a returning user without one (edge case)
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user with Google data
      user = await User.create({
        name: name || email?.split('@')[0] || 'User',
        email,
        googleId,
        avatar: picture || undefined,
        provider: 'google',
        isVerified: payload.email_verified !== false,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString(), user.name);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Record Google login event (fire-and-forget)
    recordLoginEvent(user._id.toString(), 'google_login', req);

    sendSuccess(res, {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    // Handle duplicate key error
    if (error.code === 11000) {
      sendError(res, 'An account with this Google profile already exists', 409);
      return;
    }

    // Handle Google token verification errors
    if (
      error.message?.includes('Wrong number of segments') ||
      error.message?.includes('Invalid token') ||
      error.message?.includes('Token used too late') ||
      error.message?.includes('Token used too early') ||
      error.message?.includes('audience') ||
      error.name === 'VerifyIdTokenError'
    ) {
      sendError(res, 'Invalid or expired Google credential. Please try signing in again.', 401);
      return;
    }

    // Handle MongoDB connection errors
    if (
      error.name === 'MongooseServerSelectionError' ||
      error.message?.includes('MongooseServerSelectionError') ||
      error.message?.includes('connect') ||
      error.message?.includes('ECONNREFUSED')
    ) {
      sendError(res, 'Database connection unavailable. Please ensure MongoDB is running and try again.', 503);
      return;
    }

    next(error);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      sendError(res, 'Refresh token is required', 400);
      return;
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      sendError(res, 'Invalid or expired refresh token', 401);
      return;
    }

    // Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    // Issue new tokens
    const accessToken = generateAccessToken(user._id.toString(), user.name);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    sendSuccess(res, {
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // Record logout event
  if (req.user?.id) {
    recordLoginEvent(req.user.id, 'logout', req);
  }

  // With stateless JWT, logout is handled client-side by deleting tokens.
  sendSuccess(res, null, 'Logged out successfully');
};

const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      user: {
        _id: user._id,
        googleId: user.googleId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { login, googleLogin, refreshToken, logout, getMe };
