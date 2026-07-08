const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DB_PATH = path.join(process.cwd(), 'data', 'ats-data.json');

async function migrate() {
  console.log('Starting migration from JSON to SQLite...');

  if (!fs.existsSync(DB_PATH)) {
    console.error('JSON database not found at', DB_PATH);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

  // Users
  for (const user of data.users || []) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        password: user.password,
        name: user.name,
        role: user.role
      }
    });
  }
  console.log(`Migrated ${data.users?.length || 0} users.`);

  // Jobs
  for (const job of data.jobs || []) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type || 'Full-time',
        description: job.description || '',
        requirements: job.requirements || '',
        salary_range: job.salary_range,
        status: job.status,
        custom_stages: JSON.stringify(job.custom_stages || []),
        slas: JSON.stringify(job.slas || {}),
        expires_at: job.expires_at ? new Date(job.expires_at) : null,
        closed_at: job.closed_at ? new Date(job.closed_at) : null,
        created_at: new Date(job.created_at),
        updated_at: new Date(job.updated_at)
      }
    });
  }
  console.log(`Migrated ${data.jobs?.length || 0} jobs.`);

  // Candidates
  for (const candidate of data.candidates || []) {
    await prisma.candidate.upsert({
      where: { email: candidate.email },
      update: {},
      create: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        resume_text: candidate.resume_text,
        skills: candidate.skills,
        experience_years: candidate.experience_years,
        education: candidate.education,
        notes: candidate.notes,
        created_at: new Date(candidate.created_at),
        updated_at: new Date(candidate.updated_at)
      }
    });
  }
  console.log(`Migrated ${data.candidates?.length || 0} candidates.`);

  // Applications
  for (const app of data.applications || []) {
    await prisma.application.upsert({
      where: { id: app.id },
      update: {},
      create: {
        id: app.id,
        job_id: app.job_id,
        candidate_id: app.candidate_id,
        stage: app.stage,
        stage_entered_at: new Date(app.stage_entered_at || app.updated_at),
        priority: app.priority || 'Normal',
        withdrawn: app.withdrawn || false,
        interview_date: app.interview_date ? new Date(app.interview_date) : null,
        ai_score: app.ai_score,
        ai_evaluation: app.ai_evaluation,
        notes: app.notes,
        created_at: new Date(app.created_at),
        updated_at: new Date(app.updated_at)
      }
    });
  }
  console.log(`Migrated ${data.applications?.length || 0} applications.`);

  // Settings
  if (data.recruiter_settings || data.email_templates) {
    const defaultSettingsId = 'default-settings';
    await prisma.settings.upsert({
      where: { id: defaultSettingsId },
      update: {},
      create: {
        id: defaultSettingsId,
        email_templates: JSON.stringify(data.email_templates || {}),
        recruiter_settings: JSON.stringify(data.recruiter_settings || {})
      }
    });
    console.log('Migrated settings.');
  }

  // Automation Rules
  for (const rule of data.automation_rules || []) {
    await prisma.automationRule.upsert({
      where: { id: rule.id },
      update: {},
      create: {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        trigger_type: rule.trigger_type,
        trigger_config:
          typeof rule.trigger_config === 'string'
            ? rule.trigger_config
            : JSON.stringify(rule.trigger_config),
        action_type: rule.action_type,
        action_config:
          typeof rule.action_config === 'string'
            ? rule.action_config
            : JSON.stringify(rule.action_config),
        enabled: rule.enabled,
        created_at: rule.created_at ? new Date(rule.created_at) : new Date(),
        updated_at: rule.updated_at ? new Date(rule.updated_at) : new Date()
      }
    });
  }
  console.log(`Migrated ${data.automation_rules?.length || 0} automation rules.`);

  console.log('Migration complete!');
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
