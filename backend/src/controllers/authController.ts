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

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'This account uses Google login. Please sign in with Google.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Only admin users can login via this endpoint
    if (user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access only',
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    // Record login event (fire-and-forget)
    recordLoginEvent(user._id.toString(), 'login', req);

    res.json({
      success: true,
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
      res.status(400).json({
        success: false,
        message: 'Google credential token is required',
      });
      return;
    }

    // Verify the Google ID Token on the backend
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
      return;
    }

    // Validate required fields
    if (!payload.email || !payload.sub) {
      res.status(401).json({
        success: false,
        message: 'Google token missing required fields',
      });
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
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Record Google login event (fire-and-forget)
    recordLoginEvent(user._id.toString(), 'google_login', req);

    res.json({
      success: true,
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
      res.status(409).json({
        success: false,
        message: 'An account with this Google profile already exists',
      });
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
      res.status(401).json({
        success: false,
        message: 'Invalid or expired Google credential. Please try signing in again.',
      });
      return;
    }

    // Handle MongoDB connection errors
    if (
      error.name === 'MongooseServerSelectionError' ||
      error.message?.includes('MongooseServerSelectionError') ||
      error.message?.includes('connect') ||
      error.message?.includes('ECONNREFUSED')
    ) {
      res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please ensure MongoDB is running and try again.',
      });
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
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Issue new tokens
    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.json({
      success: true,
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
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
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
