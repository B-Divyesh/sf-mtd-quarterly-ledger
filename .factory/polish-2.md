# Perfection loop 2 — finding closure

Reviewed sources: `.factory/review-1.md`, `.factory/polish-1.md`, `.factory/review-2.md`, and `.factory/verification-2.md`.

Candidate repair: `72103d0f77ce067978939c9ab2f617b467ef245f`.

## Finding map

| Finding | Change made | Evidence | Live URL check |
|---|---|---|---|
| B1 — unsafe/missing demo | Retained the isolated `demo:` database, direct `/demo/` and `?demo=1` entry, reset/exit controls, and now prove CSV import is also isolated. | `@claim:demo-isolation`, `@claim:demo-reset`, `@claim:billing-isolation`; [demo mobile](evidence/polish-2/local/demo-mobile.png) | To be rechecked after push: `/demo/`, `/?demo=1` |
| B2 — untested visitor promises | Expanded the registry to 31 entries. Each ID has exactly one tagged observable test; added import, paid benefits, and no-tax-advice coverage. | Clean clone ran all 31 exact commands separately; `CLAIM_TAGS_OK=31` source audit | To be rechecked after push: `/`, `/demo/`, `/terms/` |
| B3 — first-screen clarity | Preserved the reviewed plain headline, UK sole-trader sentence, adjacent demo/real actions, and three facts above the 390px fold. | `@claim:keyboard-mobile`; [home mobile](evidence/polish-2/local/home-mobile.png) | To be rechecked after push: `/` at 390 × 844 |
| B4 — false routes | Preserved real demo/legal/static 404 routes with titles, focus, and status behavior. | `@claim:route-metadata`, `@claim:offline-reload` | To be rechecked after push: unknown path returns 404 |
| M1 — metadata and common structure | Preserved route titles, canonicals, social metadata, common navigation/footer, sitemap, and three-step explanation. | `@claim:route-metadata`, `@claim:production-build` | To be rechecked after push: home, demo, legal routes |
| M2 — focus and touch targets | Preserved heading focus/announcements, 44px controls, keyboard quarter tabs, and reduced-motion behavior. | `@claim:keyboard-mobile`, `@claim:reduced-motion`, Playwright Axe suite | To be rechecked after push: keyboard navigation at 390px |
| M3 — jargon and inconsistent names | Replaced every visitor-facing “this device” with “this browser”; README demo copy no longer exposes IndexedDB. | `@claim:local-only`; source audit finds no current visitor-facing `this device` | To be rechecked after push: `/`, `/privacy/`, `/terms/` |
| m1 / verification low — vague control names | Retained specific row labels and the accessible **Undo deletion** label. | `@claim:ledger-core`, `verify-url.sh` reports zero unnamed buttons | To be rechecked after push: delete/undo flow |
| F-2-1 — price mismatch | Changed all public paid copy and `supporter-price` to the actual one-time **$19 USD** checkout. The test follows the read-only production checkout and asserts price 1900, USD, and `one_time`. | `@claim:supporter-price` | To be rechecked after push: Sociobot checkout shows $19.00 USD |
| F-2-2 — unlisted paid benefits | Added a real accessible supporter badge and the `supporter-benefits` claim. It verifies the due and dated-last-backup states using a recorded valid response. | `@claim:supporter-benefits` | To be rechecked after push: valid supporter token flow |
| F-2-3 — unlisted tax-advice boundary | Added `no-tax-advice`, which exercises category, entry, import, export, and support flows and rejects personal-tax output. | `@claim:no-tax-advice` | To be rechecked after push: landing and terms boundary |
| F-2-4 — browser/device mismatch | Standardized the header, fact, empty state, save message, restore warning, and supporter state to **this browser**. | `@claim:local-only`, copy audit | To be rechecked after push: `/` and `/demo/` |
| F-2-5 — no bulk import | Added local CSV import with column mapping, category choice, parser validation, rejected-row preview, duplicate detection, cancel, explicit confirmation, bundled sample, offline use, persistence, and demo isolation. | `@claim:csv-import`, `@claim:demo-isolation`, `tests/ledger.test.ts`; [demo mobile](evidence/polish-2/local/demo-mobile.png) | To be rechecked after push: `/demo/` Import CSV |
| F-2-6 — README implementation jargon | Rewrote the visitor demo explanation to describe separate browser storage; namespace details remain only in `.factory/demo.md`. | README/source audit | To be rechecked after push: repository README |

## Local evidence before deployment

- Clean clone `/tmp/mtd-quarterly-ledger-polish2.AQqKer` at `72103d0`: `npm ci` reported 0 vulnerabilities; all 31 declared claim commands passed separately with no failure artifacts.
- `npm test`: 8/8 passed.
- `npm run build`: passed; `dist/` emitted. Initial app JS: 29.02 kB raw / 10.13 kB gzip; CSS: 20.21 kB raw / 5.12 kB gzip; font: 14.71 kB; mobile art: 10.33 kB.
- `npm run test:e2e -- --workers=1`: 74/74 desktop/mobile tests passed, including offline, privacy, accessibility, and route checks.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ .factory/evidence/polish-2/local/verify`: title, `en-GB`, one h1, main, alt text, and console checks pass; no unnamed buttons.
- Playwright Axe integration found zero serious/critical violations on home, demo, privacy, terms, and 404. The standalone Axe CLI was attempted but its downloaded ChromeDriver does not match the supplied Chromium; the integrated Playwright Axe run is the authoritative browser audit.

Post-deployment evidence is appended after the static publish completes.
