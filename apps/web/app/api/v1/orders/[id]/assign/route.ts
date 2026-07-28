import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyAdminToken(bearerToken(request), 'orders.manage')) {
    return NextResponse.json({ error: 'Order management permission required.' }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { driverId } = body;

    if (!id || !driverId) {
      return NextResponse.json(
        { error: 'Order ID and Driver ID are required' },
        { status: 400 },
      );
    }

    // Verify driver exists
    const driver = await prisma.user.findUnique({ where: { id: driverId } });
    if (!driver) {
      return NextResponse.json(
        { error: `Driver with ID ${driverId} not found` },
        { status: 404 },
      );
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (existingOrder.status === OrderStatus.PAYMENT_PENDING) {
      return NextResponse.json({ error: 'Payment must be confirmed before rider assignment.' }, { status: 409 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        driverId,
        trackingHistory: {
          create: {
            status: OrderStatus.PICKUP_PENDING,
            note: 'Rider assigned. Waiting for the rider to start the pickup route.',
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('[Assign Driver Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
