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
  setInterval(async () => {
    const pendingTasks = await getAndClearPendingTasks();
    if (pendingTasks.length > 0) {
      console.log(`[Worker] Processing ${pendingTasks.length} pending tasks...`);
      await processTasks(pendingTasks);
    }
  }, 60 * 1000); // Check every minute
}

async function processTasks(tasks) {
  const settings = await getSettings();
  const recruiterEmail = 'admin@ats.com'; // Default recruiter for this system

  for (const task of tasks) {
    const p = task.payload || {};
    const templateVars = {
      candidate_name: p.candidateName || p.candidate_name,
      job_title: p.jobTitle || p.job_title,
      candidate_email: p.email || p.candidate_email,
      interview_time: p.interviewTime || p.interview_time
    };

    if (task.type === 'delayed_rejection') {
      const tpl = settings.email_templates.delayed_rejection;
      await addActivityLog({
        type: 'email_sent',
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { to: p.email, automated: true },
        application_id: p.applicationId,
        job_id: p.job_id,
        candidate_id: p.candidate_id
      });
    } else if (task.type === 'candidate_reminder_24h') {
      const tpl = settings.email_templates.candidate_reminder_24h;
      await addActivityLog({
        type: 'email_sent',
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { to: p.email, automated: true },
        application_id: p.applicationId,
        job_id: p.job_id,
        candidate_id: p.candidate_id
      });
    } else if (task.type === 'candidate_reminder_12h') {
      const tpl = settings.email_templates.candidate_reminder_12h;
      await addActivityLog({
        type: 'email_sent',
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { to: p.email, automated: true },
        application_id: p.applicationId,
        job_id: p.job_id,
        candidate_id: p.candidate_id
      });
    } else if (task.type === 'recruiter_reminder_24h') {
      const tpl = settings.email_templates.recruiter_reminder_24h;
      await addActivityLog({
        type: 'notification', // It's an internal notification to the recruiter
        title: parseTemplate(tpl.subject, templateVars),
        description: parseTemplate(tpl.body, templateVars),
        metadata: { automated: true },
        application_id: p.applicationId,
        job_id: p.job_id,
        candidate_id: p.candidate_id
      });
    }
  }
}

// Ensure the worker only starts once if hot-reloaded
if (!global.__workerStarted) {
  startWorker();
  global.__workerStarted = true;
  console.log('[Worker] Background task processor started.');
}
