import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Injecting email templates...');

  const emailTemplates = {
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
  };

  await prisma.settings.upsert({
    where: { id: 'default-settings' },
    update: {
      email_templates: JSON.stringify(emailTemplates)
    },
    create: {
      id: 'default-settings',
      email_templates: JSON.stringify(emailTemplates),
      recruiter_settings: JSON.stringify({})
    }
  });

  console.log('Email templates injected successfully!');
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
