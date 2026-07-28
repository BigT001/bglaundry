import { NextRequest, NextResponse } from 'next/server';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = bearerToken(request);
  const session = verifyAdminToken(token);
  if (!session || !token) {
    return NextResponse.json({ error: 'Admin session is invalid or expired.' }, { status: 401 });
  }

  return NextResponse.json({
    token,
    user: {
      id: session.sub,
      email: session.email || null,
      fullName: typeof (session as any).fullName === 'string' ? (session as any).fullName : 'BG Laundry Staff',
      role: session.role,
      permissions: session.permissions,
    },
  });
}
