# Review handoff — adversarial first-read review 2

## Work completed

- Reviewed live production cold at 390 × 844 and 1440 × 900.
- Exercised the one-click demo, sample visibility, reset, exit/discard, real/demo storage namespaces, offline reload, and request isolation.
- Ran every command in `.factory/claims.json` separately from a clean clone.
- Re-ran unit, build, and full desktop/mobile browser suites.
- Crawled live links and audited titles, metadata, status codes, route focus/back behavior, console output, axe results, visual identity, copy, claims, and every review-1 finding.
- Wrote the full result to `.factory/review-2.md`. No product code was modified.

## Verdict

**FAIL — 4 blocking findings, 1 major finding, and 1 minor finding.**

The primary blocker is a live billing mismatch: product, README, terms, and claim say **£19 once**, while the production Dodo checkout renders **$19.00** and embeds USD currency. The automated price test passes because it does not inspect the checkout outcome. Two visitor promises are also absent from the claim registry, and browser-scoped data is still described inconsistently as device-scoped data.

## Verification

Clean clone: `/tmp/mtd-review2-clean.IkL9sV` at `d1e075055835a50765ffecff0ae85f3d2921bad8`.

- `npm ci`: PASS, zero vulnerabilities.
- All 28 exact claim commands: process PASS; final marker `CLAIMS_COMPLETE=28 FAILURES=0`.
- `npm test`: PASS, 7/7.
- `npm run build`: PASS; `dist/` emitted.
- `npm run test:e2e -- --workers=1`: all 68 tests passed after one Chromium-process crash retried successfully.
- `/opt/fleet/lib/verify-url.sh`: PASS; no console errors, missing alt attributes, or unnamed buttons.
- Live home/demo/legal/404 axe: zero serious/critical findings.
- Live routes: `/`, `/demo/`, `/privacy/`, `/terms/` return 200; unknown path returns designed 404.
- Link crawl: internal links resolve; external checkout resolves to Dodo but exposes the wrong currency.
- Live demo: seeded totals visible in the first mobile viewport; reset and discard-on-exit work; offline reload works; no cross-origin demo request observed.

## Work remaining

Resolve F-2-1 through F-2-6 in `.factory/review-2.md`, deploy, then repeat the entire adversarial review. Do not accept a passing local `supporter-price` test until it verifies the production checkout amount and currency.
