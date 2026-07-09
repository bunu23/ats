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
- **Demo Tip:** You can upload any PDF named `First_Last_Resume.pdf`. The dynamic AI parser will automatically extract the name from the filename instead of hardcoding a generic user, making the demo extremely realistic!
- **Action:** Click the "Simulate AI Parse" button to watch the form magically populate, then hit submit!

### Step 2: 🤖 Instant AI Screening (Behind the Scenes)

- **What Happens:** The moment the candidate submits, the application routes to `/api/apply`.
- **The Automation:** The **Automation Engine** wakes up in the background. It evaluates the resume against the custom job description and generates a score out of 100 with detailed reasoning. The prompt that goes to the LLM requests scores on a 100-point scale so real AI API calls map perfectly to the pipeline rules.
- **The Logic Engine:** Here is how the AI evaluating a new application now drives the pipeline automatically:
  1. **Score < 59 (Below Threshold):** The candidate gets caught by the guardrail. They are flagged for rejection, and the system queues the "Empathy Delay" rejection email to automatically send 48 hours later.
  2. **Score 60 to 85 (Good Fit):** The candidate is automatically advanced to the "Screening" column, prompting recruiters to review their application or send them a screening assignment.
  3. **Score > 85 (Exceptional Fit):** The candidate is fast-tracked straight to the "Phone Screening" stage, bypassing the initial manual review.
- **UI Highlight:** Point out the color-coded **AI Fit Badges** that appear on every candidate card and profile: 🟢 Exceptional Fit (Green), 🔵 Good Fit (Blue), and 🔴 Below Threshold (Red). This makes the pipeline visually skimmable.
- **Talking Point:** _"Before the recruiter even refreshes their page, the AI has already read the resume, scored it for fit, and autonomously driven the pipeline—either fast-tracking top talent or respectfully pausing unqualified applicants."_

### Step 3: 📞 Pipeline Guardrails & Autonomous Outreach

- **Action:** Back in the Recruiter Dashboard, open the **Pipeline** tab.
- **The Guardrail Hook:** Try to drag a candidate with a **Red Badge (< 60 Score)**. The card is visually dimmed, the cursor turns to a 🚫, and dragging is disabled!
- **Talking Point:** _"Our AI doesn't just make suggestions; it enforces compliance. Below-threshold candidates are locked into the Auto-Reject flow and cannot be manually dragged forward by a recruiter, enforcing our strict hiring standards."_
- **Action:** Grab a qualified candidate card and drag it into the **"Phone Screening"** column.
- **The Automation Hook:** _"Watch what happens when I drop this card. The system detects the stage change and triggers an autonomous background rule."_
- **What Happens:** Without refreshing the page, a sleek **Blue Email Toast** (✉️) will pop up at the bottom right of the screen confirming a personalized Calendly invite was drafted and sent to the candidate.

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

### 1. 🎛️ Mission Control (Activity & Emails)

- **Action:** Click the **"Activity & Emails"** tab in the sidebar.
- **The Hook:** Show off the beautiful two-column dashboard with sticky headers and smoothly scrolling content.
- **Talking Point:** _"This is Mission Control. Instead of annoying popup toasts, all background AI operations are quietly and accurately logged here."_
- **Demo:**
  - Expand the **Automated Actions** accordion to show the raw AI Score and evaluation paragraph generated during Step 2. Notice that the delayed rejections correctly route here instead of cluttering urgent alerts.
  - Expand the **AI-Generated Emails** accordion to prove the system sent the Phone Screen invite.
  - Point out the glowing red **High Priority Alerts** box on the right, which catches SLA breaches. Notice the sleek **Purple** styling for Slack webhook notifications, differentiating them from urgent system errors!

### 2. 🗂️ Candidate Command Center

- **Action:** Go to the **Candidates** tab and click the **"📁 Profile"** button on any candidate.
- **The Hook:** This modal gives stakeholders a complete 360-degree view of a candidate.
- **Demo:**
  - Point out the **Right Column Audit Log**. Show how every single stage movement is tracked and permanently tagged by whether a **HUMAN**, **SYSTEM**, or **AI AGENT** triggered it.
  - Show the **Interviewer Reviews Hub**, where team members can drop their notes for hiring managers to review.

---

## 🧹 Troubleshooting & Resetting

If you wish to completely wipe the database and start the demo from scratch, follow these steps:

1. Stop the Next.js server and `worker.ts`.
2. Tear down the database containers and volumes: `docker-compose down -v`
3. Bring the clean database back up: `docker-compose up -d`
4. Run the Prisma push command: `npx prisma db push`
   - _Note: This automatically runs the `seed.ts` script to populate dummy jobs and candidates._
5. Inject the default email templates: `node scripts/add-email-templates.mjs`
6. Restart the Next.js server (`npm run dev`) and `worker.ts`.
