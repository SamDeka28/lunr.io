import type { Metadata } from "next";
import Link from "next/link";
import { MarketingDocShell } from "@/components/marketing-doc-shell";

export const metadata: Metadata = {
  title: "Terms of Service · lunr.to",
  description: "Terms that govern your use of lunr.to.",
};

export default function TermsPage() {
  return (
    <MarketingDocShell
      title="Terms of Service"
      description="Last updated August 5, 2026. By using lunr.to you agree to these terms."
    >
      <h2>Agreement</h2>
      <p>
        These Terms of Service (“Terms”) govern access to and use of lunr.to
        websites, dashboards, APIs, and related services (the “Service”). If you
        do not agree, do not use the Service.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must provide accurate account information and keep it current</li>
        <li>You are responsible for activity under your account</li>
        <li>You must be old enough to form a binding contract in your region</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Distribute malware, phishing, spam, or illegal content</li>
        <li>Infringe intellectual property or privacy rights</li>
        <li>Attempt to bypass security, rate limits, or plan restrictions</li>
        <li>Abuse redirects, APIs, or analytics in ways that harm others</li>
      </ul>
      <p>
        We may suspend or terminate accounts that violate these Terms or create
        risk for the Service or its users.
      </p>

      <h2>Your content</h2>
      <p>
        You retain ownership of content you submit. You grant us a limited
        license to host, process, and display that content solely to operate the
        Service. You represent that you have the rights needed to use the
        destinations and materials you attach to links, QR codes, and pages.
      </p>

      <h2>Plans and limits</h2>
      <p>
        Features and quotas may vary by plan. Limits may be enforced by the
        product. Pricing details are described on the{" "}
        <Link href="/pricing">pricing</Link> page.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The Service is provided “as is” without warranties of any kind to the
        fullest extent permitted by law. We do not guarantee uninterrupted
        availability or that shortened links will always resolve as expected when
        third-party networks or destinations fail.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, lunr.to is not liable for
        indirect, incidental, special, consequential, or punitive damages, or
        for loss of profits, data, or goodwill arising from your use of the
        Service.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms. Continued use after changes become effective
        constitutes acceptance. Material changes may be communicated via the
        Service or email when appropriate.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms: <Link href="/contact">/contact</Link>
      </p>
    </MarketingDocShell>
  );
}
