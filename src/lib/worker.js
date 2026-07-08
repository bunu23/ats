import { getAndClearPendingTasks, getSettings, addActivityLog } from './db.js';

// Simple template parser
function parseTemplate(templateString, vars) {
  if (!templateString) return '';
  return templateString.replace(/\{\{(.*?)\}\}/g, (match, key) => vars[key.trim()] || '');
}

/**
 * Background Worker
 * Runs every 60 seconds to check for pending delayed tasks (e.g. reminders, delayed rejections)
 */
function startWorker() {
  setInterval(() => {
    const pendingTasks = getAndClearPendingTasks();
    if (pendingTasks.length > 0) {
      console.log(`[Worker] Processing ${pendingTasks.length} pending tasks...`);
      processTasks(pendingTasks);
    }
  }, 60 * 1000); // Check every minute
}

function processTasks(tasks) {
  const settings = getSettings();
  const recruiterEmail = 'admin@ats.com'; // Default recruiter for this system

  tasks.forEach(task => {
    const { payload } = task;
    const templateVars = {
      candidate_name: payload.candidateName,
      job_title: payload.jobTitle,
      candidate_email: payload.email,
      interview_time: payload.interviewTime, // E.g., "Oct 15 at 2:00 PM"
      calendly_link: settings.recruiter_settings?.calendly_link || ''
    };

    if (task.type === 'delayed_rejection') {
      const tpl = settings.email_templates.delayed_rejection;
      addActivityLog({
        type: 'email_sent',
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { to: payload.email, automated: true },
        application_id: payload.applicationId,
        job_id: payload.job_id,
        candidate_id: payload.candidate_id
      });
    } else if (task.type === 'candidate_reminder_24h') {
      const tpl = settings.email_templates.candidate_reminder_24h;
      addActivityLog({
        type: 'email_sent',
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { to: payload.email, automated: true },
        application_id: payload.applicationId,
        job_id: payload.job_id,
        candidate_id: payload.candidate_id
      });
    } else if (task.type === 'candidate_reminder_12h') {
      const tpl = settings.email_templates.candidate_reminder_12h;
      addActivityLog({
        type: 'email_sent',
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { to: payload.email, automated: true },
        application_id: payload.applicationId,
        job_id: payload.job_id,
        candidate_id: payload.candidate_id
      });
    } else if (task.type === 'recruiter_reminder_24h') {
      const tpl = settings.email_templates.recruiter_reminder_24h;
      addActivityLog({
        type: 'notification', // It's an internal notification to the recruiter
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { to: recruiterEmail, automated: true },
        application_id: payload.applicationId,
        job_id: payload.job_id,
        candidate_id: payload.candidate_id
      });
    }
  });
}

// Ensure the worker only starts once if hot-reloaded
if (!global.__workerStarted) {
  startWorker();
  global.__workerStarted = true;
  console.log('[Worker] Background task processor started.');
}
