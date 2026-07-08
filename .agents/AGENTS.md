# ATS Project Rules

*Note: Specific domain rules (UI, Backend, and Automation) have been separated into "Skills" located in the `.agents/skills/` directory. The agent will automatically read those files when relevant.*

## Architecture
- Next.js 16 App Router (JavaScript)
- JSON File storage via `data/ats-data.json` for persistence
- AI service layer with mock/real LLM support
- Event-driven automation engine via Dependency Injection

## Pipeline Stages
1. Applied — candidate submitted application
2. Screening — recruiter reviewing application
3. Interview — scheduled for interview
4. Offer — offer extended
5. Hired — offer accepted
6. Rejected — application rejected (can happen from any stage)

## Next.js Framework Rules
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
