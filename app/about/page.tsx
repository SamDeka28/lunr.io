import type { Metadata } from "next";
import Link from "next/link";
import { MarketingDocShell } from "@/components/marketing-doc-shell";

export const metadata: Metadata = {
  title: "About · lunr.to",
  description: "What lunr.to is and who it’s for.",
};

export default function AboutPage() {
  return (
    <MarketingDocShell
      title="About lunr.to"
      description="Link infrastructure for modern campaigns — shortening, QR, pages, analytics, and APIs."
    >
      <h2>What we build</h2>
      <p>
        lunr.to helps teams create and manage short links, QR codes, campaign
        groupings, and link-in-bio pages with analytics that show how people
        engage. Developers can automate workflows through our API and webhooks.
      </p>

      <h2>Who it’s for</h2>
      <ul>
        <li>Marketers running multi-channel campaigns</li>
        <li>Creators and brands shipping bio pages and QR experiences</li>
        <li>Teams that need consistent UTM and link operations</li>
        <li>Builders integrating links into products via API</li>
      </ul>

      <h2>Learn more</h2>
      <ul>
        <li>
          <Link href="/#features">Product features</Link>
        </li>
        <li>
          <Link href="/pricing">Pricing</Link>
        </li>
        <li>
          <Link href="/docs">Documentation</Link>
        </li>
        <li>
          <Link href="/api-reference">API reference</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </MarketingDocShell>
  );
}
