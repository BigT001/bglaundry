import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }
  const payment = await prisma.payment.findUnique({
    where: { reference },
    select: { reference: true, status: true },
  });
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  return NextResponse.json(payment, { headers: { 'Cache-Control': 'no-store' } });
}
