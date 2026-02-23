<div align="center">

# ExperimentLab

**A portfolio-grade frontend architecture demo built around feature flags, A/B experimentation, analytics instrumentation, and Core Web Vitals.**

[![CI](https://img.shields.io/github/actions/workflow/status/ignatius22/experimentlab/ci.yml?label=CI&style=flat-square)](https://github.com/ignatius22/experimentlab/actions)
[![E2E](https://img.shields.io/github/actions/workflow/status/ignatius22/experimentlab/e2e.yml?label=E2E&style=flat-square)](https://github.com/ignatius22/experimentlab/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Overview

ExperimentLab is a production-inspired monorepo that simulates the core infrastructure of a modern frontend platform team. It is not a toy project — it reflects real architectural decisions around experimentation, observability, and performance engineering.

**Key proof-of-skill artifacts:**

- Deterministic variant bucketing with exposure tracking
- Virtualized rendering under high event volume (10,000+ events)
- Typed API contracts with runtime Zod validation
- Centralized route protection with redirect preservation
- Core Web Vitals monitoring (INP, LCP, CLS)
- Full CI pipeline with unit and E2E test coverage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.x |
| Styling | CSS Modules + Design Tokens |
| Schema / Validation | Zod |
| Mocking | MSW (Mock Service Worker) |
| Unit Testing | Vitest |
| E2E Testing | Playwright |
| Monorepo | pnpm workspaces |
| CI | GitHub Actions |

---

## Repository Structure

```
ExperimentLab/
├── apps/
│   └── web/                        # Next.js application
│       ├── app/                    # App Router pages and layouts
│       ├── components/             # Feature and UI components
│       └── lib/
│           ├── auth/               # Session helpers
│           ├── experiments/        # Bucketing + flag engine
│           ├── analytics/          # Event tracking store
│           └── performance/        # Core Web Vitals
└── packages/
    ├── schemas/                    # Zod schemas + inferred types
    └── ui/                         # Primitives + design tokens
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/ignatius22/experimentlab.git
cd experimentlab

# Install all dependencies
pnpm install

# Start the development server
pnpm -C apps/web dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/login` | Authentication (fake auth) |
| `/app` | Protected application shell |
| `/app/analytics` | Virtualized analytics event stream |
| `/app/performance` | Core Web Vitals dashboard |
| `/app/proof` | Aggregated proof dashboard |
| `/app/experiments` | Experiment management |

---

## Feature Breakdown

### Auth Model

> This project uses a simulated auth layer for demonstration purposes. No real credentials are required.

Sessions are persisted in `localStorage` under the key `experimentlab.session`. Route protection is enforced centrally at:

```
apps/web/components/app-shell/RouteGuard.tsx
```

Unauthenticated users are redirected to `/login?next=/app/...` and returned to their original destination after login.

<details>
<summary>Verify auth flow</summary>

1. Open `/app/analytics` in a fresh browser session.
2. Confirm you are redirected to `/login?next=...`
3. Log in and confirm you are returned to `/app/analytics`.

</details>

---

### Experimentation & Feature Flags

Experiment and flag contracts are defined in `packages/schemas` and shared across the monorepo.

- **Bucketing** — deterministic hashing by user ID ensures consistent variant assignment
- **Persistence** — variants are stored in `localStorage` to simulate experiment stickiness
- **Exposure tracking** — exposure events fire exactly once on first variant assignment

<details>
<summary>Verify experiment flow</summary>

1. Go to `/app/experiments` and create an experiment.
2. Navigate to a feature that consumes the experiment.
3. Open `/app/analytics` and confirm an exposure event is present.

</details>

---

### Analytics Instrumentation

The analytics layer supports three event types:

| Method | Purpose |
|---|---|
| `track` | Custom interaction events |
| `identify` | User identity association |
| `page` | Page view recording |

All events are visible in real time at `/app/analytics`.

---

### Performance Engineering

`/app/analytics` intentionally seeds **10,000 events** to stress rendering performance. The implementation uses:

- **Virtualized rendering** — only visible rows are rendered to the DOM
- **`requestAnimationFrame` batching** — updates are scheduled to avoid blocking the main thread

Core Web Vitals are measured and surfaced at `/app/performance` and `/app/proof`:

| Metric | Full Name |
|---|---|
| INP | Interaction to Next Paint |
| LCP | Largest Contentful Paint |
| CLS | Cumulative Layout Shift |

<details>
<summary>Verify performance under load</summary>

1. Open `/app/analytics`.
2. Scroll aggressively while events are updating — the UI should remain responsive.
3. Visit `/app/performance` to observe live vitals.

</details>

---

### Mocking

**Default (development):** Data is served via Next.js route handlers at `/api/experiments`.

**Optional browser mocking:** Enable MSW browser interception for development:

```bash
NEXT_PUBLIC_API_MOCKING=enabled pnpm -C apps/web dev
```

**Tests:** Both unit and E2E tests use MSW server-side wiring — no browser service worker needed.

---

## Scripts

Run from the **repository root:**

```bash
pnpm lint          # Lint all packages
pnpm typecheck     # Type-check all packages
pnpm test          # Run unit tests
pnpm e2e           # Run Playwright E2E tests
```

Run scoped to **`apps/web` only:**

```bash
pnpm -C apps/web lint
pnpm -C apps/web test
pnpm -C apps/web e2e
```

---

## CI Pipeline

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | Push / PR | Lint, typecheck, unit tests |
| `e2e.yml` | Push / PR | Playwright end-to-end tests |

---

## License

MIT — see [LICENSE](LICENSE) for details.
