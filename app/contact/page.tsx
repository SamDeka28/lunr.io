import type { Metadata } from "next";
import { ContactPageClient } from "./contact-page-client";

export const metadata: Metadata = {
  title: "Contact · lunr.to",
  description: "Get in touch with the lunr.to team.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
