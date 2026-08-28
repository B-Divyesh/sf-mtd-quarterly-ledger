# Quarter sheet: quarterly records for UK sole traders

Track quarterly income and expenses for UK sole traders using Making Tax Digital records. Add transactions, check each quarter, and export CSV or XLSX for accounting software.

It does not submit updates to HMRC or provide tax advice. It does not handle VAT, payroll, or bank feeds.

## Try the demo

Open `/demo/` or `/?demo=1`. It loads tutoring income, materials, and travel sample records. The demo uses a separate `demo:` IndexedDB database. **Reset demo** restores its sample. **Start for real** opens the empty real ledger.

## Ledger features

- Transactions with dates, GBP amounts, notes, and optional receipt files
- Tax-year quarters running from 6 April to 5 April
- HMRC self-employment form category references
- CSV and XLSX downloads
- Passphrase-encrypted backups
- A local ledger that works offline after the first visit

Each visitor-facing promise is listed with an executable test in `.factory/claims.json`.

## Run and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
```

Run every declared claim test from a clean checkout:

```sh
node -e "const c=require('./.factory/claims.json'); for (const x of c) console.log(x.test)"
```

Run the printed commands one at a time. Browser tests use Playwright Chromium 1.58.2.

Deploy the generated `dist/` directory as a static site. It includes the PWA manifest, service worker, `/privacy/`, `/terms/`, and a designed `404.html`.

## Privacy and support

Transactions and receipts stay in this browser. There are no analytics or accounts. Supporter access costs £19 once and adds a badge and backup reminders. Ledger, receipts, backups, and exports remain free. Checkout and verification use Sociobot/Dodo; ledger records are never sent with verification.

Read the [privacy notice](/privacy/) and [terms](/terms/). Generated artwork is original to this product; its prompt and provenance are in `.factory/design.md`.

## License

MIT.
