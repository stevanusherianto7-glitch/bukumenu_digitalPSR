import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // In production, we MUST have a secret.
    if (process.env.NODE_ENV === 'production') {
       throw new Error("CRITICAL_SECURITY_ERROR: JWT_SECRET missing from ENV.");
    }
    return 'development_secret_only';
  }
  return secret;
};

export const generateToken = (payload: object) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }
};
