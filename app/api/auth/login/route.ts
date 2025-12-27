import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getPasswordHash } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    const passwordHash = getPasswordHash();
    const isValid = verifyPassword(password, passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Set session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('app_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
