import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
      .select("page_id")
      .eq("domain", domainName)
      .eq("verification_status", "verified")
      .single();

    if (customDomain) {
      // Get the page details
      const { data: page } = await supabase
        .from("pages")
        .select("slug, is_active, is_public")
        .eq("id", customDomain.page_id)
        .single();

      if (page && page.is_active && page.is_public) {
        // Rewrite the URL to serve the page
        const url = request.nextUrl.clone();
        url.pathname = `/p/${page.slug}`;
        // Preserve query parameters
        return NextResponse.rewrite(url);
      }
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup") &&
    user
  ) {
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
