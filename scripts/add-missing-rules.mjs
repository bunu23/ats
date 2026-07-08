import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding missing automation rules...');

  const missingRules = [
    {
      name: 'Stale Application Sweeper',
      description: 'Automatically reject applications that sit in a stage for more than 14 days.',
      trigger_type: 'time_based',
      trigger_config: JSON.stringify({ days_stale: 14 }),
      action_type: 'auto_reject',
      action_config: JSON.stringify({ reason: 'Stale' }),
      enabled: true
    },
    {
      name: 'Auto-Reject Incomplete',
      description: 'Auto-reject applications missing required fields after 3 days.',
      trigger_type: 'time_based',
      trigger_config: JSON.stringify({ days_pending: 3, condition: 'incomplete' }),
      action_type: 'auto_reject',
      action_config: JSON.stringify({ reason: 'Incomplete application' }),
      enabled: false
    },
    {
      name: 'Offer Expiration Reminder',
      description: 'Dispatch a gentle reminder email 48 hours before an offer expires.',
      trigger_type: 'time_based',
      trigger_config: JSON.stringify({ stage: 'Offer', hours_before_expiration: 48 }),
      action_type: 'send_email',
      action_config: JSON.stringify({ template: 'offer_reminder' }),
      enabled: true
    },
    {
      name: 'Job Auto-Close',
      description:
        'Close job posting when a candidate is hired and notify remaining active candidates.',
      trigger_type: 'stage_change',
      trigger_config: JSON.stringify({ to_stage: 'Hired' }),
      action_type: 'close_job',
      action_config: JSON.stringify({ notify_others: true }),
      enabled: true
    }
  ];

  for (const rule of missingRules) {
    await prisma.automationRule.create({
      data: {
        id: randomUUID(),
        ...rule
      }
    });
  }

  console.log('Missing rules added successfully!');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
