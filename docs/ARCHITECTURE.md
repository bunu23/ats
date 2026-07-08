# ATS Project Architecture & Design Patterns

This document outlines the software engineering principles, architectural decisions, and design patterns used to build the AI-powered Applicant Tracking System (ATS). It is intended to provide a clear understanding of the codebase structure for developers and engineers.

## 1. Separation of Concerns (SoC) & Layered Architecture

The codebase is strictly divided into functional layers to ensure maintainability and testability. Changes in one layer (e.g., swapping the database) will not require changes in other layers (e.g., business logic).

- **Presentation Layer (`src/app/`)**:
  Built with Next.js App Router (React). This layer is purely responsible for UI rendering, CSS styling, and managing client-side state. It utilizes route colocation for components (components are stored alongside their respective routes) and features a global dark glassmorphic UI. It does not contain direct database queries or AI API calls.
- **Controller Layer (`src/app/api/`)**:
  Next.js Route Handlers act as the API controllers. They parse incoming HTTP requests, validate payloads, and delegate the work to the underlying business logic.
- **Business Logic Layer (`src/lib/automation-engine.js`)**:
  The "brain" of the ATS. It handles workflow orchestration, evaluates active automation rules, and decides _when_ to trigger AI actions based on system events.
- **Service Layer (`src/lib/ai-service.js`)**:
  Contains the isolated logic for interacting with external AI models (Claude). It formats prompts, structures context, and parses JSON responses from the LLM.
- **Data Access Layer (`src/lib/db.js`)**:
  Implements the Repository pattern. It abstracts away the underlying database operations (currently using a JSON file store for zero-dependency local development, but architected so it can be seamlessly swapped to SQLite or PostgreSQL).

## 2. Event-Driven Architecture

Instead of tightly coupling UI actions to complex backend workflows (e.g., hardcoding an email trigger into the Kanban board drag-and-drop function), the system uses an event-driven approach.

When a candidate is moved to a new stage, the system fires a generic event (`processStageChange`). The **Automation Engine** acts as an event consumer:

1. It listens for `stage_change` or `application_created` events.
2. It queries the `automation_rules` database table to see if the recruiter has enabled any rules for that specific event.
3. If a match is found (e.g., "Trigger: stage_change -> Action: send_followup"), it executes the action asynchronously.

**Benefit**: This makes the system highly scalable. Adding a new feature—like sending a Slack notification when a candidate applies—requires zero changes to the frontend React code or the core API route. You simply add a new rule consumer in the automation engine.

## 3. Design Patterns

### Strategy Pattern (AI Provider Swapping)

The `ai-service.js` utilizes a lightweight strategy pattern. It checks the `AI_PROVIDER` environment variable at runtime and seamlessly routes requests to either:

- **The real Anthropic API** (`generateFollowUpEmailWithClaude`)
- **A local mock fallback** (`generateFollowUpEmailMock`)

The caller in the automation engine never has to know which provider is being used, allowing for rapid offline development and reliable production deployments.

### Data Access Object (DAO) / Repository Pattern

Functions in `src/lib/db.js` (like `updateApplicationStage` and `getApplicationById`) abstract the data storage mechanism. The rest of the application interacts purely with these functions rather than writing raw database queries, ensuring data integrity and making database migrations trivial.

### Optimistic UI Updates

On the frontend (`pipeline/page.js`), the Kanban board updates the React state _instantly_ when a card is dragged. This provides a 0ms latency feel for the user. Meanwhile, the `PATCH` request is fired to the backend asynchronously to persist the state.

## 4. Agent-Oriented Architecture for Claude Code

This repository is structurally optimized for **AI Agent collaboration** (specifically Claude Code).

By placing the AI capabilities and project context into the `.agents/skills/` directory (e.g., `candidate-scoring.md` and `pipeline-automation.md`), we provide declarative instructions for autonomous agents. If a developer uses an AI coding assistant on this repository, the agent will automatically parse these skill files and understand exactly how the ATS automation operates without needing human onboarding or explanation.

### Dependency Injection (DI)

The Automation Engine utilizes a lightweight form of constructor/parameter injection. Functions like `processStageChange(db, applicationId, newStage)` expect the `db` instance to be injected as an argument. This completely decouples the business logic from the file system, allowing the test suite (Jest) to inject a stateless `MockDb` and run assertions without corrupting the real `ats-data.json` file.

## 5. Known Limitations

While robust for MVP and mid-market use cases, the current architecture has the following limitations:

- **In-Memory JSON Database:** The `src/lib/db.js` layer writes to a flat JSON file. This lacks transaction support and will face concurrency/locking issues if deployed in a heavily scaled, multi-node environment.
- **Polling Worker:** The `worker.js` relies on a `setInterval` loop to scan for delayed tasks. A dedicated message broker (like Redis or RabbitMQ) would be vastly more efficient and reliable at scale.
- **Authentication Bypass:** For demonstration and ease of development, the UI currently lacks secure JWT or session-based authentication guards on the API routes.

## 6. Next Steps

To elevate this project from a robust prototype to an enterprise-grade SaaS product, the following upgrades are recommended:

1. **PostgreSQL Migration:** Refactor `src/lib/db.js` to implement an ORM (like Prisma or Drizzle) backed by a managed PostgreSQL instance.
2. **End-to-End (E2E) Testing:** Introduce Cypress or Playwright to automate browser interactions, specifically focusing on validating the React DnD (Drag-and-Drop) Kanban board logic.
3. **Candidate Public "About Us" Page:** Complete the public portal by building the "About Us" routing to enhance employer branding for applicants.
4. **WebSockets for Real-Time Updates:** Replace the current client-side fetching with WebSockets (via Socket.io or Pusher) so multiple recruiters viewing the Kanban board simultaneously see drag-and-drop changes in real-time.
