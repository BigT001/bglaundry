import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken, verifyCustomerToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        driver: true,
        trackingHistory: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${id} not found` },
        { status: 404 },
      );
    }
    const token = bearerToken(request);
    const admin = verifyAdminToken(token);
    const customer = verifyCustomerToken(token);
    if (!admin && (!customer || customer.id !== order.customerId)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('[Find One Order Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
