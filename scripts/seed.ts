import {
  createJob,
  createCandidate,
  createApplication,
  createAutomationRule
} from '../src/lib/db.js';

async function seed() {
  // Setup default automation rules
  console.log('Setting up automation rules...');
  await createAutomationRule({
    name: 'Auto Follow-up Email',
    description: 'Automatically generate and send follow-up emails when candidates change stages.',
    trigger_type: 'stage_change',
    action_type: 'send_followup',
    enabled: true
  });

  await createAutomationRule({
    name: 'Auto-score Candidates',
    description: 'Evaluate candidates with AI as soon as they apply.',
    trigger_type: 'application_created',
    action_type: 'auto_score',
    enabled: true
  });

  await createAutomationRule({
    name: 'Notify Hiring Manager',
    description: 'Notify the hiring manager when a candidate reaches the Interview stage.',
    trigger_type: 'stage_change',
    action_type: 'notify_manager',
    enabled: true
  });
  // System Guardrail Rules
  await createAutomationRule({
    name: 'Stale Application Sweeper',
    description: 'Auto-reject applications that stagnate in a pipeline stage for too long without an update.',
    trigger_type: 'time_in_stage',
    action_type: 'system_stale_sweeper',
    enabled: true
  });

  await createAutomationRule({
    name: 'SLA Breach Escalations',
    description: 'Automatically escalate candidate priority to High or Urgent if SLA is breached.',
    trigger_type: 'sla_breach',
    action_type: 'system_sla_escalation',
    enabled: true
  });

  await createAutomationRule({
    name: 'Interview Reminders',
    description: 'Queue 24-hour and 1-hour reminders for candidates, and 24-hour recruiter notifications.',
    trigger_type: 'interview_scheduled',
    action_type: 'system_interview_reminders',
    enabled: true
  });

  await createAutomationRule({
    name: 'Post-Interview Thank You',
    description: 'Send a personalized note thanking the candidate a few hours after their interview.',
    trigger_type: 'time_after_interview',
    action_type: 'system_post_interview_thanks',
    enabled: true
  });

  await createAutomationRule({
    name: 'Offer Expiration Reminders',
    description: 'Dispatch a gentle nudge 48 hours before an offer expires.',
    trigger_type: 'offer_expiring',
    action_type: 'system_offer_reminders',
    enabled: true
  });

  await createAutomationRule({
    name: 'Delayed Rejections Guardrail',
    description: 'Enforce a 48-hour delay on automated and manual rejections before emailing the candidate.',
    trigger_type: 'manual_rejection',
    action_type: 'system_delayed_rejection',
    enabled: true
  });

  console.log('Creating jobs...');
  const frontendJob = await createJob({
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'We are looking for an experienced frontend developer to build exceptional user experiences.',
    requirements: 'React, Next.js, TypeScript, CSS, 5+ years experience',
    salary_range: '$120,000 - $150,000'
  });

  const productJob = await createJob({
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Lead the product strategy for our core recruitment tools.',
    requirements: 'Agile, B2B SaaS experience, 3+ years experience',
    salary_range: '$130,000 - $160,000'
  });

  console.log('Creating candidates and applications...');

  // Frontend Job Candidates
  const feCandidates = [
    {
      name: 'Alex Johnson',
      email: 'alex.j@example.com',
      phone: '555-0101',
      skills: 'React, Next.js, Node.js',
      experience_years: 6,
      education: 'BS CS',
      resume_text: 'Experienced frontend dev',
      stage: 'Interview'
    },
    {
      name: 'Michael Chang',
      email: 'm.chang@example.com',
      phone: '555-0103',
      skills: 'React, JavaScript, CSS',
      experience_years: 2,
      education: 'Bootcamp',
      resume_text: 'Junior frontend dev',
      stage: 'Applied'
    },
    {
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '555-0104',
      skills: 'Vue, React, TypeScript',
      experience_years: 4,
      education: 'BS CS',
      resume_text: 'Mid-level frontend engineer',
      stage: 'Screening'
    },
    {
      name: 'John Smith',
      email: 'john.s@example.com',
      phone: '555-0105',
      skills: 'Angular, React, Node',
      experience_years: 8,
      education: 'MS CS',
      resume_text: 'Senior web developer',
      stage: 'Offer'
    },
    {
      name: 'Jessica Taylor',
      email: 'jessica.t@example.com',
      phone: '555-0106',
      skills: 'HTML, CSS, JS',
      experience_years: 1,
      education: 'Self-taught',
      resume_text: 'Enthusiastic beginner',
      stage: 'Rejected'
    }
  ];

  for (const c of feCandidates) {
    const candidate = await createCandidate({
      name: c.name,
      email: c.email,
      phone: c.phone,
      skills: c.skills,
      experience_years: c.experience_years,
      education: c.education,
      resume_text: c.resume_text
    });

    // Generate scores from 40 to 100 to test all 3 badge colors (Red, Blue, Green)
    const score = Math.floor(Math.random() * 61) + 40;
    let finalStage = c.stage;
    if (score < 60 && finalStage !== 'Rejected') {
      finalStage = 'Applied'; // Guardrail: poor fits cannot advance past Applied
    }

    await createApplication({
      job_id: frontendJob.id,
      candidate_id: candidate.id,
      stage: finalStage,
      ai_score: score
    });
  }

  // Product Job Candidates
  const pmCandidates = [
    {
      name: 'Sarah Smith',
      email: 'sarah.smith@example.com',
      phone: '555-0102',
      skills: 'Product strategy, Agile',
      experience_years: 4,
      education: 'MBA',
      resume_text: 'Track record in SaaS',
      stage: 'Screening'
    },
    {
      name: 'David Kim',
      email: 'david.k@example.com',
      phone: '555-0201',
      skills: 'Jira, Scum, Product Management',
      experience_years: 5,
      education: 'BS Business',
      resume_text: 'Data-driven PM',
      stage: 'Interview'
    },
    {
      name: 'Laura Wilson',
      email: 'laura.w@example.com',
      phone: '555-0202',
      skills: 'Figma, User Research, SQL',
      experience_years: 3,
      education: 'BA Psychology',
      resume_text: 'Focus on user experience',
      stage: 'Applied'
    },
    {
      name: 'James Brown',
      email: 'james.b@example.com',
      phone: '555-0203',
      skills: 'B2B, SaaS, Leadership',
      experience_years: 7,
      education: 'MBA',
      resume_text: 'Experienced product leader',
      stage: 'Offer'
    },
    {
      name: 'Olivia Martinez',
      email: 'olivia.m@example.com',
      phone: '555-0204',
      skills: 'Agile, Analytics, Strategy',
      experience_years: 6,
      education: 'BS Engineering',
      resume_text: 'Technical PM',
      stage: 'Hired'
    }
  ];

  for (const c of pmCandidates) {
    const candidate = await createCandidate({
      name: c.name,
      email: c.email,
      phone: c.phone,
      skills: c.skills,
      experience_years: c.experience_years,
      education: c.education,
      resume_text: c.resume_text
    });

    // Generate scores from 40 to 100 to test all 3 badge colors (Red, Blue, Green)
    const score = Math.floor(Math.random() * 61) + 40;
    let finalStage = c.stage;
    if (score < 60 && finalStage !== 'Rejected') {
      finalStage = 'Applied'; // Guardrail: poor fits cannot advance past Applied
    }

    await createApplication({
      job_id: productJob.id,
      candidate_id: candidate.id,
      stage: finalStage,
      ai_score: score
    });
  }

  console.log('Seed complete! Database is ready at data/ats.db');
}

seed()
  .catch(console.error)
  .finally(async () => {
    // Need to use prisma variable from db.js but it is not exported.
    // Instead we can just exit the process cleanly.
    process.exit(0);
  });
