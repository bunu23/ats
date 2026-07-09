---
name: Automation & AI Guidelines
description: Read this when working on the dynamic rules engine, background workers, or the AI service layer.
---

# Automation & AI Guidelines

When working on the business logic, background workers, or AI service layer, adhere to the following rules:

## AI Abstraction
- All AI calls must go through the `src/lib/ai-service.ts` abstraction layer.

## AI Integration Pattern
The AI service layer (`src/lib/ai-service.ts`) provides a unified interface:
- `generateFollowUpEmail(candidate, job, stage)` — generates personalized stage-appropriate emails
- `scoreCandidate(candidate, job)` — evaluates candidate fit and provides reasoning
- `generateInterviewQuestions(candidate, job)` — generates role-specific interview questions

**Mock vs Real LLM:**
The default implementation uses intelligent mock responses for speed and safety. 
To switch to a real LLM:
1. Set `AI_PROVIDER=claude` in `.env.local`
2. Set `ANTHROPIC_API_KEY=your-key` in `.env.local`
