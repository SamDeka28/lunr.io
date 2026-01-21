import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PageService } from "@/lib/services/page.service";

// Helper function to resolve DNS records
async function resolveDNS(domain: string, type: "TXT" | "CNAME"): Promise<string[]> {
  try {
    // Use a DNS over HTTPS service for serverless compatibility
    const dnsProvider = "https://cloudflare-dns.com/dns-query";
    const response = await fetch(
      `${dnsProvider}?name=${encodeURIComponent(domain)}&type=${type}`,
      {
        headers: {
          Accept: "application/dns-json",
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data.Answer || data.Answer.length === 0) {
      return [];
    }

    return data.Answer.map((record: any) => {
      if (type === "TXT") {
        return record.data.replace(/^"|"$/g, ""); // Remove quotes from TXT records
      }
      return record.data;
    });
  } catch (error) {
    console.error(`DNS resolution error for ${domain}:`, error);
    return [];
  }
}

// DELETE /api/pages/[id]/domains/[domainId] - Remove a custom domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; domainId: string } }
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

    // Get the domain to verify ownership
    const { data: domain, error: domainError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", params.domainId)
      .eq("page_id", params.id)
      .single();

    if (domainError || !domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Delete the domain
    const { error: deleteError } = await supabase
      .from("custom_domains")
      .delete()
      .eq("id", params.domainId);

    if (deleteError) {
      throw new Error(`Failed to delete domain: ${deleteError.message}`);
    }

    // If this was the active domain, clear it from the page
    if (page.custom_domain_id === params.domainId) {
      await supabase
        .from("pages")
        .update({ custom_domain_id: null })
        .eq("id", params.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting domain:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete domain" },
      { status: 500 }
    );
  }
}

// POST /api/pages/[id]/domains/[domainId]/verify - Verify domain ownership
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; domainId: string } }
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

    // Get the domain
    const { data: domain, error: domainError } = await supabase
      .from("custom_domains")
      .select("*")
      .eq("id", params.domainId)
      .eq("page_id", params.id)
      .single();

    if (domainError || !domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Verify DNS records
    let verificationPassed = false;
    let cnamePassed = false;
    let txtPassed = false;

    try {
      // Check CNAME record
      const cnameRecords = await resolveDNS(domain.domain, "CNAME");
      const appDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") || "lunr.to";
      cnamePassed = cnameRecords.some((record) => 
        record.toLowerCase().endsWith(`.${appDomain.toLowerCase()}`) || 
        record.toLowerCase() === appDomain.toLowerCase()
      );
    } catch (error) {
      // CNAME not found or error
      cnamePassed = false;
    }

    try {
      // Check TXT record for verification
      const txtRecordName = `_lunr-verification.${domain.domain}`;
      const txtRecords = await resolveDNS(txtRecordName, "TXT");
      txtPassed = txtRecords.some((record) =>
        record.includes(domain.verification_token)
      );
    } catch (error) {
      // TXT record not found or error
      txtPassed = false;
    }

    verificationPassed = cnamePassed && txtPassed;

    // Update domain status
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (verificationPassed) {
      updateData.verification_status = "verified";
      updateData.verified_at = new Date().toISOString();
      updateData.ssl_status = "pending"; // SSL will be provisioned separately
    } else {
      updateData.verification_status = "failed";
    }

    const { data: updatedDomain, error: updateError } = await supabase
      .from("custom_domains")
      .update(updateData)
      .eq("id", params.domainId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update domain: ${updateError.message}`);
    }

    return NextResponse.json({
      domain: updatedDomain,
      verification: {
        passed: verificationPassed,
        cname: cnamePassed,
        txt: txtPassed,
      },
    });
  } catch (error: any) {
    console.error("Error verifying domain:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify domain" },
      { status: 500 }
    );
  }
}

