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
