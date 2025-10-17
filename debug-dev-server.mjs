import { chromium } from 'playwright';
import { setTimeout as delay } from 'timers/promises';

async function debugDevServer() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log all console messages
  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  
  // Log all errors
  page.on('pageerror', err => console.error(`[PAGE ERROR] ${err}`));
  
  // Log network errors
  page.on('requestfailed', request => {
    console.error(`[NETWORK ERROR] ${request.url()}: ${request.failure().errorText}`);
  });

  try {
    console.log('Waiting for dev server to start...');
    await delay(5000);

    console.log('Navigating to http://localhost:3001/');
    const response = await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    
    console.log(`Response status: ${response.status()}`);
    console.log(`Response URL: ${response.url()}`);

    // Wait a bit for page to fully load
    await delay(2000);

    // Get page content
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Check for errors in the page
    const errors = await page.evaluate(() => {
      return {
        hasErrors: !!window.__ERRORS__,
        bodyHTML: document.body.innerHTML.substring(0, 500),
      };
    });

    console.log('Page loaded successfully');
    console.log('Body HTML (first 500 chars):', errors.bodyHTML);

    // Keep browser open for inspection
    console.log('Browser open for inspection. Press Ctrl+C to exit.');
    await delay(60000);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugDevServer();

