import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const truncate = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return undefined;
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}…`;
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = {
      appName: truncate(body?.appName, 80) || 'BG Laundry',
      platform: truncate(body?.platform, 30) || 'unknown',
      appVersion: truncate(body?.appVersion, 60) || null,
      osVersion: truncate(body?.osVersion, 60) || null,
      deviceModel: truncate(body?.deviceModel, 120) || null,
      screen: truncate(body?.screen, 200) || null,
      errorMessage: truncate(body?.errorMessage, 500) || 'Unknown app error',
      stackTrace: truncate(body?.stackTrace, 5000) || null,
      details: typeof body?.details === 'object' && body.details !== null ? body.details : null,
    };

    const log = await prisma.appCrashLog.create({
      data: payload,
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (error: any) {
    console.error('[Crash Report Submission Error]', error);
    return NextResponse.json({ error: 'Unable to record the crash report.' }, { status: 500 });
  }
}
