import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

type SessionPayload = {
  id?: string;
  sub?: string;
  role?: string;
};

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session: SessionPayload;
    try {
      session = jwt.verify(authorization.slice(7), JWT_SECRET) as SessionPayload;
    } catch {
      return NextResponse.json(
        { error: 'Your session is invalid or expired. Please sign in again.' },
        { status: 401 },
      );
    }

    const userId = session.id || session.sub;
    if (!userId || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 },
      );
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return NextResponse.json(
        { error: 'New password must contain at least eight characters, one letter, and one number.' },
        { status: 400 },
      );
    }
    if (newPassword.length > 128 || currentPassword.length > 128) {
      return NextResponse.json({ error: 'Password is too long.' }, { status: 400 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Choose a new password that is different from your current password.' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.passwordResetToken.deleteMany({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('[Change Password Error]', error);
    return NextResponse.json(
      { error: 'Your password could not be changed. Please try again.' },
      { status: 500 },
    );
  }
}
