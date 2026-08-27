# Handoff — Quarter sheet release repair

**Release:** deployed to <https://mtd-quarterly-ledger.sociobot.in/> on 27 August 2026 as Azure Static Web Apps **Standard** (deployment `faef03ec-53f3-4ffd-88a8-3d9079c7f324`).

## What changed

- Dates are now validated in application logic as well as by the date input. A record can only be saved if it is a real calendar date inside the selected tax quarter; the error gives that quarter's exact range.
- The service-worker listener captures the worker from `updatefound`, so the “A fresh version is ready” toast appears as soon as a new worker reaches `waiting` in an open page. Update still uses `skipWaiting`/`clientsClaim`; encrypted local data, exports, receipts and offline behaviour are unchanged.
- Supporter purchase and verification now default to the registered production API. The public checkout is `https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout`; its live response was a 303 to the Dodo checkout, and an invalid-token verify response was valid JSON with `valid: false`.
- The artwork and font are Vite-hashed production assets. Mobile gets a 10.3 KB 420px responsive artwork and the non-critical illustration is lazy decoded; production sourcemaps are no longer published.
- `staticwebapp.config.json` now ships with the static build: CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, Permissions-Policy, `nosniff`, referrer policy, manifest MIME `application/manifest+json`, `no-cache` for worker/manifest, and one-year immutable caching for `/assets/*` hashes.

## Exact regressions added

- Unit: Q1 accepts 6 April and 5 July, rejects 5 April, 6 July and invalid calendar dates.
- Unit: an update worker is announced after `registration.installing` has become `null` at the installed/waiting transition.
- E2E: clears the date input's min/max attributes, attempts to save 6 July into Q1, requires the range error and confirms no Q2 record is created.
- E2E: asserts the production checkout URL.

## Run and verify

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Results from this clean checkout:

- `npm test`: **7/7** passed.
- `npm run build`: passed TypeScript and Vite. Initial app JavaScript is **21.78 KB** (8.15 KB gzip), CSS **15.85 KB** (4.37 KB gzip), self-hosted hashed font **14.71 KB**, lazy XLSX **11.32 KB**, mobile illustration **10.33 KB**. `dist/` is the deployment root.
- `npm run test:e2e`: **10/10** passed over desktop and 390×844 mobile. This includes entry persistence, mobile offline reload, legal pages, keyboard tabs, the boundary bypass, production link, axe WCAG A/AA serious/critical checks and no load errors.
- Live 390×844 browser check: created a record, waited for the live service worker, forced offline, reloaded, and confirmed persisted data plus the offline banner with **0** console errors.
- Live headers: root has CSP, Permissions-Policy, `X-Frame-Options: DENY`; `manifest.webmanifest` is `application/manifest+json`; a hashed app JS asset is `Cache-Control: public, max-age=31536000, immutable`.
- Live mobile Lighthouse (Chromium, mobile form factor): **100 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP **1.0 s**, LCP **1.1 s**, TBT **0 ms**, CLS **0**.

## Known gaps

- Version 1 records and exports data only; it does not submit to HMRC or claim recognition as HMRC submission software.
- CSV/XLSX are syntactically tested generic import files. Acceptance has not been field-tested with two named bridging products.
- Browser storage remains device-local. Users should retain encrypted backups and review category guidance for each tax year.
