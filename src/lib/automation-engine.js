import { generateFollowUpEmail, scoreCandidate } from './ai-service.js';

/**
 * Automation Engine
 *
 * Processes events (stage changes, new applications) and triggers
 * automated actions based on configured rules.
 */

// Simple template parser
function parseTemplate(templateString, vars) {
  if (!templateString) return '';
  return templateString.replace(/\{\{(.*?)\}\}/g, (match, key) => vars[key.trim()] || '');
}

export async function processStageChange(db, applicationId, fromStage, toStage) {
  const application = db.getApplicationById(applicationId);
  if (!application) return;

  const job = db.getJobById(application.job_id);
  const settings = db.getSettings();

  if (job.status === 'Closed') {
    return [{ action: 'blocked', reason: 'job_closed' }];
  }

  const results = [];

  const templateVars = {
    candidate_name: application.candidate_name,
    job_title: application.job_title,
    candidate_email: application.candidate_email,
    calendly_link: settings.recruiter_settings?.calendly_link || ''
  };

  const toStageLower = toStage.toLowerCase();

  // --- HARDCODED GUARDRAILS ---

  // PHASE 5: The Offer Stage Guardrail
  if (toStageLower === 'offer') {
    db.addActivityLog({
      type: 'notification',
      title: `Action Required: Draft Offer for ${application.candidate_name}`,
      description: `Candidate moved to Offer stage. The AI will NEVER autonomously email an official job offer. Please manually click 'Approve & Send Offer Letter' when ready.`,
      metadata: { stage: toStage, automated: false },
      application_id: applicationId,
      job_id: application.job_id,
      candidate_id: application.candidate_id
    });
    results.push({ action: 'offer_blocked', message: 'Manual action required' });
  }

  // Late-Stage Rejection Guardrail
  else if (toStageLower === 'rejected' || toStageLower === 'archived') {
    // Clear any pending delayed rejections or tasks
    db.removeDelayedTasksByApplication(applicationId);

    const isLateStage = job.custom_stages.indexOf(fromStage) > job.custom_stages.length / 2;
    if (isLateStage) {
      db.addActivityLog({
        type: 'notification',
        title: `Action Required: Final-Round Rejection (${application.candidate_name})`,
        description: `Candidate made it to late stages (${fromStage}). The AI should never auto-reject them. Please call or send a personalized email to ${application.candidate_name}.`,
        metadata: { stage: toStage, automated: false },
        application_id: applicationId,
        job_id: application.job_id,
        candidate_id: application.candidate_id
      });
      results.push({
        action: 'rejection_blocked',
        message: 'Manual action required for late stage'
      });
    }
  }

  // --- DYNAMIC RULES EVALUATION ---

  const rules = db.getAutomationRules().filter(r => r.enabled);

  for (const rule of rules) {
    if (
      rule.trigger_type === 'stage_change' &&
      rule.trigger_config?.to_stage?.toLowerCase() === toStageLower
    ) {
      // Prevent dynamic polite archive if late-stage rejection guardrail triggered
      if (toStageLower === 'rejected' && results.some(r => r.action === 'rejection_blocked')) {
        continue;
      }

      if (rule.action_type === 'send_email') {
        const templateKey = rule.action_config?.template_key;
        const tpl = settings.email_templates[templateKey];
        if (tpl) {
          db.addActivityLog({
            type: 'email_sent',
            title: parseTemplate(tpl.subject, templateVars),
            description: parseTemplate(tpl.body, templateVars),
            metadata: { to: application.candidate_email, automated: true, rule_id: rule.id },
            application_id: applicationId,
            job_id: application.job_id,
            candidate_id: application.candidate_id
          });
          results.push({ action: `${templateKey}_sent`, rule_id: rule.id });
        }
      } else if (rule.action_type === 'close_job') {
        db.updateJob(job.id, { status: 'Closed', closed_at: new Date().toISOString() });
        db.addActivityLog({
          type: 'notification',
          title: `Job Closed: ${job.title}`,
          description: `Job automatically closed because ${application.candidate_name} was hired.`,
          job_id: job.id
        });
        results.push({
          action: 'job_closed',
          candidate: application.candidate_name,
          rule_id: rule.id
        });
      }
    }
  }

  // Log the stage change and stage history
  db.addActivityLog({
    type: 'stage_change',
    title: `Stage Change: ${application.candidate_name}`,
    description: `${application.candidate_name}'s application for ${application.job_title} moved from ${fromStage || 'New'} to ${toStage}`,
    metadata: { fromStage, toStage },
    application_id: applicationId,
    job_id: application.job_id,
    candidate_id: application.candidate_id
  });

  db.addStageHistory({
    application_id: applicationId,
    from_stage: fromStage,
    to_stage: toStage,
    changed_by: 'system_or_recruiter'
  });

  return results;
}

export async function processNewApplication(db, applicationId) {
  const application = db.getApplicationById(applicationId);
  if (!application) return;

  const job = db.getJobById(application.job_id);
  const settings = db.getSettings();

  // Log the application creation in stage history
  db.addStageHistory({
    application_id: applicationId,
    to_stage: application.stage,
    changed_by: 'system',
    notes: 'Application created'
  });

  if (job.status === 'Closed') {
    db.updateApplicationStage(application.id, 'Rejected', 'system', 'Job is closed');
    return [{ action: 'auto_rejected', reason: 'job_closed' }];
  }

  const rules = db.getAutomationRules();
  const results = [];

  const templateVars = {
    candidate_name: application.candidate_name,
    job_title: application.job_title,
    candidate_email: application.candidate_email,
    calendly_link: settings.recruiter_settings?.calendly_link || ''
  };

  // PHASE 1: Instant Confirmation
  const tpl = settings.email_templates.instant_confirmation;
  db.addActivityLog({
    type: 'email_sent',
    title: parseTemplate(tpl.subject, templateVars),
    description: parseTemplate(tpl.body, templateVars),
    metadata: { to: application.candidate_email, stage: 'Applied', automated: true },
    application_id: applicationId,
    job_id: application.job_id,
    candidate_id: application.candidate_id
  });
  results.push({ action: 'instant_confirmation_sent', email: application.candidate_email });

  // Auto-score the candidate
  try {
    const score = await scoreCandidate(application, application);
    db.updateApplicationScore(applicationId, score.overallScore, JSON.stringify(score));

    db.addActivityLog({
      type: 'ai_scoring',
      title: `AI Score: ${application.candidate_name} — ${score.overallScore}/10`,
      description: score.recommendation,
      metadata: { score, automated: true },
      application_id: applicationId,
      job_id: application.job_id,
      candidate_id: application.candidate_id
    });

    results.push({ action: 'auto_scored', score: score.overallScore });

    // PHASE 1: Fast-Track Screening Match
    if (score.overallScore >= 9) {
      // 90%
      db.updateApplicationData(applicationId, { priority: 'High' });
      const nextStage = job.custom_stages.includes('AI Screening') ? 'AI Screening' : 'Interview';
      db.updateApplicationStage(
        applicationId,
        nextStage,
        'system',
        'Fast-Track: Exceptionally high match score'
      );

      // Since updateApplicationStage no longer fires automation, we call processStageChange here
      processStageChange(db, applicationId, application.stage, nextStage).catch(console.error);
    }
    // PHASE 1: Delayed Rejection (The 5-Minute Rejection guard)
    else if (score.overallScore <= 6) {
      // 60%
      const executeAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours later

      db.addDelayedTask({
        type: 'delayed_rejection',
        execute_at: executeAt,
        payload: {
          applicationId: applicationId,
          candidateName: application.candidate_name,
          jobTitle: application.job_title,
          email: application.candidate_email,
          job_id: application.job_id,
          candidate_id: application.candidate_id
        }
      });

      db.addActivityLog({
        type: 'notification',
        title: `Delayed Rejection Queued: ${application.candidate_name}`,
        description: `Candidate scored low (${score.overallScore}/10). To maintain human empathy, their rejection email has been queued to send in 48 hours instead of instantly.`,
        metadata: { automated: true, execute_at: executeAt },
        application_id: applicationId,
        job_id: application.job_id,
        candidate_id: application.candidate_id
      });
      results.push({ action: 'delayed_rejection_queued' });
    }
  } catch (error) {
    console.error('Auto-scoring failed:', error);
  }

  // Log the new application activity
  db.addActivityLog({
    type: 'new_application',
    title: `New Application: ${application.candidate_name}`,
    description: `${application.candidate_name} applied for ${application.job_title}`,
    metadata: { stage: 'Applied' },
    application_id: applicationId,
    job_id: application.job_id,
    candidate_id: application.candidate_id
  });

  return results;
}

export function scheduleInterviewReminders(db, application, interviewDateStr) {
  // Clear any existing reminders for this application
  db.removeDelayedTasksByApplication(application.id, 'candidate_reminder_24h');
  db.removeDelayedTasksByApplication(application.id, 'candidate_reminder_12h');
  db.removeDelayedTasksByApplication(application.id, 'recruiter_reminder_24h');

  if (!interviewDateStr) return;

  const interviewDate = new Date(interviewDateStr);
  if (isNaN(interviewDate.getTime())) return;

  const now = new Date();

  // Schedule Candidate 24h Reminder
  const cand24h = new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000);
  if (cand24h > now) {
    db.addDelayedTask({
      type: 'candidate_reminder_24h',
      execute_at: cand24h.toISOString(),
      payload: {
        applicationId: application.id,
        candidateName: application.candidate_name,
        jobTitle: application.job_title,
        email: application.candidate_email,
        job_id: application.job_id,
        candidate_id: application.candidate_id,
        interviewTime: interviewDate.toLocaleString()
      }
    });
  }

  // Schedule Candidate 12h Reminder
  const cand12h = new Date(interviewDate.getTime() - 12 * 60 * 60 * 1000);
  if (cand12h > now) {
    db.addDelayedTask({
      type: 'candidate_reminder_12h',
      execute_at: cand12h.toISOString(),
      payload: {
        applicationId: application.id,
        candidateName: application.candidate_name,
        jobTitle: application.job_title,
        email: application.candidate_email,
        job_id: application.job_id,
        candidate_id: application.candidate_id,
        interviewTime: interviewDate.toLocaleString()
      }
    });
  }

  // Schedule Recruiter 24h Reminder
  const rec24h = new Date(interviewDate.getTime() - 24 * 60 * 60 * 1000);
  if (rec24h > now) {
    db.addDelayedTask({
      type: 'recruiter_reminder_24h',
      execute_at: rec24h.toISOString(),
      payload: {
        applicationId: application.id,
        candidateName: application.candidate_name,
        jobTitle: application.job_title,
        email: application.candidate_email,
        job_id: application.job_id,
        candidate_id: application.candidate_id,
        interviewTime: interviewDate.toLocaleString()
      }
    });
  }
}
