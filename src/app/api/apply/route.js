export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import * as db from '../../../lib/db.js';
import { processNewApplication } from '../../../lib/automation-engine.js';

export async function POST(request) {
  try {
    const data = await request.json();
    const { job_id, name, email, phone, experience_years, education, skills, resume_text } = data;

    if (!job_id || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = db.getJobById(job_id);
    if (!job || job.status !== 'Open') {
      return NextResponse.json(
        { success: false, error: 'Job is not open for applications' },
        { status: 400 }
      );
    }

    // 1. Find or Create Candidate
    let candidate = db.getCandidateByEmail(email);
    if (!candidate) {
      candidate = db.createCandidate({
        name,
        email,
        phone,
        experience_years: parseInt(experience_years) || 0,
        education,
        skills,
        resume_text
      });
    }

    // 2. Create Application
    const firstStage =
      job.custom_stages && job.custom_stages.length > 0
        ? job.custom_stages[0]
        : db.PIPELINE_STAGES[0];
    const application = db.createApplication({
      job_id,
      candidate_id: candidate.id,
      stage: firstStage,
      source: 'Careers Site'
    });

    // 3. Trigger Automation Engine!
    // This runs asynchronously in the background so we don't block the UI response
    processNewApplication(db, application.id).catch(err => {
      console.error('Error processing automation for new application:', err);
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
