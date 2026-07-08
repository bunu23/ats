import {
  getAllApplications,
  getJobById,
  updateApplicationData,
  updateApplicationStage,
  addActivityLog,
  getAndClearPendingTasks,
  removeDelayedTasksByApplication,
  getSettings
} from './src/lib/db.js';

console.log('Background worker started. Monitoring SLAs, delayed tasks, and time-based rules...');

async function sendCourteousRejection(app, reason) {
  await updateApplicationStage(app.id, 'Rejected', 'system', reason);
  await addActivityLog({
    type: 'stage_change',
    title: `Auto-Rejected (Stale): ${app.candidate_name}`,
    description: `Candidate automatically rejected: ${reason}`,
    application_id: app.id,
    job_id: app.job_id,
    candidate_id: app.candidate_id
  });
  await addActivityLog({
    type: 'email_sent',
    title: `Application Update: ${app.job_title}`,
    description: `Dear ${app.candidate_name},\n\nThank you for your time and patience during our process. After careful consideration, we have decided to move forward with other candidates whose profiles more closely align with our current needs for the ${app.job_title} position.\n\nWe appreciate the time you took to speak with our team and wish you the absolute best in your career search.`,
    metadata: { to: app.candidate_email, automated: true },
    application_id: app.id,
    job_id: app.job_id,
    candidate_id: app.candidate_id
  });
}

setInterval(async () => {
  const now = new Date();
  console.log(`[${now.toISOString()}] Running periodic checks...`);

  // 1. Process Delayed Tasks (Phase 1 Delayed Rejections, etc)
  const pendingTasks = await getAndClearPendingTasks();
  for (const task of pendingTasks) {
    if (task.type === 'delayed_rejection') {
      const p = task.payload;

      // Ensure application wasn't moved or already rejected in the meantime
      const apps = await getAllApplications();
      const currentApp = apps.find(a => a.id === p.applicationId);

      if (currentApp && currentApp.stage !== 'Rejected' && currentApp.stage !== 'Archived') {
        await updateApplicationStage(
          p.applicationId,
          'Rejected',
          'system',
          'Delayed rejection executed (48h)'
        );
        await addActivityLog({
          type: 'email_sent',
          title: `Delayed Rejection Sent: ${p.candidateName}`,
          description: `Dear ${p.candidateName}, thank you for your patience. After reviewing your application, we have decided to proceed with other candidates whose profiles more closely match our current needs for the ${p.jobTitle} position.`,
          metadata: { to: p.email, automated: true },
          application_id: p.applicationId,
          job_id: p.job_id,
          candidate_id: p.candidate_id
        });
      }
    }
    // Phase 3: Post-Interview Note
    else if (task.type === 'post_interview_note') {
      const p = task.payload;
      await addActivityLog({
        type: 'email_sent',
        title: `Post-Interview Thank You: ${p.candidateName}`,
        description: `Dear ${p.candidateName}, thank you for your time today! Our team really enjoyed speaking with you. We are currently consolidating our reviews and will be in touch with next steps shortly.`,
        metadata: { to: p.email, automated: true },
        application_id: p.applicationId,
        job_id: p.job_id,
        candidate_id: p.candidate_id
      });
    }
  }

  // 2. Process SLAs and Time-Based Application Rules
  const applications = await getAllApplications();
  const settings = await getSettings();

  const autoRejectApplied = settings.recruiter_settings?.autoRejectApplied || 14;
  const autoRejectScreening = settings.recruiter_settings?.autoRejectScreening || 5;
  const autoRejectInterview = settings.recruiter_settings?.autoRejectInterview || 14;

  for (const app of applications) {
    if (app.stage === 'Hired' || app.stage === 'Rejected' || app.withdrawn) {
      continue; // Skip closed or withdrawn applications
    }

    const job = await getJobById(app.job_id);
    if (!job || job.status === 'Closed') continue;

    const enteredAt = new Date(app.stage_entered_at);
    const daysInStage = (now - enteredAt) / (1000 * 60 * 60 * 24);

    // Check SLA
    const slaLimit = job.slas?.[app.stage];
    if (slaLimit && daysInStage > slaLimit) {
      // SLA Breach Logic
      if (daysInStage > slaLimit + 2) {
        if (app.priority !== 'Urgent') {
          await updateApplicationData(app.id, { priority: 'Urgent' });
          await addActivityLog({
            type: 'notification',
            title: `SLA BREACH ESCALATED: ${app.candidate_name}`,
            description: `Application has been stuck in ${app.stage} for over ${Math.floor(daysInStage)} days. HR has been notified.`,
            application_id: app.id,
            job_id: app.job_id,
            candidate_id: app.candidate_id
          });
        }
      } else if (daysInStage > slaLimit + 1) {
        if (app.priority !== 'High') {
          await updateApplicationData(app.id, { priority: 'High' });
          await addActivityLog({
            type: 'notification',
            title: `SLA WARNING: ${app.candidate_name}`,
            description: `Application exceeds SLA by over 1 day in ${app.stage}. Hiring manager notified.`,
            application_id: app.id,
            job_id: app.job_id,
            candidate_id: app.candidate_id
          });
        }
      } else if (!app.sla_notified) {
        await updateApplicationData(app.id, { sla_notified: true });
        await addActivityLog({
          type: 'notification',
          title: `SLA Breached: ${app.candidate_name}`,
          description: `Application exceeded the ${slaLimit}-day SLA for ${app.stage}.`,
          application_id: app.id,
          job_id: app.job_id,
          candidate_id: app.candidate_id
        });
      }
    }

    // 1. Auto-Reject Applied
    if (app.stage === 'Applied' && daysInStage > autoRejectApplied) {
      await sendCourteousRejection(
        app,
        `Stagnated in Applied stage for > ${autoRejectApplied} days.`
      );
    }

    // 2. Auto-Reject Screening
    if (app.stage === 'Screening' && daysInStage > autoRejectScreening) {
      await sendCourteousRejection(
        app,
        `Stagnated in Screening stage for > ${autoRejectScreening} days.`
      );
    }

    // 3. Auto-Reject Interview (The "Stale Sweeper")
    if (app.stage === 'Interview' && daysInStage > autoRejectInterview) {
      await sendCourteousRejection(
        app,
        `Stagnated in Interview loop for > ${autoRejectInterview} days without an update.`
      );
    }

    // Phase 5: Offer Expiration Reminder (Gentle nudge 48 hours before expiration)
    if (app.stage === 'Offer' && !app.offer_reminder_sent) {
      const offerSla = slaLimit || 5; // Default 5 days expiration
      if (daysInStage >= offerSla - 2 && daysInStage > 0) {
        await updateApplicationData(app.id, { offer_reminder_sent: true });
        await addActivityLog({
          type: 'email_sent',
          title: `Offer Expiration Reminder: ${app.candidate_name}`,
          description: `Dear ${app.candidate_name},\n\nWe are so excited about the prospect of you joining us! This is a gentle reminder that your offer for the ${app.job_title} role will expire in approximately 48 hours. Please don't hesitate to reach out if you have any final questions or need to schedule a quick chat.\n\nBest,\nThe Hiring Team`,
          metadata: { to: app.candidate_email, automated: true },
          application_id: app.id,
          job_id: app.job_id,
          candidate_id: app.candidate_id
        });
      }
    }

    // Phase 2 & 3: Interview Reminders & Post-Interview Feedback
    if (app.stage === 'Interview' && app.interview_date) {
      const interviewDate = new Date(app.interview_date);
      // Hours from NOW until the interview (- means in the past)
      const hoursUntil = (interviewDate - now) / (1000 * 60 * 60);

      // PHASE 2: The "24-Hour Reminder" with prep tips
      if (hoursUntil > 0 && hoursUntil <= 24 && !app.reminded_24h) {
        await updateApplicationData(app.id, { reminded_24h: true });
        await addActivityLog({
          type: 'email_sent',
          title: `Interview Reminder (24h): ${app.candidate_name}`,
          description: `Dear ${app.candidate_name}, friendly reminder that your interview is tomorrow! Preparation tip: Make sure to review our recent product launch. Tech-check link: meet.google.com/test. We look forward to seeing you.`,
          metadata: { to: app.candidate_email, automated: true },
          application_id: app.id,
          job_id: app.job_id,
          candidate_id: app.candidate_id
        });
      }
      // 1-Hour Reminder
      else if (hoursUntil > 0 && hoursUntil <= 1 && !app.reminded_1h) {
        await updateApplicationData(app.id, { reminded_1h: true });
        await addActivityLog({
          type: 'email_sent',
          title: `Interview Reminder (1h): ${app.candidate_name}`,
          description: `Your interview starts in 1 hour. Get ready!`,
          metadata: { to: app.candidate_email, automated: true },
          application_id: app.id,
          job_id: app.job_id,
          candidate_id: app.candidate_id
        });
      }

      // PHASE 3: The "Thank You for Your Time" Note (2 hours after interview)
      // Assuming interview lasts 1 hour, so 3 hours after start time we send a note.
      else if (hoursUntil < -3 && !app.post_interview_thank_you_sent) {
        await updateApplicationData(app.id, { post_interview_thank_you_sent: true });
        // Instead of queueing, we can just execute it immediately since we are in the worker loop and the time has passed.
        await addActivityLog({
          type: 'email_sent',
          title: `Post-Interview Thank You: ${app.candidate_name}`,
          description: `Dear ${app.candidate_name}, thank you for your time today! Our team really enjoyed speaking with you. We are currently consolidating our reviews and will be in touch with next steps shortly.`,
          metadata: { to: app.candidate_email, automated: true },
          application_id: app.id,
          job_id: app.job_id,
          candidate_id: app.candidate_id
        });
      }
    }
  }
}, 60000); // Run every 60 seconds for demo purposes
