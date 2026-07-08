# 🏗️ ATS Technical Wiki

Welcome to the internal engineering wiki for the Next-Gen ATS.

## 1. Architectural Design Patterns

The application is built on the **Next.js 16 App Router** pattern, separating public-facing routes from the secure recruiter dashboard while maintaining a powerful backend service layer.

### File Structure & Routing

- `src/app/(public)/`: Publicly accessible pages, including the Careers portal (`/careers`) where candidates submit applications.
- `src/app/(dashboard)/`: The Recruiter workspace, containing views for Pipeline, Jobs, Candidates, Mission Control (`/activity`), and System Settings.
- `src/app/api/`: RESTful endpoints handling client requests. Key routes include:
  - `/api/apply`: Ingests resumes, triggers the AI Service, and kicks off the Automation Engine.
  - `/api/parse-resume`: Handles intelligent document extraction.
  - `/api/activity`: Provides real-time polling data for the frontend Toast Provider queue.

### The Service Layer (`src/lib/`)

Business logic is decoupled from the Next.js API routes into dedicated singleton services:

- **`db.js`**: Prisma client instantiation and database utilities.
- **`ai-service.js`**: Adapters for interfacing with LLMs (e.g., Anthropic's Claude) vs local mock engines.
- **`automation-engine.js`**: Evaluates stage transitions against the `AutomationRule` database table and dispatches consequences.
- **`worker.js`**: A background processor that polls the `DelayedTask` table for time-deferred executions (e.g., delayed rejection emails).

### Data Persistence

Powered by **SQLite** and **Prisma ORM** (`prisma/schema.prisma`). Core entities include `User`, `Job`, `Candidate`, `Application`, `StageHistory`, `ActivityLog`, `AutomationRule`, and `DelayedTask`.

---

## 2. The Recruitment SLA Matrix

Our system uses an SLA (Service Level Agreement) matrix to ensure candidates receive timely, respectful communication.

### AI Scoring & Pipeline Automation

The AI scores candidates on a 100-point scale:

- **Red (Score < 59):** Triggers the "Empathy Delay" rejection guardrail. The system queues a polite rejection email via `DelayedTask` to fire exactly 48 hours later.
- **Blue (Score 60 - 85):** Automatically advances the candidate to the "Screening" pipeline column for manual recruiter review.
- **Green (Score > 85):** Fast-tracks the candidate directly to "Phone Screening", skipping the initial queue.

### Stage-Based SLAs

- **Interview Stage:** Moving a candidate to Interview queues a background task to send an automated "Thank You" and follow-up email precisely 2 hours after their scheduled time.
- **Stale Application SLA:** If a candidate remains in the same stage beyond the Job's configured maximum SLA threshold, the `AutomationEngine` generates an urgent "SLA Breach" alert in the Mission Control dashboard.

---

## 3. Defensive Engineering & Resilience

Because the ATS handles autonomous communication, strict guardrails and defensive engineering practices are hardcoded into the pipeline.

### The Background Worker

To prevent long-running AI evaluations from blocking API responses, time-intensive operations are offloaded:

- `worker.js` constantly polls the `DelayedTask` table for records where `execute_at <= now()`.
- Tasks have dedicated `payload` JSON schemas and are wrapped in `try/catch` blocks that log failures gracefully into the `ActivityLog` without crashing the main application.

### Stage Guardrails

- **Read-Only Auto-Reject:** Candidates with an AI score `< 60` have their Kanban cards locked. Draggability is completely disabled via CSS and component logic to prevent recruiters from bypassing the AI guardrails.
- **The Phase 5 Guardrail:** The system is explicitly blocked from automating the **Offer** and **Hired** stages. Transitioning a candidate into an Offer stage requires human intervention (e.g., clicking the manual "Simulate Signature" button) to prevent the AI from accidentally extending legal employment offers.
- **Slack Notification Queue:** A UI queue in `SlackToastProvider` intelligently processes simultaneous notifications (e.g., an Email Send + a Slack Webhook firing at the exact same millisecond) ensuring no alert is swallowed by race conditions.
