# experimentlab-core

<div align="center">

[![npm version](https://img.shields.io/npm/v/experimentlab-core.svg?style=flat-square)](https://www.npmjs.com/package/experimentlab-core)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**Core deterministic evaluation and targeting engine for ExperimentLab feature flags and A/B experimentation.**

</div>

---

## Features

- ⚡ **Zero Network Latency**: Pure client-side or edge evaluation with zero round-trips.
- 🎯 **Deterministic Bucketing**: Consistent user-to-variant assignment using fast 32-bit FNV-1a hashing.
- 🛡️ **Cohort & Rule Targeting**: Multi-operator evaluation (`eq`, `neq`, `contains`, `in`, `nin`) over arbitrary user contexts.
- 📦 **Ultra Lightweight**: Zero dependencies, under 4KB bundle size.
- 🌐 **Isomorphic**: Runs identically in Node.js, Vercel Edge Runtime, Cloudflare Workers, and modern browsers.

---

## Installation

```bash
npm install experimentlab-core
# or
pnpm add experimentlab-core
# or
yarn add experimentlab-core
```

---

## Quickstart

```typescript
import { evaluateFlag, evaluateExperiment } from "experimentlab-core";

const user = {
  id: "user_98765",
  attributes: {
    plan: "enterprise",
    country: "US"
  }
};

// 1. Evaluate Feature Flag
const isNewCheckoutActive = evaluateFlag(
  {
    key: "new_checkout_flow",
    enabled: true,
    rules: [
      { attribute: "plan", operator: "eq", value: "enterprise" }
    ]
  },
  user
);

console.log("Is flag enabled?", isNewCheckoutActive); // true

// 2. Deterministic A/B Variant Assignment
const variant = evaluateExperiment(
  {
    key: "checkout_button_cta",
    status: "active",
    rollout: 100,
    variants: [
      { id: "control", name: "Control", weight: 50 },
      { id: "treatment", name: "Treatment", weight: 50 }
    ],
    rules: []
  },
  user
);

console.log("Assigned variant:", variant?.name); // "Treatment"
```

---

## License

Apache-2.0
