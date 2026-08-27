# Quarter sheet

Quarter sheet is a deliberately small, local-first quarterly income and expense ledger for UK sole traders working under Making Tax Digital for Income Tax. It helps tutors, freelancers, tradespeople and other self-employed people keep digital records, see the four tax-year periods, map common costs to SA103F categories, and export clean CSV or XLSX files for bridging or HMRC-recognised software.

It does **not** submit to HMRC, provide tax advice, support VAT/payroll, or connect to a bank. Check current HMRC guidance before filing.

## What works

- Income and expense lines with exact GBP amounts, dates, notes and optional local receipt images/PDFs
- UK tax-year quarters (6 April through 5 April), running totals and 7 August/November/February/May deadlines
- SA103F category reference and mappings in each export
- CSV and real XLSX exports suitable for checking/importing into bridging tools
- Passphrase-encrypted whole-ledger backup and destructive-confirmed restore
- IndexedDB persistence, offline app shell, installable PWA manifest and update prompt
- Keyboard and 390px mobile paths, reduced motion, clear empty/loading/error/offline states
- Optional £19 one-time Sociobot supporter unlock; all record keeping and data ownership tools stay free

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

The reproducible production build command is exactly `npm run build`; deploy `dist/` as a static site. `dist/index.html` is the application root, with `dist/privacy/index.html` and `dist/terms/index.html` as legal pages.

Browser tests need Playwright Chromium once per environment:

```sh
npx playwright install chromium
npm run test:e2e
```

The browser suite explicitly reloads the installed app offline and repeats the core path at a 390px viewport.

## Data and privacy

Transactions and receipts live only in IndexedDB on the current browser. Encrypted backups use Web Crypto AES-256-GCM and PBKDF2-SHA-256 (310,000 iterations). There is no analytics or account system. License verification is the only product API request and never includes ledger data. See `/privacy/` and `/terms/`.

For staging, verification defaults to `https://pilot-api.sociobot.in`. Release automation can set `VITE_BILLING_BASE=https://api.sociobot.in`; the product slug is the route key required by the billing contract.

## Export notes

CSV columns are `date`, `type`, `category`, `hmrc_box`, `description`, `amount_gbp`, and `receipt_attached`. XLSX contains the same seven columns and an auto-filter. Receipt binaries are included in encrypted backup files but not spreadsheet exports. Acceptance by a particular bridging tool depends on its current import mapping, so test an export before a deadline.

## License

MIT. Generated artwork is original to this product; prompt and provenance are recorded in `.factory/design.md` and `assets/src/`.
