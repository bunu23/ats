export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDashboardStats } from '../../../lib/db.js';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
