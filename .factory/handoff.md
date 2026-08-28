# Polish 2 handoff — pending live recheck

## Repair

Commit `72103d0f77ce067978939c9ab2f617b467ef245f` closes every review-1, review-2, and prior low-severity finding. It aligns paid copy with the live one-time $19 USD checkout, adds checked supporter-benefit and no-tax-advice claims, standardizes browser-scoped language, and adds a fully local CSV import flow with mapping, preview, duplicate detection, cancellation, confirmation, demo isolation, and offline use.

The product remains a static Vite TypeScript offline PWA. Its midnight-blue drafting-sheet visual system is preserved; the import flow uses its existing cyan/cream/red-pencil grammar.

## Local verification

- Clean clone `/tmp/mtd-quarterly-ledger-polish2.AQqKer`: `npm ci` passed with 0 vulnerabilities. Every one of the 31 commands declared in `.factory/claims.json` passed independently.
- `npm test`: 8/8 passed.
- `npm run build`: passed and emitted `dist/`.
- `npm run test:e2e -- --workers=1`: 74/74 desktop/mobile tests passed.
- Local URL verification: no console errors, one h1, `lang=en-GB`, main landmark, 0 missing alt attributes, and 0 unnamed buttons. Playwright Axe found 0 serious/critical issues across home, demo, legal, and 404.
- Asset budgets: entry app JS 29.02 kB raw / 10.13 kB gzip; CSS 20.21 kB raw / 5.12 kB gzip; font 14.71 kB; mobile illustration 10.33 kB.

## Run locally

```sh
npm ci
npm test
npm run build
npm run test:e2e -- --workers=1
```

Run the exact claim commands listed in `.factory/claims.json` individually. Deploy `dist/` as the static site output.

## Remaining work

Push and complete the required cold live check of home, demo, legal routes, 404, offline behavior, and the read-only checkout before accepting the repair. Add the resulting deployment and live evidence below.
