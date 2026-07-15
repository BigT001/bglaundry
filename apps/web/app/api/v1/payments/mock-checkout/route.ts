import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@bglaundry/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return new NextResponse('Missing payment reference parameter', {
        status: 400,
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      return new NextResponse(`Payment reference ${reference} not found`, {
        status: 404,
      });
    }

    // Mark reference successful
    await prisma.payment.update({
      where: { reference },
      data: {
        status: PaymentStatus.SUCCESSFUL,
      },
    });

    console.log(
      `[Payment Webhook Simulation] Updated transaction ${reference} to SUCCESSFUL`,
    );

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px; background-color: #F8FAFC;">
          <h2 style="color: #002B7F;">BG Laundry Secure Checkout</h2>
          <p>Simulating card transaction verification...</p>
          <div style="background-color: #E6F0FA; border: 1px solid #0066FF; display: inline-block; padding: 20px; border-radius: 8px;">
            <p><strong>Transaction Ref:</strong> ${reference}</p>
            <p style="color: green; font-weight: bold;">Payment Successful!</p>
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #64748B;">You can close this tab and return to the application.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('[Mock Checkout Error]', error);
    return new NextResponse(
      `Internal server error: ${error.message || error}`,
      { status: 500 },
    );
  }
}
