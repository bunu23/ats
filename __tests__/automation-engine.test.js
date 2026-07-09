import { processStageChange, processNewApplication } from '../src/lib/automation-engine';

// Mock the AI service
jest.mock('../src/lib/ai-service', () => ({
  scoreCandidate: jest.fn().mockResolvedValue({
    overallScore: 5,
    recommendation: 'Needs review'
  }),
  generateFollowUpEmail: jest.fn()
}));

// Mock the queue
jest.mock('../src/lib/queue', () => ({
  atsQueue: { add: jest.fn(), getJobs: jest.fn().mockResolvedValue([]) }
}));

import { scoreCandidate } from '../src/lib/ai-service';
import { atsQueue } from '../src/lib/queue';

describe('Automation Engine', () => {
  let mockDb;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    mockDb = {
      getApplicationById: jest.fn().mockReturnValue({
        id: 'app-1',
        job_id: 'job-1',
        candidate_id: 'cand-1',
        candidate_name: 'John Doe',
        candidate_email: 'john@example.com',
        job_title: 'Software Engineer',
        stage: 'Applied'
      }),
      getJobById: jest.fn().mockReturnValue({
        id: 'job-1',
        title: 'Software Engineer',
        status: 'Open',
        custom_stages: [
          'Applied',
          'AI Screening',
          'Phone Screening',
          'Interview',
          'Offer',
          'Hired',
          'Rejected'
        ]
      }),
      getSettings: jest.fn().mockReturnValue({
        recruiter_settings: { calendly_link: 'https://calendly.com/test' },
        email_templates: {
          instant_confirmation: { subject: 'Test Confirmation', body: 'Test Body' },
          interview_invite: { subject: 'Test Interview', body: 'Test Body' },
          polite_archive: { subject: 'Test Rejection', body: 'Test Body' }
        }
      }),
      getAutomationRules: jest.fn().mockReturnValue([
        {
          id: 'rule-interview',
          trigger_type: 'stage_change',
          trigger_config: { to_stage: 'Interview' },
          action_type: 'send_email',
          action_config: { template_key: 'interview_invite' },
          enabled: true
        }
      ]),
      isAutomationRuleEnabled: jest.fn().mockResolvedValue(true),
      addActivityLog: jest.fn(),
      addStageHistory: jest.fn(),
      updateJob: jest.fn(),
      updateJob: jest.fn(),
      updateApplicationStage: jest.fn(),
      updateApplicationData: jest.fn(),
      updateApplicationScore: jest.fn()
    };
  });

  describe('processStageChange', () => {
    it('Dynamic Rule Trigger: moving to Interview should trigger interview_invite email', async () => {
      const results = await processStageChange(mockDb, 'app-1', 'Applied', 'Interview');

      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ action: 'interview_invite_sent' })])
      );
      expect(mockDb.addActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'email_sent' })
      );
    });

    it('Offer Guardrail: moving to Offer should block automated emails and require manual action', async () => {
      const results = await processStageChange(mockDb, 'app-1', 'Interview', 'Offer');

      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ action: 'offer_blocked' })])
      );
      expect(mockDb.addActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification',
          title: expect.stringContaining('Action Required: Draft Offer')
        })
      );
    });

    it('Late-Stage Rejection Guardrail: rejecting from late stage should block polite archive', async () => {
      const results = await processStageChange(mockDb, 'app-1', 'Offer', 'Rejected');

      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ action: 'rejection_blocked' })])
      );
      expect(mockDb.addActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification',
          title: expect.stringContaining('Action Required: Final-Round Rejection')
        })
      );
    });
  });

  describe('processNewApplication', () => {
    it('Instant Confirmation: creating new application should send confirmation', async () => {
      const results = await processNewApplication(mockDb, 'app-1');

      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ action: 'instant_confirmation_sent' })])
      );
      expect(mockDb.addActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'email_sent',
          metadata: expect.objectContaining({ stage: 'Applied' })
        })
      );
    });

    it('Empathy Delay Rejection: low-scoring candidate should queue delayed task', async () => {
      // Mock scoreCandidate to return a low score
      scoreCandidate.mockResolvedValueOnce({
        overallScore: 4,
        recommendation: 'Reject'
      });

      const results = await processNewApplication(mockDb, 'app-1');

      expect(results).toEqual(
        expect.arrayContaining([expect.objectContaining({ action: 'delayed_rejection_queued' })])
      );
      expect(atsQueue.add).toHaveBeenCalledWith(
        'delayed_rejection',
        expect.objectContaining({ applicationId: 'app-1' }),
        expect.any(Object)
      );
    });
  });
});
