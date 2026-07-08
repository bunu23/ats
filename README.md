# AI-Powered Applicant Tracking System (ATS)

## 1. The High-Level Hook

Hiring is often bottlenecked by administrative overhead—scheduling, sending updates, and scoring resumes. This Applicant Tracking System (ATS) solves that business problem by introducing an **Autonomous Evaluation Engine**. It seamlessly manages candidate status updates, rules-driven pipeline progressions, and intelligent resume scoring without requiring manual recruiter intervention. By automating the routine, talent acquisition teams can focus strictly on the human element of hiring.

## 2. Architectural Highlights & Technical Choices

To ensure the application remains scalable, testable, and lightning-fast, we adopted a strictly decoupled architecture:

- **Separation of Concerns:** The frontend (Next.js App Router UI), the data access layer (`src/lib/db.js`), and the business logic (`src/lib/automation-engine.js`) are entirely separated. This means the UI is never bogged down by complex business rules, and the database can be swapped without rewriting the engine.
- **Modern UI Design:** Features a global dark glassmorphic design system that provides a premium and responsive user experience.
- **Asynchronous Background Worker:** All heavy lifting—such as dispatching emails or scheduling 48-hour delayed rejections—is offloaded to a standalone Node.js process (`worker.js`). This ensures that the primary UI and API routes respond instantly to recruiter actions (like dragging and dropping Kanban cards), while the rules engine evaluates the automation consequences in the background.
- **Dependency Injection:** The automation engine receives its database client via parameter injection, making it highly modular and effortlessly mockable during unit testing.

## 3. Production Readiness & Security Measures

This system is fortified with industry-standard safety measures to make it robust for real-world deployment:

- **Environment Isolation:** All sensitive variables, such as `ANTHROPIC_API_KEY` or `AI_PROVIDER`, are strictly kept out of the source code. They are managed exclusively through secure `.env` files (documented in `.env.example`).
- **Containerization:** The repository includes a production-ready, multi-stage `Dockerfile` and a `docker-compose.yml` to orchestrate both the Next.js server and the background worker seamlessly with a shared state volume.
- **Continuous Integration (CI/CD):** A strict GitHub Actions pipeline (`.github/workflows/ci.yml`) automatically audits dependencies, enforces formatting, and runs the entire test suite before any Pull Request can be merged.
- **Guardrail Logic:** Hardcoded business safety constraints ensure the AI can _never_ autonomously send official job offers or automatically reject candidates in late-stage interviews without explicit human approval.

## 4. Step-by-Step Local Setup Guide

Get the application running in minutes:

### Prerequisites

- Node.js (v22+)
- npm
- Docker & Docker Compose (Optional, for containerized deployment)

### Local Development Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ats-project
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   # Open .env.local and populate your ANTHROPIC_API_KEY if using real AI scoring
   ```
4. **Start the Servers**
   To fully test the application locally, run the UI server and the background worker in two separate terminals:

   _Terminal 1 (UI & API):_

   ```bash
   npm run dev
   ```

   _Terminal 2 (Automation Worker):_

   ```bash
   node worker.js
   ```

_(Alternatively, run `docker compose up -d` to launch the entire stack instantly via Docker)._

## 5. Quality Assurance & Testing Strategy

Code quality is strictly enforced to ensure the automation engine never misfires:

- **Pre-Commit Enforcement (Husky):** Every `git commit` is automatically intercepted by Husky and Lint-Staged. The system runs Prettier to format the code and executes the unit test suite. If any test fails, the commit is aborted.
- **Automated Unit Testing (Jest):** The core business logic (`automation-engine.js`) is thoroughly covered by Jest tests using a fully Mocked Database, allowing reviewers to validate complex pipeline scenarios without corrupting local data.
- **Formatting & Linting:** ESLint and Prettier guarantee uniformity across the entire codebase.
  ```bash
  # Run the test suite manually:
  npm test

  # Format the code manually:
  npm run format
  ```

## 6. The Automation Workflow (Deep Dive)

At the heart of the ATS is the autonomous rules engine. Here is the lifecycle of how a candidate is evaluated:

1. **The Trigger:** A recruiter manually drags a candidate from "Applied" to "Phone Screening" on the Kanban board (or a candidate submits a new application via the public portal).
2. **The API Handoff:** The Next.js API route (`PATCH /api/applications/[id]`) captures this stage change, updates the database, and immediately fires an event to `automation-engine.js`.
3. **Rule Evaluation:** The engine queries the dynamic `automation_rules` database array to see if any active rules match the destination stage.
4. **AI Scoring (If Applicable):** If the candidate is brand new, the engine optionally contacts the Anthropic API to analyze the resume against the job requirements, appending a match score out of 100 to the profile.
5. **Execution & Guardrails:** If a matching rule exists (e.g., "Send Phone Screening Invite"), the engine validates it against the Guardrails. If the action is safe, it logs the email payload to the `activity_log` or schedules it in the `delayed_tasks` queue for the `worker.js` to physically dispatch later.
