# Visual thesis: the working blueprint

## Direction

This ledger is a **blueprint drafting sheet** rather than a miniature accounting suite. The interface borrows the certainty of a measured plan: midnight-blue paper, cyan construction lines, cream annotation labels, ruled totals, registration crosses and red pencil marks for attention. It should feel like a dependable working document made for one practical job—not financial software with decorative dashboards.

The single-mode dark blueprint treatment is intentional. It gives the product a recognisable identity, keeps receipt imagery legible against a consistent surface, and makes the four-quarter plan visible as one sheet. Printed/exported records remain plain white documents.

## Tokens

- Blueprint ground `#071b2e`; deep ground `#04121f`; raised sheet `#0d2941`; inset `#0a2238`.
- Primary ink `#f5f1df`; secondary ink `#b8c8d6`; construction line `#2e6280`; faint grid `rgba(91, 194, 224, .08)`.
- Cyan action `#63d4f2` with deep contrast ink `#03141f`; focused cyan `#9ce9fa`.
- Cream annotation `#f4dda1`; success `#6ed6a4`; warning `#ffc66d`; danger/red pencil `#ff817a`.
- Text/background pairs are designed to exceed WCAG AA. Muted copy stays `#b8c8d6` on all dark surfaces.

## Type and spacing

- Headings and labels: self-hosted **IBM Plex Mono**, a technical drafting voice with clear numerals.
- Body: the system sans stack for fast, familiar reading. No font CDN. One locally shipped WOFF2 subset is preloaded and `font-display: swap`.
- Scale: 12 / 14 / 16 / 20 / 28 / 40 px. Body never below 16px. Numeric totals use tabular figures.
- An 8px base grid with 4px micro-spacing; section gaps 24–40px; working width 1180px. Corners are clipped or 2–8px, like tools and paper rather than soft consumer cards.

## Interaction grammar

- The main action is a cyan “Add transaction” drafting tab; secondary actions are outlined controls.
- Active quarters are pinned with a cyan top rule and explicit “Current” label, never colour alone.
- Entries read as ruled ledger rows. Summary amounts sit on annotation strips rather than generic cards.
- Dialogs rise from the originating control by 8px over 180ms. Saved rows briefly receive a cyan wash; the update toast slides from the bottom sheet edge.
- Destructive changes require specific confirmation; deletions are reversible for eight seconds.

## Motion policy

Only opacity and transform animate, 160–220ms with ease-out. No ambient or looping motion. Under `prefers-reduced-motion: reduce`, transitions and smooth scrolling become instant while hierarchy, focus and status remain unchanged.

## Asset plan and provenance

- One generated empty-state/intro illustration: an overhead architectural drafting desk where a quarterly ledger is being measured into four sections, used to explain the product's four-period mental model. It contains no people, brands or rendered words.
- Authored SVG registration marks and PWA icons use only product tokens.
- Hero prompt (taxonomy: productivity-visual): “Overhead editorial still-life illustration on a deep navy blueprint drafting table; a clean cream ledger sheet divided precisely into four quarterly panels with abstract ruled lines and small receipt slips; cyan technical pencil, brass ruler, set square, one restrained coral correction mark; crisp screen-print and paper-cut texture, subtle cyan grid, practical and calm, generous negative space, orthographic top-down composition, no readable text, no numbers, no logo, no watermark, no people, no hands, no gradients.”
- Generated with the factory Azure image deployment (`factory-image`) on 27 August 2026 using `/opt/fleet/lib/gen-image.sh`. Original generation is retained in `assets/src/` with a JSON prompt sidecar; production WebP is optimized to ≤300 KB.

## Why it fits

Sole traders already understand notebooks, receipts and ruled totals. The blueprint metaphor adds structure without implying that the app is doing tax work on their behalf: users place each line, see how it maps, and export the measured result. The visual system makes a regulatory obligation feel finite—four boxes on one working sheet.
