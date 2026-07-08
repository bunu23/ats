# Core ATS Capabilities

This document outlines how our Applicant Tracking System meets and exceeds modern enterprise recruitment standards.

## 1. Automated Efficiency & Pipeline Management

- **Event-Driven Background Worker:** Complex tasks (like dispatching emails, scheduling delays, and executing SLA checks) are offloaded to an asynchronous Node.js worker process (`worker.js`). This transforms manual hiring processes into automated workflows, ensuring no candidate falls through the cracks while keeping the UI lightning fast.
- **Zero-Friction Progression:** Features an intuitive drag-and-drop Kanban board for immediate pipeline visualization and progression.
- **Safety Guardrails:** Human-in-the-loop checkpoints explicitly block the AI from automatically generating sensitive communications like Offer Letters or late-stage rejection emails, demanding human intervention at crucial Phase 5 moments.

## 2. Amplified Effectiveness with AI

- **Magic Auto-Fill Resume Parser:** The public Careers portal utilizes a mock AI parsing engine to ingest candidate resumes, automatically mapping them to structured form fields to drastically reduce candidate drop-off rates.
- **Robust Pre-Interview Skill Assessments:** The built-in AI service layer integrates with Claude to automatically parse incoming applications. It cross-references the candidate's skills against the specific job requisition to generate a reliable fit score with detailed rationale.
- **Automated Communication:** AI is leveraged to autonomously draft personalized follow-up emails, interview prep guides, and polite rejection notices based on rule-driven pipeline events.

## 3. Improved Visibility and Collaboration

- **Mission Control (Activity Dashboard):** A centralized, transparent hub (`/activity`) that meticulously logs every Automated Action, AI-Generated Email, and System Event in categorized accordions, complete with a dedicated pulsing alert box for High-Priority guardrail notifications.
- **Centralized Dashboards:** The platform provides a global dashboard with high-level funnel metrics, active requisitions, and recent activity logs.
- **Team Touchpoints & Audit Logs:** The Candidate Command Center allows recruiters to view exactly where a candidate is in the pipeline. It features a complete audit trail of every stage movement (tagged by whether a Human or AI moved them) and a hub for team members to drop review notes.

## 4. Enriched User Experience

- **Premium Design:** Built with a modern, dark glassmorphic design system featuring fluid animations, custom typography, and vibrant gradients that ensure an aesthetically pleasing, premium experience for recruiters.
- **Low Friction Application:** The candidate-facing Careers portal (`/careers`) allows for seamless, one-page job applications instantly connected to the internal automation engine.

## 5. Enterprise-Grade Data Integrity

- **Relational Database Engine:** Upgraded from a flat JSON file system to a robust SQLite relational database managed via **Prisma ORM**. This ensures ACID compliance, enables complex cascading deletes, and enforces strict foreign key constraints across candidates, applications, and jobs.
- **Seamless Scalability:** The Data Access Layer abstracts the database implementation, allowing the entire application to be migrated to a managed PostgreSQL instance simply by updating the Prisma connection string, with zero changes required to business logic.
