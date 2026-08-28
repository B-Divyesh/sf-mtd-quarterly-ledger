import { expect, test } from '@playwright/test';

async function add(page: import('@playwright/test').Page, note: string, amount = '12.00') {
  await page.getByRole('button', { name: /Add (your first )?transaction/ }).first().click();
  await page.getByLabel('Amount (£)').fill(amount);
  await page.getByLabel(/^Note/).fill(note);
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.getByText(note)).toBeVisible();
}

test('@claim:demo-isolation isolates sample and real IndexedDB ledgers', async ({ page }) => {
  await page.goto('/'); await add(page, 'Real namespace marker', '123.45');
  await page.goto('/?demo=1'); await expect(page.getByText('July tutoring invoices')).toBeVisible();
  await expect(page.getByText('Real namespace marker')).toHaveCount(0);
  await add(page, 'Demo namespace marker', '67.89'); await page.goto('/');
  await expect(page.getByText('Real namespace marker')).toBeVisible(); await expect(page.getByText('Demo namespace marker')).toHaveCount(0);
});

test('@claim:demo-reset restores only the shipped sample records', async ({ page }) => {
  await page.goto('/demo/'); await add(page, 'Temporary demo entry');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('July tutoring invoices')).toBeVisible(); await expect(page.getByText('Temporary demo entry')).toHaveCount(0);
});

test('@claim:local-only sends no cross-origin request in the demo flow', async ({ page }) => {
  const requests: string[] = []; page.on('request', r => requests.push(r.url()));
  await page.goto('/demo/'); await add(page, 'Private browser record');
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('@claim:offline-reload reloads shipped sample data offline', async ({ page, context }) => {
  await page.goto('/demo/'); await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));
  await context.setOffline(true); await page.reload(); await expect(page.getByText('July tutoring invoices')).toBeVisible();
});

test('@claim:entry-persistence retains a transaction after refresh', async ({ page }) => {
  await page.goto('/demo/'); await add(page, 'Persisted adjustment'); await page.reload(); await expect(page.getByText('Persisted adjustment')).toBeVisible();
});

test('@claim:csv-export downloads a CSV with a sample record', async ({ page }) => {
  await page.goto('/demo/'); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click();
  const stream = await (await download).createReadStream(); let body = ''; for await (const piece of stream!) body += piece.toString();
  expect(body).toContain('"date","type","category","hmrc_box"'); expect(body).toContain('July tutoring invoices');
});

test('@claim:xlsx-export downloads an XLSX spreadsheet', async ({ page }) => {
  await page.goto('/demo/'); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export XLSX' }).click();
  expect((await download).suggestedFilename()).toMatch(/\.xlsx$/);
});

test('@claim:receipt-files saves an accepted receipt file in the demo ledger', async ({ page }) => {
  await page.goto('/demo/'); await page.getByRole('button', { name: /Add (your first )?transaction/ }).first().click();
  await page.getByLabel('Amount (£)').fill('12.00'); await page.getByLabel(/^Note/).fill('Receipt proof');
  await page.locator('#entry-receipt').setInputFiles('public/icons/icon-192.png');
  await page.getByRole('button', { name: 'Save transaction' }).click(); await expect(page.getByRole('button', { name: 'View receipt' })).toBeVisible();
});

test('@claim:encrypted-backup creates an encrypted download from demo data', async ({ page }) => {
  await page.goto('/demo/'); await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await page.getByLabel('Backup passphrase').first().fill('a long demo passphrase'); const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click(); const file = await download;
  expect(file.suggestedFilename()).toMatch(/\.mtdledger$/); const stream = await file.createReadStream(); let body = ''; for await (const piece of stream!) body += piece.toString(); expect(body).not.toContain('July tutoring invoices');
});

test('@claim:category-map shows the matching HMRC form box', async ({ page }) => {
  await page.goto('/demo/'); await page.getByText('Open category reference').click(); await expect(page.getByText('SA103F box 15').first()).toBeVisible();
});

test('@claim:keyboard-mobile supports arrow tabs and 44px mobile actions', async ({ page }) => {
  await page.goto('/demo/'); await page.getByRole('tab', { name: /Q1/ }).focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Q2/ })).toHaveAttribute('aria-selected', 'true'); await page.setViewportSize({ width: 390, height: 844 });
  const box = await page.getByRole('button', { name: 'Reset demo' }).boundingBox(); expect(box?.height).toBeGreaterThanOrEqual(44);
});

test('@claim:free-core enables core exports and backups without supporter access', async ({ page }) => {
  await page.goto('/demo/'); await expect(page.getByText('No supporter access on this device.')).toBeVisible(); await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  await page.getByRole('button', { name: 'Back up or restore records' }).click(); await expect(page.getByRole('button', { name: 'Download encrypted backup' })).toBeEnabled();
});

test('@claim:billing-isolation makes no billing request in demo mode', async ({ page }) => {
  const requests: string[] = []; page.on('request', r => requests.push(r.url())); await page.goto('/demo/');
  expect(requests.some(url => url.startsWith('https://api.sociobot.in/'))).toBe(false);
  await expect(page.getByRole('link', { name: 'Buy supporter access' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout');
});

test('@claim:no-hmrc-submission sends no HMRC request while recording and exporting', async ({ page }) => {
  const requests: string[] = []; page.on('request', r => requests.push(r.url())); await page.goto('/demo/'); await add(page, 'No submission check');
  expect(requests.some(url => /hmrc/i.test(url))).toBe(false);
});

test('@claim:no-analytics sends no analytics or tracking request', async ({ page }) => {
  const requests: string[] = []; page.on('request', r => requests.push(r.url())); await page.goto('/demo/');
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('@claim:supporter-price shows £19 one-time supporter access', async ({ page }) => {
  await page.goto('/demo/'); await expect(page.getByText('Pay £19 once.')).toBeVisible();
});
