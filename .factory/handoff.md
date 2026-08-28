# Repair handoff — perfection loop 1

This repair resolves every blocking finding in `.factory/review-1.md` while retaining the midnight-blue blueprint drafting-sheet identity.

## Delivered

- Replaced the first screen with the reviewed plain-language job, audience, one-click sample action, real first action, and three tested facts. The 390 × 844 px first screen exposes both actions without scrolling.
- Added `/demo/` and `?demo=1` sample mode. It seeds tutoring income, workshop materials, and client travel in `demo:quarter-sheet-ledger`; real records remain in `quarter-sheet-ledger`. The persistent demo banner offers reset and exit.
- Added `.factory/demo.md`, `.factory/claims.json`, `.factory/copy-audit.md`, and 16 tagged sandbox claim tests.
- Added static `/demo/` build output, a blueprint-styled `404.html`, status-404 hosting override, distinct route titles/canonicals/social metadata, generated-art-derived 1200 × 630 social image, legal navigation, heading focus, live announcements, and 44px mobile controls.
- Added a three-step “How it works” section, consistent “supporter access” language, explicit row control names, and the corrected receipt-file label.

## Verification evidence

Executed in this workspace on 28 August 2026:

```sh
npm ci
npm run build
npm test
npm run test:e2e
node -e '... verify every claim id appears exactly once as @claim:<id> ...'
git diff --check
```

Results:

- `npm run build` passed. `dist/` contains `index.html`, `demo/index.html`, legal pages, and `404.html`.
- `npm test` passed: 7/7 unit tests.
- `npm run test:e2e` passed: 42/42 Playwright checks, serially across desktop and 390 px mobile. This includes axe serious/critical checks, offline reload with `context.setOffline(true)`, demo namespace isolation/reset, downloads, receipt persistence, encrypted-backup opacity, route focus, keyboard tabs, and network interception.
- Claims registry validation printed: `claims: 16 each tagged exactly once`.
- A separate clean clone at `/tmp/mtd-quarterly-ledger-clean.7n2kbX` passed `npm ci`, `npm run build`, `npm test`, and `npm run test:e2e` (42/42). It then ran all 16 commands declared in `.factory/claims.json`, one at a time, with a passing final Playwright result.
- Production-size build output: initial app JS 22.84 KB (8.38 KB gzip), CSS 18.11 KB (4.83 KB gzip), local font 14.71 KB, mobile hero 10.33 KB, desktop hero 55.39 KB. All are below the static PWA budgets.
- Static preview returned 200 for `/demo/`; the deployed Azure Static Web Apps configuration now has no navigation fallback, so unknown paths reach the configured 404 response rewrite with status 404.
- Deployed through `/opt/fleet/lib/deploy-static.sh mtd-quarterly-ledger /work/repo/dist`. Post-deploy `verify-url.sh` passed at `https://mtd-quarterly-ledger.sociobot.in` (HTTP 200, 842 ms load, no console errors, title/lang/one h1/main/alt checks passed). Direct live checks returned `/demo/` 200 and `/definitely-not-a-real-route` 404 with title `Page not found — Quarter sheet`.

## Run and deploy

```sh
npm ci
npm run build
npm test
npm run test:e2e
```

Deploy `dist/` as the static artifact. The factory deployment uses `public/staticwebapp.config.json` copied into `dist/` for headers and the 404 response override.

## Known gaps

None known. Lighthouse was not run in this container; bundle-size evidence and automated accessibility coverage are recorded above.

Repair commit: `291342f02001599aae4090cf9a276b351f172693` (amended only to record this clean-clone evidence).
