import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, pickupAddress, deliveryAddress, pickupDate, items } =
      body;

    if (!customerId || !pickupAddress || !deliveryAddress || !pickupDate || !items) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 },
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );

    // Generate consecutive Order number
    const count = await prisma.order.count();
    const orderNumber = `BG-${1000 + count + 1}`;

    // Generate random 4-digit verification keys
    const pickupOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const deliveryOTP = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        pickupAddress,
        deliveryAddress,
        pickupDate: new Date(pickupDate),
        totalAmount,
        pickupOTP,
        deliveryOTP,
        status: OrderStatus.PICKUP_PENDING,
        items: {
          create: items.map((item: any) => ({
            serviceName: item.serviceName,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        trackingHistory: {
          create: {
            status: OrderStatus.PICKUP_PENDING,
            note: 'Order submitted. Waiting for driver assignment.',
          },
        },
      },
      include: {
        items: true,
      },
    });

    console.log(
      `[Order] Created ${orderNumber} - PickupOTP: ${pickupOTP}, DeliveryOTP: ${deliveryOTP}`,
    );
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('[Book Order Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
