import { NextRequest, NextResponse } from 'next/server';
import { InvoiceStatus, Role } from '@bglaundry/database';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken } from '@/lib/auth';
import { normalizePhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

const invoiceInclude = {
  customer: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
  items: true,
} as const;

async function nextInvoiceNumber() {
  const prefix = `BGL-${new Date().getFullYear()}-`;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const number = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;
    const exists = await prisma.invoice.findUnique({ where: { invoiceNumber: number }, select: { id: true } });
    if (!exists) return number;
  }
  throw new Error('Unable to reserve an invoice number. Please try again.');
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(bearerToken(request), 'invoices.manage')) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const invoices = await prisma.invoice.findMany({
      include: invoiceInclude,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error('[List Invoices Error]', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(bearerToken(request), 'invoices.manage')) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  try {
    const body = await request.json();
    let customerId = typeof body.customerId === 'string' ? body.customerId : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;
    const rawItems = Array.isArray(body.items) ? body.items : [];

    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'Add at least one invoice item.' }, { status: 400 });
    }
    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Enter a valid due date.' }, { status: 400 });
    }

    if (!customerId && body.newCustomer) {
      const fullName = typeof body.newCustomer.fullName === 'string' ? body.newCustomer.fullName.trim() : '';
      const rawPhone = typeof body.newCustomer.phoneNumber === 'string' ? body.newCustomer.phoneNumber.trim() : '';
      const email = typeof body.newCustomer.email === 'string' ? body.newCustomer.email.trim().toLowerCase() : '';
      if (fullName.length < 2 || rawPhone.replace(/\D/g, '').length < 10) {
        return NextResponse.json({ error: 'Enter the new customer’s name and a valid WhatsApp phone number.' }, { status: 400 });
      }
      const phoneNumber = normalizePhone(rawPhone);
      const existing = await prisma.user.findUnique({ where: { phoneNumber } });
      if (existing && existing.role !== Role.CUSTOMER) {
        return NextResponse.json({ error: 'That phone number belongs to a non-customer account.' }, { status: 409 });
      }
      if (email) {
        const emailOwner = await prisma.user.findUnique({ where: { email } });
        if (emailOwner && emailOwner.id !== existing?.id) {
          return NextResponse.json({ error: 'That email address is already connected to another account.' }, { status: 409 });
        }
      }
      const customerRecord = existing
        ? await prisma.user.update({
            where: { id: existing.id },
            data: { fullName, ...(email ? { email } : {}) },
            select: { id: true },
          })
        : await prisma.user.create({
            data: { fullName, phoneNumber, email: email || null, role: Role.CUSTOMER },
            select: { id: true },
          });
      customerId = customerRecord.id;
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Select an existing customer or add a new customer.' }, { status: 400 });
    }
    const customer = await prisma.user.findFirst({ where: { id: customerId, role: Role.CUSTOMER }, select: { id: true } });
    if (!customer) return NextResponse.json({ error: 'Selected customer was not found.' }, { status: 404 });

    const items = rawItems.map((item: unknown) => {
      const source = item as Record<string, unknown>;
      const description = typeof source.description === 'string' ? source.description.trim() : '';
      const quantity = Number(source.quantity);
      const unitPrice = Number(source.unitPrice);
      if (!description || !Number.isInteger(quantity) || quantity < 1 || !Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error('Each item needs a description, positive quantity, and valid unit price.');
      }
      return { description, quantity, unitPrice, lineTotal: quantity * unitPrice };
    });

    const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await nextInvoiceNumber(),
        customerId,
        subtotal,
        totalAmount: subtotal,
        notes: notes || null,
        dueDate,
        items: { create: items },
      },
      include: invoiceInclude,
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('[Create Invoice Error]', error);
    return NextResponse.json({ error: error.message || 'Unable to create invoice.' }, { status: 400 });
  }
}
