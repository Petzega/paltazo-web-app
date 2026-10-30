import { test, expect } from '@playwright/test';

test.describe('Paltazo App', () => {
  test('homepage redirects to onboarding or login', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to /onboarding or /login (depending on session)
    await expect(page).toHaveURL(/\/(onboarding|login)/);
  });

  test('onboarding page loads', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check that onboarding marketing page renders
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page shows form', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
