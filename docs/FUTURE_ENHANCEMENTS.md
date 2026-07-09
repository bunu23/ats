# Future Enhancements

This document tracks identified gaps and areas for future investment to elevate the ATS to a comprehensive enterprise-grade solution.

## 1. Infrastructure & Reliability Scaling

- **Enterprise-Scale Architecture**
  - _Current State:_ The application relies on standard React state management and implicit JSON API parsing, running locally within individual browser sessions.
  - _Future State:_ Implement TanStack Query for robust server state caching, integrate Zod for strict runtime API schema validation, and introduce WebSockets for real-time collaborative recruiting across multiple recruiter sessions.

## 2. AI-Assisted Job Creation

- **Dynamic Job Descriptions**
  - _Current State:_ Recruiters must manually draft job titles, descriptions, and define custom pipeline stages from scratch when creating a new job requisition.
  - _Future State:_ Implement a generative AI tool that assists recruiters by automatically drafting keyword-rich, SEO-optimized job descriptions and suggesting pipeline stages based on industry trends.

## 3. Global Hiring & Globalization

- **Multiple Language Support (i18n)**
  - _Current State:_ The frontend Recruiter dashboard and the public Careers portal are supporting only single-locale recruiting.
  - _Future State:_ Introduce internationalization (i18n) routing to both the candidate-facing portal and the internal dashboard to support distributed, global talent pools.

## 4. Expanded Integrations

- **Social Media & Third-Party Screening**
  - _Current State:_ Candidates must manually fill out application forms and upload resumes. Screening relies entirely on the internal 100-point AI resume evaluation engine.
  - _Future State:_ Implement integrations with social networks for one-click "Apply with LinkedIn" to reduce friction, and connect the pipeline to external APIs for automated pre-employment background and drug screenings.

## 5. Advanced Candidate Engagement

- **Mobile-First Chatbots**
  - _Current State:_ Candidates apply via a static web form on the `/careers` portal, with no real-time assistance or FAQ routing available during the process.
  - _Future State:_ Deploy a mobile-first, candidate-facing AI chatbot on the Careers page to handle FAQs, collect preliminary information, and provide live, conversational support during the application process.

## 6. Hyper-Automation (Removing Manual Recruiter Work)

- **Autonomous Interview Scheduling**
  - _Current State:_ The background worker simulates a 24-hour reminder email containing a static, hardcoded Calendly link from the Recruiter's settings profile.
  - _Future State:_ Integrate directly with Google Calendar / Outlook APIs. When a candidate is dragged to the "Interview" stage, the system will autonomously cross-reference the hiring manager's calendar, generate a dynamic single-use booking link, and handle the scheduling sync.

- **Automated Talent Pool Mining**
  - _Current State:_ The AI Evaluation engine only scores candidates at the exact moment they submit a new application.
  - _Future State:_ When a _new_ Job Requisition is opened, the AI will proactively scan the database of past rejected candidates, identify individuals whose skills match the new requirements, and automatically dispatch sourcing emails.

- **Autonomous Reference Checking**
  - _Current State:_ Recruiters must manually collect references via phone calls or external emails, and there is no database model for third-party reference data.
  - _Future State:_ The ATS will automatically email references with a secure, mobile-friendly questionnaire. The AI will ingest the responses, summarize them, and attach the summary directly to the candidate's profile.

- **E-Signature & Offer Automation**
  - _Current State:_ Due to the "Phase 5 Guardrail," automated job offers are explicitly blocked. Recruiters must manually click a "Simulate Signature" button to bypass the guardrail.
  - _Future State:_ Integrate with DocuSign or PandaDoc APIs. Once a recruiter manually approves the offer, the system will automatically pull the candidate's negotiated salary and start date into a legal PDF template and dispatch it for e-signature.

- **AI Interview Summarization**
  - _Current State:_ The UI features an "Interviewer Reviews Hub," but it requires human recruiters to manually type their feedback and notes after an interview.
  - _Future State:_ Integrate with Zoom or Google Meet to automatically ingest raw interview transcripts. The AI will summarize the candidate's strengths, weaknesses, and red flags, appending the notes directly into the Reviews Hub.
