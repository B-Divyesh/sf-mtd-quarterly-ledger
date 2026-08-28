# Adversarial first-read review 4 — PASS

Reviewed 28 August 2026 against live production at <https://mtd-quarterly-ledger.sociobot.in/> and repository commit `30ecbfbdcdb2750e0d62e3558461aa306fa7f75f`.

## Verdict

**PASS.** There are zero blocking, major, or minor findings. All 31 declared claims were exercised from a fresh clone; all passed. No landing-page or README promise was found without a corresponding registry entry and observable test.

## First 30 seconds, before scrolling

### 390 × 844

- **What it does:** Tracks quarterly income and expenses and provides CSV/XLSX exports.
- **For whom:** UK sole traders keeping Making Tax Digital records without a full accounting suite.
- **What to click first:** **Try it with sample data**. The adjacent text says **“Sample data opens a populated quarterly ledger.”**

The exact h1 is **“Track quarterly income and expenses”**. The audience sentence, sample and real-data actions, the three plain facts, and the HMRC/tax-advice boundary are all visible without scrolling. There was no horizontal overflow or console error.

### 1440 × 900

The same three answers are explicit before scrolling. Both actions and all three facts are visible. There was no horizontal overflow or console error.

## Copy audit

Counts use whitespace-separated words. The table covers every sentence/standalone sentence-like line shown by the landing/product UI; headings and controls follow it. No sentence is over 22 words. No banned marketing adjective, unexplained visitor-facing implementation term, inconsistent product term, or unlisted claim was found.

### Landing and product copy

| Words | Copy | Check |
|---:|---|---|
| 2 | You’re offline. | `offline-reload` |
| 10 | Your ledger still works; exports and local backups are available. | `offline-reload` |
| 7 | Demo — sample data, nothing is saved | demo isolation/reset |
| 14 | For UK sole traders keeping Making Tax Digital records without a full accounting suite. | Audience is plain and specific. |
| 7 | Sample data opens a populated quarterly ledger. | Demo seed/reset coverage. |
| 4 | Stored in this browser | `local-only` |
| 6 | Works offline after the first visit | `offline-reload` |
| 6 | Core ledger and exports are free | `free-core` |
| 2 | Records only. | Clear boundary. |
| 14 | Quarter sheet does not submit updates to HMRC and does not give tax advice. | `no-hmrc-submission`, `no-tax-advice` |
| 6 | This quarter is an empty sheet | Clear empty state. |
| 6 | Add your first income or expense. | Clear next action. |
| 10 | It stays in this browser and appears in your export. | `local-only`, export claims |
| 8 | Based on the 2025–26 SA103F, HMRC’s self-employment form. | `category-map`; acronym is defined. |
| 6 | Check current HMRC guidance if unsure. | Clear boundary. |
| 10 | Record money in and out with a date and category. | `ledger-core` |
| 8 | Preview rows and add them to this quarter. | `csv-import` |
| 8 | Download CSV or XLSX for your accounting software. | `csv-export`, `xlsx-export` |
| 3 | Pay US$19 once. | `supporter-price` |
| 7 | Get a supporter badge and backup reminders. | `supporter-benefits` |
| 7 | Ledger, receipts, backups and exports stay free. | `free-core` |
| 6 | No supporter access in this browser. | Clear state. |
| 5 | Quarterly records in your browser. | `local-only` |

The headings state their sections without relying on decoration: **Track quarterly income and expenses**, **Your four MTD quarters**, **How categories appear in your export**, **Keep each quarter ready**, and **Support development for US$19**. “Making Tax Digital” is expanded in the visible audience sentence before its standard MTD abbreviation is used. Controls name their outcomes: **Try it with sample data**, **Add transaction**, **Import CSV**, **Export CSV**, **Export XLSX**, **Download encrypted backup**, **Restore this backup**, **Reset demo**, and **Start for real**. No generic Submit/Go/Continue control was found.

### README copy

| Words | Copy | Check |
|---:|---|---|
| 14 | Track quarterly income and expenses for UK sole traders using Making Tax Digital records. | Clear product statement. |
| 13 | Add transactions, check each quarter, and export CSV or XLSX for accounting software. | `ledger-core`, export claims |
| 11 | It does not submit updates to HMRC or provide tax advice. | Boundary claims |
| 9 | It does not handle VAT, payroll, or bank feeds. | `no-vat-payroll-bank` |
| 4 | Open `/demo/` or `/?demo=1`. | Direct demo instruction. |
| 9 | It loads tutoring income, materials, and travel sample records. | Demo seed/reset coverage. |
| 15 | The demo uses separate browser storage, so it never reads or changes your real ledger. | `demo-isolation` |
| 5 | Reset demo restores its sample. | `demo-reset` |
| 11 | Start for real discards demo changes before opening the real ledger. | `demo-reset` |
| 10 | Add, edit, delete, and restore transactions with exact GBP amounts | `ledger-core` |
| 13 | Keep optional JPG, PNG, WebP, or PDF receipt files up to 5 MB | `receipt-files` |
| 10 | Use tax-year quarters running from 6 April to 5 April | `quarter-rules` |
| 8 | Check all 15 HMRC self-employment form category references | `category-map` |
| 8 | Download CSV or XLSX with seven documented columns | export claims |
| 13 | Import a CSV locally, map its columns, preview rejected rows, and skip duplicates | `csv-import` |
| 7 | Restore passphrase-encrypted backups with transactions and receipts | `encrypted-backup` |
| 11 | Install Quarter sheet and use it offline after the first visit | `offline-reload`, `pwa-install` |
| 11 | Each visitor-facing promise is listed with an executable test in `.factory/claims.json`. | Confirmed by registry/tag audit. |
| 5 | Requires Node.js 20 or newer. | Build contract. |
| 9 | Run every declared claim test from a clean checkout. | Clear instruction. |
| 8 | Run the printed commands one at a time. | Clear instruction. |
| 9 | Browser tests use the pinned Playwright Chromium 1.58.2 release. | Build contract. |
| 9 | Deploy the generated `dist/` directory as a static site. | Clear instruction. |
| 13 | It includes the PWA manifest, service worker, `/privacy/`, `/terms/`, and a designed `404.html`. | `pwa-install`, `route-metadata`, `production-build` |
| 7 | Transactions and receipts stay in this browser. | `local-only` |
| 6 | There are no analytics or accounts. | `no-analytics-account` |
| 12 | Supporter access costs US$19 once and adds a badge and backup reminders. | `supporter-price`, `supporter-benefits` |
| 7 | Ledger, receipts, backups, and exports remain free. | `free-core` |
| 12 | Checkout and verification use Sociobot/Dodo; ledger records are never sent with verification. | `license-verification`, `security-privacy` |
| 6 | Read the privacy notice and terms. | Both links return 200. |
| 9 | The artwork prompt and generation provenance are in `.factory/design.md`. | `artwork-provenance` |
| 1 | MIT. | Matches `LICENSE`. |

## Demo and sandbox behaviour

The visible first-screen **Try it with sample data** action opens `/demo/` in one click. At 390 px, the first demo screen contains the persistent **“Demo — sample data, nothing is saved”** banner, reset/exit controls, a populated Q2 ledger, £850.00 income, £164.80 expenses, £685.20 difference, and realistic tutoring, materials, and client-visit records.

Live mutation check: a temporary demo transaction was added; **Reset demo** removed it and restored the three records. **Start for real** then opened `/` with no demo transaction and no sample records. Re-entering `/demo/` reseeded the sample only. Source confirms that `src/db.ts` selects `demo:quarter-sheet-ledger` before reads/writes and that `leaveDemo()` clears only demo entries and `demo:` preferences.

The sandbox tests use a fresh browser context, network request interception for privacy/billing, and `context.setOffline(true)` after the service worker controls the page. They verify offline demo reload, exports, and backup without network access. No demo request to the billing endpoint occurred; no licence was stored in demo mode.

## Claims verification

A fresh clone at `/tmp/mtd-review4-clean.8JkngA` received `npm ci`. Every exact command in `.factory/claims.json` was run independently as `npm run test:claims -- --grep @claim:<id>`; each passed. A second full `npm run test:claims` run passed all 37 desktop claim/supporting tests. The final Playwright result is `status: passed` with no failed tests.

| Claims exercised | Result |
|---|---|
| `demo-isolation`, `demo-reset`, `local-only`, `offline-reload`, `ledger-core`, `csv-import`, `entry-persistence`, `csv-export` | PASS |
| `xlsx-export`, `receipt-files`, `encrypted-backup`, `backup-crypto`, `category-map`, `quarter-rules`, `validation`, `keyboard-mobile` | PASS |
| `reduced-motion`, `free-core`, `billing-isolation`, `license-verification`, `supporter-benefits`, `no-hmrc-submission`, `no-tax-advice`, `no-analytics-account` | PASS |
| `no-vat-payroll-bank`, `supporter-price`, `pwa-install`, `route-metadata`, `security-privacy`, `artwork-provenance`, `production-build` | PASS |

The registry has 31 entries. Observed landing and README promises map to those entries; no unlisted claim was found.

## Earlier-finding regression check

| Earlier finding | Live and code confirmation | Status |
|---|---|---|
| Review-1 B1 | One-click seeded demo, banner, reset, exit, separate demo database, and offline demo behaviour were observed and tested. | Fixed |
| Review-1 B2 | 31-entry registry with tagged observable tests; every declared command passed from fresh clone. | Fixed |
| Review-1 B3 | Job, audience, first action, explanation, and facts fit at 390 px and desktop. | Fixed |
| Review-1 B4 | `/demo/` is real; unknown route is styled HTTP 404. | Fixed |
| Review-1 M1 | All five routes have current footer, description, canonical, full OG/Twitter metadata, icons, reload, and focus coverage. | Fixed |
| Review-1 M2 | H1 receives focus after navigation/back; mobile touch/keyboard checks pass. | Fixed |
| Review-1 M3 and m1 | Browser/supporter/receipt terminology is consistent; action labels are specific. | Fixed |
| Review-2 F-2-1 through F-2-6 | US$ is explicit; benefits and no-tax-advice are claimed/tested; browser wording, import, and README demo wording remain corrected. | Fixed |
| Review-3 F-3-1 through F-3-4 | 404 OG/footer and full route test are present; US$ and README wording are precise; reproducible current copy audit passes. | Fixed |
| Earlier verification notes | Quarter boundary, update notice, checkout configuration, quality gates, and Undo label remain covered. | Fixed |

## Structure, links, identity, and leverage

`/`, `/demo/`, `/privacy/`, `/terms/`, and the unknown route returned the expected 200/404 statuses. Their titles, h1, `lang`, description, canonical, OG/Twitter metadata, favicon, Apple icon, main landmark, shared header/footer, and destination-h1 focus were checked live. Browser back from Privacy returned focus to the home h1. All crawled internal links, the sample CSV, and the read-only Sociobot checkout returned 200; hash and `mailto:` links were explicit.

The midnight-blue drafting-sheet system, cyan construction rules, cream annotations, clipped controls, original desk illustration, and styled 404 match `.factory/design.md`. It is recognisably product-specific rather than a generic SaaS template.

No feature is missing from the stated job. The obvious bulk path exists as local CSV import with mapping, rejection preview, duplicate handling, confirmation, CSV/XLSX export, receipt files, and encrypted backups. Sync would conflict with the local-first brief unless separately opted into. AI would add cost and data transfer without improving the core record-entry task, so no Sociobot-gateway feature is warranted.

## What would make this perfect

No remediation is required for this review. Retain the isolated sample route, rerun every declared claim from a fresh clone after any copy or route change, and update the registry before making a new visitor-facing promise.
