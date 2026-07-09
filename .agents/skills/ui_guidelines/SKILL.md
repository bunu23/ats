---
name: UI Guidelines
description: Read this when modifying Next.js React components, styling, CSS, or any part of the frontend UI.
---

# UI Guidelines

When working on the frontend interface for this ATS project, please adhere to the following rules:

1. **Styling:** Use vanilla CSS. Do NOT use Tailwind CSS or CSS-in-JS solutions.
2. **Markup:** Always use semantic HTML elements for accessibility and structure.
3. **Naming Conventions:** All React component files must use `PascalCase` (e.g., `JobCard.js`).
4. **Global Notifications**: Real-time feedback and system alerts should utilize the global `<SlackToastProvider />`. To trigger a toast, insert an `activity_log` record into the database. Note that the provider uses contextual route filtering (e.g., pipeline-specific alerts only render on `/pipeline`, while global email/slack alerts render everywhere else) to avoid UI clutter.
5. **Next.js 16 Conventions**:
   - The `middleware.js` convention is deprecated. You MUST use the `proxy.ts` (or `proxy.js`) file convention instead for route protection.
6. **Strict TypeScript in React**:
   - **Form Parsing**: When parsing numerical inputs from React state, always explicitly cast to string first to avoid TS union errors: `parseInt(String(value)) || 0`.
   - **Date Arithmetic**: When sorting or subtracting Dates, always append `.getTime()` (e.g., `new Date(a).getTime() - new Date(b).getTime()`) to prevent TS arithmetic type errors.
