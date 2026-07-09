---
name: pipeline-automation
description: Automated pipeline stage management. Handles rule-based and AI-assisted automation of candidate progression, stale application escalation, and job posting lifecycle.
---

# Pipeline Automation Skill

This skill manages the automated aspects of the recruitment pipeline.

## Automation Rules

All system guardrails are now dynamically managed in the `AutomationRule` database table and can be toggled on/off in the `/automation` UI.

### 1. Auto Follow-up
- **Trigger**: Candidate moves to a new stage
- **Action**: Generate and queue a personalized follow-up email
- **Configurable**: Delay, enabled/disabled per stage

### 2. Stale Application Sweeper (Escalation)
- **Trigger**: Application sits in a stage for more than N days (globally configurable via `/settings` UI)
- **Action**: Auto-reject candidate, log stage change, and send courteous rejection email.
- **Default Thresholds**: 14 days for Applied, 5 days for Screening, 14 days for Interview

### 3. Interview Reminders & Post-Interview Thanks
- **Trigger**: Interview scheduled / Interview completed
- **Action**: Queue 24-hour and 1-hour candidate reminders, 24-hour recruiter notifications, and a post-interview thank you email.
- **Enabled**: Dynamically togglable via UI

### 4. Hiring Manager Notification
- **Trigger**: Candidate reaches Interview stage
- **Action**: Notify assigned hiring manager
- **Enabled**: Dynamically togglable via UI

### 5. Offer Expiration Reminder
- **Trigger**: Candidate is in Offer stage and 48 hours away from the configured SLA expiration (default 5 days).
- **Action**: Dispatch a gentle reminder email checking for final questions before the offer expires.
- **Enabled**: Dynamically togglable via UI

### 6. Job Auto-Close
- **Trigger**: Position filled (candidate hired) or posting expired
- **Action**: Close job posting, notify remaining active candidates
- **Enabled**: Dynamically togglable via UI

## Event System

All automation is event-driven:
```
StageChange → AutomationEngine → atsQueue (BullMQ) → Worker Node
```

Events are processed asynchronously via **BullMQ + Redis**, ensuring scalable and reliable background task execution.
