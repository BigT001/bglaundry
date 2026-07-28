import jwt from 'jsonwebtoken';
import { AdminPermission, FULL_ACCESS_ROLES, STAFF_ROLES } from './admin-permissions';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export function verifyAdminToken(
  token: string | null,
  permission?: AdminPermission,
): { sub: string; role: string; email?: string; permissions: string[] } | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const permissions = Array.isArray(decoded.permissions) ? decoded.permissions : [];
    const fullAccess = FULL_ACCESS_ROLES.includes(decoded.role);
    const staffRole = STAFF_ROLES.includes(decoded.role);
    if (fullAccess || (permission && permissions.includes(permission)) || (!permission && staffRole)) {
      return { ...decoded, permissions };
    }
  } catch (err) {
    console.error('JWT verification error:', err);
  }
  return null;
}

export type AuthUser = { id: string; role: string; phoneNumber: string };

export function verifyCustomerToken(token: string | null): AuthUser | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const id = decoded.id || decoded.sub;
    if (decoded.role === 'CUSTOMER' && id) {
      return { id, role: decoded.role, phoneNumber: decoded.phoneNumber };
    }
  } catch {
    return null;
  }
  return null;
}

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
  if (value?.startsWith('Bearer ')) {
    const token = value.slice(7);
    if (token && token !== 'cookie-session') return token;
  }
  const cookie = request.headers.get('cookie');
  const sessionCookie = cookie?.match(/(?:^|;\s*)bg_admin_session=([^;]+)/)?.[1];
  return sessionCookie ? decodeURIComponent(sessionCookie) : null;
}
