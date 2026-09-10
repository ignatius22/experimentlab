import { describe, it, expect } from "vitest";
import { EMPTY_STATE, ExperimentClient } from "../index";

describe("ExperimentLab React SDK", () => {
  it("exports EMPTY_STATE constant", () => {
    expect(EMPTY_STATE).toEqual({ manifest: null, loading: false });
  });

  it("instantiates ExperimentClient cleanly", () => {
    const client = new ExperimentClient({ apiKey: "pk_test_123" });
    expect(client).toBeDefined();
    expect(client.getSnapshot().loading).toBe(false);
  });
});
