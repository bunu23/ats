import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

test.describe('Kanban Pipeline Drag and Drop', () => {
  test.setTimeout(60000); // 60 seconds

  test('should move candidate from Phone Screening to Interview', async ({ page }) => {
    // 0. Seed a deterministic candidate for testing
    const prisma = new PrismaClient();

    // Find an open job or create one
    let job = await prisma.job.findFirst({ where: { status: 'Open' } });
    if (!job) {
      job = await prisma.job.create({
        data: {
          id: 'test-job',
          title: 'Test Job',
          department: 'Test',
          custom_stages: '[]',
          slas: '{}'
        }
      });
    }

    const uniqueName = `E2E Test Candidate ${Date.now()}`;
    const candidate = await prisma.candidate.create({
      data: { name: uniqueName, email: `e2e-${Date.now()}@example.com` }
    });

    await prisma.application.create({
      data: {
        job_id: job.id,
        candidate_id: candidate.id,
        stage: 'Phone Screening', // Target stage
        ai_score: 95 // Ensure they are not locked
      }
    });

    // 1. Authenticate first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@ats.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for the redirect to dashboard
    await page.waitForURL('/');

    // 2. Navigate to the pipeline page
    await page.goto('/pipeline');
    await page.waitForSelector('.kanban-card', { timeout: 45000 });

    // 3. Identify columns by their headers to avoid matching text inside candidate cards
    const sourceColumn = page.locator('.kanban-column', {
      has: page.locator('.kanban-column-header', { hasText: 'Phone Screening' })
    });
    const targetColumn = page.locator('.kanban-column', {
      has: page.locator('.kanban-column-header', { hasText: 'Interview' })
    });

    // 4. Find our specific test candidate
    const candidateCard = sourceColumn.locator('.kanban-card', { hasText: uniqueName });
    await expect(candidateCard).toBeVisible();

    // 5. Drag and Drop
    await page.waitForTimeout(1000);

    // Playwright's dragTo doesn't fully propagate DataTransfer for React,
    // so we manually dispatch the HTML5 drag events
    const sourceHandle = await candidateCard.elementHandle();
    const targetHandle = await targetColumn.elementHandle();

    await page.evaluate(
      ({ source, target }) => {
        const dataTransfer = new DataTransfer();
        source.dispatchEvent(
          new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer })
        );
        target.dispatchEvent(
          new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer })
        );
        target.dispatchEvent(
          new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer })
        );
        target.dispatchEvent(
          new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer })
        );
        source.dispatchEvent(
          new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer })
        );
      },
      { source: sourceHandle, target: targetHandle }
    );

    await page.waitForTimeout(2000); // Wait for optimistic update to render

    // 6. Assert the card is now in the target column
    const movedCard = targetColumn.locator('.kanban-card', { hasText: uniqueName });
    await expect(movedCard).toBeVisible({ timeout: 10000 });

    // And verify it is no longer in the source column
    await expect(sourceColumn.locator('.kanban-card', { hasText: uniqueName })).not.toBeVisible();
  });
});
