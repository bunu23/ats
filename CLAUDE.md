# ATS Project Codebase Context

This document provides a comprehensive overview of the Applicant Tracking System (ATS) project. It is intended to be used as context for AI assistants to understand the architecture, data models, and features of the application.

## Tech Stack

- **Framework:** Next.js 16 (App Router) - _Note: Awaits route params per Next.js 15+ specifications._
- **Frontend:** React, Vanilla CSS (`globals.css` with a sleek, dark-mode glassmorphism aesthetic)
- **Backend:** Next.js API Routes (`src/app/api/...`)
- **Database:** SQLite via Prisma ORM (`prisma/dev.db`) managed via `src/lib/db.js`
- **Background Jobs:** Node.js background process (`worker.js`) imported directly into the main Next.js runtime via `db.js`.

## Core Features & Architecture

### 1. Industry-Agnostic Jobs

Jobs are entirely customizable. Instead of hardcoded global stages (like "Applied -> Interview -> Hired"), every single Job has its own `custom_stages` array defined upon creation.

- The **Jobs UI** (`src/app/(dashboard)/jobs/page.js`) allows recruiters to define and reorder these stages.
- The **Pipeline UI** (`src/app/(dashboard)/pipeline/page.js`) dynamically renders its Kanban columns based on the specific job selected in the dropdown.
- The **Dashboard** (`src/app/(dashboard)/page.js`) renders a dynamic pipeline distribution bar chart based on the selected job's custom stages.

### 2. Time-Based SLAs & Background Worker

The system enforces SLAs (Service Level Agreements) for how long candidates can sit in specific stages.

- **`worker.js`**: A background script imported into `db.js` that runs a `setInterval` every 60 seconds.
- **Delayed Tasks Queue**: Executes 48-hour delayed rejections (preserving empathy) and 2-hour post-interview "Thank You" notes.
- **SLA Breaches**: Scans the database. If a candidate sits in a stage longer than the allowed time, their `priority` is escalated (Normal -> High -> Urgent), and a warning is logged.
- **Auto-Rejection**: Candidates sitting in "Applied" for > 14 days or "Screening" for > 3 days are automatically rejected.
- **Reminders**: Sends simulated email reminders 24h (with preparation tips) and 1h before scheduled interviews.

### 3. Automation Engine (`src/lib/automation-engine.js`)

When an application's stage is changed (e.g., dragged and dropped on the Kanban board) or created, the Automation Engine evaluates a dynamic, database-driven Rules Engine:

- **100-Point AI Scoring**: AI evaluates resumes on a 100-point scale, autonomously mapping candidates directly into pipeline stages (e.g., `<59` locks to Read-Only Auto-Reject guardrail, `>85` fast-tracks to Phone Screening).
- **Dynamic Rules (`db.automation_rules`)**: Executes configurable actions (e.g., `send_email` or `close_job`) automatically whenever a stage transition matches a rule's criteria.
- **Phase 5 (Offer) Guardrail**: Explicitly blocks automated offer letters, requiring a recruiter to manually generate them.
- **Late-Stage Rejection Guardrail**: Explicitly **blocks** automated emails for late-stage (Final Round) rejections, demanding a human touch.
- **Dependency Injection**: The engine receives its database client via parameter injection, making it highly testable.

### 4. Candidate Database & Profile UI

The Candidates Database (`src/app/(dashboard)/candidates/page.js`) features a comprehensive "Command Center" modal and data-management UI:

- **Adding Candidates**: Recruiters can add candidates directly to the Talent Pool or automatically assign them to Open Roles (which triggers the automation pipeline).
- **Deletion (Cascading)**: Deleting a candidate safely scrubs their applications, delayed tasks, activity logs, and stage histories via a deep cascade implemented in `db.js`.
- **Right Column Timeline**: Renders a vertical Audit Log showing all stage transitions, tagged by whether a HUMAN, AI AGENT, or SYSTEM triggered them.
- **Right Column Reviews**: Houses an interactive "Interviewer Reviews Hub" for team members to submit and read internal feedback notes.

### 5. Settings & Mission Control UI

- **Email Templates** (`src/app/(dashboard)/settings/page.js`): Clean dropdown interface to switch between configuring "Automated Templates" (pipeline triggers), "Manual Templates", and the "Recruiter Profile" (Calendly link).
- **Mission Control (Activity & Emails)** (`src/app/(dashboard)/activity/page.js`): A centralized, two-column grid layout that categorizes system logs (Automated Actions, AI Emails, System Events) via accordions and highlights **High Priority Alerts** (e.g., SLA breaches, purple Slack webhooks) in a dedicated red box, replacing obtrusive popup toasts.
- **Global Toast Queue (`SlackToastProvider`)**: Background poller that captures concurrent alerts (Slack messages, Emails) and stacks them dynamically in the corner without race conditions.

### 6. Public Careers Portal (`src/app/(public)/careers/page.js`)

An external-facing job board allowing candidates to view open positions and apply directly.

- **Magic Auto-Fill (Mock Resume Parser)**: Features a sleek drag-and-drop zone with a `dashed cyan` border and a scanning animation. Uses a dynamic mock API (`/api/parse-resume`) to extract candidate data directly from the uploaded filename (e.g., `Jane_Doe_Resume.pdf`) to demonstrate AI ingestion.
- **Direct ATS Integration**: Form submissions hit the `/api/apply` endpoint, which dedupes candidate emails, logs the new application, and instantly triggers the **Automation Engine** for 100-point AI scoring and Phase 1 email rules.

### 7. Database Structure (Prisma & SQLite)

The system uses Prisma (`prisma/schema.prisma`) connected to a local SQLite database (`prisma/dev.db`). The primary models are:

- **Job**: Contains `id`, `title`, `custom_stages` (JSON string), `slas` (JSON string), `status`.
- **Candidate**: The global talent pool. Contains `id`, `name`, `email`, `skills`, `experience_years`.
- **Application**: The bridge between jobs and candidates. Tracks `job_id`, `candidate_id`, `stage`, `stage_entered_at`, `priority`.
- **DelayedTask**: Queue for operations waiting for a specific timestamp to execute (e.g., 48-hour rejection).
- **StageHistory**: Audit log of when candidates move between stages.
- **ActivityLog**: Audit log of AI actions, emails sent, and system events.
- **AutomationRule**: Configurable rules dictating stage-change triggers and actions.

## Key Files & Directory Structure

```text
ats-project/
├── prisma/
│   ├── dev.db                       # SQLite Database
│   └── schema.prisma                # Prisma schema definitions
├── src/
│   ├── app/
│   │   ├── globals.css              # Global styles (Glassmorphism design)
│   │   ├── (dashboard)/             # Authenticated recruiter routes
│   │   │   ├── page.js              # Dashboard with Dynamic Pipeline Chart
│   │   │   ├── layout.js            # Main layout and Sidebar navigation
│   │   │   ├── jobs/page.js         # Job Creation and Stage Configuration
│   │   │   ├── pipeline/            # Dynamic Kanban Board & colocated components
│   │   │   ├── activity/page.js     # Mission Control (Activity logs and High-Priority Alerts)
│   │   │   └── candidates/          # Candidate Table & Colocated components
│   │   ├── (public)/                # External facing routes
│   │   │   └── careers/page.js      # Public Job Board with Magic Auto-Fill Resume Parser
│   │   └── api/                     # Backend API Routes (Next.js 16)
│   │       ├── jobs/route.js
│   │       ├── candidates/route.js
│   │       ├── candidates/[id]/route.js # Cascading delete endpoint
│   │       ├── apply/route.js       # External application ingestion endpoint
│   │       └── parse-resume/route.js# Mock AI Resume Parser
│   └── lib/
│       ├── db.js                    # Prisma client wrapper and cascading functions
│       ├── worker.js                # Time-based background cron jobs (imported via db.js)
│       └── automation-engine.js     # Event-driven triggers for stage changes and rules
```

## AI Agent Customizations (`.agents/`)

This project uses an Antigravity **Skills** system to provide targeted context to AI coding assistants:

- **`ui_guidelines`**: Rules for Vanilla CSS, semantic HTML, and PascalCase component naming.
- **`backend_guidelines`**: Rules for Next.js App Router (15+) API JSON formats, Prisma queries, and using ISO 8601 dates.
- **`automation_guidelines`**: Rules for the AI service abstraction, LLM provider setup, and integration patterns.
- Specific skills for AI-powered follow-ups, candidate scoring, and pipeline automation are also included.
