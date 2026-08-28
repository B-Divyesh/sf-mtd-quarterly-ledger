# Perfection loop 1 — finding closure

Reviewed source: `.factory/review-1.md`. No earlier `.factory/review-*.md` or `.factory/polish-*.md` files existed when this round began.

Deployed product: <https://mtd-quarterly-ledger.sociobot.in/>

Deployed demo: <https://mtd-quarterly-ledger.sociobot.in/demo/> and <https://mtd-quarterly-ledger.sociobot.in/?demo=1>

## Finding map

| Finding | Change made | Evidence |
|---|---|---|
| B1 — missing and unsafe demo | Added the first-screen **Try it with sample data** link. `/demo/` and `?demo=1` seed three realistic Q2 records in `demo:quarter-sheet-ledger`, never read `quarter-sheet-ledger`, and show the persistent sample-data banner. **Reset demo** reseeds; **Start for real** deletes the demo database and `demo:` preferences. Added `.factory/demo.md`. | `@claim:demo-isolation`, `@claim:demo-reset`, `@claim:billing-isolation`; [local mobile demo](evidence/polish-1/demo-mobile-first.png); [live mobile demo](evidence/polish-1/live/demo-mobile.png). Cold live checks saw the banner, £850.00 income, £164.80 expenses, reset removal, exit removal, and a direct `?demo=1` sample load. |
| B2 — absent claim registry | Added `.factory/claims.json` with 28 claims. Each has one matching observable Playwright test and an exact per-claim command. Tests inspect downloaded CSV/XLSX/backup contents, browser databases, network requests, service-worker behavior, routes, metadata, files, and entitlements. | `tests/e2e/claims.spec.ts`; clean clone `/tmp/mtd-quarterly-ledger-clean-accepted.4nWy1Y` printed `CLAIMS_COMPLETE=28` after executing every registry command separately. The full clean-clone matrix passed 68/68. |
| B3 — unclear first screen | Replaced the metaphor with **Track quarterly income and expenses** and the reviewed UK sole-trader/MTD sentence. Both sample and real first actions plus three tested facts now sit above the 390 × 844 fold. Demo mode removes landing decoration so sample totals are visible immediately. | `@claim:keyboard-mobile`, `@claim:local-only`, `@claim:offline-reload`, `@claim:free-core`; [local home](evidence/polish-1/home-mobile.png); [live home](evidence/polish-1/live/home-mobile.png). The live bounding-box audit placed both actions within 844 px and the demo net total within its first viewport. |
| B4 — false 200 routes | Added explicit static `/demo/`, `/privacy/`, `/terms/`, and blueprint 404 outputs. The preview server and Azure configuration return status 404 for unknown paths; the offline worker synthesizes the same 404 page and status. | `@claim:route-metadata`, `@claim:offline-reload`; [local 404](evidence/polish-1/not-found-desktop.png); [live 404](evidence/polish-1/live/not-found-desktop.png). Live: valid routes 200; `/definitely-not-a-real-route` 404 with title **Page not found — Quarter sheet**; `/offline-missing-route` also 404 offline. |
| M1 — metadata and skeleton | Added route-specific titles, descriptions, canonicals, OG/Twitter metadata, Apple touch icon, 1200 × 630 product artwork, demo sitemap entry, shared header/footer, Demo/How it works/Privacy navigation, build id, and the three-step section. | `@claim:route-metadata`, `@claim:artwork-provenance`, `@claim:production-build`; live title/route audit and Lighthouse SEO 100. |
| M2 — focus and touch targets | Route entry, reload, back/forward, and legal navigation focus and announce the destination h1. Brand, navigation, legal, row, receipt, and dialog controls have 44 px hit areas. Quarter tabs retain arrow-key behavior. Reduced motion and 200% text layouts are tested. | `@claim:keyboard-mobile`, `@claim:reduced-motion`, `has no serious accessibility issues or load errors on every route`; live axe serious/critical count 0 on home, demo, privacy, terms, and 404; Lighthouse accessibility 100. |
| M3 — jargon and naming | Rewrote the hero and feature copy in plain words, defined the HMRC self-employment form reference, changed **Receipt photo** to **Receipt file**, and use **supporter access** consistently. Visitor copy no longer exposes implementation terms. | `.factory/copy-audit.md`; `@claim:category-map`, `@claim:receipt-files`, `@claim:supporter-price`, `@claim:license-verification`; copy audit has no sentence over 22 words and no banned term. |
| m1 — vague action names | Row controls now include each transaction name. Renamed controls to **Install update**, **Back up or restore records**, **Restore supporter access**, and accessible **Undo deletion**. | `@claim:ledger-core`, `@claim:keyboard-mobile`, `dialogs manage focus and keyboard submission`; `verify-url.sh` reports `buttonsUnlabeled: 0`. |

## Claim acceptance

All registry tests passed individually from the clean clone:

- Demo and privacy: `demo-isolation`, `demo-reset`, `local-only`, `billing-isolation`, `no-hmrc-submission`, `no-analytics-account`, `no-vat-payroll-bank`, `security-privacy`.
- Ledger and files: `offline-reload`, `ledger-core`, `entry-persistence`, `csv-export`, `xlsx-export`, `receipt-files`, `encrypted-backup`, `backup-crypto`, `validation`.
- UK-quarter behavior: `category-map`, `quarter-rules`.
- Access and presentation: `keyboard-mobile`, `reduced-motion`, `free-core`, `license-verification`, `supporter-price`.
- Delivery: `pwa-install`, `route-metadata`, `artwork-provenance`, `production-build`.

## Final evidence

- Clean clone: `npm ci` found 0 vulnerabilities; `npm test` 7/7; `npm run build` passed; `npm run test:e2e` 68/68 with no retry; every one of the 28 claim commands passed.
- Build: initial app JS 24.49 KB raw/8.75 KB gzip; all JS 36.70 KB raw; CSS 19.95 KB raw/5.09 KB gzip; font 14.71 KB; mobile hero 10.33 KB.
- Live `verify-url.sh`: HTTP 200 in 658 ms; no console errors; `lang=en-GB`; one h1; main present; 0 missing alt attributes; 0 unnamed buttons.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.057 s, CLS 0, TBT 55 ms.
- Live browser audit: zero serious/critical axe findings on five routes, no unexpected console errors, demo isolation/reset passed, offline demo reload passed, offline 404 passed.
- Deployment id: `17f11fa6-3fbd-4da1-92f5-b76d99d54fd8`.

Every review-1 finding is closed. No deferred minor item remains.
