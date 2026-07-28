import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';
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

    if (!databaseAdmin && configuredPasswordValid && process.env.ADMIN_PHONE) {
      const adminPhone = normalizePhone(process.env.ADMIN_PHONE);
      const passwordHash = await bcrypt.hash(configuredPassword!, 12);
      const existingByPhone = await prisma.user.findUnique({ where: { phoneNumber: adminPhone } });
      databaseAdmin = existingByPhone
        ? await prisma.user.update({
            where: { id: existingByPhone.id },
            data: { email: configuredEmail!.trim().toLowerCase(), role: 'ADMIN', passwordHash },
            select: { id: true, email: true, fullName: true, role: true, permissions: true, passwordHash: true },
          })
        : await prisma.user.create({
            data: {
              phoneNumber: adminPhone,
              email: configuredEmail!.trim().toLowerCase(),
              fullName: 'BG Laundry Admin',
              role: 'ADMIN',
              passwordHash,
            },
            select: { id: true, email: true, fullName: true, role: true, permissions: true, passwordHash: true },
          });
    }

    const user = databaseAdmin && (databasePasswordValid || configuredPasswordValid) ? {
      id: databaseAdmin.id,
      email: databaseAdmin.email,
      fullName: databaseAdmin.fullName,
      role: databaseAdmin.role,
      permissions: databaseAdmin.permissions,
    } : {
      id: 'admin-local',
      email: configuredEmail!,
      fullName: 'BG Laundry Admin',
      role: 'ADMIN',
      permissions: [],
    };
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role, permissions: user.permissions }, JWT_SECRET, {
      expiresIn: '12h',
    });

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return NextResponse.json({ error: 'Unable to complete admin login.' }, { status: 500 });
  }
}
