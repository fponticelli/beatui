import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('Button component should be clickable', async ({ page }) => {
    // Navigate to the Storybook page for the Button component
    await page.goto('http://localhost:6006/?path=/story/components-button--primary');
    
    // Find the button in the Storybook iframe
    const frame = page.frameLocator('#storybook-preview-iframe');
    const button = frame.locator('button:has-text("Click me")');
    
    // Verify button is visible
    await expect(button).toBeVisible();
    
    // Click the button
    await button.click();
  });
  
  test('Card component should display content correctly', async ({ page }) => {
    // Navigate to the Storybook page for the Card component
    await page.goto('http://localhost:6006/?path=/story/components-card--default');
    
    // Find the card in the Storybook iframe
    const frame = page.frameLocator('#storybook-preview-iframe');
    const card = frame.locator('.bg-white.rounded-lg');
    
    // Verify card is visible
    await expect(card).toBeVisible();
    
    // Verify card title
    const cardTitle = card.locator('h3');
    await expect(cardTitle).toBeVisible();
    
    // Verify card content
    const cardContent = card.locator('p');
    await expect(cardContent).toBeVisible();
  });
});
