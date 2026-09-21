import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(bearerToken(request), 'dashboard.view')) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  try {
    const logs = await prisma.appCrashLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        appName: true,
        platform: true,
        appVersion: true,
        osVersion: true,
        deviceModel: true,
        screen: true,
        errorMessage: true,
        stackTrace: true,
        details: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('[Admin Crash Logs Error]', error);
    return NextResponse.json({ error: 'Unable to load crash logs.' }, { status: 500 });
  }
}
