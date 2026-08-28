# Polish 2 handoff — accepted

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

## Deployment and live recheck

- Static deployment `9b2cb60f-d202-4ce4-8f5b-185977897bbb` completed successfully through the factory static work-order configuration.
- Cold live home now exposes **Stored in this browser**, **Import CSV**, and **Pay $19 once**. `/`, `/demo/`, `/?demo=1`, `/privacy/`, and `/terms/` return 200; an unknown route returns 404.
- Cold 390px demo has the persistent safe-demo banner, £850.00 income, £164.80 expenses, the Import CSV control, and no error state.
- Live `verify-url.sh` on home, demo, and privacy found no console errors, missing alt attributes, or unnamed buttons. Home title/lang/h1/main are all correct.
- The read-only Sociobot checkout starts in USD and exposes $19.00, price 1900, and `one_time`, matching public product copy and the executed claim test.

No known product gaps remain. The standalone Axe CLI could not launch because its downloaded ChromeDriver does not match the supplied Chromium; the committed Playwright Axe integration passed serious/critical checks on all routes.
