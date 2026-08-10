import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyRiderToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = verifyRiderToken(bearerToken(request));
  if (!auth) return NextResponse.json({ error: 'Rider authentication required.' }, { status: 401 });

  const rider = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, isActive: true, role: true },
  });
  if (!rider || rider.role !== 'DRIVER' || !rider.isActive) {
    return NextResponse.json({ error: 'Rider account is inactive or unavailable.' }, { status: 403 });
  }

  const earnings = await prisma.earning.findMany({
    where: { driverId: auth.id },
    select: { id: true, amount: true, description: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  const total = earnings.reduce((sum, earning) => sum + earning.amount, 0);

  return NextResponse.json({ total, earnings });
}
