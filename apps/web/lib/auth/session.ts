"use client";

const SESSION_KEY = "experimentlab.session";

export function getSessionUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(SESSION_KEY);
}

export function signInDemoUser(userId = "demo-user-001") {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, userId);
  }
}

export function signOut() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}
