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
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  Crown,
  Clock,
  Lock,
  Palette,
  Layout,
  Target,
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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export default function HomePageClient() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      description: "Generate QR codes for offline sharing, create beautiful landing pages, organize links into campaigns, and customize with your branding.",
      icon: QrCode,
    },
    {
      step: "03",
      title: "Analyze & Optimize",
      description: "Track clicks in real-time, view detailed analytics including geographic data and referrers, and measure the performance of your campaigns.",
      icon: BarChart3,
    },
  ];

  const faqs = [
    {
      question: "How does link shortening work?",
      answer: "When you create a short link, we store your original URL in our secure database and generate a unique short code. When someone clicks your short link, they're instantly redirected to your original URL while we track the click data for analytics.",
    },
    {
      question: "Can I use my own domain?",
      answer: "Yes! Our Business and Enterprise plans include custom domain support. You can connect your own domain, verify ownership via DNS, and use branded short links like yourdomain.com/yourlink.",
    },
    {
      question: "What analytics do you provide?",
      answer: "We provide comprehensive analytics including total clicks, unique visitors, geographic data, device types, referrers, browser information, and time-series data. You can also track UTM parameters for campaign attribution.",
    },
    {
      question: "Are there any limits on the free plan?",
      answer: "The free plan includes 2 short links and 2 QR codes, which is perfect for getting started. You get basic analytics, real-time tracking, and can create custom back-halves. Upgrade to Pro or higher for more links and advanced features.",
    },
    {
      question: "How secure is my data?",
      answer: "We use enterprise-grade security with Row Level Security (RLS), encrypted data storage, and secure authentication. Your links and analytics data are private and only accessible by you. We never share your data with third parties.",
    },
    {
      question: "Can I export my analytics data?",
      answer: "Yes, you can export your analytics data in various formats. Enterprise plans include API access for programmatic data retrieval and integration with your existing tools.",
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
    <main className="min-h-screen bg-white">
      {/* Navigation - Transparent initially, white when scrolled */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-white/95 backdrop-blur-md border-b border-neutral-border shadow-sm" 
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal flex items-center justify-center shadow-button group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className={cn(
                "text-xl font-bold transition-colors",
                isScrolled 
                  ? "text-neutral-text group-hover:text-electric-sapphire" 
                  : "text-white group-hover:text-white/80"
              )}>
                lunr.to
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/docs"
                className={cn(
                  "text-sm font-medium transition-colors relative group",
                  isScrolled
                    ? "text-neutral-muted hover:text-electric-sapphire"
                    : "text-white/90 hover:text-white"
                )}
              >
                Documentation
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300",
                  isScrolled ? "bg-electric-sapphire" : "bg-white",
                  "group-hover:w-full"
                )}></span>
              </Link>
              <Link
                href="/api-reference"
                className={cn(
                  "text-sm font-medium transition-colors relative group",
                  isScrolled
                    ? "text-neutral-muted hover:text-electric-sapphire"
                    : "text-white/90 hover:text-white"
                )}
              >
                API Reference
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300",
                  isScrolled ? "bg-electric-sapphire" : "bg-white",
                  "group-hover:w-full"
                )}></span>
              </Link>
              <Link
                href="/login"
                className={cn(
                  "text-sm font-medium transition-colors relative group",
                  isScrolled
                    ? "text-neutral-muted hover:text-electric-sapphire"
                    : "text-white/90 hover:text-white"
                )}
              >
                Sign In
                <span className={cn(
                  "absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300",
                  isScrolled ? "bg-electric-sapphire" : "bg-white",
                  "group-hover:w-full"
                )}></span>
              </Link>
              <Link
                href="/login"
                className={cn(
                  "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] shadow-button hover:shadow-lg hover:scale-105",
                  isScrolled
                    ? "text-white bg-gradient-to-r from-electric-sapphire to-bright-indigo hover:from-bright-indigo hover:to-vivid-royal"
                    : "text-electric-sapphire bg-white hover:bg-white/90"
                )}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Two Column with Playful Elements */}
      <section className="relative overflow-hidden bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal pt-32 pb-24 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40">
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
        
        {/* Floating sparkles - Similar to CTA */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.6 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
        
        {/* Orbiting elements - Similar to CTA */}
        <div className="absolute top-1/4 right-20 w-32 h-32 border-2 border-white/10 rounded-full animate-orbit"></div>
        <div className="absolute bottom-1/4 left-20 w-24 h-24 border-2 border-white/10 rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="relative">
              {/* Floating decorative element */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-electric-sapphire/10 rounded-full blur-xl animate-pulse hidden lg:block"></div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold mb-6 animate-fade-in">
                <Star className="h-4 w-4 fill-white animate-spin-slow" />
                <span>Link Infrastructure Platform</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
              Link Infrastructure
              <br />
                <span className="text-white">
                  for Modern Campaigns
              </span>
            </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed animate-fade-in-up delay-100">
                Complete link infrastructure platform: URL shortening, QR codes, campaign management, and developer APIs. Build, track, and scale your link strategy with enterprise-grade tools.
            </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up delay-200">
              <Link
                href="/login"
                className={cn(
                    "px-8 py-4 rounded-xl font-semibold text-electric-sapphire text-lg",
                    "bg-white hover:bg-neutral-bg hover:scale-105",
                    "transition-all active:scale-[0.98] shadow-2xl hover:shadow-3xl",
                    "flex items-center justify-center gap-2 group relative overflow-hidden"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
                <button className="px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2 group hover:scale-105 backdrop-blur-sm">
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
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-electric-sapphire/10 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-bright-indigo/10 rounded-full blur-2xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-500 delay-100"></div>
              
              <div className="relative bg-gradient-to-br from-electric-sapphire/10 via-bright-indigo/10 to-vivid-royal/10 rounded-3xl p-8 border border-electric-sapphire/20 shadow-2xl group-hover:shadow-3xl group-hover:rotate-1 transition-all duration-300">
                {/* Mock Dashboard Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire to-bright-indigo flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                      <span className="text-white font-bold">L</span>
                    </div>
                    <div>
                      <div className="h-3 w-24 bg-neutral-border rounded mb-2 group-hover:bg-gradient-to-r group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 transition-all duration-300"></div>
                      <div className="h-2 w-16 bg-neutral-border rounded group-hover:bg-gradient-to-r group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 transition-all duration-300"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-gradient-to-r from-electric-sapphire/20 to-bright-indigo/20 rounded group-hover:from-electric-sapphire/30 group-hover:to-bright-indigo/30 transition-all duration-300"></div>
                    <div className="h-4 w-3/4 bg-gradient-to-r from-electric-sapphire/20 to-bright-indigo/20 rounded group-hover:from-electric-sapphire/30 group-hover:to-bright-indigo/30 transition-all duration-300"></div>
                    <div className="h-4 w-5/6 bg-gradient-to-r from-electric-sapphire/20 to-bright-indigo/20 rounded group-hover:from-electric-sapphire/30 group-hover:to-bright-indigo/30 transition-all duration-300"></div>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-neutral-bg rounded-xl group-hover:bg-gradient-to-br group-hover:from-electric-sapphire/10 group-hover:to-bright-indigo/10 group-hover:scale-110 transition-all duration-300">
                      <div className="h-8 w-8 bg-electric-sapphire/20 rounded-lg mx-auto mb-2 group-hover:rotate-6 transition-transform duration-300"></div>
                      <div className="h-2 w-12 bg-neutral-border rounded mx-auto"></div>
                    </div>
                    <div className="text-center p-4 bg-neutral-bg rounded-xl group-hover:bg-gradient-to-br group-hover:from-bright-indigo/10 group-hover:to-vivid-royal/10 group-hover:scale-110 transition-all duration-300">
                      <div className="h-8 w-8 bg-bright-indigo/20 rounded-lg mx-auto mb-2 group-hover:-rotate-6 transition-transform duration-300"></div>
                      <div className="h-2 w-12 bg-neutral-border rounded mx-auto"></div>
                    </div>
                    <div className="text-center p-4 bg-neutral-bg rounded-xl group-hover:bg-gradient-to-br group-hover:from-vivid-royal/10 group-hover:to-neon-pink/10 group-hover:scale-110 transition-all duration-300">
                      <div className="h-8 w-8 bg-vivid-royal/20 rounded-lg mx-auto mb-2 group-hover:rotate-6 transition-transform duration-300"></div>
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
      <section className="py-24 bg-white relative overflow-hidden">
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
          <div className="absolute top-1/4 right-20 w-32 h-32 border-2 border-electric-sapphire/10 rounded-full animate-orbit"></div>
          <div className="absolute bottom-1/4 left-20 w-24 h-24 border-2 border-bright-indigo/10 rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
              <Sparkles className="h-3 w-3" />
              <span>FEATURES</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Complete Link{" "}
              <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
                <Link2 className="h-3 w-3 animate-pulse" />
                <span>LINK SHORTENING</span>
              </div>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                URL Shortening{" "}
                <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
                  Infrastructure
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Enterprise-grade URL shortening infrastructure. Create branded short links at scale with custom domains, expiration controls, and programmatic access via API.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-electric-sapphire/10 group-hover:bg-electric-sapphire/20 transition-colors">
                    <Check className="h-4 w-4 text-electric-sapphire" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Custom back-halves for branded links</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-electric-sapphire/10 group-hover:bg-electric-sapphire/20 transition-colors">
                    <Check className="h-4 w-4 text-electric-sapphire" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Set expiration dates for temporary campaigns</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-electric-sapphire/10 group-hover:bg-electric-sapphire/20 transition-colors">
                    <Check className="h-4 w-4 text-electric-sapphire" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Password protection for sensitive links</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-bright-indigo/20 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-500"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-electric-sapphire/20 rounded-full blur-xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-500 delay-100"></div>
              
              <div className="relative bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 rounded-3xl p-8 border border-electric-sapphire/20 group-hover:border-electric-sapphire/40 transition-all duration-300 group-hover:shadow-2xl group-hover:-rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="space-y-4">
                    <div className="p-4 bg-neutral-bg rounded-xl group-hover:bg-gradient-to-r group-hover:from-electric-sapphire/5 group-hover:to-bright-indigo/5 transition-all duration-300 group-hover:border group-hover:border-electric-sapphire/20">
                      <div className="text-xs text-neutral-muted mb-2 flex items-center gap-1">
                        <span>Original URL</span>
                        <div className="w-1 h-1 bg-electric-sapphire rounded-full animate-pulse"></div>
                      </div>
                      <div className="text-sm font-mono text-neutral-text break-all group-hover:text-electric-sapphire transition-colors">
                        https://example.com/very/long/url/path/that/needs/shortening
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="p-2 rounded-full bg-electric-sapphire/10 group-hover:bg-electric-sapphire/20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                        <ArrowRight className="h-6 w-6 text-electric-sapphire group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 rounded-xl border border-electric-sapphire/20 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-electric-sapphire/0 via-electric-sapphire/10 to-electric-sapphire/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="text-xs text-neutral-muted mb-2 relative z-10">Shortened Link</div>
                      <div className="text-lg font-mono font-bold text-electric-sapphire relative z-10 group-hover:scale-105 transition-transform duration-300 inline-block">
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
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-bright-indigo/20 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-vivid-royal/20 rounded-full blur-xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-700 delay-100"></div>
              
              <div className="relative bg-gradient-to-br from-bright-indigo/10 to-vivid-royal/10 rounded-3xl p-8 border border-bright-indigo/20 group-hover:border-bright-indigo/40 transition-all duration-300 group-hover:shadow-2xl group-hover:rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="text-center mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-electric-sapphire/20 to-bright-indigo/20 rounded-2xl mx-auto flex items-center justify-center mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 relative">
                      <QrCode className="h-16 w-16 text-electric-sapphire relative z-10" />
                      <div className="absolute inset-0 bg-electric-sapphire/20 rounded-2xl blur-xl group-hover:blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                    </div>
                    <div className="text-sm text-neutral-muted group-hover:text-bright-indigo transition-colors flex items-center justify-center gap-1">
                      <span>Scan to visit</span>
                      <div className="w-1 h-1 bg-bright-indigo rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-neutral-bg rounded-lg group-hover:bg-gradient-to-br group-hover:from-electric-sapphire/10 group-hover:to-bright-indigo/10 group-hover:scale-110 transition-all duration-300">
                      <div className="text-xs text-neutral-muted mb-1">Downloads</div>
                      <div className="text-lg font-bold text-neutral-text group-hover:text-electric-sapphire group-hover:animate-bounce transition-colors">1.2K</div>
                    </div>
                    <div className="text-center p-3 bg-neutral-bg rounded-lg group-hover:bg-gradient-to-br group-hover:from-bright-indigo/10 group-hover:to-vivid-royal/10 group-hover:scale-110 transition-all duration-300">
                      <div className="text-xs text-neutral-muted mb-1">Scans</div>
                      <div className="text-lg font-bold text-neutral-text group-hover:text-bright-indigo group-hover:animate-bounce transition-colors">856</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative z-10 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bright-indigo/10 text-bright-indigo text-xs font-semibold mb-4">
                <QrCode className="h-3 w-3 animate-pulse" />
                <span>QR CODE GENERATION</span>
              </div>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                QR Code{" "}
                <span className="bg-gradient-to-r from-bright-indigo to-vivid-royal bg-clip-text text-transparent">
                  Infrastructure
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Generate QR codes programmatically for any link. Perfect infrastructure for offline campaigns, print materials, and physical-to-digital bridge strategies.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-bright-indigo/10 group-hover:bg-bright-indigo/20 group-hover:rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-bright-indigo" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">High-resolution QR codes in multiple formats</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-bright-indigo/10 group-hover:bg-bright-indigo/20 group-hover:rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-bright-indigo" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Track QR code scans separately from link clicks</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-bright-indigo/10 group-hover:bg-bright-indigo/20 group-hover:rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-bright-indigo" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Customizable styling to match your brand</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 - Two Column with Visual on Right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vivid-royal/10 text-vivid-royal text-xs font-semibold mb-4">
                <BarChart3 className="h-3 w-3 animate-pulse" />
                <span>ANALYTICS</span>
              </div>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                Understand your{" "}
                <span className="bg-gradient-to-r from-vivid-royal to-neon-pink bg-clip-text text-transparent">
                  audience
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Get deep insights into how your links perform. Track clicks in real-time, understand where your traffic comes from, and make data-driven decisions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-vivid-royal/10 group-hover:bg-vivid-royal/20 group-hover:-rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-vivid-royal" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Real-time click tracking and analytics</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-vivid-royal/10 group-hover:bg-vivid-royal/20 group-hover:-rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-vivid-royal" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Geographic data and device breakdowns</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-vivid-royal/10 group-hover:bg-vivid-royal/20 group-hover:-rotate-12 transition-all duration-300">
                    <Check className="h-4 w-4 text-vivid-royal" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">UTM parameter tracking for campaigns</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-vivid-royal/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-neon-pink/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-vivid-royal/10 to-neon-pink/10 rounded-3xl p-8 border border-vivid-royal/20 group-hover:border-vivid-royal/40 transition-all duration-300 group-hover:shadow-2xl group-hover:-rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-3 w-24 bg-neutral-border rounded group-hover:bg-gradient-to-r group-hover:from-vivid-royal/20 group-hover:to-neon-pink/20 transition-all duration-300"></div>
                      <div className="h-3 w-16 bg-neutral-border rounded group-hover:bg-gradient-to-r group-hover:from-vivid-royal/20 group-hover:to-neon-pink/20 transition-all duration-300"></div>
                    </div>
                    <div className="h-40 bg-gradient-to-t from-electric-sapphire/20 via-bright-indigo/20 to-vivid-royal/20 rounded-xl group-hover:shadow-lg transition-all duration-300"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 rounded-lg group-hover:bg-electric-sapphire/5 group-hover:scale-110 transition-all duration-300">
                      <div className="text-2xl font-bold text-electric-sapphire mb-1 group-hover:animate-bounce">1.2K</div>
                      <div className="text-xs text-neutral-muted">Total Clicks</div>
                    </div>
                    <div className="text-center p-2 rounded-lg group-hover:bg-bright-indigo/5 group-hover:scale-110 transition-all duration-300">
                      <div className="text-2xl font-bold text-bright-indigo mb-1 group-hover:animate-bounce">856</div>
                      <div className="text-xs text-neutral-muted">Unique</div>
                    </div>
                    <div className="text-center p-2 rounded-lg group-hover:bg-vivid-royal/5 group-hover:scale-110 transition-all duration-300">
                      <div className="text-2xl font-bold text-vivid-royal mb-1 group-hover:animate-bounce">71%</div>
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
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-electric-sapphire/20 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-bright-indigo/20 rounded-full blur-xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-700 delay-100"></div>
              
              <div className="relative bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 rounded-3xl p-8 border border-electric-sapphire/20 group-hover:border-electric-sapphire/40 transition-all duration-300 group-hover:shadow-2xl group-hover:rotate-1">
                <div className="bg-white rounded-2xl p-6 shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                  <div className="mb-4">
                    <div className="h-4 w-32 bg-neutral-border rounded mb-2 group-hover:bg-gradient-to-r group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 transition-all duration-300"></div>
                    <div className="h-4 w-24 bg-neutral-border rounded group-hover:bg-gradient-to-r group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 transition-all duration-300"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 rounded-lg border border-electric-sapphire/20 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <div className="text-sm font-semibold text-neutral-text mb-1">Summer Campaign</div>
                      <div className="text-xs text-neutral-muted">12 links • 2.4K clicks</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-bright-indigo/10 to-vivid-royal/10 rounded-lg border border-bright-indigo/20 group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                      <div className="text-sm font-semibold text-neutral-text mb-1">Product Launch</div>
                      <div className="text-xs text-neutral-muted">8 links • 1.8K clicks</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative z-10 order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
                <Monitor className="h-3 w-3 animate-pulse" />
                <span>CAMPAIGN INFRASTRUCTURE</span>
              </div>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                Campaign Management{" "}
                <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
                  at Scale
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Organize and manage links across multiple campaigns. Track performance, assign UTM parameters, and scale your marketing infrastructure with powerful campaign tools.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-electric-sapphire/10 group-hover:bg-electric-sapphire/20 transition-colors">
                    <Check className="h-4 w-4 text-electric-sapphire" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Organize links into campaign groups</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-electric-sapphire/10 group-hover:bg-electric-sapphire/20 transition-colors">
                    <Check className="h-4 w-4 text-electric-sapphire" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Bulk UTM parameter management</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-electric-sapphire/10 group-hover:bg-electric-sapphire/20 transition-colors">
                    <Check className="h-4 w-4 text-electric-sapphire" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Campaign-level analytics and reporting</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 5 - API Infrastructure */}
          <div className="grid lg:grid-cols-2 gap-16 items-center relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bright-indigo/10 text-bright-indigo text-xs font-semibold mb-4">
                <Zap className="h-3 w-3 animate-pulse" />
                <span>API INFRASTRUCTURE</span>
              </div>
              <h3 className="text-3xl font-bold text-neutral-text mb-4">
                Developer{" "}
                <span className="bg-gradient-to-r from-bright-indigo to-vivid-royal bg-clip-text text-transparent">
                  APIs & Webhooks
                </span>
              </h3>
              <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                Integrate link infrastructure directly into your applications. RESTful APIs for links, QR codes, campaigns, and analytics. Real-time webhooks for event-driven workflows.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-bright-indigo/10 group-hover:bg-bright-indigo/20 transition-colors">
                    <Check className="h-4 w-4 text-bright-indigo" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">RESTful API for all link operations</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-bright-indigo/10 group-hover:bg-bright-indigo/20 transition-colors">
                    <Check className="h-4 w-4 text-bright-indigo" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Real-time webhooks for link events</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="p-1 rounded-lg bg-bright-indigo/10 group-hover:bg-bright-indigo/20 transition-colors">
                    <Check className="h-4 w-4 text-bright-indigo" />
                  </div>
                  <span className="text-neutral-muted group-hover:text-neutral-text transition-colors">Rate limiting and usage analytics</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-bright-indigo/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-vivid-royal/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-bright-indigo/10 to-vivid-royal/10 rounded-3xl p-8 border border-bright-indigo/20 group-hover:border-bright-indigo/40 transition-all duration-300 group-hover:shadow-2xl group-hover:-rotate-1">
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
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bright-indigo/30 to-transparent"></div>
      </section>

      {/* How It Works - Bold Diagonal/Zigzag Layout with Playful Elements */}
      <section className="py-24 bg-neutral-bg relative overflow-hidden">
        {/* Section connector from features */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-bright-indigo/30 to-transparent"></div>
        {/* Animated background with dynamic elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-electric-sapphire/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-bright-indigo/5 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-vivid-royal/3 rounded-full blur-3xl animate-drift"></div>
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
                  className="border-2 border-electric-sapphire/10 rounded-full animate-pulse-glow"
                  style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
                ></div>
              </div>
            );
          })}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4 animate-fade-in">
              <Target className="h-3 w-3 animate-spin-slow" />
              <span>PROCESS</span>
            </div>
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
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-electric-sapphire/10 rounded-full blur-xl animate-pulse hidden lg:block"></div>
            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-bright-indigo/10 rounded-full blur-xl animate-pulse delay-500 hidden lg:block"></div>
            
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              {/* Large Step Number Badge with Playful Animation */}
              <div className="relative flex-shrink-0 group/badge">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-electric-sapphire to-bright-indigo flex items-center justify-center text-white font-bold text-4xl lg:text-5xl shadow-2xl group-hover/badge:scale-125 group-hover/badge:rotate-12 group-hover/badge:animate-bounce transition-all duration-500 relative z-20 cursor-pointer">
                  <span className="relative z-10">01</span>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-electric-sapphire/0 via-white/20 to-bright-indigo/0 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 bg-electric-sapphire/30 rounded-3xl blur-2xl group-hover/badge:blur-3xl group-hover/badge:scale-150 transition-all duration-500 animate-pulse"></div>
                {/* Sparkle effect */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-electric-sapphire rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-bright-indigo rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping delay-200"></div>
              </div>
              
              {/* Content Card */}
              <div className="flex-1 bg-white rounded-3xl border-2 border-neutral-border p-8 lg:p-10 shadow-xl hover:shadow-2xl hover:border-electric-sapphire/50 transition-all duration-300 group/card relative overflow-hidden hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 rounded-bl-full group-hover/card:scale-125 transition-transform duration-500"></div>
                {/* Floating corner decoration */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-electric-sapphire/10 rounded-full blur-sm opacity-0 group-hover/card:opacity-100 group-hover/card:animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4 group-hover/card:bg-electric-sapphire/20 transition-colors">
                    <Link2 className="h-3 w-3 animate-pulse group-hover/card:rotate-12 transition-transform" />
                    <span>STEP 1</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-neutral-text mb-4 group-hover/card:text-electric-sapphire transition-colors">
                    Create your{" "}
                    <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
                      first link
                    </span>
                  </h3>
                  <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                    Sign up in seconds and start shortening links immediately. No complex setup, no learning curve—just paste your URL and get a short, shareable link.
                  </p>
                  
                  {/* Interactive Visual */}
                  <div className="bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 rounded-2xl p-6 border border-electric-sapphire/20 group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-electric-sapphire/0 via-electric-sapphire/10 to-electric-sapphire/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="space-y-3 relative z-10">
                      <div className="p-4 bg-white rounded-xl group-hover/card:bg-gradient-to-r group-hover/card:from-electric-sapphire/5 group-hover/card:to-bright-indigo/5 transition-all duration-300">
                        <div className="text-xs text-neutral-muted mb-1 flex items-center gap-1">
                          <span>Paste your URL</span>
                          <div className="w-1 h-1 bg-electric-sapphire rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-sm font-mono text-neutral-text group-hover/card:text-electric-sapphire transition-colors">https://example.com/very/long/url</div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="p-2 rounded-full bg-electric-sapphire/10 group-hover/card:bg-electric-sapphire/20 group-hover/card:rotate-12 group-hover/card:scale-110 transition-all duration-300">
                          <ArrowRight className="h-6 w-6 text-electric-sapphire group-hover/card:translate-x-2 transition-transform" />
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-electric-sapphire/20 to-bright-indigo/20 rounded-xl group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300">
                        <div className="text-xs text-neutral-muted mb-1">Get your short link</div>
                        <div className="text-lg font-mono font-bold text-electric-sapphire group-hover/card:animate-pulse">lunr.to/abc123</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated Connecting Arrow */}
            <div className="hidden lg:block absolute left-16 top-full mt-8 w-0.5 h-16 bg-gradient-to-b from-electric-sapphire to-bright-indigo group-hover:scale-y-150 transition-transform duration-500"></div>
            <div className="hidden lg:block absolute left-16 top-full mt-20 w-16 h-0.5 bg-gradient-to-r from-bright-indigo to-vivid-royal group-hover:scale-x-150 transition-transform duration-500">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-vivid-royal rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Step 2 - Large Right Card (Reversed) with Playful Elements */}
          <div className="relative mb-32 lg:ml-32 group">
            {/* Floating decorative blobs */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-bright-indigo/10 rounded-full blur-xl animate-pulse delay-300 hidden lg:block"></div>
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-vivid-royal/10 rounded-full blur-xl animate-pulse delay-700 hidden lg:block"></div>
            
            <div className="flex flex-col lg:flex-row-reverse items-start gap-8 lg:gap-12">
              {/* Large Step Number Badge with Playful Animation */}
              <div className="relative flex-shrink-0 group/badge">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-bright-indigo to-vivid-royal flex items-center justify-center text-white font-bold text-4xl lg:text-5xl shadow-2xl group-hover/badge:scale-125 group-hover/badge:-rotate-12 group-hover/badge:animate-bounce transition-all duration-500 relative z-20 cursor-pointer">
                  <span className="relative z-10">02</span>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-bright-indigo/0 via-white/20 to-vivid-royal/0 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 bg-bright-indigo/30 rounded-3xl blur-2xl group-hover/badge:blur-3xl group-hover/badge:scale-150 transition-all duration-500 animate-pulse"></div>
                {/* Sparkle effect */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-bright-indigo rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping"></div>
                <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-vivid-royal rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping delay-200"></div>
              </div>
              
              {/* Content Card */}
              <div className="flex-1 bg-white rounded-3xl border-2 border-neutral-border p-8 lg:p-10 shadow-xl hover:shadow-2xl hover:border-bright-indigo/50 transition-all duration-300 group/card relative overflow-hidden hover:-translate-y-2">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-bright-indigo/10 to-vivid-royal/10 rounded-br-full group-hover/card:scale-125 transition-transform duration-500"></div>
                {/* Floating corner decoration */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-bright-indigo/10 rounded-full blur-sm opacity-0 group-hover/card:opacity-100 group-hover/card:animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bright-indigo/10 text-bright-indigo text-xs font-semibold mb-4 group-hover/card:bg-bright-indigo/20 transition-colors">
                    <QrCode className="h-3 w-3 animate-pulse group-hover/card:-rotate-12 transition-transform" />
                    <span>STEP 2</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-neutral-text mb-4 group-hover/card:text-bright-indigo transition-colors">
                    Enhance and{" "}
                    <span className="bg-gradient-to-r from-bright-indigo to-vivid-royal bg-clip-text text-transparent">
                      customize
                    </span>
                  </h3>
                  <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                    Take your links to the next level. Generate QR codes, create beautiful landing pages, organize into campaigns, and customize everything to match your brand.
                  </p>
                  
                  {/* Interactive Visual */}
                  <div className="bg-gradient-to-br from-bright-indigo/10 to-vivid-royal/10 rounded-2xl p-6 border border-bright-indigo/20 group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-bright-indigo/0 via-bright-indigo/10 to-vivid-royal/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
                      <div className="p-4 bg-white rounded-xl text-center group-hover/card:bg-gradient-to-br group-hover/card:from-electric-sapphire/10 group-hover/card:to-bright-indigo/10 group-hover/card:scale-110 group-hover/card:rotate-3 transition-all duration-300">
                        <div className="group-hover/card:rotate-6 transition-transform duration-300">
                          <QrCode className="h-8 w-8 text-electric-sapphire mx-auto mb-2" />
                        </div>
                        <div className="text-xs text-neutral-muted">QR Code</div>
                      </div>
                      <div className="p-4 bg-white rounded-xl text-center group-hover/card:bg-gradient-to-br group-hover/card:from-bright-indigo/10 group-hover/card:to-vivid-royal/10 group-hover/card:scale-110 group-hover/card:-rotate-3 transition-all duration-300">
                        <div className="group-hover/card:-rotate-6 transition-transform duration-300">
                          <FileText className="h-8 w-8 text-bright-indigo mx-auto mb-2" />
                        </div>
                        <div className="text-xs text-neutral-muted">Landing Page</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-electric-sapphire/20 to-bright-indigo/20 rounded-xl group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative z-10">
                      <div className="text-xs text-neutral-muted mb-1">Campaign</div>
                      <div className="text-sm font-semibold text-neutral-text group-hover/card:text-bright-indigo transition-colors">Summer Sale 2024</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated Connecting Arrow */}
            <div className="hidden lg:block absolute right-16 top-full mt-8 w-0.5 h-16 bg-gradient-to-b from-vivid-royal to-neon-pink group-hover:scale-y-150 transition-transform duration-500"></div>
            <div className="hidden lg:block absolute right-16 top-full mt-20 w-16 h-0.5 bg-gradient-to-l from-vivid-royal to-neon-pink group-hover:scale-x-150 transition-transform duration-500">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-neon-pink rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Step 3 - Large Left Card with Playful Elements */}
          <div className="relative group">
            {/* Floating decorative blobs */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-vivid-royal/10 rounded-full blur-xl animate-pulse delay-500 hidden lg:block"></div>
            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-neon-pink/10 rounded-full blur-xl animate-pulse delay-1000 hidden lg:block"></div>
            
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              {/* Large Step Number Badge with Playful Animation */}
              <div className="relative flex-shrink-0 group/badge">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-gradient-to-br from-vivid-royal to-neon-pink flex items-center justify-center text-white font-bold text-4xl lg:text-5xl shadow-2xl group-hover/badge:scale-125 group-hover/badge:rotate-12 group-hover/badge:animate-bounce transition-all duration-500 relative z-20 cursor-pointer">
                  <span className="relative z-10">03</span>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-vivid-royal/0 via-white/20 to-neon-pink/0 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute inset-0 bg-vivid-royal/30 rounded-3xl blur-2xl group-hover/badge:blur-3xl group-hover/badge:scale-150 transition-all duration-500 animate-pulse"></div>
                {/* Sparkle effect */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-vivid-royal rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-neon-pink rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:animate-ping delay-200"></div>
              </div>
              
              {/* Content Card */}
              <div className="flex-1 bg-white rounded-3xl border-2 border-neutral-border p-8 lg:p-10 shadow-xl hover:shadow-2xl hover:border-vivid-royal/50 transition-all duration-300 group/card relative overflow-hidden hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-vivid-royal/10 to-neon-pink/10 rounded-bl-full group-hover/card:scale-125 transition-transform duration-500"></div>
                {/* Floating corner decoration */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-vivid-royal/10 rounded-full blur-sm opacity-0 group-hover/card:opacity-100 group-hover/card:animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vivid-royal/10 text-vivid-royal text-xs font-semibold mb-4 group-hover/card:bg-vivid-royal/20 transition-colors">
                    <BarChart3 className="h-3 w-3 animate-pulse group-hover/card:rotate-12 transition-transform" />
                    <span>STEP 3</span>
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-neutral-text mb-4 group-hover/card:text-vivid-royal transition-colors">
                    Analyze and{" "}
                    <span className="bg-gradient-to-r from-vivid-royal to-neon-pink bg-clip-text text-transparent">
                      optimize
                    </span>
                  </h3>
                  <p className="text-lg text-neutral-muted mb-6 leading-relaxed">
                    Watch your links perform in real-time. Track clicks, understand your audience, measure campaign success, and optimize your strategy with powerful analytics.
                  </p>
                  
                  {/* Interactive Visual */}
                  <div className="bg-gradient-to-br from-vivid-royal/10 to-neon-pink/10 rounded-2xl p-6 border border-vivid-royal/20 group-hover/card:shadow-lg group-hover/card:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-vivid-royal/0 via-vivid-royal/10 to-neon-pink/0 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="mb-4 relative z-10">
                      <div className="h-32 bg-gradient-to-t from-electric-sapphire/20 via-bright-indigo/20 to-vivid-royal/20 rounded-xl group-hover/card:shadow-lg transition-all duration-300"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 relative z-10">
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-electric-sapphire/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300">
                        <div className="text-lg font-bold text-electric-sapphire">1.2K</div>
                        <div className="text-xs text-neutral-muted">Clicks</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-bright-indigo/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300 delay-100">
                        <div className="text-lg font-bold text-bright-indigo">856</div>
                        <div className="text-xs text-neutral-muted">Unique</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-vivid-royal/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300 delay-200">
                        <div className="text-lg font-bold text-vivid-royal">12</div>
                        <div className="text-xs text-neutral-muted">Countries</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg group-hover/card:bg-neon-pink/5 group-hover/card:scale-110 group-hover/card:animate-bounce transition-all duration-300 delay-300">
                        <div className="text-lg font-bold text-neon-pink">71%</div>
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
          <div className="absolute top-1/4 right-10 w-40 h-40 border-2 border-electric-sapphire/5 rounded-full animate-float"></div>
          <div className="absolute bottom-1/4 left-10 w-32 h-32 border-2 border-bright-indigo/5 rounded-full animate-float-reverse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
              <Users className="h-3 w-3" />
              <span>USE CASES</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Perfect for every{" "}
              <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
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
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-electric-sapphire/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="bg-white rounded-2xl border-2 border-neutral-border p-8 shadow-lg hover:shadow-2xl hover:border-electric-sapphire/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 rounded-bl-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-sapphire to-bright-indigo flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative">
                      <Users className="h-10 w-10 text-white relative z-10" />
                      <div className="absolute inset-0 bg-electric-sapphire/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-neutral-text mb-3 group-hover:text-electric-sapphire transition-colors">
                      Content Creators
                    </h3>
                    <p className="text-neutral-muted mb-4 leading-relaxed">
                      Share links across platforms, track engagement, and grow your audience with detailed analytics.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["Social media links", "Bio link pages", "Click tracking", "QR codes"].map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-electric-sapphire/10 text-electric-sapphire rounded-full text-sm font-medium group-hover:bg-electric-sapphire/20 group-hover:scale-110 transition-all duration-300"
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
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-bright-indigo/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="bg-white rounded-2xl border-2 border-neutral-border p-8 shadow-lg hover:shadow-2xl hover:border-bright-indigo/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-bright-indigo/10 to-vivid-royal/10 rounded-br-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-bright-indigo to-vivid-royal flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500 relative">
                      <Building2 className="h-10 w-10 text-white relative z-10" />
                      <div className="absolute inset-0 bg-bright-indigo/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-2xl font-bold text-neutral-text mb-3 group-hover:text-bright-indigo transition-colors">
                      Marketing Teams
                    </h3>
                    <p className="text-neutral-muted mb-4 leading-relaxed">
                      Manage campaigns, track UTM parameters, measure ROI, and optimize your marketing efforts.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                      {["Campaign management", "UTM tracking", "A/B testing", "Custom domains"].map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-bright-indigo/10 text-bright-indigo rounded-full text-sm font-medium group-hover:bg-bright-indigo/20 group-hover:scale-110 transition-all duration-300"
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

            {/* Card 3 - Left Aligned with Playful Elements */}
            <div className="group relative md:w-5/6">
              {/* Floating decorative blob */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-vivid-royal/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="bg-white rounded-2xl border-2 border-neutral-border p-8 shadow-lg hover:shadow-2xl hover:border-vivid-royal/50 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-vivid-royal/10 to-neon-pink/10 rounded-bl-full group-hover:scale-125 transition-transform duration-500"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-vivid-royal to-neon-pink flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative">
                      <Crown className="h-10 w-10 text-white relative z-10" />
                      <div className="absolute inset-0 bg-vivid-royal/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-neutral-text mb-3 group-hover:text-vivid-royal transition-colors">
                      Enterprises
                    </h3>
                    <p className="text-neutral-muted mb-4 leading-relaxed">
                      Enterprise-grade features with API access, team collaboration, priority support, and unlimited resources.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {["API access", "Team collaboration", "Priority support", "Unlimited resources"].map((feature, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-vivid-royal/10 text-vivid-royal rounded-full text-sm font-medium group-hover:bg-vivid-royal/20 group-hover:scale-110 transition-all duration-300"
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-sapphire to-bright-indigo flex items-center justify-center text-white font-semibold text-sm">
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
      <section className="py-24 bg-gradient-to-b from-neutral-bg via-white to-neutral-bg relative overflow-hidden">
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
          <div className="absolute top-20 right-20 w-24 h-24 border border-electric-sapphire/10 rounded-full animate-orbit"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 border border-bright-indigo/10 rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '18s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
              <Shield className="h-3 w-3" />
              <span>SECURITY</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Enterprise-grade{" "}
              <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
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
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-electric-sapphire via-bright-indigo to-vivid-royal group-hover:h-3 transition-all duration-300"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-electric-sapphire/10 rounded-full blur-2xl group-hover:scale-150 group-hover:animate-pulse transition-transform duration-500"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-bright-indigo/10 rounded-full blur-2xl group-hover:scale-125 group-hover:animate-pulse transition-transform duration-500 delay-100"></div>
              
              <div className="relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center group/item relative">
                    {/* Floating element */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-electric-sapphire/10 rounded-full blur-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-sapphire/20 to-bright-indigo/20 mb-4 group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-500 relative">
                      <Shield className="h-8 w-8 text-electric-sapphire relative z-10" />
                      <div className="absolute inset-0 bg-electric-sapphire/20 rounded-2xl blur-xl group-hover/item:blur-2xl group-hover/item:scale-150 transition-all duration-500"></div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-text mb-2 group-hover/item:text-electric-sapphire transition-colors">Row Level Security</h3>
                    <p className="text-sm text-neutral-muted leading-relaxed">
                      Advanced database security ensuring your data is only accessible by you.
                    </p>
                  </div>
                  
                  <div className="text-center group/item relative">
                    {/* Floating element */}
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-bright-indigo/10 rounded-full blur-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-bright-indigo/20 to-vivid-royal/20 mb-4 group-hover/item:scale-125 group-hover/item:-rotate-12 transition-all duration-500 relative">
                      <Lock className="h-8 w-8 text-bright-indigo relative z-10" />
                      <div className="absolute inset-0 bg-bright-indigo/20 rounded-2xl blur-xl group-hover/item:blur-2xl group-hover/item:scale-150 transition-all duration-500"></div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-text mb-2 group-hover/item:text-bright-indigo transition-colors">Encrypted Storage</h3>
                    <p className="text-sm text-neutral-muted leading-relaxed">
                      All data is encrypted at rest and in transit using industry-standard encryption.
                    </p>
                  </div>
                  
                  <div className="text-center group/item relative">
                    {/* Floating element */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-vivid-royal/10 rounded-full blur-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-vivid-royal/20 to-neon-pink/20 mb-4 group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-500 relative">
                      <Award className="h-8 w-8 text-vivid-royal relative z-10" />
                      <div className="absolute inset-0 bg-vivid-royal/20 rounded-2xl blur-xl group-hover/item:blur-2xl group-hover/item:scale-150 transition-all duration-500"></div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-text mb-2 group-hover/item:text-vivid-royal transition-colors">99.9% Uptime SLA</h3>
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
                <integration.icon className="h-6 w-6 text-electric-sapphire" />
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
          <div className="absolute top-20 left-10 w-64 h-64 bg-electric-sapphire/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-bright-indigo/5 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-vivid-royal/3 rounded-full blur-3xl animate-drift"></div>
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
              className="absolute w-16 h-16 border-2 border-electric-sapphire/10 rounded-full animate-float"
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
              <TrendingUp className="h-3 w-3" />
              <span>PRICING</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Simple, Transparent{" "}
              <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-xl text-neutral-muted mb-8">
              Start free, upgrade when you need more
            </p>
            <div className="inline-flex items-center gap-2 p-1.5 bg-neutral-bg rounded-2xl border-2 border-neutral-border shadow-lg">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  billingCycle === "monthly"
                    ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                    : "text-neutral-muted hover:text-neutral-text"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all relative",
                  billingCycle === "yearly"
                    ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                    : "text-neutral-muted hover:text-neutral-text"
                )}
              >
                Yearly
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white shadow-lg animate-bounce">
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
                "Custom Domains",
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
                "Custom Domains",
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
      <section className="py-24 bg-gradient-to-b from-neutral-bg to-white relative overflow-hidden">
        {/* Playful background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-electric-sapphire/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-bright-indigo/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-sapphire/10 text-electric-sapphire text-xs font-semibold mb-4">
              <HelpCircle className="h-3 w-3" />
              <span>FAQ</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-text mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-electric-sapphire to-bright-indigo bg-clip-text text-transparent">
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
                className="bg-white rounded-2xl border-2 border-neutral-border overflow-hidden hover:border-electric-sapphire/50 hover:shadow-xl transition-all duration-300 group relative"
              >
                {/* Playful corner decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-electric-sapphire/5 to-bright-indigo/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-start justify-between text-left hover:bg-gradient-to-r hover:from-electric-sapphire/5 hover:to-bright-indigo/5 transition-all gap-4 relative z-10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-electric-sapphire/10 flex items-center justify-center flex-shrink-0 group-hover:bg-electric-sapphire/20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                        <HelpCircle className="h-4 w-4 text-electric-sapphire" />
                      </div>
                      <span className="font-semibold text-neutral-text group-hover:text-electric-sapphire transition-colors text-left">
                        {faq.question}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {openFaq === idx ? (
                      <div className="p-1 rounded-lg bg-electric-sapphire/10">
                        <ChevronUp className="h-5 w-5 text-electric-sapphire transition-transform rotate-180" />
                      </div>
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-muted group-hover:text-electric-sapphire group-hover:scale-110 transition-all duration-300" />
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
      <section className="py-24 bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal relative overflow-hidden">
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
        
        {/* Floating sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                opacity: 0.6 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
        
        {/* Orbiting elements */}
        <div className="absolute top-1/4 right-20 w-32 h-32 border-2 border-white/10 rounded-full animate-orbit"></div>
        <div className="absolute bottom-1/4 left-20 w-24 h-24 border-2 border-white/10 rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Join thousands of users</span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Build Your Link Infrastructure
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start with URL shortening, add QR codes, manage campaigns, and scale with APIs. Enterprise-grade infrastructure, simple pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className={cn(
                "inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-semibold text-electric-sapphire text-lg",
                "bg-white hover:bg-neutral-bg hover:scale-105",
                "transition-all active:scale-[0.98] shadow-2xl hover:shadow-3xl group relative overflow-hidden"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
            Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-electric-sapphire/10 to-bright-indigo/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/docs"
              className={cn(
                "inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-semibold text-white text-lg",
                "border-2 border-white/30 hover:border-white/50 hover:bg-white/10",
                "transition-all active:scale-[0.98] backdrop-blur-sm"
              )}
            >
              View Documentation
          </Link>
          </div>
          <p className="mt-8 text-sm text-white/80">
            ✨ No credit card required • 2 free links • 2 free QR codes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-border bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire via-bright-indigo to-vivid-royal flex items-center justify-center shadow-button">
                  <span className="text-white font-bold text-lg">L</span>
              </div>
                <span className="text-lg font-bold text-neutral-text">lunr.to</span>
            </div>
              <p className="text-sm text-neutral-muted">
                The all-in-one link management platform for professionals and businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-text mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-muted">
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/billing" className="hover:text-electric-sapphire transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-electric-sapphire transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-text mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-muted">
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-text mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-muted">
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                Privacy Policy
              </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                Terms of Service
              </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    Security
              </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-electric-sapphire transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-border text-center text-sm text-neutral-muted">
            <p>© 2024 lunr.to. All rights reserved. Built with Next.js and Supabase.</p>
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
    <div className="group p-6 rounded-card bg-white border border-neutral-border hover:border-electric-sapphire/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br transition-opacity duration-300", color)}></div>
      
      <div className={cn("p-3 rounded-xl w-fit mb-4 bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-text mb-2 group-hover:text-electric-sapphire transition-colors">{title}</h3>
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
    <div className="group p-6 rounded-card bg-white border border-neutral-border hover:border-electric-sapphire/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-electric-sapphire to-bright-indigo transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="p-3 rounded-xl w-fit mb-4 bg-gradient-to-br from-electric-sapphire to-bright-indigo group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
          <Icon className="h-6 w-6 text-white" />
      </div>
        <h3 className="text-xl font-semibold text-neutral-text mb-2 group-hover:text-electric-sapphire transition-colors">{title}</h3>
        <p className="text-neutral-muted mb-4 leading-relaxed">{description}</p>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-neutral-text group-hover:translate-x-1 transition-transform duration-200" style={{ transitionDelay: `${idx * 50}ms` }}>
              <Check className="h-4 w-4 text-electric-sapphire flex-shrink-0" />
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
    <div className="group p-6 rounded-card bg-white border border-neutral-border hover:border-electric-sapphire/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center relative overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-electric-sapphire to-bright-indigo transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="p-3 rounded-xl w-fit mx-auto mb-4 bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 group-hover:from-electric-sapphire/20 group-hover:to-bright-indigo/20 group-hover:scale-110 transition-all duration-300">
          <Icon className="h-8 w-8 text-electric-sapphire" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-text mb-2 group-hover:text-electric-sapphire transition-colors">{title}</h3>
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

  return (
    <div
      className={cn(
        "p-6 rounded-card border-2 transition-all relative group overflow-hidden",
        highlighted
          ? "border-electric-sapphire bg-gradient-to-br from-electric-sapphire/5 to-bright-indigo/5 ring-2 ring-electric-sapphire/20 hover:ring-4 hover:ring-electric-sapphire/30 hover:shadow-2xl hover:-translate-y-1"
          : "border-neutral-border bg-white hover:border-electric-sapphire/50 hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Gradient overlay on hover */}
      {!highlighted && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br from-electric-sapphire to-bright-indigo transition-opacity duration-300"></div>
      )}
      
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-xs font-semibold shadow-lg animate-pulse">
          Most Popular
        </div>
      )}
      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br from-electric-sapphire to-bright-indigo transition-transform duration-300",
              highlighted ? "group-hover:scale-110 group-hover:rotate-3" : "group-hover:scale-110"
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
          <h3 className="text-2xl font-bold text-neutral-text group-hover:text-electric-sapphire transition-colors">{name}</h3>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-neutral-text">
            {price === 0 ? "Free" : `$${displayPrice.toFixed(2)}`}
          </span>
          {price > 0 && <span className="text-neutral-muted">/{period}</span>}
        </div>
        <p className="text-sm text-neutral-muted">{description}</p>
      </div>
      <ul className="space-y-3 mb-8 relative z-10">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-200" style={{ transitionDelay: `${idx * 30}ms` }}>
            <Check className="h-5 w-5 text-electric-sapphire flex-shrink-0" />
            <span className="text-sm text-neutral-text">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={cn(
          "w-full block text-center px-6 py-3 rounded-xl font-semibold transition-all active:scale-[0.98] relative z-10 group/button",
          highlighted
            ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white hover:from-bright-indigo hover:to-vivid-royal shadow-button hover:shadow-xl hover:scale-105"
            : "bg-neutral-bg text-neutral-text hover:bg-gradient-to-r hover:from-electric-sapphire/10 hover:to-bright-indigo/10 border border-neutral-border hover:border-electric-sapphire/50"
        )}
      >
        <span className="flex items-center justify-center gap-2">
        {highlighted ? "Get Started" : "Start Free"}
          {highlighted && <ArrowRight className="h-4 w-4 group-hover/button:translate-x-1 transition-transform" />}
        </span>
      </Link>
    </div>
  );
}
