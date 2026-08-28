# Repair handoff — perfection loop 1

All eight findings in `.factory/review-1.md` are resolved and deployed. The product remains a static, offline-first PWA with its midnight-blue blueprint drafting-sheet identity.

## Delivered

- A plain first screen for UK sole traders with both first actions and three tested facts above the 390 × 844 fold.
- An isolated, one-click sample ledger at `/demo/` and `?demo=1`, backed by a separate IndexedDB namespace with persistent banner, reset, and discard-on-exit behavior.
- Twenty-eight declared product claims, each with one real outcome test runnable from the clean demo sandbox.
- Transaction CRUD and undo, exact CSV and XLSX exports, receipt validation/persistence, encrypted backup/restore, UK quarter rules, and all 15 category mappings covered end to end.
- Real static routes with individual metadata, h1 focus and announcement, consistent navigation/footer, a status-404 page, and route-aware offline fallback.
- Mobile hit areas, 200% text behavior, keyboard dialogs/tabs, reduced motion, plain copy, and transaction-specific accessible action names.
- Original blueprint artwork and generated-art provenance retained; social artwork is a real 1200 × 630 derivative.
- Catalog description: **Track quarterly income and expenses for UK sole traders, then export CSV or XLSX.**

The exact per-finding closure map and screenshots are in `.factory/polish-1.md`.

## Verification

Final clean clone: `/tmp/mtd-quarterly-ledger-clean-accepted.4nWy1Y`, cloned from deployed code commit `ea420f7` on 28 August 2026.

```sh
npm ci
npm test
npm run build
npm run test:e2e
# Then every exact `test` command in .factory/claims.json, one by one.
```

Results:

- `npm ci`: 0 vulnerabilities.
- `npm test`: 7/7 unit tests passed.
- `npm run build`: passed and emitted `dist/index.html`, `dist/demo/index.html`, both legal routes, `dist/404.html`, the manifest, and service worker.
- `npm run test:e2e`: 68/68 Playwright tests passed with no retry across desktop and 390 px mobile.
- Claim loop: all 28 registry commands passed separately; final marker `CLAIMS_COMPLETE=28`.
- Accessibility: axe reported zero serious/critical findings on home, demo, privacy, terms, and 404 in desktop/mobile coverage. Route focus, dialog focus, keyboard tabs, 44 px targets, 200% text, and reduced motion passed.
- Privacy: demo and real IndexedDB namespaces remained separate. Intercepted ledger flows made no cross-origin requests. Demo mode made no billing request and wrote no supporter token. Standard pages produced no unexpected console errors.
- Offline: a cold demo visit installed the worker; offline reload preserved sample data; CSV and encrypted backup downloads worked; an unknown offline URL returned the designed status-404 page.
- Build sizes: initial app JS 24.49 KB raw/8.75 KB gzip; all JS 36.70 KB raw; CSS 19.95 KB raw/5.09 KB gzip; font 14.71 KB; mobile hero 10.33 KB; desktop hero 55.39 KB.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.057 s, CLS 0, TBT 55 ms.

## Deployment and cold production check

Built and deployed with:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh mtd-quarterly-ledger /work/repo/dist
```

- Azure deployment id: `17f11fa6-3fbd-4da1-92f5-b76d99d54fd8`.
- Live URL: <https://mtd-quarterly-ledger.sociobot.in/>.
- `verify-url.sh`: HTTP 200, 658 ms, no console errors, correct title and language, one h1, main present, no missing alt attributes, no unnamed buttons.
- Cold route checks: `/`, `/demo/`, `/?demo=1`, `/privacy/`, and `/terms/` passed. `/definitely-not-a-real-route` returned HTTP 404 with the correct title and focused h1.
- Cold sample checks: banner and seeded totals appeared immediately; reset removed a temporary entry; exit removed demo changes; root showed no sample records.
- Cold offline checks: demo reloaded with its sample and an unknown URL returned the offline 404.
- Live screenshots: `.factory/evidence/polish-1/live/home-mobile.png`, `demo-mobile.png`, and `not-found-desktop.png`.

## Known gaps

None. No review finding or lower-severity item is deferred.
