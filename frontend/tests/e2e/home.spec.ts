import { test, expect } from '@playwright/test';

test('has title and hero section', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Entregamais/i);

  // Check for the hero section text
  await expect(page.locator('h1')).toContainText(/Bebida gelada/i);
});

test('shows categories', async ({ page }) => {
  await page.goto('/');
  const categories = page.locator('text=Categorias');
  await expect(categories).toBeVisible();
});
