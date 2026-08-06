import type { DocsSection } from "./types";

export const gettingStartedSection: DocsSection = {
  id: "getting-started",
  title: "Getting Started",
  icon: "Zap",
  description: "Orient yourself in lunr.to before you build anything",
  articles: [
    {
      id: "introduction",
      title: "Introduction to lunr.to",
      content: `lunr.to is link infrastructure for people who run campaigns — not just people who need a shorter URL.

Most teams start with a simple need: “make this link shareable.” Within a week they usually need more: a QR for a poster, a form before the download, a way to tell which creator drove yesterday’s sales, or a clean bio page that does not look like a generic link tree. lunr.to is designed so those jobs live in one product instead of a pile of disconnected tools.

## What problem it solves

When marketing traffic is scattered across raw URLs, screenshots of QR codes, spreadsheet UTMs, and ad-platform pixels, you lose the story of a campaign. You can see clicks in one place and revenue in another, but you cannot answer simple questions:

- Which Instagram partner actually moved product?
- Did the lobby poster outperform the email blast?
- What did we pay per acquisition after creator fees?

lunr.to keeps the **click path**, the **optional gates** (password / lead form), the **offline QR**, the **initiative rollup** (Campaign Studio), and the **conversion signal** (Pixel Studio) under one roof. Spend stays intentional and manual on purpose — we are not trying to become your ads manager.

## The mental model

Think in layers:

1. **A short link** is the atomic unit. Someone clicks it; optionally they pass a password or lead form; then they reach your destination while lunr records the visit.
2. **A page** is a public surface you own (bio / landing) that can point at many short links.
3. **A campaign** is a folder for one initiative. Links and partners inside it share defaults and roll up into shared analytics, spend, and conversions.
4. **A pixel / postback** is how your website tells lunr that a goal happened after the click (purchase, signup, and so on).

You do not have to use every layer on day one. Many accounts only shorten links for months. Studios appear when the job gets bigger.

## Studios — guided setup, not buried settings

Several advanced flows are deliberately presented as **studios**: focused workspaces with preview, copy-ready output, and clear vocabulary.

- **Lead Gate Studio** — design the branded form visitors see before redirect.
- **Page Studio** — build bio and landing pages.
- **Campaign Studio** — run an initiative (links, partners, analytics, spend, pixel).
- **Pixel Studio** — configure conversion events and install snippets for that campaign.

If you only remember one idea from this page: **links move people; campaigns explain initiatives; pixels close the loop.**

## Who tends to use what

**Creators and social teams** usually start with Pages and short links, then add QR for offline and a lead gate for newsletter drops.

**Performance and growth marketers** lean on Campaign Studio, UTM defaults, partner links, and Pixel Studio postbacks so CPA is honest.

**Ecommerce operators** care most about \`lunr_sc\` attribution through checkout and server postbacks with order IDs so retries never double-count.

**Agencies** often run one campaign per client initiative, compare periods, and export CSV for reporting.

## What you will not find (by design)

- Automatic Google Ads / Meta Ads spend import — log spend when you know the real number.
- A full CRM — Lead Gate captures contacts; you export or webhook onward.
- Branded short links on custom domains — bio pages on custom domains ship today; branded short paths are on the roadmap.

## Where to go next

If you are brand new, create an account and skim the [Glossary](/docs/getting-started/glossary) so the UI labels make sense. Then pick a [use case](/docs/use-cases/product-launch) that matches the job you are actually trying to finish this week — not every feature at once.`,
    },
    {
      id: "creating-account",
      title: "Creating your account",
      content: `You can evaluate lunr.to without a card. The Free plan is intentionally small so you can feel the redirect and analytics loop before you commit to Pro features like lead gates and Campaign Studio.

## Sign up

1. Open the lunr.to homepage and choose **Get Started Free** (or **Sign up** from the header).
2. Register with email and password, or continue with Google when that provider is enabled on your deployment.
3. If you used email/password, confirm the address from the verification message. Unconfirmed email accounts may be blocked from the dashboard until you verify.
4. After confirmation you land on the dashboard Home view — usage meters, quick actions, and recent activity.

## What Free includes (and what it does not)

Free is enough to:

- Create a couple of short links and QR codes
- See click activity update
- Learn the dashboard navigation

Free does **not** include custom back-halves, UTM fields, password gates, Lead Gate Studio, pages, or Campaign Studio. Those unlock on **Pro** and higher. That split keeps the free experience honest: you are testing the core shorten → click → analytics loop, not a trial of every enterprise toggle.

When you outgrow Free, open **Billing**, pick a plan, and complete Stripe checkout. Limits and feature flags update as soon as payment succeeds — usually no support ticket required.

## First actions after signup

Resist creating twenty experimental links. Do one of these instead:

- Shorten the URL you share most often and replace it in one live channel.
- Or follow a single [use case guide](/docs/use-cases/product-launch) end to end.

You will learn more from one real click path than from a dashboard full of unused objects.`,
    },
    {
      id: "dashboard-overview",
      title: "Dashboard overview",
      content: `The dashboard is organized by object type on the left, and by “job” once you open Campaign Studio or a studio editor. Learning where things live saves a lot of clicking later.

## Sidebar map

**Home** summarizes usage against your plan and surfaces recent work. It is a pulse check, not the place you do deep analysis.

**Links** is the library of every short URL you own. Create, search, filter, folder/tag, bulk import, and open per-link analytics or Lead Gate Studio from here.

**QR Codes** lists scannable assets. Each QR is tied to a destination (usually a short link) so scans inherit the same analytics story as clicks.

**Pages** holds bio and landing pages built in Page Studio. Publish a \`/p/{slug}\` path, or attach a verified custom domain on Business+.

**Analytics** is the account-wide snapshot — useful when you want cross-link trends without opening a campaign.

**Campaigns** opens Campaign Studio when your plan and feature flag allow it. Treat this as initiative HQ, not a second link list.

**Custom domains** manages DNS verification for branded bio hosting.

**Billing** and **Settings** cover plan, usage, profile, and (on Enterprise) API keys.

## How professionals usually move through it

A typical week is not “visit every sidebar item.” It looks more like:

1. Create or edit links for this week’s channels.
2. If an initiative spans channels, keep them inside one campaign.
3. Check campaign Analytics after traffic lands; open Pixel Studio only when wiring or debugging conversions.
4. Log spend when invoices arrive — not every morning.

## Studios vs lists

Lists (Links, QR, Pages, Campaigns) answer “what do I own?” Studios answer “how do I configure this properly?” When the UI offers a studio (Leads tab on a link, Pixel tab on a campaign, Page editor), prefer it over hunting for scattered toggles — the studio is where defaults, previews, and copy-paste output are designed to live.`,
    },
    {
      id: "glossary",
      title: "Glossary & terminology",
      content: `This glossary is the shared language for lunr.to docs, UI, and API. Skim it once; return when a label in the product feels overloaded (especially “tracking,” which can mean UTM, pixels, or partner links depending on context).

## Links and gates

| Term | Meaning |
|------|---------|
| **Short link** | The public URL people click, such as \`lunr.to/abc123\` |
| **Short code / back-half** | The path segment after your domain. Random codes are fine for tests; custom back-halves (Pro+) are better for print, memory, and brand |
| **Destination / original URL** | Where the visitor finally lands after any gates. You can usually edit this later without changing the short code |
| **Gate** | Any step between click and destination — currently password and/or lead capture |
| **Password gate** | Visitors must unlock \`/{shortCode}/password\` before continuing |
| **Lead gate** | A branded form at \`/{shortCode}/lead\`. After submit, lunr stores the response and continues |
| **Lead Gate Studio** | The designer for that form: Form, Fields, Design, and Settings, with live preview |
| **UTM parameters** | Standard campaign tags (\`utm_source\`, \`utm_medium\`, \`utm_campaign\`, \`utm_term\`, \`utm_content\`) stored on the link and appended on redirect |
| **Click** | A recorded visit through a short link (bots may be handled differently from humans) |

## Campaign Studio

| Term | Meaning |
|------|---------|
| **Campaign** | A container for one initiative — a rollup and workspace, not a special link type |
| **Campaign Studio** | The campaign workspace: primary tabs Overview · Links · Analytics; More holds Partners · Pixel · Spend. Edit details from the header (no Settings tab) |
| **Campaign type** | A label such as Product Launch, Email, Paid Advertising, Influencer, or Affiliate. Types nudge defaults; they do not lock features |
| **Partners** | People or placements that need their own tracking URL (affiliates, creators, media). Older API naming may still say “creators” |
| **Partner link** | The unique short link for a partner. Empty UTM fields inherit campaign defaults |
| **UTM defaults** | Campaign-level UTM values that fill empty keys on member links without overwriting overrides |
| **Planned budget** | A planning ceiling — not automatic spend |
| **Spend entry** | A real cost you logged (media, fee, boost). This feeds CPC and CPA |
| **Archive** | Removes the campaign from the active set and unassigns links so redirects keep working |

## Pixel and conversions

| Term | Meaning |
|------|---------|
| **Conversion / goal event** | A success signal such as purchase, signup, lead, or a custom name |
| **Pixel Studio** | Where you configure the event and copy install snippets for a campaign |
| **Landing capture** | A tiny script that saves \`lunr_sc\` in \`localStorage\` if checkout drops query params |
| **Thank-you pixel** | JavaScript or a 1×1 image that fires on a confirmation page |
| **Postback (S2S)** | Your backend calls lunr after order creation — preferred for ecommerce |
| **\`lunr_sc\`** | Query parameter (and storage key) carrying the short code for attribution |
| **Idempotency key (\`idk\`)** | A unique order or event id so retries do not create duplicate conversions |
| **CPC** | Cost per click = logged spend ÷ clicks |
| **CPA** | Cost per acquisition = logged spend ÷ conversions |
| **Test fire** | Manually record a conversion from Pixel Studio to verify analytics |

## Pages, QR, domains

| Term | Meaning |
|------|---------|
| **Page / bio page** | A public landing surface with your branding and links (\`/p/{slug}\` or custom domain) |
| **Page Studio** | The editor for layouts, themes, blocks, and socials |
| **QR code** | A scannable image usually tied to a short link. Previews are watermarked until saved |
| **Custom domain** | Your hostname serving bio pages (Business+). Branded short links on custom domains are planned separately |

## Plans and API

| Term | Meaning |
|------|---------|
| **Free / Pro / Business / Enterprise** | Usage and feature tiers — see Billing docs |
| **API key** | Enterprise credential for \`/api/v1\` |
| **Webhook** | An HTTPS endpoint lunr calls when events occur (for example link clicks or conversions) |

## Ambiguous words to watch

People say **“tracking”** for three different things in this product:

1. UTM tags on redirects
2. Partner-specific short links
3. Conversion pixels / postbacks

When you are stuck, name which of the three you mean — the fix is different for each.

## Related reading

- [Use cases](/docs/use-cases/product-launch)
- [Pixel Studio](/docs/campaigns/conversion-tracking)
- [Campaign Studio overview](/docs/campaigns/creating-campaigns)`,
    },
  ],
};
