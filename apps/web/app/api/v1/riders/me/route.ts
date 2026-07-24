import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyRiderToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = verifyRiderToken(bearerToken(request));
  if (!auth) return NextResponse.json({ error: 'Rider authentication required.' }, { status: 401 });

  const rider = await prisma.user.findUnique({
    where: { id: auth.id },
    select: {
      id: true, fullName: true, phoneNumber: true,
      driverProfile: { select: { isOnline: true, currentLat: true, currentLng: true } },
    },
  });
  if (!rider) return NextResponse.json({ error: 'Rider not found.' }, { status: 404 });
  return NextResponse.json(rider);
}

export async function PATCH(request: NextRequest) {
  const auth = verifyRiderToken(bearerToken(request));
  if (!auth) return NextResponse.json({ error: 'Rider authentication required.' }, { status: 401 });

  const body = await request.json();
  const data: { isOnline?: boolean; currentLat?: number; currentLng?: number } = {};
  if (typeof body.isOnline === 'boolean') data.isOnline = body.isOnline;
  if (Number.isFinite(body.currentLat) && Number.isFinite(body.currentLng)) {
    data.currentLat = body.currentLat;
    data.currentLng = body.currentLng;
  }
  const profile = await prisma.driverProfile.upsert({
    where: { userId: auth.id },
    create: { userId: auth.id, ...data },
    update: data,
  });
  return NextResponse.json(profile);
}
