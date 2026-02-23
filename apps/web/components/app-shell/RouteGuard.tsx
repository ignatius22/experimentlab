"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSession, type Session } from "@/lib/auth/session";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<Session | null>(() => getSession());
  const isProtected = pathname.startsWith("/app");

  const nextUrl = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession && isProtected) {
      router.replace(`/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }
  }, [isProtected, nextUrl, router]);

  if (!session && isProtected) {
    return null;
  }

  return <>{children}</>;
}
