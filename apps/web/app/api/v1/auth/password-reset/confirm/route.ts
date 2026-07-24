import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || '').trim();
    const code = String(body.code || '').trim();
    const password = String(body.password || '');
    const accountType = body.accountType === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    if (!identifier || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Enter the six-digit verification code.' }, { status: 400 });
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least eight characters, one letter, and one number.' }, { status: 400 });
    }

    const isEmail = identifier.includes('@');
    const user = await prisma.user.findFirst({
      where: {
        role: accountType,
        ...(isEmail
          ? { email: { equals: identifier.toLowerCase(), mode: 'insensitive' } }
          : { phoneNumber: normalizePhone(identifier) }),
      },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: 'The code is invalid or expired.' }, { status: 400 });

    const reset = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!reset || reset.expiresAt.getTime() < Date.now() || reset.attempts >= 5) {
      if (reset) await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      return NextResponse.json({ error: 'The code is invalid or expired. Request a new code.' }, { status: 400 });
    }

    const valid = await bcrypt.compare(code, reset.codeHash);
    if (!valid) {
      await prisma.passwordResetToken.update({ where: { id: reset.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: 'The code is invalid or expired.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    ]);
    return NextResponse.json({ success: true, message: 'Your password has been changed. You can now sign in.' });
  } catch (error) {
    console.error('[Password Reset Confirm Error]', error);
    return NextResponse.json({ error: 'Your password could not be changed. Please try again.' }, { status: 500 });
  }
}
