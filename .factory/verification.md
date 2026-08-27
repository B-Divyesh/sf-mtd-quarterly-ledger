# Independent verification — FAIL

**Verified on:** 27 August 2026

**Candidate:** `9304e2aede43b9f7904119820a14da40744557b5`

**Live URL:** <https://mtd-quarterly-ledger.sociobot.in/>

**Verdict:** **FAIL** — the candidate is buildable and the deployed files match it exactly, but release blockers remain in quarterly-record integrity, PWA updating, live billing configuration, and the requested performance target.

## Scope and reproducibility

The checkout was clean and at the candidate SHA before verification. Run the core checks with:

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run preview
npm run test:e2e
```

`npm run build` includes `tsc --noEmit`; no standalone lint script is defined. The first E2E attempt correctly identified the clean container's missing Playwright browser executable. After the documented `npx playwright install chromium` prerequisite, all browser tests ran.

## Passed evidence

- `npm ci`: installed the lockfile cleanly; npm audit reported 0 vulnerabilities.
- `npm test`: **5/5** Vitest tests passed.
- `npm run build`: passed TypeScript and Vite production build. Output: initial app JS **21,432 B** (8.07 KB gzip), lazy XLSX JS **11,358 B**, CSS **15,731 B** (4.32 KB gzip), font **14,708 B**, hero WebP **55,388 B** — within the declared 200/50/120/300 KB static budgets.
- `npm run test:e2e`: **6/6** passed after Chromium installation, across desktop and the configured 390×844 mobile profile. This covers entry persistence, offline reload, keyboard quarter tabs, legal pages, load errors and axe WCAG A/AA serious/critical findings.
- Independent normal/recovery workflow: Q1 boundary income on 6 April and expense on 5 July produced £100.00 income, £12.34 expenses, £87.66 difference and two transactions. CSV correctly escaped `Invoice "Q3", client`; XLSX began `PK\x03\x04`; a downloaded encrypted backup did not expose the note, and restoring it after deletion returned the transaction.
- Malformed amount `1.234` was rejected with “Enter a positive amount with no more than two decimal places.”
- Local and live desktop/mobile browser checks: no online page/console errors; axe had **0 serious/critical** findings; skip link, tab sequence, 3px cyan visible focus, dialog initial focus and Escape close worked. At 390px `scrollWidth === clientWidth === 390`. Under reduced motion, the primary-button transition computed to `0.00001s`.
- PWA offline reload passed locally and on the live 390px deployment: persisted ledger data and the offline banner were present after `context.setOffline(true)` and reload. The live offline reload did emit the expected browser `net::ERR_INTERNET_DISCONNECTED` resource console message while the application handled it and remained usable.
- Candidate/deployment parity: SHA-256 comparisons found **no mismatches across all 22 files in `dist/`** (root/legal/offline pages, service worker, manifest, assets, font and icons). Root HTML, worker, manifest, app and CSS were also individually checked.
- Privacy/outbound requests: a normal load made no cross-origin request and includes no analytics/CDN resources. The only declared external endpoint is the supporter checkout. Ledger data stays in IndexedDB; the backup implementation uses PBKDF2-SHA-256 (310,000) and AES-256-GCM.
- Live security transport headers include HSTS, `nosniff`, and `strict-origin-when-cross-origin` referrer policy.
- Live mobile Lighthouse: accessibility **100**, best practices **100**, SEO **100**; LCP **1.4 s**, FCP **1.0 s**, CLS **0**.

## Defects

### High — selected-quarter date boundary is silently bypassed

The entry dialog sets date `min`/`max` to the selected quarter but its form has `novalidate`, and `handleEntrySubmit` only checks that a date is present. In a Q1 dialog, entering **2026-07-06** (the first day of Q2) and saving succeeds without warning. The entry disappears from Q1 and appears in Q2, so a user can believe a Q1 record was saved while exporting an incomplete Q1 total.

Reproduced in the built app: after normal Q1 entries, Q1 remained at 2 transactions and Q2 showed the silently accepted third transaction. This defeats the displayed date constraint in the core quarterly-ledger workflow.

### Medium — a newly installed service-worker update does not show the in-app update toast

Using a read-only test server that served the candidate worker once as `quarter-sheet-v3` and then served an otherwise identical `quarter-sheet-v4`, `registration.update()` created a `waiting` worker (`swRequests: 2`) but `#toast-message` stayed empty and hidden. The `updatefound` handler re-reads `registration.installing` in the `statechange` callback; by `installed` it has become `null`, so `announce()` is skipped. The toast does appear only after a later page reload sees `registration.waiting`.

This does not meet the requested visible, in-app PWA update path during an open session.

### Medium — live production URL still points paid checkout at the pilot billing API

The live byte-matched candidate links “Buy supporter unlock” to `https://pilot-api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout`, not the required production `https://api.sociobot.in/...` endpoint. The free ledger remains usable, but supporter checkout on the public production URL is not release-configured.

### Medium — live mobile Lighthouse performance target missed

The live mobile Lighthouse run scored **88 performance**, below the required 90. The measured TBT was **480 ms** (LCP still passed at 1.4 s). The report also identified the fixed 768px hero image as 29 KB of avoidable mobile transfer.

### Low — deployment hardening/caching gaps

- Hashed JS, CSS and font files are served with `Cache-Control: public, must-revalidate, max-age=30`, rather than long-lived immutable caching requested for hashed static assets.
- The live deployment has no `Content-Security-Policy`, `X-Frame-Options`/CSP `frame-ancestors`, or `Permissions-Policy` header.
- `manifest.webmanifest` is served as `application/octet-stream` rather than a manifest/JSON MIME type. Chromium loaded the app without a console error in this check, but this is less interoperable than the PWA contract calls for.

## Brief and claims assessment

The candidate substantially implements the brief's local-first data model, income/expense entry, HMRC category mapping, due dates, CSV/XLSX export, local receipt storage, encrypted backup, no-HMRC-submission boundary, legal pages and privacy language. It does not establish the brief's separate success condition that exports are accepted by two named bridging tools; the existing handoff correctly calls that unverified.

Do not release as PASS until the high/medium defects are fixed and independently rechecked. The low deployment findings should be addressed by the static-host configuration alongside the product fixes.
