import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

export const signJwt = async (payload: Record<string, unknown>, expiresIn = '7d') => {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(secret));
};

export const verifyJwt = async <T = any>(token: string): Promise<T | null> => {
  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload as T;
  } catch {
    return null;
  }
};
