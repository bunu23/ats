export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '../../../lib/db';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const data = await request.json();
    const updatedSettings = await updateSettings(data);
    return NextResponse.json({ success: true, data: updatedSettings }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
