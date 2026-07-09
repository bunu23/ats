export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAutomationRules, createAutomationRule } from '../../../lib/db';

export async function GET() {
  try {
    const rules = await getAutomationRules();
    return NextResponse.json({ success: true, data: rules });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const rule = await createAutomationRule(data);
    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
