import puppeteer from 'puppeteer';
import path from 'path';

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // Set fake session cookie to bypass middleware
  await page.setCookie({
    name: 'ats_session',
    value: 'mock_session_123',
    domain: 'localhost',
    path: '/'
  });

  const routes = [
    { path: '/login', name: '00_Login.png' },
    { path: '/', name: '01_Dashboard.png' },
    { path: '/pipeline', name: '02_Pipeline_Kanban.png' },
    { path: '/candidates', name: '03_Candidate_Database.png' },
    { path: '/activity', name: '04_Mission_Control.png' },
    { path: '/automation', name: '05_Automation_Rules.png' },
    { path: '/jobs', name: '06_Jobs.png' },
    { path: '/settings', name: '07_Settings.png' },
    { path: '/careers', name: '08_Careers_Portal.png' }
  ];

  for (const route of routes) {
    console.log(`Navigating to ${route.path}...`);
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
      // Wait an extra second for animations to settle
      await new Promise(r => setTimeout(r, 1000));
      const outPath = path.join(process.cwd(), 'docs', 'images', route.name);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Saved screenshot: ${outPath}`);
    } catch (e) {
      console.error(`Failed to screenshot ${route.path}:`, e.message);
    }
  }

  await browser.close();
}

run().catch(console.error);
