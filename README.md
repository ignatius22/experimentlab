# ExperimentLab Community Edition

ExperimentLab is an Apache-2.0 licensed, self-hostable feature-flagging and experimentation platform. Flags are evaluated deterministically in your application process, so a flag check does not depend on a network call to ExperimentLab.

## What is open source

This repository is the complete Community Edition:

- Feature flags, A/B experiments, organizations, authentication, dashboard, and SDKs.
- PostgreSQL storage, Redis-backed event buffering, and the event worker.
- Deterministic evaluation packages published to the public npm registry:
  - [`experimentlab-core`](https://www.npmjs.com/package/experimentlab-core)
  - [`experimentlab-react`](https://www.npmjs.com/package/experimentlab-react)
  - `experimentlab-node` (server-side SDK; prepared for public publishing)

There is no payment provider, plan gate, hosted billing system, or quota enforcement in the Community Edition. A separate private hosted-product repository contains the commercial service's billing, entitlements, and deployment configuration. This is a conventional open-core boundary used by products such as GitLab, Sentry, and PostHog: the usable self-hosted product stays public while hosted-service operations remain private.

## SDK quickstart

```bash
npm install experimentlab-react experimentlab-core
```

```tsx
import { ExperimentProvider, useFlag } from "experimentlab-react";

function Checkout() {
  const useNewCheckout = useFlag("new_checkout", false);
  return useNewCheckout ? <NewCheckout /> : <ClassicCheckout />;
}

export function App() {
  return (
    <ExperimentProvider config={{ host: "https://flags.example.com", apiKey: "exp_live_...", user: { id: "user_123" } }}>
      <Checkout />
    </ExperimentProvider>
  );
}
```

For server-side evaluation, install `experimentlab-node`. It polls the manifest with a server key, keeps a last-known-good in-memory cache, and evaluates synchronously after the initial load. See [`packages/sdk-node/README.md`](packages/sdk-node/README.md).

## Self-host with Docker Compose

```bash
git clone https://github.com/ignatius22/experimentlab.git
cd experimentlab
cp .env.example .env
# Set POSTGRES_PASSWORD and AUTH_SECRET in .env.
docker compose up -d --build
```

Open [http://localhost:3005](http://localhost:3005). The stack includes PostgreSQL, Redis, the web application, and an event worker. For production configuration, backups, and migrations, follow the [self-hosting guide](apps/web/app/(marketing)/docs/self-hosting/page.tsx).

## Repository layout

```text
apps/web/             Next.js control plane, dashboard, API, and worker
packages/sdk-core/    Deterministic evaluation and bucketing
packages/sdk-react/   React provider and hooks
packages/sdk-node/    Node.js server SDK
packages/db/          Community Edition Prisma schema
packages/schemas/     Shared Zod contracts
packages/ui/          Shared UI components
```

## Development

```bash
pnpm install
pnpm --filter @experiment/db build
pnpm test
```

## License

Apache License 2.0. See [LICENSE](LICENSE).
