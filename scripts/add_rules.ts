import { createAutomationRule } from '../src/lib/db.js';

async function seedRules() {
  console.log('Adding new system guardrail rules...');
  
  const rules = [
    {
      name: 'Stale Application Sweeper',
      description: 'Auto-reject applications that stagnate in a pipeline stage for too long without an update.',
      trigger_type: 'time_in_stage',
      action_type: 'system_stale_sweeper',
      enabled: true
    },
    {
      name: 'SLA Breach Escalations',
      description: 'Automatically escalate candidate priority to High or Urgent if SLA is breached.',
      trigger_type: 'sla_breach',
      action_type: 'system_sla_escalation',
      enabled: true
    },
    {
      name: 'Interview Reminders',
      description: 'Queue 24-hour and 1-hour reminders for candidates, and 24-hour recruiter notifications.',
      trigger_type: 'interview_scheduled',
      action_type: 'system_interview_reminders',
      enabled: true
    },
    {
      name: 'Post-Interview Thank You',
      description: 'Send a personalized note thanking the candidate a few hours after their interview.',
      trigger_type: 'time_after_interview',
      action_type: 'system_post_interview_thanks',
      enabled: true
    },
    {
      name: 'Offer Expiration Reminders',
      description: 'Dispatch a gentle nudge 48 hours before an offer expires.',
      trigger_type: 'offer_expiring',
      action_type: 'system_offer_reminders',
      enabled: true
    },
    {
      name: 'Delayed Rejections Guardrail',
      description: 'Enforce a 48-hour delay on automated and manual rejections before emailing the candidate.',
      trigger_type: 'manual_rejection',
      action_type: 'system_delayed_rejection',
      enabled: true
    }
  ];

  for (const rule of rules) {
    try {
      await createAutomationRule(rule);
      console.log(`Added rule: ${rule.name}`);
    } catch (e) {
      console.error(`Error adding rule ${rule.name}:`, e);
    }
  }

  console.log('Done!');
  process.exit(0);
}

seedRules();
