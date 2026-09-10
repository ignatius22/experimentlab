import type { FeatureFlag } from "@experiment/schemas";
import { bucket } from "./bucketing";

export function getDefaultFlags(): FeatureFlag[] {
  return [
    { key: "new_nav", description: "Enable new top nav", enabled: true, rollout: 100, rules: [] },
    { key: "quick_create", description: "Show quick create CTA", enabled: false, rollout: 50, rules: [] }
  ];
}

export function evaluateFlag(flag: FeatureFlag, userId: string) {
  if (!flag.enabled) {
    return false;
  }
  return bucket(userId, flag.key) < flag.rollout;
}
