/**
 * AI Service Layer
 *
 * Provides a unified interface for AI-powered features.
 * Default: intelligent mock responses (no API key needed)
 * Optional: real Claude API integration via environment variables
 *
 * To use Claude API:
 *   1. Set AI_PROVIDER=claude in .env.local
 *   2. Set ANTHROPIC_API_KEY=your-key in .env.local
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'mock';

// --- Follow-up Email Generation ---

const emailTemplates = {
  Applied: (candidate, job) => ({
    subject: `Application Received — ${job.title}`,
    body: `Dear ${candidate.name},\n\nThank you for applying for the ${job.title} position in our ${job.department} department. We're excited to review your application.\n\nWe've received your materials and our team will carefully evaluate your qualifications. You can expect to hear from us within 5-7 business days regarding the next steps.\n\nIn the meantime, feel free to explore our company culture and recent projects on our website.\n\nBest regards,\nRecruitment Team`
  }),

  Screening: (candidate, job) => ({
    subject: `Application Update — ${job.title}`,
    body: `Dear ${candidate.name},\n\nGreat news! Your application for the ${job.title} position has moved to our screening phase.\n\nOur hiring team is currently reviewing your qualifications, experience, and how they align with our requirements. This typically takes 3-5 business days.\n\nIf we need any additional information, we'll reach out directly. Thank you for your patience.\n\nBest regards,\nRecruitment Team`
  }),

  Interview: (candidate, job) => ({
    subject: `Interview Invitation — ${job.title}`,
    body: `Dear ${candidate.name},\n\nCongratulations! We'd like to invite you for an interview for the ${job.title} position.\n\nHere's what to expect:\n• The interview will last approximately 45-60 minutes\n• You'll meet with the hiring manager and a team member from ${job.department}\n• We'll discuss your experience, technical skills, and how you'd contribute to our team\n\nTo prepare:\n• Review the job description and think about relevant experiences\n• Prepare questions you'd like to ask about the role and team\n• Have specific examples ready that demonstrate your key skills\n\nOur scheduling team will reach out shortly to coordinate a convenient time.\n\nBest regards,\nRecruitment Team`
  }),

  Offer: (candidate, job) => ({
    subject: `Offer Extended — ${job.title}`,
    body: `Dear ${candidate.name},\n\nWe're thrilled to extend you an offer for the ${job.title} position! After careful evaluation, we believe you'd be an excellent addition to our ${job.department} team.\n\nOur HR team will send you the formal offer letter with complete details including compensation, benefits, and start date options.\n\nPlease take your time to review everything carefully. We're happy to answer any questions or discuss any aspects of the offer.\n\nWe truly hope you'll join us!\n\nBest regards,\nRecruitment Team`
  }),

  Hired: (candidate, job) => ({
    subject: `Welcome Aboard! — ${job.title}`,
    body: `Dear ${candidate.name},\n\nWelcome to the team! We're delighted you've accepted the ${job.title} position.\n\nHere's what happens next:\n• You'll receive onboarding materials via email within 48 hours\n• Our HR team will coordinate your first-day logistics\n• Your manager in ${job.department} will reach out to introduce themselves\n\nWe're excited to have you on board and look forward to your contributions!\n\nBest regards,\nRecruitment Team`
  }),

  Rejected: (candidate, job) => ({
    subject: `Application Update — ${job.title}`,
    body: `Dear ${candidate.name},\n\nThank you for your interest in the ${job.title} position and for the time you invested in the application process.\n\nAfter careful consideration, we've decided to move forward with other candidates whose experience more closely aligns with our current needs.\n\nThis was a competitive selection process, and we were genuinely impressed by your qualifications. We encourage you to apply for future positions that match your skills and interests.\n\nWe wish you all the best in your career journey.\n\nBest regards,\nRecruitment Team`
  })
};

export async function generateFollowUpEmail(candidate, job, stage) {
  if (AI_PROVIDER === 'claude') {
    return await generateFollowUpEmailWithClaude(candidate, job, stage);
  }
  return generateFollowUpEmailMock(candidate, job, stage);
}

function generateFollowUpEmailMock(candidate, job, stage) {
  const template = emailTemplates[stage];
  if (!template) {
    return {
      subject: `Application Update — ${job.title || job.job_title}`,
      body: `Dear ${candidate.name || candidate.candidate_name},\n\nWe wanted to update you on your application for the ${job.title || job.job_title} position.\n\nBest regards,\nRecruitment Team`
    };
  }
  return template(
    { name: candidate.name || candidate.candidate_name },
    { title: job.title || job.job_title, department: job.department || 'our' }
  );
}

async function generateFollowUpEmailWithClaude(candidate, job, stage) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Generate a professional recruitment follow-up email for a candidate who just moved to the "${stage}" stage.

Candidate: ${candidate.name || candidate.candidate_name}
Job Title: ${job.title || job.job_title}
Department: ${job.department}

Return ONLY a JSON object with "subject" and "body" fields. The email should be warm, professional, and stage-appropriate.`
          }
        ]
      })
    });
    const data = await response.json();
    return JSON.parse(data.content[0].text);
  } catch (error) {
    console.error('Claude API error, falling back to mock:', error);
    return generateFollowUpEmailMock(candidate, job, stage);
  }
}

// --- Candidate Scoring ---

export async function scoreCandidate(candidate, job) {
  if (AI_PROVIDER === 'claude') {
    return await scoreCandidateWithClaude(candidate, job);
  }
  return scoreCandidateMock(candidate, job);
}

function scoreCandidateMock(candidate, job) {
  const candidateSkills = (candidate.skills || candidate.candidate_skills || '').toLowerCase();
  const jobReqs = (job.requirements || job.job_requirements || '').toLowerCase();
  const jobDesc = (job.description || job.job_description || '').toLowerCase();

  // Simple keyword matching for mock scoring
  const reqWords = jobReqs
    .split(/[,;\n]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const matchCount = reqWords.filter(
    req =>
      candidateSkills.includes(req) || (candidate.resume_text || '').toLowerCase().includes(req)
  ).length;

  const skillsMatch =
    reqWords.length > 0 ? Math.min(100, Math.round((matchCount / reqWords.length) * 100)) : 70;

  const expYears = candidate.experience_years || 0;
  const experienceScore = Math.min(100, Math.round(expYears * 15));

  const educationScore = candidate.education || candidate.candidate_education ? 70 : 50;

  const overall = Math.round(skillsMatch * 0.4 + experienceScore * 0.35 + educationScore * 0.25);

  const strengths = [];
  const gaps = [];

  if (skillsMatch >= 70) strengths.push('Strong skills alignment with job requirements');
  if (experienceScore >= 70) strengths.push('Solid relevant experience');
  if (educationScore >= 70) strengths.push('Relevant educational background');
  if (skillsMatch < 50) gaps.push('Limited skills match — may need additional training');
  if (experienceScore < 50) gaps.push('Less experience than ideal for this role');
  if (gaps.length === 0 && strengths.length < 2) strengths.push('Well-rounded candidate profile');
  if (gaps.length === 0) gaps.push('No significant gaps identified');

  let recommendation;
  if (overall > 85)
    recommendation = 'Excellent fit — strongly recommend advancing to phone screening';
  else if (overall >= 60) recommendation = 'Good fit — recommend advancing to screening';
  else if (overall >= 40)
    recommendation = 'Moderate fit — review application details before deciding';
  else recommendation = 'Below threshold — consider for other positions';

  return {
    overallScore: overall,
    dimensions: {
      skillsMatch,
      experienceRelevance: experienceScore,
      educationFit: educationScore
    },
    strengths,
    gaps,
    recommendation
  };
}

async function scoreCandidateWithClaude(candidate, job) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Evaluate this candidate's fit for the job. Return ONLY a JSON object.

Job: ${job.title || job.job_title}
Requirements: ${job.requirements || job.job_requirements}
Description: ${job.description || job.job_description}

Candidate: ${candidate.name || candidate.candidate_name}
Skills: ${candidate.skills || candidate.candidate_skills || 'Not specified'}
Experience: ${candidate.experience_years || 0} years
Education: ${candidate.education || candidate.candidate_education || 'Not specified'}
Resume: ${(candidate.resume_text || '').substring(0, 500)}

Return JSON with: overallScore (0-100), dimensions (skillsMatch, experienceRelevance, educationFit each 0-100), strengths (array), gaps (array), recommendation (string).`
          }
        ]
      })
    });
    const data = await response.json();
    return JSON.parse(data.content[0].text);
  } catch (error) {
    console.error('Claude API error, falling back to mock:', error);
    return scoreCandidateMock(candidate, job);
  }
}

// --- Interview Question Generation ---

export async function generateInterviewQuestions(candidate, job) {
  const candidateName = candidate.name || candidate.candidate_name;
  const jobTitle = job.title || job.job_title;
  const department = job.department;

  return [
    {
      category: 'Technical',
      question: `Can you walk us through a challenging project you've worked on that's relevant to the ${jobTitle} role?`,
      purpose: 'Assess technical depth and problem-solving approach'
    },
    {
      category: 'Behavioral',
      question:
        'Tell me about a time you had to work with a difficult team member. How did you handle it?',
      purpose: 'Evaluate teamwork and conflict resolution skills'
    },
    {
      category: 'Role-Specific',
      question: `What interests you most about working in ${department}, and how do you see yourself contributing?`,
      purpose: 'Gauge motivation and cultural fit'
    },
    {
      category: 'Problem-Solving',
      question:
        'Describe a situation where you had to learn something new quickly to complete a project.',
      purpose: 'Assess adaptability and learning agility'
    },
    {
      category: 'Career Goals',
      question: `Where do you see your career heading in the next 3-5 years, and how does this ${jobTitle} position fit into that trajectory?`,
      purpose: 'Understand long-term alignment and retention potential'
    }
  ];
}
