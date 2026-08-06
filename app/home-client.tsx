"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  QrCode,
  FileText,
  BarChart3,
  Monitor,
  Globe,
  Zap,
  Shield,
  Check,
  ArrowRight,
  Star,
  Users,
  Building2,
  Crown,
  Clock,
  Lock,
  Palette,
  Layout,
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  Database,
  Mail,
  HelpCircle,
  Copy,
  ExternalLink,
  MapPin,
  Smartphone,
  Globe2,
  Calendar,
  Eye,
  MousePointerClick,
  BarChart,
  PieChart,
  LineChart,
  Info,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SectionLabel } from "@/components/ui/section-label";

export default function HomePageClient() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const navLinkClass = (scrolled: boolean) =>
    cn(
      "text-sm font-medium transition-colors",
      scrolled
        ? "text-neutral-muted hover:text-primary"
        : "text-white/90 hover:text-white"
    );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    }).format(price);
  };


  // TODO: Add real stats when available
  // const stats = [
  //   { value: "50K+", label: "Active Users" },
  //   { value: "10M+", label: "Links Created" },
  //   { value: "99.9%", label: "Uptime" },
  //   { value: "150+", label: "Countries" },
  // ];

  // TODO: Add real testimonials when available
  // const testimonials = [
  //   {
  //     name: "Sarah Chen",
  //     role: "Marketing Director",
  //     company: "TechStart Inc.",
  //     image: "SC",
  //     rating: 5,
  //     text: "lunr.to has transformed how we manage our marketing campaigns. The analytics are incredibly detailed and the custom domains feature is a game-changer.",
  //   },
  //   {
  //     name: "Michael Rodriguez",
  //     role: "Content Creator",
  //     company: "Independent",
  //     image: "MR",
  //     rating: 5,
  //     text: "As a creator, I love how easy it is to create beautiful landing pages. The customization options are endless and my audience loves the professional look.",
  //   },
  //   {
  //     name: "Emily Johnson",
  //     role: "CEO",
  //     company: "GrowthCo",
  //     image: "EJ",
  //     rating: 5,
  //     text: "The enterprise features are exactly what we needed. API access, team collaboration, and unlimited resources - everything scales with our business.",
  //   },
  // ];

  const howItWorks = [
    {
      step: "01",
      title: "Sign Up & Create Links",
      description: "Create your free account and start shortening links instantly. Paste any long URL and get a short, shareable link in seconds.",
      icon: Link2,
    },
    {
      step: "02",
      title: "Enhance Your Links",
      description: "Generate QR codes for offline sharing, design lead gates before redirect, create landing pages, organize campaigns, and customize with your branding.",
      icon: QrCode,
    },
    {
      step: "03",
      title: "Analyze & Optimize",
      description: "Track clicks in real-time, view referrers and campaign performance, export leads, and measure what matters. Geographic breakdowns are coming soon.",
      icon: BarChart3,
    },
  ];

  const faqs = [
    {
      question: "How does link shortening work?",
      answer: "When you create a short link, we store your original URL in our secure database and generate a unique short code. When someone clicks your short link, they're instantly redirected to your original URL while we track the click data for analytics.",
    },
    {
      question: "What is lead capture?",
      answer: "Lead capture (Lead Gate) lets you collect emails and custom form fields before someone reaches your destination URL. Design the gate in Lead Gate Studio with themes, fields, and branding, then export responses from link analytics. Available on Pro and higher.",
    },
    {
      question: "Can I password-protect a link?",
      answer: "Yes. On Pro and higher you can require a password before redirect. Password gates run before lead capture when both are enabled.",
    },
    {
      question: "Can I use my own domain?",
      answer: "Yes! Our Business and Enterprise plans include custom domain support for bio pages. You can connect your own domain, verify ownership via DNS, and serve pages on your brand. Branded short links on custom domains (yourdomain.com/yourlink) are coming soon.",
    },
    {
      question: "What analytics do you provide?",
      answer: "We provide analytics including total clicks, unique visitors, device types, referrers, browser information, time-series data, and lead responses when lead capture is enabled. You can also track UTM parameters for campaign attribution. Geographic data is coming soon.",
    },
    {
      question: "Are there any limits on the free plan?",
      answer: "The free plan includes 2 short links and 2 QR codes, which is perfect for getting started. You get basic analytics, real-time tracking, and can create custom back-halves. Upgrade to Pro or higher for more links, password protection, lead capture, and advanced features.",
    },
    {
      question: "How secure is my data?",
      answer: "We use enterprise-grade security with Row Level Security (RLS), encrypted data storage, and secure authentication. Your links and analytics data are private and only accessible by you. We never share your data with third parties.",
    },
    {
      question: "Can I export my analytics data?",
      answer: "Yes. You can export link analytics and lead captures as CSV from the dashboard. Enterprise plans also include API access for programmatic data retrieval and integration with your existing tools.",
    },
    {
      question: "Do you offer API access?",
      answer: "API access is available on our Enterprise plan. It allows you to programmatically create links, manage campaigns, retrieve analytics, and integrate lunr.to with your existing systems and workflows.",
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer: "If you approach your plan limits, we'll notify you via email. You can upgrade your plan at any time to get more resources. Enterprise plans offer unlimited links, QR codes, and pages.",
    },
  ];

  // TODO: Add integrations section when API/integrations are available
  // const integrations = [
  //   { name: "Slack", icon: MessageSquare },
  //   { name: "Zapier", icon: Zap },
  //   { name: "API", icon: Code },
  //   { name: "Webhooks", icon: Server },
  // ];

  return (
    <main className="min-h-screen bg-neutral-bg">
      {/* Navigation - Transparent initially, white when scrolled */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || mobileNavOpen
            ? "bg-white/85 backdrop-blur-xl border-b border-neutral-border/70 shadow-soft" 
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link href="/" className="flex items-center group min-w-0 shrink">
              {isScrolled || mobileNavOpen ? (
                <BrandLogo href={null} variant="full" size="sm" priority className="sm:hidden group-hover:opacity-90 transition-opacity" />
              ) : (
                <BrandLogo href={null} variant="full" size="sm" onDark priority className="sm:hidden group-hover:opacity-90 transition-opacity" />
              )}
              {isScrolled || mobileNavOpen ? (
                <BrandLogo href={null} variant="full" size="md" priority className="hidden sm:block group-hover:opacity-90 transition-opacity" />
              ) : (
                <BrandLogo href={null} variant="full" size="md" onDark priority className="hidden sm:block group-hover:opacity-90 transition-opacity" />
              )}
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link href="/docs" className={cn(navLinkClass(isScrolled), "relative group")}>
                Documentation
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                  isScrolled ? "bg-primary" : "bg-white"
                )} />
              </Link>
              <Link href="/api-reference" className={cn(navLinkClass(isScrolled), "relative group")}>
                API Reference
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                  isScrolled ? "bg-primary" : "bg-white"
                )} />
              </Link>
              <Link href="/login" className={cn(navLinkClass(isScrolled), "relative group")}>
                Sign In
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
                  isScrolled ? "bg-primary" : "bg-white"
                )} />
              </Link>
              <Link
                href="/login"
                className={cn(
                  "px-5 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-[0.98] shadow-button hover:shadow-hover",
                  isScrolled
                    ? "text-white bg-primary hover:bg-bright-indigo"
                    : "text-primary bg-white hover:bg-white/90"
                )}
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className={cn(
                "md:hidden p-2 rounded-xl transition-colors",
                isScrolled || mobileNavOpen
                  ? "text-neutral-text hover:bg-neutral-bg"
                  : "text-white hover:bg-white/10"
              )}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-neutral-border bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                href="/docs"
                onClick={() => setMobileNavOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-text hover:bg-neutral-bg hover:text-primary"
              >
                Documentation
              </Link>
              <Link
                href="/api-reference"
                onClick={() => setMobileNavOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-text hover:bg-neutral-bg hover:text-primary"
              >
                API Reference
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileNavOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-text hover:bg-neutral-bg hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileNavOpen(false)}
                className="mt-2 px-4 py-3 rounded-full text-center font-semibold text-sm text-white bg-primary shadow-button"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Two Column with Playful Elements */}
      <section className="relative overflow-hidden bg-primary pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40">
        {/* Animated background elements - Similar to CTA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-drift"></div>
            </div>
        
        {/* Curved decorative lines - Similar to CTA */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
          <path
            d="M0,150 Q600,50 1200,150 T2400,150"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="3"
            fill="none"
            className="animate-wave"
          />
          <path
            d="M0,350 Q500,250 1000,350 T2000,350"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
            fill="none"
            className="animate-wave delay-1000"
          />
          <path
            d="M0,550 Q700,450 1400,550 T2800,550"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            fill="none"
            className="animate-wave delay-2000"
          />
        </svg>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="relative">
              {/* Floating decorative element */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse hidden lg:block"></div>
              
              {/* <SectionLabel tone="onDark" align="left" className="mb-4 animate-fade-in">Link infrastructure platform</SectionLabel> */}
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              Link Infrastructure
              <br />
                <span className="text-white">
                  for Modern Campaigns
              </span>
            </h1>
              <div className="mb-8 space-y-5 animate-fade-in-up delay-100">
                <p className="text-base sm:text-xl text-white/75 leading-relaxed max-w-xl">
                  Build, track, and scale your link strategy with enterprise-grade tools.
                </p>
                <ul className="flex flex-wrap items-center gap-y-2 text-sm sm:text-base font-semibold text-white tracking-tight">
                  {[
                    "URL shortening",
                    "QR codes",
                    "Lead capture",
                    "Campaign Studio",
                    "Developer APIs",
                  ].map((feature, index, list) => (
                    <li key={feature} className="inline-flex items-center">
                      <span>{feature}</span>
                      {index < list.length - 1 && (
                        <span className="mx-2.5 sm:mx-3 text-white/40 select-none" aria-hidden>
                          ·
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 animate-fade-in-up delay-200">
              <Link
                href="/login"
                className={cn(
                    "px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold text-primary text-base sm:text-lg",
                    "bg-white hover:bg-neutral-bg",
                    "transition-all active:scale-[0.98] shadow-button hover:shadow-hover",
                    "flex items-center justify-center gap-2 group relative overflow-hidden"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
                <button className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-semibold text-white border border-white/30 hover:border-white/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2 group backdrop-blur-sm text-base sm:text-lg">
                  <Play className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                Watch Demo
              </button>
            </div>
              <p className="text-sm text-white/80 animate-fade-in delay-300">
                No credit card required • Start with 2 free links and 2 QR codes
              </p>
            </div>
            
            {/* Right Column - Visual with Playful Animations */}
            <div className="relative group">
              {/* Animated decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-500 delay-100"></div>
              
              <div className="relative bg-primary/10 rounded-3xl p-8 border border-primary/20 shadow-2xl group-hover:shadow-3xl group-hover:rotate-1 transition-all duration-300">
                {/* Mock Dashboard Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <BrandLogo href={null} variant="mark" size="md" />
                    <div>
                      <div className="h-3 w-24 bg-neutral-border rounded mb-2 group-hover:bg-primary/15 transition-all duration-300"></div>
                      <div className="h-2 w-16 bg-neutral-border rounded group-hover:bg-primary/15 transition-all duration-300"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-primary/15 rounded group-hover:bg-primary/25 transition-all duration-300"></div>
                    <div className="h-4 w-3/4 bg-primary/15 rounded group-hover:bg-primary/25 transition-all duration-300"></div>
                    <div className="h-4 w-5/6 bg-primary/15 rounded group-hover:bg-primary/25 transition-all duration-300"></div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-neutral-bg rounded-xl group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <div className="h-8 w-8 bg-primary/15 rounded-lg mx-auto mb-2 group-hover:rotate-6 transition-transform duration-300"></div>
                      <div className="h-2 w-12 bg-neutral-border rounded mx-auto"></div>
                    </div>
                    <div className="text-center p-4 bg-neutral-bg rounded-xl group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <div className="h-8 w-8 bg-primary/15 rounded-lg mx-auto mb-2 group-hover:-rotate-6 transition-transform duration-300"></div>
                      <div className="h-2 w-12 bg-neutral-border rounded mx-auto"></div>
                    </div>
                    <div className="text-center p-4 bg-neutral-bg rounded-xl group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <div className="h-8 w-8 bg-primary/15 rounded-lg mx-auto mb-2 group-hover:rotate-6 transition-transform duration-300"></div>
                      <div className="h-2 w-12 bg-neutral-border rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Commented out until real stats are available */}
      {/* <section className="py-12 bg-white border-y border-neutral-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-neutral-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-muted font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section - Two Column with Interactive Visuals */}
      <section id="features" className="py-24 bg-white relative overflow-hidden scroll-mt-20">
        {/* Animated background with curved lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
            <path
              d="M0,150 Q300,50 600,150 T1200,150 T1800,150"
              stroke="url(#featureGradient1)"
              strokeWidth="3"
              fill="none"
              className="animate-wave"
            />
            <path
              d="M0,350 Q400,250 800,350 T1600,350 T2400,350"
              stroke="url(#featureGradient2)"
              strokeWidth="3"
              fill="none"
              className="animate-wave delay-1000"
            />
            <defs>
              <linearGradient id="featureGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="featureGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Orbiting elements */}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Complete Link{" "}
              <span className="text-primary">
                Infrastructure
              </span>
            </h2>
            <p className="text-xl text-neutral-muted max-w-2xl mx-auto">
              Everything you need to power campaigns, QR codes, APIs, and URL shortening at scale
            </p>
          </div>

          {/* Feature 1 - Two Column with Visual on Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24 relative">
            <div className="relative z-10">
              <SectionLabel align="left">Link shortening</SectionLabel>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                URL Shortening{" "}
                <span className="text-primary">
                  Infrastructure
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Enterprise-grade URL shortening infrastructure. Create short links at scale with custom back-halves, expiration controls, password gates, lead capture before redirect, and programmatic access via API. Custom domains for short links are coming soon.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Custom back-halves for branded links</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Set expiration dates for temporary campaigns</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Password protection for sensitive links</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Lead Gate Studio — collect emails &amp; form fields before redirect</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/15 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/15 rounded-full blur-xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-500 delay-100"></div>
              
              <div className="relative bg-primary/10 rounded-3xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-2xl group-hover:-rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-bg rounded-xl group-hover:bg-primary/5 transition-all duration-300 group-hover:border group-hover:border-primary/20">
                      <div className="text-xs text-neutral-muted mb-2 flex items-center gap-1">
                        <span>Original URL</span>
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-sm font-mono text-neutral-text break-all group-hover:text-primary transition-colors">
                        https://example.com/very/long/url/path/that/needs/shortening
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/15 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                        <ArrowRight className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="text-xs text-neutral-muted mb-2 relative z-10">Shortened Link</div>
                      <div className="text-lg font-mono font-bold text-primary relative z-10 group-hover:scale-105 transition-transform duration-300 inline-block">
                        lunr.to/abc123
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Reversed Layout with Visual on Left */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24 relative">
            <div className="relative group order-2 lg:order-1">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/15 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/15 rounded-full blur-xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-700 delay-100"></div>
              
              <div className="relative bg-primary/10 rounded-3xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-2xl group-hover:rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="text-center mb-6">
                    <div className="w-32 h-32 bg-primary/15 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 relative">
                      <QrCode className="h-16 w-16 text-primary relative z-10" />
                      <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl group-hover:blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                    </div>
                    <div className="text-sm text-neutral-muted group-hover:text-primary transition-colors flex items-center justify-center gap-1">
                      <span>Scan to visit</span>
                      <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-neutral-bg rounded-lg group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <div className="text-xs text-neutral-muted mb-1">Downloads</div>
                      <div className="text-lg font-bold text-neutral-text group-hover:text-primary group-hover:animate-bounce transition-colors">1.2K</div>
                    </div>
                    <div className="text-center p-3 bg-neutral-bg rounded-lg group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                      <div className="text-xs text-neutral-muted mb-1">Scans</div>
                      <div className="text-lg font-bold text-neutral-text group-hover:text-primary group-hover:animate-bounce transition-colors">856</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative z-10 order-1 lg:order-2">
              <SectionLabel align="left">QR code generation</SectionLabel>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                QR Code{" "}
                <span className="text-primary">
                  Infrastructure
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Generate QR codes programmatically for any link. Perfect infrastructure for offline campaigns, print materials, and physical-to-digital bridge strategies.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">High-resolution QR codes in multiple formats</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Track QR code scans separately from link clicks</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Customizable colors, sizes, and center logos</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Watermarked previews until the QR is saved</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature — Lead capture */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24 relative">
            <div className="relative z-10">
              <SectionLabel align="left">Lead capture</SectionLabel>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                Lead Gate{" "}
                <span className="text-primary">Studio</span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Collect emails and custom fields before visitors reach your destination. Design branded gates with themes, typography, and live preview — then export leads from analytics.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Drag-and-drop fields, themes, and brand styling</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Runs after password gate, before redirect</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">View and CSV-export responses in link analytics</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative bg-primary/10 rounded-3xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-text">Continue to destination</div>
                      <div className="text-xs text-neutral-muted">Enter your email to unlock the link</div>
                    </div>
                  </div>
                  <div className="h-10 rounded-xl border border-neutral-border bg-neutral-bg/60 px-3 flex items-center text-sm text-neutral-muted">
                    you@company.com
                  </div>
                  <div className="h-10 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center">
                    Continue
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Two Column with Visual on Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center relative">
            <div className="relative z-10">
              <SectionLabel align="left">Analytics</SectionLabel>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                Understand your{" "}
                <span className="text-primary">
                  audience
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Get deep insights into how your links perform. Track clicks in real-time, understand where your traffic comes from, and make data-driven decisions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:-rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Real-time click tracking and analytics</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:-rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Device breakdowns · Geographic data coming soon</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:-rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">UTM parameter tracking for campaigns</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 group-hover:-rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Lead responses with CSV export</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary/15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative bg-primary/10 rounded-3xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-2xl group-hover:-rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-3 w-24 bg-neutral-border rounded group-hover:bg-primary/15 transition-all duration-300"></div>
                      <div className="h-3 w-16 bg-neutral-border rounded group-hover:bg-primary/15 transition-all duration-300"></div>
                    </div>
                    <div className="h-40 bg-primary/15 rounded-xl group-hover:shadow-lg transition-all duration-300"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 rounded-lg group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-300">
                      <div className="text-2xl font-bold text-primary mb-1 group-hover:animate-bounce">1.2K</div>
                      <div className="text-xs text-neutral-muted">Total Clicks</div>
                    </div>
                    <div className="text-center p-2 rounded-lg group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-300">
                      <div className="text-2xl font-bold text-primary mb-1 group-hover:animate-bounce">856</div>
                      <div className="text-xs text-neutral-muted">Unique</div>
                    </div>
                    <div className="text-center p-2 rounded-lg group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-300">
                      <div className="text-2xl font-bold text-primary mb-1 group-hover:animate-bounce">71%</div>
                      <div className="text-xs text-neutral-muted">CTR</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4 - Campaign Infrastructure */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24 relative mt-24">
            <div className="relative group order-2 lg:order-1">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/15 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-primary/15 rounded-full blur-xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-700 delay-100"></div>
              
              <div className="relative bg-primary/10 rounded-3xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-2xl group-hover:rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="mb-4">
                    <div className="h-4 w-32 bg-neutral-border rounded mb-2 group-hover:bg-primary/15 transition-all duration-300"></div>
                    <div className="h-4 w-24 bg-neutral-border rounded group-hover:bg-primary/15 transition-all duration-300"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <div className="text-sm font-semibold text-neutral-text mb-1">Summer Campaign</div>
                      <div className="text-xs text-neutral-muted">12 links • 2.4K clicks</div>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <div className="text-sm font-semibold text-neutral-text mb-1">Product Launch</div>
                      <div className="text-xs text-neutral-muted">8 links • 1.8K clicks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative z-10 order-1 lg:order-2">
              <SectionLabel align="left">Campaign Studio</SectionLabel>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                Campaign{" "}
                <span className="text-primary">
                  Studio
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Group links by launch, channel, or initiative. Share UTM defaults, add optional partners with unique tracking links, log spend, record conversions, and compare what wins.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Organize links into campaign workspaces</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Partners, spend, conversions, and side-by-side compare</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Campaign-level analytics, UTM breakdowns, and CSV export</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 5 - API Infrastructure */}
          <div className="grid lg:grid-cols-2 gap-16 items-center relative">
            <div className="relative z-10">
              <SectionLabel align="left">API infrastructure</SectionLabel>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                Developer{" "}
                <span className="text-primary">
                  APIs & Webhooks
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Integrate link infrastructure directly into your applications. RESTful APIs for links, QR codes, campaigns, and analytics. Real-time webhooks for event-driven workflows.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">RESTful API for all link operations</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Real-time webhooks for link events</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Usage analytics and API rate limiting</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-primary/15 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative bg-primary/10 rounded-3xl p-8 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 group-hover:shadow-2xl group-hover:-rotate-1">
                <div className="bg-neutral-900 rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="text-green-400 font-mono text-sm space-y-1">
                    <div className="mb-2">$ curl -X POST \</div>
                    <div className="ml-4 mb-2">https://api.lunr.to/v1/links \</div>
                    <div className="ml-4 mb-2">-H &quot;Authorization: Bearer sk_...&quot; \</div>
                    <div className="ml-4">-d &apos;{`{"original_url": "..."}`}&apos;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section connector */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/20"></div>
      </section>

      {/* How It Works - Bold Diagonal/Zigzag Layout with Playful Elements */}
      <section className="py-24 bg-neutral-bg relative overflow-hidden">
        {/* Section connector from features */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-primary/20"></div>
        {/* Animated background with dynamic elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl animate-drift"></div>
        </div>
        
        {/* Curved connecting lines between steps */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15 hidden lg:block" preserveAspectRatio="none">
          {/* Curved path from step 1 to step 2 */}
          <path
            d="M 200 400 Q 600 200 1000 400"
            stroke="url(#howItWorksGradient1)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10,5"
            className="animate-pulse"
          />
          {/* Curved path from step 2 to step 3 */}
          <path
            d="M 1000 600 Q 600 800 200 600"
            stroke="url(#howItWorksGradient2)"
            strokeWidth="4"
            fill="none"
            strokeDasharray="10,5"
            className="animate-pulse delay-1000"
          />
          <defs>
            <linearGradient id="howItWorksGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="howItWorksGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => {
            const size = 8 + (i % 3) * 4;
            return (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${10 + (i * 12)}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${5 + (i % 2) * 2}s`,
                }}
              >
                <div 
                  className="border-2 border-primary/10 rounded-full animate-pulse-glow"
                  style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                ></div>
              </div>
            );
          })}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <SectionLabel>Process</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4 animate-fade-in-up">
              How It Works
            </h2>
            <p className="text-xl text-neutral-muted max-w-2xl mx-auto animate-fade-in-up delay-100">
              Build your link infrastructure in minutes. From simple shortening to enterprise APIs.
            </p>
          </div>

          {/* Step 1 - Large Left Card with Playful Elements */}
          <div className="relative mb-32 group">
            {/* Floating decorative blobs */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse hidden lg:block"></div>
            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse delay-500 hidden lg:block"></div>
            
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              {/* Large Step Number Badge with Playful Animation */}
              <div className="relative flex-shrink-0 group/badge">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-primary flex items-center justify-center text-white font-bold text-4xl lg:text-5xl shadow-2xl group-hover/badge:scale-125 group-hover/badge:rotate-12 group-hover/badge:animate-bounce transition-all duration-500 relative z-20 cursor-pointer">
                  <span className="relative z-10">01</span>
                  <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-2xl group-hover/badge:blur-3xl group-hover/badge:scale-150 transition-all duration-500 animate-pulse"></div>
                {/* Sparkle effect */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping delay-200"></div>
              </div>
              
              {/* Content Card */}
              <div className="flex-1 bg-white rounded-3xl border-2 border-neutral-border p-8 lg:p-10 shadow-xl hover:shadow-2xl hover:border-primary/50 transition-all duration-300 group/card relative overflow-hidden hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-full group-hover/card:scale-125 transition-transform duration-500"></div>
                {/* Floating corner decoration */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full blur-sm opacity-0 group-hover/card:opacity-100 group-hover/card:animate-pulse"></div>
                
                <div className="relative z-10">
                  <SectionLabel align="left">Step 1</SectionLabel>
                  <h3 className="text-3xl lg:text-4xl font-bold text-neutral-text mb-4 group-hover/card:text-primary transition-colors">
                    Create your{" "}
                    <span className="text-primary">
                      first link
                    </span>
                  </h3>
                  <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                    Sign up in seconds and start shortening links immediately. No complex setup, no learning curve—just paste your URL and get a short, shareable link.
                  </p>
                  
                  {/* Interactive Visual */}
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="space-y-3 relative z-10">
                      <div className="p-4 bg-white rounded-xl group-hover/card:bg-primary/5 transition-all duration-300">
                        <div className="text-xs text-neutral-muted mb-1 flex items-center gap-1">
                          <span>Paste your URL</span>
                          <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-sm font-mono text-neutral-text group-hover/card:text-primary transition-colors">https://example.com/very/long/url</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="p-2 rounded-full bg-primary/10 group-hover/card:bg-primary/15 group-hover/card:rotate-12 group-hover/card:scale-110 transition-all duration-300">
                          <ArrowRight className="h-6 w-6 text-primary group-hover/card:translate-x-2 transition-transform" />
                        </div>
                      </div>
                      <div className="p-4 bg-primary/15 rounded-xl group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300">
                        <div className="text-xs text-neutral-muted mb-1">Get your short link</div>
                        <div className="text-lg font-mono font-bold text-primary group-hover/card:animate-pulse">lunr.to/abc123</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated Connecting Arrow */}
            <div className="hidden lg:block absolute left-16 top-full mt-8 w-0.5 h-16 bg-primary group-hover:scale-y-150 transition-transform duration-500"></div>
            <div className="hidden lg:block absolute left-16 top-full mt-20 w-16 h-0.5 bg-primary group-hover:scale-x-150 transition-transform duration-500">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Step 2 - Large Right Card (Reversed) with Playful Elements */}
          <div className="relative mb-32 lg:ml-32 group">
            {/* Floating decorative blobs */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse delay-300 hidden lg:block"></div>
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse delay-700 hidden lg:block"></div>
            
            <div className="flex flex-col lg:flex-row-reverse items-start gap-8 lg:gap-12">
              {/* Large Step Number Badge with Playful Animation */}
              <div className="relative flex-shrink-0 group/badge">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-primary flex items-center justify-center text-white font-bold text-4xl lg:text-5xl shadow-2xl group-hover/badge:scale-125 group-hover/badge:-rotate-12 group-hover/badge:animate-bounce transition-all duration-500 relative z-20 cursor-pointer">
                  <span className="relative z-10">02</span>
                  <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl group-hover/badge:blur-3xl group-hover/badge:scale-150 transition-all duration-500 animate-pulse"></div>
                {/* Sparkle effect */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping"></div>
                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping delay-200"></div>
              </div>
              
              {/* Content Card */}
              <div className="flex-1 bg-white rounded-3xl border-2 border-neutral-border p-8 lg:p-10 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300 group/card relative overflow-hidden hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-br-full group-hover/card:scale-125 transition-transform duration-500"></div>
                {/* Floating corner decoration */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-primary/10 rounded-full blur-sm opacity-0 group-hover/card:opacity-100 group-hover/card:animate-pulse"></div>
                
                <div className="relative z-10">
                  <SectionLabel align="left">Step 2</SectionLabel>
                  <h3 className="text-3xl lg:text-4xl font-bold text-neutral-text mb-4 group-hover/card:text-primary transition-colors">
                    Enhance and{" "}
                    <span className="text-primary">
                      customize
                    </span>
                  </h3>
                  <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                    Take your links to the next level. Generate QR codes, design lead gates, create landing pages, organize campaigns, and customize everything to match your brand.
                  </p>
                  
                  {/* Interactive Visual */}
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                      <div className="p-4 bg-white rounded-xl text-center group-hover/card:bg-primary/10 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-300">
                        <div className="group-hover/card:rotate-6 transition-transform duration-300">
                          <QrCode className="h-8 w-8 text-primary mx-auto mb-2" />
                        </div>
                        <div className="text-xs text-neutral-muted">QR Code</div>
                      </div>
                      <div className="p-4 bg-white rounded-xl text-center group-hover/card:bg-primary/10 group-hover/card:scale-110 group-hover/card:-rotate-3 transition-all duration-300">
                        <div className="group-hover/card:-rotate-6 transition-transform duration-300">
                          <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                        </div>
                        <div className="text-xs text-neutral-muted">Landing Page</div>
                      </div>
                    </div>
                    <div className="p-4 bg-primary/15 rounded-xl group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative z-10">
                      <div className="text-xs text-neutral-muted mb-1">Campaign</div>
                      <div className="text-sm font-semibold text-neutral-text group-hover/card:text-primary transition-colors">Summer Sale 2024</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated Connecting Arrow */}
            <div className="hidden lg:block absolute right-16 top-full mt-8 w-0.5 h-16 bg-primary group-hover:scale-y-150 transition-transform duration-500"></div>
            <div className="hidden lg:block absolute right-16 top-full mt-20 w-16 h-0.5 bg-primary group-hover:scale-x-150 transition-transform duration-500">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Step 3 - Large Left Card with Playful Elements */}
          <div className="relative group">
            {/* Floating decorative blobs */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse delay-500 hidden lg:block"></div>
            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse delay-1000 hidden lg:block"></div>
            
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              {/* Large Step Number Badge with Playful Animation */}
              <div className="relative flex-shrink-0 group/badge">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-primary flex items-center justify-center text-white font-bold text-4xl lg:text-5xl shadow-2xl group-hover/badge:scale-125 group-hover/badge:rotate-12 group-hover/badge:animate-bounce transition-all duration-500 relative z-20 cursor-pointer">
                  <span className="relative z-10">03</span>
                  <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 bg-primary/[0.03]0 rounded-3xl blur-2xl group-hover/badge:blur-3xl group-hover/badge:scale-150 transition-all duration-500 animate-pulse"></div>
                {/* Sparkle effect */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping delay-200"></div>
              </div>
              
              {/* Content Card */}
              <div className="flex-1 bg-white rounded-3xl border-2 border-neutral-border p-8 lg:p-10 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300 group/card relative overflow-hidden hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-bl-full group-hover/card:scale-125 transition-transform duration-500"></div>
                {/* Floating corner decoration */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full blur-sm opacity-0 group-hover/card:opacity-100 group-hover/card:animate-pulse"></div>
                
                <div className="relative z-10">
                  <SectionLabel align="left">Step 3</SectionLabel>
                  <h3 className="text-3xl lg:text-4xl font-bold text-neutral-text mb-4 group-hover/card:text-primary transition-colors">
                    Analyze and{" "}
                    <span className="text-primary">
                      optimize
                    </span>
                  </h3>
                  <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                    Watch your links perform in real-time. Track clicks, understand your audience, measure campaign success, and optimize your strategy with powerful analytics.
                  </p>
                  
                  {/* Interactive Visual */}
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="mb-4 relative z-10">
                      <div className="h-32 bg-primary/15 rounded-xl group-hover/card:shadow-lg transition-all duration-300"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 relative z-10">
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-primary/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300">
                        <div className="text-lg font-bold text-primary">1.2K</div>
                        <div className="text-xs text-neutral-muted">Clicks</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-primary/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300 delay-100">
                        <div className="text-lg font-bold text-primary">856</div>
                        <div className="text-xs text-neutral-muted">Unique</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-primary/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300 delay-200">
                        <div className="text-lg font-bold text-primary">12</div>
                        <div className="text-xs text-neutral-muted">Countries</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-primary/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300 delay-300">
                        <div className="text-lg font-bold text-primary">71%</div>
                        <div className="text-xs text-neutral-muted">CTR</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section - Playful Staggered Layout */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
            <path
              d="M0,200 Q400,100 800,200 T1600,200 T2400,200"
              stroke="url(#useCaseGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-wave"
            />
            <path
              d="M0,500 Q600,400 1200,500 T2400,500"
              stroke="url(#useCaseGradient2)"
              strokeWidth="2"
              fill="none"
              className="animate-wave delay-1000"
            />
            <defs>
              <linearGradient id="useCaseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="useCaseGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Floating circles */}
          <div className="absolute top-1/4 right-10 w-40 h-40 border-2 border-primary/5 rounded-full animate-float"></div>
          <div className="absolute bottom-1/4 left-10 w-32 h-32 border-2 border-primary/5 rounded-full animate-float-reverse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <SectionLabel>Use cases</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Perfect for every{" "}
              <span className="text-primary">
                use case
              </span>
            </h2>
            <p className="text-xl text-neutral-muted max-w-2xl mx-auto">
              Whether you're a creator, marketer, or enterprise, we've got you covered
            </p>
          </div>

          {/* Staggered Card Layout */}
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Card 1 - Left Aligned with Playful Elements */}
            <div className="group relative">
              {/* Floating decorative blob */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="bg-white rounded-2xl border-2 border-neutral-border p-8 shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative">
                      <Users className="h-10 w-10 text-white relative z-10" />
                      <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-neutral-text mb-3 group-hover:text-primary transition-colors">
                      Content Creators
                    </h3>
                    <p className="text-neutral-muted mb-4 leading-relaxed">
                      Share links across platforms, track engagement, and grow your audience with detailed analytics.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["Social media links", "Bio link pages", "Click tracking", "QR codes"].map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Right Aligned with Playful Elements */}
            <div className="group relative md:ml-auto md:w-5/6">
              {/* Floating decorative blob */}
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="bg-white rounded-2xl border-2 border-neutral-border p-8 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-br-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 relative">
                      <Building2 className="h-10 w-10 text-white relative z-10" />
                      <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-2xl font-bold text-neutral-text mb-3 group-hover:text-primary transition-colors">
                      Marketing Teams
                    </h3>
                    <p className="text-neutral-muted mb-4 leading-relaxed">
                      Manage campaigns, track UTM parameters, measure ROI, and optimize your marketing efforts.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                      {[
                        { label: "Campaign management" },
                        { label: "UTM tracking" },
                        { label: "A/B testing", comingSoon: true },
                        { label: "Custom domains" },
                      ].map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          {feature.label}
                          {feature.comingSoon && (
                            <span className="ml-1.5 text-[10px] uppercase tracking-wide opacity-70">Coming soon</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Left Aligned with Playful Elements */}
            <div className="group relative md:w-5/6">
              {/* Floating decorative blob */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="bg-white rounded-2xl border-2 border-neutral-border p-8 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative">
                      <Crown className="h-10 w-10 text-white relative z-10" />
                      <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-neutral-text mb-3 group-hover:text-primary transition-colors">
                      Enterprises
                    </h3>
                    <p className="text-neutral-muted mb-4 leading-relaxed">
                      Enterprise-grade features with API access, team collaboration, priority support, and unlimited resources.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["API access", "Team collaboration", "Priority support", "Unlimited resources"].map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Commented out until real testimonials are available */}
      {/* <section className="py-20 bg-neutral-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-text mb-4">
              Loved by teams worldwide
            </h2>
            <p className="text-xl text-neutral-muted max-w-2xl mx-auto">
              See what our customers have to say about lunr.to
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-card border border-neutral-border p-6 shadow-soft"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-text mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-text">{testimonial.name}</div>
                    <div className="text-sm text-neutral-muted">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Security & Trust - Centered Visual Layout */}
      <section id="security" className="py-24 bg-neutral-bg relative overflow-hidden scroll-mt-20">
        {/* Animated security pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="none">
            {/* Grid pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="1" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Curved accent lines */}
            <path
              d="M0,300 Q600,200 1200,300 T2400,300"
              stroke="url(#securityGradient)"
              strokeWidth="3"
              fill="none"
              className="animate-wave"
            />
          </svg>
          <defs>
            <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Orbiting security icons */}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel>Security</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Enterprise-grade{" "}
              <span className="text-primary">
                security
              </span>
            </h2>
            <p className="text-xl text-neutral-muted max-w-2xl mx-auto">
              Your data is protected with industry-leading security standards
            </p>
          </div>

          {/* Large Centered Visual Card with Playful Elements */}
          <div className="relative max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl border-2 border-neutral-border p-12 shadow-2xl relative overflow-hidden group hover:shadow-3xl transition-all duration-300">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-primary group-hover:h-3 transition-all duration-300"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-500"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-500 delay-100"></div>
              
              <div className="relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center group/item relative">
                    {/* Floating element */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/10 rounded-full blur-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 mb-4 group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-500 relative">
                      <Shield className="h-8 w-8 text-primary relative z-10" />
                      <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl group-hover/item:blur-2xl group-hover/item:scale-150 transition-all duration-500"></div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-text mb-2 group-hover/item:text-primary transition-colors">Row Level Security</h3>
                    <p className="text-sm text-neutral-muted leading-relaxed">
                      Advanced database security ensuring your data is only accessible by you.
                    </p>
                  </div>
                  
                  <div className="text-center group/item relative">
                    {/* Floating element */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary/10 rounded-full blur-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover/item:scale-125 group-hover/item:-rotate-12 transition-all duration-500 relative">
                      <Lock className="h-8 w-8 text-primary relative z-10" />
                      <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl group-hover/item:blur-2xl group-hover/item:scale-150 transition-all duration-500"></div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-text mb-2 group-hover/item:text-primary transition-colors">Encrypted Storage</h3>
                    <p className="text-sm text-neutral-muted leading-relaxed">
                      All data is encrypted at rest and in transit using industry-standard encryption.
                    </p>
                  </div>
                  
                  <div className="text-center group/item relative">
                    {/* Floating element */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary/10 rounded-full blur-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-500 relative">
                      <Award className="h-8 w-8 text-primary relative z-10" />
                      <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-xl group-hover/item:blur-2xl group-hover/item:scale-150 transition-all duration-500"></div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-text mb-2 group-hover/item:text-primary transition-colors">99.9% Uptime SLA</h3>
                    <p className="text-sm text-neutral-muted leading-relaxed">
                      Enterprise-grade infrastructure with guaranteed uptime and reliability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations - Commented out until integrations are implemented */}
      {/* <section className="py-20 bg-neutral-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-text mb-4">
              Integrate with your favorite tools
            </h2>
            <p className="text-lg text-neutral-muted">
              Connect lunr.to with your existing workflow
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {integrations.map((integration, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl border border-neutral-border shadow-soft"
              >
                <integration.icon className="h-6 w-6 text-primary" />
                <span className="font-semibold text-neutral-text">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Pricing Section - Playful Grid with Animated Background */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl animate-drift"></div>
        </div>
        
        {/* Curved decorative lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" preserveAspectRatio="none">
          <path
            d="M0,250 Q500,150 1000,250 T2000,250"
            stroke="url(#pricingGradient1)"
            strokeWidth="3"
            fill="none"
            className="animate-wave"
          />
          <path
            d="M0,450 Q600,350 1200,450 T2400,450"
            stroke="url(#pricingGradient2)"
            strokeWidth="3"
            fill="none"
            className="animate-wave delay-1000"
          />
          <defs>
            <linearGradient id="pricingGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="pricingGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Floating price tags */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-16 h-16 border-2 border-primary/10 rounded-full animate-float"
              style={{
                left: `${15 + (i * 15)}%`,
                top: `${20 + (i % 2) * 60}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${6 + (i % 2) * 2}s`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel>Pricing</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Simple, Transparent{" "}
              <span className="text-primary">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-neutral-muted mb-8">
              Start free, upgrade when you need more
            </p>
            <div className="inline-flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-xl rounded-full border border-neutral-border/80 shadow-soft">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all",
                  billingCycle === "monthly"
                    ? "bg-primary text-white shadow-button"
                    : "text-neutral-muted hover:text-neutral-text"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2",
                  billingCycle === "yearly"
                    ? "bg-primary text-white shadow-button"
                    : "text-neutral-muted hover:text-neutral-text"
                )}
              >
                Yearly
                <span
                  className={cn(
                    "text-xs font-medium",
                    billingCycle === "yearly" ? "text-white/80" : "text-primary"
                  )}
                >
                  Save 17%
                </span>
              </button>
            </div>
          </div>


          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <PricingCard
              name="Free"
              price={0}
              description="Perfect for getting started"
              billingCycle={billingCycle}
              features={[
                "2 Short Links",
                "2 QR Codes",
                "Basic Analytics",
                "Real-time Tracking",
              ]}
              highlighted={false}
              icon={null}
            />
            <PricingCard
              name="Pro"
              price={billingCycle === "monthly" ? 9.99 : 99.99}
              description="For professionals and small teams"
              billingCycle={billingCycle}
              features={[
                "100 Links",
                "100 QR Codes",
                "5 Custom Pages",
                "Advanced Analytics",
                "Custom Back-halves",
                "Link Expiration",
                "UTM Parameters",
              ]}
              highlighted={true}
              icon={Zap}
            />
            <PricingCard
              name="Business"
              price={billingCycle === "monthly" ? 29.99 : 299.99}
              description="For growing businesses"
              billingCycle={billingCycle}
              features={[
                "1,000 Links",
                "1,000 QR Codes",
                "50 Custom Pages",
                "Custom Domains for Pages",
                "Team Collaboration",
                "Advanced Analytics",
                "Priority Support",
              ]}
              highlighted={false}
              icon={Building2}
            />
            <PricingCard
              name="Enterprise"
              price={billingCycle === "monthly" ? 99.99 : 999.99}
              description="For large organizations"
              billingCycle={billingCycle}
              features={[
                "Unlimited Links",
                "Unlimited QR Codes",
                "Unlimited Pages",
                "Custom Domains for Pages",
                "API Access",
                "Team Collaboration",
                "Priority Support",
                "Dedicated Account Manager",
              ]}
              highlighted={false}
              icon={Crown}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section - Two Column Layout with Playful Elements */}
      <section className="py-24 bg-neutral-bg relative overflow-hidden">
        {/* Playful background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Frequently Asked{" "}
              <span className="text-primary">
                Questions
              </span>
            </h2>
            <p className="text-xl text-neutral-muted">
              Everything you need to know about lunr.to
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border-2 border-neutral-border overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 group relative"
              >
                {/* Playful corner decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/[0.04] rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-start justify-between text-left hover:bg-primary/5 transition-all gap-4 relative z-10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                        <HelpCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-neutral-text group-hover:text-primary transition-colors text-left">
                        {faq.question}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {openFaq === idx ? (
                      <div className="p-1 rounded-lg bg-primary/10">
                        <ChevronUp className="h-5 w-5 text-primary transition-transform rotate-180" />
                      </div>
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-muted group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    )}
                  </div>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-neutral-muted leading-relaxed animate-fade-in border-t border-neutral-border/50 pt-4 relative z-10">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Playful & Dynamic with Flashy Animations */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-drift"></div>
        </div>
        
        {/* Curved decorative lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
          <path
            d="M0,150 Q600,50 1200,150 T2400,150"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="3"
            fill="none"
            className="animate-wave"
          />
          <path
            d="M0,350 Q500,250 1000,350 T2000,350"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
            fill="none"
            className="animate-wave delay-1000"
          />
          <path
            d="M0,550 Q700,450 1400,550 T2800,550"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            fill="none"
            className="animate-wave delay-2000"
          />
        </svg>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <SectionLabel tone="onDark">Join thousands of users</SectionLabel>
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Build Your Link Infrastructure
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start with URL shortening, add QR codes, manage campaigns, and scale with APIs. Enterprise-grade infrastructure, simple pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-2">
          <Link
            href="/login"
            className={cn(
                "inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-full font-semibold text-primary text-base sm:text-lg",
                "bg-white hover:bg-neutral-bg shadow-button",
                "transition-all active:scale-[0.98] shadow-2xl hover:shadow-3xl group relative overflow-hidden"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
            Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/docs"
              className={cn(
                "inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-semibold text-white text-base sm:text-lg",
                "border-2 border-white/30 hover:border-white/50 hover:bg-white/10",
                "transition-all active:scale-[0.98] backdrop-blur-sm"
              )}
            >
              View Documentation
          </Link>
          </div>
          <p className="mt-8 text-sm text-white/80">
            No credit card required • 2 free links • 2 free QR codes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-border bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BrandLogo variant="full" size="md" />
              </div>
              <p className="text-sm text-neutral-muted">
                The all-in-one link management platform for professionals and businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-text mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-muted">
                <li>
                  <Link href="/#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api-reference" className="hover:text-primary transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-text mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-muted">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-primary transition-colors">
                    Docs &amp; updates
                  </Link>
                </li>
                <li>
                  <Link href="/contact?intent=careers" className="hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-text mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-muted">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/#security" className="hover:text-primary transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/privacy#compliance" className="hover:text-primary transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-border text-center text-sm text-neutral-muted">
            <p>© {new Date().getFullYear()} lunr.to. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group p-6 rounded-card bg-white border border-neutral-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br transition-opacity duration-300", color)}></div>
      
      <div className={cn("p-3 rounded-xl w-fit mb-4 bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-text mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-neutral-muted leading-relaxed">{description}</p>
    </div>
  );
}

function UseCaseCard({
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="group p-6 rounded-card bg-white border border-neutral-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-primary transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="p-3 rounded-xl w-fit mb-4 bg-primary group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Icon className="h-6 w-6 text-white" />
      </div>
        <h3 className="text-xl font-semibold text-neutral-text mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-neutral-muted mb-4 leading-relaxed">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-neutral-text group-hover:translate-x-1 transition-transform duration-200" style={{ transitionDelay: `${idx * 50}ms` }}>
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SecurityCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 rounded-card bg-white border border-neutral-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center relative overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-primary transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="p-3 rounded-xl w-fit mx-auto mb-4 bg-primary/10 group-hover:from-primary/15 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-300">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-text mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-neutral-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  billingCycle,
  features,
  highlighted,
  icon: Icon,
}: {
  name: string;
  price: number;
  description: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  highlighted: boolean;
  icon: React.ElementType | null;
}) {
  const displayPrice = billingCycle === "monthly" ? price : price;
  const period = billingCycle === "monthly" ? "month" : "year";
  const ctaLabel = price === 0 ? "Start free" : "Get started";

  return (
    <div
      className={cn(
        "p-6 rounded-card border transition-all relative flex flex-col h-full",
        highlighted
          ? "border-primary/40 bg-white shadow-hover ring-2 ring-primary/15"
          : "border-neutral-border/80 bg-white/90 backdrop-blur-xl shadow-soft hover:border-primary/30 hover:shadow-hover"
      )}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-primary">
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-2xl font-semibold text-neutral-text">{name}</h3>
              {highlighted && (
                <span className="text-sm font-medium text-neutral-muted">
                  Recommended
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-semibold text-neutral-text tracking-tight">
            {price === 0 ? "Free" : `$${displayPrice.toFixed(2)}`}
          </span>
          {price > 0 && <span className="text-neutral-muted">/{period}</span>}
        </div>
        <p className="text-sm text-neutral-muted">{description}</p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-sm text-neutral-text">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={cn(
          "w-full block text-center px-6 py-3 rounded-full font-semibold transition-all active:scale-[0.98] mt-auto",
          highlighted
            ? "bg-primary text-white hover:bg-bright-indigo shadow-button"
            : "bg-neutral-bg text-neutral-text hover:bg-primary/10 border border-neutral-border/80 hover:border-primary/40"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          {ctaLabel}
          {highlighted && <ArrowRight className="h-4 w-4" />}
        </span>
      </Link>
    </div>
  );
}
