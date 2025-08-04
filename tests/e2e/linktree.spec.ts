import { test, expect } from '@playwright/test';

test.describe('Linktree Generator', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the app before each test
    await page.goto('http://localhost:3000');
  });

  test('should create a linktree with multiple links', async ({ page }) => {
    // Fill first link
    await page.getByPlaceholder('Platform (e.g., Instagram)').first().fill('Instagram');
    await page.getByPlaceholder('URL (e.g., https://instagram.com/username)').first().fill('https://instagram.com/testuser');
    
    // Add second link
    await page.getByRole('button', { name: '+ Add Another Link' }).click();
    await page.getByPlaceholder('Platform (e.g., Instagram)').nth(1).fill('LinkedIn');
    await page.getByPlaceholder('URL (e.g., https://instagram.com/username)').nth(1).fill('https://linkedin.com/in/testuser');
    
    // Fill style description
    await page.getByPlaceholder('Describe your preferred style').fill('Minimalist black and white design with clean lines');
    
    // Submit form (would need auth in real test)
    const submitButton = page.getByRole('button', { name: 'Create Linktree' });
    await expect(submitButton).toBeEnabled();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling anything
    const submitButton = page.getByRole('button', { name: 'Create Linktree' });
    await expect(submitButton).toBeDisabled();
    
    // Fill only platform name
    await page.getByPlaceholder('Platform (e.g., Instagram)').first().fill('Instagram');
    await expect(submitButton).toBeDisabled();
    
    // Add URL
    await page.getByPlaceholder('URL (e.g., https://instagram.com/username)').first().fill('https://instagram.com/test');
    await expect(submitButton).toBeDisabled();
    
    // Add style description
    await page.getByPlaceholder('Describe your preferred style').fill('Simple design');
    await expect(submitButton).toBeEnabled();
  });

  test('should allow adding and removing links', async ({ page }) => {
    // Start with one link
    const linkInputs = page.locator('input[placeholder*="Platform"]');
    await expect(linkInputs).toHaveCount(1);
    
    // Add 3 more links
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '+ Add Another Link' }).click();
    }
    await expect(linkInputs).toHaveCount(4);
    
    // Remove button should appear when more than 1 link
    const removeButtons = page.getByRole('button', { name: 'Remove' });
    await expect(removeButtons).toHaveCount(4);
    
    // Remove one link
    await removeButtons.first().click();
    await expect(linkInputs).toHaveCount(3);
  });

  test('should validate URLs', async ({ page }) => {
    // Fill platform
    await page.getByPlaceholder('Platform (e.g., Instagram)').first().fill('Instagram');
    
    // Try invalid URL
    await page.getByPlaceholder('URL (e.g., https://instagram.com/username)').first().fill('not-a-url');
    await page.getByPlaceholder('Describe your preferred style').fill('Test style');
    
    // Should still be disabled due to invalid URL
    const submitButton = page.getByRole('button', { name: 'Create Linktree' });
    await expect(submitButton).toBeDisabled();
    
    // Fix URL
    await page.getByPlaceholder('URL (e.g., https://instagram.com/username)').first().fill('https://instagram.com/test');
    await expect(submitButton).toBeEnabled();
  });
});