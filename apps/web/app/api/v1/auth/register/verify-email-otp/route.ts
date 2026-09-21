import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const password = String(body.password || '');
    if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: 'Enter the six-digit verification code.' }, { status: 400 });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return NextResponse.json({ error: 'Password must contain at least eight characters, one letter, and one number.' }, { status: 400 });

    const verification = await prisma.emailVerificationToken.findUnique({ where: { email } });
    if (!verification || verification.expiresAt.getTime() < Date.now() || verification.attempts >= 5) return NextResponse.json({ error: 'The code is invalid or expired. Request a new code.' }, { status: 400 });
    if (!await bcrypt.compare(code, verification.codeHash)) {
      await prisma.emailVerificationToken.update({ where: { email }, data: { attempts: { increment: 1 } } });
      return NextResponse.json({ error: 'The code is invalid or expired.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, phoneNumber: verification.phone, fullName: 'Customer Account', passwordHash, role: 'CUSTOMER' } });
    await prisma.emailVerificationToken.delete({ where: { email } });
    const token = jwt.sign({ id: user.id, phoneNumber: user.phoneNumber, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    return NextResponse.json({ success: true, token, user: { id: user.id, email: user.email, phoneNumber: user.phoneNumber, fullName: user.fullName, role: user.role } }, { status: 201 });
  } catch (error: any) {
    console.error('[Registration Email OTP Verification Error]', error);
    if (error?.code === 'P2002') return NextResponse.json({ error: 'An account already exists with that email or phone number. Please log in.' }, { status: 409 });
    return NextResponse.json({ error: 'Registration could not be completed. Please try again.' }, { status: 500 });
  }
}