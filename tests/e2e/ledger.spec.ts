import { expect, test } from '@playwright/test';

test('logs a transaction and survives an offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Your tax year/);
  await page.getByRole('button', { name: 'Add transaction' }).click();
  await page.getByLabel('Amount (£)').fill('250.75');
  await page.getByLabel(/Note/).fill('Website project');
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.getByText('Website project')).toBeVisible();
  await expect(page.locator('#income-total')).toHaveText('£250.75');
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), undefined, { timeout: 15_000 });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Website project')).toBeVisible();
  await expect(page.getByText(/You’re offline/)).toBeVisible();
});

test('legal pages and keyboard quarter tabs are available', async ({ page }) => {
  await page.goto('/');
  const first = page.getByRole('tab', { name: /Q1/ });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Q2/ })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy notice');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use');
});
