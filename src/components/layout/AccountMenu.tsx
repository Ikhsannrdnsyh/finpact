"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleUserRound, KeyRound, LogIn, LogOut } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { setGuestMode } from "@/features/auth/guest-mode";
import { useAuth } from "@/features/auth/use-auth";
import { createClient } from "@/lib/supabase/client";

export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const auth = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (auth.status !== "ready") return null;

  if (!auth.user) {
    // Mode tamu: tawarkan masuk/daftar.
    return (
      <Link href="/masuk" className={buttonClasses("secondary", "sm", compact ? undefined : "w-full")}>
        <LogIn className="size-4" />
        Masuk
      </Link>
    );
  }

  const email = auth.user.email ?? "Akun";

  async function handleSignOut() {
    const supabase = createClient();
    if (!supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    setGuestMode(false);
    setSigningOut(false);
    router.replace("/masuk");
  }

  if (compact) {
    return (
      <div className="flex items-center">
        <Link
          href="/atur-sandi"
          aria-label="Ganti kata sandi"
          className={buttonClasses("ghost", "icon")}
        >
          <KeyRound className="size-5" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
          aria-label={`Keluar dari ${email}`}
        >
          <LogOut className="size-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <CircleUserRound className="size-4 shrink-0 text-primary" />
        <span className="truncate">{email}</span>
      </p>
      <div className="mt-2 grid gap-1">
        <Link href="/atur-sandi" className={buttonClasses("ghost", "sm", "w-full")}>
          <KeyRound className="size-4" />
          Ganti kata sandi
        </Link>
        <Button variant="ghost" size="sm" className="w-full" onClick={() => void handleSignOut()} disabled={signingOut}>
          <LogOut className="size-4" />
          Keluar
        </Button>
      </div>
    </div>
  );
}