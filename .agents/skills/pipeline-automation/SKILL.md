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

### 2. Stale Application Escalation
- **Trigger**: Application sits in a stage for more than N days (configurable)
- **Action**: Flag as stale, notify recruiter, optionally auto-advance or auto-reject
- **Default**: 7 days for Screening, 14 days for Interview

### 3. Auto-Reject Incomplete
- **Trigger**: Application missing required fields after N days
- **Action**: Auto-reject with notification to candidate
- **Default**: Disabled

### 4. Hiring Manager Notification
- **Trigger**: Candidate reaches Interview stage
- **Action**: Notify assigned hiring manager
- **Default**: Enabled

### 5. Job Auto-Close
- **Trigger**: Position filled (candidate hired) or posting expired
- **Action**: Close job posting, notify remaining active candidates
- **Default**: Enabled

## Event System

All automation is event-driven:
```
StageChange → AutomationEngine → [FollowUp, Notification, Escalation]
```

Events are processed synchronously in the demo (production would use a message queue like Kafka).
