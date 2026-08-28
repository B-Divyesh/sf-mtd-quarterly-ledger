# Adversarial first-read review 1 — FAIL

Reviewed 28 August 2026 against live production at <https://mtd-quarterly-ledger.sociobot.in/> and repository commit `9be2a4b1929cdea4e6812a8b3afae6d04c251e21`.

## Verdict

**FAIL — 4 blocking findings, 3 major findings, and 1 minor finding.** PASS requires zero blocking findings and no more than three minor findings.

The ledger itself can add a transaction, export it, and reload offline. That does not offset the absent demo, shared demo/real storage, missing claims registry, failed first-screen test, and broken route fallback.

## Blocking findings

### B1 — There is no demo, and both expected demo URL forms write to real storage

**Quote/evidence:** There is no “Try it with sample data” action. `/demo` and `/?demo=1` both returned the normal home application with `0` sample transactions, no “Demo — sample data, nothing is saved” banner, no “Reset demo”, and no “Start for real”. `.factory/demo.md` is absent.

In a fresh browser context, the app opened IndexedDB database `quarter-sheet-ledger`. A £123.45 transaction named “Real namespace marker” created on `/` appeared at `/?demo=1`. A £67.89 transaction named “Demo namespace marker” created at `/?demo=1` then appeared on `/`; the root showed both transactions and £191.34. This confirms that the supposed demo entry point reads and writes the real namespace.

**Why the visitor is lost or misled:** A visitor cannot try the product without entering their own data. Anyone sent to the conventional demo URL is silently placed in the real ledger and may mistake disposable entries for isolated sample data.

**Concrete fix:** Put **Try it with sample data** on the first screen. Route `/demo` (and optionally `?demo=1`) to a seeded ledger that immediately shows realistic income, expenses, quarter totals, category mappings, and exports. Use a separate `demo:` IndexedDB database/key namespace. Keep a persistent **Demo — sample data, nothing is saved** banner with **Reset demo** and **Start for real**. Prove that reset restores the seed and that neither side can read or alter the other. Document it in `.factory/demo.md`.

### B2 — The claims registry is missing, so every product claim is unlisted and zero claim tests can run

**Quote/evidence:** `cat .factory/claims.json` returns `No such file or directory`; `rg '@claim' tests` returns no matches. Therefore the required list has zero executable entries. The copy audit below marks each live/README claim as `UC:<suggested-id>`.

The general gates passed: `npm test` (7/7), `npm run build`, and `npm run test:e2e` (10/10 across desktop and 390 px). Manual production checks also confirmed an offline reload retained one transaction, CSV contained the expected row, and the exercised flow made only same-origin requests. These are not substitutes for one declared, tagged sandbox test per claim.

**Why the visitor is misled:** Statements such as “Your ledger still works”, “stores everything in this browser”, “real XLSX”, and “all record keeping … stay free” are not tied to reproducible acceptance tests. A passing general suite cannot show which promise was checked or detect an untested new promise.

**Concrete fix:** Add `.factory/claims.json`. For every `UC:<id>` below, list the exact claim and locations, a command containing exactly one `@claim:<id>` test, and its clean demo sandbox. Remove claims that cannot be tested. At minimum cover demo isolation/reset, local-only network interception, offline reload, transaction persistence, CSV, XLSX, receipt handling, encrypted backup/restore, category mappings, keyboard/mobile operation, free-core entitlement, and billing isolation.

### B3 — The first screen does not identify the audience or give a usable first action on a phone

**Mobile, 390 × 844, before scrolling:**

- **What it does:** I can infer that it logs income and expenses by quarter and exports a file.
- **For whom:** I cannot tell. Neither “UK sole traders” nor “Making Tax Digital” appears in the visible page copy.
- **What to click first:** I cannot tell. The only visible action is **Backup & restore**, which is not a sensible first action. The “Tax year” label begins at y=825 and **Add transaction** is below the 844 px viewport.

**Desktop, 1440 × 900, before scrolling:** The what and **Add transaction** are visible, but the audience is still absent and there is no sample-data action.

**Exact text that fails:** “Your tax year, ruled into quarters.” is a metaphor, not the job. “Log income and expenses, see each quarter’s totals, then export a clean file for your bridging or recognised software.” uses unexplained “bridging” and “recognised” language and still does not say who this is for. The DOM text of the heading is also concatenated as `Your tax year,ruled into quarters.`

**Why the visitor is lost:** A new visitor must infer the MTD context and may think **Backup & restore** is the intended starting point on mobile.

**Concrete fix:** Use the headline **Track quarterly income and expenses**. Follow it with **For UK sole traders keeping Making Tax Digital records without a full accounting suite.** Put **Try it with sample data** and **Add your first transaction** next to it above the mobile fold, followed by three short facts: **Stored on this device**, **Works offline after the first visit**, **Core ledger and exports are free**. Add a literal space around the heading line break.

### B4 — Unknown and demo routes silently render the real ledger as HTTP 200

**Quote/evidence:** `/definitely-not-a-real-route` returned HTTP 200, title “Quarter sheet — simple MTD ledger”, and the ledger home. `/demo` did the same. There is no designed 404 route.

**Why the visitor is lost:** A mistyped or stale link looks valid while showing unrelated content. The same fallback hides the absent demo and creates the storage-safety failure in B1.

**Concrete fix:** Recognise valid routes explicitly. Serve a blueprint-styled 404 with status 404, title **Page not found — Quarter sheet**, one h1, and a **Return to ledger** link. Implement `/demo` as the isolated route in B1. Add direct-load and refresh tests for every route plus an unknown path.

## Major findings

### M1 — Required route metadata and the shared site skeleton are incomplete

**Evidence:** All checked routes have `lang`, one h1, a `<main>`, meta description, SVG favicon, and route-appropriate legal titles. However `/`, `/privacy/`, and `/terms/` have no canonical link, Open Graph metadata, Twitter card metadata, Apple touch icon, or 1200 × 630 social image. The sitemap has no demo route. The header has no Demo or Privacy navigation. Footers vary by route and omit “Built by Param Factory” and a version/build id. The landing order omits a three-step “How it works” section. The title “Quarter sheet — simple MTD ledger” uses the marketing adjective “simple” and the abbreviation “MTD” instead of stating the job plainly.

**Why it matters:** Shared links have no product-specific preview, install metadata is incomplete on iOS, and navigation does not expose the required demo or privacy path where visitors expect them.

**Concrete fix:** Use **Quarter sheet — quarterly income and expense ledger**. Add per-route canonicals, OG/Twitter fields and original 1200 × 630 artwork, plus an Apple touch icon. Add Demo and Privacy to the common header; use one footer containing the one-line description, Privacy, Terms, Param Factory credit, and build id. Add `/demo` to the sitemap and a three-step section: **Add transactions**, **Check each quarter**, **Export your records**.

### M2 — Route focus and several mobile touch targets fail the stated accessibility baseline

**Evidence:** After following **Privacy**, `document.activeElement` was `BODY`, not the new h1; the same occurred when returning home. Browser back restored the prior scroll position, but not focus to the route heading. At 390 px, visible link boxes measured 32 px high for the brand, 25 px for **Back to ledger**, 19 px for email links, and 20 px for Privacy/Terms, below the required 44 px target. Automated axe checks found no serious/critical WCAG 2.0/2.1 violations, but that ruleset did not enforce this 44 px product requirement.

**Why it matters:** Keyboard and screen-reader users receive no route-change focus cue, and small footer/legal targets are harder to tap accurately.

**Concrete fix:** Focus the destination h1 on navigation and announce it in a polite live region. Give every visible interactive control at least a 44 × 44 CSS hit area while keeping the current visual size if needed. Add a Playwright assertion for focus after route changes and bounding-box assertions at 390 px.

### M3 — Core copy mixes jargon, vague marketing language, and inconsistent names

**Quote/evidence:** “bridging”, “recognised software”, “SA103F”, “local-first”, “PWA manifest”, “app shell”, and “IndexedDB” are unexplained in visitor-facing or introductory copy. “clean file”, “real XLSX”, and “clear … states” are subjective. The same paid concept is “supporter unlock” and “supporter license”. The field labelled “Receipt photo” accepts PDFs.

**Why it matters:** A sole trader without accounting or web-development vocabulary cannot confirm what the export is for, and inconsistent paid-feature naming makes recovery and purchase sound like different products.

**Concrete fix:** Use **supporter access** consistently. Change **Receipt photo** to **Receipt file**. Replace the hero sentence with **Add income and expenses, check each quarter’s totals, then export CSV or XLSX for your accounting software.** Define SA103F on first use as **the HMRC self-employment form categories**. Keep implementation terms in developer notes, not the feature summary.

## Minor finding

### m1 — Row and update actions lack specific result names

**Evidence:** Repeated row controls are named only **Edit** and **Delete**; the update action is **Update now**; the header uses **Backup & restore** even though “backup” is a noun in that construction. **Have a license? Restore it** splits a question and an ambiguous pronoun across one button.

**Why it matters:** Out of context, a screen-reader user cannot tell which transaction **Edit** or **Delete** affects, and “it” does not name the result.

**Concrete fix:** Use accessible names such as **Edit Website project transaction** and **Delete Website project transaction**, **Install update**, **Back up or restore records**, and **Restore supporter access**.

## Copy audit

Counts use whitespace-separated tokens; a hyphenated term or path remains one word. `UC:<id>` means an unlisted claim. Its proposed fix is to add the exact claim to `.factory/claims.json` with exactly one tagged sandbox test `@claim:<id>`, or remove the claim. Repeated locations may share one claim id and test.

### Landing and in-product sentences

| Words | Exact copy | Flag and proposed rewrite/test |
|---:|---|---|
| 12 | A private, local-first quarterly income and expense ledger for UK sole traders. | `UC:local-only`; meta-description jargon; use **A quarterly income and expense ledger stored in your browser for UK sole traders.** |
| 2 | You’re offline. | `UC:offline-reload` |
| 10 | Your ledger still works; exports and local backups are available. | `UC:offline-reload`; test reload plus export and backup while offline. |
| 6 | Your tax year, ruled into quarters. | Headline does not state the job; use **Track quarterly income and expenses.** |
| 19 | Log income and expenses, see each quarter’s totals, then export a clean file for your bridging or recognised software. | `UC:ledger-core`, `UC:spreadsheet-export`; jargon/subjective “clean”; use **Add income and expenses, check each quarter’s totals, then export CSV or XLSX for your accounting software.** |
| 2 | Records only. | — |
| 14 | Quarter sheet does not submit updates to HMRC and does not give tax advice. | `UC:no-hmrc-submission`; test that normal ledger flows never call an HMRC endpoint. |
| 6 | This quarter is an empty sheet. | — |
| 6 | Add your first income or expense. | — |
| 10 | It stays on this device and appears in your export. | `UC:local-only`, `UC:spreadsheet-export`; intercept network and inspect export. |
| 5 | Based on 2025–26 SA103F boxes. | `UC:category-map`; define SA103F and fixture-test every mapping. |
| 11 | Check current HMRC guidance or ask a tax professional if unsure. | — |
| 3 | £19 one time. | `UC:supporter-price`; use **Pay £19 once.** and test the checkout amount. |
| 16 | Unlock the blueprint night palette badge and backup nudges, and help fund recognised HMRC submission work. | `UC:supporter-features`; unclear future promise; use **Get a supporter badge and backup reminders.** |
| 8 | Ledger, receipts, backups and every export stay free. | `UC:free-core`; test each feature without a license. |
| 6 | No supporter license on this device. | Inconsistent term; use **No supporter access on this device.** |
| 3 | Have a license? | Inconsistent term; replace the whole control with **Restore supporter access.** |
| 2 | Restore it. | “It” has no independent meaning; use **Restore supporter access.** |
| 7 | Quarter sheet stores everything in this browser. | `UC:local-only`; “everything” is broad; use **Transactions and receipts stay in this browser.** |
| 7 | Generated artwork disclosed in the privacy notice. | `UC:artwork-provenance`; verify the notice and retained source/provenance. |
| 6 | Money earned from your self-employed work. | `UC:category-map` |
| 6 | Other receipts not included in turnover. | `UC:category-map` |
| 7 | Goods bought for resale or materials used. | `UC:category-map` |
| 7 | Payments to subcontractors in the construction industry. | `UC:category-map` |
| 6 | Employee wages, salaries and related costs. | `UC:category-map` |
| 6 | Business travel and vehicle running costs. | `UC:category-map` |
| 6 | Rent, rates, power and business insurance. | `UC:category-map` |
| 6 | Repairs and maintenance, not capital purchases. | `UC:category-map` |
| 7 | Phone, internet, postage, stationery and office costs. | `UC:category-map` |
| 5 | Advertising and business entertainment costs. | `UC:category-map` |
| 5 | Business loan and overdraft interest. | `UC:category-map` |
| 6 | Bank, card and other finance charges. | `UC:category-map` |
| 9 | Amounts included in turnover that will not be recovered. | `UC:category-map` |
| 6 | Accountancy, legal and other professional fees. | `UC:category-map` |
| 6 | Allowable business expenses not listed above. | `UC:category-map`; “allowable” is tax guidance; use **Other business expenses not listed above** unless verified against current HMRC guidance. |
| 5 | Maps to SA103F box [number]. | `UC:category-map`; this runtime pattern appears for all 15 category boxes. |
| 7 | Enter a positive amount, for example 48.50. | — |
| 6 | Invoice, customer or a short reminder. | Fragment is clear in field context. |
| 3 | Max 140 characters. | `UC:note-limit` |
| 9 | JPG, PNG, WebP or PDF up to 5 MB. | `UC:receipt-types`; label the field **Receipt file**. |
| 3 | Current receipt: [file]. | `UC:receipt-storage` |
| 7 | Choose another file to replace it. | — |
| 10 | Download an encrypted copy of every tax year and receipt. | `UC:encrypted-backup` |
| 7 | Keep the passphrase separately—we cannot recover it. | `UC:no-passphrase-recovery` |
| 5 | Use at least 10 characters. | `UC:passphrase-length` |
| 8 | Restore replaces the ledger currently on this device. | `UC:backup-restore` |
| 6 | Choose a date for this transaction. | — |
| 12 | Choose a date from [quarter start] to [quarter end] for this quarter. | `UC:quarter-date-validation` |
| 11 | Enter a positive amount with no more than two decimal places. | `UC:amount-validation` |
| 7 | Choose a category for this transaction type. | `UC:category-validation` |
| 6 | That receipt is over 5 MB. | `UC:receipt-types` |
| 6 | Choose a smaller image or PDF. | — |
| 6 | This transaction could not be saved. | — |
| 9 | Check that browser storage is available and try again. | — |
| 2 | Transaction updated. | `UC:entry-crud` |
| 5 | Transaction saved on this device. | `UC:entry-crud`, `UC:local-only` |
| 2 | Transaction deleted. | `UC:entry-crud` |
| 2 | Transaction restored. | `UC:entry-crud` |
| 4 | Delete [transaction] for [amount]? | `UC:entry-crud`; confirm the named record is deleted and remains undoable for eight seconds. |
| 3 | Quarter CSV exported. | `UC:spreadsheet-export` |
| 3 | Quarter XLSX exported. | `UC:spreadsheet-export` |
| 8 | Use a passphrase with at least 10 characters. | `UC:passphrase-length` |
| 3 | Encrypted backup downloaded. | `UC:encrypted-backup` |
| 4 | Keep its passphrase safe. | — |
| 6 | The backup could not be created. | — |
| 2 | Try again. | Does not say what to do differently; use **Check browser download permissions, then create the backup again.** |
| 8 | Choose a backup file and enter its passphrase. | — |
| 10 | Replace this device’s [count] transactions with [count] from the backup? | `UC:backup-restore` |
| 3 | [Count] transactions restored. | `UC:backup-restore` |
| 3 | Supporter unlock active. | Inconsistent term; use **Supporter access is active.** |
| 5 | Your encrypted backup is due. | `UC:backup-reminder` |
| 5 | Your recent backup is noted. | `UC:backup-reminder`; vague; use **Your last backup was [date].** |
| 5 | Supporter unlock active; checking quietly… | Inconsistent and vague; use **Supporter access is active while verification completes.** |
| 4 | License no longer active. | Inconsistent term; use **Supporter access could not be verified.** |
| 7 | You can buy a new supporter unlock. | Inconsistent term; use **You can buy supporter access again.** |
| 7 | Could not verify the license while offline. | `UC:license-verification`; use **Connect to the internet to verify supporter access.** |
| 4 | Try again when connected. | Combine with the preceding sentence. |
| 5 | A fresh version is ready. | Vague; use **A Quarter sheet update is ready.** |
| 3 | Supporter unlock restored. | Inconsistent term; use **Supporter access restored.** |
| 2 | Thank you. | — |
| 6 | That license could not be verified. | `UC:license-verification`; use **Supporter access could not be verified.** |
| 6 | Check the token and try again. | — |
| 7 | Your browser may be blocking site data. | — |
| 10 | Allow storage for this site, then reload before entering records. | — |
| 8 | This is not a Quarter sheet backup file. | — |
| 6 | This backup format is not supported. | — |
| 12 | That passphrase did not unlock this backup, or the file is damaged. | — |

No landing sentence exceeds 22 words. The problem is specificity and claim coverage, not raw sentence length.

### Landing headings and controls

| Words | Exact copy | Finding and proposed rewrite |
|---:|---|---|
| 6 | Quarter sheet — simple MTD ledger | Title uses a subjective adjective and abbreviation; use **Quarter sheet — quarterly income and expense ledger**. |
| 6 | Digital records / four measured periods | Jargon-like eyebrow; use **Quarterly records for sole traders**. |
| 6 | Your tax year, ruled into quarters. | Metaphorical h1; use **Track quarterly income and expenses**. |
| 3 | PLAN / 04 | Makes no sense out of context; remove or use **Four tax-year quarters**. |
| 2 | Quarter plan | Vague; use **Your four MTD quarters**. |
| 3 | Quarter 2 ledger | Clear. |
| 6 | This quarter is an empty sheet | Clear empty-state heading. |
| 3 | REFERENCE / SA103F | Unexplained acronym; use **HMRC category reference**. |
| 4 | Where your categories map | Destination is missing; use **How categories appear in your export**. |
| 5 | Keep the useful part free | Marketing claim; use **Support Quarter sheet**. |
| 2 | Founding supporter | Out-of-context heading; use **Support development for £19**. |
| 2 | Add transaction / Edit transaction | Clear result-naming actions. |
| 3 | Backup & restore | Use **Back up or restore records**. |
| 3 | Restore supporter license | Use consistent **Restore supporter access**. |
| 4 | Local storage is unavailable | Clear error heading. |
| 4 | Opening your local ledger… | Clear loading status. |
| 8 | Receipt photo / Optional · stored only here | `UC:receipt-storage`; the label contradicts PDF support; use **Receipt file / Optional · stored in this browser**. |
| 2 | Export CSV | Clear result-naming action. |
| 2 | Export XLSX | Clear result-naming action. |
| 3 | Add first transaction | Clear result-naming action. |
| 3 | Open category reference | Clear result-naming action. |
| 3 | Buy supporter unlock | Use consistent **Buy supporter access**. |
| 5 | Have a license? Restore it | Ambiguous; use **Restore supporter access**. |
| 1 | Edit / Delete | Add the transaction name to each accessible name. |
| 2 | View receipt | Clear result-naming action. |
| 1 | Cancel | Conventional dialog action; no change required. |
| 2 | Save transaction | Clear result-naming action. |
| 3 | Download encrypted backup | Clear result-naming action. |
| 3 | Restore this backup | Clear result-naming action. |
| 2 | Verify license | Use consistent **Verify supporter access**. |
| 1 | Undo | Use **Undo deletion** for the accessible name. |
| 2 | Update now | Use **Install update**. |
| 2 | Reload ledger | Clear result-naming action. |

### README sentences, bullets, and headings

| Words | Exact copy | Flag and proposed rewrite/test |
|---:|---|---|
| 2 | Quarter sheet | H1 lacks the job; use **Quarter sheet: quarterly records for UK sole traders**. |
| 24 | Quarter sheet is a deliberately small, local-first quarterly income and expense ledger for UK sole traders working under Making Tax Digital for Income Tax. | **Over 22**; jargon/marketing. Use **Quarter sheet tracks quarterly income and expenses for UK sole traders using Making Tax Digital.** |
| 35 | It helps tutors, freelancers, tradespeople and other self-employed people keep digital records, see the four tax-year periods, map common costs to SA103F categories, and export clean CSV or XLSX files for bridging or HMRC-recognised software. | **Over 22**, `UC:ledger-core`, `UC:category-map`, `UC:spreadsheet-export`; use **Add transactions, check each quarter, and export CSV or XLSX for your accounting software. Expense categories follow the HMRC self-employment form.** |
| 16 | It does not submit to HMRC, provide tax advice, support VAT/payroll, or connect to a bank. | `UC:no-hmrc-submission`, `UC:no-vat-payroll-bank`; use **It does not submit to HMRC or provide tax advice. It does not handle VAT, payroll, or bank feeds.** |
| 6 | Check current HMRC guidance before filing. | — |
| 2 | What works | Heading is generic; use **Ledger features**. |
| 15 | Income and expense lines with exact GBP amounts, dates, notes and optional local receipt images/PDFs | `UC:entry-crud`, `UC:receipt-types`; use **Transactions with dates, GBP amounts, notes, and optional receipt files**. |
| 14 | UK tax-year quarters (6 April through 5 April), running totals and 7 August/November/February/May deadlines | `UC:quarters-deadlines` |
| 8 | SA103F category reference and mappings in each export | `UC:category-map`; define SA103F. |
| 11 | CSV and real XLSX exports suitable for checking/importing into bridging tools | `UC:spreadsheet-export`; subjective “real” and jargon; use **CSV and XLSX exports for checking or importing into accounting software**. |
| 6 | Passphrase-encrypted whole-ledger backup and destructive-confirmed restore | `UC:encrypted-backup`; awkward compound; use **Passphrase-encrypted backups with confirmation before restore**. |
| 11 | IndexedDB persistence, offline app shell, installable PWA manifest and update prompt | `UC:offline-reload`, `UC:pwa-install`; developer jargon; use **Records persist in this browser, and the installable app works offline after the first visit**. |
| 10 | Keyboard and 390px mobile paths, reduced motion, clear empty/loading/error/offline states | `UC:keyboard-mobile`, `UC:reduced-motion`; subjective “clear”; use **Keyboard controls, reduced motion, and layouts tested at 390 px**. |
| 15 | Optional £19 one-time Sociobot supporter unlock; all record keeping and data ownership tools stay free | `UC:supporter-price`, `UC:free-core`; use consistent **supporter access**. |
| 3 | Develop and verify | Clear heading. |
| 5 | Requires Node.js 20 or newer. | `UC:node-version`; test the supported engine in CI or state the actually enforced version. |
| 16 | The reproducible production build command is exactly `npm run build`; deploy `dist/` as a static site. | `UC:production-build` |
| 12 | `dist/index.html` is the application root, with `dist/privacy/index.html` and `dist/terms/index.html` as legal pages. | `UC:production-build` |
| 8 | Browser tests need Playwright Chromium once per environment: | Clear setup statement. |
| 18 | The browser suite explicitly reloads the installed app offline and repeats the core path at a 390px viewport. | `UC:test-coverage`; currently true for the existing suite, but it does not exercise demo mode. |
| 3 | Data and privacy | Clear heading. |
| 11 | Transactions and receipts live only in IndexedDB on the current browser. | `UC:local-only` |
| 10 | Encrypted backups use Web Crypto AES-256-GCM and PBKDF2-SHA-256 (310,000 iterations). | `UC:backup-crypto` |
| 7 | There is no analytics or account system. | `UC:no-analytics-account` |
| 13 | License verification is the only product API request and never includes ledger data. | `UC:local-only`, `UC:license-verification` |
| 4 | See `/privacy/` and `/terms/`. | — |
| 11 | Supporter checkout and verification use the registered production Sociobot endpoint, `https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/…`. | `UC:billing-endpoint` |
| 23 | The checkout is a £19 one-time purchase handled by Sociobot/Dodo; the app stores only its returned license token and cached verification verdict locally. | **Over 22**, `UC:supporter-price`, `UC:billing-storage`; use **Sociobot/Dodo handles the one-time £19 payment. Quarter sheet stores only the returned token and verification result.** |
| 3 | Static hosting policy | Clear heading. |
| 11 | `public/staticwebapp.config.json` is deployed with `dist/` for Azure Static Web Apps Standard. | `UC:hosting-config` |
| 28 | It sets a restrictive CSP (including `frame-ancestors 'none'`), frame and Permissions-Policy headers, `application/manifest+json` for the manifest, no-cache worker/manifest responses, and one-year immutable caching for Vite's hashed `/assets/` files. | **Over 22**, `UC:security-headers`; split into a short list and test live response headers. |
| 2 | Export notes | Clear heading. |
| 11 | CSV columns are `date`, `type`, `category`, `hmrc_box`, `description`, `amount_gbp`, and `receipt_attached`. | `UC:csv-schema` |
| 9 | XLSX contains the same seven columns and an auto-filter. | `UC:xlsx-schema` |
| 12 | Receipt binaries are included in encrypted backup files but not spreadsheet exports. | `UC:receipt-backup-export` |
| 19 | Acceptance by a particular bridging tool depends on its current import mapping, so test an export before a deadline. | Jargon; use **Import rules vary by accounting product, so test your file before a deadline.** |
| 1 | License | Clear heading. |
| 1 | MIT. | Verified by repository `LICENSE`; not a runtime claim. |
| 16 | Generated artwork is original to this product; prompt and provenance are recorded in `.factory/design.md` and `assets/src/`. | `UC:artwork-provenance`; repository evidence exists, but the claim is not registered. |

README sentences over the hard cap: 4 (24, 35, 23, and 28 words).

### Terminology check

| Concept | Terms found | Required single term |
|---|---|---|
| Ledger row | line, transaction, record, entry | **transaction** in user copy; “record” only for the full data set |
| Tax period | period, quarter, quarterly update | **quarter** |
| Paid state | supporter unlock, supporter license, license | **supporter access** |
| Receipt upload | receipt photo, image/PDF, attached file | **receipt file** |
| Destination software | bridging, recognised software, bridging tools | **accounting or HMRC-compatible software** |
| Local storage | local-first, IndexedDB, this browser, this device, stored only here | **stored in this browser** for visitor copy; IndexedDB only in developer notes |

## Structure, links, visual identity, and accessibility checks

| Check | Result | Evidence |
|---|---|---|
| Titles | Partial | Home title is 33 characters but not plain; Privacy and Terms follow the route pattern; `/demo` and unknown paths reuse home title. |
| One h1 / landmarks / language / alt | Pass | One h1, `main`, `en-GB`, and meaningful hero alt on all checked content pages. |
| Meta description | Pass | Present and under 155 characters on `/`, `/privacy/`, and `/terms/`. |
| Canonical / OG / Twitter / Apple icon | Fail | All absent on every checked route. SVG favicon exists; `/favicon.ico` returns 404. |
| 404 | **Blocking fail** | Unknown route returns the ledger with 200. |
| Deep links and back | Partial | `/privacy/` and `/terms/` load directly; browser back restores scroll. `/demo` is not a demo. |
| Focus on route change | Fail | Active element is `BODY`, not h1, after Privacy and home navigation. |
| Links | Pass | Internal links return 200; checkout redirects 303 to a live 200 checkout; mail links are explicit. |
| Header/footer | Fail | No Demo/Privacy header nav; footer copy varies and lacks factory credit/build id. |
| Visual identity | Pass | Midnight blueprint grid, cyan construction lines, cream annotation type, squared controls, and original drafting-desk art match `.factory/design.md`; it does not read as a generic centered SaaS/gradient/card template. |
| Layout | Pass | No horizontal overflow at 390 or 1440 px. |
| Automated accessibility | Pass with manual exception | Live axe WCAG 2.0/2.1 serious/critical: zero on home, Privacy, Terms, and fallback at both viewports. Manual 44 px target and focus failures remain M2. |
| Cold-load console | Pass | No console or page errors on online first load at either viewport. |
| Offline/privacy exercise | Partial | Offline reload retained a £249.50 sample transaction and CSV export worked; intercepted flow used only same-origin requests. Offline manifest fetch logged `ERR_INTERNET_DISCONNECTED`; no product failure resulted. Demo isolation failed. |
| First-load size | Pass | Production main JS is 21.78 kB raw / 8.15 kB gzip; lazy XLSX chunk is 11.32 kB raw / 5.34 kB gzip. |

## Verification commands and results

The checkout began with no tracked changes at the stated base commit. Dependencies were installed with `npm ci`; Playwright 1.62.1 required `npx playwright install chromium` because its browser revision was not preinstalled.

| Command/check | Result |
|---|---|
| `test -f .factory/claims.json` | **FAIL** — file absent |
| `rg '@claim' tests` | **FAIL** — no tagged claim tests |
| Every command listed by `.factory/claims.json` | **0 commands available** — blocking registry failure |
| `npm test` | Pass — 7/7 |
| `npm run build` | Pass — `dist/` produced; main JS 8.15 kB gzip |
| `npm run test:e2e` | Pass — 10/10 desktop and 390 px |
| Live cold load, 390 × 844 | **FAIL** — audience and first action absent above fold |
| Live cold load, 1440 × 900 | **FAIL** — audience and sample-data action absent |
| Live `/demo` and `/?demo=1` | **FAIL** — empty real app, no demo controls |
| Demo/real storage marker test | **FAIL** — both directions shared `quarter-sheet-ledger` |
| Live offline reload with seeded transaction | Pass as an unregistered manual check |
| Live request interception through add/export/reload | Pass as an unregistered manual check; no cross-origin requests |
| Live route crawl | Pass for linked destinations; unknown-route behavior fails |
| Live axe at mobile and desktop | Pass — zero serious/critical violations |

## Acceptance retest

Do not change this verdict until all four blocking findings are resolved. The shortest meaningful retest is: enter `/demo` in a clean 390 px context; verify a populated ledger and persistent demo banner; mutate and reset it; verify root storage is unchanged; run every declared `@claim` test; confirm an unknown URL returns the designed 404; then repeat the first-screen questions without using the browser title or README.
