# ExperimentLab Node SDK

`experimentlab-node` evaluates ExperimentLab flags in your Node.js process. It uses a **server API key** and fetches the manifest in the background; `getFlag` never makes a request.

## Install

```bash
npm install experimentlab-node
```

## Quickstart

```ts
import { ExperimentNodeClient } from "experimentlab-node";

const flags = new ExperimentNodeClient({
  baseUrl: "https://flags.example.com",
  apiKey: process.env.EXPERIMENTLAB_SERVER_KEY!,
});

// Optional: wait before accepting traffic. It resolves false if ExperimentLab
// is temporarily unreachable, rather than throwing.
await flags.ready();

if (flags.getFlag("user_123", "new_checkout", false, { plan: "team" })) {
  // render the new checkout
}

flags.track("user_123", "checkout_started", { currency: "USD" });
```

## Caching, polling, and failure behavior

Each Node.js process maintains its own in-memory manifest. By default it fetches once on startup and polls every 60 seconds. Set `refreshIntervalMs` to change the cadence or `0` to disable polling. `autoStart` defaults to `true`, so applications can start without awaiting a network request; call `await client.ready()` when an initial fetch attempt must complete before serving traffic.

If a refresh fails, the SDK logs a warning and continues evaluating with its last-known-good manifest. If it has never loaded a manifest, `getFlag` returns the supplied default value. Evaluation and tracking never throw because ExperimentLab is unavailable.

`track` batches events and sends them to ExperimentLab's queued ingestion endpoint. Batches flush every five seconds or at 100 events by default. The queue is bounded at 10,000 events so an unavailable endpoint cannot consume unbounded memory.

## Lifecycle

Call `await client.close()` during graceful shutdown to stop polling and flush queued tracking events. For a future SSE or WebSocket transport, pass a custom `manifestSource`; the public client API remains unchanged.
