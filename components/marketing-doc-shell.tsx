import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function MarketingDocShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(120% 80% at 10% 0%, rgba(67,97,238,0.08), transparent 45%), radial-gradient(90% 60% at 100% 100%, rgba(67,97,238,0.05), transparent 40%), #F3F5FA",
      }}
    >
      <header className="border-b border-neutral-border/70 bg-white/85 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <BrandLogo variant="full" size="sm" />
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/docs"
              className="text-neutral-muted hover:text-primary font-medium transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-white font-semibold shadow-button hover:bg-bright-indigo transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-text tracking-tight mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-neutral-muted text-base sm:text-lg mb-10">{description}</p>
        )}
        <div className="space-y-6 text-neutral-text leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-primary [&_a]:font-medium hover:[&_a]:text-bright-indigo">
          {children}
        </div>
      </article>

      <footer className="border-t border-neutral-border/70 py-8 text-center text-sm text-neutral-muted">
        <p>
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          {" · "}
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          {" · "}
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          {" · "}
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </p>
      </footer>
    </main>
  );
}
