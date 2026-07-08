export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getActivityLog } from '../../../lib/db.js';

export async function GET() {
  try {
    const logs = await getActivityLog();
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
