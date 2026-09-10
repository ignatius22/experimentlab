import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  validateApiKey: vi.fn(),
  flags: vi.fn(),
  experiments: vi.fn(),
}));

vi.mock("../../lib/auth/server", () => ({ auth: mocks.auth }));
vi.mock("../../lib/keys", () => ({ validateApiKey: mocks.validateApiKey }));
vi.mock("@experiment/db", () => ({
  prisma: {
    featureFlag: { findMany: mocks.flags },
    experiment: { findMany: mocks.experiments },
  },
}));

import { GET } from "../../app/api/v1/client/manifest/route";

describe("manifest API key scopes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.flags.mockResolvedValue([]);
    mocks.experiments.mockResolvedValue([]);
  });

  it("limits client keys to published flags and active/completed experiments", async () => {
    mocks.validateApiKey.mockResolvedValue({ organizationId: "org_1", type: "client" });
    const response = await GET(new Request("http://localhost/api/v1/client/manifest", { headers: { "x-api-key": "exp_live_client" } }));

    expect(response.status).toBe(200);
    expect(mocks.flags).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org_1", enabled: true } }));
    expect(mocks.experiments).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org_1", status: { in: ["active", "completed"] } } }));
  });

  it("allows server keys to fetch the broader trusted-server manifest", async () => {
    mocks.validateApiKey.mockResolvedValue({ organizationId: "org_1", type: "server" });
    const response = await GET(new Request("http://localhost/api/v1/client/manifest", { headers: { "x-api-key": "exp_live_server" } }));

    expect(response.status).toBe(200);
    expect(mocks.flags).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org_1" } }));
    expect(mocks.experiments).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org_1" } }));
  });
});
