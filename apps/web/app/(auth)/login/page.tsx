"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { setSession } from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onLogin = () => {
    const next = searchParams.get("next");
    const target = next && next.startsWith("/app") ? next : "/app";

    setSession({
      userId: "demo-user-001",
      createdAt: new Date().toISOString()
    });
    router.replace(target);
  };

  return (
    <main className="container stack">
      <h1>Login</h1>
      <p>This is a fake auth flow for local demo purposes.</p>
      <button onClick={onLogin}>
        Sign in as demo user
      </button>
    </main>
  );
}
