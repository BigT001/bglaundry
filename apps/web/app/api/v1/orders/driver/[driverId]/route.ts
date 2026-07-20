import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> },
) {
  try {
    const { driverId } = await params;

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 },
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        driverId,
        status: {
          notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
        },
      },
      include: {
        items: true,
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('[Driver Orders Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
