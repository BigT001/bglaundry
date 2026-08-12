import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyCustomerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = verifyCustomerToken(bearerToken(request));
  if (!auth) {
    return NextResponse.json({ error: 'Customer authentication required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token || !token.startsWith('ExponentPushToken[')) {
      return NextResponse.json({ error: 'A valid mobile push token is required.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: auth.id },
      data: { pushToken: token },
      select: { id: true, pushToken: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('[Register Push Token Error]', error);
    return NextResponse.json(
      { error: error.message || 'Unable to register push token.' },
      { status: 500 },
    );
  }
}
