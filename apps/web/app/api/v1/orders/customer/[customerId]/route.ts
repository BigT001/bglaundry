import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 },
      );
    }

    const history = request.nextUrl.searchParams.get('history') === 'true';

    const orders = await prisma.order.findMany({
      where: {
        customerId,
        status: history ? OrderStatus.DELIVERED : { not: OrderStatus.DELIVERED },
      },
      include: {
        items: true,
        driver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('[Customer Orders Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
