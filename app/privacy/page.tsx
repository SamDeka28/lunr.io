import type { Metadata } from "next";
import Link from "next/link";
import { MarketingDocShell } from "@/components/marketing-doc-shell";

export const metadata: Metadata = {
  title: "Privacy Policy · lunr.to",
  description: "How lunr.to collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <MarketingDocShell
      title="Privacy Policy"
      description="Last updated August 5, 2026. This policy explains what we collect and how we use it."
    >
      <h2>Who we are</h2>
      <p>
        lunr.to (“we”, “us”) provides link shortening, QR codes, campaigns, pages,
        and related analytics. Questions:{" "}
        <Link href="/contact">contact us</Link>.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Account details such as email address and authentication data</li>
        <li>Product content you create (links, pages, QR codes, campaigns)</li>
        <li>
          Usage and analytics data for redirects and pages (for example referrer,
          device/browser signals, approximate location when available)
        </li>
        <li>Billing and subscription metadata when payments are enabled</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To operate and improve the service</li>
        <li>To provide analytics and account features you request</li>
        <li>To communicate about security, product, or account changes</li>
        <li>To enforce plan limits and prevent abuse</li>
      </ul>

      <h2 id="compliance">Data protection &amp; compliance</h2>
      <p>
        We use industry-standard practices including encrypted transport (HTTPS),
        authenticated access controls, and database row-level security where
        applicable. We do not sell personal data. We retain analytics and account
        data for as long as your account is active and as needed for security,
        legal, and operational purposes.
      </p>

      <h2>Sharing</h2>
      <p>
        We may use infrastructure providers (hosting, database, email, payments)
        that process data on our behalf under contractual obligations. We may
        disclose information if required by law or to protect the service and
        users.
      </p>

      <h2>Your choices</h2>
      <p>
        You can update account information in settings, delete content you own,
        and request account deletion via <Link href="/contact">contact</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy requests: <Link href="/contact">/contact</Link>
      </p>
    </MarketingDocShell>
  );
}
