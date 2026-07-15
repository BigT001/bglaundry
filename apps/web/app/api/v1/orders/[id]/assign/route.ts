import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
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

    const order = await prisma.order.update({
      where: { id },
      data: {
        driverId,
        status: OrderStatus.PICKUP_IN_PROGRESS,
        trackingHistory: {
          create: {
            status: OrderStatus.PICKUP_IN_PROGRESS,
            note: 'Driver assigned and is en-route for pickup.',
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
