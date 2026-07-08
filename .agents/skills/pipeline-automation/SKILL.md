---
name: pipeline-automation
description: Automated pipeline stage management. Handles rule-based and AI-assisted automation of candidate progression, stale application escalation, and job posting lifecycle.
---

# Pipeline Automation Skill

This skill manages the automated aspects of the recruitment pipeline.

## Automation Rules

### 1. Auto Follow-up
- **Trigger**: Candidate moves to a new stage
- **Action**: Generate and queue a personalized follow-up email
- **Configurable**: Delay, enabled/disabled per stage

### 2. Stale Application Sweeper (Escalation)
- **Trigger**: Application sits in a stage for more than N days (globally configurable via `/settings` UI)
- **Action**: Auto-reject candidate, log stage change, and send courteous rejection email.
- **Default**: 14 days for Applied, 5 days for Screening, 14 days for Interview

### 3. Auto-Reject Incomplete
- **Trigger**: Application missing required fields after N days
- **Action**: Auto-reject with notification to candidate
- **Default**: Disabled

### 4. Hiring Manager Notification
- **Trigger**: Candidate reaches Interview stage
- **Action**: Notify assigned hiring manager
- **Default**: Enabled

### 5. Offer Expiration Reminder
- **Trigger**: Candidate is in Offer stage and 48 hours away from the configured SLA expiration (default 5 days).
- **Action**: Dispatch a gentle reminder email checking for final questions before the offer expires.

### 6. Job Auto-Close
- **Trigger**: Position filled (candidate hired) or posting expired
- **Action**: Close job posting, notify remaining active candidates
- **Default**: Enabled

## Event System

All automation is event-driven:
```
StageChange → AutomationEngine → [FollowUp, Notification, Escalation]
```

Events are processed synchronously in the demo (production would use a message queue like Kafka).
