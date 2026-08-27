# Independent verification 2 — PASS

**Verified:** 27 August 2026
**Candidate:** `c49fbbd6f7a85baa7acfdf20de26bcdb2f2ff9ef`
**Live URL:** <https://mtd-quarterly-ledger.sociobot.in/>
**Verdict:** **PASS** — the previous release blockers are fixed in the candidate and the public deployment matches its production build. One low-severity accessibility naming follow-up is recorded below.

## Reproducible checks

The checkout was clean at the candidate SHA before installation. `npm ci` completed with **0 vulnerabilities**. There is no standalone lint script; the exact production build runs `tsc --noEmit`.

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=1
```

- Unit/integration: `npm test` passed **7/7**.
- Typecheck and production build: `npm run build` passed and produced `dist/`.
- Browser suite: `npm run test:e2e -- --workers=1` passed **10/10**, covering desktop and 390×844, online entry, persistence, offline reload, legal pages, keyboard quarter tabs, boundary validation, billing URL, console errors and axe serious/critical findings.
- Build output: entry app JS **21,783 B** (8.15 KB gzip), lazy XLSX **11,316 B** (5.34 KB gzip), CSS **15,853 B** (4.37 KB gzip), local font **14,708 B**, responsive mobile artwork **10,334 B**. All are within the 200 KB JS / 50 KB CSS / 120 KB font / 300 KB mobile-image budgets.

## Independent product exercise

Against the built production app, selected tax year 2026 / Q1 and recorded:

- income on **6 April 2026**: £100.00;
- expense on **5 July 2026**: £12.34.

The ledger showed income **£100.00**, expenses **£12.34**, difference **£87.66**, and **2 transactions**. CSV correctly escaped `Invoice "Q1", client`; XLSX began `PK\x03\x04`; the encrypted backup did not expose that note in its downloaded JSON wrapper. Q1 rejected **6 July 2026** even after `min`/`max` were programmatically removed, with the explicit Q1 range. `1.234` was rejected with the expected two-decimal error. The app exposes local receipt-file input, category/SA103 mapping, legal pages and an explicit no-HMRC-submission boundary.

Deletion asks for a specific confirmation and its reversible toast action works. The source and unit suite also verify wrong-passphrase rejection and backup record round-tripping.

## Browser, accessibility and PWA

- Fresh local desktop and 390px checks: no page errors or online console errors; Playwright axe found **0 serious/critical** WCAG A/AA/2.1AA violations.
- Live 390px: `scrollWidth === innerWidth === 390`, `<html lang="en-GB">`, one `<main>`, one `<h1>`, service-worker controller active, and **0 serious/critical** axe findings. The only console error after intentionally going offline was the expected `net::ERR_INTERNET_DISCONNECTED` fetch; the saved record and offline banner were both present after reload.
- Keyboard/reduced motion: Q1/Q2 arrow navigation passed; Enter/Space operated the transaction type; the primary action had a designed **3px** cyan focus outline; reduced-motion transition duration computed to **0.00001s**; no horizontal overflow at 390px.
- PWA update: a read-only local test server first served the candidate worker and then a `quarter-sheet-v5` byte variant. Calling `registration.update()` produced a waiting worker and the live page UI showed **“A fresh version is ready.”** with **“Update now”**. This directly verifies the repaired open-session update path.
- Offline: local and live installed contexts both retained an entered record and showed the offline banner after `context.setOffline(true)` plus reload.

## Privacy, deployment and policy

- Normal local and live loads made only same-origin requests. There are no analytics, tracking scripts, external fonts or CDNs. The live product source contains the production Sociobot endpoint only; no `pilot-api` reference was found.
- Ledger records are in IndexedDB. Backup is PBKDF2-SHA-256 (310,000 iterations) plus AES-256-GCM, and the tested downloaded wrapper did not contain the entered note. `/privacy` explains local storage, encrypted backup and the license-verification boundary.
- The public checkout URL is `https://api.sociobot.in/api/v1/products/mtd-quarterly-ledger/checkout`; fresh probe returned **303** to hosted Dodo checkout. An invalid-token verify probe returned JSON `{"valid":false,"reason":"invalid"}`.
- SHA-256 comparison found **0 mismatches across the 19 publicly served build files**. `dist/staticwebapp.config.json` correctly returns 404 because it is deployment configuration, not a public asset.
- Live headers include HSTS, CSP (`default-src 'self'`, production billing `connect-src`, `frame-ancestors 'none'`), `X-Frame-Options: DENY`, Permissions-Policy, `nosniff` and strict-origin referrer policy. Manifest is `application/manifest+json` and `no-cache`; worker is `no-cache`; hashed assets are `public, max-age=31536000, immutable`.

## Performance

Fresh Lighthouse mobile collection produced **99 performance / 100 accessibility / 100 best practices / 100 SEO**, FCP **1.0 s**, LCP **1.2 s**, TBT **110 ms**, CLS **0**. Lighthouse then reported `TARGET_CRASHED` during its full-page screenshot artifact; the completed category scores and metrics were written to `/tmp/mtd-lighthouse.json`. The bundle-budget evidence above is unaffected.

## Defects and follow-up

### Low — Undo action has an unhelpful accessible name

The visible recovery control reads “Undo”, but `#toast-action` has `aria-label="Toast action"`, so assistive technology announces the generic label instead of the action. It remains keyboard-operable and deletion has a specific confirmation, so this does not block the release. Change the accessible name to “Undo deletion” (or remove the overriding `aria-label`).

### Known product-validation gap — not a code failure

CSV/XLSX structure was verified, but exports have not yet been accepted by two named bridging tools. The product must continue to avoid claiming that external acceptance until that field validation occurs.
