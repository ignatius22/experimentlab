// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { ANONYMOUS_ID_KEY, ExperimentClient, getAnonymousId } from "../index";

describe("visitors without a user ID", () => {
  beforeEach(() => localStorage.clear());

  it("gets an ID of its own instead of the shared 'anonymous'", () => {
    const client = new ExperimentClient({ publishableKey: "k" });
    expect(client.getUserId()).toMatch(/^anon_/);
    expect(client.getUserId()).not.toBe("anonymous");
  });

  it("keeps the same ID across page loads in one browser", () => {
    const first = new ExperimentClient({ publishableKey: "k" }).getUserId();
    const second = new ExperimentClient({ publishableKey: "k" }).getUserId();
    expect(second).toBe(first);
    expect(localStorage.getItem(ANONYMOUS_ID_KEY)).toBe(first);
  });

  it("gives different browsers different IDs", () => {
    const a = getAnonymousId();
    localStorage.clear();
    const b = getAnonymousId();
    expect(a).not.toBe(b);
  });

  it("uses the app's own ID when one is given", () => {
    expect(new ExperimentClient({ publishableKey: "k", userId: "user_42" }).getUserId()).toBe("user_42");
    expect(localStorage.getItem(ANONYMOUS_ID_KEY)).toBeNull();
  });
});
