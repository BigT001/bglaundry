import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@bglaundry/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || amount === undefined) {
      return NextResponse.json(
        { error: 'Order ID and Amount are required' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 },
      );
    }

    // Generate a payment transaction code/reference
    const reference = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await prisma.payment.create({
      data: {
        orderId,
        reference,
        amount,
        status: PaymentStatus.PENDING,
        gateway: 'PAYSTACK_MOCK',
      },
    });

    return NextResponse.json({
      payment,
      checkoutUrl: `http://localhost:4000/api/v1/payments/mock-checkout?reference=${reference}`,
    });
  } catch (error: any) {
    console.error('[Initialize Payment Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
