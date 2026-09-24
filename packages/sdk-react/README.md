# experimentlab-react

<div align="center">

[![npm version](https://img.shields.io/npm/v/experimentlab-react.svg?style=flat-square)](https://www.npmjs.com/package/experimentlab-react)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)

**Official React SDK for ExperimentLab — zero-latency feature flags, deterministic A/B testing, and built-in Core Web Vitals telemetry.**

</div>

---

## Features

- ⚛️ **Idiomatic React Hooks**: `useFlag`, `useExperiment`, and `useTrack`.
- 🚀 **Zero-Flicker & Zero-Latency**: Evaluates flags and variants instantly in memory.
- 📊 **Automatic Telemetry**: Background exposure logging and automated Core Web Vitals (LCP, INP, CLS) tracking.
- 🛡️ **Type-Safe**: Full TypeScript definition exports with strict autocomplete.
- ⚡ **SSR & App Router Ready**: Supports Next.js 14/15 (App Router & Pages Router), Vite, Remix, and Create React App.

---

## Installation

```bash
npm install experimentlab-react experimentlab-core
# or
pnpm add experimentlab-react experimentlab-core
# or
yarn add experimentlab-react experimentlab-core
```

---

## Quickstart

### 1. Wrap your application with `ExperimentProvider`

```tsx
// app/layout.tsx (Next.js) or main.tsx (Vite)
import React from "react";
import { ExperimentProvider } from "experimentlab-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ExperimentProvider
      config={{
        host: "http://your-experimentlab-host:3005", // Your ExperimentLab instance
        apiKey: "YOUR_ORGANIZATION_ID",
        user: {
          id: "user_12345",
          attributes: {
            plan: "pro",
            country: "US"
          }
        }
      }}
    >
      {children}
    </ExperimentProvider>
  );
}
```

---

### 2. Control Features with `useFlag`

```tsx
import { useFlag } from "experimentlab-react";

export function CheckoutButton() {
  const isOneClickCheckout = useFlag("new_checkout_flow");

  if (isOneClickCheckout) {
    return <OneClickCheckoutModal />;
  }

  return <StandardCheckoutButton />;
}
```

---

### 3. Run A/B Tests with `useExperiment` & `useTrack`

```tsx
import { useExperiment, useTrack } from "experimentlab-react";

export function PricingCTA() {
  const { variant } = useExperiment("pricing_card_test");
  const track = useTrack();

  const handleSubscribe = () => {
    // Tracks goal metric in ExperimentLab dashboard
    track("subscription_purchased", { plan: "pro" });
  };

  return (
    <button onClick={handleSubscribe} className="cta-button">
      {variant === "treatment" ? "Start 14-Day Free Trial" : "Buy Plan Now"}
    </button>
  );
}
```

---

## API Reference

### `<ExperimentProvider config={...}>`
Root context provider that fetches your organization's latest flag manifest, evaluates rules locally, and registers Web Vitals telemetry.

### `useFlag(key: string, defaultValue?: boolean): boolean`
Returns `true` or `false` based on local deterministic rule evaluation.

### `useExperiment(key: string): { variant: string | null; name: string | null }`
Returns the bucketed variant and automatically logs an exposure event on first render.

### `useTrack(): (eventName: string, payload?: Record<string, any>) => void`
Returns an event dispatcher for tracking goal conversion metrics.

---

## License

Apache-2.0
