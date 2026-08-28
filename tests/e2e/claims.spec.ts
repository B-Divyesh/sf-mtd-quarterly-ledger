import { expect, test, type Page } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { strFromU8, unzipSync } from 'fflate';

async function add(page: Page, note: string, amount = '12.00', receipt?: { name: string; mimeType: string; buffer: Buffer }) {
  await page.getByRole('button', { name: /Add (your first )?transaction/ }).first().click();
  await page.getByLabel('Amount (£)').fill(amount);
  await page.getByLabel(/^Note/).fill(note);
  if (receipt) await page.locator('#entry-receipt').setInputFiles(receipt);
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.getByText(note)).toBeVisible();
}

async function downloadedText(download: import('@playwright/test').Download) {
  const stream = await download.createReadStream();
  let body = '';
  for await (const piece of stream!) body += piece.toString();
  return body;
}

test('@claim:demo-isolation keeps sample and real storage separate', async ({ page }) => {
  await page.goto('/');
  await add(page, 'Real namespace marker', '123.45');
  await page.goto('/?demo=1');
  await expect(page.getByText('July tutoring invoices')).toBeVisible();
  await expect(page.getByText('Real namespace marker')).toHaveCount(0);
  await add(page, 'Demo namespace marker', '67.89');
  await page.getByRole('button', { name: 'Import CSV' }).click();
  await page.getByLabel('CSV file').setInputFiles({ name: 'isolated.csv', mimeType: 'text/csv', buffer: Buffer.from('date,description,amount,type\n2026-07-24,Imported demo marker,15.00,income') });
  await page.getByRole('button', { name: 'Preview import' }).click();
  await page.getByRole('button', { name: 'Import accepted rows' }).click();
  await expect(page.getByText('Imported demo marker')).toBeVisible();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((db) => db.name));
  expect(databases).toEqual(expect.arrayContaining(['quarter-sheet-ledger', 'demo:quarter-sheet-ledger']));
  await page.goto('/');
  await expect(page.getByText('Real namespace marker')).toBeVisible();
  await expect(page.getByText('Demo namespace marker')).toHaveCount(0);
  await expect(page.getByText('Imported demo marker')).toHaveCount(0);
});

test('@claim:demo-reset restores the seed and leaving discards demo changes', async ({ page }) => {
  await page.goto('/demo/');
  await add(page, 'Temporary demo entry');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('July tutoring invoices')).toBeVisible();
  await expect(page.getByText('Temporary demo entry')).toHaveCount(0);
  await add(page, 'Discard on exit');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Discard on exit')).toHaveCount(0);
  await page.goto('/demo/');
  await expect(page.getByText('July tutoring invoices')).toBeVisible();
  await expect(page.getByText('Discard on exit')).toHaveCount(0);
});

test('@claim:local-only keeps a transaction and receipt in-browser without cross-origin requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/');
  await add(page, 'Private receipt record', '24.00', { name: 'receipt.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 sample') });
  await page.reload();
  await expect(page.getByText('Private receipt record')).toBeVisible();
  await expect(page.getByRole('button', { name: 'View receipt' })).toBeVisible();
  const origin = new URL(page.url()).origin;
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
});

test('@claim:offline-reload reloads the demo and exports and backs up while offline', async ({ page, context }) => {
  await page.goto('/demo/');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('July tutoring invoices')).toBeVisible();
  const csv = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  await csv;
  await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await page.getByLabel('Backup passphrase').first().fill('offline demo passphrase');
  const backup = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  await backup;
  const missing = await page.goto('/offline-missing-route');
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Quarter sheet');
});

test('@claim:ledger-core adds, edits, totals, deletes, and restores a transaction', async ({ page }) => {
  await page.goto('/demo/');
  await add(page, 'Editing example', '25.50');
  await expect(page.locator('#income-total')).toHaveText('£875.50');
  await page.getByRole('button', { name: 'Edit Editing example transaction' }).click();
  await page.getByLabel(/^Note/).fill('Edited example');
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.getByText('Edited example')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Edited example transaction' }).click();
  await expect(page.getByText('Edited example')).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo deletion' }).click();
  await expect(page.getByText('Edited example')).toBeVisible();
});

test('@claim:csv-import maps columns, previews rejected rows, skips duplicates, cancels, confirms, and works offline', async ({ page, context, request }) => {
  await page.goto('/demo/');
  await page.locator('#tax-year').selectOption('2026');
  await page.getByRole('tab', { name: /Q2/ }).click();
  await page.getByRole('button', { name: 'Import CSV' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Imported invoice')).toHaveCount(0);
  expect(await (await request.get('/sample-import.csv')).text()).toContain('August design retainer');
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Import CSV' }).click();
  await page.getByLabel('CSV file').setInputFiles({ name: 'bank-export.csv', mimeType: 'text/csv', buffer: Buffer.from(['When,Details,Value,Direction', '2026-07-12,Imported invoice,450.00,income', '2026-07-12,Imported invoice,450.00,income', '2026-06-01,Outside quarter,12.00,income'].join('\n')) });
  await page.getByLabel('Date column').selectOption('When');
  await page.getByLabel('Description column').selectOption('Details');
  await page.getByLabel('Amount column').selectOption('Value');
  await page.getByLabel('Income or expense column').selectOption('Direction');
  await page.getByLabel('Category for imported rows').selectOption('turnover');
  await page.getByRole('button', { name: 'Preview import' }).click();
  await expect(page.locator('#import-preview')).toContainText('1 row ready to import.');
  await expect(page.locator('#import-preview')).toContainText('1 duplicate skipped.');
  await expect(page.locator('#import-preview')).toContainText('1 row rejected.');
  await page.getByRole('button', { name: 'Import accepted rows' }).click();
  await expect(page.getByText('Imported invoice')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Imported invoice')).toBeVisible();
});

test('@claim:entry-persistence retains a transaction after refresh', async ({ page }) => {
  await page.goto('/demo/');
  await add(page, 'Persisted adjustment');
  await page.reload();
  await expect(page.getByText('Persisted adjustment')).toBeVisible();
});

test('@claim:csv-export downloads exact columns and one row per visible transaction', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('July tutoring invoices')).toBeVisible();
  const visibleRows = await page.locator('#ledger-state li').count();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const body = await downloadedText(await pending);
  const lines = body.trim().split('\r\n');
  expect(lines[0]).toBe('"date","type","category","hmrc_box","description","amount_gbp","receipt_attached"');
  expect(lines).toHaveLength(visibleRows + 1);
  expect(body).toContain('July tutoring invoices');
});

test('@claim:xlsx-export downloads a valid sheet with exact columns, rows, and filter', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('July tutoring invoices')).toBeVisible();
  const visibleRows = await page.locator('#ledger-state li').count();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export XLSX' }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
  const files = unzipSync(readFileSync((await download.path())!));
  const sheet = strFromU8(files['xl/worksheets/sheet1.xml']);
  for (const heading of ['Date', 'Type', 'Category', 'HMRC box', 'Description', 'Amount GBP', 'Receipt attached']) expect(sheet).toContain(`<t>${heading}</t>`);
  expect((sheet.match(/<row /g) || [])).toHaveLength(visibleRows + 1);
  expect(sheet).toContain('July tutoring invoices');
  expect(sheet).toContain(`<autoFilter ref="A1:G${visibleRows + 1}"/>`);
});

test('@claim:receipt-files accepts four listed formats, persists them, and rejects other or oversized files', async ({ page }) => {
  await page.goto('/demo/');
  for (const receipt of [
    { name: 'one.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff]) },
    { name: 'two.png', mimeType: 'image/png', buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
    { name: 'three.webp', mimeType: 'image/webp', buffer: Buffer.from('RIFFxxxxWEBP') },
    { name: 'four.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') }
  ]) await add(page, `Receipt ${receipt.name}`, '10.00', receipt);
  await page.reload();
  await expect(page.getByRole('button', { name: 'View receipt' })).toHaveCount(4);

  await page.getByRole('button', { name: 'Add transaction' }).click();
  await page.getByLabel('Amount (£)').fill('10.00');
  await page.locator('#entry-receipt').setInputFiles({ name: 'unsafe.txt', mimeType: 'text/plain', buffer: Buffer.from('no') });
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.locator('#entry-error')).toContainText('not supported');
  await page.locator('#entry-receipt').setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.locator('#entry-error')).toContainText('over 5 MB');
});

test('@claim:encrypted-backup hides plaintext, rejects a wrong passphrase, and restores records and receipts', async ({ page }) => {
  await page.goto('/demo/');
  await add(page, 'Receipt before backup', '31.00', { name: 'proof.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF private receipt') });
  await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await page.getByLabel('Backup passphrase').first().fill('a long demo passphrase');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const backup = await pending;
  const backupPath = (await backup.path())!;
  expect(readFileSync(backupPath, 'utf8')).not.toContain('Receipt before backup');
  await page.getByRole('button', { name: 'Close backup and restore' }).click();
  await add(page, 'Remove on restore');
  await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await page.getByLabel('Encrypted backup file').setInputFiles(backupPath);
  await page.getByLabel('Backup passphrase').last().fill('wrong passphrase');
  await page.getByRole('button', { name: 'Restore this backup' }).click();
  await expect(page.locator('#backup-error')).toContainText('did not unlock');
  await page.getByLabel('Backup passphrase').last().fill('a long demo passphrase');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Restore this backup' }).click();
  await expect(page.getByText('Remove on restore')).toHaveCount(0);
  await expect(page.getByText('Receipt before backup')).toBeVisible();
  await expect(page.getByRole('button', { name: 'View receipt' })).toBeVisible();
});

test('@claim:backup-crypto uses AES-256-GCM and PBKDF2-SHA-256 with 310000 iterations', async ({ page }) => {
  await page.addInitScript(() => {
    const subtle = crypto.subtle;
    const derive = subtle.deriveKey.bind(subtle);
    const encrypt = subtle.encrypt.bind(subtle);
    Object.defineProperty(subtle, 'deriveKey', { value: (...args: Parameters<SubtleCrypto['deriveKey']>) => {
      (window as unknown as { cryptoEvidence: Record<string, unknown> }).cryptoEvidence = { derive: args[0] };
      return derive(...args);
    }});
    Object.defineProperty(subtle, 'encrypt', { value: (...args: Parameters<SubtleCrypto['encrypt']>) => {
      const evidence = (window as unknown as { cryptoEvidence: Record<string, unknown> }).cryptoEvidence;
      evidence.encrypt = args[0];
      return encrypt(...args);
    }});
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await page.getByLabel('Backup passphrase').first().fill('crypto evidence passphrase');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  await pending;
  const evidence = await page.evaluate(() => (window as unknown as { cryptoEvidence: { derive: Pbkdf2Params; encrypt: AesGcmParams } }).cryptoEvidence);
  expect(evidence.derive.name).toBe('PBKDF2');
  expect(evidence.derive.hash).toBe('SHA-256');
  expect(evidence.derive.iterations).toBe(310_000);
  expect(evidence.encrypt.name).toBe('AES-GCM');
});

test('@claim:category-map shows all 15 HMRC self-employment form mappings', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByText('Open category reference').click();
  await expect(page.locator('#category-reference > div')).toHaveCount(15);
  for (let box = 15; box <= 29; box += 1) await expect(page.locator('#category-reference').getByText(`SA103F box ${box}`, { exact: true })).toBeVisible();
});

test('@claim:quarter-rules uses 6 April boundaries and the four stated deadlines', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('#tax-year').selectOption('2026');
  const checks = [
    ['Q1', '6 Apr 2026 — 5 Jul 2026', '7 Aug 2026'],
    ['Q2', '6 Jul 2026 — 5 Oct 2026', '7 Nov 2026'],
    ['Q3', '6 Oct 2026 — 5 Jan 2027', '7 Feb 2027'],
    ['Q4', '6 Jan 2027 — 5 Apr 2027', '7 May 2027']
  ];
  for (const [tab, range, deadline] of checks) {
    await page.getByRole('tab', { name: new RegExp(tab) }).click();
    await expect(page.locator('#quarter-range')).toHaveText(range);
    await expect(page.locator('#quarter-deadline')).toContainText(deadline);
  }
});

test('@claim:validation enforces quarter dates, positive pence, note length, and passphrase length', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('#tax-year').selectOption('2026');
  await page.getByRole('tab', { name: /Q1/ }).click();
  await page.getByRole('button', { name: 'Add transaction' }).click();
  await page.locator('#entry-date').evaluate((input: HTMLInputElement) => { input.min = ''; input.max = ''; });
  await page.getByLabel('Date', { exact: true }).fill('2026-07-06');
  await page.getByLabel('Amount (£)').fill('12.345');
  await page.getByLabel(/^Note/).fill('x'.repeat(141));
  expect((await page.getByLabel(/^Note/).inputValue()).length).toBe(140);
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.locator('#entry-error')).toContainText('6 Apr 2026 to 5 Jul 2026');
  await page.getByLabel('Date', { exact: true }).fill('2026-04-06');
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.locator('#entry-error')).toContainText('positive amount');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await page.getByLabel('Backup passphrase').first().fill('short');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  await expect(page.locator('#backup-error')).toContainText('at least 10 characters');
});

test('@claim:keyboard-mobile exposes first actions, arrow tabs, focus, and 44px touch targets at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const sample = await page.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  const addFirst = await page.getByRole('button', { name: 'Add your first transaction' }).boundingBox();
  expect(sample?.y).toBeLessThan(844);
  expect((addFirst?.y || 844) + (addFirst?.height || 0)).toBeLessThanOrEqual(844);
  const smallTargets = await page.locator('a[href], button:not([disabled]), input, select, summary').evaluateAll((nodes) => nodes
    .filter((node) => (node as HTMLElement).offsetParent !== null)
    .map((node) => ({ name: (node.getAttribute('aria-label') || node.textContent || node.getAttribute('name') || node.tagName).trim(), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }))
    .filter((box) => box.width < 43.5 || box.height < 43.5));
  expect(smallTargets).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator('html').evaluate((node) => { node.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.goto('/demo/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sample quarterly ledger');
  const demoIncome = await page.locator('#income-total').boundingBox();
  expect((demoIncome?.y || 844) + (demoIncome?.height || 0)).toBeLessThanOrEqual(844);
  await page.getByRole('tab', { name: /Q1/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Q2/ })).toHaveAttribute('aria-selected', 'true');
});

test('@claim:reduced-motion removes meaningful transitions and spinner loops', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.locator('html').evaluate((node) => getComputedStyle(node).scrollBehavior)).toBe('auto');
  const duration = await page.getByRole('link', { name: 'Try it with sample data' }).evaluate((node) => Number.parseFloat(getComputedStyle(node).transitionDuration));
  expect(duration).toBeLessThanOrEqual(0.001);
});

test('@claim:free-core keeps ledger, receipt, export, and backup controls available without supporter access', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('No supporter access in this browser.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add transaction' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Export XLSX' })).toBeEnabled();
  await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await expect(page.getByRole('button', { name: 'Download encrypted backup' })).toBeEnabled();
});

test('@claim:billing-isolation makes no billing request and stores no license in demo mode', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/?license=must-not-be-used');
  expect(requests.some((url) => url.startsWith('https://api.sociobot.in/'))).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:mtd-quarterly-ledger'))).toBeNull();
});

test('@claim:license-verification stores, strips, verifies, caches, and restores supporter access without ledger data', async ({ page }) => {
  const verificationUrls: string[] = [];
  await page.route('https://api.sociobot.in/**', async (route) => {
    verificationUrls.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/?license=test-supporter-token');
  await expect(page).toHaveURL('/');
  await expect(page.locator('html')).toHaveClass(/supporter/);
  await expect(page.locator('#license-status')).toContainText('encrypted backup is due');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:mtd-quarterly-ledger'))).toBe('test-supporter-token');
  expect(verificationUrls).toHaveLength(1);
  expect(verificationUrls[0]).toContain('/api/v1/products/mtd-quarterly-ledger/verify?license=test-supporter-token');
  expect(verificationUrls[0]).not.toMatch(/transaction|receipt|amount/i);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/supporter/);
  expect(verificationUrls).toHaveLength(1);
});

test('@claim:supporter-benefits shows the supporter badge and both backup reminder states', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) }));
  await page.goto('/?license=benefit-token');
  await expect(page.getByText('SUPPORTER', { exact: true })).toBeVisible();
  await expect(page.locator('#license-status')).toContainText('Your encrypted backup is due.');
  await page.getByRole('button', { name: 'Back up or restore records' }).click();
  await page.getByLabel('Backup passphrase').first().fill('supporter benefit passphrase');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  await pending;
  await expect(page.locator('#license-status')).toContainText('Your last backup was');
});

test('@claim:no-hmrc-submission sends no HMRC request while recording and exporting', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/');
  await add(page, 'No submission check');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  await pending;
  expect(requests.some((url) => /hmrc/i.test(url))).toBe(false);
});

test('@claim:no-tax-advice produces records and files, not personal tax calculations or advice', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByText('Open category reference').click();
  await add(page, 'No advice check');
  await page.getByRole('button', { name: 'Import CSV' }).click();
  await expect(page.getByText('Choose a CSV, check the preview, then add accepted rows to this quarter.')).toBeVisible();
  await page.getByRole('button', { name: 'Close CSV import' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csv = await downloadedText(await pending);
  const visibleText = await page.locator('main').innerText();
  expect(`${visibleText}\n${csv}`).not.toMatch(/tax due|deductible|you should file|tax liability|personalised tax/i);
});

test('@claim:no-analytics-account has no account flow, tracker, or third-party request', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/');
  const origin = new URL(page.url()).origin;
  expect(requests.every((url) => new URL(url).origin === origin)).toBe(true);
  await expect(page.getByRole('button', { name: /sign in|create account/i })).toHaveCount(0);
  await expect(page.locator('script[src*="analytics"], script[src*="segment"], script[src*="gtag"]')).toHaveCount(0);
});

test('@claim:no-vat-payroll-bank exposes no VAT, payroll, or bank connection workflow', async ({ page }) => {
  await page.goto('/');
  for (const name of [/connect.*bank/i, /run.*payroll/i, /submit.*vat/i]) await expect(page.getByRole('button', { name })).toHaveCount(0);
});

test('@claim:supporter-price verifies the one-time US$19 production checkout without payment', async ({ page, request }) => {
  await page.goto('/demo/');
  await expect(page.getByText('Pay US$19 once.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy supporter access on Sociobot' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout');
  const statuses: number[] = [];
  let checkout = await request.get('https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout', { maxRedirects: 5, timeout: 30_000 });
  statuses.push(checkout.status());
  for (let attempt = 1; checkout.status() !== 200 && attempt < 3; attempt += 1) {
    await page.waitForTimeout(attempt * 750);
    checkout = await request.get('https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout', { maxRedirects: 5, timeout: 30_000 });
    statuses.push(checkout.status());
  }
  expect(checkout.status(), `Production checkout responses: ${statuses.join(', ')}`).toBe(200);
  const body = await checkout.text();
  expect(body).toContain('Pay in <!-- -->USD');
  expect(body).toMatch(/\\?"session_type\\?"\s*:\s*\\?"one_time\\?"/);
  expect(body).toMatch(/\\?"price\\?"\s*:\s*1900\s*,\s*\\?"currency\\?"\s*:\s*\\?"USD\\?"/);
});

test('@claim:pwa-install exposes a standalone manifest, complete icons, and an offline worker', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toMatch(/^\/?\?v=/);
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192' }),
    expect.objectContaining({ sizes: '512x512', purpose: 'any' }),
    expect.objectContaining({ sizes: '512x512', purpose: 'maskable' })
  ]));
  const worker = await (await request.get('/sw.js')).text();
  expect(worker).toContain("'/demo/'");
  expect(worker).toContain("'/offline.html'");
});

test('@claim:route-metadata gives real routes distinct metadata, focus, navigation, reloads, and a true 404', async ({ page, request }) => {
  const routes: Array<[path: string, status: number, title: string, canonical: string]> = [
    ['/', 200, 'Quarter sheet — quarterly income and expense ledger', 'https://mtd-quarterly-ledger.sociobot.in/'],
    ['/demo/', 200, 'Demo — Quarter sheet', 'https://mtd-quarterly-ledger.sociobot.in/demo/'],
    ['/privacy/', 200, 'Privacy — Quarter sheet', 'https://mtd-quarterly-ledger.sociobot.in/privacy/'],
    ['/terms/', 200, 'Terms — Quarter sheet', 'https://mtd-quarterly-ledger.sociobot.in/terms/'],
    ['/definitely-not-a-real-route', 404, 'Page not found — Quarter sheet', 'https://mtd-quarterly-ledger.sociobot.in/404.html']
  ];
  const footerLabels = new Set<string>();
  for (const [path, status, title, canonical] of routes) {
    expect((await request.get(path)).status()).toBe(status);
    const initial = await page.goto(path);
    expect(initial?.status()).toBe(status);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    for (const selector of ['meta[name="description"]', 'meta[property="og:type"]', 'meta[property="og:url"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:image"]', 'link[rel="icon"]', 'link[rel="apple-touch-icon"]']) await expect(page.locator(selector), `${path} ${selector}`).toHaveCount(1);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toBeFocused();
    footerLabels.add((await page.locator('footer [data-build-label]').textContent())?.trim() || '');
    const reloaded = await page.reload();
    expect(reloaded?.status()).toBe(status);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toBeFocused();
  }
  expect(footerLabels).toEqual(new Set(['Built by Param Factory · v1.0.0 · polish 3']));
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('@claim:security-privacy serves restrictive headers and only self-hosted scripts, fonts, and images', async ({ page, request }) => {
  const response = await request.get('/');
  expect(response.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  await page.goto('/');
  const origin = new URL(page.url()).origin;
  const assetUrls = await page.locator('script[src], link[rel="stylesheet"], link[rel="preload"], img[src], source[srcset]').evaluateAll((nodes) => nodes.flatMap((node) => {
    const value = node.getAttribute('src') || node.getAttribute('href') || node.getAttribute('srcset');
    return value ? [value] : [];
  }));
  expect(assetUrls.every((value) => new URL(value.split(' ')[0], origin).origin === origin)).toBe(true);
});

test('@claim:artwork-provenance retains the original image, prompt, and production derivatives', async () => {
  const design = readFileSync('.factory/design.md', 'utf8');
  const prompt = JSON.parse(readFileSync('assets/src/quarterly-drafting-desk.json', 'utf8')) as { prompt?: string };
  expect(design).toContain('factory-image');
  expect(prompt.prompt).toContain('blueprint drafting table');
  for (const file of ['assets/src/quarterly-drafting-desk.png', 'src/assets/quarterly-drafting-desk-mobile.webp', 'src/assets/quarterly-drafting-desk.webp', 'public/quarter-sheet-social.png']) expect(statSync(file).size).toBeGreaterThan(0);
  const social = readFileSync('public/quarter-sheet-social.png');
  expect([social.readUInt32BE(16), social.readUInt32BE(20)]).toEqual([1200, 630]);
});

test('@claim:production-build emits complete static routes within the performance budgets', async () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { engines?: { node?: string }; devDependencies?: Record<string, string> };
  expect(packageJson.engines?.node).toBe('>=20');
  expect(packageJson.devDependencies?.['@playwright/test']).toBe('1.58.2');
  for (const file of ['dist/index.html', 'dist/demo/index.html', 'dist/privacy/index.html', 'dist/terms/index.html', 'dist/404.html', 'dist/sw.js', 'dist/manifest.webmanifest', 'dist/sample-import.csv']) expect(statSync(file).size).toBeGreaterThan(0);
  const assets = readdirSync('dist/assets').map((name) => ({ name, bytes: statSync(`dist/assets/${name}`).size }));
  expect(assets.filter((item) => item.name.endsWith('.js')).reduce((sum, item) => sum + item.bytes, 0)).toBeLessThanOrEqual(200 * 1024);
  expect(assets.filter((item) => item.name.endsWith('.css')).reduce((sum, item) => sum + item.bytes, 0)).toBeLessThanOrEqual(50 * 1024);
  expect(assets.filter((item) => item.name.endsWith('.woff2')).reduce((sum, item) => sum + item.bytes, 0)).toBeLessThanOrEqual(120 * 1024);
  expect(assets.find((item) => item.name.includes('mobile') && item.name.endsWith('.webp'))?.bytes).toBeLessThanOrEqual(300 * 1024);
});
