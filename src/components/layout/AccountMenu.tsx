"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CircleUserRound, LogIn, LogOut } from "lucide-react";
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void handleSignOut()}
        disabled={signingOut}
        aria-label={`Keluar dari ${email}`}
      >
        <LogOut className="size-5" />
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-border p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <CircleUserRound className="size-4 shrink-0 text-primary" />
        <span className="truncate">{email}</span>
      </p>
      <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => void handleSignOut()} disabled={signingOut}>
        <LogOut className="size-4" />
        Keluar
      </Button>
    </div>
  );
}