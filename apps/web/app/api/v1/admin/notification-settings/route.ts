import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bearerToken, verifyAdminToken } from '@/lib/auth';
import { isSuperAdmin } from '@/lib/admin-permissions';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authorize(request: NextRequest) {
  const actor = verifyAdminToken(bearerToken(request));
  return actor && isSuperAdmin(actor);
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Super Admin access required.' }, { status: 403 });
  const settings = await prisma.notificationSettings.findUnique({ where: { id: 'default' } });
  const fallback = (process.env.ADMIN_NOTIFICATION_EMAILS || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || '')
    .split(',').map(email => email.trim().toLowerCase()).filter(Boolean).slice(0, 3);
  return NextResponse.json({ adminEmails: settings?.adminEmails.length ? settings.adminEmails : fallback });
}

export async function PATCH(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Super Admin access required.' }, { status: 403 });
  const body = await request.json();
  const emails: string[] = Array.isArray(body.adminEmails)
    ? [...new Set<string>(body.adminEmails.map((email: unknown) => String(email).trim().toLowerCase()).filter((email: string) => email.length > 0))]
    : [];
  if (emails.length < 1 || emails.length > 3 || emails.some(email => !emailPattern.test(email))) {
    return NextResponse.json({ error: 'Enter between one and three valid notification email addresses.' }, { status: 400 });
  }
  const settings = await prisma.notificationSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', adminEmails: emails },
    update: { adminEmails: emails },
  });
  return NextResponse.json({ adminEmails: settings.adminEmails });
}
