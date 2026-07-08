import { NextResponse } from 'next/server';
import { toggleAutomationRule } from '../../../../lib/db.js';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { enabled } = await request.json();

    if (enabled === undefined) {
      return NextResponse.json(
        { success: false, error: 'Enabled status is required' },
        { status: 400 }
      );
    }

    const updatedRule = toggleAutomationRule(id, enabled);
    return NextResponse.json({ success: true, data: updatedRule });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
