# ATS Project Codebase Context

This document provides a comprehensive overview of the Applicant Tracking System (ATS) project. It is intended to be used as context for AI assistants to understand the architecture, data models, and features of the application.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend:** React, Vanilla CSS (`globals.css` with a sleek, dark-mode glassmorphism aesthetic)
- **Backend:** Next.js API Routes (`src/app/api/...`)
- **Database:** Local in-memory JSON file (`data/ats-data.json`) managed via `src/lib/db.js`
- **Background Jobs:** Standalone Node.js script (`worker.js`) running alongside the Next.js server.

## Core Features & Architecture

### 1. Industry-Agnostic Jobs

Jobs are entirely customizable. Instead of hardcoded global stages (like "Applied -> Interview -> Hired"), every single Job has its own `custom_stages` array defined upon creation.

- The **Jobs UI** (`src/app/jobs/page.js`) allows recruiters to define and reorder these stages.
- The **Pipeline UI** (`src/app/pipeline/page.js`) dynamically renders its Kanban columns based on the specific job selected in the dropdown.
- The **Dashboard** (`src/app/page.js`) renders a dynamic pipeline distribution bar chart based on the selected job's custom stages.

### 2. Time-Based SLAs & Background Worker

The system enforces SLAs (Service Level Agreements) for how long candidates can sit in specific stages.

- **`worker.js`**: A background Node process that runs a `setInterval` every 60 seconds.
- **Delayed Tasks Queue**: Executes 48-hour delayed rejections (preserving empathy) and 2-hour post-interview "Thank You" notes.
- **SLA Breaches**: Scans the database. If a candidate sits in a stage longer than the allowed time, their `priority` is escalated (Normal -> High -> Urgent), and a warning is logged.
- **Auto-Rejection**: Candidates sitting in "Applied" for > 14 days or "Screening" for > 3 days are automatically rejected.
- **Reminders**: Sends simulated email reminders 24h (with preparation tips) and 1h before scheduled interviews.

### 3. Automation Engine (`src/lib/automation-engine.js`)

When an application's stage is changed (e.g., dragged and dropped on the Kanban board) or created, the Automation Engine evaluates a dynamic, database-driven Rules Engine:

- **Dynamic Rules (`db.automation_rules`)**: Executes configurable actions (e.g., `send_email` or `close_job`) automatically whenever a stage transition matches a rule's criteria.
- **Phase 5 (Offer) Guardrail**: Explicitly blocks automated offer letters, requiring a recruiter to manually generate them.
- **Late-Stage Rejection Guardrail**: Explicitly **blocks** automated emails for late-stage (Final Round) rejections, demanding a human touch.
- **Dependency Injection**: The engine receives its database client via parameter injection, making it highly testable.

### 4. Candidate Database & Profile UI

The Candidates Database (`src/app/candidates/page.js`) features a comprehensive high-fidelity "Command Center" modal:

- **Header**: Displays match score, candidate name, and close action.
- **Sidebar**: Contains gradient avatars and structured contact info (Email, Phone, Status, Resume).
- **Right Column Timeline**: Renders a vertical Audit Log showing all stage transitions, tagged by whether a HUMAN, AI AGENT, or SYSTEM triggered them.
- **Right Column Reviews**: Houses an interactive "Interviewer Reviews Hub" for team members to submit and read internal feedback notes.

### 5. Settings & Activity UI

- **Email Templates (formerly Settings)** (`src/app/settings/page.js`): Features a clean dropdown interface to switch between configuring "Automated Templates" (pipeline triggers), "Manual Templates", and the "Recruiter Profile" (Calendly link).
- **Activity Log** (`src/app/activity/page.js`): An expandable accordion UI that allows recruiters to click any activity event to read the exact, full body of sent emails and the detailed AI evaluation scores directly in the browser.

### 6. Public Careers Portal (`src/app/careers/page.js`)

An external-facing job board allowing candidates to view open positions and apply directly.

- **Live Job Board**: Automatically fetches and displays jobs with an `Open` status.
- **Direct ATS Integration**: Form submissions hit the `/api/apply` endpoint, which dedupes candidate emails, logs the new application, and instantly triggers the **Automation Engine** for AI scoring and Phase 1 email rules.

### 7. Database Structure (`src/lib/db.js`)

The `db.js` file reads/writes to `data/ats-data.json` and acts as a makeshift ORM. The primary collections are:

- **jobs**: Contains `id`, `title`, `custom_stages`, `slas`, `status`, etc.
- **candidates**: The global talent pool. Contains `id`, `name`, `email`, `skills`, `experience_years`, etc.
- **applications**: The bridge between jobs and candidates. Tracks `job_id`, `candidate_id`, `stage`, `stage_entered_at`, `priority`.
- **delayed_tasks**: Queue for operations waiting for a specific timestamp to execute (e.g., 48-hour rejection).
- **stage_history**: Audit log of when candidates move between stages.
- **activity_log**: Audit log of AI actions, emails sent, and system events.
- **automation_rules**: An array of dynamic rule objects detailing triggers (e.g., stage changes) and actions (e.g., send emails).

## Key Files & Directory Structure

```
ats-project/
├── worker.js                        # Time-based background cron jobs & delayed tasks
├── data/
│   └── ats-data.json                # JSON Database (auto-generated)
├── src/
│   ├── app/
│   │   ├── globals.css              # Global styles (Glassmorphism design)
│   │   ├── (dashboard)/             # Authenticated recruiter routes
│   │   │   ├── page.js              # Dashboard with Dynamic Pipeline Chart
│   │   │   ├── layout.js            # Main layout and Sidebar navigation
│   │   │   ├── jobs/page.js         # Job Creation and Stage Configuration
│   │   │   ├── pipeline/            # Dynamic Kanban Board & colocated components
│   │   │   └── candidates/          # Candidate Table & colocated components
│   │   ├── (public)/                # External facing routes
│   │   │   └── careers/page.js      # Public-facing Job Board and Application Portal
│   │   └── api/                     # Backend API Routes
│   │       ├── jobs/route.js
│   │       ├── jobs/[id]/route.js   # Updates specific job configurations
│   │       ├── applications/route.js
│   │       ├── candidates/route.js
│   │       └── apply/route.js       # External application ingestion endpoint
│   └── lib/
│       ├── db.js                    # Database connection and delayed tasks logic
│       └── automation-engine.js     # Event-driven triggers for stage changes and Phase 1-5 rules
```

## Production & CI/CD Infrastructure

### Docker & Containerization

The application is fully containerized using a multi-stage `Dockerfile`.
Because the system relies on both the Next.js server and the `worker.js` script, it is deployed via `docker-compose.yml`. Both containers share a Docker Volume (`ats-data`) to ensure they both read/write to the exact same `data/ats-data.json` database file.
To start the production cluster: `docker compose up -d`

### Continuous Integration & Git Hooks

- **GitHub Actions**: Pipeline (`.github/workflows/ci.yml`) runs `npm ci`, Prettier, ESLint, Jest tests, and Next.js builds on every PR to `main`.
- **Pre-Commit Hooks**: Powered by Husky and Lint-Staged. Automatically formats code and runs unit tests before allowing local commits.
- **Formatting**: Prettier (`.prettierrc`) is configured to enforce code style.

### Environment Configuration

- `.env.example` documents required environment variables such as `AI_PROVIDER` and `ANTHROPIC_API_KEY`.

## Engineering Best Practices & Known Technical Debt

An architectural scan of the codebase reveals exceptionally high maturity for Layered Architecture, Dependency Injection, and CI/CD pipelines. However, to achieve full enterprise-grade "best practices," the following architectural gaps (technical debt) have been identified for future agents/developers to tackle:

1. **TypeScript Adoption**: The project is entirely plain JavaScript. Migrating to TypeScript is highly recommended to strictly type database objects (`db.js`) and API payloads.
2. **API Validation**: Basic `try/catch` is used in routes. Implementing a schema validation library like `Zod` is needed to rigorously validate incoming `POST`/`PATCH` payloads.
3. **State Management**: Frontend state is managed locally via React `useState` and manual API refetching. Introducing React Query (TanStack Query) or SWR would optimize caching and real-time data synchronization across the Kanban board.

## Running Locally (Development)

To fully test the application locally without Docker, two terminal processes are required:

1. Start the Next.js UI and API server:
   ```bash
   npm run dev
   ```
2. Start the background time-based worker (in a separate terminal):
   ```bash
   node worker.js
   ```

## Testing Infrastructure

- **Framework**: Jest (configured for Next.js via `next/jest`).
- **Unit Tests**: Found in `__tests__/automation-engine.test.js`. Validates the core Automation Engine logic using a fully mocked Database (`MockDb`) to ensure `ats-data.json` is never corrupted during test runs. Run with `npm test`.

## AI Agent Customizations (`.agents/`)

Instead of monolithic global rules, this project uses an Antigravity **Skills** system to provide targeted context to AI coding assistants:

- **`ui_guidelines`**: Rules for Vanilla CSS, semantic HTML, and PascalCase component naming.
- **`backend_guidelines`**: Rules for API JSON formats, routing DB queries through `db.js`, and using ISO 8601 dates.
- **`automation_guidelines`**: Rules for the AI service abstraction, LLM provider setup, and integration patterns.
