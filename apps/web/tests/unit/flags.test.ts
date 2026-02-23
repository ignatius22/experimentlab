import { evaluateFlag } from "../../lib/flags";

describe("flag evaluation", () => {
  it("returns false when disabled", () => {
    expect(evaluateFlag({ key: "x", description: "x", enabled: false, rollout: 100 }, "u1")).toBe(false);
  });

  it("supports percentage rollout", () => {
    const enabled = evaluateFlag({ key: "x", description: "x", enabled: true, rollout: 100 }, "u1");
    expect(enabled).toBe(true);
  });
});
