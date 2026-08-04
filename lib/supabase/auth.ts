import { cache } from "react";
import { createClient } from "./server";

/**
 * Request-scoped authenticated user lookup.
 *
 * Uses `getSession()` (local cookie/JWT read) instead of `getUser()` (network
 * round-trip to Supabase Auth). Middleware already calls `getUser()` on every
 * request and refreshes the session, so a second Auth RTT in the dashboard
 * layout/pages was doubling navigation latency.
 *
 * Prefer this for RSC data loading behind the middleware gate. For sensitive
 * mutations outside the dashboard, call `getUser()` explicitly when you need
 * a fresh server-side identity check.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
});
