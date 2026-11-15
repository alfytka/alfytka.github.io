# Alfitka Haerul Kurniawan — portfolio ("Ledger")

Implementation of the Ledger design in `../mockup-portfolio/portfolio-prototype.figcraft`.
Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS v4 · TanStack Table v9 · React Hook Form + Zod 4.

## Commands

```sh
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # static site in out/
```

Preview the production build: `python3 -m http.server 4321 --directory out` (this simple server does not
use `404.html`; GitHub Pages does).

## Where things live

| What | File |
|---|---|
| All copy and CV data (single source of truth) | `src/content/profile.ts` |
| Design tokens (colours, breakpoint) | `src/app/globals.css` |
| Fonts (Host Grotesk variable, Fragment Mono — OFL) | `src/fonts/`, loaded in `src/app/layout.tsx` |
| Specimen 01 — data table (TanStack Table) | `src/components/specimens/InvoiceTable.tsx`, dummy data in `invoices.ts` |
| Specimen 02 — form + schema (RHF + Zod) | `src/components/specimens/EnrollmentForm.tsx`, schema in `enrollment.ts` |
| Career axis + experience rows | `src/components/CareerTimeline.tsx` |
| Favicon, Apple icon, OG image | `src/app/icon.svg`, `apple-icon.png`, `opengraph-image.png` |

Breakpoints: mobile < 768px, tablet 768–1099px (`md`), desktop ≥ 1100px (`xl`, overridden to 68.75rem).

## Before publishing

- Add the CV PDF as `public/cv-alfitka-haerul-kurniawan.pdf` (linked from the nav, menu and footer).
- Verify the copy in `src/content/profile.ts`, including "I usually reply within a day" in `src/components/SiteFooter.tsx`.

## Deploying to GitHub Pages (alfytka.github.io)

`npm run build`, then publish the contents of `out/` (it includes `.nojekyll`, needed for the `_next/` folder).
The simplest route is a GitHub Actions workflow using `actions/upload-pages-artifact` with `path: out`.
