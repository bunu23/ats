import { NextResponse } from 'next/server';
import { scoreCandidate } from '../../../../lib/ai-service.js';
import { getApplicationById, updateApplicationScore, addActivityLog } from '../../../../lib/db.js';

export async function POST(request) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'applicationId is required' },
        { status: 400 }
      );
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const score = await scoreCandidate(application, application);

    // Save the score
    const updatedApplication = await updateApplicationScore(
      applicationId,
      score.overallScore,
      JSON.stringify(score)
    );

    // Log the manual scoring action
    await addActivityLog({
      type: 'ai_scoring',
      title: `Manual AI Score: ${application.candidate_name} — ${score.overallScore}/100`,
      description: score.recommendation,
      metadata: { score, automated: false },
      application_id: applicationId,
      job_id: application.job_id,
      candidate_id: application.candidate_id
    });

    return NextResponse.json({
      success: true,
      data: { application: updatedApplication, evaluation: score }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
