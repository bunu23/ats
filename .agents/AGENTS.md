# ATS Project Rules

*Note: Specific domain rules (UI, Backend, and Automation) have been separated into "Skills" located in the `.agents/skills/` directory. The agent will automatically read those files when relevant.*

## Architecture
- Next.js 16 App Router (JavaScript)
- Prisma ORM backed by PostgreSQL and Docker (`docker-compose up -d`) for persistence
- AI service layer with mock/real LLM support
- Event-driven automation engine via Dependency Injection and BullMQ / Redis background worker
- Playwright E2E Testing for UI interactions

## Pipeline Stages & Customization
- **Industry-Agnostic Jobs**: Jobs are entirely customizable. Every single Job has its own `custom_stages` array defined upon creation instead of a hardcoded global pipeline.
- The standard fallback stages are typically: Applied -> AI Screening -> Phone Screening -> Interview -> Background Check -> Offer -> Hired -> Rejected.

## AI & Automation Guardrails
- **100-Point AI Scoring**: AI evaluates resumes on a 100-point scale.
- **Auto-Reject Guardrail**: Candidates scoring `< 60` are locked out (disabled draggability) and must remain in Applied/Rejected.
- **Fast-Tracking**: Candidates scoring `> 85` are fast-tracked automatically.
- **Late-Stage Guardrails**: Automated offer letters and late-stage rejections are explicitly blocked and require a human touch.

## Next.js Framework Rules
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
