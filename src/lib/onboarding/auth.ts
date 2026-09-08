"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export interface AuthState {
  user: User | null;
  loading: boolean;
}

/**
 * Live auth state for client components. `loading` is true only until the
 * first check resolves — after that, `user` updates in real time via
 * onAuthStateChange (sign in, sign out, token refresh), so a component using
 * this never needs to poll or re-check manually.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowser();

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setState({ user: data.user, loading: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setState({ user: session?.user ?? null, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = getSupabaseBrowser();
  return supabase.auth.signOut();
}
