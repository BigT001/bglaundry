import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@bglaundry/database';
import { bearerToken, verifyCustomerToken } from '@/lib/auth';
import { sendNewOrderEmails } from '@/lib/email';

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

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Basket cannot be empty' },
        { status: 400 },
      );
    }

    // Retrieve user profile to default to customer's saved address
    const userProfile = await prisma.user.findUnique({
      where: { id: customer.id },
      select: { pickupAddress: true, homeAddress: true, officeAddress: true },
    });

    const defaultCustomerAddress = userProfile?.pickupAddress || userProfile?.homeAddress || userProfile?.officeAddress || '';
    const finalPickupAddress = (pickupAddress && String(pickupAddress).trim()) || defaultCustomerAddress;
    const finalDeliveryAddress = (deliveryAddress && String(deliveryAddress).trim()) || finalPickupAddress;

    if (!finalPickupAddress) {
      return NextResponse.json(
        { error: 'Pickup address is mandatory. Please enter your pickup address.' },
        { status: 400 },
      );
    }

    // Default pickup date to now (riders will be dispatched immediately)
    const pickupAt = pickupDate ? new Date(pickupDate) : new Date();
    const validPickupAt = Number.isNaN(pickupAt.getTime()) ? new Date() : pickupAt;

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
        pickupAddress: finalPickupAddress,
        deliveryAddress: finalDeliveryAddress,
        pickupDate: validPickupAt,
        totalAmount,
        status: OrderStatus.PAYMENT_PENDING,
        items: {
          create: pricedItems,
        },
      },
      include: {
        items: true,
        customer: {
          select: { fullName: true, email: true, phoneNumber: true },
        },
      },
    });

    await sendNewOrderEmails({
      orderNumber: order.orderNumber,
      customerName: order.customer.fullName,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phoneNumber,
      pickupAddress: order.pickupAddress,
      pickupDate: order.pickupDate,
      totalAmount: order.totalAmount,
      items: order.items,
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
      { error: 'We could not prepare your checkout. Please try again shortly.' },
      { status: 500 },
    );
  }
}
