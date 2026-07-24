import { NextRequest, NextResponse } from 'next/server';
import { InvoiceStatus } from '@bglaundry/database';
import { prisma } from '@/lib/prisma';

const invoiceInclude = {
  customer: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
  items: true,
} as const;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    if (!Object.values(InvoiceStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid invoice status.' }, { status: 400 });
    }
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        sentAt: status === InvoiceStatus.SENT ? new Date() : undefined,
      },
      include: invoiceInclude,
    });
    return NextResponse.json(invoice);
  } catch (error: any) {
    const status = error?.code === 'P2025' ? 404 : 500;
    return NextResponse.json({ error: error.message || 'Unable to update invoice.' }, { status });
  }
}
