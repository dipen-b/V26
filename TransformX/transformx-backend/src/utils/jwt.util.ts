import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
}

// Env vars are plain strings; the typings want a duration literal, so the
// cast is applied at the single point where the value enters jwt.sign.
function expiresIn(value: string | undefined, fallback: string): SignOptions {
  return { expiresIn: (value || fallback) as SignOptions['expiresIn'] };
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    expiresIn(process.env.JWT_EXPIRES_IN, '15m'),
  );
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    expiresIn(process.env.JWT_REFRESH_EXPIRES_IN, '7d'),
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}
