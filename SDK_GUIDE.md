# ExperimentLab SDK Guide

This document explains the internal architecture and usage of the ExperimentLab SDK, which is split into `packages/sdk-core` (logic engine) and `packages/sdk-react` (React bindings).

## 1. Core Architecture (`sdk-core`)

The `ExperimentClient` is the primary interface for flag evaluation and event tracking.

### Initialization
When the client is instantiated, it requires a `userId` and a `publishableKey`.
```typescript
const client = new ExperimentClient({
  userId: "user_123",
  publishableKey: "pk_test_123",
  baseUrl: "https://api.experimentlab.com" // Optional
});

await client.init(); // Fetches the Manifest
```

### The Manifest
The SDK operates on a **Manifest-driven** model. Instead of making a network request for every flag check, it fetches a complete configuration object (the Manifest) once. This contains:
- **Flags:** Key, rollout percentage, and targeting rules.
- **Experiments:** Variants, weights, status, and winning variants.

## 2. Evaluation Logic

### Deterministic Bucketing
To ensure a user always sees the same variant without storing state on the server, the SDK uses stable hashing:
1. It combines `userId` and `featureKey` (e.g., `"user_123:new_button_color"`).
2. It hashes this string into a numeric value.
3. It takes `hash % 100` to get a value between 0-99.
4. If the value is less than the `rollout` (e.g., 50), the feature is enabled.

### Targeting Rules
Before bucketing, the SDK evaluates `rules`. Rules allow for granular targeting based on user context:
- `eq` / `neq`: Equality checks.
- `contains`: Substring matching.
- `in` / `nin`: Set membership (e.g., `plan in ['pro', 'enterprise']`).

## 3. Experimentation & Exposure Tracking

When an experiment is evaluated via `getExperimentVariant(key)`:
1. The SDK assigns a variant based on the weights defined in the manifest.
2. **Exposure Tracking:** The SDK enqueues an `exposure` event automatically. 
   - *Crucial:* It only tracks exposure the **first time** a user encounters the experiment in a session to avoid double-counting.

## 4. Event Pipeline

To maintain high performance and low network overhead, the SDK uses a batching strategy:
- **Queueing:** Events are stored in an internal `eventQueue`.
- **Flush Triggers:**
  - Queue reaches **10 events**.
  - **5 seconds** have passed since the last event.
  - **Visibility Change:** If the user closes the tab or switches apps, the SDK attempts a final flush.

## 5. React Integration (`sdk-react`)

The React SDK provides hooks that sync with the `ExperimentClient` state using `useSyncExternalStore`.

### Usage Example

```tsx
import { ExperimentProvider, useFlag, useExperiment, useTrack } from "@experiment/sdk-react";

function App() {
  return (
    <ExperimentProvider client={myClient}>
      <FeatureComponent />
    </ExperimentProvider>
  );
}

function FeatureComponent() {
  // 1. Simple Toggle
  const isEnabled = useFlag("modern_ui");

  // 2. A/B Test
  const variant = useExperiment("signup_flow_v2");

  // 3. Manual Tracking
  const track = useTrack();

  return (
    <div>
      {isEnabled && <ModernHeader />}
      {variant?.id === 'treatment' ? <NewForm /> : <OldForm />}
      <button onClick={() => track("button_clicked", { color: "blue" })}>
        Click Me
      }
    </div>
  );
}
```

## Summary of Benefits
- **Zero Latency:** Evaluations are local and synchronous once the manifest is loaded.
- **Consistency:** Users get a stable experience across sessions.
- **Performance:** Batching prevents the "Analytics Tax" on network performance.
