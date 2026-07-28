import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { STAFF_ROLES } from '@/lib/admin-permissions';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const configuredEmail = process.env.ADMIN_EMAIL;
    const configuredPassword = process.env.ADMIN_PASSWORD;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid admin email or password.' },
        { status: 401 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    let databaseAdmin = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
        isActive: true,
      },
      select: { id: true, email: true, fullName: true, role: true, permissions: true, passwordHash: true },
    });
    if (databaseAdmin && !STAFF_ROLES.includes(databaseAdmin.role as typeof STAFF_ROLES[number])) {
      databaseAdmin = null;
    }
    const databasePasswordValid = Boolean(databaseAdmin?.passwordHash && await bcrypt.compare(password, databaseAdmin.passwordHash));
    const configuredPasswordValid = Boolean(
      configuredEmail && configuredPassword &&
      normalizedEmail === configuredEmail.trim().toLowerCase() &&
      password === configuredPassword,
    );
    if (!databasePasswordValid && !configuredPasswordValid) {
      return NextResponse.json({ error: 'Invalid admin email or password.' }, { status: 401 });
    }

    // The environment-defined owner is a separate identity from database staff.
    // Never promote or mutate a staff record merely because owner credentials
    // were used to sign in.
    const user = configuredPasswordValid ? {
      id: 'env-super-admin',
      email: configuredEmail!.trim().toLowerCase(),
      fullName: process.env.ADMIN_NAME?.trim() || 'BG Laundry Super Admin',
      role: 'SUPER_ADMIN',
      permissions: [],
    } : {
      id: databaseAdmin.id,
      email: databaseAdmin.email,
      fullName: databaseAdmin.fullName,
      role: databaseAdmin.role,
      permissions: databaseAdmin.permissions,
    };
    const token = jwt.sign({ sub: user.id, email: user.email, fullName: user.fullName, role: user.role, permissions: user.permissions }, JWT_SECRET, {
      expiresIn: '12h',
    });

    const response = NextResponse.json({ token, user });
    response.cookies.set('bg_admin_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return NextResponse.json({ error: 'Unable to complete admin login.' }, { status: 500 });
  }
}
