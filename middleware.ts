import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];
const AUTH_EXCEPTION_PAGES = ["/auth/reset-password/confirm"];

function isEmailProvider(user: {
  app_metadata?: { provider?: string };
  identities?: { provider: string }[] | null;
}): boolean {
  const provider =
    user.app_metadata?.provider ?? user.identities?.[0]?.provider;
  return provider === "email";
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add pathname to headers for active link detection
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);

  // Handle custom domain routing
  const hostname = request.headers.get("host") || "";
  const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").split(":")[0] || "";
  
  // Check if this is a custom domain (not our main domain)
  if (hostname && hostname !== appDomain && !hostname.includes("localhost") && !hostname.includes("127.0.0.1")) {
    // Look up the custom domain
    const domainName = hostname.split(":")[0]; // Remove port if present
    const { data: customDomain } = await supabase
      .from("custom_domains")
      .select("page_id, user_id")
      .eq("domain", domainName)
      .eq("verification_status", "verified")
      .maybeSingle();

    if (customDomain) {
      const path = request.nextUrl.pathname;
      // Branded short links: yourdomain.com/{shortCode} → rewrite to /{shortCode}
      // Exclude root and known app paths — root still serves the bio page
      const isRoot = path === "/" || path === "";
      const isReserved = /^\/(api|auth|dashboard|login|signup|docs|_next|p)\b/i.test(path);

      if (!isRoot && !isReserved) {
        // Pass through to short-code redirect handler
        return supabaseResponse;
      }

      // Get the page details for apex/root → bio page
      const { data: page } = await supabase
        .from("pages")
        .select("slug, is_active, is_public")
        .eq("id", customDomain.page_id)
        .single();

      if (page && page.is_active && page.is_public) {
        const url = request.nextUrl.clone();
        url.pathname = `/p/${page.slug}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  const pathname = request.nextUrl.pathname;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Block email-provider users who have not confirmed their email
    if (!user.email_confirmed_at && isEmailProvider(user)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "email_unconfirmed");
      return NextResponse.redirect(url);
    }
  }

  // Password recovery must stay reachable with a recovery session —
  // never treat it as "already logged in → redirect to dashboard"
  if (
    AUTH_EXCEPTION_PAGES.some(
      (page) => pathname === page || pathname.startsWith(`${page}/`)
    )
  ) {
    return supabaseResponse;
  }

  // Redirect authenticated users away from login/signup only
  if (AUTH_PAGES.includes(pathname) && user) {
    // Unconfirmed email users should stay on login to see the notice
    if (!user.email_confirmed_at && isEmailProvider(user)) {
      return supabaseResponse;
    }

    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
