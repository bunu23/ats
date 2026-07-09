# 🚀 Autonomous Applicant Tracking System (ATS)

An intelligent, autonomous Applicant Tracking System built with Next.js 16, designed to automate recruitment workflows using AI evaluation, state machines, and background event dispatchers.

## 📖 Project Overview

This Next-Gen ATS removes the manual overhead of moving candidates through a pipeline. By combining a beautiful glassmorphic UI with a headless Automation Engine, the system reads resumes, scores candidates on a 100-point scale, and autonomously drives pipeline stages based on dynamic knockout rules.

- **Automated Resume Parsing:** AI extracts fields directly from candidate uploads.
- **Autonomous Pipeline Progression:** Candidates are automatically moved to Screening or Phone Screen stages based on AI evaluation scores.
- **Event-Driven Workflows:** Background tasks handle scheduling, "Empathy Delay" rejection emails, and SLA escalations.

## ⚡ Quick Start Guide

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation & Setup

1. **Clone & Install**

   ```bash
   npm install
   ```

2. **Database & Cache Setup (Docker)**
   The project uses PostgreSQL and Redis for persistence and queues, orchestrated via Docker.

   ```bash
   docker-compose up -d
   npx prisma db push
   # A seed script will run automatically to populate dummy jobs and candidates
   ```

3. **Run the Development Server & Background Worker**
   ```bash
   npm run dev
   # In a separate terminal, run the BullMQ worker:
   npx tsx worker.ts
   ```
   Navigate to `http://localhost:3000` to enter the Recruiter Dashboard.

## ⚙️ Core State Machine Layout

The ATS architecture bridges a vertical backend automation engine with a horizontal frontend workspace.

**Vertical Automation Engine (Backend)**

1. **Ingestion (`/api/apply`):** Resumes are parsed via `src/lib/ai-service.js`.
2. **AI Evaluation:** AI generates a 100-point fit score and detailed reasoning.
3. **Knockout Rules:** `AutomationRule` models evaluate the score dynamically.
4. **Event Dispatch:** `src/lib/automation-engine.ts` creates `ActivityLog` entries and queues BullMQ jobs (e.g., sending emails via the background worker).

**Horizontal Recruiter Workspace (Frontend Pipeline)**

- **Applied ➔ AI Screening:** Auto-advanced if Score > 60.
- **Phone Screen:** Fast-tracked if Score > 85.
- **Interview Loop:** Automated "Thank You" SLAs triggered post-interview.
- **Offer Management:** Strict manual guardrails prevent AI from sending job offers.
- **Hired / Rejected:** Updates requisition capacity and archives candidates.

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` to configure the application:

```env
# AI Provider Settings ('mock' or 'claude')
# In 'mock' mode, the system simulates AI evaluations to save API credits.
AI_PROVIDER=mock

# Anthropic API Key (Required if AI_PROVIDER='claude')
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional Database Override (defaults to postgresql://postgres:postgres@localhost:5432/ats in Prisma)
# DATABASE_URL=
# REDIS_URL=
```

## 🛡️ Quality Gates

This repository enforces strict quality and formatting standards via Husky pre-commit hooks:

- **Linting:** `npm run lint` (ESLint configuration in `eslint.config.mjs`)
- **Formatting:** `npm run format` (Prettier configuration in `.prettierrc`)
- **Testing:** `npm run test` (Jest test suite configured in `jest.config.mjs`, covering core Automation Engine logic in `__tests__/`)

The `lint-staged` hook automatically runs `eslint --fix` and `prettier --write` against staged `.js`, `.jsx`, `.mjs`, `.json`, `.css`, and `.md` files before every commit.
