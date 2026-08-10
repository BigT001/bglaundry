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

    // Retrieve user profile to default to customer's saved address and ensure customerId exists in DB
    const userProfile = await prisma.user.findFirst({
      where: {
        OR: [
          { id: customer.id },
          ...(customer.phoneNumber ? [{ phoneNumber: customer.phoneNumber }] : []),
        ],
      },
      select: { id: true, pickupAddress: true, homeAddress: true, officeAddress: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign out and sign in again to place an order.' },
        { status: 401 },
      );
    }

    const realCustomerId = userProfile.id;
    const defaultCustomerAddress = userProfile.pickupAddress || userProfile.homeAddress || userProfile.officeAddress || '';
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

    const services = await prisma.service.findMany().catch(() => []);
    const pricedItems = items.map((item: any) => {
      const serviceName = String(item.serviceName || '').trim();
      const quantity = Number(item.quantity);
      if (!serviceName || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
        throw new Error('INVALID_ORDER_ITEM');
      }
      const normalized = serviceName.toLowerCase();
      const service = services
        .filter((candidate) => candidate.name && normalized.includes(candidate.name.toLowerCase()))
        .sort((a, b) => b.name.length - a.name.length)[0];

      let price: number = 0;
      if (service) {
        if (normalized.includes('wash & iron') || normalized.includes('wash and iron')) {
          price = service.washIronPrice || service.washPrice || 700;
        } else if (normalized.includes('iron only') || normalized.includes('(ironing)')) {
          price = service.ironPrice || 300;
        } else {
          price = service.washPrice || service.washIronPrice || 500;
        }
      }

      // If price from catalog lookup is not found or zero, fallback to the item price passed from shopping basket!
      if (!price || !Number.isFinite(price) || price <= 0) {
        price = Number(item.price);
      }
      if (!Number.isFinite(price) || price <= 0) {
        price = 500; // safe fallback
      }

      return { serviceName, quantity, price };
    });

    const totalAmount = pricedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Generate unique consecutive Order number safely without unique constraint collisions
    const latestOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });

    let nextNum = 1001;
    if (latestOrder?.orderNumber?.startsWith('BG-')) {
      const parsed = parseInt(latestOrder.orderNumber.replace('BG-', ''), 10);
      if (!Number.isNaN(parsed) && parsed >= 1000) {
        nextNum = parsed + 1;
      }
    } else {
      const count = await prisma.order.count();
      nextNum = 1000 + count + 1;
    }

    let orderNumber = `BG-${nextNum}`;
    let collisionCheck = await prisma.order.findUnique({ where: { orderNumber } });
    let safetyCounter = 0;
    while (collisionCheck && safetyCounter < 50) {
      nextNum += 1;
      orderNumber = `BG-${nextNum}`;
      collisionCheck = await prisma.order.findUnique({ where: { orderNumber } });
      safetyCounter += 1;
    }
    if (collisionCheck) {
      orderNumber = `BG-${Date.now().toString().slice(-6)}`;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: realCustomerId,
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

    // Send notifications silently without blocking order creation
    sendNewOrderEmails({
      orderNumber: order.orderNumber,
      customerName: order.customer.fullName,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phoneNumber,
      pickupAddress: order.pickupAddress,
      pickupDate: order.pickupDate,
      totalAmount: order.totalAmount,
      items: order.items,
    }).catch((emailErr) => {
      console.warn('[Book Order Email Warning]', emailErr);
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('[Book Order Error]', error);
    if (error.message === 'INVALID_ORDER_ITEM') {
      return NextResponse.json({ error: 'One or more order items are invalid.' }, { status: 400 });
    }
    if (/^(UNKNOWN_SERVICE|UNAVAILABLE_SERVICE|INVALID_PRICE):/.test(error.message || '')) {
      return NextResponse.json(
        { error: 'A selected service is unavailable or has changed. Refresh the catalogue and try again.' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error.message || 'We could not prepare your checkout. Please try again shortly.' },
      { status: 500 },
    );
  }
}
