# 🚀 ATS Demo Script & Runbook

Welcome to the **Next-Gen Applicant Tracking System**! This runbook is your ultimate guide to executing a flawless, wow-inducing demonstration of the platform's autonomous AI capabilities, custom pipelines, and beautiful glassmorphic UI.

---

## 🛠️ Part 1: Quick Start & Configuration

### 1. Booting the System

You can run the system locally using Node.js or via Docker. To start the local Next.js dev server along with the background automation worker:

```bash
npm run dev
```

Navigate to **`http://localhost:3000`** in your browser to enter the Recruiter Dashboard.

### 2. Enabling Real AI (Optional but Highly Recommended)

By default, the ATS runs in `mock` mode to save API credits. To demonstrate the real AI resume scoring and email generation:

1. Open `.env.local`
2. Change `AI_PROVIDER=mock` to `AI_PROVIDER=claude`
3. Add your Anthropic Key: `ANTHROPIC_API_KEY=sk-ant-...`
4. Restart the server.

---

## 🎬 Part 2: The End-to-End Candidate Journey Walkthrough

This section walks you through the complete lifecycle of a candidate—from the second they apply, to the moment the position is closed.

### Step 1: 📝 The Magic Application (Careers Page)

- **Action:** Open an Incognito window and navigate to `http://localhost:3000/careers`.
- **The Hook:** Click on any Open Job. Demonstrate the **"Magic Auto-Fill"** feature.
- **Talking Point:** _"Notice the glowing cyan box at the top? When a candidate uploads their resume, our AI instantly parses their document and maps it to our structured fields. It eliminates the dreaded 'upload your resume and then type it all out again' problem."_
- **Action:** Click the "Simulate AI Parse" button to watch the form magically populate, then hit submit!

### Step 2: 🤖 Instant AI Screening (Behind the Scenes)

- **What Happens:** The moment the candidate submits, the application routes to `/api/apply`.
- **The Automation:** The **Automation Engine** wakes up in the background. It evaluates the resume against the custom job description and generates a score out of 100 with detailed reasoning.
- **Talking Point:** _"Before the recruiter even refreshes their page, the AI has already read the resume, scored it for fit, and placed the candidate in the 'Applied' pipeline stage."_

### Step 3: 📞 Phone Screening & Autonomous Outreach

- **Action:** Back in the Recruiter Dashboard, open the **Pipeline** tab.
- **Action:** Grab the newly applied candidate card and drag it into the **"Phone Screening"** column.
- **The Hook:** _"Watch what happens when I drop this card. The system detects the stage change and triggers an autonomous background rule."_
- **What Happens:** The system immediately drafts and sends a personalized "Phone Screening Invite" email to the candidate, injecting your Calendly link!

### Step 4: 📅 The Interview Stage & Guardrails

- **Action:** Drag the candidate from Phone Screening into **"Interview"**.
- **The Hook:** Mention the background **Delayed Tasks Engine**.
- **Talking Point:** _"When candidates enter the Interview stage, our system schedules a delayed background task. Exactly 2 hours after their scheduled interview, they will automatically receive a personalized 'Thank You' note. If they sit in this stage too long, our SLAs will escalate their priority to 'Urgent'!"_

### Step 5: 🤝 The Offer & Background Check Simulation

- **Action:** Drag the candidate into the **"Offer"** column.
- **The Hook:** Unlike previous stages, no automated emails go out here.
- **Talking Point:** _"Notice that the system didn't send an automated email? We have a strict 'Phase 5 Guardrail' built in. Offers and final rejections require human intervention. We don't want AI accidentally offering someone a job!"_
- **Action:** Click the **"Simulate Signature"** button directly on their Kanban card to manually push them to the **"Background Check"** stage.

### Step 6: 🎉 Hired! Closing the Loop

- **Action:** In the Background Check column, click the **"Verify & Hire"** button on the candidate's card.
- **What Happens:** The candidate is moved to **"Hired"**!
- **Talking Point:** _"The candidate is officially hired. But our system goes one step further. If you go back to the 'Jobs' dashboard, you'll see this requisition has been automatically marked as 'Closed' because the headcount was fulfilled."_

---

## 🔎 Part 3: Stakeholder Review & Audit Trails

To prove that the AI isn't operating in a "black box," you can show stakeholders exactly how to review the system's decisions.

### 1. 🎛️ Mission Control (Activity & Emails)

- **Action:** Click the **"Activity & Emails"** tab in the sidebar.
- **The Hook:** Show off the beautiful two-column dashboard.
- **Talking Point:** _"This is Mission Control. Instead of annoying popup toasts, all background AI operations are quietly logged here."_
- **Demo:**
  - Expand the **Automated Actions** accordion to show the raw AI Score and evaluation paragraph generated during Step 2.
  - Expand the **AI-Generated Emails** accordion to prove the system sent the Phone Screen invite.
  - Point out the glowing red **High Priority Alerts** box on the right, which catches SLA breaches and simulated Slack Webhooks.

### 2. 🗂️ Candidate Command Center

- **Action:** Go to the **Candidates** tab and click the **"📁 Profile"** button on any candidate.
- **The Hook:** This modal gives stakeholders a complete 360-degree view of a candidate.
- **Demo:**
  - Point out the **Right Column Audit Log**. Show how every single stage movement is tracked and permanently tagged by whether a **HUMAN**, **SYSTEM**, or **AI AGENT** triggered it.
  - Show the **Interviewer Reviews Hub**, where team members can drop their notes for hiring managers to review.

---

## 🧹 Troubleshooting & Resetting

If you want to run the demo again from a perfectly clean slate:

1. Stop the application server (`Ctrl + C`).
2. Delete the local SQLite database file: `rm prisma/dev.db`
3. Push the Prisma schema to generate a fresh database:
   ```bash
   npx prisma db push
   ```
4. Restart the application (`npm run dev`). The system will automatically detect the empty database and run the `seed.js` script to populate a fresh set of dummy jobs and candidates!
