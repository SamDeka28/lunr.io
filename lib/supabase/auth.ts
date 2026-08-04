import { cache } from "react";
import { createClient } from "./server";

/**
 * Request-scoped, memoized authenticated user lookup.
 *
 * `supabase.auth.getUser()` performs a network round-trip to the Supabase Auth
 * server to validate the session token. During a single App Router navigation,
 * the dashboard layout and the target page each render in the same React request
 * scope, so wrapping the call in `cache()` ensures the validation happens once
 * per request instead of once per component. Middleware still validates
 * independently (separate runtime), so auth is unaffected.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
