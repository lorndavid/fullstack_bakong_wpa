import jwt, { SignOptions } from 'jsonwebtoken';

const generateToken = (id: string, role: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, options);
};

export default generateToken;
