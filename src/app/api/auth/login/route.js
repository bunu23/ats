export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getUserByCredentials } from '../../../../lib/db.js';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    const user = getUserByCredentials(email, password);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // Set a secure HTTP-only cookie using NextResponse
    const response = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, role: user.role }
    });

    response.cookies.set({
      name: 'ats_session',
      value: user.id,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
