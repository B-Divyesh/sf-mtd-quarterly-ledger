import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('logs a transaction and survives an offline reload', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Track quarterly income/);
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

test('dialogs manage focus and keyboard submission', async ({ page }) => {
  await page.goto('/demo/');
  const opener = page.getByRole('button', { name: 'Add transaction' });
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Amount (£)')).toBeFocused();
  await page.getByLabel('Amount (£)').fill('19.25');
  await page.getByLabel(/^Note/).fill('Keyboard entry');
  await page.getByRole('button', { name: 'Save transaction' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Keyboard entry')).toBeVisible();
  await expect(opener).toBeFocused();
});

test('refuses a date outside the selected quarter even when HTML bounds are bypassed', async ({ page }) => {
  await page.goto('/');
  await page.locator('#tax-year').selectOption('2026');
  await page.getByRole('tab', { name: /Q1/ }).click();
  await page.getByRole('button', { name: 'Add transaction' }).click();
  // This emulates a script or a browser which does not enforce min/max. The
  // app must still refuse 6 July, which is Q2's first day.
  await page.locator('#entry-date').evaluate((input: HTMLInputElement) => { input.min = ''; input.max = ''; });
  await page.getByLabel('Date', { exact: true }).fill('2026-07-06');
  await page.getByLabel('Amount (£)').fill('10.00');
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.locator('#entry-error')).toContainText('6 Apr 2026 to 5 Jul 2026');
  await expect(page.locator('#entry-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('tab', { name: /Q2/ }).click();
  await expect(page.getByText('£10.00')).toHaveCount(0);
});

test('uses the production Sociobot checkout', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Pay US$19 once.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy supporter access on Sociobot' })).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout'
  );
});

test('has no serious accessibility issues or load errors on every route', async ({ page }) => {
  for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/definitely-not-a-real-route']) {
    const errors: string[] = [];
    const recordPageError = (error: Error) => errors.push(error.message);
    const recordConsoleError = (message: import('@playwright/test').ConsoleMessage) => { if (message.type() === 'error') errors.push(message.text()); };
    page.on('pageerror', recordPageError);
    page.on('console', recordConsoleError);
    await page.goto(path);
    if (path === '/' || path === '/demo/') await expect(page.locator('#ledger-state')).not.toContainText('Opening your ledger');
    const result = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')), path).toEqual([]);
    const unexpectedErrors = path.includes('definitely-not-a-real-route') ? errors.filter((message) => !message.includes('status of 404')) : errors;
    expect(unexpectedErrors, path).toEqual([]);
    page.off('pageerror', recordPageError);
    page.off('console', recordConsoleError);
  }
});
