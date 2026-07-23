import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'secret-key-for-dev-bglaundry-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const configuredEmail = process.env.ADMIN_EMAIL;
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!configuredEmail || !configuredPassword) {
      console.error('[Admin Login] ADMIN_EMAIL or ADMIN_PASSWORD is not configured.');
      return NextResponse.json(
        { error: 'Admin login is not configured. Add the admin environment variables first.' },
        { status: 503 },
      );
    }

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.trim().toLowerCase() !== configuredEmail.trim().toLowerCase() ||
      password !== configuredPassword
    ) {
      return NextResponse.json(
        { error: 'Invalid admin email or password.' },
        { status: 401 },
      );
    }

    const user = {
      id: 'admin-local',
      email: configuredEmail,
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
