# Core ATS Capabilities

This document outlines how our Applicant Tracking System meets and exceeds modern enterprise recruitment standards.

## 1. Automated Efficiency & Pipeline Management

- **Event-Driven Background Worker:** Complex tasks (like dispatching emails, scheduling delays, and executing SLA checks) are offloaded to an asynchronous Node.js worker process (`worker.js`). This transforms manual hiring processes into automated workflows, ensuring no candidate falls through the cracks while keeping the UI lightning fast.
- **Dynamic SLA Configuration:** Recruiters can globally configure the exact timeout windows for the Stale Sweeper (e.g., how many days a candidate is allowed to sit in the "Interview" stage) directly from the `/settings` UI dashboard. The background worker instantly adopts these rules in real-time.
- **Zero-Friction Progression:** Features an intuitive drag-and-drop Kanban board for immediate pipeline visualization and progression.
- **Safety Guardrails:** Human-in-the-loop checkpoints explicitly block the AI from automatically generating sensitive communications like Offer Letters or late-stage rejection emails, demanding human intervention at crucial Phase 5 moments.

## 2. Amplified Effectiveness with AI

- **✨ Magic Auto-Fill & Resume Parsing:** Whether candidates apply via the public Careers portal or recruiters manually add them via the internal Database modal, they can upload a PDF resume. The AI instantly parses the document, extracting key metadata (Name, Email, Skills, Experience) to auto-fill the forms and reduce manual data entry.
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

---

## 6. Standard Recruitment SLA Benchmarks

Our automation engine is explicitly tuned to follow (and exceed) standard recruitment Service Level Agreements (SLAs). Here is how the system handles the typical industry timeline:

| Candidate Stage                                 | Standard Industry SLA     | 🤖 Automated Trigger / System Best Practice                                                                                                                       |
| :---------------------------------------------- | :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Applied $\rightarrow$ AI Screening**          | ⏳ `< 1 hour`             | ✅ **Fully Automated:** The ingestion pipeline and AI evaluation runs completely asynchronously upon form submission (0 hours).                                   |
| **AI Screening $\rightarrow$ Phone Screen**     | ⏳ `≤ 24 hours`           | ⚡ **Fast-Tracked:** High-matching profiles (Score 9+) are instantly flagged for recruiter approval and automatically advanced to the Interview stage.            |
| **Phone Screen $\rightarrow$ Completed**        | ⏳ `≤ 3 business days`    | 📅 **Nudged:** Driven by candidate availability, but automated 24h & 12h reminders push candidates to show up prepared.                                           |
| **Phone Screen $\rightarrow$ Interview Loop**   | ⏳ `≤ 48 hours`           | 💬 **Slack Integration:** Once advanced, an automated internal Slack nudge ensures engineers submit feedback or prep technical challenges.                        |
| **Interview Loop $\rightarrow$ Final Decision** | ⏳ `3 to 5 business days` | 🧹 **Stale Sweeper:** If a candidate sits in this loop for > 14 days without an update, the system automatically sweeps them out and sends a courteous rejection. |
| **Background Check**                            | ⏳ `1 to 5 business days` | 🕵️ **Third-Party:** Heavily dependent on third-party provider turnaround times (e.g., Checkr, HireRight). _(Upcoming Integration)_                                |
| **Decision $\rightarrow$ Formal Offer**         | ⏳ `≤ 24 hours`           | 🛑 **Guardrail (Manual):** The system explicitly forces a manual stop here. AI is blocked from autonomously sending contracts to prevent hallucinations.          |
| **Offer Extended $\rightarrow$ Signed (Hired)** | ⏳ `2 to 5 business days` | ⏰ **Gentle Reminder:** The automated worker dispatches a gentle email reminder 48 hours before the offer link/window expires.                                    |

### 🛠️ How to Check & Test the SLAs

To verify the SLA automation yourself without waiting days, you can "time travel" the data in the database:

1. **Test the Stale Sweeper (e.g. Applied > 14 Days):**
   - Open the database via Prisma Studio (`npx prisma studio`) or manually edit `prisma/dev.db`.
   - Find an active `Application` currently in the `"Applied"` stage.
   - Edit the `stage_entered_at` timestamp to be **15 days in the past**.
   - Watch your `worker.js` terminal logs. Within 60 seconds, you will see `Auto-Rejected (Stale)` and the candidate will receive a courteous email.
2. **Test the Offer Expiration Reminder (48 hours before):**
   - Move a candidate to the `"Offer"` stage.
   - Modify the `stage_entered_at` to **3 days ago**.
   - When `worker.js` loops, it calculates they are 48 hours away from the default 5-day expiration and will automatically dispatch the `Offer Expiration Reminder` to the Activity Dashboard!
