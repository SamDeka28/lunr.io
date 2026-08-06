import type { DocsSection } from "./types";

export const linksSection: DocsSection = {
  id: "links",
  title: "Link Shortening",
  icon: "Link2",
  description: "Create and govern the short URLs everything else hangs on",
  articles: [
    {
      id: "creating-links",
      title: "Creating short links",
      content: `Short links are the atomic unit of lunr.to. Campaigns, QR codes, pixels, and partner leaderboards all assume a stable short code that can outlive a particular landing-page experiment.

## A deliberate create flow

From **Links → Create Link**, paste the destination you actually want measured. Add a **title** humans will recognize in the dashboard six weeks later (“Launch – email header”, not “link 14”).

Then decide which optional layers you need today:

- **Custom back-half (Pro+)** when the URL will be typed, spoken, or printed.
- **Expiration (Pro+)** for time-boxed offers.
- **UTM (Pro+)** when the link represents a channel and you want breakdowns without relying on the destination site’s analytics alone.
- **Password / lead gate (Pro+)** when access or contact capture matters before the destination.
- **Campaign assignment** when this link belongs to an initiative rollup.
- **QR** when offline distribution is part of the story.

Create once, copy the short URL, and put it where traffic already is. Editing later is normal; minting dozens of throwaway codes for the same print job is how attribution dies.

## Custom back-halves

Memorable codes like \`lunr.to/spring-drop\` help brand and reduce typos. Rules are intentionally strict: length limits, alphanumeric plus hyphens, globally unique. If a code is taken, pick another — do not fight uniqueness; collisions would break someone else’s live traffic.

## Bulk creation

When you need many channel or partner seeds at once, use bulk upload from the create flow. Validate the CSV carefully; mass-creating bad destinations is painful to unwind. Details live in [Bulk link management](/docs/links/bulk-operations).

## After create

Confirm the redirect yourself in a private window. If gates are on, walk through them as a stranger would. Only then replace old URLs in email tools, bios, and ads.`,
    },
    {
      id: "link-settings",
      title: "Link settings & options",
      content: `Most links evolve. Destinations change, campaigns end, passwords rotate. lunr.to expects edits — especially destination edits — so printed QR codes and remembered short codes remain valid.

## Expiration

On Pro+, set an end date for promos and ticketed windows. After expiry, the link should stop sending people into a dead experience. Prefer expiration over silently leaving a sold-out landing page live.

## Password and lead gates

These are covered in dedicated articles. Remember the order: inactive/expiry checks, password, lead gate, then tracked redirect.

## UTM parameters

Stored UTMs append on redirect when present. Incoming UTMs on the short URL can override for flexible paid templates. Review UTM breakdowns in link or campaign analytics — if everything collapses into “(none)”, your links were created without UTMs and the destination did not add them either.

## Management hygiene

Use folders and tags when the library grows. Search by title and short code before creating duplicates. Delete links you are sure are unused; archive campaigns rather than deleting historical link rows you may still need for reporting.

## What usually should not change

Avoid changing a short code that is already printed or widely distributed. Change the destination behind it instead.`,
    },
    {
      id: "password-protection",
      title: "Password protection",
      content: `Password protection adds a shared-secret gate in front of a destination. It is ideal for private previews and community drops — not for storing highly sensitive material that needs per-user accounts.

## Enabling

On create or edit, enable **Password protection**, set the password, and save. Visitors land on \`/{shortCode}/password\`. Successful entry continues the chain; failures stay on the gate.

## Combined with lead capture

When both are enabled, password runs first. That supports flows like “buyers already have the code; we still want their email before the asset.”

## Operational tips

- Prefer unique passwords per audience when leakage would be annoying.
- Rotate by editing the link; tell the audience out of band.
- Pair with expiration for automatic shutdown.
- Clear the password field when the gate should disappear entirely.

Deep walkthrough: [Password-gated drops](/docs/use-cases/gated-content).`,
    },
    {
      id: "lead-capture",
      title: "Lead capture & Lead Gate Studio",
      content: `Lead capture turns anonymous clicks into contacts before the destination loads. It is one of the highest-leverage Pro features because the form lives on the short link — the same URL you already planned to share.

## Visitor path

Click → \`/{shortCode}/lead\` form → submit → redirect to destination. Responses appear in link analytics and CSV export.

## Lead Gate Studio

The **Leads** tab opens a studio with four concerns:

**Form** — messaging and primary button. Clarity beats cleverness.

**Fields** — email plus optional extras. Reorder fields to match how people think. Mark only true requirements as required.

**Design** — themes, color, type, logo, card/button styling. Preview mobile explicitly.

**Settings** — master enable. Ship when the preview looks intentional.

## Using the data

Export CSV into your ESP or CRM. For automation-heavy stacks, see API/webhook documentation on Enterprise plans.

## Practice notes

Keep the bargain obvious. If you promise a PDF, deliver the PDF immediately after submit via the destination URL. Slow or mismatched destinations train people to abandon future gates.

Full playbook: [Lead generation use case](/docs/use-cases/lead-generation).`,
    },
    {
      id: "bulk-operations",
      title: "Bulk link management",
      content: `Growing libraries need batch tools. lunr.to supports CSV-oriented creation and list-level organization so you are not clicking through one modal per channel.

## Bulk import

From create link, open **Bulk upload**. Download the template, fill destinations and optional fields, paste or upload, then review validation errors before confirming. Fix rows in the spreadsheet rather than creating half-valid links.

## Selecting and organizing

Use checkboxes for bulk delete when cleaning. Prefer folders and tags for ongoing structure — deletes are permanent for those rows. Filters (date, status, folder, tag) plus search by title/URL/short code keep large accounts navigable.

## Views

List, grid, and card views change density, not data. Pick what matches the task: list for audit, cards for visual scanning of titles.`,
    },
  ],
};

export const qrSection: DocsSection = {
  id: "qr-codes",
  title: "QR Codes",
  icon: "QrCode",
  description: "Offline entry points that stay tied to measurable short links",
  articles: [
    {
      id: "generating-qr",
      title: "Generating QR codes",
      content: `A QR code in lunr.to is not a free-floating image — it is a door onto a short link (or URL) you can measure and update. That distinction is what makes reprints optional when campaigns evolve: keep the code, change the destination behind the short link when the offer changes.

## Create with a title that survives print day

In **QR Codes → Generate**, name the code after the physical placement (“Lobby A poster”, “Line sheet insert”, “Day-2 badge”). Future you will not remember which unlabeled PNG went on the tote bag.

Select an existing short link whenever possible so scans and clicks share one analytics story. Customize colors and logo on premium plans, but prioritize scan reliability over decoration — exhibition lighting and phone cameras are harsher than your laptop screen.

You can also generate a QR while creating or editing a link when offline distribution is part of the same workflow.

## Watermarked preview vs clean download

Unsaved previews are watermarked so draft artwork is not accidentally printed or posted. After save, download the clean PNG from the success state, list, analytics, or edit view (when the form is clean). If you change branding later, re-download before the next print run — printers will not forgive an old file.

## Practices that prevent expensive mistakes

High contrast, adequate quiet zone, physical size matched to scan distance, and a real-device test on the proof. Generate unique codes (unique underlying links) for unique placements if you need placement-level reporting; one shared code cannot tell booth A from booth B.

Playbook: [QR for print & events](/docs/use-cases/qr-offline).`,
    },
    {
      id: "qr-analytics",
      title: "QR code analytics",
      content: `QR analytics answer whether offline materials earned attention — not whether the design looked good in Figma.

Open a QR’s analytics view for scan-oriented metrics driven by the underlying short link. Expect totals, uniqueness approximations, devices, and time patterns. Ask whether scans clustered around event hours, whether mobile dominated (it should), and whether a placement underperformed enough to redesign before the next print.

Rich geographic heatmaps may still be rolling out; confirm on your account before promising city-level maps in a client deck.

For initiative reporting, assign QR links to a campaign and read them beside email and paid on Campaign Analytics. Comparing one lonely QR in isolation rarely tells the whole story of an event or packaging test.`,
    },
  ],
};

export const pagesSection: DocsSection = {
  id: "pages",
  title: "Custom Pages",
  icon: "FileText",
  description: "Owned bio and landing surfaces with first-party control",
  articles: [
    {
      id: "creating-pages",
      title: "Creating landing pages",
      content: `Social platforms ration how many links you get in a profile. A lunr **page** is the owned surface behind that one bio URL — branded, editable, and measurable — without forcing every click through a generic third-party tree.

## What a page is (and is not)

A page is a public composition: identity, story, and a stack of actions. It is not a full website builder and not a replacement for your primary marketing site. It shines as a bio hub, event pocket guide, or lightweight campaign landing that you can reshape weekly.

## Creating with a job in mind

Open **Pages → Create** and enter Page Studio. Decide the job before the palette:

- Creator bio that always points at “what matters this month”
- Event hub for a conference week
- Single-offer landing that still deserves brand control

Set title, description, and a stable slug. Add the links visitors should actually take. Publish to \`/p/{slug}\` when mobile layout feels finished — bio traffic is overwhelmingly on phones, and a desktop-only composition will fail quietly.

On Business+, attach a verified custom domain so the public URL matches your brand instead of a path on lunr’s domain.

## Pairing pages with short links

Page buttons can point at raw URLs, but important CTAs deserve **short links**. That unlocks UTM, lead gates, password gates, and campaign rollups on the actions that matter, while the page itself remains the friendly front door.

Full narrative: [Creator bio use case](/docs/use-cases/creator-bio).`,
    },
    {
      id: "page-customization",
      title: "Page customization",
      content: `Customization should make the page recognizable in three seconds — then get out of the way of the click.

## Structure before ornament

Pick a layout template as scaffolding. Place identity (name, avatar, short line) and primary CTAs in the first viewport. Secondary links, archives, and “nice to have” destinations can live lower. If everything screams for attention, nothing converts.

## Design controls that matter

Tune background, typography, accent color, button style, banner, and social icons until the page feels like the same brand as your content. Resist stacking every promotional badge in the hero; campaigns can temporarily elevate links without permanent clutter.

## Operating the page over time

During a launch week, move campaign short links to the top. When the launch ends, restore the evergreen stack. The page is a living surface — treat reordering as normal operations, not a redesign project every time.`,
    },
    {
      id: "page-analytics",
      title: "Page analytics",
      content: `Page analytics answer whether the bio or landing surface is earning attention and distributing it into clicks.

Expect views, clicks on page links, and available referrer/device context. Use that to spot dead buttons and weak above-the-fold structure.

For harder questions — which channel filled the bio, which offer won, what CPA looked like — follow the short links behind the buttons into link or Campaign Analytics. The page measures the doorway; short links measure the destinations.`,
    },
  ],
};

export const analyticsSection: DocsSection = {
  id: "analytics",
  title: "Analytics",
  icon: "BarChart3",
  description: "How lunr.to turns clicks and goals into decisions",
  articles: [
    {
      id: "understanding-analytics",
      title: "Understanding analytics",
      content: `Analytics in lunr.to exist to help you choose the next action: kill a channel, scale a partner, fix a broken pixel, or reprint a QR. If a chart does not change a decision, it is decoration.

## What is measured

Short-link **clicks** (with bot handling where applicable), approximate **uniques**, **referrers**, **devices**, **UTM** breakdowns, **lead** submissions, **conversions** from Pixel Studio or API, and **QR** activity via underlying links.

Some geographic and OS detail may still be expanding. Treat “coming soon” areas honestly in client reporting.

## Where to look for which question

- “How is the account doing overall?” → Dashboard **Analytics**
- “What happened on this URL?” → Link analytics (including leads)
- “Did the poster work?” → QR analytics
- “Did the bio convert attention?” → Page analytics
- “How did the spring launch do, including CPA?” → **Campaign Studio → Analytics**

## Exports

Lead CSV from link analytics, campaign CSV from Campaign Analytics, and Enterprise API pulls cover most reporting needs. If you expected a button that is not there yet, check these three before assuming export is missing entirely.

## Pairing with money metrics

Clicks become economics only after **spend** and **conversions** exist on a campaign. See [Spend, CPC & CPA](/docs/campaigns/spend-and-metrics).`,
    },
    {
      id: "analytics-dashboard",
      title: "Analytics dashboard",
      content: `The global analytics dashboard is a wide lens. Use it to spot anomalies (sudden drop across all links, device mix shifts) and to find top performers worth opening.

For initiative postmortems, switch to Campaign Analytics with an explicit date range. Global view without campaign boundaries mixes evergreen traffic into launch narratives and confuses stakeholders.

Charts typically include trends over time, top referrers, device mix, and UTM breakdowns when tags exist. If UTM widgets look empty, fix link defaults — the dashboard cannot invent tags you never set.`,
    },
  ],
};
