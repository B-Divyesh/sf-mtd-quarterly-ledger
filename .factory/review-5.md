# Quarterly income and expense ledger review 5 — PASS

Reviewed 6 September 2026 against <https://mtd-quarterly-ledger.sociobot.in/>.

## Verdict

**PASS — 0 findings and 0 untested claims.**

The implementation candidate is `f348489c6c2377aa93d16d3b05a2f4c052b741db`. This is the deployed polish-3 release candidate and includes the final test repair after product-code commit `083a1245192a43eb2c13bcb21c713e250db9d484`. The documentation checkout reviewed before this report was `20f0bbb52af82cff089258ee34d054df246cce56`. Commits `30ecbfb` and `20f0bbb` changed reports only.

The live site matched all 26 public files in the locally built `dist/` byte for byte. No product code was changed during this review.

## First screen before scrolling

In fresh 390 × 844 and 1440 × 900 browser sessions:

- Job: **Track quarterly income and expenses**.
- Audience: **UK sole traders keeping Making Tax Digital records without a full accounting suite**.
- First action: **Try it with sample data**. The page says it opens a populated quarterly ledger.

Both the sample action and **Add your first transaction** were visible before scrolling on the phone. The three facts about browser storage, offline use, and free core tools were also visible. There was no horizontal overflow or console error.

## Demo and ledger results

The first click opened `/demo/`. The persistent label said **Demo — sample data, nothing is saved** and included **Reset demo** and **Start for real**. The first phone screen already showed the populated quarter.

The sample was realistic and internally consistent:

- income: **£850.00**;
- expenses: **£164.80**;
- difference: **£685.20**;
- records: **July tutoring invoices**, **Workshop materials**, and **Client visits**.

A temporary record survived a demo reload. **Reset demo** removed it and restored the three sample records. A second temporary record was then added before **Start for real** was used. The real ledger opened empty, with neither temporary nor sample records. Reopening the demo restored only the sample. All writes in this exercise were made in the demo namespace; no real ledger data was changed.

Normal, invalid, boundary, and recovery paths passed. A 6 July 2026 entry was rejected from Q1 with the stated 6 April–5 July range, `12.345` was rejected as an invalid amount, and correcting both fields saved the record. A named record could be deleted and restored with **Undo deletion**. The sample CSV had the seven documented columns, three data rows, and the expected tutoring record. Local claim tests also covered CSV mapping, rejected rows, duplicate handling, receipts, XLSX structure, wrong-passphrase recovery, and encrypted restore.

## Declared claims

`.factory/claims.json` contains 31 claims. Each ID has exactly one matching `@claim:<id>` tag. Every declared command was run separately from the clean checkout and all 31 passed:

| Area | Claims | Result |
|---|---|---|
| Demo and privacy | `demo-isolation`, `demo-reset`, `local-only`, `billing-isolation`, `no-analytics-account` | PASS |
| Ledger and files | `ledger-core`, `csv-import`, `entry-persistence`, `csv-export`, `xlsx-export`, `receipt-files` | PASS |
| Backup and offline | `offline-reload`, `encrypted-backup`, `backup-crypto` | PASS |
| Dates and validation | `category-map`, `quarter-rules`, `validation` | PASS |
| Access and presentation | `keyboard-mobile`, `reduced-motion`, `free-core` | PASS |
| Supporter access | `license-verification`, `supporter-benefits`, `supporter-price` | PASS |
| Product boundaries | `no-hmrc-submission`, `no-tax-advice`, `no-vat-payroll-bank` | PASS |
| Delivery | `pwa-install`, `route-metadata`, `security-privacy`, `artwork-provenance`, `production-build` | PASS |

The live page, legal pages, README, and generated copy audit were cross-checked against the registry. No missing, false, incomplete, or untested public claim was found. The read-only checkout check reached a hosted HTTP 200 page and confirmed USD 1900 with a one-time session. No payment was attempted.

## Browser, accessibility, privacy, and routes

- Fresh desktop and phone browser processes loaded the live product successfully.
- Live Axe checks found zero serious or critical issues on home, demo, privacy, terms, and 404.
- The URL verifier found the correct title, `lang="en-GB"`, one h1, one main, no missing alt text, no unnamed buttons, and no console errors on home, demo, privacy, and terms.
- Every visible phone target was at least 44 px. Text at 200% did not create horizontal overflow.
- The skip link was keyboard-focusable and targeted `#main`. Its focus outline was 3 px cyan. Dialog, quarter-tab, route-heading, delete/undo, and keyboard submission checks passed.
- Reduced motion changed scrolling to `auto` and reduced the tested transition to `0.00001s`.
- The exercised demo flow made zero cross-origin requests. The privacy page explains local deletion, the absence of a server-side ledger account, and a privacy contact address.
- Offline demo reload retained the sample. CSV export and encrypted backup downloaded offline. An unknown offline route returned the designed 404 with HTTP 404.
- Home, demo, privacy, and terms returned 200 with distinct titles. The unknown route returned the expected 404, retained the shared structure, and offered a return link. A deliberate 404 is not a defect.
- Fourteen discovered links were checked. Internal pages and the sample CSV returned 200; the checkout returned 200 after its redirect; mail links were explicit. The 404 page's `#main` skip link correctly stays within that 404 document.
- The manifest and worker were served with `no-cache`; hashed assets used one-year immutable caching. CSP, `frame-ancestors`, `nosniff`, referrer, permissions, and frame-denial headers were present.

This is a static local-first PWA, so tenant isolation, server restart persistence, health endpoints, and HTTP 429 handling do not apply. Browser persistence, demo namespace isolation, service-worker offline behavior, and local backup recovery were tested instead.

## Performance and build checks

- `npm ci`: passed; 0 vulnerabilities reported.
- `npm test`: 10/10 passed, including the service-worker update announcement test.
- `npm run build`: passed and emitted `dist/`.
- `node scripts/copy-audit.mjs --check`: passed.
- All 31 exact claim commands: passed separately.
- `npm run test:e2e -- --workers=1`: 74/74 passed.
- Build output: initial app JS 29.04 kB raw / 10.14 kB gzip; lazy XLSX 11.32 kB raw; CSS 20.21 kB raw / 5.12 kB gzip; font 14.71 kB; mobile art 10.33 kB.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.052 s, FCP 0.954 s, TBT 2 ms, CLS 0.

One diagnostic run with retries disabled reached 73/74 before the Chromium process crashed while creating the last mobile context. The failed test never opened the product. That exact mobile case then passed alone without a retry, and the documented full command passed 74/74. This is classified as a transient browser-process failure, not a product finding.

## Earlier findings

| Earlier finding | Current evidence | Disposition |
|---|---|---|
| Verification 1 high — dates could leave the selected quarter | Live boundary bypass was rejected and corrected input saved; `validation` and the unit boundary test passed. | Fixed |
| Verification 1 medium — update notice missed a newly waiting worker | The current capture-based watcher passed its unit test; the live worker matches the candidate. | Fixed |
| Verification 1 medium — production used the pilot checkout | Live and tested link uses `api.sociobot.in`; checkout is USD 1900 one-time. | Fixed |
| Verification 1 medium — Lighthouse performance below 90 | Fresh live performance score was 100 with LCP 1.052 s. | Fixed |
| Verification 1 low — cache, security-header, and manifest MIME gaps | Live immutable asset caching, security headers, and `application/manifest+json` were observed. | Fixed |
| Verification 2 low — generic Undo accessible name | Live control is **Undo deletion** and works by keyboard. | Fixed |
| Review 1 B1 — no safe demo | One-click seeded demo, separate storage, reset, exit, and offline behavior passed. | Fixed |
| Review 1 B2 — no claim registry | 31 claims and 31 unique tags exist; all exact commands passed. | Fixed |
| Review 1 B3 — unclear first screen | Job, audience, action, explanation, and facts fit both first viewports. | Fixed |
| Review 1 B4 — false 200 routes | Demo is real and an unknown route is a designed HTTP 404. | Fixed |
| Review 1 M1 — incomplete metadata and shared structure | Five routes have the required metadata and shared header/footer; route tests and live checks passed. | Fixed |
| Review 1 M2 — route focus and small targets | Heading focus, keyboard paths, and 44 px phone targets passed. | Fixed |
| Review 1 M3 — jargon and inconsistent names | Current copy consistently uses browser, supporter access, receipt file, and accounting software. | Fixed |
| Review 1 m1 — vague action names | Transaction-specific edit/delete names and specific update, backup, restore, and undo labels remain. | Fixed |
| Review 2 F-2-1 — advertised GBP differed from USD checkout | Page, terms, README, claim, and live checkout consistently use US$19/USD 1900. | Fixed |
| Review 2 F-2-2 — supporter benefits were unlisted | `supporter-benefits` tests the badge and both reminder states. | Fixed |
| Review 2 F-2-3 — tax-advice boundary was unlisted | `no-tax-advice` passed. | Fixed |
| Review 2 F-2-4 — device/browser wording differed | Visitor copy uses **this browser**. | Fixed |
| Review 2 F-2-5 — no bulk import | Local CSV mapping, preview, rejection, duplicate, cancel, confirm, reload, and offline paths passed. | Fixed |
| Review 2 F-2-6 — README exposed IndexedDB jargon | README states the safety result; technical namespace detail remains in demo documentation. | Fixed |
| Review 3 F-3-1 — incomplete 404 metadata and stale footer | Live 404 has complete metadata, current shared footer, focus, reload, and status coverage. | Fixed |
| Review 3 F-3-2 — dollar currency was ambiguous | All public price copy says **US$19**. | Fixed |
| Review 3 F-3-3 — undefined “local ledger” wording | README now names Quarter sheet and offline use directly. | Fixed |
| Review 3 F-3-4 — stale copy audit | Reproducible copy audit and its tests passed. | Fixed |
| Review 4 | It reported no findings; every reviewed behavior was rechecked in this round. | Remains clear |

The earlier field-validation gap also remains accurately bounded: the product does not claim acceptance by a named accounting or bridging tool. That is not a defect or an untested public claim.

## Scope check

No additional feature is required for the stated job. CSV import provides the obvious bulk path, while CSV/XLSX export and encrypted backup provide data portability. Account sync would change the local-first privacy model. An AI step would add cost and data transfer without improving the core record-keeping task.

## Evidence locations

Screenshots, URL verifier output, and Lighthouse JSON are under `/work/.evidence/review-5/`. The required report copy is `/work/.evidence/qa-report.md`.
