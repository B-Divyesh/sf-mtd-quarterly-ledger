# Handoff — Quarter sheet v1

## Shipped

- A production Vite + TypeScript PWA for UK sole traders to record income and expenses across the four 6 April–5 April tax-year quarters.
- IndexedDB persistence for transactions and optional JPG/PNG/WebP/PDF receipts, including editing, specific delete confirmation and an eight-second undo.
- Quarter summaries for income, expenses and the clearly labelled “difference (not profit)”, with the 7 August, 7 November, 7 February and 7 May update dates.
- Income/expense categories mapped to the 2025–26 SA103F full-form boxes, with plain-language descriptions and an explicit guidance/tax-advice caveat.
- Quoted CSV and real OOXML `.xlsx` exports with consistent fields for bridging-tool import. XLSX code is lazy-loaded.
- AES-256-GCM encrypted `.mtdledger` backup/restore for all tax years and receipt files. Keys use PBKDF2-SHA-256 with 310,000 iterations; passphrases never leave the browser.
- Installable manifest, 192/512/maskable icons, versioned service-worker app-shell precache, runtime caching, offline fallback, visible offline state and user-controlled update toast (`skipWaiting` + `clientsClaim`).
- A £19 one-time supporter unlock through the Sociobot hosted checkout, query-token capture, local license restore, cached daily verification and offline optimistic unlock. Free record keeping, receipts, backups, accessibility and exports are not gated. Staging defaults to `pilot-api.sociobot.in`; release should set `VITE_BILLING_BASE=https://api.sociobot.in`.
- `/privacy/` and `/terms/`, an expanded README, MIT license, robots/sitemap files, and no analytics or third-party runtime resources.
- The product-specific “working blueprint” system in `.factory/design.md`, including palette, typography, spacing, interactions and reduced-motion policy. The original factory-generated illustration, prompt sidecars and optimized 55 KB WebP are included.

## Run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

The exact production build command is `npm run build`. Static deployment root is `./dist`; `dist/index.html` is present at its root.

## Verification (27 August 2026)

- `npm test`: 5/5 Vitest tests passed (quarter boundaries/deadlines, safe pence parsing, escaped CSV, valid ZIP/XLSX, encrypted backup round-trip and wrong-passphrase rejection).
- `npm run build`: passed TypeScript strict checking and Vite production build.
- `npm run test:e2e`: 6/6 Playwright tests passed in desktop Chromium and a 390×844 mobile Chromium profile. The suite adds a transaction, confirms totals, waits for the service worker, switches the browser fully offline, reloads and confirms both persisted data and the offline banner. It also covers keyboard arrow tabs, legal routes, console/page errors and axe WCAG A/AA checks.
- `verify-url.sh`: HTTP 200; title present; `lang=en-GB`; exactly one H1; main landmark present; 0 images missing alt; 0 unlabeled buttons; 0 console errors. Recorded load was 625 ms locally.
- Lighthouse mobile: **100 performance / 100 accessibility / 100 best practices / 100 SEO**. LCP 1,731 ms; CLS 0; total blocking time 0 ms. Lab runs do not report a meaningful post-load INP; interactions in Playwright completed without delay.
- Production budgets: initial JS 21.43 KB (8.07 KB gzip), lazy XLSX chunk 11.36 KB, CSS 15.73 KB (4.32 KB gzip), font 14.71 KB, hero WebP 55.39 KB. All are well below the 200/50/120/300 KB budgets.
- Desktop and 390px full-page screenshots were visually reviewed. Focus indicators, touch targets, reflow, empty/loading/error/offline states and reduced-motion rules are present.

## Known gaps and next steps

- Version 1 deliberately does not submit to HMRC. Recognition, production credentials and HMRC API submission require external approval and must not be implied before that work is complete.
- CSV/XLSX are syntactically verified generic import files, but acceptance has not yet been field-tested with two named bridging products. Test each target importer and publish any required mapping template before the 7 August deadline.
- Category labels track the published 2025–26 SA103F full-form boxes and should be reviewed against HMRC guidance for each new tax year. The app does not calculate disallowable proportions, capital allowances, VAT, payroll or accounting adjustments.
- Browser storage is intentionally device-local. Users must keep external encrypted backups; clearing site data can erase the live ledger.
- The factory must register/confirm the paid product and switch the billing base from pilot to production for release.
