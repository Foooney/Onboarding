# SI Onboarding Hub

*A structured onboarding journey for every new team member.*

A front-end prototype for Siemens Smart Infrastructure teams: managers build, assign, track and
administer new-hire onboarding journeys. No backend — all data lives in the browser
(`localStorage`) and resets to a realistic seed dataset at any time.

## Installation

Requires Node.js 18+.

```bash
npm install
```

## Launch

```bash
npm run dev
```

Opens on `http://localhost:5173`. Other useful commands:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint        # eslint
```

The topbar's reset icon (↺) restores the original seed data at any time — useful between demo
runs, since every action in the app writes to `localStorage`.

## Deployment (GitHub Pages)

The repo ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and
publishes to GitHub Pages on every push to `main`.

1. Create an empty repository on GitHub named `Onboarding` (no README/license — this repo already
   has one), then push:
   ```bash
   git remote add origin https://github.com/<your-username>/Onboarding.git
   git push -u origin main
   ```
2. In the repo's **Settings → Pages**, set "Source" to **GitHub Actions** (one-time setup).
3. The workflow runs automatically and publishes to `https://<your-username>.github.io/Onboarding/`.
   Check the **Actions** tab for build status; the first run takes a minute or two.

Two things are already handled for this to work correctly:
- `vite.config.ts` sets `base: '/Onboarding/'` for production builds only (local dev stays at `/`).
  If you rename the repo, update this to match.
- `npm run build` copies `index.html` to `404.html` after building, so client-side routes
  (e.g. `/journeys/anna-mueller`) survive a direct link or a page reload on GitHub Pages, which has
  no server-side rewrites of its own.

To deploy elsewhere (Vercel, Netlify, Cloudflare Pages), none of this is needed — set `base` back
to `/` (or drop the option) and just point the host at `npm run build` / `dist`; those platforms
handle SPA routing automatically.

## Project structure

```
src/
  types/          Domain model — the single source of truth for every type and status union
  data/            Fictional seed dataset (people, task library, templates, 8 journeys)
  lib/
    store.tsx      AppProvider — the only place domain data lives, with every typed action
    selectors.ts    Derived values (progress, overdue tasks, aggregates) — nothing is stored twice
    status.ts       Date/overdue derivation utilities
    phases.ts       Shared onboarding-phase constants
    utils.ts        Styling helpers, formatters
  components/
    layout/         Sidebar, Topbar (incl. global search), AppShell
    ui/              19 presentational primitives (Card, Table, Modal, Badge, Toast, …)
  pages/            One file per route, plus journey-detail/ (6 tabs) and create-journey/ (5-step wizard)
```

See [CLAUDE.md](CLAUDE.md) for the design system (colors, type scale, naming conventions) and the
state-management rules the codebase follows.

## Demo scenario (~12 minutes)

A suggested walkthrough, starting from a freshly reset dataset:

1. **Dashboard** (`/`) — KPIs, this week's tasks, upcoming meetings, active journeys table.
2. **Active onboardings** — scroll to the table, point out the status breakdown (on track / at
   risk / on hold / completed) and the credible spread of progress.
3. **Open Anna Müller's profile** — click her row.
4. **Her 90-day journey** — the *Journey* tab shows the phased timeline from Before Day 1 to
   First 90 Days, with real dependencies and a mix of completed, overdue and blocked tasks.
5. **Validate a task** — on the *Tasks* tab, check off an open item and watch the progress bar
   and header counts update instantly.
6. **Switch to her "My Onboarding Pass" view** — use the role switcher (top right) to become
   *New Joiner*, then open *My Onboarding Pass*: the boarding-pass header, phase roadmap, and
   "up next" spotlight are the most memorable screen in the app.
7. **Open the Task Library** — search, filter by category, and show that every task is a real,
   editable template.
8. **Create a new onboarding** — switch back to *Manager*, click "New onboarding".
9. **Pick a template** — step 2 shows all 6 templates with task counts and covered domains;
   selecting one pre-fills the task list.
10. **Add and assign tasks** — step 3 to add one extra task from the library or a custom one;
    step 4 to show an owner already pre-resolved per role, and the bulk "assign to selected" action.
11. **Launch the journey** — step 5 reviews everything, then "Launch onboarding" creates it for
    real and redirects to its detail page.
12. **Back to the Dashboard** — the new hire is already in the active journeys table and the KPIs.

End by resetting the demo data (topbar ↺) so the next run starts clean.
