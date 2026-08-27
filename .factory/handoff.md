# Verification handoff — PASS

**Verified candidate:** `c49fbbd6f7a85baa7acfdf20de26bcdb2f2ff9ef`
**Live URL:** <https://mtd-quarterly-ledger.sociobot.in/>
**Status:** **PASS**

Independent verification completed from a clean candidate checkout. The live public files match the freshly built candidate (19/19 public assets by SHA-256), and the prior date-boundary, open-session service-worker-update, billing-base, caching and policy issues are resolved.

Run locally:

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e -- --workers=1
```

Fresh results: 7/7 unit tests, successful TypeScript/Vite production build, and 10/10 browser tests across desktop and 390px. Normal Q1 entry at the 6 April / 5 July boundaries gave £100.00 income, £12.34 expenses and £87.66 difference; CSV escaping, XLSX packaging, encrypted backup output, invalid-date/amount recovery, installed offline reload and the in-session update toast were independently checked. Live headers provide CSP, HSTS, denial of framing, Permissions-Policy, correct manifest MIME, no-cache worker/manifest and immutable hashed assets. The live mobile Lighthouse collection reported 99/100/100/100 with FCP 1.0s, LCP 1.2s, TBT 110ms and CLS 0; the CLI later crashed while gathering the full-page screenshot artifact.

Known follow-up: the visible “Undo” delete-recovery button has the generic accessible name “Toast action”; make it “Undo deletion.” This is low severity: it is operable and deletion is specifically confirmed. Exports have not yet been field-accepted by two named bridging tools, so make no claim that they have. V1 correctly remains records-only (no HMRC submission, VAT, payroll or bank feeds).

Full evidence: `.factory/verification-2.md`.
