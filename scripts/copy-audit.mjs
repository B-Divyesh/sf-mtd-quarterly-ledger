import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = (file) => readFileSync(resolve(root, file), 'utf8');

/** Count the same way the audit explains: every whitespace-separated token is one word. */
export function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}

const entries = [
  ['Landing and product copy', 'index.html', 'You’re offline.'],
  ['Landing and product copy', 'index.html', 'Your ledger still works; exports and local backups are available.'],
  ['Landing and product copy', 'index.html', 'Demo — sample data, nothing is saved', 'Demo</strong> — sample data, nothing is saved'],
  ['Landing and product copy', 'index.html', 'Quarterly records for sole traders'],
  ['Landing and product copy', 'index.html', 'Track quarterly income and expenses'],
  ['Landing and product copy', 'index.html', 'For UK sole traders keeping Making Tax Digital records without a full accounting suite.'],
  ['Landing and product copy', 'index.html', 'Sample data opens a populated quarterly ledger.'],
  ['Landing and product copy', 'index.html', 'Stored in this browser'],
  ['Landing and product copy', 'index.html', 'Works offline after the first visit'],
  ['Landing and product copy', 'index.html', 'Core ledger and exports are free'],
  ['Landing and product copy', 'index.html', 'Quarter sheet does not submit updates to HMRC and does not give tax advice.'],
  ['Landing and product copy', 'index.html', 'Opening your ledger…'],
  ['Landing and product copy', 'index.html', 'Based on the 2025–26 SA103F, HMRC’s self-employment form.'],
  ['Landing and product copy', 'index.html', 'Check current HMRC guidance if unsure.'],
  ['Landing and product copy', 'index.html', 'Record money in and out with a date and category.'],
  ['Landing and product copy', 'index.html', 'Preview rows and add them to this quarter.'],
  ['Landing and product copy', 'index.html', 'Download CSV or XLSX for your accounting software.'],
  ['Landing and product copy', 'index.html', 'Support development for US$19'],
  ['Landing and product copy', 'index.html', 'Pay US$19 once.'],
  ['Landing and product copy', 'index.html', 'Get a supporter badge and backup reminders.'],
  ['Landing and product copy', 'index.html', 'Ledger, receipts, backups and exports stay free.'],
  ['Landing and product copy', 'index.html', 'No supporter access in this browser.'],
  ['Landing and product copy', 'index.html', 'Quarterly records in your browser.'],
  ['Forms, validation, and status copy', 'index.html', 'Date, amount, and category are required.'],
  ['Forms, validation, and status copy', 'index.html', 'Enter a positive amount, for example 48.50.'],
  ['Forms, validation, and status copy', 'index.html', 'Invoice, customer or a short reminder.'],
  ['Forms, validation, and status copy', 'index.html', 'JPG, PNG, WebP or PDF up to 5 MB.'],
  ['Forms, validation, and status copy', 'index.html', 'Download an encrypted copy of every tax year and receipt.'],
  ['Forms, validation, and status copy', 'index.html', 'Keep the passphrase separately—we cannot recover it.'],
  ['Forms, validation, and status copy', 'index.html', 'Use at least 10 characters.'],
  ['Forms, validation, and status copy', 'index.html', 'Restore replaces the ledger currently in this browser.'],
  ['Forms, validation, and status copy', 'index.html', 'Choose a CSV, check the preview, then add accepted rows to this quarter.'],
  ['Forms, validation, and status copy', 'index.html', 'Download the sample CSV'],
  ['Forms, validation, and status copy', 'index.html', 'Rows that do not match this category type are shown as rejected.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'This quarter is an empty sheet'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Add your first income or expense.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'It stays in this browser and appears in your export.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Choose a date for this transaction.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Enter a positive amount with no more than two decimal places.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Choose a category for this transaction type.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'That file type is not supported.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Choose a JPG, PNG, WebP or PDF.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'That receipt is over 5 MB.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Choose a smaller image or PDF.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'This transaction could not be saved.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Check that browser storage is available and try again.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Transaction updated.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Transaction saved in this browser.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Transaction deleted.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Transaction restored.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Quarter CSV exported.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Quarter XLSX exported.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Encrypted backup downloaded.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Keep its passphrase safe.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'The backup could not be created.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Check browser download permissions, then create the backup again.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Choose a backup file and enter its passphrase.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'The backup could not be restored.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Supporter access is active while verification completes.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Supporter access could not be verified.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'You can buy supporter access again.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Connect to the internet to verify supporter access.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'A Quarter sheet update is ready.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Supporter access restored.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Thank you.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Your browser may be blocking site data.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Allow storage for this site, then reload before entering records.'],
  ['Forms, validation, and status copy', 'src/main.ts', 'Sample records reset.'],
  ['README', 'README.md', 'Track quarterly income and expenses for UK sole traders using Making Tax Digital records.'],
  ['README', 'README.md', 'Add transactions, check each quarter, and export CSV or XLSX for accounting software.'],
  ['README', 'README.md', 'It does not submit updates to HMRC or provide tax advice.'],
  ['README', 'README.md', 'It does not handle VAT, payroll, or bank feeds.'],
  ['README', 'README.md', 'It loads tutoring income, materials, and travel sample records.'],
  ['README', 'README.md', 'The demo uses separate browser storage, so it never reads or changes your real ledger.'],
  ['README', 'README.md', 'Reset demo restores its sample.', '**Reset demo** restores its sample.'],
  ['README', 'README.md', 'Start for real discards demo changes before opening the real ledger.', '**Start for real** discards demo changes before opening the real ledger.'],
  ['README', 'README.md', 'Add, edit, delete, and restore transactions with exact GBP amounts'],
  ['README', 'README.md', 'Keep optional JPG, PNG, WebP, or PDF receipt files up to 5 MB'],
  ['README', 'README.md', 'Use tax-year quarters running from 6 April to 5 April'],
  ['README', 'README.md', 'Check all 15 HMRC self-employment form category references'],
  ['README', 'README.md', 'Download CSV or XLSX with seven documented columns'],
  ['README', 'README.md', 'Import a CSV locally, map its columns, preview rejected rows, and skip duplicates'],
  ['README', 'README.md', 'Restore passphrase-encrypted backups with transactions and receipts'],
  ['README', 'README.md', 'Install Quarter sheet and use it offline after the first visit'],
  ['README', 'README.md', 'Each visitor-facing promise is listed with an executable test in `.factory/claims.json`.'],
  ['README', 'README.md', 'Transactions and receipts stay in this browser.'],
  ['README', 'README.md', 'There are no analytics or accounts.'],
  ['README', 'README.md', 'Supporter access costs US$19 once and adds a badge and backup reminders.'],
  ['README', 'README.md', 'Ledger, receipts, backups, and exports remain free.'],
  ['README', 'README.md', 'Checkout and verification use Sociobot/Dodo; ledger records are never sent with verification.'],
  ['Legal copy', 'privacy/index.html', 'Quarter sheet stores transactions, notes and receipt files in your browser.'],
  ['Legal copy', 'privacy/index.html', 'We do not receive, view or sync this ledger data.'],
  ['Legal copy', 'privacy/index.html', 'The ledger works offline after the first visit.'],
  ['Legal copy', 'terms/index.html', 'It does not submit updates to HMRC or provide tax advice.'],
  ['Legal copy', 'terms/index.html', 'Supporter access costs US$19 once for a supporter badge and backup reminders.'],
  ['Legal copy', '404.html', 'The address does not point to a Quarter sheet page.']
].map(([section, file, text, needle = text]) => ({ section, file, text, needle }));

const banned = /\b(leverage|seamless|effortless|robust|powerful|intuitive|reimagine|supercharge|unlock|delightful|journey|ecosystem|AI-powered)\b/iu;

function validate() {
  const missing = entries.filter(({ file, needle }) => !source(file).includes(needle));
  if (missing.length) throw new Error(`Copy-audit source mismatch: ${missing.map(({ file, needle }) => `${file}: ${needle}`).join(' | ')}`);
  const overlong = entries.filter(({ text }) => wordCount(text) > 22);
  if (overlong.length) throw new Error(`Copy-audit sentences over 22 words: ${overlong.map(({ text }) => text).join(' | ')}`);
  const bannedCopy = entries.filter(({ text }) => banned.test(text));
  if (bannedCopy.length) throw new Error(`Copy-audit banned words: ${bannedCopy.map(({ text }) => text).join(' | ')}`);
}

export function auditRows() {
  validate();
  return entries.map((entry) => ({ ...entry, words: wordCount(entry.text) }));
}

function markdown() {
  const rows = auditRows();
  const sections = [...new Set(rows.map(({ section }) => section))];
  const body = sections.map((section) => {
    const sectionRows = rows.filter((row) => row.section === section);
    return `## ${section}\n\n| Words | Source | Current copy |\n|---:|---|---|\n${sectionRows.map((row) => `| ${row.words} | \`${row.file}\` | ${row.text.replaceAll('|', '\\|')} |`).join('\n')}`;
  }).join('\n\n');
  return `# Copy audit\n\nGenerated by \`node scripts/copy-audit.mjs\` on 28 August 2026. The tokenizer counts each whitespace-separated token as one word; punctuation and markdown punctuation remain part of that token. Each row is checked against its listed current source before this file is written.\n\n${body}\n\n## Result\n\n${rows.length} current strings are audited. No audited sentence exceeds 22 words or contains a banned marketing word. The README is included; removed copy is not retained.\n\n## Terminology\n\n| Concept | Product word |\n|---|---|\n| Income or expense item | transaction |\n| Reporting period | quarter |\n| Optional paid state | supporter access |\n| Uploaded proof | receipt file |\n| Export destination | accounting software |\n| Local storage | stored in this browser |\n| Trial content | sample data |\n`;
}

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(auditRows())}\n`);
} else if (process.argv.includes('--check')) {
  auditRows();
} else {
  writeFileSync(resolve(root, '.factory/copy-audit.md'), markdown());
}
