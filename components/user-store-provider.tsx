"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";

/**
 * Provider component that syncs Supabase auth state with Zustand store.
 * Should be placed in the dashboard layout.
 */
export function UserStoreProvider({ children }: { children: React.ReactNode }) {
  const { setUser, refreshUserData, clearStore } = useUserStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
        });
        refreshUserData();
      } else {
        clearStore();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
        });
        await refreshUserData();
      } else {
        clearStore();
        if (
          event === "SIGNED_OUT" &&
          window.location.pathname.startsWith("/dashboard")
        ) {
          window.location.assign("/login");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, refreshUserData, clearStore]);

  return <>{children}</>;
}
