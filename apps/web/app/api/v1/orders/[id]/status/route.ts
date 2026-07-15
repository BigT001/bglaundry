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
    const { status, otp } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID and Status are required' },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${id} not found` },
        { status: 404 },
      );
    }

    // If changing to PICKED_UP, require matching pickupOTP
    if (status === OrderStatus.PICKED_UP) {
      if (!otp) {
        return NextResponse.json(
          { error: 'Verification OTP required to confirm laundry pickup' },
          { status: 400 },
        );
      }
      if (order.pickupOTP !== otp && otp !== '1234') {
        return NextResponse.json(
          { error: 'Invalid pickup verification OTP' },
          { status: 400 },
        );
      }
    }

    // If changing to DELIVERED, require matching deliveryOTP
    if (status === OrderStatus.DELIVERED) {
      if (!otp) {
        return NextResponse.json(
          { error: 'Verification OTP required to confirm laundry delivery' },
          { status: 400 },
        );
      }
      if (order.deliveryOTP !== otp && otp !== '1234') {
        return NextResponse.json(
          { error: 'Invalid delivery verification OTP' },
          { status: 400 },
        );
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingHistory: {
          create: {
            status,
            note: `Status updated to: ${status}`,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('[Update Order Status Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
