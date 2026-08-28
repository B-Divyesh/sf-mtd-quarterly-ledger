# Adversarial first-read review 3 — FAIL

Reviewed 28 August 2026 against live production at <https://mtd-quarterly-ledger.sociobot.in/> and repository commit `b400f6c3667a5a51245d84d8d349fd4f998caa2e`.

## Verdict

**FAIL — 1 blocking finding and 3 minor findings.**

The core job, first screen, demo, storage isolation, offline path, import/export, and accessibility checks pass. Acceptance still fails because review-1 M1 was only partly fixed: the 404 has incomplete Open Graph metadata and a stale footer build label, while the declared route test does not inspect those 404 outcomes. Three smaller copy/evidence defects also remain. PASS requires zero findings and no untested part of a claim.

## Findings

### F-3-1 — BLOCKING — the 404 regresses review-1 M1, and the route claim does not test the promised 404 metadata

**Exact quote/location:** The live home, demo, privacy, and terms footers say **“Built by Param Factory · v1.0.0 · polish 2”**. The live 404 says **“Built by Param Factory · v1.0.0 · polish 1”**. `404.html` has no `<meta property="og:url">`, while every other route has one. The `@claim:route-metadata` test loops through full metadata assertions for home, demo, privacy, and terms only; its 404 branch checks status, title, h1, and focus, but not canonical/Open Graph/Twitter/favicon completeness, footer consistency, or reload.

**Why this fails:** Review-1 M1 required per-route Open Graph metadata and a common footer with a build id. Polish rounds 1 and 2 marked that finding fixed, but the public 404 still identifies itself as the prior build and lacks a standard Open Graph field. The passing claim command overstates its coverage: `.factory/claims.json` says the 404 has distinct metadata and reload behaviour, but the test does not assert either in full. Under the history rule, a half-fixed earlier finding is blocking again.

**Concrete fix:** Add `<meta property="og:url" content="https://mtd-quarterly-ledger.sociobot.in/404.html">`; render the same current build id in every footer from one shared build value; and add the 404 to the complete metadata selector loop in `@claim:route-metadata`. Reload the unknown URL and assert it remains a styled 404 with status 404, then compare the footer build label across all routes.

### F-3-2 — MINOR — the paid price does not name its currency on the page or in the README

**Exact quote/location:** Landing: **“Support development for $19”** and **“Pay $19 once.”** README: **“Supporter access costs $19 once…”** Terms repeats **“Supporter access costs $19 once…”** The claims registry alone says **“$19 USD”**, and the checkout confirms USD.

**Why this is unclear:** A UK visitor can see that the price is not pounds, but `$` does not distinguish US, Canadian, Australian, or another dollar currency. The currency only becomes explicit after leaving for checkout.

**Concrete rewrite:** Use **“Support development for US$19”**, **“Pay US$19 once.”**, and **“Supporter access costs US$19 once…”** everywhere before checkout.

### F-3-3 — MINOR — the README reintroduces an undefined storage term

**Exact quote/location:** README, Ledger features: **“Install a local ledger that works offline after the first visit.”** Elsewhere the product consistently says **“in this browser.”**

**Why this slows a first read:** “Local” can mean nearby, installed, or browser-only. It weakens the otherwise precise explanation of where records live.

**Concrete rewrite:** **“Install Quarter sheet and use it offline after the first visit.”**

### F-3-4 — MINOR — the checked-in copy audit is stale and its stated word-count method is not reproducible

**Exact quote/location:** `.factory/copy-audit.md` says counts are whitespace-separated, but records **“For UK sole traders keeping Making Tax Digital records without a full accounting suite.”** as 13 words instead of 14, **“Stored in this browser.”** as 5 instead of 4, and **“Choose a CSV, check the preview, then add accepted rows to this quarter.”** as 11 instead of 13. It also retains removed copy **“See income, expenses, and category mappings together.”** and does not audit the README.

**Why this matters:** The visitor copy currently stays within the 22-word cap, but the evidence used to certify that result is stale and cannot reliably catch a future regression.

**Concrete fix:** Regenerate `.factory/copy-audit.md` from current rendered/source strings with one documented tokenizer, include the README, remove deleted copy, and test representative counts in CI.

## First 30 seconds, before scrolling

### 390 × 844

- **What does this do?** Tracks quarterly income and expenses and prepares exports.
- **For whom?** UK sole traders keeping Making Tax Digital records without a full accounting suite.
- **What should I click first?** **Try it with sample data**. The adjacent sentence says **“Sample data opens a populated quarterly ledger.”**

The exact h1 is **“Track quarterly income and expenses”**. The audience sentence, sample action, real first action, all three plain facts, and the records-only boundary fit in the first viewport. There is no horizontal overflow or console error.

### 1440 × 900

The same three answers are explicit. Both first actions and the three facts are visible without scrolling. There is no horizontal overflow or console error.

This check passes. Review-1 B3 remains fixed.

## Copy audit

Counts below are whitespace-separated. A displayed em dash surrounded by spaces counts as one token. Bracketed values represent runtime substitutions. No current sentence exceeds 22 words and no banned marketing adjective appears. Findings F-3-2 and F-3-3 are the only visitor-copy flags; F-3-4 concerns the stale checked-in audit.

### Landing, dialogs, and persistent page copy

| Words | Exact copy | Result |
|---:|---|---|
| 2 | You’re offline. | Covered by `offline-reload`. |
| 10 | Your ledger still works; exports and local backups are available. | Covered by `offline-reload`. |
| 7 | Demo — sample data, nothing is saved | Covered by demo isolation/reset. |
| 5 | Quarterly records for sole traders | Clear eyebrow. |
| 14 | For UK sole traders keeping Making Tax Digital records without a full accounting suite. | Clear. |
| 7 | Sample data opens a populated quarterly ledger. | Covered by demo claims. |
| 4 | Stored in this browser | Covered by `local-only`. |
| 6 | Works offline after the first visit | Covered by `offline-reload`. |
| 6 | Core ledger and exports are free | Covered by `free-core`. |
| 2 | Records only. | Clear boundary. |
| 14 | Quarter sheet does not submit updates to HMRC and does not give tax advice. | Covered by two boundary claims. |
| 13 | A blueprint drafting desk with a ledger sheet divided into four measured sections | Purposeful image alt. |
| 6 | This quarter is an empty sheet | Clear empty state. |
| 6 | Add your first income or expense. | Clear. |
| 10 | It stays in this browser and appears in your export. | Covered by local/export claims. |
| 8 | Based on the 2025–26 SA103F, HMRC’s self-employment form. | Acronym is defined. |
| 6 | Check current HMRC guidance if unsure. | Clear boundary. |
| 10 | Record money in and out with a date and category. | Covered by `ledger-core`. |
| 8 | Preview rows and add them to this quarter. | Covered by `csv-import`. |
| 8 | Download CSV or XLSX for your accounting software. | Covered by export claims. |
| 3 | Pay $19 once. | **F-3-2:** name USD. |
| 7 | Get a supporter badge and backup reminders. | Covered by `supporter-benefits`. |
| 7 | Ledger, receipts, backups and exports stay free. | Covered by `free-core`. |
| 6 | No supporter access in this browser. | Clear state. |
| 5 | Quarterly records in your browser. | Covered by `local-only`. |
| 6 | Date, amount, and category are required. | Covered by `validation`. |
| 7 | Enter a positive amount, for example 48.50. | Covered by `validation`. |
| 6 | Invoice, customer or a short reminder. | Clear field help. |
| 3 | Max 140 characters. | Covered by `validation`. |
| 9 | JPG, PNG, WebP or PDF up to 5 MB. | Covered by `receipt-files`. |
| 10 | Download an encrypted copy of every tax year and receipt. | Covered by `encrypted-backup`. |
| 7 | Keep the passphrase separately—we cannot recover it. | Covered by `encrypted-backup`. |
| 5 | Use at least 10 characters. | Covered by `validation`. |
| 8 | Restore replaces the ledger currently in this browser. | Clear warning. |
| 13 | Choose a CSV, check the preview, then add accepted rows to this quarter. | Clear. |
| 9 | Download the sample CSV to see the expected columns. | Clear. |
| 7 | Leave blank to use the choice below. | Clear in field context. |
| 12 | Rows that do not match this category type are shown as rejected. | Clear. |

### Category, validation, status, and error copy

| Words | Exact copy | Result |
|---:|---|---|
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
| 5 | Maps to SA103F box [15–29]. | Covered by `category-map`. |
| 6 | Choose a date for this transaction. | Clear error. |
| 14 | Choose a date from [6 Apr 2026] to [5 Jul 2026] for this quarter. | Covered by `validation`. |
| 11 | Enter a positive amount with no more than two decimal places. | Covered by `validation`. |
| 7 | Choose a category for this transaction type. | Covered by `validation`. |
| 6 | That file type is not supported. | Covered by `receipt-files`. |
| 7 | Choose a JPG, PNG, WebP or PDF. | Clear next action. |
| 6 | That receipt is over 5 MB. | Covered by `receipt-files`. |
| 6 | Choose a smaller image or PDF. | Clear next action. |
| 6 | This transaction could not be saved. | Clear outcome. |
| 9 | Check that browser storage is available and try again. | Clear next action. |
| 2 | Transaction updated. | Covered by `ledger-core`. |
| 5 | Transaction saved in this browser. | Covered by core/local claims. |
| 2 | Transaction deleted. | Covered by `ledger-core`. |
| 2 | Transaction restored. | Covered by `ledger-core`. |
| 4 | Delete [transaction] for [£12.00]? | Specific confirmation. |
| 3 | Quarter CSV exported. | Covered by `csv-export`. |
| 3 | Quarter XLSX exported. | Covered by `xlsx-export`. |
| 8 | Use a passphrase with at least 10 characters. | Covered by `validation`. |
| 3 | Encrypted backup downloaded. | Covered by `encrypted-backup`. |
| 4 | Keep its passphrase safe. | Clear. |
| 6 | The backup could not be created. | Clear outcome. |
| 9 | Check browser download permissions, then create the backup again. | Clear next action. |
| 8 | Choose a backup file and enter its passphrase. | Clear next action. |
| 10 | Replace this browser's [3] transactions with [4] from the backup? | Specific warning. |
| 3 | [4] transactions restored. | Covered by `encrypted-backup`. |
| 6 | The backup could not be restored. | Clear outcome. |
| 4 | Supporter access is active. | Covered by supporter claims. |
| 5 | Your encrypted backup is due. | Covered by `supporter-benefits`. |
| 7 | Your last backup was [28 Aug 2026]. | Covered by `supporter-benefits`. |
| 7 | Supporter access is active while verification completes. | Covered by `license-verification`. |
| 6 | Supporter access could not be verified. | Covered by `license-verification`. |
| 6 | You can buy supporter access again. | Clear next action follows. |
| 8 | Connect to the internet to verify supporter access. | Clear next action. |
| 6 | A Quarter sheet update is ready. | Covered by `pwa-install`. |
| 3 | Supporter access restored. | Covered by `license-verification`. |
| 2 | Thank you. | Clear. |
| 8 | Paste your supporter access token, then verify it. | Clear next action. |
| 6 | Check the token and try again. | Clear next action. |
| 7 | Your browser may be blocking site data. | Clear cause. |
| 10 | Allow storage for this site, then reload before entering records. | Clear next action. |
| 8 | This is not a Quarter sheet backup file. | Clear error. |
| 6 | This backup format is not supported. | Clear error. |
| 12 | That passphrase did not unlock this backup, or the file is damaged. | Clear cause. |
| 3 | Sample records reset. | Covered by `demo-reset`. |
| 7 | Choose a CSV file, then try again. | Clear next action. |
| 12 | That CSV needs a header row and at least one transaction row. | Clear requirement. |
| 7 | Choose a CSV file before previewing it. | Clear next action. |
| 6 | Preview accepted rows before importing them. | Clear next action. |
| 5 | [1] row ready to import. | Covered by `csv-import`. |
| 3 | [1] duplicate skipped. | Covered by `csv-import`. |
| 3 | [1] row rejected. | Covered by `csv-import`. |
| 8 | Row [2]: choose a date in this quarter. | Clear row error. |
| 12 | Row [2]: enter a positive amount with no more than two decimals. | Clear row error. |
| 10 | Row [2]: use income or expense in the type column. | Clear row error. |
| 6 | Row [2]: choose a [income] category. | Clear row error. |
| 6 | [1] transaction imported into this browser. | Covered by `csv-import`. |
| 3 | Quarterly ledger loaded. | Clear live announcement. |
| 3 | Demo ledger loaded. | Clear live announcement. |

### README sentences and bullets

| Words | Exact copy | Result |
|---:|---|---|
| 14 | Track quarterly income and expenses for UK sole traders using Making Tax Digital records. | Clear. |
| 13 | Add transactions, check each quarter, and export CSV or XLSX for accounting software. | Clear. |
| 11 | It does not submit updates to HMRC or provide tax advice. | Covered by boundary claims. |
| 9 | It does not handle VAT, payroll, or bank feeds. | Covered by `no-vat-payroll-bank`. |
| 4 | Open `/demo/` or `/?demo=1`. | Clear. |
| 9 | It loads tutoring income, materials, and travel sample records. | Covered by demo claims. |
| 15 | The demo uses separate browser storage, so it never reads or changes your real ledger. | Covered by `demo-isolation`. |
| 5 | **Reset demo** restores its sample. | Covered by `demo-reset`. |
| 11 | **Start for real** discards demo changes before opening the real ledger. | Covered by `demo-reset`. |
| 10 | Add, edit, delete, and restore transactions with exact GBP amounts | Covered by `ledger-core`. |
| 13 | Keep optional JPG, PNG, WebP, or PDF receipt files up to 5 MB | Covered by `receipt-files`. |
| 10 | Use tax-year quarters running from 6 April to 5 April | Covered by `quarter-rules`. |
| 8 | Check all 15 HMRC self-employment form category references | Covered by `category-map`. |
| 8 | Download CSV or XLSX with seven documented columns | Covered by export claims. |
| 13 | Import a CSV locally, map its columns, preview rejected rows, and skip duplicates | Covered by `csv-import`. |
| 7 | Restore passphrase-encrypted backups with transactions and receipts | Covered by `encrypted-backup`. |
| 11 | Install a local ledger that works offline after the first visit | **F-3-3:** replace “local ledger”. |
| 11 | Each visitor-facing promise is listed with an executable test in `.factory/claims.json`. | F-3-1 leaves part of route metadata untested. |
| 5 | Requires Node.js 20 or newer. | Covered by `production-build` package check. |
| 9 | Run every declared claim test from a clean checkout: | Instruction. |
| 8 | Run the printed commands one at a time. | Instruction. |
| 9 | Browser tests use the pinned Playwright Chromium 1.58.2 release. | Covered by `production-build`. |
| 9 | Deploy the generated `dist/` directory as a static site. | Instruction. |
| 13 | It includes the PWA manifest, service worker, `/privacy/`, `/terms/`, and a designed `404.html`. | Covered by route/PWA/build claims, subject to F-3-1 completeness. |
| 7 | Transactions and receipts stay in this browser. | Covered by `local-only`. |
| 6 | There are no analytics or accounts. | Covered by `no-analytics-account`. |
| 12 | Supporter access costs $19 once and adds a badge and backup reminders. | **F-3-2:** name USD; benefits are tested. |
| 7 | Ledger, receipts, backups, and exports remain free. | Covered by `free-core`. |
| 12 | Checkout and verification use Sociobot/Dodo; ledger records are never sent with verification. | Covered by supporter/license claims. |
| 6 | Read the [privacy notice](/privacy/) and [terms](/terms/). | Both links return 200. |
| 9 | The artwork prompt and generation provenance are in `.factory/design.md`. | Covered by `artwork-provenance`. |
| 1 | MIT. | Matches `LICENSE`. |

### Headings, terminology, and controls

- The h1 is five words and states the job. **Your four MTD quarters**, **How categories appear in your export**, **Keep each quarter ready**, and the dialog headings make sense out of context.
- Transaction, quarter, supporter access, receipt file, accounting software, browser, and sample data are used consistently on the product page. README’s **local ledger** is the one exception in F-3-3.
- Primary and toolbar controls name outcomes: **Try it with sample data**, **Add transaction**, **Import CSV**, **Export CSV**, **Export XLSX**, **Download encrypted backup**, **Restore this backup**, **Preview import**, and **Import accepted rows**. Row controls have record-specific accessible names. No `Submit`, `Go`, or `Continue` control appears.
- The price language is the one precision flag in F-3-2. There are no sentences over 22 words, banned marketing adjectives, or unexplained visitor-facing implementation terms on the live page.

## Demo and sandbox behaviour

The demo itself passes:

- The first-screen **Try it with sample data** link opens `/demo/` in one click.
- At 390 × 844, the first demo screen already shows **Sample quarterly ledger**, Q2, income **£850.00**, expenses **£164.80**, difference **£685.20**, and three transactions: **July tutoring invoices**, **Workshop materials**, and **Client visits**.
- The persistent banner says **“Demo — sample data, nothing is saved”** and exposes **Reset demo** and **Start for real**.
- A temporary £12.34 demo transaction appeared, then **Reset demo** removed it and restored the seed.
- A second demo transaction was discarded by **Start for real**. Neither it nor the sample records appeared in the real ledger. Re-entering the demo restored only the seed.
- Browser inspection showed separate `demo:quarter-sheet-ledger` and `quarter-sheet-ledger` IndexedDB databases. `src/db.ts` selects the namespace before any ledger request; demo preferences use the `demo:` prefix; demo mode skips licence initialisation.
- The exercised live flow made only same-origin requests. After service-worker installation, live `/demo/` reloaded offline with the sample, displayed the offline notice, exported CSV, and downloaded an encrypted backup.

## Claims verification

Every exact command in `.factory/claims.json` was run separately from clean clone `/tmp/mtd-review3-clean.alm9GH` at the reviewed commit. The command result was `CLAIMS_COMPLETE=31 FAILURES=0`. Each ID occurs exactly once in `tests/e2e/claims.spec.ts`.

| Claim | Command result | Independent outcome |
|---|---|---|
| `demo-isolation` | PASS | PASS |
| `demo-reset` | PASS | PASS |
| `local-only` | PASS | PASS |
| `offline-reload` | PASS | PASS |
| `ledger-core` | PASS | PASS |
| `csv-import` | PASS | PASS |
| `entry-persistence` | PASS | PASS |
| `csv-export` | PASS | PASS |
| `xlsx-export` | PASS | PASS |
| `receipt-files` | PASS | PASS |
| `encrypted-backup` | PASS | PASS |
| `backup-crypto` | PASS | PASS |
| `category-map` | PASS | PASS |
| `quarter-rules` | PASS | PASS |
| `validation` | PASS | PASS |
| `keyboard-mobile` | PASS | PASS |
| `reduced-motion` | PASS | PASS |
| `free-core` | PASS | PASS |
| `billing-isolation` | PASS | PASS |
| `license-verification` | PASS | PASS |
| `supporter-benefits` | PASS | PASS |
| `no-hmrc-submission` | PASS | PASS |
| `no-tax-advice` | PASS | PASS |
| `no-analytics-account` | PASS | PASS |
| `no-vat-payroll-bank` | PASS | PASS |
| `supporter-price` | PASS | PASS: checkout showed USD 1900 and one-time session. |
| `pwa-install` | PASS | PASS |
| `route-metadata` | PASS | **INCOMPLETE/FAIL: F-3-1; the 404 branch omits the full metadata, footer, and reload assertions.** |
| `security-privacy` | PASS | PASS |
| `artwork-provenance` | PASS | PASS |
| `production-build` | PASS | PASS |

No additional claim-like landing or README sentence lacks a registry entry. F-3-1 is a coverage defect inside a listed claim, not a missing registry row.

## Earlier-finding regression matrix

| Earlier finding | Live and code confirmation | Round-3 status |
|---|---|---|
| Review-1 B1 — missing/unsafe demo | One-click seeded demo, separate DBs, reset, exit, offline, and no cross-origin request verified. | Fixed. |
| Review-1 B2 — missing claims registry | 31 entries exist; all exact commands passed separately from a clean clone. | Fixed, except the narrower F-3-1 coverage defect. |
| Review-1 B3 — unclear first screen | Job, audience, primary sample action, explanation, and three facts fit at 390 px and desktop. | Fixed. |
| Review-1 B4 — false 200 routes | `/demo/` is real; unknown path returns styled HTTP 404. | Fixed. |
| Review-1 M1 — route metadata/common skeleton | Main routes pass, but 404 lacks `og:url` and has stale **polish 1** footer. | **Regressed/half-fixed: F-3-1, blocking.** |
| Review-1 M2 — route focus/touch targets | H1 focus works on direct load, legal navigation, and browser back after its animation frame; no visible target under 44 px at 390 px. | Fixed. |
| Review-1 M3 — jargon/inconsistent product names | Browser, supporter access, receipt file, and accounting software are consistent on the live product. | Fixed; README’s separate “local ledger” wording is F-3-3. |
| Review-1 m1 — vague action names | Row names include the transaction; update, backup, restore, and undo names are specific. | Fixed. |
| Review-2 F-2-1 — GBP/USD mismatch | Page uses `$19`; production checkout and claim test confirm USD 1900 one-time. | Fixed for amount; F-3-2 asks that USD be explicit before checkout. |
| Review-2 F-2-2 — unlisted supporter benefits | `supporter-benefits` tests badge and both reminder states. | Fixed. |
| Review-2 F-2-3 — unlisted tax-advice boundary | `no-tax-advice` exists and passed. | Fixed. |
| Review-2 F-2-4 — device/browser mismatch | Live and source use **this browser**. | Fixed. |
| Review-2 F-2-5 — no bulk import | Local CSV mapping, preview, rejection, duplicate skip, cancel, confirm, demo isolation, and offline operation passed. | Fixed. |
| Review-2 F-2-6 — README IndexedDB jargon | Demo section states the isolation result; namespaces remain in `.factory/demo.md`. | Fixed. |
| Verification-2 low — generic Undo accessible name | Live control is **Undo deletion**. | Fixed. |

## Structure, links, accessibility, and visual identity

- `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; an unknown path returns 404. Each has one h1, one main, `lang="en-GB"`, a description, canonical, favicon, Apple touch icon, distinct title, and h1 focus. The 404 exception is F-3-1.
- Titles are 51, 20, 23, 21, and 30 characters respectively and follow the route pattern.
- Browser back returns home and focuses **Track quarterly income and expenses** after the route focus frame. Direct links and reloads preserve their routes.
- The crawl found no dead links: `/`, `/demo/`, `/#how-it-works`, `/privacy/`, `/terms/`, `/sample-import.csv`, and `#main` returned 200; the two `mailto:` links are explicit; the production checkout was independently read and returned a valid hosted USD checkout.
- Live Playwright Axe checks found zero serious/critical issues on all five routes. The factory URL verifier reported HTTP 200, no console errors, `lang=en-GB`, one h1, one main, zero missing alt attributes, and zero unnamed buttons. No visible link, button, input, select, or summary was smaller than 44 px at 390 px.
- The blueprint drafting-sheet identity is distinct rather than a generic SaaS template: midnight drafting paper, measured cyan rules, cream annotations, registration marks, a four-panel original desk illustration, and clipped tool-like controls match `.factory/design.md`. The asset provenance, local font, 1200 × 630 social image, and reduced-motion path are present.

## Missed leverage

No additional feature is required by the brief. The product already has the obvious local import/export path: CSV import with mapping and preview, CSV/XLSX exports, receipt files, and encrypted backup/restore. Account sync would contradict the local-first brief unless introduced as a separate explicit choice. An AI feature would add cost and data transfer without improving the core record-entry job, so no Sociobot gateway feature is warranted.

## Verification summary

- Clean clone: all 31 claim commands passed independently.
- `npm test`: 8/8 passed.
- `npm run build`: passed; `dist/` emitted. Total emitted JS is about 41 KB raw, below the 200 KB contract.
- `npm run test:e2e -- --workers=1`: 74/74 passed across desktop and 390 px.
- Live cold mobile/desktop, demo mutation/reset/exit, offline reload/export/backup, network interception, route metadata, focus, touch targets, Axe, URL verifier, and link crawl were exercised separately.

## What would make this perfect

Fix all four findings: complete and test the 404 metadata/footer, name USD in every pre-checkout price, replace **local ledger** in the README, and regenerate the checked-in copy audit with correct counts. Then rerun all 31 claim commands from a clean clone and the live route/copy checks. Nothing else from the brief or prior reviews remains to add.
