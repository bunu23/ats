---
name: candidate-followup
description: AI-powered candidate follow-up email generation. Generates personalized, stage-appropriate follow-up emails for candidates as they move through the hiring pipeline.
---

# Candidate Follow-up Skill

This skill generates personalized follow-up emails for candidates based on their current stage in the hiring pipeline.

## Behavior

When a candidate transitions to a new pipeline stage, this skill:

1. **Reads context**: candidate name, job title, company info, stage entered
2. **Generates email**: uses the AI service to draft a personalized, professional email
3. **Logs the action**: records the follow-up in the activity log

## Stage-Specific Templates

| Stage | Email Type | Key Content |
|---|---|---|
| Applied | Acknowledgment | Thank for applying, set expectations for timeline |
| Screening | Status update | Application under review, estimated response time |
| Interview | Interview prep | Date/time details, what to prepare, who they'll meet |
| Offer | Offer details | Congratulations, key terms, next steps |
| Hired | Welcome | Onboarding info, first day details |
| Rejected | Graceful rejection | Thank for time, encourage future applications |

## Integration

The follow-up engine is triggered by the automation engine (`src/lib/automation-engine.ts`) whenever an application's stage changes. Emails are logged in the `activity_log` table and visible in the Activity page.

## Customization

Recruiters can:
- Toggle auto-follow-up per stage in the Automation Rules page
- Review and edit AI-generated emails before sending
- Set custom delay (immediate vs. batched)
