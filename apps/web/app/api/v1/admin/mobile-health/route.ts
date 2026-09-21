import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
function allowed(request: NextRequest) {
  const actor = verifyAdminToken(bearerToken(request));
  return actor && ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(actor.role);
}
export async function GET(request: NextRequest) {
  if (!allowed(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  try {
    const status = request.nextUrl.searchParams.get('status');
    const kind = request.nextUrl.searchParams.get('kind');
    const before = request.nextUrl.searchParams.get('before');
    const beforeDate = before ? new Date(before) : null;
    if (beforeDate && !Number.isFinite(beforeDate.getTime())) return NextResponse.json({ error: 'Invalid cursor.' }, { status: 400 });
    const since = new Date(Date.now() - 7 * 86400_000);
    const [reports, counts] = await Promise.all([
      prisma.mobileReport.findMany({
        where: { ...(status && ['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status) ? { status } : {}), ...(kind ? { kind } : {}), ...(beforeDate ? { createdAt: { lt: beforeDate } } : {}) },
        orderBy: { createdAt: 'desc' }, take: 51,
        select: { id: true, source: true, kind: true, platform: true, appVersion: true, osVersion: true, errorName: true, stack: true, endpoint: true, httpStatus: true, durationMs: true, fingerprint: true, status: true, occurredAt: true, createdAt: true },
      }),
      prisma.mobileReport.groupBy({ by: ['kind'], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    ]);
    const provider = process.env.SMS_PROVIDER || 'sendchamp';
    const key = provider === 'sendchamp' ? process.env.SENDCHAMP_API_KEY : provider === 'termii' ? process.env.TERMII_API_KEY : '';
    return NextResponse.json({ reports: reports.slice(0, 50), nextCursor: reports.length > 50 ? reports[49].createdAt : null, counts: Object.fromEntries(counts.map(row => [row.kind, row._count._all])), sms: { provider, configured: Boolean(key?.trim() && !key.includes('mock_api_key')), deliveryConfirmed: false }, generatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Mobile health is unavailable. Check the database connection and apply the mobile reports migration.' }, { status: 503 });
  }
}
export async function PATCH(request: NextRequest) {
  if (!allowed(request)) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  try {
    const body = await request.json();
    if (typeof body.id !== 'string' || !['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(body.status)) return NextResponse.json({ error: 'Invalid report status.' }, { status: 400 });
    const result = await prisma.mobileReport.updateMany({ where: { id: body.id }, data: { status: body.status } });
    return NextResponse.json({ success: result.count === 1 }, { status: result.count ? 200 : 404 });
  } catch { return NextResponse.json({ error: 'Could not update report.' }, { status: 503 }); }
}
