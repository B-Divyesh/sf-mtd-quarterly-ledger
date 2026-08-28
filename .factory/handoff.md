# Quarter sheet — review 4 handoff

## Outcome

Review 4 is a **PASS**. This reviewer round made no product-code changes. The live PWA at <https://mtd-quarterly-ledger.sociobot.in/> remains clear on first read, tryable in one click, and honest about its local-first boundaries.

The retained polish-3 detail below describes the implementation under review. Review 4 additionally confirmed cold mobile/desktop first-read clarity, live demo reset/exit isolation, all routes/metadata/focus, all links, copy/claim coverage, and every earlier finding.

## What changed

- Added `src/build.ts` as the sole footer build-label value. Home, legal pages, and 404 now render `Built by Param Factory · v1.0.0 · polish 3` from it.
- Added the required `og:url` to `404.html` and strengthened `@claim:route-metadata` to verify every route, including 404 canonical/OG/Twitter metadata, favicon, footer, direct reload, 404 status, h1 focus, and back navigation.
- Rewrote product, README, terms, and claim wording from `$19` to `US$19`; rewrote the README install line without “local ledger”.
- Added `scripts/copy-audit.mjs` and `tests/copy-audit.test.ts`, regenerated `.factory/copy-audit.md`, and included current README/legal/product strings with documented whitespace counts, source-presence checks, banned-word checks, and the 22-word cap.
- Updated the catalog description: `Track quarterly income and expenses for UK sole traders, then export CSV or XLSX.`
- Made the production-checkout probe retry transient server errors while still asserting the observable USD/1900/one-time checkout outcome.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
node scripts/copy-audit.mjs --check
```

To run every declared claim exactly as a verifier does, execute each `test` command in `.factory/claims.json` from a fresh clone. The direct demo is <https://mtd-quarterly-ledger.sociobot.in/?demo=1>; it uses separate `demo:` browser storage and exposes Reset demo and Start for real.

## Exact evidence

- Final clean clone `/tmp/mtd-quarterly-ledger-round3-final.TBKUQj`: `npm ci` (0 vulnerabilities), `npm test` 10/10, `npm run build` passed.
- All 31 claim commands individually passed: `/tmp/mtd-round3-final-claims.NXvF8G` ends `CLAIMS_COMPLETE=31 FAILURES=0`; tag audit found exactly one `@claim:<id>` test for each of 31 IDs.
- Full serial Playwright suite: 74/74 expected, zero skipped/unexpected/flaky, report `/tmp/mtd-round3-final-browser.GO6EdJ`. It includes offline, privacy/network, keyboard/mobile, route, integration, and Playwright Axe serious/critical checks.
- Local `verify-url.sh`: HTTP 200, proper title/lang/h1/main, zero missing alt text, zero unnamed buttons, and zero console errors. Local Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.577 s, CLS 0, TBT 31 ms.
- Live cold audit: `evidence/polish-3/live/check.json`; screenshots include [home mobile](evidence/polish-3/live/home/mobile.png), [demo mobile](evidence/polish-3/live/demo/mobile.png), [404 mobile](evidence/polish-3/live/not-found/mobile.png), and [terms mobile](evidence/polish-3/live/legal/terms-mobile.png). It confirms the demo banner/totals, mobile width 390 px with no overflow, US$ terms price, offline demo reload, and status-404 metadata/focus/footer behavior.
- Live `verify-url.sh` evidence: `evidence/polish-3/live/home/verify.json` shows a 200 response, one h1, main, `en-GB`, zero console errors, zero missing alt attributes, and zero unnamed buttons.

## Review 4 verification

A fresh clone at `/tmp/mtd-review4-clean.8JkngA` ran `npm ci`, then every exact command from `.factory/claims.json` separately. All 31 claim commands passed. A subsequent `npm run test:claims` passed all 37 desktop claim/supporting tests, including offline service-worker reload and network-interception checks. The final Playwright result has status `passed` and no failed tests.

The same clone passed `npm test` (10 tests) and `npm run build` (emitted `dist/`). To repeat the full check:

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:e2e -- --workers=1
node scripts/copy-audit.mjs --check
```

The isolated demo is <https://mtd-quarterly-ledger.sociobot.in/demo/> (also `/?demo=1`). It uses `demo:quarter-sheet-ledger`; Reset reseeds only that namespace and Start for real clears it before opening the real ledger.

## Known gaps

None identified by review 4. The product intentionally does not submit to HMRC, provide tax advice, handle VAT/payroll/bank feeds, or promise compatibility with a particular accounting package.
