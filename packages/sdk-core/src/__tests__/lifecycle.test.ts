import { describe, it, expect } from "vitest";
import { ExperimentClient, type ExperimentManifest } from "../index";

const variants = [
  { id: "control", name: "control", weight: 50 },
  { id: "treatment", name: "treatment", weight: 50 }
];

function manifest(status: string, winningVariantId: string | null = null): ExperimentManifest {
  return {
    flags: [],
    experiments: [{ key: "checkout", variants: variants as any, rollout: 100, status, rules: [], winningVariantId }]
  };
}

// A client whose user is assigned `variantId` while the experiment runs.
function clientIn(variantId: string) {
  for (let i = 0; i < 500; i++) {
    const events: string[] = [];
    const client = new ExperimentClient({
      userId: `user-${i}`,
      initialManifest: manifest("active"),
      onEvent: (e) => events.push(`${e.type}:${e.variantId ?? ""}`)
    });
    if (client.getExperimentVariant("checkout")?.id === variantId) return { client, events };
  }
  throw new Error(`no user lands in ${variantId}`);
}

function setManifest(client: ExperimentClient, m: ExperimentManifest) {
  (client as any).manifest = m;
}

describe("experiment lifecycle", () => {
  it("sends a declared winner to users who were in another variant", () => {
    const { client } = clientIn("control");
    setManifest(client, manifest("completed", "treatment"));
    expect(client.getExperimentVariant("checkout")?.id).toBe("treatment");
  });

  it("sends the winner to users who never saw the experiment", () => {
    const client = new ExperimentClient({ userId: "newcomer", initialManifest: manifest("completed", "treatment") });
    expect(client.getExperimentVariant("checkout")?.id).toBe("treatment");
  });

  it("records no exposure once the experiment is completed", () => {
    const { client, events } = clientIn("control");
    const before = events.length;
    (client as any).seenExposures.clear();
    setManifest(client, manifest("completed", "treatment"));
    client.getExperimentVariant("checkout");
    expect(events.length).toBe(before);
  });

  it("gives nobody a variant while paused, and records no exposure", () => {
    const { client, events } = clientIn("treatment");
    const before = events.length;
    (client as any).seenExposures.clear();
    setManifest(client, manifest("paused"));
    expect(client.getExperimentVariant("checkout")).toBeNull();
    expect(events.length).toBe(before);
  });

  it("shows the same variant again when a paused experiment resumes", () => {
    const { client } = clientIn("treatment");
    setManifest(client, manifest("paused"));
    client.getExperimentVariant("checkout");
    setManifest(client, manifest("active"));
    expect(client.getExperimentVariant("checkout")?.id).toBe("treatment");
  });

  it("returns no variant for a completed experiment without a winner", () => {
    const { client } = clientIn("control");
    setManifest(client, manifest("completed"));
    expect(client.getExperimentVariant("checkout")).toBeNull();
  });

  it("treats 'running' the same as 'active'", () => {
    const { client } = clientIn("treatment");
    setManifest(client, manifest("running"));
    expect(client.getExperimentVariant("checkout")?.id).toBe("treatment");
  });
});
