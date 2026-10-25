"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/LoadingState";
import { useGuestMode } from "@/features/auth/guest-mode";
import { useAuth } from "@/features/auth/use-auth";
import { AppNavigation } from "./AppNavigation";
import { StorageNotice } from "./StorageNotice";

const AUTH_ROUTES = ["/masuk", "/lupa-sandi", "/atur-sandi", "/auth"];

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Kerangka aplikasi + gerbang masuk.
 * Belum login dan belum memilih mode tamu -> diarahkan ke /masuk.
 * (Ini pengaturan alur tampilan; keamanan data tetap dijaga RLS di database.)
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const isGuest = useGuestMode();
  const onAuthRoute = isAuthRoute(pathname);

  const signedOut = auth.status === "ready" && auth.user === null;
  const mustSignIn = !onAuthRoute && signedOut && isGuest === false;

  useEffect(() => {
    if (mustSignIn) router.replace("/masuk");
  }, [mustSignIn, router]);

  if (onAuthRoute) {
    return (
      <main id="konten" className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        {children}
      </main>
    );
  }

  const checking = auth.status === "loading" || mustSignIn || (signedOut && isGuest === null);

  return (
    <div className="min-h-dvh md:flex">
      <AppNavigation />
      <main id="konten" className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
        <div className="mx-auto max-w-6xl">
          {checking && <LoadingState />}
          {/* Tetap dirender (agar Next.js bisa memvalidasi halaman), hanya disembunyikan saat pengecekan login. */}
          <div hidden={checking}>
            <StorageNotice />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}