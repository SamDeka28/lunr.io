import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { ProfileService } from "@/lib/services/profile.service";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createServiceClient();
  const profileService = new ProfileService(admin);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const billingCycle = (session.metadata?.billing_cycle || "monthly") as
          | "monthly"
          | "yearly";

        if (userId && planId) {
          await profileService.upgradePlan(userId, planId);

          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

          if (session.customer) {
            await admin
              .from("profiles")
              .update({
                stripe_customer_id:
                  typeof session.customer === "string"
                    ? session.customer
                    : session.customer.id,
                stripe_subscription_id: subscriptionId || null,
              })
              .eq("id", userId);
          }

          if (subscriptionId) {
            await admin.from("subscriptions").upsert(
              {
                user_id: userId,
                plan_id: planId,
                status: "active",
                started_at: new Date().toISOString(),
                stripe_subscription_id: subscriptionId,
                billing_cycle: billingCycle,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "stripe_subscription_id" }
            ).catch(async () => {
              // Fallback insert if upsert conflict target missing
              await admin.from("subscriptions").insert({
                user_id: userId,
                plan_id: planId,
                status: "active",
                started_at: new Date().toISOString(),
                stripe_subscription_id: subscriptionId,
                billing_cycle: billingCycle,
              });
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const status =
          subscription.status === "active" || subscription.status === "trialing"
            ? "active"
            : subscription.status === "canceled"
            ? "cancelled"
            : "expired";

        await admin
          .from("subscriptions")
          .update({
            status,
            cancelled_at:
              status === "cancelled" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        // Downgrade to free on cancel/delete
        if (
          (event.type === "customer.subscription.deleted" ||
            status === "cancelled" ||
            status === "expired") &&
          userId
        ) {
          const { data: freePlan } = await admin
            .from("plans")
            .select("id")
            .eq("name", "free")
            .single();
          if (freePlan) {
            await profileService.upgradePlan(userId, freePlan.id);
            await admin
              .from("profiles")
              .update({ stripe_subscription_id: null })
              .eq("id", userId);
          }
        } else if (userId && subscription.metadata?.plan_id) {
          await profileService.upgradePlan(userId, subscription.metadata.plan_id);
        }
        break;
      }

      default:
        break;
    }
  } catch (error: any) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
