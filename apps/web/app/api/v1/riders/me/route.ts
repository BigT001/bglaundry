import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyRiderToken } from '@/lib/auth';
import { sendRiderArrivalEmails } from '@/lib/email';

export const dynamic = 'force-dynamic';

const geocodeCache = new Map<string, { coordinates: [number, number]; expires: number }>();

async function geocode(address: string): Promise<[number, number] | null> {
  const cached = geocodeCache.get(address);
  if (cached && cached.expires > Date.now()) return cached.coordinates;
  const token = process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=ng&limit=1&access_token=${token}`, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    const center = data.features?.[0]?.center;
    if (!Array.isArray(center)) return null;
    const coordinates: [number, number] = [center[1], center[0]];
    geocodeCache.set(address, { coordinates, expires: Date.now() + 30 * 60_000 });
    return coordinates;
  } catch { return null; }
}

function distanceMetres(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLng = radians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
    if (body.currentLat < -90 || body.currentLat > 90 || body.currentLng < -180 || body.currentLng > 180) {
      return NextResponse.json({ error: 'Invalid GPS coordinates.' }, { status: 400 });
    }
    data.currentLat = body.currentLat;
    data.currentLng = body.currentLng;
  }
  const profile = await prisma.driverProfile.upsert({
    where: { userId: auth.id },
    create: { userId: auth.id, ...data },
    update: data,
  });
  if (data.currentLat != null && data.currentLng != null) {
    const orders = await prisma.order.findMany({
      where: { driverId: auth.id, status: { in: ['PICKUP_IN_PROGRESS', 'DELIVERY_IN_PROGRESS'] } },
      include: { customer: { select: { fullName: true } }, trackingHistory: { select: { note: true } } },
    });
    for (const order of orders) {
      const pickup = order.status === 'PICKUP_IN_PROGRESS';
      const place = pickup ? 'pickup' : 'delivery';
      const note = `Rider arrived at the ${place} location.`;
      if (order.trackingHistory.some(event => event.note === note)) continue;
      const destination = await geocode(pickup ? order.pickupAddress : order.deliveryAddress);
      if (!destination || distanceMetres(data.currentLat, data.currentLng, destination[0], destination[1]) > 150) continue;
      await prisma.trackingEvent.create({ data: { orderId: order.id, status: order.status, note } });
      await sendRiderArrivalEmails({ orderNumber: order.orderNumber, customerName: order.customer.fullName, place });
    }
  }
  return NextResponse.json(profile);
}
