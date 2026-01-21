"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/store/user-store";

/**
 * Provider component that syncs Supabase auth state with Zustand store
 * Should be placed in the root layout or dashboard layout
 */
export function UserStoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser, refreshUserData, clearStore, user } = useUserStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
        });
        // Fetch user profile and plan data
        refreshUserData();
      } else {
        clearStore();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
        });
        // Fetch user profile and plan data
        await refreshUserData();
      } else {
        clearStore();
        if (event === "SIGNED_OUT") {
          router.push("/login");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, refreshUserData, clearStore, router]);

  return <>{children}</>;
}

