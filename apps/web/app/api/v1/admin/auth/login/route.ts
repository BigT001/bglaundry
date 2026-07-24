import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/phone';

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
      where: { email: { equals: normalizedEmail, mode: 'insensitive' }, role: 'ADMIN' },
      select: { id: true, email: true, fullName: true, role: true, passwordHash: true },
    });
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
            select: { id: true, email: true, fullName: true, role: true, passwordHash: true },
          })
        : await prisma.user.create({
            data: {
              phoneNumber: adminPhone,
              email: configuredEmail!.trim().toLowerCase(),
              fullName: 'BG Laundry Admin',
              role: 'ADMIN',
              passwordHash,
            },
            select: { id: true, email: true, fullName: true, role: true, passwordHash: true },
          });
    }

    const user = databaseAdmin && (databasePasswordValid || configuredPasswordValid) ? {
      id: databaseAdmin.id,
      email: databaseAdmin.email,
      fullName: databaseAdmin.fullName,
      role: databaseAdmin.role,
    } : {
      id: 'admin-local',
      email: configuredEmail!,
      fullName: 'BG Laundry Admin',
      role: 'ADMIN',
    };
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '12h',
    });

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return NextResponse.json({ error: 'Unable to complete admin login.' }, { status: 500 });
  }
}
