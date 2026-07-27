import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyCustomerToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> },
) {
  try {
    const { customerId } = await params;
    const customer = verifyCustomerToken(bearerToken(request));
    if (!customer || customer.id !== customerId) {
      return NextResponse.json({ error: 'Customer authentication required.' }, { status: 401 });
    }

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
        status: history
          ? OrderStatus.DELIVERED
          : { notIn: [OrderStatus.DELIVERED, OrderStatus.PAYMENT_PENDING] },
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
