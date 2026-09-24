import { describe, it, expect } from "vitest";
import { EMPTY_STATE, ExperimentClient } from "../index";

describe("ExperimentLab React SDK", () => {
  it("exports EMPTY_STATE constant", () => {
    expect(EMPTY_STATE).toEqual({ manifest: null, loading: false });
  });

  it("instantiates ExperimentClient cleanly with apiKey or initialManifest", () => {
    const client = new ExperimentClient({ apiKey: "exp_client_test_123" });
    expect(client).toBeDefined();
    expect(client.getSnapshot().loading).toBe(false);

    const ssrClient = new ExperimentClient({
      apiKey: "exp_client_test_123",
      initialManifest: { flags: [{ key: "ssr_flag", enabled: true }], experiments: [] }
    });
    expect(ssrClient.getFlag("ssr_flag")).toBe(true);
  });
});
