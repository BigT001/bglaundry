import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export function verifyAdminToken(
  token: string | null,
): { sub: string; role: string; phoneNumber: string } | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role === 'ADMIN') {
      return decoded;
    }
  } catch (err) {
    console.error('JWT verification error:', err);
  }
  return null;
}

export type AuthUser = { id: string; role: string; phoneNumber: string };

export function verifyRiderToken(token: string | null): AuthUser | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role === 'DRIVER' && decoded.id) {
      return { id: decoded.id, role: decoded.role, phoneNumber: decoded.phoneNumber };
    }
  } catch {
    return null;
  }
  return null;
}

export function bearerToken(request: { headers: Headers }) {
  const value = request.headers.get('authorization');
  return value?.startsWith('Bearer ') ? value.slice(7) : null;
}
