import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';
import { sendRegistrationVerificationEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = normalizePhone(String(body.phoneNumber || ''));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Enter a valid email address and phone number.' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phoneNumber: phone }] }, select: { id: true } });
    if (existing) return NextResponse.json({ error: 'An account already exists with that email or phone number. Please log in.' }, { status: 409 });

    const recent = await prisma.emailVerificationToken.findUnique({ where: { email } });
    if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
      return NextResponse.json({ error: 'Please wait one minute before requesting another code.' }, { status: 429 });
    }
    const code = crypto.randomInt(100000, 1000000).toString();
    const delivered = await sendRegistrationVerificationEmail({ email, code });

    if (!delivered && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Email delivery is temporarily unavailable. Please try again later.' }, { status: 503 });
    }

    await prisma.emailVerificationToken.upsert({
      where: { email },
      update: { phone, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + 10 * 60_000), attempts: 0, createdAt: new Date() },
      create: { email, phone, codeHash: await bcrypt.hash(code, 10), expiresAt: new Date(Date.now() + 10 * 60_000) },
    });

    return NextResponse.json({
      success: true,
      message: 'A verification code was sent to your email.',
      ...(process.env.NODE_ENV !== 'production' ? { developmentCode: code } : {}),
    });
  } catch (error) {
    console.error('[Registration Email OTP Error]', error);
    return NextResponse.json({ error: 'Email verification is temporarily unavailable.' }, { status: 500 });
  }
}