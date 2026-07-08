export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAllJobs, createJob } from '../../../lib/db.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobs = await getAllJobs(status);
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const job = await createJob(data);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
