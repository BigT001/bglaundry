import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyCustomerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const customer = verifyCustomerToken(bearerToken(request));
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer authentication required.' },
        { status: 401 },
      );
    }
    const body = await request.json();
    const { pickupAddress, deliveryAddress, pickupDate, items } = body;

    if (!pickupAddress || !deliveryAddress || !pickupDate || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 },
      );
    }

    const pickupAt = new Date(pickupDate);
    if (Number.isNaN(pickupAt.getTime())) {
      return NextResponse.json({ error: 'Pickup date is invalid.' }, { status: 400 });
    }
    if (pickupAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Pickup date must be in the future.' }, { status: 400 });
    }

    const services = await prisma.service.findMany();
    const pricedItems = items.map((item: any) => {
      const serviceName = String(item.serviceName || '').trim();
      const quantity = Number(item.quantity);
      if (!serviceName || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw new Error('INVALID_ORDER_ITEM');
      }
      const normalized = serviceName.toLowerCase();
      const service = services
        .filter((candidate) => normalized.includes(candidate.name.toLowerCase()))
        .sort((a, b) => b.name.length - a.name.length)[0];
      if (!service) throw new Error(`UNKNOWN_SERVICE:${serviceName}`);

      let price: number;
      if (normalized.includes('wash & iron') || normalized.includes('wash and iron')) {
        if (!service.hasWashIron) throw new Error(`UNAVAILABLE_SERVICE:${serviceName}`);
        price = service.washIronPrice;
      } else if (normalized.includes('iron only') || normalized.includes('(ironing)')) {
        if (!service.hasIron) throw new Error(`UNAVAILABLE_SERVICE:${serviceName}`);
        price = service.ironPrice;
      } else {
        if (!service.hasWash) throw new Error(`UNAVAILABLE_SERVICE:${serviceName}`);
        price = service.washPrice;
      }
      if (!Number.isFinite(price) || price <= 0) throw new Error(`INVALID_PRICE:${serviceName}`);
      return { serviceName, quantity, price };
    });

    const totalAmount = pricedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Generate consecutive Order number
    const count = await prisma.order.count();
    const orderNumber = `BG-${1000 + count + 1}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        pickupAddress,
        deliveryAddress,
        pickupDate: pickupAt,
        totalAmount,
        status: OrderStatus.PAYMENT_PENDING,
        items: {
          create: pricedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch (error: any) {
    if (error.message === 'INVALID_ORDER_ITEM') {
      return NextResponse.json({ error: 'One or more order items are invalid.' }, { status: 400 });
    }
    if (/^(UNKNOWN_SERVICE|UNAVAILABLE_SERVICE|INVALID_PRICE):/.test(error.message || '')) {
      return NextResponse.json(
        { error: 'A selected service is unavailable or has changed. Refresh the catalogue and try again.' },
        { status: 409 },
      );
    }
    console.error('[Book Order Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
