export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import * as db from '../../../lib/db.js';
import { processNewApplication } from '../../../lib/automation-engine.js';

export async function GET() {
  try {
    const applications = await db.getAllApplications();
    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const application = await db.createApplication(data);

    // Trigger automation asynchronously
    processNewApplication(db, application.id).catch(console.error);

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
