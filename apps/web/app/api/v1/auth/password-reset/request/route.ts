import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import axios from 'axios';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';
import { STAFF_ROLES } from '@/lib/admin-permissions';
import { sendPasswordResetEmail } from '@/lib/email';

const GENERIC_MESSAGE = 'If an eligible account matches those details, a verification code has been sent.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || '').trim();
    const accountType = body.accountType === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    if (!identifier) return NextResponse.json({ error: 'Enter your phone number or admin email.' }, { status: 400 });

    const isEmail = identifier.includes('@');
    let user = await prisma.user.findFirst({
      where: {
        isActive: true,
        ...(isEmail
          ? { email: { equals: identifier.toLowerCase(), mode: 'insensitive' } }
          : { phoneNumber: normalizePhone(identifier) }),
      },
      select: { id: true, phoneNumber: true, email: true, fullName: true, role: true },
    });
    const eligible = user && (
      accountType === 'ADMIN'
        ? STAFF_ROLES.includes(user.role as typeof STAFF_ROLES[number])
        : user.role === 'CUSTOMER'
    );
    if (!eligible) user = null;

    if (!user) return NextResponse.json({ success: true, message: GENERIC_MESSAGE });

    const recent = await prisma.passwordResetToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < 60_000) {
      return NextResponse.json({ error: 'Please wait one minute before requesting another code.' }, { status: 429 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60_000) },
      }),
    ]);

    const emailDelivered = user.email
      ? await sendPasswordResetEmail({ email: user.email, fullName: user.fullName, code })
      : false;
    let smsDelivered = false;
    const termiiApiKey = process.env.TERMII_API_KEY;
    const rawPhone = user.phoneNumber.replace(/\D/g, '');
    if (termiiApiKey && termiiApiKey !== 'termii_mock_api_key') {
      try {
        await axios.post('https://api.ng.termii.com/api/sms/send', {
          to: rawPhone,
          from: process.env.TERMII_SENDER_ID || 'BGLAUNDRY',
          sms: `Your BG Laundry password reset code is ${code}. It expires in 10 minutes. Do not share it.`,
          type: 'plain',
          channel: 'generic',
          api_key: termiiApiKey,
        }, { timeout: 12_000 });
        smsDelivered = true;
      } catch (error: any) {
        console.error('[Password Reset SMS Error]', error?.response?.data || error?.message);
      }
    }

    if (!emailDelivered && !smsDelivered && process.env.NODE_ENV === 'production') {
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      return NextResponse.json({ error: 'Password recovery is temporarily unavailable. Please contact support.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      message: GENERIC_MESSAGE,
      ...(process.env.NODE_ENV !== 'production' ? { developmentCode: code } : {}),
    });
  } catch (error) {
    console.error('[Password Reset Request Error]', error);
    return NextResponse.json({ error: 'Password recovery is temporarily unavailable.' }, { status: 500 });
  }
}
