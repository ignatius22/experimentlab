"use client";

import { useRouter } from "next/navigation";
import { signInDemoUser } from "../../../lib/auth/session";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="container stack">
      <h1>Login</h1>
      <p>This is a fake auth flow for local demo purposes.</p>
      <button
        onClick={() => {
          signInDemoUser();
          router.push("/app");
        }}
      >
        Sign in as demo user
      </button>
    </main>
  );
}
