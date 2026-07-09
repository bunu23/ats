import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export const PIPELINE_STAGES = [
  'Applied',
  'AI Screening',
  'Phone Screening',
  'Interview',
  'Offer',
  'Background Check',
  'Hired',
  'Rejected'
];

export function generateId() {
  return randomUUID();
}

// --- Jobs ---
export async function getAllJobs(status) {
  const where = status ? { status } : {};
  const jobs = await prisma.job.findMany({
    where,
    orderBy: { created_at: 'desc' }
  });
  return jobs.map(j => ({
    ...j,
    custom_stages: JSON.parse(j.custom_stages),
    slas: JSON.parse(j.slas)
  }));
}

export async function getJobById(id) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return null;
  return {
    ...job,
    custom_stages: JSON.parse(job.custom_stages),
    slas: JSON.parse(job.slas)
  };
}

export async function createJob(data) {
  const job = await prisma.job.create({
    data: {
      id: data.id || generateId(),
      title: data.title,
      department: data.department,
      location: data.location,
      type: data.type || 'Full-time',
      description: data.description || '',
      requirements: data.requirements || '',
      salary_range: data.salary_range || null,
      status: data.status || 'Open',
      custom_stages: JSON.stringify(PIPELINE_STAGES),
      slas: JSON.stringify(data.slas || { Applied: 14, Screening: 3, Interview: 7, Offer: 5 }),
      expires_at: data.expires_at ? new Date(data.expires_at) : null
    }
  });
  return await getJobById(job.id);
}

export async function updateJob(id, fields) {
  const updateData = { ...fields };
  if (updateData.custom_stages) updateData.custom_stages = JSON.stringify(updateData.custom_stages);
  if (updateData.slas) updateData.slas = JSON.stringify(updateData.slas);
  await prisma.job.update({ where: { id }, data: updateData });
  return await getJobById(id);
}

export async function deleteJob(id) {
  await prisma.job.delete({ where: { id } });
}

// --- Candidates ---
export async function getAllCandidates() {
  return await prisma.candidate.findMany({ orderBy: { created_at: 'desc' } });
}

export async function getCandidateById(id) {
  return await prisma.candidate.findUnique({ where: { id } });
}

export async function getCandidateByEmail(email) {
  return await prisma.candidate.findUnique({ where: { email } });
}

export async function createCandidate(data) {
  return await prisma.candidate.create({
    data: {
      id: data.id || generateId(),
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      resume_text: data.resume_text || null,
      skills: data.skills || null,
      experience_years: data.experience_years || 0,
      education: data.education || null,
      notes: data.notes || null
    }
  });
}

export async function updateCandidate(id, fields) {
  return await prisma.candidate.update({ where: { id }, data: fields });
}

export async function deleteCandidate(id) {
  // 1. Get all applications for this candidate
  const apps = await prisma.application.findMany({ where: { candidate_id: id } });
  const appIds = apps.map(a => a.id);

  if (appIds.length > 0) {
    // 2. Delete related records for these applications
    await prisma.stageHistory.deleteMany({ where: { application_id: { in: appIds } } });
    await prisma.activityLog.deleteMany({ where: { application_id: { in: appIds } } });

    // Clean up delayed tasks associated with these applications
    const tasks = await prisma.delayedTask.findMany();
    const tasksToDelete = tasks.filter(t => {
      try {
        const payload = JSON.parse(t.payload);
        return payload && appIds.includes(payload.applicationId);
      } catch (e) {
        return false;
      }
    });
    if (tasksToDelete.length > 0) {
      await prisma.delayedTask.deleteMany({
        where: { id: { in: tasksToDelete.map(t => t.id) } }
      });
    }

    // 3. Delete the applications
    await prisma.application.deleteMany({ where: { candidate_id: id } });
  }

  // 4. Delete activity logs specifically tied to this candidate
  await prisma.activityLog.deleteMany({ where: { candidate_id: id } });

  // 5. Delete the candidate
  await prisma.candidate.delete({ where: { id } });
}

// --- Applications ---
async function populateApplication(app) {
  const job = await getJobById(app.job_id);
  const candidate = await getCandidateById(app.candidate_id);
  return {
    ...app,
    job_title: job?.title,
    department: job?.department,
    job_description: job?.description,
    job_requirements: job?.requirements,
    candidate_name: candidate?.name,
    candidate_email: candidate?.email,
    candidate_skills: candidate?.skills,
    experience_years: candidate?.experience_years,
    candidate_education: candidate?.education,
    resume_text: candidate?.resume_text
  };
}

export async function getAllApplications() {
  const apps = await prisma.application.findMany({ orderBy: { updated_at: 'desc' } });
  return await Promise.all(apps.map(populateApplication));
}

export async function getApplicationById(id) {
  const app = await prisma.application.findUnique({ where: { id } });
  return app ? await populateApplication(app) : null;
}

export async function createApplication(data) {
  const app = await prisma.application.create({
    data: {
      id: data.id || generateId(),
      job_id: data.job_id,
      candidate_id: data.candidate_id,
      stage: data.stage || 'Applied',
      priority: data.priority || 'Normal',
      withdrawn: data.withdrawn || false,
      notes: data.notes || null,
      ai_score: data.ai_score !== undefined ? data.ai_score : null
    }
  });
  return await getApplicationById(app.id);
}

export async function updateApplicationStage(id, newStage, changedBy = 'recruiter', notes = null) {
  await prisma.application.update({
    where: { id },
    data: { stage: newStage, stage_entered_at: new Date() }
  });
  return await getApplicationById(id);
}

export async function updateApplicationData(id, fields) {
  await prisma.application.update({ where: { id }, data: fields });
  return await getApplicationById(id);
}

export async function updateApplicationScore(id, score, evaluation) {
  await prisma.application.update({
    where: { id },
    data: { ai_score: score, ai_evaluation: evaluation }
  });
  return await getApplicationById(id);
}

// --- History & Logs ---
export async function addStageHistory(data) {
  await prisma.stageHistory.create({
    data: {
      id: generateId(),
      application_id: data.application_id,
      from_stage: data.from_stage || null,
      to_stage: data.to_stage,
      changed_by: data.changed_by || 'system',
      notes: data.notes || null
    }
  });
}

export async function addActivityLog(data) {
  await prisma.activityLog.create({
    data: {
      id: generateId(),
      type: data.type,
      title: data.title,
      description: data.description || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      application_id: data.application_id || null,
      job_id: data.job_id || null,
      candidate_id: data.candidate_id || null
    }
  });
}

export async function getActivityLog(limit = 50) {
  return await prisma.activityLog.findMany({
    orderBy: { created_at: 'desc' },
    take: limit
  });
}

// --- Automation Rules ---
export async function getAutomationRules() {
  const rules = await prisma.automationRule.findMany({ orderBy: { created_at: 'asc' } });
  return rules.map(r => ({
    ...r,
    trigger_config: JSON.parse(r.trigger_config),
    action_config: JSON.parse(r.action_config)
  }));
}

export async function createAutomationRule(data) {
  const rule = await prisma.automationRule.create({
    data: {
      id: data.id || generateId(),
      name: data.name,
      description: data.description || null,
      trigger_type: data.trigger_type,
      trigger_config: JSON.stringify(data.trigger_config || {}),
      action_type: data.action_type,
      action_config: JSON.stringify(data.action_config || {}),
      enabled: data.enabled !== undefined ? data.enabled : true
    }
  });
  return {
    ...rule,
    trigger_config: JSON.parse(rule.trigger_config),
    action_config: JSON.parse(rule.action_config)
  };
}

export async function toggleAutomationRule(id, enabled) {
  const rule = await prisma.automationRule.update({
    where: { id },
    data: { enabled }
  });
  return {
    ...rule,
    trigger_config: JSON.parse(rule.trigger_config),
    action_config: JSON.parse(rule.action_config)
  };
}

// --- Delayed Tasks ---
export async function addDelayedTask(task) {
  return await prisma.delayedTask.create({
    data: {
      id: generateId(),
      type: task.type,
      execute_at: new Date(task.execute_at),
      payload: JSON.stringify(task.payload || {})
    }
  });
}

export async function getAndClearPendingTasks() {
  const now = new Date();
  const pending = await prisma.delayedTask.findMany({
    where: { execute_at: { lte: now } }
  });

  if (pending.length > 0) {
    await prisma.delayedTask.deleteMany({
      where: { id: { in: pending.map(t => t.id) } }
    });
  }

  return pending.map(t => ({
    ...t,
    payload: JSON.parse(t.payload)
  }));
}

export async function removeDelayedTasksByApplication(applicationId, type = null) {
  const tasks = await prisma.delayedTask.findMany();
  const toDelete = tasks.filter(t => {
    try {
      const payload = JSON.parse(t.payload);
      const matchesApp = payload && payload.applicationId === applicationId;
      if (matchesApp) {
        if (type && t.type !== type) return false;
        return true;
      }
    } catch (e) {}
    return false;
  });

  if (toDelete.length > 0) {
    await prisma.delayedTask.deleteMany({
      where: { id: { in: toDelete.map(t => t.id) } }
    });
  }
}

// --- Dashboard ---
export async function getDashboardStats() {
  const openJobs = await prisma.job.count({ where: { status: 'Open' } });
  const totalCandidates = await prisma.candidate.count();
  const activeApplications = await prisma.application.count({
    where: { stage: { notIn: ['Hired', 'Rejected'] } }
  });
  const hiredCount = await prisma.application.count({ where: { stage: 'Hired' } });

  const applications = await prisma.application.findMany({ select: { stage: true } });
  const pipelineDistribution = Object.entries(
    applications.reduce((acc, app) => {
      acc[app.stage] = (acc[app.stage] || 0) + 1;
      return acc;
    }, {})
  ).map(([stage, count]) => ({ stage, count }));

  const recentActivity = await getActivityLog(10);

  return {
    openJobs,
    totalCandidates,
    activeApplications,
    hiredCount,
    pipelineDistribution,
    recentActivity
  };
}

// --- Authentication ---
export async function getUserByCredentials(email, password) {
  return await prisma.user.findFirst({ where: { email, password } });
}

// --- Settings ---
export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: 'default-settings' } });
  if (!settings) {
    return { email_templates: {}, recruiter_settings: {} };
  }
  return {
    email_templates: JSON.parse(settings.email_templates),
    recruiter_settings: JSON.parse(settings.recruiter_settings)
  };
}

export async function updateSettings(fields) {
  let data: any = {};
  if (fields.email_templates) data.email_templates = JSON.stringify(fields.email_templates);
  if (fields.recruiter_settings)
    data.recruiter_settings = JSON.stringify(fields.recruiter_settings);

  await prisma.settings.update({
    where: { id: 'default-settings' },
    data
  });
  return await getSettings();
}
