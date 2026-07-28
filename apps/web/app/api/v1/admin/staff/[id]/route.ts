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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = verifyAdminToken(bearerToken(request), 'staff.manage');
  if (!actor || !isSuperAdmin(actor)) return NextResponse.json({ error: 'Super admin access required.' }, { status: 403 });
  try {
    const { id } = await params;
    if (id === actor.sub) return NextResponse.json({ error: 'You cannot change your own role or access here.' }, { status: 400 });
    const body = await request.json();
    const role = typeof body.role === 'string' && STAFF_ROLES.includes(body.role as typeof STAFF_ROLES[number])
      ? body.role as Role
      : null;
    if (!role) return NextResponse.json({ error: 'Select a valid staff role.' }, { status: 400 });
    const permissions = [...new Set(cleanPermissions(body.permissions))];
    const password = typeof body.password === 'string' ? body.password : '';
    if (password && password.length < 8) return NextResponse.json({ error: 'The new password must be at least 8 characters.' }, { status: 400 });

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: typeof body.fullName === 'string' ? body.fullName.trim() : undefined,
        email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined,
        phoneNumber: typeof body.phoneNumber === 'string' ? normalizePhone(body.phoneNumber) : undefined,
        role,
        permissions: FULL_ACCESS_ROLES.includes(role as typeof FULL_ACCESS_ROLES[number]) ? [] : permissions,
        isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
      select: { id: true, fullName: true, phoneNumber: true, email: true, role: true, permissions: true, isActive: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'That email address or phone number is already in use.' }, { status: 409 });
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Staff account not found.' }, { status: 404 });
    return NextResponse.json({ error: error.message || 'Unable to update staff account.' }, { status: 500 });
  }
}
