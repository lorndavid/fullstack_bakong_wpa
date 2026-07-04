import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  role?: string;
  name?: string;
}

/**
 * Generate a single JWT with role (used by admin email/password login).
 * Expires in 7 days.
 */
const generateToken = (id: string, role: string, name?: string): string => {
  const options: SignOptions = {
    expiresIn: '7d',
  };
  return jwt.sign({ id, role, name }, process.env.JWT_SECRET!, options);
};

const generateAccessToken = (id: string, name?: string): string => {
  const options: SignOptions = {
    expiresIn: '15m',
  };
  return jwt.sign({ id, name }, process.env.JWT_SECRET!, options);
};

const generateRefreshToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: '30d',
  };
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET!, options);
};

const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};

export {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
