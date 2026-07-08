import {
  createJob,
  createCandidate,
  createApplication,
  createAutomationRule
} from '../src/lib/db.js';

// Setup default automation rules
console.log('Setting up automation rules...');
createAutomationRule({
  name: 'Auto Follow-up Email',
  description: 'Automatically generate and send follow-up emails when candidates change stages.',
  trigger_type: 'stage_change',
  action_type: 'send_followup',
  enabled: true
});

createAutomationRule({
  name: 'Auto-score Candidates',
  description: 'Evaluate candidates with AI as soon as they apply.',
  trigger_type: 'application_created',
  action_type: 'auto_score',
  enabled: true
});

createAutomationRule({
  name: 'Notify Hiring Manager',
  description: 'Notify the hiring manager when a candidate reaches the Interview stage.',
  trigger_type: 'stage_change',
  action_type: 'notify_manager',
  enabled: true
});

console.log('Creating jobs...');
const frontendJob = createJob({
  title: 'Senior Frontend Developer',
  department: 'Engineering',
  location: 'Remote',
  type: 'Full-time',
  description:
    'We are looking for an experienced frontend developer to build exceptional user experiences.',
  requirements: 'React, Next.js, TypeScript, CSS, 5+ years experience',
  salary_range: '$120,000 - $150,000'
});

const productJob = createJob({
  title: 'Product Manager',
  department: 'Product',
  location: 'New York, NY',
  type: 'Full-time',
  description: 'Lead the product strategy for our core recruitment tools.',
  requirements: 'Agile, B2B SaaS experience, 3+ years experience',
  salary_range: '$130,000 - $160,000'
});

console.log('Creating candidates...');
const candidate1 = createCandidate({
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  phone: '555-0101',
  skills: 'React, Next.js, Node.js, TypeScript, TailwindCSS',
  experience_years: 6,
  education: 'BS Computer Science',
  resume_text:
    'Experienced software engineer specializing in frontend development. Built scalable web applications for 3 startups.'
});

const candidate2 = createCandidate({
  name: 'Sarah Smith',
  email: 'sarah.smith@example.com',
  phone: '555-0102',
  skills: 'Product strategy, Agile, Jira, Figma, Data analysis',
  experience_years: 4,
  education: 'MBA',
  resume_text:
    'Product manager with a track record of successfully launching B2B SaaS products. Certified Scrum Master.'
});

const candidate3 = createCandidate({
  name: 'Michael Chang',
  email: 'm.chang@example.com',
  phone: '555-0103',
  skills: 'React, Redux, JavaScript, HTML, CSS',
  experience_years: 2,
  education: 'Coding Bootcamp Graduate',
  resume_text:
    'Passionate junior frontend developer looking for my next challenge. Strong eye for design.'
});

console.log('Creating applications...');
createApplication({
  job_id: frontendJob.id,
  candidate_id: candidate1.id,
  stage: 'Interview'
});

createApplication({
  job_id: productJob.id,
  candidate_id: candidate2.id,
  stage: 'Screening'
});

createApplication({
  job_id: frontendJob.id,
  candidate_id: candidate3.id,
  stage: 'Applied'
});

console.log('Seed complete! Database is ready at data/ats.db');
