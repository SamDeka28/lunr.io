// Redirect Handler Route
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LinkService } from "@/lib/services/link.service";
import { AnalyticsService } from "@/lib/services/analytics.service";
import { getCountryFromRequest } from "@/lib/utils/geo";
import { parseUserAgent } from "@/lib/utils/ua";

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

    // Rate limit redirects per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { rateLimit, RateLimitPresets } = await import("@/lib/utils/rate-limit");
    const rl = await rateLimit(
      `redirect:${ip}`,
      RateLimitPresets.redirect.limit,
      RateLimitPresets.redirect.windowMs
    );
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

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

    // Enforce campaign date window when link is assigned to a campaign
    if (link.campaign_id) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id, name, start_date, end_date, is_active")
        .eq("id", link.campaign_id)
        .maybeSingle();

      if (campaign) {
        const { CampaignService } = await import("@/lib/services/campaign.service");
        const window = CampaignService.isWithinDateWindow(campaign);
        if (!window.active) {
          const inactiveUrl = new URL(`/${shortCode}/inactive`, requestUrl.origin);
          inactiveUrl.searchParams.set("reason", window.reason || "ended");
          if (campaign.name) {
            inactiveUrl.searchParams.set("campaign", campaign.name);
          }
          return NextResponse.redirect(inactiveUrl.toString(), { status: 302 });
        }
      }
    }

    const analyticsService = new AnalyticsService(supabase);
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get("user-agent");
    const referrer = request.headers.get("referer") || request.headers.get("referrer");
    const country = getCountryFromRequest(request);
    const parsedUa = parseUserAgent(userAgent);
    const requestUtmSource = requestUrl.searchParams.get("utm_source");
    const requestUtmMedium = requestUrl.searchParams.get("utm_medium");
    const requestUtmCampaign = requestUrl.searchParams.get("utm_campaign");
    const requestUtmTerm = requestUrl.searchParams.get("utm_term");
    const requestUtmContent = requestUrl.searchParams.get("utm_content");

    // Preview bots get OG HTML before password gate so shares still unfurl
    if (parsedUa.isBot) {
      const { buildLinkPreviewHtml } = await import("@/lib/utils/link-preview");
      const previewTitle =
        link.title?.trim() ||
        (() => {
          try {
            return new URL(link.original_url).hostname;
          } catch {
            return link.short_code;
          }
        })();
      const previewDescription =
        link.description?.trim() || `Visit ${previewTitle}`;
      const shortPageUrl = `${requestUrl.origin}/${shortCode}`;
      const html = buildLinkPreviewHtml({
        title: previewTitle,
        description: previewDescription,
        url: shortPageUrl,
        imageUrl: link.og_image_url,
        siteName: "lunr.to",
      });

      analyticsService
        .trackClick({
          link_id: link.id,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer || null,
          country,
          device_type: parsedUa.deviceType,
          browser: parsedUa.browser,
          os: parsedUa.os,
          is_bot: true,
          utm_source:
            requestUtmSource ||
            (link.utm_parameters as Record<string, string>)?.utm_source ||
            null,
          utm_medium:
            requestUtmMedium ||
            (link.utm_parameters as Record<string, string>)?.utm_medium ||
            null,
          utm_campaign:
            requestUtmCampaign ||
            (link.utm_parameters as Record<string, string>)?.utm_campaign ||
            null,
          utm_term:
            requestUtmTerm ||
            (link.utm_parameters as Record<string, string>)?.utm_term ||
            null,
          utm_content:
            requestUtmContent ||
            (link.utm_parameters as Record<string, string>)?.utm_content ||
            null,
        })
        .catch((err) => {
          console.error("Failed to track bot preview analytics:", err);
        });

      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    // Check if link requires password (cookie-based access, never query string)
    if (link.password_hash) {
      const {
        getAccessCookieName,
        verifyLinkAccessCookie,
      } = await import("@/lib/utils/password");
      const accessCookie = request.cookies.get(getAccessCookieName(shortCode))?.value;

      if (!verifyLinkAccessCookie(accessCookie, link.id, link.password_hash)) {
        const passwordUrl = new URL(`/${shortCode}/password`, requestUrl.origin);
        return NextResponse.redirect(passwordUrl.toString(), { status: 302 });
      }
    }

    // Lead capture gate (after password, before click tracking)
    if (link.lead_capture_enabled) {
      const {
        getLeadAccessCookieName,
        verifyLeadAccessCookie,
      } = await import("@/lib/utils/lead-capture");
      const leadCookie = request.cookies.get(getLeadAccessCookieName(shortCode))?.value;

      if (!verifyLeadAccessCookie(leadCookie, link.id)) {
        const leadUrl = new URL(`/${shortCode}/lead`, requestUrl.origin);
        return NextResponse.redirect(leadUrl.toString(), { status: 302 });
      }
    }

    // Get link's default UTM parameters
    const linkUtmParams = (link.utm_parameters as Record<string, string>) || {};

    // Priority: Request URL params > Link default params
    const finalUtmSource = requestUtmSource || linkUtmParams.utm_source || null;
    const finalUtmMedium = requestUtmMedium || linkUtmParams.utm_medium || null;
    const finalUtmCampaign = requestUtmCampaign || linkUtmParams.utm_campaign || null;
    const finalUtmTerm = requestUtmTerm || linkUtmParams.utm_term || null;
    const finalUtmContent = requestUtmContent || linkUtmParams.utm_content || null;

    // Increment click_count only for non-bot traffic; still record bots in analytics
    if (!parsedUa.isBot) {
      const { LinkRepository } = await import("@/lib/db/repositories/link.repository");
      const linkRepo = new LinkRepository(supabase);

      try {
        await linkRepo.incrementClickCount(link.id);
      } catch (error: any) {
        console.error("Failed to increment click count:", error);
        // Don't fail the redirect if click tracking fails
      }
    }

    // Record detailed analytics with UTM + device fields (async, don't wait)
    analyticsService
      .trackClick({
        link_id: link.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer || null,
        country,
        device_type: parsedUa.deviceType,
        browser: parsedUa.browser,
        os: parsedUa.os,
        is_bot: parsedUa.isBot,
        utm_source: finalUtmSource,
        utm_medium: finalUtmMedium,
        utm_campaign: finalUtmCampaign,
        utm_term: finalUtmTerm,
        utm_content: finalUtmContent,
      })
      .catch((err) => {
        console.error("Failed to track analytics:", err);
      });

    // Trigger webhook for link.clicked only for human clicks (async, don't wait)
    if (link.user_id && !parsedUa.isBot) {
      try {
        const { WebhookService } = await import("@/lib/services/webhook.service");
        const webhookService = new WebhookService(supabase);
        const updatedLink = await linkService.getLinkByShortCode(shortCode);
        if (updatedLink) {
          await webhookService.triggerWebhooks(link.user_id, "link.clicked", updatedLink);
        }
      } catch (error) {
        console.error("Failed to trigger webhook for link.clicked:", error);
      }
    }

    // Build redirect URL with UTM parameters appended
    let redirectUrl = link.original_url;

    // Only append UTM parameters if we have at least source or medium
    if (finalUtmSource || finalUtmMedium) {
      try {
        let url: URL;
        try {
          url = new URL(redirectUrl);
        } catch {
          if (!redirectUrl.includes("://")) {
            url = new URL(`https://${redirectUrl}`);
          } else {
            throw new Error("Invalid URL format");
          }
        }

        if (finalUtmSource) url.searchParams.set("utm_source", finalUtmSource);
        if (finalUtmMedium) url.searchParams.set("utm_medium", finalUtmMedium);
        if (finalUtmCampaign) url.searchParams.set("utm_campaign", finalUtmCampaign);
        if (finalUtmTerm) url.searchParams.set("utm_term", finalUtmTerm);
        if (finalUtmContent) url.searchParams.set("utm_content", finalUtmContent);

        redirectUrl = url.toString();
      } catch (error) {
        console.error("Failed to append UTM parameters to URL:", redirectUrl, error);
      }
    }

    // Pass short code to the destination for conversion pixel attribution
    try {
      const { appendLunrScParam } = await import("@/lib/utils/conversion-track");
      redirectUrl = appendLunrScParam(redirectUrl, shortCode);
    } catch (error) {
      console.error("Failed to append lunr_sc:", error);
    }

    // Temporary redirect (302) so destination edits propagate; browsers won't permanently cache
    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to redirect" },
      { status: 500 }
    );
  }
}
