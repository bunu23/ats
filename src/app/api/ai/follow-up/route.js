import { NextResponse } from 'next/server';
import { generateFollowUpEmail } from '../../../../lib/ai-service.js';
import { getApplicationById } from '../../../../lib/db.js';

export async function POST(request) {
  try {
    const { applicationId, stage } = await request.json();

    if (!applicationId || !stage) {
      return NextResponse.json(
        { success: false, error: 'applicationId and stage are required' },
        { status: 400 }
      );
    }

    const application = getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const email = await generateFollowUpEmail(application, application, stage);
    return NextResponse.json({ success: true, data: email });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
