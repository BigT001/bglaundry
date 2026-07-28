import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { Role } from '@bglaundry/database';
import { prisma } from '@/lib/prisma';
import { ADMIN_PERMISSIONS, FULL_ACCESS_ROLES, STAFF_ROLES, isSuperAdmin } from '@/lib/admin-permissions';
import { bearerToken, verifyAdminToken } from '@/lib/auth';
import { normalizePhone } from '@/lib/phone';

const permissionKeys = new Set<string>(ADMIN_PERMISSIONS.map(permission => permission.key));
const cleanPermissions = (input: unknown): string[] =>
  Array.isArray(input) ? input.filter((value): value is string => typeof value === 'string' && permissionKeys.has(value)) : [];

function authorize(request: NextRequest) {
  const actor = verifyAdminToken(bearerToken(request), 'staff.manage');
  return actor && isSuperAdmin(actor) ? actor : null;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Staff management permission required.' }, { status: 403 });

  const staff = await prisma.user.findMany({
    where: { role: { in: [...STAFF_ROLES] } },
    select: {
      id: true, fullName: true, phoneNumber: true, email: true, role: true,
      permissions: true, isActive: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ staff });
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) return NextResponse.json({ error: 'Staff management permission required.' }, { status: 403 });
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phoneNumber = typeof body.phoneNumber === 'string' ? normalizePhone(body.phoneNumber) : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const role = typeof body.role === 'string' && STAFF_ROLES.includes(body.role as typeof STAFF_ROLES[number])
      ? body.role as Role
      : null;
    const permissions = [...new Set(cleanPermissions(body.permissions))];

    if (!fullName || !email || !phoneNumber || !role || password.length < 8) {
      return NextResponse.json({ error: 'Name, email, phone, role, and a password of at least 8 characters are required.' }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        fullName, email, phoneNumber, role,
        permissions: FULL_ACCESS_ROLES.includes(role as typeof FULL_ACCESS_ROLES[number]) ? [] : permissions,
        passwordHash: await bcrypt.hash(password, 12),
      },
      select: { id: true, fullName: true, phoneNumber: true, email: true, role: true, permissions: true, isActive: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'That email address or phone number is already in use.' }, { status: 409 });
    return NextResponse.json({ error: error.message || 'Unable to create staff account.' }, { status: 500 });
  }
}
