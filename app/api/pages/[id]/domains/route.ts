import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";
import crypto from "crypto";

// GET /api/pages/[id]/domains - Get custom domains for a page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageService = new PageService(supabase);
    const page = await pageService.getPageById(params.id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check ownership
    if (page.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get custom domains for this page
    const { data: domains, error } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("page_id", params.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch domains: ${error.message}`);
    }

    return NextResponse.json({ domains: domains || [] });
  } catch (error: any) {
    console.error("Error fetching domains:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch domains" },
      { status: 500 }
    );
  }
}

// POST /api/pages/[id]/domains - Add a custom domain
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageService = new PageService(supabase);
    const page = await pageService.getPageById(params.id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check ownership
    if (page.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;
    const normalizedDomain = domain.toLowerCase().trim();

    if (!domainRegex.test(normalizedDomain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const { data: existingDomain } = await supabase
      .from("custom_domains")
      .select("id")
      .eq("domain", normalizedDomain)
      .single();

    if (existingDomain) {
      return NextResponse.json(
        { error: "This domain is already in use" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Get the app domain for DNS instructions
    const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "lunr.to";

    // Create DNS records instructions
    const dnsRecords = [
      {
        type: "CNAME",
        name: normalizedDomain,
        value: appDomain,
        priority: null,
        ttl: 3600,
      },
      {
        type: "TXT",
        name: `_lunr-verification.${normalizedDomain}`,
        value: verificationToken,
        priority: null,
        ttl: 3600,
      },
    ];

    // Insert custom domain
    const { data: customDomain, error } = await supabase
      .from("custom_domains")
      .insert({
        page_id: params.id,
        domain: normalizedDomain,
        verification_token: verificationToken,
        verification_status: "pending",
        dns_records: dnsRecords,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This domain is already in use" },
          { status: 400 }
        );
      }
      throw new Error(`Failed to add domain: ${error.message}`);
    }

    // Update page with custom_domain_id if this is the first domain
    if (!page.custom_domain_id) {
      await supabase
        .from("pages")
        .update({ custom_domain_id: customDomain.id })
        .eq("id", params.id);
    }

    return NextResponse.json({ domain: customDomain });
  } catch (error: any) {
    console.error("Error adding domain:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add domain" },
      { status: 500 }
    );
  }
}

