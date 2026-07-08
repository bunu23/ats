export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { deleteCandidate } from '../../../../lib/db.js';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteCandidate(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
