import { NextResponse } from 'next/server';
import * as db from '../../../../lib/db.js';
import {
  processStageChange,
  scheduleInterviewReminders
} from '../../../../lib/automation-engine.js';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { stage, interview_date } = await request.json();

    const application = await db.getApplicationById(id);
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    let updatedApplication = application;

    if (stage && application.stage !== stage) {
      const oldStage = application.stage;
      updatedApplication = await db.updateApplicationStage(id, stage);
      // Trigger automation asynchronously
      await processStageChange(db, id, oldStage, stage).catch(console.error);
    }

    if (interview_date !== undefined) {
      updatedApplication = await db.updateApplicationData(id, { interview_date });
      // Schedule reminders synchronously or asynchronously
      scheduleInterviewReminders(db, updatedApplication, interview_date);
    }

    return NextResponse.json({ success: true, data: updatedApplication });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
