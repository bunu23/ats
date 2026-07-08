export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAllCandidates, createCandidate } from '../../../lib/db.js';

export async function GET() {
  try {
    const candidates = await getAllCandidates();
    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const candidate = await createCandidate(data);
    return NextResponse.json({ success: true, data: candidate }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
