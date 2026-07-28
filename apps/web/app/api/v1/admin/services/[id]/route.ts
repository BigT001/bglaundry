import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminToken(bearerToken(request), 'pricing.manage')) {
    return NextResponse.json({ error: 'Pricing permission required.' }, { status: 403 });
  }
  try {
    const { id } = await params;

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('[Services DELETE Error]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
