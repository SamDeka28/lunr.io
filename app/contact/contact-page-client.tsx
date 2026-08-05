"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils/cn";

function ContactForm() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");

  const defaultSubject = useMemo(() => {
    if (intent === "careers") return "Careers inquiry";
    if (intent === "compliance") return "Compliance inquiry";
    return "";
  }, [intent]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body = [
      name && `Name: ${name}`,
      email && `Email: ${email}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:hello@lunr.to?subject=${encodeURIComponent(
      subject || "lunr.to inquiry"
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    toast.success("Opening your email client…");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-neutral-muted mb-2">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-xl border border-neutral-border/80 bg-white text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-muted mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-xl border border-neutral-border/80 bg-white text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-muted mb-2">
          Subject
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full h-12 px-4 rounded-xl border border-neutral-border/80 bg-white text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-neutral-muted mb-2">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-neutral-border/80 bg-white text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
        />
      </div>
      <button
        type="submit"
        className={cn(
          "w-full h-12 rounded-full bg-primary text-white text-sm font-semibold shadow-button",
          "hover:bg-bright-indigo transition-all active:scale-[0.98]"
        )}
      >
        Continue in email
      </button>
      <p className="text-xs text-neutral-muted text-center">
        Or email{" "}
        <a
          href="mailto:hello@lunr.to"
          className="text-primary font-semibold hover:text-bright-indigo"
        >
          hello@lunr.to
        </a>{" "}
        directly.
      </p>
    </form>
  );
}

export function ContactPageClient() {
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(120% 80% at 10% 0%, rgba(67,97,238,0.08), transparent 45%), radial-gradient(90% 60% at 100% 100%, rgba(67,97,238,0.05), transparent 40%), #F3F5FA",
      }}
    >
      <header className="border-b border-neutral-border/70 bg-white/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <BrandLogo variant="full" size="sm" />
          <Link
            href="/"
            className="text-sm font-medium text-neutral-muted hover:text-primary transition-colors"
          >
            Home
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-text tracking-tight mb-3">
          Contact
        </h1>
        <p className="text-neutral-muted mb-8">
          Product questions, partnerships, careers, or privacy requests — send us
          a note.
        </p>
        <div className="bg-white/90 backdrop-blur-xl rounded-card border border-neutral-border/80 shadow-soft p-5 sm:p-8">
          <Suspense
            fallback={
              <div className="text-sm text-neutral-muted py-8 text-center">
                Loading…
              </div>
            }
          >
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
