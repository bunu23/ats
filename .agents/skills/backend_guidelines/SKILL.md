---
name: Backend Guidelines
description: Read this when modifying Next.js API routes, database connections, or any server-side logic (excluding the automation engine).
---

# Backend Guidelines

When working on the backend API or data layer for this ATS project, please adhere to the following rules:

1. **API Responses:** All API routes must return a consistent JSON structure: `{ success: boolean, data?: any, error?: string }`
2. **Data Access:** All database queries must go through the helper functions in `src/lib/db.js`. Do not write raw queries in the API controllers.
3. **Date Formatting:** All dates must be stored and handled as ISO 8601 strings.
4. **Naming Conventions**: All utility and helper files must use `camelCase` (e.g., `formatDate.js`).
5. **Prisma TypeScript Payloads**:
   - When extracting complex Prisma types with relational includes, do not pass raw objects into the generic. Always constrain it using `DefaultArgs`:
     - **INCORRECT**: `Prisma.ApplicationGetPayload<{ include: { candidate: true } }>`
     - **CORRECT**: `Prisma.ApplicationGetPayload<Prisma.ApplicationDefaultArgs & { include: { candidate: true } }>`
