import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  role: string;
}

const getSecret = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`${key} is not defined`);
  return val;
};

export const generateAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getSecret('JWT_SECRET'), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
  });

export const generateRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, getSecret('JWT_REFRESH_SECRET'), {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, getSecret('JWT_SECRET')) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, getSecret('JWT_REFRESH_SECRET')) as JwtPayload;
