import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { parseMobileReport } from '@/lib/mobile-health-validation';
import { reportFingerprint } from '@/lib/mobile-health';

export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get('content-length')) > 24000) return NextResponse.json({ error: 'Report too large.' }, { status: 413 });
    const text = await request.text();
    if (text.length > 24000) return NextResponse.json({ error: 'Report too large.' }, { status: 413 });
    let reports;
    try {
      const body = JSON.parse(text);
      if (!Array.isArray(body.reports) || !body.reports.length || body.reports.length > 10) throw new Error();
      reports = body.reports.map(parseMobileReport);
    } catch { return NextResponse.json({ error: 'Invalid diagnostic report.' }, { status: 400 }); }
    // Anonymous ingestion is necessary for crashes before login. Reports are untrusted.
    const secret = process.env.JWT_SECRET;
    if (!secret) return NextResponse.json({ error: 'Reporting not configured.' }, { status: 503 });
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateKey = crypto.createHmac('sha256', secret).update(new Date().toISOString().slice(0, 10) + ':' + ip).digest('hex');
    const recent = await prisma.mobileReport.count({ where: { rateKey, createdAt: { gte: new Date(Date.now() - 15 * 60000) } } });
    if (recent + reports.length > 100) return NextResponse.json({ error: 'Try later.' }, { status: 429, headers: { 'Retry-After': '900' } });
    await prisma.mobileReport.createMany({ data: reports.map(report => ({ ...report, rateKey, source: 'MOBILE', fingerprint: reportFingerprint(report), status: report.kind === 'APP_START' ? 'RESOLVED' : 'OPEN' })), skipDuplicates: true });
    return NextResponse.json({ accepted: reports.map(report => report.eventId) }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Reporting temporarily unavailable.' }, { status: 503 });
  }
}
