import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyRiderToken } from '@/lib/auth';

const transitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PICKUP_PENDING: [OrderStatus.PICKUP_IN_PROGRESS],
  PICKUP_IN_PROGRESS: [OrderStatus.PICKED_UP],
  DELIVERY_PENDING: [OrderStatus.DELIVERY_IN_PROGRESS],
  DELIVERY_IN_PROGRESS: [OrderStatus.DELIVERED],
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyRiderToken(bearerToken(request));
  if (!auth) return NextResponse.json({ error: 'Rider authentication required.' }, { status: 401 });
  const { id } = await params;
  const { status, otp } = await request.json();
  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 });
  }
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.driverId !== auth.id) {
    return NextResponse.json({ error: 'This order is not assigned to you.' }, { status: 404 });
  }
  if (!transitions[order.status]?.includes(status)) {
    return NextResponse.json({ error: `Cannot move this order from ${order.status} to ${status}.` }, { status: 409 });
  }
  if (status === OrderStatus.PICKED_UP && (!otp || otp !== order.pickupOTP)) {
    return NextResponse.json({ error: 'The pickup code is incorrect.' }, { status: 400 });
  }
  if (status === OrderStatus.DELIVERED && (!otp || otp !== order.deliveryOTP)) {
    return NextResponse.json({ error: 'The delivery code is incorrect.' }, { status: 400 });
  }
  const note = status === OrderStatus.PICKED_UP
    ? 'Pickup confirmed with customer code.'
    : status === OrderStatus.DELIVERED
      ? 'Delivery confirmed with customer code.'
      : status === OrderStatus.PICKUP_IN_PROGRESS
        ? 'Rider started route to pickup.'
        : 'Rider started delivery route.';
  const updated = await prisma.order.update({
    where: { id },
    data: { status, trackingHistory: { create: { status, note } } },
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
  });
  return NextResponse.json(updated);
}
