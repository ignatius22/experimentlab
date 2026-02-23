# ExperimentLab

Portfolio-grade frontend architecture demo focused on feature flags, experimentation, analytics, and Core Web Vitals.

## Quick start

```bash
pnpm install
pnpm dev
```

## Auth model

- Fake auth only (localStorage session).
- Sign in from `/login`, then access `/app/*` routes.

## Mocking model

- Default data source: Next route handlers (`/api/experiments`).
- Optional browser MSW: set `NEXT_PUBLIC_API_MOCKING=enabled`.
- Tests should use MSW test server wiring.

## Performance demo

- `/app/analytics` seeds 10,000 events.
- Uses virtualized rendering + requestAnimationFrame batched updates.
- `/app/performance` and `/app/proof` display INP/LCP/CLS.
