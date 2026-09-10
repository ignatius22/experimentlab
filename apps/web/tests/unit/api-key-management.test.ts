import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn()
}));

vi.mock("../../lib/auth/server", () => ({ auth: mocks.auth }));
vi.mock("@experiment/db", () => ({
  prisma: { apiKey: { findMany: mocks.findMany, create: mocks.create } }
}));

import { GET, POST } from "../../app/api/keys/route";

describe("API key management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ orgId: "org_test" });
    mocks.findMany.mockResolvedValue([]);
  });

  it("lists keys without creating one as a side effect", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ keys: [] });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("requires a name before creating a key", async () => {
    const response = await POST(new Request("http://localhost/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "client" })
    }));
    expect(response.status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("persists the user-provided key name", async () => {
    mocks.create.mockResolvedValue({ id: "key_1", name: "Production web", type: "client", createdAt: new Date(), revokedAt: null });
    const response = await POST(new Request("http://localhost/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Production web", type: "client" })
    }));
    expect(response.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ organizationId: "org_test", name: "Production web", type: "client" })
    }));
  });

  it("creates a server key only when explicitly requested", async () => {
    mocks.create.mockResolvedValue({ id: "key_2", name: "API service", type: "server", createdAt: new Date(), revokedAt: null });
    const response = await POST(new Request("http://localhost/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "API service", type: "server" })
    }));

    expect(response.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ organizationId: "org_test", name: "API service", type: "server" })
    }));
  });
});
