import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyRiderToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = verifyRiderToken(bearerToken(request));
  if (!auth) return NextResponse.json({ error: 'Rider authentication required.' }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: {
      driverId: auth.id,
      status: { in: [
        OrderStatus.PICKUP_PENDING,
        OrderStatus.PICKUP_IN_PROGRESS,
        OrderStatus.DELIVERY_PENDING,
        OrderStatus.DELIVERY_IN_PROGRESS,
      ] },
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      pickupAddress: true,
      deliveryAddress: true,
      pickupDate: true,
      deliveryDate: true,
      items: { select: { id: true, serviceName: true, quantity: true } },
      customer: { select: { fullName: true, phoneNumber: true } },
    },
    orderBy: [{ pickupDate: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(orders);
}
