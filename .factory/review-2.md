# Adversarial first-read review 2 — FAIL

Reviewed 28 August 2026 against live production at <https://mtd-quarterly-ledger.sociobot.in/> and repository commit `d1e075055835a50765ffecff0ae85f3d2921bad8`.

## Verdict

**FAIL — 4 blocking findings, 1 major finding, and 1 minor finding.**

The cold first screen, demo isolation, routes, offline path, and accessibility baseline now work. Acceptance still fails because the advertised GBP price contradicts the live USD checkout, the test does not verify that outcome, two visitor promises remain unlisted, and the earlier browser/device terminology finding is only partly fixed.

## First 30 seconds, before scrolling

### 390 × 844

- **What does this do?** It tracks quarterly income and expenses and exports records.
- **For whom?** UK sole traders keeping Making Tax Digital records without a full accounting suite.
- **What should I click first?** **Try it with sample data**. The adjacent line says that this opens a populated quarterly ledger.

Exact visible text was **“Track quarterly income and expenses”**, **“For UK sole traders keeping Making Tax Digital records without a full accounting suite.”**, and **“Try it with sample data”**. The sample action ended at y=556; **Add your first transaction** ended at y=612. All three plain facts and the no-HMRC boundary were also visible by y=786. There was no horizontal overflow and no console or page error.

### 1440 × 900

The same three questions had the same answers. Both first actions and all three plain facts were visible before scrolling. There was no horizontal overflow and no console or page error.

This check passes. Review-1 B3 remains fixed.

## Findings

### F-2-1 — BLOCKING — the promised £19 price is $19 at checkout; review-1 B2 is reopened

**Exact quote/location:** Landing heading **“Support development for £19”** and sentence **“Pay £19 once.”**; README: **“Supporter access costs £19 once…”**; terms: **“Supporter access costs £19 once…”**; `.factory/claims.json` claim `supporter-price`: **“Supporter access costs £19 once through the production Sociobot checkout.”**

**Observed result:** The production link redirects to a live Dodo checkout that renders **“$19.00”**. Its embedded checkout data says `price: 1900` and `currency: "USD"`, not GBP. The final checkout returned HTTP 200.

The declared command passed, but its test only asserts that the local page says **“Pay £19 once.”** and that the link has the production URL. It never follows the link or asserts the checkout currency and amount. The claimed outcome is therefore both untested and false in production.

**Why this misleads a first-time visitor:** A UK sole trader is told the charge is £19 immediately before being sent to a checkout for $19. Currency changes the amount paid and may add card conversion costs.

**Concrete fix:** Configure the production Sociobot product as a one-time GBP 1900 price, or change every product/README/terms/claim reference to the actual USD price. Extend `@claim:supporter-price` to follow or inspect the production checkout response and assert `price === 1900`, `currency === "GBP"`, and `session_type === "one_time"`. Keep this check read-only and stop before payment.

### F-2-2 — BLOCKING — supporter benefits are an unlisted claim; review-1 B2 is reopened

**Exact quote/location:** Landing: **“Get a supporter badge and backup reminders.”** README: **“Supporter access costs £19 once and adds a badge and backup reminders.”** Terms repeats the same benefit.

No `.factory/claims.json` entry claims that paid access adds a badge and backup reminders. `supporter-price` covers price and destination. `license-verification` covers token handling and caching. Neither registered claim names both paid outcomes. The license test happens to observe one due-backup message, but incidental coverage is not a declared claim test.

**Why this misleads a first-time visitor:** These are the only stated paid benefits. A buyer has no acceptance test proving what the purchase unlocks.

**Concrete fix:** Add one `supporter-benefits` claim and exactly one tagged test using a recorded valid verification response. Assert the visible supporter badge, the due reminder when no recent backup exists, and the dated last-backup state after a backup. Alternatively, remove the benefit sentence from the landing page, terms, and README.

### F-2-3 — BLOCKING — “does not provide tax advice” is an unlisted claim; review-1 B2 is reopened

**Exact quote/location:** Landing: **“Quarter sheet does not submit updates to HMRC and does not give tax advice.”** README and terms: **“It does not submit updates to HMRC or provide tax advice.”**

`no-hmrc-submission` lists and tests only the HMRC-submission half. There is no `no-tax-advice` entry or test. The README statement **“Each visitor-facing promise is listed with an executable test in `.factory/claims.json`.”** is consequently false.

**Why this misleads a first-time visitor:** The tax-advice boundary is important for deciding whether category guidance can be relied on. Combining it with a tested statement makes the untested half appear verified.

**Concrete fix:** Add a separate `no-tax-advice` claim and a tagged test that exercises category, totals, entry, export, and support flows and asserts that no tax liability, deductibility decision, filing recommendation, or personalised tax answer is produced. Keep the existing direction to HMRC guidance. If that boundary cannot be tested, remove the claim-like wording.

### F-2-4 — BLOCKING — browser storage is still called device storage; review-1 M3 is reopened

**Exact quote/location:** Header **“Saved on this device”**; first-screen fact **“Stored on this device”**; empty state **“It stays on this device…”**; save status **“Transaction saved on this device.”**; restore warning **“Restore replaces the ledger currently on this device.”** README and privacy instead use **“this browser.”**

Review-1 M3 explicitly required **stored in this browser** as the single visitor term. The code still alternates between browser and device. IndexedDB data is scoped to a browser profile, not to the whole phone or computer.

**Why this misleads a first-time visitor:** “On this device” implies that another browser or profile on the same device will see the records. It will not.

**Concrete fix:** Replace every visitor-facing **this device** occurrence with **this browser**. Use **Saved in this browser**, **Stored in this browser**, and **Restore replaces the ledger currently in this browser**. Add the exact rendered strings to `@claim:local-only` so this terminology cannot regress.

### F-2-5 — MAJOR — there is no bulk transaction import

**Exact location:** The only acquisition path is **Add transaction** one record at a time. README lists manual add/edit/delete and export/backup, but no CSV import. The product explicitly excludes bank feeds, so it has no alternative bulk path.

**Why this limits the real job:** A sole trader arriving at quarter end will commonly have a bank or spreadsheet CSV. Re-entering every transaction manually is avoidable work and makes this much less useful for the stated quarterly-record job.

**Concrete fix:** Add local-only **Import CSV** with a bundled sample file in the demo. Let the user map date, description, amount, and income/expense columns; preview rejected rows; choose a category; detect duplicates; and confirm before writing. Do not add a bank connection or AI. Register and test parsing, preview, duplicate handling, cancellation, demo isolation, and offline import.

### F-2-6 — MINOR — the README exposes storage implementation jargon in its visitor demo section

**Exact quote/location:** README, **Try the demo**: **“The demo uses a separate `demo:` IndexedDB database.”**

**Why this slows a first read:** “IndexedDB” and the key prefix describe implementation, not the safety result a visitor needs. The developer section may name these details; the demo introduction should state the isolation outcome.

**Concrete rewrite:** **“The demo uses separate browser storage, so it never reads or changes your real ledger.”** Keep the exact namespace in `.factory/demo.md`.

## Demo and sandbox verification

The one-click demo itself passes:

- **Try it with sample data** opens `/demo/` in one click.
- The first 390 × 844 screen shows **Sample quarterly ledger**, Q2, £850.00 income, £164.80 expenses, and a £685.20 difference.
- Three realistic records are already present: July tutoring invoices, workshop materials, and client visits.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and exposes **Reset demo** and **Start for real**.
- Adding **Round two temporary marker** and selecting **Reset demo** removed it and restored the seed.
- Adding **Discard on exit round two** and selecting **Start for real** returned to `/`; neither that record nor sample records appeared in the real ledger.
- IndexedDB exposed separate `demo:quarter-sheet-ledger` and `quarter-sheet-ledger` names. The code selects the namespace before opening storage.
- The exercised demo flow made no cross-origin request. Demo mode made no billing request or license write.
- After service-worker installation and network interception, `/demo/` reloaded offline with its seed. CSV and encrypted-backup offline outcomes also passed in the claim test.

Review-1 B1 remains fixed.

## Claim matrix

Every exact command in `.factory/claims.json` was run separately from clean clone `/tmp/mtd-review2-clean.IkL9sV` at the reviewed commit. Each ID occurs exactly once in `tests/e2e/claims.spec.ts`.

| Claim | Declared command | Result |
|---|---|---|
| `demo-isolation` | `npm run test:claims -- --grep @claim:demo-isolation` | PASS |
| `demo-reset` | `npm run test:claims -- --grep @claim:demo-reset` | PASS |
| `local-only` | `npm run test:claims -- --grep @claim:local-only` | PASS |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS |
| `ledger-core` | `npm run test:claims -- --grep @claim:ledger-core` | PASS |
| `entry-persistence` | `npm run test:claims -- --grep @claim:entry-persistence` | PASS |
| `csv-export` | `npm run test:claims -- --grep @claim:csv-export` | PASS |
| `xlsx-export` | `npm run test:claims -- --grep @claim:xlsx-export` | PASS |
| `receipt-files` | `npm run test:claims -- --grep @claim:receipt-files` | PASS |
| `encrypted-backup` | `npm run test:claims -- --grep @claim:encrypted-backup` | PASS |
| `backup-crypto` | `npm run test:claims -- --grep @claim:backup-crypto` | PASS |
| `category-map` | `npm run test:claims -- --grep @claim:category-map` | PASS |
| `quarter-rules` | `npm run test:claims -- --grep @claim:quarter-rules` | PASS |
| `validation` | `npm run test:claims -- --grep @claim:validation` | PASS |
| `keyboard-mobile` | `npm run test:claims -- --grep @claim:keyboard-mobile` | PASS |
| `reduced-motion` | `npm run test:claims -- --grep @claim:reduced-motion` | PASS |
| `free-core` | `npm run test:claims -- --grep @claim:free-core` | PASS |
| `billing-isolation` | `npm run test:claims -- --grep @claim:billing-isolation` | PASS |
| `license-verification` | `npm run test:claims -- --grep @claim:license-verification` | PASS |
| `no-hmrc-submission` | `npm run test:claims -- --grep @claim:no-hmrc-submission` | PASS |
| `no-analytics-account` | `npm run test:claims -- --grep @claim:no-analytics-account` | PASS |
| `no-vat-payroll-bank` | `npm run test:claims -- --grep @claim:no-vat-payroll-bank` | PASS |
| `supporter-price` | `npm run test:claims -- --grep @claim:supporter-price` | **Command PASS; production outcome FAIL — test does not inspect price/currency** |
| `pwa-install` | `npm run test:claims -- --grep @claim:pwa-install` | PASS |
| `route-metadata` | `npm run test:claims -- --grep @claim:route-metadata` | PASS |
| `security-privacy` | `npm run test:claims -- --grep @claim:security-privacy` | PASS |
| `artwork-provenance` | `npm run test:claims -- --grep @claim:artwork-provenance` | PASS |
| `production-build` | `npm run test:claims -- --grep @claim:production-build` | PASS |

Final marker: `CLAIMS_COMPLETE=28 FAILURES=0`. This process result does not override F-2-1: the test omits the claimed checkout outcome, and the live outcome contradicts the claim.

## Copy audit

Counts are whitespace-separated words; hyphenated terms and placeholders count as one. The landing table includes the normal page, demo, dialogs, validation, errors, toasts, offline state, and expanded category reference. Repeated runtime variants are represented with brackets. Headings and controls are audited separately because they are not sentences.

### Landing and product sentences

| Words | Exact sentence | Flag |
|---:|---|---|
| 2 | You’re offline. | Covered by `offline-reload`. |
| 10 | Your ledger still works; exports and local backups are available. | Covered by `offline-reload`. |
| 13 | For UK sole traders keeping Making Tax Digital records without a full accounting suite. | — |
| 7 | Sample data opens a populated quarterly ledger. | Covered by demo claims. |
| 4 | Stored on this device. | **F-2-4**; use **Stored in this browser.** |
| 6 | Works offline after the first visit. | Covered by `offline-reload`. |
| 6 | Core ledger and exports are free. | Covered by `free-core`. |
| 2 | Records only. | — |
| 14 | Quarter sheet does not submit updates to HMRC and does not give tax advice. | **F-2-3** for the second clause. |
| 7 | Add your first income or expense. | — |
| 10 | It stays on this device and appears in your export. | **F-2-4**; use **browser**. Export is covered. |
| 8 | Based on the 2025–26 SA103F, HMRC’s self-employment form. | Covered by `category-map`. |
| 7 | Check current HMRC guidance if unsure. | — |
| 6 | Money earned from your self-employed work. | Covered by `category-map`. |
| 6 | Other receipts not included in turnover. | Covered by `category-map`. |
| 7 | Goods bought for resale or materials used. | Covered by `category-map`. |
| 7 | Payments to subcontractors in the construction industry. | Covered by `category-map`. |
| 6 | Employee wages, salaries and related costs. | Covered by `category-map`. |
| 6 | Business travel and vehicle running costs. | Covered by `category-map`. |
| 6 | Rent, rates, power and business insurance. | Covered by `category-map`. |
| 6 | Repairs and maintenance, not capital purchases. | Covered by `category-map`. |
| 7 | Phone, internet, postage, stationery and office costs. | Covered by `category-map`. |
| 5 | Advertising and business entertainment costs. | Covered by `category-map`. |
| 5 | Business loan and overdraft interest. | Covered by `category-map`. |
| 6 | Bank, card and other finance charges. | Covered by `category-map`. |
| 9 | Amounts included in turnover that will not be recovered. | Covered by `category-map`. |
| 6 | Accountancy, legal and other professional fees. | Covered by `category-map`. |
| 6 | Other business expenses not listed above. | Covered by `category-map`. |
| 5 | Maps to SA103F box [number]. | Covered by `category-map`. |
| 10 | Record money in and out with a date and category. | Covered by `ledger-core`. |
| 8 | See income, expenses, and category mappings together. | Covered by ledger/category claims. |
| 8 | Download CSV or XLSX for your accounting software. | Covered by both export claims. |
| 4 | Pay £19 once. | **F-2-1**; live checkout is $19. |
| 8 | Get a supporter badge and backup reminders. | **F-2-2**; unlisted claim. |
| 7 | Ledger, receipts, backups and exports stay free. | Covered by `free-core`. |
| 6 | No supporter access on this device. | **F-2-4**; use **browser**. |
| 5 | Quarterly records in your browser. | — |
| 6 | Demo — sample data, nothing is saved. | Covered by demo claims. |
| 6 | Date, amount, and category are required. | Covered by `validation`. |
| 7 | Enter a positive amount, for example 48.50. | Covered by `validation`. |
| 6 | Invoice, customer or a short reminder. | Clear field help. |
| 3 | Max 140 characters. | Covered by `validation`. |
| 9 | JPG, PNG, WebP or PDF up to 5 MB. | Covered by `receipt-files`. |
| 3 | Current receipt: [file]. | Covered by `receipt-files`. |
| 7 | Choose another file to replace it. | — |
| 10 | Download an encrypted copy of every tax year and receipt. | Covered by `encrypted-backup`. |
| 7 | Keep the passphrase separately—we cannot recover it. | Covered by `encrypted-backup`. |
| 5 | Use at least 10 characters. | Covered by `validation`. |
| 8 | Restore replaces the ledger currently on this device. | **F-2-4**; use **browser**. |
| 6 | Choose a date for this transaction. | — |
| 12 | Choose a date from [start] to [end] for this quarter. | Covered by `validation`. |
| 11 | Enter a positive amount with no more than two decimal places. | Covered by `validation`. |
| 7 | Choose a category for this transaction type. | Covered by `validation`. |
| 6 | That file type is not supported. | Covered by `receipt-files`. |
| 7 | Choose a JPG, PNG, WebP or PDF. | Covered by `receipt-files`. |
| 6 | That receipt is over 5 MB. | Covered by `receipt-files`. |
| 6 | Choose a smaller image or PDF. | — |
| 6 | This transaction could not be saved. | — |
| 9 | Check that browser storage is available and try again. | — |
| 2 | Transaction updated. | Covered by `ledger-core`. |
| 5 | Transaction saved on this device. | **F-2-4**; use **browser**. |
| 2 | Transaction deleted. | Covered by `ledger-core`. |
| 2 | Transaction restored. | Covered by `ledger-core`. |
| 4 | Delete [transaction] for [amount]? | Covered by `ledger-core`. |
| 3 | Quarter CSV exported. | Covered by `csv-export`. |
| 3 | Quarter XLSX exported. | Covered by `xlsx-export`. |
| 8 | Use a passphrase with at least 10 characters. | Covered by `validation`. |
| 3 | Encrypted backup downloaded. | Covered by `encrypted-backup`. |
| 4 | Keep its passphrase safe. | — |
| 6 | The backup could not be created. | — |
| 9 | Check browser download permissions, then create the backup again. | — |
| 8 | Choose a backup file and enter its passphrase. | — |
| 10 | Replace this device’s [count] transactions with [count] from the backup? | **F-2-4**; use **browser’s**. |
| 3 | [Count] transactions restored. | Covered by `encrypted-backup`. |
| 6 | The backup could not be restored. | — |
| 4 | Supporter access is active. | Covered incidentally; see **F-2-2**. |
| 5 | Your encrypted backup is due. | **F-2-2**. |
| 7 | Your last backup was [28 Aug 2026]. | **F-2-2**. |
| 7 | Supporter access is active while verification completes. | Covered by `license-verification`. |
| 6 | Supporter access could not be verified. | Covered by `license-verification`. |
| 7 | You can buy supporter access again. | — |
| 8 | Connect to the internet to verify supporter access. | Covered by `license-verification`. |
| 6 | A Quarter sheet update is ready. | Covered by PWA tests. |
| 4 | Supporter access restored. | Covered by `license-verification`. |
| 2 | Thank you. | — |
| 6 | Check the token and try again. | — |
| 8 | Paste your supporter access token, then verify it. | — |
| 7 | Your browser may be blocking site data. | — |
| 10 | Allow storage for this site, then reload before entering records. | — |
| 8 | This is not a Quarter sheet backup file. | — |
| 6 | This backup format is not supported. | — |
| 12 | That passphrase did not unlock this backup, or the file is damaged. | — |
| 3 | Sample records reset. | Covered by `demo-reset`. |
| 3 | Quarterly ledger loaded. | — |
| 3 | Demo ledger loaded. | — |

No landing/product sentence exceeds 22 words or uses a banned marketing adjective.

### README sentences, bullets, and headings

| Words | Exact text | Flag |
|---:|---|---|
| 8 | Quarter sheet: quarterly records for UK sole traders | Clear h1. |
| 14 | Track quarterly income and expenses for UK sole traders using Making Tax Digital records. | — |
| 13 | Add transactions, check each quarter, and export CSV or XLSX for accounting software. | — |
| 11 | It does not submit updates to HMRC or provide tax advice. | **F-2-3** for the second clause. |
| 9 | It does not handle VAT, payroll, or bank feeds. | Covered by `no-vat-payroll-bank`. |
| 3 | Try the demo | Clear heading. |
| 4 | Open `/demo/` or `/?demo=1`. | — |
| 9 | It loads tutoring income, materials, and travel sample records. | Covered by demo claims. |
| 8 | The demo uses a separate `demo:` IndexedDB database. | **F-2-6**; jargon. |
| 5 | Reset demo restores its sample. | Covered by `demo-reset`. |
| 11 | Start for real discards demo changes before opening the real ledger. | Covered by `demo-reset`. |
| 2 | Ledger features | Clear heading. |
| 10 | Add, edit, delete, and restore transactions with exact GBP amounts | Covered by `ledger-core`. |
| 13 | Keep optional JPG, PNG, WebP, or PDF receipt files up to 5 MB | Covered by `receipt-files`. |
| 10 | Use tax-year quarters running from 6 April to 5 April | Covered by `quarter-rules`. |
| 8 | Check all 15 HMRC self-employment form category references | Covered by `category-map`. |
| 8 | Download CSV or XLSX with seven documented columns | Covered by export claims. |
| 7 | Restore passphrase-encrypted backups with transactions and receipts | Covered by `encrypted-backup`. |
| 11 | Install a local ledger that works offline after the first visit | Covered by PWA/offline claims. |
| 11 | Each visitor-facing promise is listed with an executable test in `.factory/claims.json`. | False while **F-2-1–F-2-3** remain. |
| 3 | Run and verify | Clear heading. |
| 5 | Requires Node.js 20 or newer. | Covered by `production-build`. |
| 9 | Run every declared claim test from a clean checkout: | — |
| 8 | Run the printed commands one at a time. | — |
| 9 | Browser tests use the pinned Playwright Chromium 1.58.2 release. | Appropriate developer detail. |
| 9 | Deploy the generated `dist/` directory as a static site. | Covered by `production-build`. |
| 13 | It includes the PWA manifest, service worker, `/privacy/`, `/terms/`, and a designed `404.html`. | Appropriate developer detail; covered by build/route claims. |
| 3 | Privacy and support | Clear heading. |
| 7 | Transactions and receipts stay in this browser. | Covered by `local-only`; conflicts with device wording in **F-2-4**. |
| 6 | There are no analytics or accounts. | Covered by `no-analytics-account`. |
| 12 | Supporter access costs £19 once and adds a badge and backup reminders. | **F-2-1** and **F-2-2**. |
| 7 | Ledger, receipts, backups, and exports remain free. | Covered by `free-core`. |
| 12 | Checkout and verification use Sociobot/Dodo; ledger records are never sent with verification. | Covered by billing/license tests. |
| 6 | Read the privacy notice and terms. | — |
| 9 | The artwork prompt and generation provenance are in `.factory/design.md`. | Covered by `artwork-provenance`. |
| 1 | License | Clear heading. |
| 1 | MIT. | Confirmed by `LICENSE`. |

No README sentence exceeds 22 words or uses a banned marketing adjective. The only unexplained visitor-section implementation term is F-2-6; developer-only terms in **Run and verify** are appropriately scoped.

### Headings, terminology, and controls

- The h1 **Track quarterly income and expenses** is five words and states the job.
- The heading outline is h1 → h2 → h3 with no skip. **Your four MTD quarters**, **Quarter 2 ledger**, **How categories appear in your export**, **Keep each quarter ready**, and **Support development for £19** make sense when listed out of context; the last contains the false price in F-2-1.
- Actions name results: **Try it with sample data**, **Add transaction**, **Export CSV**, **Export XLSX**, **Open category reference**, **Buy supporter access on Sociobot**, **Restore supporter access**, **Save transaction**, **Download encrypted backup**, **Restore this backup**, **Verify supporter access**, **Undo deletion**, **Install update**, and **Reload ledger**. Row actions expose transaction-specific accessible names.
- **Cancel**, **Close…**, **Reset demo**, and **Start for real** are conventional scoped actions. No vague **Submit**, **Go**, or **Continue** control was found.
- `transaction`, `quarter`, `supporter access`, `receipt file`, and `accounting software` are consistent. Local-storage terminology fails F-2-4.

## Structure, routing, links, identity, and accessibility

| Check | Result | Evidence |
|---|---|---|
| Titles | PASS | Home: **Quarter sheet — quarterly income and expense ledger**; demo, privacy, terms, and 404 use route-specific patterns and stay under 60 characters. |
| One h1 / landmarks / language | PASS | Every tested route has one h1, one main, header/footer landmarks, and `lang="en-GB"`. |
| Metadata | PASS | Each route has a description, canonical, OG/Twitter fields, SVG favicon, Apple icon, and product-specific 1200 × 630 social art. |
| 404 | PASS | Unknown route returns HTTP 404 with **Page not found — Quarter sheet**, designed blueprint styling, and a route back. |
| Deep links / history / focus | PASS | Direct loads and reloads work. Privacy navigation and browser back focus the destination h1; route announcements are polite. |
| Link crawl | PASS | Every internal content link returns 200. The expected 404-page self-fragment remains 404. Mail links are explicit. The external checkout redirect resolves to HTTP 200, but its currency fails F-2-1. |
| Shared skeleton | PASS | Header and footer are consistent; footer includes one-liner, Privacy, Terms, Param Factory, and build id. Landing order includes hero, product, three steps, boundary, support, and footer. |
| Visual identity | PASS | Blueprint grid, cyan construction rules, cream annotation strips, clipped controls, mono display type, and original drafting-desk art are distinct from a generic SaaS template and match `.factory/design.md`. |
| Mobile / keyboard | PASS | No 390 px overflow; visible targets measure at least 44 px; first actions are above the fold; tabs respond to arrow keys; dialogs and route focus pass. |
| Accessibility automation | PASS | Live axe reported zero serious/critical findings on home, demo, privacy, terms, and 404 at 390 px. The broader local suite checks desktop and mobile. |
| Console | PASS | No console or page errors on cold mobile or desktop loads. |
| Offline / privacy | PASS | Demo reloads offline; normal demo work makes same-origin requests only; no analytics/account flow or embedded provider key was found. |
| Asset budget | PASS | Build output: 36.70 KB raw total JS, 19.95 KB CSS, 14.71 KB font, and 10.33 KB mobile hero. |

Review-1 B4, M1, M2, and m1 remain fixed.

## Earlier finding audit

| Earlier ID | Round-2 result | Live and code confirmation |
|---|---|---|
| B1 — missing/unsafe demo | FIXED | One-click seeded demo, `demo:` database, reset, discard-on-exit, banner, and offline behavior verified. |
| B2 — missing claim registry | **REOPENED / BLOCKING** | Registry and 28 tagged tests exist, but F-2-1 is not an outcome test and F-2-2/F-2-3 remain unlisted. |
| B3 — unclear first screen | FIXED | What, who, and first action are explicit above the 390 px fold. |
| B4 — fallback rendered real ledger | FIXED | `/demo/` is real; unknown paths return the designed status-404 page online and offline. |
| M1 — metadata/skeleton incomplete | FIXED | Route titles, canonical/OG/Twitter metadata, icons, sitemap, navigation, footer, and three-step section verified. |
| M2 — focus/touch targets | FIXED | h1 focus on navigation/back/reload and 44 px target checks pass. |
| M3 — jargon/inconsistent names | **REOPENED / BLOCKING** | Paid/receipt/destination terms are fixed, but F-2-4 still alternates **device** and **browser**; F-2-6 remains in README. |
| m1 — vague action names | FIXED | Transaction-specific accessible names and renamed backup/license/update/undo actions verified in DOM and tests. |

## Quality-gate evidence

From the clean clone:

- `npm ci`: PASS, zero vulnerabilities.
- `npm test`: PASS, 7/7.
- `npm run build`: PASS; `dist/` emitted all routes and PWA files.
- Every claim command: 28/28 process passes, with the substantive `supporter-price` defect described in F-2-1.
- `npm run test:e2e -- --workers=1`: all 68 tests eventually passed. One desktop accessibility run retried after the pinned Chromium process crashed with `SIGSEGV`; its retry and the mobile run passed. Independent live axe checks also passed.
- `/opt/fleet/lib/verify-url.sh`: PASS — HTTP 200, title and `en-GB`, one h1, main present, zero missing alt attributes, zero unnamed buttons, and no console errors.

## AI and missed leverage

No runtime AI feature is present, no provider key is embedded, and no AI feature is needed for this bookkeeping job. Adding inference would not improve the core record workflow. The obvious missing leverage is deterministic CSV import, described in F-2-5; sync is not required for a deliberately local ledger.

## What would make this perfect

1. Make the live checkout currency match the advertised price and test the external outcome, not only the link.
2. Register and test the supporter-benefit and no-tax-advice promises.
3. Use **browser** everywhere for IndexedDB scope and remove `IndexedDB` from the visitor demo paragraph.
4. Add a local, previewed, duplicate-safe CSV import with demo and offline coverage.
5. Rerun this entire review from a fresh context and require zero findings and no Chromium retry.
