import type { DocsSection } from "./types";

export const useCasesSection: DocsSection = {
  id: "use-cases",
  title: "Use Cases",
  icon: "Lightbulb",
  description: "End-to-end playbooks written for real jobs, not feature tours",
  articles: [
    {
      id: "product-launch",
      title: "Product launch or seasonal promo",
      content: `A launch fails in analytics long before it fails in creative. The usual pattern: email uses one raw URL, ads use another, social uses a third, someone pastes UTMs by hand, and two weeks later nobody can reconcile “what worked” without a forensic spreadsheet.

This playbook uses **Campaign Studio** as the single initiative bucket so every channel still has its own short link, but reporting rolls up in one place.

## When this is the right playbook

Use it when you have a start and end (or at least a clear “this push”), more than one channel, and you care about combined performance — not only vanity clicks on one tweet.

Skip a campaign if you are only shortening one evergreen URL with no budget or conversion goal. A plain short link is enough.

## What “good” looks like

By the end of setup you should be able to answer:

- How many clicks did the whole launch get?
- Which channel link contributed most?
- How many purchases or signups attributed back?
- What did we pay per click / per acquisition after logging real spend?

## Step-by-step

### 1. Create the campaign as a container

Go to **Campaigns → New campaign**. Name it the way finance and creative already talk about it (“Spring drop”, “SKU-224 launch”), not a generic “Campaign 3”.

Choose type **Product Launch** or **Seasonal Promo**. Set dates if you have them — they power inactive messaging when a link is tied to a windowed campaign. Add a **planned budget** as a ceiling for planning; do not confuse it with Spend.

Set a **default destination** if most links share a landing page. Add UTM defaults such as a shared \`utm_campaign\` value. Medium and source can stay empty at campaign level if each channel link will set them differently.

### 2. Create one short link per channel

Inside the campaign **Links** tab (or create links globally and assign them), make distinct short codes for email, Instagram, paid search, and so on. Distinct codes make leaderboards readable even when UTM is incomplete.

If a channel needs a lead form or password, configure those on the individual link — campaigns do not replace link-level gates.

### 3. Wire conversions before traffic spikes

Open the **Pixel** tab (Pixel Studio). Pick the goal that matches success for this launch (\`purchase\`, \`signup\`, or a custom event). Install:

- **Landing capture** on the first marketing page if checkout will strip query parameters.
- **Thank-you JS / image pixel**, or better, a **server postback** from your order or signup backend with an idempotency key.

Use **Test fire** once and confirm the conversion appears under **Analytics** before you spend serious media money.

### 4. Run the launch, then log spend as reality arrives

While the campaign is live, clicks accumulate automatically. When invoices or platform bills are known, add them under **Spend**. Partner fees can appear when you mark partners paid in other playbooks; for a pure launch, media and tools costs are enough.

### 5. Read Analytics like an operator

On **Analytics**, set the date range to the flight. Watch conversion rate, CPC, and CPA together — a cheap CPC with no conversions is not a win. Export CSV if you need to paste into a launch retrospective.

Compare against a previous launch from the campaigns list when you want side-by-side KPIs instead of memory.

## Common mistakes

- Putting every historical link into one eternal campaign — rollups become meaningless.
- Logging planned budget as if it were spend — CPA will lie.
- Installing the pixel only on staging — test fire works, production stays empty.
- Reusing one short link for every channel — you cannot tell email from paid later.

## Related reading

[Campaign Studio overview](/docs/campaigns/creating-campaigns) · [Pixel Studio](/docs/campaigns/conversion-tracking) · [Spend, CPC & CPA](/docs/campaigns/spend-and-metrics)`,
    },
    {
      id: "affiliate-partners",
      title: "Affiliates, creators & partners",
      content: `Partner programs die from ambiguous attribution. If two creators share one link, or UTMs are optional “when they remember,” payouts turn political. lunr.to’s **Partners** tab exists to give each person (or placement) a unique short link with sensible UTM defaults, then rank them on clicks and conversions.

## When to use Partners vs plain links

Use **Partners** when a human or placement needs identity in reporting: influencers, affiliates, podcast hosts, affiliate sites, sponsored newsletters.

Use ordinary campaign **Links** for your own channels (house email, brand ads). Mixing both in one campaign is normal and recommended.

## End-to-end setup

### 1. Create an initiative-shaped campaign

Type **Affiliate / Partner** or **Influencer / Creator** helps empty states speak the right language, but Partners works on any type. Set:

- Default destination (the page every partner should open unless overridden)
- Currency (fees and spend display)
- Planned budget if you have a partner pool ceiling
- UTM defaults — medium often \`affiliate\` or \`social\`

### 2. Add partners carefully

Open **Partners**. For each person, capture display name, handle, platform, optional fee, and optional destination override.

For larger rosters, download the CSV template and import:

\`\`\`
display_name,handle,platform,fee_amount,destination_url
\`\`\`

Allowed platforms include instagram, tiktok, youtube, twitter, linkedin, and other. Generate the tracking link as you add them — each partner receives a unique short URL.

UTM behavior: campaign defaults fill empty keys; platform tends to inform \`utm_source\` and handle \`utm_content\` when those keys are free. That keeps analytics readable without forcing partners to understand UTM theory.

### 3. Operationalize status

Statuses (invited → accepted → content submitted → posted → paid) are a lightweight CRM for the relationship. They do not replace contracts, but they stop the “did we pay them?” thread. Marking **paid** can log the fee into Spend so CPA includes creator cost — which is usually what leadership actually wants.

### 4. Close the conversion loop

Clicks alone underpay or overpay partners. Install **Pixel Studio** on the commercial path (see the ecommerce use case). Prefer server postbacks with \`idk=order_id\` and pass \`sc\` from \`lunr_sc\` so the conversion attaches to the partner’s short code.

### 5. Report from the leaderboard

Campaign **Analytics** shows partner leaderboard, platform mix, and exports. Use that for weekly ranking and payout discussions. If two partners look tied on clicks but diverge on conversions, trust conversions when Pixel is correctly installed.

## What partners should receive

Send them only their short link (and creative briefs). Do not ask them to append UTMs manually if lunr already encodes attribution — every manual step is a place the data breaks.

## Related reading

[Partners setup](/docs/campaigns/influencer-setup) · [Ecommerce conversions](/docs/use-cases/ecommerce-conversions)`,
    },
    {
      id: "lead-generation",
      title: "Lead generation with Lead Gate",
      content: `Sometimes the destination is not the prize — the email is. Webinar registrations, gated PDFs, early-access lists, and “unlock the template” flows all want a form before the goods. **Lead Gate Studio** puts that form on the short link itself so you do not need a separate form host just to collect a name and email.

## Visitor experience

Someone opens \`lunr.to/your-code\`. Instead of jumping straight to Notion or Gumroad, they see your branded gate at \`/{shortCode}/lead\`. They submit; lunr stores the lead; then they continue to the destination. The short link remains the only URL you print or paste.

## Designing the gate well

Open the link’s **Leads** tab to enter Lead Gate Studio.

**Form** — Write a heading that states the exchange honestly (“Get the teardown PDF”) rather than vague marketing fluff. The button label should match the promise (“Send me the PDF”).

**Fields** — Start with email. Add phone, company, or dropdowns only if you will use them this week. Every extra required field costs completion rate.

**Design** — Themes, colors, typography, and logo should feel like the destination brand, not a generic interstitial. Use the desktop/mobile preview; most traffic will be on phones.

**Settings** — Enable only when you are ready. A half-styled gate on a live popular link trains people to bounce.

## After leads arrive

Open the link **Analytics → Leads**. Browse submissions and download CSV for your ESP or CRM. Enterprise teams can also automate onward with webhooks and API patterns described in the API docs.

## Combining with password and campaigns

Gate order is fixed: password (if any) runs before the lead form. That lets you run a private drop that still captures who unlocked it.

Assign the same link to a campaign if the lead gen push is part of a larger initiative. Optionally fire a \`lead\` conversion in Pixel Studio when a downstream system confirms the contact — useful when the gate is only step one.

## Mistakes that quietly kill conversion rate

- Requiring five fields for a one-page PDF
- No explanation of what happens after submit
- Enabling the gate on a high-traffic link without mobile QA
- Forgetting CSV export exists and copy-pasting from the UI one row at a time

## Related reading

[Lead Gate Studio reference](/docs/links/lead-capture) · [Password-gated drops](/docs/use-cases/gated-content)`,
    },
    {
      id: "ecommerce-conversions",
      title: "Ecommerce purchase tracking",
      content: `Clicks without purchases are a vanity metric. For stores and paid funnels, lunr.to’s job is to carry a short-code identity from the first click through checkout, then accept a **purchase** event when money moves.

We deliberately do not sync Meta or Google spend APIs. You keep ads platforms for buying traffic; lunr keeps attribution and CPA math once you log spend and conversions.

## The attribution chain (read this twice)

1. Shopper clicks a lunr short link (ad, creator, email).
2. lunr redirects to your store and appends \`lunr_sc=<shortCode>\` when possible.
3. Your landing page runs the **landing capture** snippet so \`lunr_sc\` is saved if the cart URL drops query params.
4. After payment, your thank-you page or — preferably — your **order backend** notifies lunr with that short code, a value, and a unique order id.
5. Campaign Analytics shows the conversion on the right link and partner.

If step 3 or 4 is missing, you will under-report and partners will look weaker than they are.

## Recommended install: server postback

Browser pixels are easy and fragile (ad blockers, users closing the tab, client-side bugs). A postback from your server after order creation is the durable pattern.

In **Pixel Studio**, copy the server postback URL pattern. From your backend, call it with:

- Event \`purchase\` (or your chosen name)
- \`v\` = order total
- \`cur\` = currency
- \`idk\` or order id = unique per order
- \`sc\` = the \`lunr_sc\` you stored on the session or order metadata

Idempotency matters: payment webhooks often retry. The same \`idk\` should not create five conversions.

## Acceptable install: thank-you pixel

If you cannot touch the backend yet, install thank-you JS or the image pixel on the confirmation page and still use landing capture upstream. Treat this as transitional — move to postback when you can.

## Validating before paid traffic

1. Test fire from Pixel Studio — proves lunr recording works.
2. Place a real low-value test order through a short link — proves your site passes \`lunr_sc\`.
3. Confirm the conversion lands on the expected campaign link / partner.
4. Only then scale spend.

## Reading CPA honestly

CPA needs conversions and **logged spend**. If finance has not entered media or partner fees yet, CPA will look miraculously cheap. Log spend on the campaign Spend tab as numbers become real.

## Related reading

[Pixel Studio](/docs/campaigns/conversion-tracking) · [Spend, CPC & CPA](/docs/campaigns/spend-and-metrics)`,
    },
    {
      id: "qr-offline",
      title: "QR for print, packaging & events",
      content: `Print is unforgiving. Once a code is on a thousand sleeves, you cannot “edit the Instagram bio.” lunr.to’s QR flow is built around a stable short link underneath the image so you can change destinations later without reprinting — as long as you keep the same short code.

## Design the link before the pixels

Create the short link first. Give it a clear title (“Lobby A poster”, “Insert – blue SKU”). If this QR belongs to an event or launch, assign it to a campaign so offline scans sit beside email and paid in one Analytics view.

Optional: attach UTM so reporting shows medium as QR-related when your generation path sets that convention.

## Generate and download responsibly

In **QR Codes**, generate against that link. Premium plans can set colors and a center logo — keep contrast high; fancy low-contrast codes fail under exhibition lighting.

Until the QR is saved, the dashboard preview is **watermarked**. That is intentional so unfinished designs are not screenshotted into print files. Download the clean PNG only after save, and again after any logo/color change you intend to print.

## Physical QA checklist

- Scan with more than one phone OS before approving a print proof.
- Size for distance: a code across a room needs to be larger than a code on a handout.
- Do not bury the code under folds, varnish glare, or busy photography.
- If multiple placements exist, use multiple short links — otherwise Analytics cannot tell booth A from booth B.

## After the event

Open QR or link analytics for time series and device mix. Geographic detail may still be limited depending on rollout — do not promise city heatmaps in a client deck unless you have verified the data.

## Related reading

[Generating QR codes](/docs/qr-codes/generating-qr) · [Product launch playbook](/docs/use-cases/product-launch)`,
    },
    {
      id: "creator-bio",
      title: "Creator bio & link-in-bio",
      content: `A bio link is often the only owned real estate on platforms that throttle links. Generic link trees work until you want brand control, first-party analytics, or gates on individual CTAs. **Page Studio** gives you a page that looks like you; short links behind the buttons keep measurement serious.

## Build the page as a composition

In **Pages → Create**, treat the first viewport like a poster: identity, one line of context, primary actions. Avoid stuffing every podcast episode into the hero. Secondary links can live lower on the page.

Add social icons, banner, and theme in design controls. Publish when it is coherent on mobile — that is where almost all bio traffic comes from.

Share \`/p/your-slug\`. On Business+, attach a verified custom domain so the URL matches your brand.

## Make buttons measurable

Point important buttons at **lunr short links**, not raw destinations. Then you can add UTM, assign a campaign for a launch week, or put a lead gate on the “newsletter” button without redesigning the whole page.

Evergreen bio links can stay outside campaigns. When you run a drop, create a campaign and temporarily feature campaign links at the top of the page.

## Optional upgrades

- Lead gate on the mailing list CTA
- Password gate on a patrons-only resource
- QR that opens the bio page for IRL audiences

## Related reading

[Creating pages](/docs/pages/creating-pages) · [Lead generation](/docs/use-cases/lead-generation)`,
    },
    {
      id: "gated-content",
      title: "Password-gated drops & private links",
      content: `Not every link should be public. Client previews, unreleased decks, and community drops often need a soft lock — strong enough to stop casual forwarding, light enough that you are not building full user accounts.

## How the password gate behaves

Enable **Password protection** on the link (Pro+). Visitors hit \`/{shortCode}/password\`, enter the shared secret, and continue. Wrong passwords are rejected; successful unlocks proceed to the next step in the chain.

If lead capture is also enabled, password runs **first**, then the lead form, then redirect. That order lets you require both “knows the password” and “leaves an email.”

## Operating a drop

1. Create the short link to the private asset.
2. Set a password you can rotate; share password out-of-band (Stories close friends, email to buyers, Slack to the client).
3. Optional: expiration date so the link dies after the window.
4. Optional: lead gate to learn who redeemed access.
5. When the drop ends, clear the password or let expiration take over.

## What it is not

A password gate is not enterprise DRM. Determined users can still share the destination URL after unlock. Use it for friction and etiquette, and keep truly sensitive assets behind real auth when needed.

## Related reading

[Password protection](/docs/links/password-protection) · [Lead Gate](/docs/links/lead-capture)`,
    },
  ],
};
