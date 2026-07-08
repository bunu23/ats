import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'ats-data.json');

export const PIPELINE_STAGES = [
  'Applied',
  'AI Screening',
  'Phone Screening',
  'Interview',
  'Background Check',
  'Offer',
  'Hired',
  'Onboarding',
  'Rejected'
];

const DEFAULT_DATA = {
  jobs: [],
  candidates: [],
  applications: [],
  stage_history: [],
  activity_log: [],
  delayed_tasks: [],
  users: [
    {
      id: 'u-1',
      email: 'admin@ats.com',
      password: 'password', // In production, this must be hashed
      name: 'Admin Recruiter',
      role: 'admin'
    }
  ],
  automation_rules: [
    {
      id: 'rule-ai-screen',
      name: 'Trigger AI Screening Invite',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'AI Screening' },
      action_type: 'send_email',
      action_config: { template_key: 'ai_screening_invite' },
      enabled: true
    },
    {
      id: 'rule-phone-screen',
      name: 'Trigger Phone Screening Invite',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'Phone Screening' },
      action_type: 'send_email',
      action_config: { template_key: 'phone_screening_invite' },
      enabled: true
    },
    {
      id: 'rule-interview',
      name: 'Trigger Interview Invite',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'Interview' },
      action_type: 'send_email',
      action_config: { template_key: 'interview_invite' },
      enabled: true
    },
    {
      id: 'rule-bg-check',
      name: 'Trigger Background Check',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'Background Check' },
      action_type: 'send_email',
      action_config: { template_key: 'background_check' },
      enabled: true
    },
    {
      id: 'rule-onboarding',
      name: 'Trigger Onboarding Welcome',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'Onboarding' },
      action_type: 'send_email',
      action_config: { template_key: 'onboarding_welcome' },
      enabled: true
    },
    {
      id: 'rule-hired-email',
      name: 'Send Hired Notice',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'Hired' },
      action_type: 'send_email',
      action_config: { template_key: 'hired_notice' },
      enabled: true
    },
    {
      id: 'rule-hired-close',
      name: 'Auto-Close Job on Hire',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'Hired' },
      action_type: 'close_job',
      action_config: {},
      enabled: true
    },
    {
      id: 'rule-polite-archive',
      name: 'Send Polite Rejection',
      trigger_type: 'stage_change',
      trigger_config: { to_stage: 'Rejected' },
      action_type: 'send_email',
      action_config: { template_key: 'polite_archive' },
      enabled: true
    }
  ],
  recruiter_settings: {
    calendly_link: ''
  },
  email_templates: {
    instant_confirmation: {
      subject: 'Application Received: {{job_title}}',
      body: "Thank you for applying for {{job_title}}! We've received your application and our team (and AI matching engine) is taking a look. You can expect an update within a few days."
    },
    ai_screening_invite: {
      subject: 'Next Step: AI Screening for {{job_title}}',
      body: "Hi {{candidate_name}},\n\nWe're excited to move you forward! As a next step, please complete our brief asynchronous AI screening. You can take this anytime at your convenience.\n\n[Link to AI Screening]"
    },
    phone_screening_invite: {
      subject: 'Schedule your Phone Screen',
      body: "Hi {{candidate_name}},\n\nWe'd love to schedule a brief phone screen to learn more about your background. Please book a time that works for you here: {{calendly_link}}"
    },
    interview_invite: {
      subject: 'Invitation to Interview: {{job_title}}',
      body: "Dear {{candidate_name}},\n\nWe'd love to learn more! Please use this dynamic scheduling link to pick a time for your next conversation: {{calendly_link}}"
    },
    background_check: {
      subject: 'Background Check Authorization',
      body: 'Hi {{candidate_name}},\n\nAs we move forward in the process, we require a standard background check. Please look out for a separate email from our background check partner with instructions.'
    },
    hired_notice: {
      subject: 'Welcome to the Team, {{candidate_name}}!',
      body: 'Hi {{candidate_name}},\n\nCongratulations again on your offer acceptance. We are absolutely thrilled to have you join us!'
    },
    onboarding_welcome: {
      subject: 'Your Onboarding Plan',
      body: 'Hi {{candidate_name}},\n\nHere is everything you need to know for your first week. Please review the attached materials and let us know if you have any questions.'
    },
    polite_archive: {
      subject: 'Update on your application for {{job_title}}',
      body: "Dear {{candidate_name}},\n\nThank you for your time. While we're impressed with your background, we've decided to move forward with other candidates. We will keep your file in our active talent pool for future openings."
    },
    delayed_rejection: {
      subject: 'Update on your application for {{job_title}}',
      body: 'Dear {{candidate_name}},\n\nThank you for applying for {{job_title}}. Unfortunately, we are not moving forward with your application at this time.'
    },
    candidate_reminder_24h: {
      subject: 'Reminder: Interview Tomorrow - {{job_title}}',
      body: 'Hi {{candidate_name}},\n\nThis is a friendly reminder that you have an interview scheduled for tomorrow at {{interview_time}}.\n\nLooking forward to speaking with you!'
    },
    candidate_reminder_12h: {
      subject: 'Reminder: Interview Today - {{job_title}}',
      body: 'Hi {{candidate_name}},\n\nThis is a reminder that your interview is coming up soon at {{interview_time}}.\n\nSee you soon!'
    },
    recruiter_reminder_24h: {
      subject: 'Action Required: Upcoming Interview with {{candidate_name}}',
      body: 'You have an interview scheduled with {{candidate_name}} for the {{job_title}} role tomorrow at {{interview_time}}.\n\nPlease ensure you review their profile and resume.'
    }
  }
};

// Initialize database in-memory
let db = {
  jobs: [],
  candidates: [],
  applications: [],
  stage_history: [],
  activity_log: [],
  automation_rules: [],
  delayed_tasks: [],
  users: [],
  recruiter_settings: {},
  email_templates: {}
};

// Load database from file
function loadDb() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      db = JSON.parse(data);
      // Migration: Ensure users exist
      if (!db.users) db.users = DEFAULT_DATA.users;
      // Migration: Ensure recruiter_settings exist
      if (!db.recruiter_settings) db.recruiter_settings = DEFAULT_DATA.recruiter_settings;
      // Migration: Ensure email_templates exist and are objects, not strings
      if (!db.email_templates || typeof db.email_templates.instant_confirmation === 'string') {
        db.email_templates = DEFAULT_DATA.email_templates;
        // Wipe custom stages from jobs to enforce new pipeline
        db.jobs.forEach(job => {
          job.custom_stages = PIPELINE_STAGES;
        });
      }
      // Migration: Ensure new templates exist
      if (!db.email_templates.candidate_reminder_24h) {
        db.email_templates.candidate_reminder_24h =
          DEFAULT_DATA.email_templates.candidate_reminder_24h;
        db.email_templates.candidate_reminder_12h =
          DEFAULT_DATA.email_templates.candidate_reminder_12h;
        db.email_templates.recruiter_reminder_24h =
          DEFAULT_DATA.email_templates.recruiter_reminder_24h;
      }
      // Migration: Convert automation_rules object to array of dynamic rules
      if (!Array.isArray(db.automation_rules) || db.automation_rules.length === 0) {
        db.automation_rules = DEFAULT_DATA.automation_rules;
        saveDb();
      }
    } else {
      db = JSON.parse(JSON.stringify(DEFAULT_DATA));
      saveDb(); // Create initial file
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
}

// Save database to file
function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Initialize on first import
loadDb();

// Start the background worker
import './worker.js';

export function generateId() {
  return randomUUID();
}

// --- Jobs ---

export function getAllJobs(status) {
  let jobs = [...db.jobs];
  if (status) {
    jobs = jobs.filter(j => j.status === status);
  }
  return jobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getJobById(id) {
  return db.jobs.find(j => j.id === id);
}

export function createJob(data) {
  const job = {
    id: data.id || generateId(),
    title: data.title,
    department: data.department,
    location: data.location,
    type: data.type || 'Full-time',
    description: data.description,
    requirements: data.requirements,
    salary_range: data.salary_range || null,
    status: data.status || 'Open',
    custom_stages: PIPELINE_STAGES,
    slas: data.slas || { Applied: 14, Screening: 3, Interview: 7, Offer: 5 },
    expires_at: data.expires_at || null,
    closed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.jobs.push(job);
  saveDb();
  return job;
}

export function updateJob(id, fields) {
  const index = db.jobs.findIndex(j => j.id === id);
  if (index !== -1) {
    db.jobs[index] = { ...db.jobs[index], ...fields, updated_at: new Date().toISOString() };
    saveDb();
    return db.jobs[index];
  }
  return null;
}

export function deleteJob(id) {
  db.jobs = db.jobs.filter(j => j.id !== id);
  saveDb();
}

// --- Candidates ---

export function getAllCandidates() {
  return [...db.candidates].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getCandidateById(id) {
  return db.candidates.find(c => c.id === id);
}

export function getCandidateByEmail(email) {
  return db.candidates.find(c => c.email === email);
}

export function createCandidate(data) {
  const candidate = {
    id: data.id || generateId(),
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    resume_text: data.resume_text || null,
    skills: data.skills || null,
    experience_years: data.experience_years || 0,
    education: data.education || null,
    notes: data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.candidates.push(candidate);
  saveDb();
  return candidate;
}

export function updateCandidate(id, fields) {
  const index = db.candidates.findIndex(c => c.id === id);
  if (index !== -1) {
    db.candidates[index] = {
      ...db.candidates[index],
      ...fields,
      updated_at: new Date().toISOString()
    };
    saveDb();
    return db.candidates[index];
  }
  return null;
}

export function deleteCandidate(id) {
  db.candidates = db.candidates.filter(c => c.id !== id);
  saveDb();
}

// --- Applications ---

function populateApplication(app) {
  const job = getJobById(app.job_id) || {};
  const candidate = getCandidateById(app.candidate_id) || {};
  return {
    ...app,
    job_title: job.title,
    department: job.department,
    job_description: job.description,
    job_requirements: job.requirements,
    candidate_name: candidate.name,
    candidate_email: candidate.email,
    candidate_skills: candidate.skills,
    experience_years: candidate.experience_years,
    candidate_education: candidate.education,
    resume_text: candidate.resume_text
  };
}

export function getAllApplications() {
  return db.applications
    .map(populateApplication)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

export function getApplicationById(id) {
  const app = db.applications.find(a => a.id === id);
  return app ? populateApplication(app) : null;
}

export function createApplication(data) {
  const app = {
    id: data.id || generateId(),
    job_id: data.job_id,
    candidate_id: data.candidate_id,
    stage: data.stage || 'Applied',
    stage_entered_at: new Date().toISOString(),
    priority: data.priority || 'Normal', // Normal, High, Urgent
    withdrawn: data.withdrawn || false,
    interview_date: null,
    ai_score: null,
    ai_evaluation: null,
    notes: data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.applications.push(app);

  saveDb();
  return getApplicationById(app.id);
}

export function updateApplicationStage(id, newStage, changedBy = 'recruiter', notes = null) {
  const index = db.applications.findIndex(a => a.id === id);
  if (index !== -1) {
    db.applications[index].stage = newStage;
    db.applications[index].stage_entered_at = new Date().toISOString();
    db.applications[index].updated_at = new Date().toISOString();

    saveDb();
    return getApplicationById(id);
  }
  return null;
}

export function updateApplicationData(id, fields) {
  const index = db.applications.findIndex(a => a.id === id);
  if (index !== -1) {
    db.applications[index] = {
      ...db.applications[index],
      ...fields,
      updated_at: new Date().toISOString()
    };
    saveDb();
    return getApplicationById(id);
  }
  return null;
}

export function updateApplicationScore(id, score, evaluation) {
  const index = db.applications.findIndex(a => a.id === id);
  if (index !== -1) {
    db.applications[index].ai_score = score;
    db.applications[index].ai_evaluation = evaluation;
    db.applications[index].updated_at = new Date().toISOString();
    saveDb();
    return getApplicationById(id);
  }
  return null;
}

// --- History & Logs ---

export function addStageHistory(data) {
  db.stage_history.push({
    id: generateId(),
    application_id: data.application_id,
    from_stage: data.from_stage || null,
    to_stage: data.to_stage,
    changed_by: data.changed_by || 'system',
    notes: data.notes || null,
    created_at: new Date().toISOString()
  });
  saveDb();
}

export function addActivityLog(data) {
  db.activity_log.push({
    id: generateId(),
    type: data.type,
    title: data.title,
    description: data.description || null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    application_id: data.application_id || null,
    job_id: data.job_id || null,
    candidate_id: data.candidate_id || null,
    created_at: new Date().toISOString()
  });
  saveDb();
}

export function getActivityLog(limit = 50) {
  return [...db.activity_log]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

// --- Automation Rules ---

export function getAutomationRules() {
  return [...db.automation_rules].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

export function createAutomationRule(data) {
  const rule = {
    id: data.id || generateId(),
    name: data.name,
    description: data.description || null,
    trigger_type: data.trigger_type,
    trigger_config: JSON.stringify(data.trigger_config || {}),
    action_type: data.action_type,
    action_config: JSON.stringify(data.action_config || {}),
    enabled: data.enabled !== undefined ? data.enabled : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.automation_rules.push(rule);
  saveDb();
  return rule;
}

export function toggleAutomationRule(id, enabled) {
  const index = db.automation_rules.findIndex(r => r.id === id);
  if (index !== -1) {
    db.automation_rules[index].enabled = enabled;
    db.automation_rules[index].updated_at = new Date().toISOString();
    saveDb();
    return db.automation_rules[index];
  }
  return null;
}

// --- Delayed Tasks ---

export function addDelayedTask(task) {
  const newTask = {
    id: generateId(),
    type: task.type,
    execute_at: task.execute_at, // ISO String
    payload: task.payload || {},
    created_at: new Date().toISOString()
  };
  db.delayed_tasks.push(newTask);
  saveDb();
  return newTask;
}

export function getAndClearPendingTasks() {
  const now = new Date();
  const pending = db.delayed_tasks.filter(t => new Date(t.execute_at) <= now);
  db.delayed_tasks = db.delayed_tasks.filter(t => new Date(t.execute_at) > now);
  if (pending.length > 0) {
    saveDb();
  }
  return pending;
}

export function removeDelayedTasksByApplication(applicationId, type = null) {
  const initialLength = db.delayed_tasks.length;
  db.delayed_tasks = db.delayed_tasks.filter(t => {
    const matchesApp = t.payload && t.payload.applicationId === applicationId;
    if (matchesApp) {
      if (type && t.type !== type) return true; // keep if type doesn't match
      return false; // remove
    }
    return true; // keep
  });
  if (db.delayed_tasks.length !== initialLength) {
    saveDb();
  }
}

// --- Dashboard ---

export function getDashboardStats() {
  const openJobs = db.jobs.filter(j => j.status === 'Open').length;
  const totalCandidates = db.candidates.length;
  const activeApplications = db.applications.filter(
    a => a.stage !== 'Hired' && a.stage !== 'Rejected'
  ).length;
  const hiredCount = db.applications.filter(a => a.stage === 'Hired').length;

  const pipelineDistribution = Object.entries(
    db.applications.reduce((acc, app) => {
      acc[app.stage] = (acc[app.stage] || 0) + 1;
      return acc;
    }, {})
  ).map(([stage, count]) => ({ stage, count }));

  const recentActivity = getActivityLog(10);

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

export function getUserByCredentials(email, password) {
  return db.users.find(u => u.email === email && u.password === password) || null;
}

// --- Settings ---

export function getSettings() {
  return {
    email_templates: db.email_templates || DEFAULT_DATA.email_templates,
    recruiter_settings: db.recruiter_settings || DEFAULT_DATA.recruiter_settings
  };
}

export function updateSettings(fields) {
  let updated = false;
  if (fields.email_templates) {
    db.email_templates = { ...db.email_templates, ...fields.email_templates };
    updated = true;
  }
  if (fields.recruiter_settings) {
    db.recruiter_settings = { ...db.recruiter_settings, ...fields.recruiter_settings };
    updated = true;
  }
  if (updated) {
    saveDb();
  }
  return getSettings();
}
