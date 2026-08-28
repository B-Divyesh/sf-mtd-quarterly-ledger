# Quarter sheet — polish 3 handoff

## Outcome

Repair commit `f348489c6c2377aa93d16d3b05a2f4c052b741db` closes every finding in reviews 1–3 and the earlier verification notes. It is pushed to `main` and deployed as the static PWA at <https://mtd-quarterly-ledger.sociobot.in/>.

This round fixes the incomplete 404 route contract, makes all public prices explicitly **US$19**, removes the remaining README storage jargon, and makes copy-audit evidence reproducible in CI. The product retains its blueprint drafting-desk visual identity, offline/local-first architecture, and isolated one-click demo.

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

## Known gaps

No acceptance finding or product claim is left unverified. The app deliberately does not claim that a particular accounting or bridging service accepts its exports; users should check their own software’s import requirements.
