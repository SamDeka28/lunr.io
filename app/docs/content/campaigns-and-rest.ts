import type { DocsSection } from "./types";

export const campaignsSection: DocsSection = {
  id: "campaigns",
  title: "Campaign Studio",
  icon: "Monitor",
  description: "Run initiatives with links, partners, spend, and conversions in one workspace",
  articles: [
    {
      id: "creating-campaigns",
      title: "Campaign Studio overview",
      content: `**Campaign Studio** is where an initiative becomes intelligible. Instead of asking your team to remember which seventeen links belonged to the spring launch, you put those links (and optional partners) in one workspace with shared defaults, shared analytics, shared spend, and a dedicated Pixel Studio.

A campaign is not a magic link type. It is a **bucket plus an operating surface**. Links still redirect on their own; the campaign explains them together.

## When you need a campaign

Create one when you have a bounded push: a launch, a partner program flight, a seasonal promo, a conference week. If the URL is evergreen and unbudgeted, a naked short link is simpler.

## Creating with intent

**Campaigns → New campaign**. Name it the way humans already refer to the work. Pick a type that matches the story (Product Launch by default; Influencer or Affiliate when partners are central). Types change guidance and empty states more than they lock capabilities.

Fill dates when the flight is real — assigned links can respect campaign windows. Set currency before fees. **Planned budget** is a planning number; it is not Spend. Default destination and UTM defaults save time when generating partner links and new member links — defaults fill empty keys only, so deliberate per-link UTMs stay intact.

## The studio tabs (and how to think about them)

**Primary:** Overview · Links · Analytics. These are the everyday surface.

**More:** Partners · Pixel · Spend — always reachable, but not peer weight for every campaign. Partners is emphasized for partner-type campaigns (or when partners already exist). Pixel can surface a subtle cue when you have links but no conversions yet.

**Overview** — calm when empty (tips you can dismiss); KPI command center once links exist.

**Links** — membership and creation with campaign UTM inheritance.

**Analytics** — read performance, export CSV. Outcomes only — install snippets live under Pixel.

**Partners** — only if people need unique URLs. Skip freely for email/paid-only launches.

**Pixel** — **Pixel Studio**: configure events and copy install code.

**Spend** — log real costs as they become known.

**Edit details** (header) — name, type, dates, budget, and advanced defaults (destination, UTM). There is no Settings tab.

## Lifecycle features

**Compare** two campaigns from the list when you want an honest rematch against a prior flight.

**Archive** when the initiative is done. Archiving unassigns links so redirects continue; you are not forced into broken marketing materials just to tidy the sidebar.

## Learning path

New to the shape of campaigns? Start with a [product launch use case](/docs/use-cases/product-launch) or [partners use case](/docs/use-cases/affiliate-partners), then return here for reference.`,
    },
    {
      id: "influencer-setup",
      title: "Partners & influencer setup",
      content: `The Partners tab is a lightweight affiliate layer: unique links, status, fees, and leaderboards — without pretending to be a full affiliate network.

## Philosophy

Partners should never be asked to “add these UTM parameters please.” You generate the link; lunr encodes attribution; they paste one URL into their bio or video description.

## Setup sequence

Create the campaign with a default destination and currency. Open **Partners** and add people individually or via CSV:

\`\`\`
display_name,handle,platform,fee_amount,destination_url
\`\`\`

Generate links as you go. Share only the short URL. Move statuses as the relationship progresses; mark **paid** when money leaves so fees can land in Spend.

Install Pixel Studio on the commercial path so leaderboards include conversions, not only clicks. Export CSV for payout worksheets.

Narrative depth: [Affiliates & partners use case](/docs/use-cases/affiliate-partners).`,
    },
    {
      id: "conversion-tracking",
      title: "Pixel Studio",
      content: `**Pixel Studio** is how lunr.to learns that a goal happened after the click. Without it, campaigns can report traffic forever and still not answer “did we make money?”

## Why a studio instead of a raw URL

Conversion installs fail in boring ways: wrong event name, missing attribution param, double fires, staging-only snippets. Pixel Studio centralizes event choice, install method, live snippet generation, and test fire so you are not hand-editing query strings on a deadline.

## Attribution in plain language

A short link click may append \`lunr_sc\` to your destination. That value is the breadcrumb. Landing capture stores it if checkout destroys query strings. The thank-you pixel or postback sends it back with the event. lunr attaches the conversion to the link, campaign, and partner when the short code belongs to one.

## Choosing an install method

**Landing capture** — always consider it for ecommerce funnels.

**Thank-you JavaScript** — fine for marketing sites and early tests.

**Image pixel** — when you cannot run JS.

**Server postback** — preferred whenever you control order creation. Send \`idk\` so retries are safe.

## Operating rhythm

Configure → copy → install on production → test fire → place a real test conversion → only then scale traffic. Treat pixel URLs like secrets; anyone with them can emit events for that campaign token.

Public endpoints and field reference remain available for engineers; marketers can stay inside the studio UI.

Deep dive: [Ecommerce purchase tracking](/docs/use-cases/ecommerce-conversions).`,
    },
    {
      id: "spend-and-metrics",
      title: "Spend, CPC & CPA",
      content: `Money metrics are easy to fake when tooling silently imports incomplete ad spend or forgets creator fees. lunr.to keeps spend **manual** so CPC and CPA reflect the costs you are willing to stand behind.

## Two different numbers people confuse

**Planned budget** lives on the campaign as a planning ceiling. It helps you think; it should not quietly become “what we spent.”

**Spend entries** are explicit rows: media bills, boosts, retainers, partner fees. These feed CPC and CPA.

## Logging spend without drama

Open **Spend**, add amounts with notes your future self understands (“Meta W12”, “Priya — March invoice”). When partner workflows mark someone **paid**, fees can appear here automatically — still review them.

You will not find a Google Ads connector. That is intentional product scope, not a missing checkbox.

## Definitions

**CPC** = logged spend ÷ clicks in range.

**CPA** = logged spend ÷ conversions in range.

**Conversion rate** = conversions ÷ clicks.

If spend is empty, treat CPC/CPA with suspicion even if the UI shows a fallback based on planned budget. Planning math is not accounting math.

## A sane weekly loop

Ship traffic → confirm conversions fire → enter spend when invoices land → read CPA on Analytics → decide which partners or channels deserve more next week.

Related: [Campaign Analytics](/docs/campaigns/campaign-analytics).`,
    },
    {
      id: "campaign-analytics",
      title: "Campaign analytics",
      content: `Campaign Analytics is the scoreboard. Pixel Studio and Spend are how the scoreboard gets honest inputs.

## What you will see

Within a date range: clicks, approximate uniques, conversions, conversion rate, spend, CPC, CPA, planned budget, partner leaderboard, platform mix, UTM sources, link leaderboard, and CSV export.

Read them as a set. High clicks with zero conversions point at funnel or pixel problems. Strong conversions with blank CPA point at missing spend logs. Strong CPA on one partner and weak CPA on another is how you reallocate creatively — not how you argue about vanity metrics.

## Compare and archive

Use list **Compare** for structured rematches between flights. **Archive** completed initiatives so the active list stays calm without breaking live redirects.

If Analytics looks empty while Pixel test fire works, check the date range and whether you are viewing the correct campaign.`,
    },
  ],
};

export const domainsSection: DocsSection = {
  id: "custom-domains",
  title: "Custom Domains",
  icon: "Globe",
  description: "Put bio pages on a hostname you own",
  articles: [
    {
      id: "setting-up-domains",
      title: "Setting up custom domains",
      content: `Custom domains let bio pages live on \`links.yourbrand.com\` (or similar) instead of a lunr path. Branded short links on custom domains are on the roadmap; today the verified domain is about page hosting and presence.

## Availability

Business and Enterprise plans unlock custom domains. Exact limits depend on your plan row in Billing.

## Setup mindset

DNS changes are slow and public. Prefer a subdomain dedicated to lunr rather than moving your corporate apex casually. Add the CNAME and verification TXT exactly as the dashboard shows, wait for propagation, then verify in-product.

TLS: terminate HTTPS at your DNS/CDN provider until automatic certificate provisioning ships. A verified domain without HTTPS will still feel broken to visitors.

After verification, root/apex behavior can serve your bio page while reserved app paths remain reserved.`,
    },
    {
      id: "domain-troubleshooting",
      title: "Domain troubleshooting",
      content: `Most failures are propagation delay or a typo in CNAME/TXT. Wait, re-read the records, and check with a public DNS tool before opening a support ticket.

If HTTPS fails, verification alone is not enough — configure certificates at the edge. If the domain is “already in use,” remove it from the other lunr account first.

Keep the verification TXT around; deleting it later can create confusing re-check failures.`,
    },
  ],
};

export const billingSection: DocsSection = {
  id: "billing",
  title: "Billing & Plans",
  icon: "CreditCard",
  description: "Choose capacity and unlock studios as you grow",
  articles: [
    {
      id: "plans-pricing",
      title: "Plans & pricing",
      content: `Plans gate both **capacity** (how many links, QR codes, pages) and **capabilities** (gates, campaigns, domains, API).

## Free

Zero cost. Small limits. Enough to feel redirects and basic analytics. No custom back-halves, UTM tooling, password/lead gates, pages, or Campaign Studio.

## Pro

The working plan for serious individuals and small teams: higher limits, pages, custom back-halves, expiration, UTM, password and Lead Gate Studio, Campaign Studio and Pixel Studio, richer analytics and QR customization.

## Business

Room to grow — more links/QR/pages, custom domains for bio pages, collaboration-oriented features, priority support expectations.

## Enterprise

Unlimited-scale ceilings, API keys, webhooks, and account-style support options for organizations that integrate lunr into their stack.

Pricing amounts and yearly discounts are shown on the Pricing page and Billing screen from live plan data. Upgrade via Stripe; entitlements apply after successful payment.

If a feature appears in docs but not in your UI, check plan first, then feature flags (for example campaigns can be disabled on some deployments).`,
    },
    {
      id: "billing-management",
      title: "Billing management",
      content: `Open **Billing** for plan, usage meters, and upgrade paths. When the Stripe customer portal is configured, use it to change payment methods and review subscription status.

Upgrades are typically immediate. Downgrades and cancellations usually follow the billing period rules of the portal. Keep an eye on usage meters before a big campaign so you are not blocked mid-flight while creating partner links.

Invoice PDF availability may depend on Stripe portal configuration — use the portal as the source of truth for payment history when in doubt.`,
    },
  ],
};

export const apiSection: DocsSection = {
  id: "api",
  title: "API (Enterprise)",
  icon: "Code",
  description: "Automate links, campaigns, conversions, and webhooks",
  articles: [
    {
      id: "api-overview",
      title: "API overview",
      content: `The Enterprise API exists for teams that already have systems of record — CRMs, order backends, internal admin tools — and need lunr.to to participate programmatically.

## Capabilities

Create and manage links, generate QR codes, read analytics, manage campaigns and conversions, and register webhooks. Dashboard-only experiences such as Lead Gate visual design still happen in the UI; public lead submit and owner lead export have dedicated HTTP routes documented in the API Reference.

## Authentication

Create a key under Settings → API Keys. Store it once. Send:

\`\`\`
Authorization: Bearer sk_your_api_key_here
\`\`\`

Base path: \`/api/v1\` on your deployment host.

<!-- CTA:API_REFERENCE -->

## Rate limits and hygiene

Default hourly limits apply per key; response headers advertise remaining quota. Rotate keys, never commit them, and use separate keys per environment.

## Webhooks

Register endpoints that accept POST callbacks. Verify HMAC signatures. Handle retries idempotently. Link lifecycle and click events are common; conversion events matter when you automate downstream workflows.

Engineers implementing purchase postbacks may prefer the public conversion postback/pixel routes or \`POST /api/v1/conversions\` depending on whether the caller has an API key or a campaign HMAC token from Pixel Studio.

Full catalogs, payloads, and multi-language examples live in the [API Reference](/api-reference).`,
    },
  ],
};

export const faqSection: DocsSection = {
  id: "faq",
  title: "FAQ",
  icon: "HelpCircle",
  description: "Straight answers to questions teams ask after week one",
  articles: [
    {
      id: "common-questions",
      title: "Common questions",
      content: `## How does shortening work?

lunr stores your destination and a short code. On click, optional gates run, analytics record the visit, and the visitor is redirected — often with UTM and \`lunr_sc\` appended.

## Are links permanent?

Yes, until you delete them or they expire. Campaign archive does not invent random breakage for assigned links; archival is designed to keep redirects working after unassign.

## Can I edit later?

Yes. Destinations, titles, gates, UTM, campaign membership, and QR settings are editable. Prefer editing destination over changing a widely distributed short code.

## Campaign vs link vs pixel — what is the difference?

A **link** moves a person. A **campaign** groups links for one initiative’s reporting and operations. A **pixel/postback** tells lunr a goal happened after the visit. You can use links alone; campaigns and pixels appear when the questions get bigger.

## Do you import Google/Meta spend?

No. Log spend manually so CPC/CPA match reality including partner fees.

## Can I export data?

Yes — lead CSV, campaign analytics CSV, and Enterprise API access. More export entry points may appear over time; those three cover most needs today.

## Is click data stored?

Yes, for analytics. Treat geo enrichment as partially rolled out unless you have verified it on your account.`,
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      content: `## Redirect problems

Check expiration, campaign date windows / inactive interstitial, password and lead gates, and browser cache. Test in a private window before assuming production is down.

## Custom back-half rejected

Requires Pro+. Must be unique and within format rules. If it is taken, choose another code.

## Conversions missing

Test fire works but live fails → snippet not on production, \`lunr_sc\` lost in checkout, or postback auth/params wrong. CPA blank → missing spend and/or conversions in the selected range.

## Analytics confusion

Wrong date range and wrong campaign are the top two causes. Bot filtering can also make “I clicked once” differ from dashboard totals.

## Account access

Confirm email when required, use password reset, re-login after upgrades so feature flags refresh.

Still stuck after docs? Contact support; Enterprise customers should use their account channel when assigned.`,
    },
  ],
};
