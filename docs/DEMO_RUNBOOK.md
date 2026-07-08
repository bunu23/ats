# ATS Demo Script & Runbook

Welcome to the Applicant Tracking System! This runbook is designed to guide you through a flawless demonstration of the platform's core capabilities, specifically highlighting the autonomous AI features.

---

## Part 1: Quick Start Configuration

### 1. Booting the System

You can start the system locally or via Docker. For the smoothest demo, Docker is recommended.

```bash
docker compose up -d
```

Navigate to **`http://localhost:3000`** in your browser.

### 2. Enabling Real AI (Optional but Recommended)

By default, the ATS runs in `mock` mode to save API credits. To show real AI resume scoring:

1. Open `.env.local`
2. Change `AI_PROVIDER=mock` to `AI_PROVIDER=claude`
3. Add your key: `ANTHROPIC_API_KEY=sk-ant-api03...`
4. Restart the servers/containers.

---

## Part 2: The Walkthrough

### Step 1: Creating a Custom Job Requisition

- **Action:** Click on "Jobs" in the sidebar, then click "Create Job".
- **Talking Point:** "Notice how we aren't locked into a global pipeline. For a Senior Developer role, we can add a custom 'Technical Assessment' stage right between Phone Screening and Interview."
- **Action:** Fill out the form, add your custom stages, and save.

### Step 2: Configuring the Automation Rules

- **Action:** Click on "Email Templates" in the sidebar.
- **Talking Point:** "Here is where the recruiter configures the exact messaging they want the AI to send on their behalf."
- **Action:** Show the dropdown toggling between "Automated Templates" and "Manual Templates". Enter a fake Calendly link in the "Recruiter Profile" section so the dynamic `{{calendly_link}}` variable populates.

### Step 3: Simulating a Candidate Application

- **Action:** Open an Incognito window and navigate to `http://localhost:3000/careers`.
- **Talking Point:** "This is the public portal. Watch what happens when a candidate applies."
- **Action:** Fill out the application. Use a resume description that perfectly matches the job you created.
- **Behind the Scenes:** As soon as you hit submit, the API hits the Anthropic AI. It scores the resume and logs the "Instant Confirmation" email to the Activity log.

### Step 4: The Kanban Board (Triggering the Engine)

- **Action:** Go back to your recruiter window and click "Pipeline". Select the job you just applied for from the dropdown.
- **Talking Point:** "The candidate is sitting in 'Applied' with a high AI score. Let's move them to Phone Screening."
- **Action:** Drag and drop the candidate card into the "Phone Screening" column.
- **Behind the Scenes:** You will immediately trigger the Rules Engine. The engine detects the stage change, queries the database for active rules, and automatically dispatches the `phone_screening_invite` email template containing your Calendly link.
- **Action (Testing Guardrails):** Try to drag a candidate _backwards_ into a previous stage. The UI will instantly block the action, enforcing forward-only progression.

### Step 5: Validating the Activity Log

- **Action:** Click "Activity & Emails" in the sidebar.
- **Talking Point:** "We don't want AI operating in a black box. Complete transparency is critical."
- **Action:** Click on the "Candidate Applied" row to expand the accordion and reveal the exact AI Score and the AI's paragraph explaining _why_ it gave that score. Next, click the "Email Sent" row to prove the phone screening invite was dispatched with the correct variables injected.

---

## Troubleshooting & Resetting

If you want to run the demo again from a clean slate:

1. Stop the application.
2. Delete the `data/ats-data.json` file.
3. Restart the application. It will automatically re-seed itself with default clean data on the next boot!
