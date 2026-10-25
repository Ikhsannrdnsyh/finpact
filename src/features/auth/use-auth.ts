import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "ready"; user: User | null };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(() =>
    isSupabaseConfigured() ? { status: "loading" } : { status: "disabled" },
  );

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    // Event pertama (INITIAL_SESSION) memberi tahu apakah pengguna sudah login.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ status: "ready", user: session?.user ?? null });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}