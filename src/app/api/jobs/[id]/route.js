export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { updateJob } from '../../../../lib/db.js';

export async function PATCH(request, { params }) {
  try {
    // Next.js 16 requires awaiting params
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const data = await request.json();
    const updatedJob = updateJob(id, data);

    // Auto-migrate orphaned candidates
    if (data.custom_stages && data.custom_stages.length > 0) {
      const validStages = data.custom_stages;
      const db = require('../../../../lib/db.js');

      const jobApps = db.getAllApplications().filter(a => a.job_id === id);
      jobApps.forEach(app => {
        if (!validStages.includes(app.stage)) {
          // If the candidate's stage no longer exists, migrate them to the first valid stage
          db.updateApplicationStage(
            app.id,
            validStages[0],
            'system',
            'Stage auto-migrated due to pipeline configuration change'
          );
          db.addStageHistory({
            application_id: app.id,
            from_stage: app.stage,
            to_stage: validStages[0],
            changed_by: 'system',
            notes: 'Stage auto-migrated due to pipeline configuration change'
          });
        }
      });
    }

    if (updatedJob) {
      return NextResponse.json({ success: true, data: updatedJob });
    } else {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
