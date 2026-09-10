# ExperimentLab: The Engineer's Command Center

ExperimentLab is a "Command Center" for your website or application. It allows you to control how your users experience your product without needing to write new code or re-publish your website every time you want to make a change.

## Core Capabilities

### 1. The "Magic Switch" (Feature Flags)
Imagine you built a new "Dark Mode" for your app. Instead of giving it to everyone at once, you can use a Feature Flag. It is like a light switch in your dashboard. You can turn it on for 5% of users to test it out, or turn it off instantly if you find a bug, without having to take your site down.

### 2. The "Scientific Test" (A/B Testing)
If you aren't sure if a "Red" button or a "Blue" button will get more clicks, you can run an experiment. ExperimentLab will automatically show half your users the Red button and the other half the Blue button. It then calculates the math (statistical significance) to tell you exactly which one was more successful.

### 3. The "Speedometer" (Performance Monitoring)
Every time you change something, there is a risk it will make your website slow. ExperimentLab watches your "Web Vitals" (how fast your page loads and reacts) in real-time. If a new feature makes the site slow for your users, you will see it immediately on your dashboard.

---

## Real-World Examples

*   **The Marketing Test:** You want to see if changing your headline from "Welcome" to "Get 20% Off" helps people sign up. You create an experiment in ExperimentLab. After two days, the app shows you that the "20% Off" headline increased signups by 15%. You click **Promote** and that headline becomes permanent for everyone.
*   **The VIP Experience:** You want to show a "Premium Support" chat box, but only to users who pay for a "Pro" plan. You set a **Targeting Rule** in ExperimentLab that says: *Only show this flag if the user's plan is 'Pro'*. Now, your regular users won't even see the code for the chat box, keeping the site fast for them.
*   **The Safety Net:** You are launching a major update on a Friday. You are nervous it might crash. You set the **Rollout** to 1%. You watch the **Event Stream** for errors. If everything looks good, you move it to 10%, then 50%, then 100%. If something breaks at 10%, you flip the switch to "Off" and the site is fixed for everyone in less than a second.

---

## Technical Integration

### Install the SDK
```bash
npm install @experiment/sdk-react
```

### Use a Flag in your Code
```tsx
import { useFlag } from "@experiment/sdk-react";

function Header() {
  const showNewNav = useFlag("new_nav");
  
  return showNewNav ? <ModernNav /> : <ClassicNav />;
}
```

### Track a Conversion
```tsx
import { useTrack } from "@experiment/sdk-react";

function SignupButton() {
  const track = useTrack();
  
  return (
    <button onClick={() => track("signup_rate")}>
      Sign up now
    </button>
  );
}
```
