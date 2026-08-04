import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStripe, getStripePriceId } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Set STRIPE_SECRET_KEY to enable checkout." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id, billing_cycle = "monthly" } = body as {
      plan_id: string;
      billing_cycle?: "monthly" | "yearly";
    };

    if (!plan_id) {
      return NextResponse.json({ error: "plan_id is required" }, { status: 400 });
    }

    const admin = createServiceClient();
    const { data: plan } = await admin
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (!plan || plan.name === "free") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = getStripePriceId(plan.name, billing_cycle);
    if (!priceId) {
      return NextResponse.json(
        {
          error: `Stripe price not configured for ${plan.name} (${billing_cycle}). Set STRIPE_PRICE_${plan.name.toUpperCase()}_${billing_cycle === "monthly" ? "MONTHLY" : "YEARLY"}.`,
        },
        { status: 503 }
      );
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    const stripe = getStripe();
    let customerId = profile?.stripe_customer_id || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/billing?checkout=success`,
      cancel_url: `${origin}/dashboard/billing?checkout=cancel`,
      metadata: {
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        billing_cycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: plan.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
