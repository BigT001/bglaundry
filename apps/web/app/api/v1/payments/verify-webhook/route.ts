import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@bglaundry/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, status } = body;

    if (!reference || !status) {
      return NextResponse.json(
        { error: 'Reference and Status are required' },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      return NextResponse.json(
        { error: `Payment reference ${reference} not found` },
        { status: 404 },
      );
    }

    const updatedPayment = await prisma.payment.update({
      where: { reference },
      data: {
        status:
          status === 'SUCCESS'
            ? PaymentStatus.SUCCESSFUL
            : PaymentStatus.FAILED,
      },
    });

    console.log(
      `[Payment Webhook] Updated transaction ${reference} to ${status}`,
    );
    return NextResponse.json(updatedPayment);
  } catch (error: any) {
    console.error('[Verify Webhook Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
