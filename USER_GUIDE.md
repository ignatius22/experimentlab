# ExperimentLab User Guide

Welcome to ExperimentLab, your command center for feature management, A/B testing, and real-time performance monitoring. This guide will walk you through everything from your first flag to advanced experimentation.

---

## 🚀 Quick Start (5 Minutes)

### 1. Create your first Feature Flag
1.  Go to the **[Dashboard](/app)**.
2.  Click **Feature Flags** in the sidebar.
3.  Click **Create Flag**.
4.  Enter a **Key** (e.g., `new_header`) and a **Description**.
    *   *Note: Keys must only contain letters, numbers, and underscores.*
5.  Toggle the switch to **Enabled**.

### 2. Integrate with your Code
Install the React SDK in your frontend project:
```bash
npm install @experiment/sdk-react
```

Wrap your app in the provider and use the hook:
```tsx
import { useFlag } from "@experiment/sdk-react";

function Header() {
  const showNewHeader = useFlag("new_header");
  
  return showNewHeader ? <ModernHeader /> : <ClassicHeader />;
}
```

---

## 🛠️ Feature Flags

Feature Flags (or Toggles) allow you to decouple code deployment from feature release.

### Gradual Rollouts
Instead of 0% or 100%, you can set a **Rollout Percentage**. ExperimentLab uses deterministic hashing to ensure a user stays in their assigned bucket (on or off) throughout their session.

### Targeting Rules
You can target specific users based on their attributes (set via `client.setContext` in the SDK).
*   **Attributes**: `plan`, `version`, `country`, `email`, etc.
*   **Operators**: `equals`, `contains`, `in list`, etc.
*   *Example*: Only show a feature if `plan` is `enterprise`.

---

## 🧪 A/B Testing

Experiments help you make data-driven decisions by comparing multiple variants of a feature.

### 1. Setup an Experiment
1.  Navigate to **Experiments** and click **Create Experiment**.
2.  Define your **Variants** (e.g., `control` vs `treatment`).
3.  Choose your **Metrics** (e.g., `signup_rate`, `conversion`).

### 2. Implementation
```tsx
import { useExperiment } from "@experiment/sdk-react";

function SignupButton() {
  const variant = useExperiment("hero_test");

  if (variant?.id === "treatment") {
    return <button className="btn-gold">Sign Up Now!</button>;
  }
  return <button className="btn-blue">Sign Up</button>;
}
```

### 3. Analyzing Results
Visit the experiment detail page to see:
*   **P-Values**: Scientific proof that your results aren't just luck.
*   **Confidence Intervals**: The range of likely impact.
*   **The Winner**: Once significant, click **Promote** to ship the winning variant to 100% of users.

---

## 📊 Analytics & Performance

ExperimentLab automatically monitors the health of your application.

### Event Stream
The **Analytics** tab shows a real-time, virtualized stream of every event:
*   **Exposure**: When a user is assigned a flag or experiment variant.
*   **Track**: Custom events you trigger in code (e.g., `track("purchase")`).
*   **Page**: Automatic page view tracking.

### Core Web Vitals
The **Performance** dashboard tracks the three most important speed metrics:
1.  **LCP (Largest Contentful Paint)**: How fast the main content loads.
2.  **INP (Interaction to Next Paint)**: How responsive the page feels.
3.  **CLS (Cumulative Layout Shift)**: How stable the layout is.

**Pro Tip:** Check the performance impact of your experiments to ensure a new feature isn't slowing down your users!

---

## 🆘 Troubleshooting & Best Practices

*   **Key Naming**: Always use `snake_case` or `kebab-case` for keys. Avoid slashes or spaces.
*   **Zero Latency**: Evaluation happens locally in the SDK. If a flag isn't updating, ensure your `publishableKey` (Organization ID) matches your dashboard.
*   **Cleanup**: Once an experiment is done and promoted, remove the `useExperiment` code from your app to keep your codebase clean.

---

*© 2026 ExperimentLab. Built for high-performance engineering teams.*
