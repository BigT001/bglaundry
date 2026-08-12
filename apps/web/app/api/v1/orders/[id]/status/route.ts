import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyAdminToken } from '@/lib/auth';
import { notifyCustomerOrderStatus } from '@/lib/notifications';

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
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID and Status are required' },
        { status: 400 },
      );
    }
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 });
    }
    if ([OrderStatus.PICKED_UP, OrderStatus.DELIVERED].includes(status)) {
      return NextResponse.json(
        { error: `${status === OrderStatus.PICKED_UP ? 'Pickup' : 'Delivery'} can only be confirmed by the rider using the customer PIN.` },
        { status: 403 },
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
    if (order.status === OrderStatus.PAYMENT_PENDING) {
      return NextResponse.json(
        { error: 'Payment must be confirmed before this order can be updated.' },
        { status: 409 },
      );
    }
    if (status === OrderStatus.DELIVERY_PENDING && !order.driverId) {
      return NextResponse.json(
        { error: 'Assign a rider before moving this order to delivery.' },
        { status: 409 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        trackingHistory: {
          create: {
            status,
            note: `Status changed by admin to ${status}.`,
          },
        },
      },
      include: {
        customer: { select: { pushToken: true } },
      },
    });

    notifyCustomerOrderStatus({
      pushToken: updatedOrder.customer.pushToken,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
    }).catch(e => console.warn('[Admin Status Push Error]', e));

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('[Update Order Status Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
