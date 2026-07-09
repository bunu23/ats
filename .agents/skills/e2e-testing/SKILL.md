---
name: e2e-testing
description: Guidelines and workarounds for writing Playwright End-to-End (E2E) tests.
---
# E2E Testing (Playwright) Guidelines

When writing or modifying End-to-End tests in the `e2e/` directory, adhere to the following project-specific requirements:

1. **Authentication**: 
   The application uses route-based protection in Next.js Middleware. All E2E tests targeting dashboard routes MUST authenticate first.
   ```typescript
   await page.goto('/login');
   await page.fill('input[type="email"]', 'admin@ats.com');
   await page.fill('input[type="password"]', 'password');
   await page.click('button[type="submit"]');
   await page.waitForURL('/');
   ```

2. **React Native Drag and Drop**:
   Playwright's `.dragTo()` API does not fully support React's reliance on `e.dataTransfer.setData`. To test Kanban board drag-and-drop, you MUST construct and dispatch raw HTML5 `DragEvent`s via `page.evaluate`:
   ```typescript
   await page.evaluate(({ source, target }) => {
     const dataTransfer = new DataTransfer();
     source.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer }));
     target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer }));
   }, { source: sourceHandle, target: targetHandle });
   ```

3. **Deterministic Test Data**:
   Always seed dynamic, unique test data using `PrismaClient` in the test setup. Use timestamps for names/emails (e.g., `Candidate ${Date.now()}`) to prevent locator strict mode violations from previous zombie data.

4. **Test Running**:
   Always run E2E tests using `npm run test:e2e` (which maps to `playwright test`). The standard `npm run test` executes Jest unit tests and is configured to ignore the `e2e/` directory.
