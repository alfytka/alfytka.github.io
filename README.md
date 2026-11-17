# alfytka.github.io

Portfolio of Alfitka Haerul Kurniawan, front-end developer. Live at **https://alfytka.github.io**.

The site is laid out like the data tools I build: two-column ledger rows, a career timeline drawn to scale,
and two interactive specimens.

## Why specimens instead of screenshots

My work is internal software at Universitas Terbuka, so the real screens can't be published. Each specimen
rebuilds a pattern from that work with dummy data. Nothing is sent anywhere; there is no backend.

| Specimen | What it shows | Source |
|---|---|---|
| 01 — Filterable data table | Sorting, search, period and status filters, pagination, bulk selection, CSV export (TanStack Table v9) | [`InvoiceTable.tsx`](src/components/specimens/InvoiceTable.tsx), seeded data in [`invoices.ts`](src/components/specimens/invoices.ts) |
| 02 — Form and the schema behind it | Validation that explains itself; the schema on the right highlights the rule each error comes from (React Hook Form + Zod 4) | [`EnrollmentForm.tsx`](src/components/specimens/EnrollmentForm.tsx), schema in [`enrollment.ts`](src/components/specimens/enrollment.ts) |

## Stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 · TanStack Table v9 ·
React Hook Form · Zod 4. Fonts are self-hosted: Host Grotesk and Fragment Mono (both OFL). No analytics, no cookies.

## Run it

```sh
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # static site in out/
```

Preview the production build with `python3 -m http.server 4321 --directory out`. This simple server doesn't
serve `404.html` for unknown paths; GitHub Pages does.

## Where things live

| What | File |
|---|---|
| All copy and CV data (single source of truth) | [`src/content/profile.ts`](src/content/profile.ts) |
| Design tokens (colours, breakpoints) | [`src/app/globals.css`](src/app/globals.css) |
| Header and the floating section index | [`SiteHeader.tsx`](src/components/SiteHeader.tsx), [`SectionIndex.tsx`](src/components/SectionIndex.tsx) |
| Career timeline and experience rows | [`CareerTimeline.tsx`](src/components/CareerTimeline.tsx) |
| Shared layout pieces (column, ledger row, section header) | [`ledger.tsx`](src/components/ledger.tsx) |
| Favicon, Apple icon, share image | `src/app/icon.svg`, `apple-icon.png`, `opengraph-image.png` |

Breakpoints: mobile below 768px, tablet 768–1099px (`md`), desktop from 1100px (`xl`, overridden to 68.75rem).

## Details

- **Keyboard and screen readers.** Skip link, visible focus on every control, and WAI-ARIA tabs (arrow keys)
  for the form/schema switch on phones.
- **Reduced motion.** Smooth scrolling and transitions are switched off when the system asks for it.
- **CSV export.** Cells are quoted per RFC 4180, and text that a spreadsheet would run as a formula is prefixed with `'`.
- **Time-aware without a server.** Durations on the timeline and the local time are computed in the browser,
  so they stay correct between deploys.

## Deploying

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): lint, build, then
publish `out/` to GitHub Pages. A failed lint or build leaves the live site untouched.

The previous portfolio is kept at [alfytka.github.io/v1](https://alfytka.github.io/v1/)
([repo](https://github.com/alfytka/v1)).
