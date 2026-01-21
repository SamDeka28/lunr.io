// Redirect Handler Route
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LinkService } from "@/lib/services/link.service";
import { AnalyticsService } from "@/lib/services/analytics.service";

function getClientIp(request: NextRequest): string | null {
  // Try various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    
    // Extract UTM parameters from the request URL (prioritize these for dynamic tracking)
    const requestUrl = new URL(request.url);
    
    // Create server-side Supabase client
    const supabase = await createClient();
    const linkService = new LinkService(supabase);
    const link = await linkService.getLinkByShortCode(shortCode);

    if (!link) {
      return NextResponse.json(
        { error: "Link not found or expired" },
        { status: 404 }
      );
    }

    // Check if link requires password
    if (link.password_hash) {
      const password = requestUrl.searchParams.get("password");
      if (!password) {
        // Redirect to password prompt page
        const passwordUrl = new URL(`/${shortCode}/password`, requestUrl.origin);
        return NextResponse.redirect(passwordUrl.toString(), { status: 302 });
      }

      // Verify password
      const { LinkRepository } = await import("@/lib/db/repositories/link.repository");
      const linkRepo = new LinkRepository(supabase);
      const isValid = await linkRepo.verifyPassword(password, link.password_hash);
      
      if (!isValid) {
        // Redirect to password prompt page with error
        const passwordUrl = new URL(`/${shortCode}/password`, requestUrl.origin);
        passwordUrl.searchParams.set("error", "invalid");
        return NextResponse.redirect(passwordUrl.toString(), { status: 302 });
      }
    }

    // Use the same server-side Supabase client for analytics
    const analyticsService = new AnalyticsService(supabase);
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent");
    const referrer = request.headers.get("referer") || request.headers.get("referrer");
    const requestUtmSource = requestUrl.searchParams.get("utm_source");
    const requestUtmMedium = requestUrl.searchParams.get("utm_medium");
    const requestUtmCampaign = requestUrl.searchParams.get("utm_campaign");
    const requestUtmTerm = requestUrl.searchParams.get("utm_term");
    const requestUtmContent = requestUrl.searchParams.get("utm_content");

    // Get link's default UTM parameters
    const linkUtmParams = (link.utm_parameters as Record<string, string>) || {};

    // Priority: Request URL params > Link default params
    const finalUtmSource = requestUtmSource || linkUtmParams.utm_source || null;
    const finalUtmMedium = requestUtmMedium || linkUtmParams.utm_medium || null;
    const finalUtmCampaign = requestUtmCampaign || linkUtmParams.utm_campaign || null;
    const finalUtmTerm = requestUtmTerm || linkUtmParams.utm_term || null;
    const finalUtmContent = requestUtmContent || linkUtmParams.utm_content || null;

    // Increment click count first (synchronous)
    const { LinkRepository } = await import("@/lib/db/repositories/link.repository");
    const linkRepo = new LinkRepository(supabase);
    
    try {
      await linkRepo.incrementClickCount(link.id);
    } catch (error: any) {
      console.error("Failed to increment click count:", error);
      // Don't fail the redirect if click tracking fails
    }

    // Record detailed analytics with UTM parameters (async, don't wait)
    analyticsService.trackClick({
      link_id: link.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer || null,
      country: null, // Could be added with geolocation service
      utm_source: finalUtmSource,
      utm_medium: finalUtmMedium,
      utm_campaign: finalUtmCampaign,
      utm_term: finalUtmTerm,
      utm_content: finalUtmContent,
    }).catch((err) => {
      console.error("Failed to track analytics:", err);
    });

    // Trigger webhook for link.clicked (async, don't wait)
    if (link.user_id) {
      try {
        const { WebhookService } = await import("@/lib/services/webhook.service");
        const webhookService = new WebhookService(supabase);
        // Get updated link with new click count
        const updatedLink = await linkService.getLinkByShortCode(shortCode);
        if (updatedLink) {
          await webhookService.triggerWebhooks(link.user_id, "link.clicked", updatedLink);
        }
      } catch (error) {
        console.error("Failed to trigger webhook for link.clicked:", error);
        // Don't fail the redirect if webhook fails
      }
    }

    // Build redirect URL with UTM parameters appended
    let redirectUrl = link.original_url;
    
    // Only append UTM parameters if we have at least source or medium
    if (finalUtmSource || finalUtmMedium) {
      try {
        // Ensure URL is absolute
        let url: URL;
        try {
          url = new URL(redirectUrl);
        } catch {
          // If not absolute, try to make it absolute by adding https://
          if (!redirectUrl.includes('://')) {
            url = new URL(`https://${redirectUrl}`);
          } else {
            throw new Error("Invalid URL format");
          }
        }
        
        // Add UTM parameters to the destination URL (request params take priority)
        if (finalUtmSource) url.searchParams.set('utm_source', finalUtmSource);
        if (finalUtmMedium) url.searchParams.set('utm_medium', finalUtmMedium);
        if (finalUtmCampaign) url.searchParams.set('utm_campaign', finalUtmCampaign);
        if (finalUtmTerm) url.searchParams.set('utm_term', finalUtmTerm);
        if (finalUtmContent) url.searchParams.set('utm_content', finalUtmContent);
        
        redirectUrl = url.toString();
      } catch (error) {
        // If URL parsing fails, log error but still redirect to original URL
        console.error("Failed to append UTM parameters to URL:", redirectUrl, error);
        // Continue with original URL without UTM params
      }
    }

    // Redirect to original URL with UTM parameters (301 permanent redirect)
    return NextResponse.redirect(redirectUrl, { status: 301 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to redirect" },
      { status: 500 }
    );
  }
}

