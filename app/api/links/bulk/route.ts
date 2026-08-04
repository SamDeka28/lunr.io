// POST /api/links/bulk — create up to 100 links with plan-limit awareness
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LinkService } from "@/lib/services/link.service";
import { PlanService } from "@/lib/services/plan.service";

const MAX_BULK = 100;

function getBaseUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    request.nextUrl.origin
  ).replace(/\/$/, "");
}

function normalizeTags(tags: unknown): string[] | null {
  if (!tags) return null;
  if (Array.isArray(tags)) {
    const cleaned = tags
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  if (typeof tags === "string") {
    const cleaned = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return cleaned.length ? cleaned : null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const linksInput = body?.links;

    if (!Array.isArray(linksInput) || linksInput.length === 0) {
      return NextResponse.json(
        { error: "links array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (linksInput.length > MAX_BULK) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BULK} links per bulk import` },
        { status: 400 }
      );
    }

    const planService = new PlanService(supabase);
    const linkService = new LinkService(supabase);
    const baseUrl = getBaseUrl(request);

    const created: any[] = [];
    const failed: Array<{ index: number; original_url?: string; error: string }> = [];
    let stoppedDueToLimit = false;

    for (let i = 0; i < linksInput.length; i++) {
      const item = linksInput[i] || {};
      const original_url = item.original_url || item.url;
      const short_code = item.short_code || item.shortCode || undefined;
      const title = item.title || null;
      const tags = normalizeTags(item.tags);

      if (!original_url || typeof original_url !== "string") {
        failed.push({
          index: i,
          original_url: original_url || undefined,
          error: "original_url is required",
        });
        continue;
      }

      const validation = await planService.validateLinkCreation(user.id, {
        short_code,
      });

      if (!validation.valid) {
        // Stop when link quota is hit; continue collecting other validation failures only if not limit
        const isLimit =
          validation.error?.toLowerCase().includes("reached your limit") ||
          validation.error?.toLowerCase().includes("upgrade to create more");

        failed.push({
          index: i,
          original_url,
          error: validation.error || "Plan validation failed",
        });

        if (isLimit) {
          stoppedDueToLimit = true;
          // Mark remaining as skipped due to limit
          for (let j = i + 1; j < linksInput.length; j++) {
            failed.push({
              index: j,
              original_url: linksInput[j]?.original_url || linksInput[j]?.url,
              error: "Skipped: link limit reached",
            });
          }
          break;
        }
        continue;
      }

      try {
        const link = await linkService.createLink({
          original_url,
          short_code,
          title,
          tags,
          user_id: user.id,
        });

        created.push({
          id: link.id,
          short_code: link.short_code,
          original_url: link.original_url,
          title: link.title,
          tags: link.tags || [],
          short_url: `${baseUrl}/${link.short_code}`,
        });

        // Fire-and-forget webhook
        try {
          const { WebhookService } = await import("@/lib/services/webhook.service");
          const webhookService = new WebhookService(supabase);
          await webhookService.triggerWebhooks(user.id, "link.created", link);
        } catch {
          // ignore webhook failures
        }
      } catch (err: any) {
        failed.push({
          index: i,
          original_url,
          error: err.message || "Failed to create link",
        });
      }
    }

    return NextResponse.json({
      created,
      failed,
      summary: {
        total: linksInput.length,
        created: created.length,
        failed: failed.length,
        stopped_due_to_limit: stoppedDueToLimit,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to bulk create links" },
      { status: 500 }
    );
  }
}
