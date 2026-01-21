"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, Upload, ChevronDown, ChevronRight, Crown, Calendar, Clock, Sparkles, X, Image as ImageIcon, Download, QrCode, Monitor, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import QRCode from "qrcode";
import { usePlan } from "@/hooks/use-plan";
import { SuccessModal } from "@/components/success-modal";

export function LinkCreationPage({
  userId,
}: {
  userId: string;
}) {
  // Get plan data from Zustand store
  const {
    plan,
    canUseCustomBackHalf,
    canSetExpiration,
    canUseUTMParameters,
    planName,
    planDisplayName,
    isPremium,
    usage,
    refreshUserData,
  } = usePlan();

  const remainingLinks = usage?.remainingLinks === -1 ? Infinity : (usage?.remainingLinks ?? 0);
  const maxLinks = plan?.maxLinks === -1 ? Infinity : (plan?.maxLinks ?? 2);

  // Ensure store is initialized
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const router = useRouter();
  const [mode, setMode] = useState<"configure" | "design">("configure");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [password, setPassword] = useState("");
  const [qrFormat, setQrFormat] = useState<"png" | "svg">("png");
  const [generateQR, setGenerateQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLink, setCreatedLink] = useState<any>(null);
  const [createdQRCode, setCreatedQRCode] = useState<string>("");

  // UTM Parameters State
  const [utmEnabled, setUtmEnabled] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");

  // Campaign selection
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch("/api/campaigns");
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    };
    fetchCampaigns();
  }, []);

  // Collapsible sections
  const [codeDetailsOpen, setCodeDetailsOpen] = useState(true);
  const [sharingOpen, setSharingOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // QR Code Design State
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrSize, setQrSize] = useState("medium");
  const [addLogo, setAddLogo] = useState(false);

  // Branding State
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [linkDescription, setLinkDescription] = useState("");

  // Preview
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewQR, setPreviewQR] = useState("");

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setPreviewImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      setPreviewImageUrl(imageUrl);
      // QR preview will be updated by useEffect when previewImageUrl changes
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setPreviewImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // QR preview will be updated by useEffect when previewImageUrl changes
  };

  // Handle QR code download
  const handleDownloadQR = () => {
    if (!previewQR) return;

    try {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = previewQR;
      link.download = `qr-code-${customCode || "link"}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded");
    } catch (err) {
      console.error("Failed to download QR code:", err);
      toast.error("Failed to download QR code");
    }
  };

  // Function to generate QR code with optional logo
  const generateQRWithLogo = async (
    data: string,
    options: { width: number; color: { dark: string; light: string } },
    logoUrl?: string | null,
    shouldAddLogo: boolean = false,
    format: "png" | "svg" = "png"
  ): Promise<string> => {
    // Use high error correction level ('H') to maintain scannability with logo
    const qrOptions = {
      ...options,
      errorCorrectionLevel: 'H' as const, // High error correction (30% can be obscured)
      margin: 2,
    };

    // Generate QR code in the requested format
    let qrDataUrl: string;
    if (format === "svg") {
      // Generate SVG format
      const svgString = await QRCode.toString(data, {
        type: "svg",
        width: options.width,
        margin: 2,
        color: {
          dark: options.color.dark,
          light: options.color.light,
        },
        errorCorrectionLevel: 'H',
      });
      // Convert SVG to data URL
      qrDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
    } else {
      // Generate PNG format (default)
      qrDataUrl = await QRCode.toDataURL(data, qrOptions);
    }

    // Only add logo if toggle is ON AND logo URL exists
    if (!shouldAddLogo || !logoUrl) {
      // Return base QR code (no logo)
      return qrDataUrl;
    }

    // Create a NEW canvas each time (don't reuse)
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return qrDataUrl; // Fallback to base QR code
    }

    // Set canvas size
    canvas.width = options.width;
    canvas.height = options.width;

    // Return promise that composites logo
    return new Promise((resolve, reject) => {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      
      logoImg.onload = () => {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        
        qrImg.onload = () => {
          // Clear canvas completely
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw QR code
          ctx.drawImage(qrImg, 0, 0);

          // Use smaller logo size (15% instead of 20%) to maintain scannability
          const logoSize = Math.floor(options.width * 0.15);
          const logoX = Math.floor((options.width - logoSize) / 2);
          const logoY = Math.floor((options.width - logoSize) / 2);

          // Draw white background for logo (smaller padding)
          const padding = Math.floor(logoSize * 0.15);
          ctx.fillStyle = options.color.light;
          ctx.fillRect(
            logoX - padding,
            logoY - padding,
            logoSize + padding * 2,
            logoSize + padding * 2
          );

          // Draw logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

          resolve(canvas.toDataURL());
        };
        
        qrImg.onerror = () => resolve(qrDataUrl); // Fallback
        qrImg.src = qrDataUrl;
      };
      
      logoImg.onerror = () => resolve(qrDataUrl); // Fallback
      logoImg.src = logoUrl;
    });
  };

  // Function to update QR preview
  const updateQRPreview = async () => {
    if (!url) return;

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shortCode = customCode || "example";
    const qrUrl = `${baseUrl}/${shortCode}`;

    try {
        const qrData = await generateQRWithLogo(
          qrUrl,
          {
            width: 200,
            color: { dark: qrColor, light: qrBgColor },
          },
          previewImageUrl || null,
          addLogo, // Explicitly pass whether to add logo
          qrFormat
        );
      setPreviewQR(qrData);
    } catch (err) {
      console.error("Failed to generate QR preview:", err);
    }
  };

  // Update QR preview when logo settings change (only if generateQR is enabled)
  useEffect(() => {
    if (!url || !generateQR) {
      setPreviewQR("");
      return;
    }

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shortCode = customCode || "example";
    const qrUrl = `${baseUrl}/${shortCode}`;
    setPreviewUrl(qrUrl);

    // Generate QR code with current settings
    const generateQRCode = async () => {
      try {
        // Clear any previous QR code first to avoid caching issues
        setPreviewQR("");
        
        const qrData = await generateQRWithLogo(
          qrUrl,
          {
            width: 200,
            color: { dark: qrColor, light: qrBgColor },
          },
          previewImageUrl || null,
          addLogo, // Only add logo if toggle is ON
          qrFormat
        );
        setPreviewQR(qrData);
      } catch (err) {
        console.error("Failed to generate QR preview:", err);
      }
    };

    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLogo, previewImageUrl, qrColor, qrBgColor, customCode, url, generateQR]);

  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    if (newUrl) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const shortCode = customCode || "example";
      setPreviewUrl(`${baseUrl}/${shortCode}`);
      await updateQRPreview();
    }
  };

  const handleCustomCodeChange = async (newCode: string) => {
    setCustomCode(newCode);
    // QR preview will be updated by useEffect when customCode changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
          original_url: url,
          short_code: customCode || undefined,
          expires_at: expiresAt || null,
          title: title || undefined,
          campaign_id: selectedCampaignId || undefined,
          utm_parameters: utmEnabled && canUseUTMParameters() && (utmSource || utmMedium) ? {
            utm_source: utmSource || undefined,
            utm_medium: utmMedium || undefined,
            utm_campaign: utmCampaign || undefined,
            utm_term: utmTerm || undefined,
            utm_content: utmContent || undefined,
          } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create link");
      }

      const linkData = await response.json();
      setCreatedLink(linkData);

      // Generate and save QR code only if toggle is enabled
      if (generateQR) {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const shortUrl = `${baseUrl}/${linkData.short_code}`;
        
        // First, save the QR code to the database
        try {
          const qrResponse = await fetch("/api/qr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              link_id: linkData.id,
              url: shortUrl, // Use short URL so clicks are tracked
              format: qrFormat, // Include format preference
            }),
          });

          if (!qrResponse.ok) {
            const qrError = await qrResponse.json();
            console.error("Failed to save QR code:", qrError);
            toast.error("Link created, but QR code could not be saved");
          }
        } catch (qrSaveErr) {
          console.error("Failed to save QR code:", qrSaveErr);
          toast.error("Link created, but QR code could not be saved");
        }

        // Then generate styled QR code for success modal preview
        try {
          const qrData = await generateQRWithLogo(
            shortUrl,
            {
              width: 300,
              color: { dark: qrColor, light: qrBgColor },
            },
            previewImageUrl || null,
            addLogo,
            qrFormat
          );
          setCreatedQRCode(qrData);
        } catch (qrErr) {
          console.error("Failed to generate QR for success modal:", qrErr);
        }
      }

      // Show success modal instead of redirecting
      setShowSuccessModal(true);
      refreshUserData();
    } catch (err: any) {
      setError(err.message || "Failed to create link");
      toast.error(err.message || "Failed to create link");
    } finally {
      setLoading(false);
    }
  };

      const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        if (createdLink) {
          router.push(`/dashboard/links/${createdLink.id}/analytics`);
        }
      };

      const handleViewAnalytics = () => {
        if (createdLink) {
          setShowSuccessModal(false);
          router.push(`/dashboard/links/${createdLink.id}/analytics`);
        }
      };

  const handleCopyCode = () => {
    if (createdLink) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const shortUrl = `${baseUrl}/${createdLink.short_code}`;
      navigator.clipboard.writeText(shortUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleDownloadQRFromModal = () => {
    if (createdQRCode) {
      const link = document.createElement("a");
      link.href = createdQRCode;
      const filename = `qr-code-${createdLink?.short_code || 'link'}-${Date.now()}.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setCreatedLink(null);
    setCreatedQRCode("");
    setUrl("");
    setTitle("");
    setCustomCode("");
    setExpiresAt("");
    setPreviewQR("");
    setPreviewImageUrl(null);
    setPreviewImage(null);
    router.push("/dashboard/links/new");
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-text mb-2">Create a new link</h1>
                <p className="text-sm text-neutral-muted">
                  Shorten your URL and track performance with detailed analytics
                </p>
              </div>
              <button className="px-4 py-2 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:text-electric-sapphire text-sm font-semibold text-neutral-text transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Bulk upload
              </button>
            </div>

            {/* Mode Selection */}
            <div className="flex gap-2 p-1 bg-neutral-bg rounded-xl w-fit border border-neutral-border">
              <button
                type="button"
                onClick={() => setMode("configure")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  mode === "configure"
                    ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                    : "text-neutral-muted hover:text-neutral-text hover:bg-white"
                )}
              >
                Configure code
              </button>
              <button
                type="button"
                onClick={() => setMode("design")}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                  mode === "design"
                    ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white shadow-button"
                    : "text-neutral-muted hover:text-neutral-text hover:bg-white"
                )}
              >
                Customize design
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Show different content based on mode */}
            {mode === "configure" ? (
              <>
                {/* Code Details Section */}
                <CollapsibleSection
                  title="Code details"
                  isOpen={codeDetailsOpen}
                  onToggle={setCodeDetailsOpen}
                >
              <div className="space-y-4 pt-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                          <p className="text-xs text-neutral-muted">
                            {remainingLinks === Infinity ? (
                              <>
                                You're on the <span className="font-semibold text-electric-sapphire">{planName}</span> plan with unlimited links.
                              </>
                            ) : (
                              <>
                                You can create <span className="font-semibold text-electric-sapphire">{remainingLinks}</span> more {remainingLinks === 1 ? "code" : "codes"} this month ({maxLinks === -1 ? "unlimited" : maxLinks} total).{" "}
                                <a href="/dashboard/billing" className="text-electric-sapphire hover:text-bright-indigo font-semibold">
                                  Upgrade for more →
                                </a>
                              </>
                            )}
                          </p>
                        </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/my-long-url"
                    required
                    className={cn(
                      "w-full h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                      "text-neutral-text text-sm font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                      "transition-all"
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My awesome link"
                    className={cn(
                      "w-full h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                      "text-neutral-text text-sm font-medium",
                      "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                      "transition-all"
                    )}
                  />
                </div>

                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                            Custom back-half (optional)
                            {!canUseCustomBackHalf() && <Crown className="h-3.5 w-3.5 text-neon-pink" />}
                          </label>
                          {!canUseCustomBackHalf() && (
                            <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10">
                              <p className="text-xs text-neutral-muted flex items-center gap-2">
                                <Crown className="h-3.5 w-3.5 text-neon-pink" />
                                Custom back-half is a premium feature.{" "}
                                <a href="/dashboard/billing" className="text-neon-pink hover:text-raspberry-plum font-semibold">
                                  Upgrade →
                                </a>
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-muted font-mono px-3 py-2 bg-neutral-bg rounded-xl border border-neutral-border">
                              {typeof window !== "undefined" ? window.location.host : "lunr.to"}/
                            </span>
                            <input
                              type="text"
                              value={customCode}
                              onChange={(e) => {
                                if (!canUseCustomBackHalf()) return;
                                // Only allow alphanumeric, underscores, and hyphens
                                const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                                handleCustomCodeChange(value);
                              }}
                              placeholder={canUseCustomBackHalf() ? "my-custom-link" : "Premium feature"}
                              pattern="^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$"
                              minLength={2}
                              maxLength={20}
                              disabled={!canUseCustomBackHalf()}
                              className={cn(
                                "flex-1 h-12 px-4 rounded-xl border-2",
                                canUseCustomBackHalf()
                                  ? "bg-white border-neutral-border text-neutral-text"
                                  : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed",
                                "text-sm font-mono font-medium",
                                canUseCustomBackHalf() && "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                                "transition-all"
                              )}
                            />
                          </div>
                        </div>

                        {/* Campaign Selection */}
                        {campaigns.length > 0 && (
                          <div>
                            <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                              <Monitor className="h-3.5 w-3.5 inline mr-1.5" />
                              Campaign (Optional)
                            </label>
                            <select
                              value={selectedCampaignId}
                              onChange={(e) => setSelectedCampaignId(e.target.value)}
                              className={cn(
                                "w-full h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                                "text-neutral-text text-sm font-medium",
                                "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                                "transition-all"
                              )}
                            >
                              <option value="">No campaign</option>
                              {campaigns.map((campaign) => (
                                <option key={campaign.id} value={campaign.id}>
                                  {campaign.name}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-neutral-muted mt-1.5">
                              Organize this link under a campaign for better tracking
                            </p>
                          </div>
                        )}
              </div>
            </CollapsibleSection>

                    {/* Sharing Options */}
                    <CollapsibleSection
                      title="Sharing options"
                      isOpen={sharingOpen}
                      onToggle={setSharingOpen}
                    >
                      <div className="pt-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                                <QrCode className="h-5 w-5 text-electric-sapphire" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-neutral-text">Generate QR Code</div>
                                <div className="text-xs text-neutral-muted">
                                  Create a QR code for this link
                                </div>
                              </div>
                            </div>
                            <ToggleSwitch
                              enabled={generateQR}
                              onChange={setGenerateQR}
                            />
                          </div>
                          {generateQR && (
                            <div className="p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                              <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                                QR Code Format
                              </label>
                              <select
                                value={qrFormat}
                                onChange={(e) => setQrFormat(e.target.value as "png" | "svg")}
                                className="w-full h-10 px-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                              >
                                <option value="png">PNG (Image)</option>
                                <option value="svg">SVG (Vector)</option>
                              </select>
                              <p className="text-xs text-neutral-muted mt-1.5">
                                PNG is best for images, SVG for scalable graphics
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleSection>

            {/* Advanced Settings */}
            <CollapsibleSection
              title="Advanced settings"
              isOpen={advancedOpen}
              onToggle={setAdvancedOpen}
            >
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-electric-sapphire" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                        Expiration date
                        <Crown className="h-3.5 w-3.5 text-neon-pink" />
                      </div>
                      <div className="text-xs text-neutral-muted">
                        Set when this link expires
                      </div>
                    </div>
                  </div>
                          <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => {
                              if (!canSetExpiration()) return;
                              setExpiresAt(e.target.value);
                            }}
                            min={new Date().toISOString().split("T")[0]}
                            disabled={!canSetExpiration()}
                            className={cn(
                              "h-10 px-3 rounded-xl border-2 text-xs font-medium transition-all",
                              canSetExpiration()
                                ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                                : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
                            )}
                          />
                </div>

                {/* Password Protection */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-electric-sapphire" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                        Password protection
                        <Crown className="h-3.5 w-3.5 text-neon-pink" />
                      </div>
                      <div className="text-xs text-neutral-muted">
                        Require a password to access this link
                      </div>
                    </div>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={cn(
                      "h-10 px-3 rounded-xl border-2 text-xs font-medium transition-all w-48",
                      "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                    )}
                  />
                </div>

                {/* UTM Parameters Section */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-neon-pink" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-neutral-text flex items-center gap-2">
                          UTM parameters
                          {!canUseUTMParameters() && <Crown className="h-3.5 w-3.5 text-neon-pink" />}
                        </div>
                        <div className="text-xs text-neutral-muted">
                          {canUseUTMParameters()
                            ? "Add tracking parameters to your link"
                            : "Premium feature - Upgrade to add UTM parameters"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!canUseUTMParameters() && (
                        <a
                          href="/dashboard/billing"
                          className="text-xs text-neon-pink hover:text-raspberry-plum font-semibold"
                        >
                          Upgrade →
                        </a>
                      )}
                      <ToggleSwitch 
                        enabled={utmEnabled} 
                        onChange={(val) => {
                          if (!canUseUTMParameters()) return;
                          setUtmEnabled(val);
                        }} 
                        isPremium={!canUseUTMParameters()} 
                      />
                    </div>
                  </div>
                  {utmEnabled && canUseUTMParameters() && (
                    <div className="space-y-3 pt-3 border-t border-neon-pink/10">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-text mb-1.5 uppercase tracking-wide">
                            Source *
                          </label>
                          <input
                            type="text"
                            value={utmSource}
                            onChange={(e) => setUtmSource(e.target.value)}
                            placeholder="google"
                            className="w-full h-10 px-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-text mb-1.5 uppercase tracking-wide">
                            Medium *
                          </label>
                          <input
                            type="text"
                            value={utmMedium}
                            onChange={(e) => setUtmMedium(e.target.value)}
                            placeholder="cpc"
                            className="w-full h-10 px-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-text mb-1.5 uppercase tracking-wide">
                          Campaign
                        </label>
                        <input
                          type="text"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value)}
                          placeholder="summer_sale"
                          className="w-full h-10 px-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-text mb-1.5 uppercase tracking-wide">
                            Term
                          </label>
                          <input
                            type="text"
                            value={utmTerm}
                            onChange={(e) => setUtmTerm(e.target.value)}
                            placeholder="running shoes"
                            className="w-full h-10 px-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-neutral-text mb-1.5 uppercase tracking-wide">
                            Content
                          </label>
                          <input
                            type="text"
                            value={utmContent}
                            onChange={(e) => setUtmContent(e.target.value)}
                            placeholder="logolink"
                            className="w-full h-10 px-3 rounded-xl border-2 border-neutral-border bg-white text-neutral-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-neutral-muted">
                        * Required fields. These parameters will be added to your destination URL.
                      </p>
                      
                      {/* Preview of final URL with UTM parameters */}
                      {utmEnabled && (utmSource || utmMedium) && url && (
                        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                          <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">
                            Preview: Final Destination URL
                          </p>
                          <div className="p-3 rounded-lg bg-white border border-neutral-border">
                            <p className="text-xs font-mono text-electric-sapphire break-all">
                              {(() => {
                                try {
                                  const finalUrl = new URL(url);
                                  if (utmSource) finalUrl.searchParams.set('utm_source', utmSource);
                                  if (utmMedium) finalUrl.searchParams.set('utm_medium', utmMedium);
                                  if (utmCampaign) finalUrl.searchParams.set('utm_campaign', utmCampaign);
                                  if (utmTerm) finalUrl.searchParams.set('utm_term', utmTerm);
                                  if (utmContent) finalUrl.searchParams.set('utm_content', utmContent);
                                  return finalUrl.toString();
                                } catch {
                                  return url;
                                }
                              })()}
                            </p>
                          </div>
                          <p className="text-xs text-neutral-muted mt-2">
                            This is the URL users will be redirected to. UTM parameters are automatically appended.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>
              </>
            ) : (
              <>
                {/* Design Customization Section */}
                <CollapsibleSection
                  title="QR Code Design"
                  isOpen={codeDetailsOpen}
                  onToggle={setCodeDetailsOpen}
                >
                  <div className="space-y-4 pt-4">
                    {!isPremium && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10">
                        <p className="text-xs text-neutral-muted flex items-center gap-2">
                          <Crown className="h-3.5 w-3.5 text-neon-pink" />
                          Customize your QR code appearance. <span className="font-semibold text-neon-pink">Premium feature</span> -{" "}
                          <a href="/dashboard/billing" className="text-neon-pink hover:text-raspberry-plum font-semibold">
                            Upgrade to unlock →
                          </a>
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                        QR Code Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={qrColor}
                            onChange={(e) => {
                              if (!isPremium) return;
                              const newColor = e.target.value;
                              setQrColor(newColor);
                              // QR preview will be updated by useEffect when qrColor changes
                            }}
                          className={cn(
                            "w-16 h-12 rounded-xl border-2 border-neutral-border transition-all",
                            isPremium ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                          )}
                          disabled={!isPremium}
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={qrColor}
                            onChange={(e) => {
                              if (!isPremium) return;
                              const newColor = e.target.value;
                              setQrColor(newColor);
                              // QR preview will be updated by useEffect when qrColor changes
                            }}
                            placeholder="#000000"
                            className={cn(
                              "w-full h-12 px-4 rounded-xl border-2 text-sm font-mono font-medium transition-all",
                              isPremium
                                ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                                : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
                            )}
                            disabled={!isPremium}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-neutral-muted">
                        Choose a custom color for your QR code
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                        Background Color
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={qrBgColor}
                          onChange={async (e) => {
                            if (!isPremium) return;
                            const newBgColor = e.target.value;
                            setQrBgColor(newBgColor);
                            // Update QR preview
                            if (url) {
                              const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                              const shortCode = customCode || "example";
                              try {
                                const qrData = await QRCode.toDataURL(`${baseUrl}/${shortCode}`, {
                                  width: 200,
                                  color: { dark: qrColor, light: newBgColor },
                                });
                                setPreviewQR(qrData);
                              } catch (err) {
                                console.error("Failed to generate QR preview:", err);
                              }
                            }
                          }}
                          className={cn(
                            "w-16 h-12 rounded-xl border-2 border-neutral-border transition-all",
                            isPremium ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                          )}
                          disabled={!isPremium}
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={qrBgColor}
                            onChange={(e) => {
                              if (!isPremium) return;
                              const newBgColor = e.target.value;
                              setQrBgColor(newBgColor);
                              // QR preview will be updated by useEffect when qrBgColor changes
                            }}
                            placeholder="#FFFFFF"
                            className={cn(
                              "w-full h-12 px-4 rounded-xl border-2 text-sm font-mono font-medium transition-all",
                              isPremium
                                ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                                : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
                            )}
                            disabled={!isPremium}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                        QR Code Size
                      </label>
                      <select
                        value={qrSize}
                        onChange={(e) => {
                          if (!isPremium) return;
                          setQrSize(e.target.value);
                        }}
                        className={cn(
                          "w-full h-12 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                          isPremium
                            ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                            : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
                        )}
                        disabled={!isPremium}
                      >
                        <option value="small">Small (200x200)</option>
                        <option value="medium">Medium (300x300)</option>
                        <option value="large">Large (500x500)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10 flex items-center justify-center">
                          <Crown className="h-5 w-5 text-neon-pink" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-neutral-text">Add Logo to QR Code</div>
                          <div className="text-xs text-neutral-muted">
                            Embed your logo in the center of the QR code
                          </div>
                        </div>
                      </div>
                      <ToggleSwitch 
                        enabled={addLogo} 
                        onChange={async (val) => {
                          if (!isPremium) return;
                          if (val && !previewImageUrl) {
                            toast.error("Please upload an image first");
                            return;
                          }
                          setAddLogo(val);
                          // Force immediate QR regeneration with new toggle state
                          if (url) {
                            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                            const shortCode = customCode || "example";
                            const qrUrl = `${baseUrl}/${shortCode}`;
                            try {
                              setPreviewQR(""); // Clear first
                              const qrData = await generateQRWithLogo(
                                qrUrl,
                                {
                                  width: 200,
                                  color: { dark: qrColor, light: qrBgColor },
                                },
                                previewImageUrl || null,
                                val // Use the new value directly, not from state
                              );
                              setPreviewQR(qrData);
                            } catch (err) {
                              console.error("Failed to generate QR preview:", err);
                            }
                          }
                        }} 
                        isPremium={!isPremium}
                        disabled={!previewImageUrl && isPremium}
                      />
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Branding Section */}
                <CollapsibleSection
                  title="Branding & Appearance"
                  isOpen={sharingOpen}
                  onToggle={setSharingOpen}
                >
                  <div className="space-y-4 pt-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                      <p className="text-xs text-neutral-muted">
                        Customize how your link appears when shared. <span className="font-semibold text-electric-sapphire">Premium feature</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                        Link Preview Image
                      </label>
                      {previewImageUrl ? (
                        <div className="relative border-2 border-neutral-border rounded-xl overflow-hidden">
                          <img
                            src={previewImageUrl}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-2 rounded-xl bg-white/90 hover:bg-white border border-neutral-border text-neutral-text transition-colors"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-xs text-white font-medium">{previewImage?.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                            isPremium
                              ? "border-neutral-border hover:border-electric-sapphire hover:bg-electric-sapphire/5"
                              : "border-neutral-border bg-neutral-bg cursor-not-allowed opacity-50"
                          )}
                          onClick={() => {
                            if (isPremium && fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                        >
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-3">
                            <Upload className="h-8 w-8 text-electric-sapphire/60" />
                          </div>
                          <p className="text-sm font-semibold text-neutral-text mb-1">Upload preview image</p>
                          <p className="text-xs text-neutral-muted">Recommended: 1200x630px</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={!isPremium}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (isPremium && fileInputRef.current) {
                                fileInputRef.current.click();
                              }
                            }}
                            disabled={!isPremium}
                            className={cn(
                              "mt-4 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-colors",
                              isPremium
                                ? "border-neutral-border text-neutral-text hover:bg-neutral-bg hover:border-electric-sapphire"
                                : "border-neutral-border text-neutral-muted cursor-not-allowed"
                            )}
                          >
                            Choose Image
                          </button>
                        </div>
                      )}
                      {!isPremium && (
                        <p className="mt-2 text-xs text-neutral-muted flex items-center gap-1">
                          <Crown className="h-3 w-3 text-neon-pink" />
                          Premium feature - <a href="/dashboard/billing" className="text-neon-pink hover:text-raspberry-plum font-semibold">Upgrade →</a>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                        Link Description
                      </label>
                      <textarea
                        rows={3}
                        value={linkDescription}
                        onChange={(e) => {
                          if (!isPremium) return;
                          setLinkDescription(e.target.value);
                        }}
                        placeholder="Add a description that appears when your link is shared..."
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border-2 text-sm font-medium resize-none transition-all",
                          isPremium
                            ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                            : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
                        )}
                        disabled={!isPremium}
                      />
                      {!isPremium && (
                        <p className="mt-2 text-xs text-neutral-muted flex items-center gap-1">
                          <Crown className="h-3 w-3 text-neon-pink" />
                          Premium feature - <a href="/dashboard/billing" className="text-neon-pink hover:text-raspberry-plum font-semibold">Upgrade →</a>
                        </p>
                      )}
                    </div>
                  </div>
                </CollapsibleSection>
              </>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="h-11 px-6 rounded-xl border-2 border-neutral-border text-neutral-text text-sm font-semibold hover:bg-neutral-bg hover:border-neutral-text transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !url}
                className={cn(
                  "h-11 px-6 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold",
                  "hover:from-bright-indigo hover:to-vivid-royal disabled:opacity-30 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create link
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-80 bg-white border-l border-neutral-border p-6 overflow-y-auto flex-shrink-0">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-neutral-text mb-1">Preview</h3>
          <p className="text-xs text-neutral-muted">See how your link will look</p>
        </div>
        <div className="space-y-6">
          {generateQR && previewQR ? (
            <div className="bg-gradient-to-br from-neutral-bg to-white rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-neutral-border shadow-soft">
              <div className="text-center mb-4">
                <img src={previewQR} alt="QR Code Preview" className="w-48 h-48 mx-auto mb-4 rounded-xl shadow-soft" />
                <p className="text-xs font-semibold text-neutral-text">QR Code</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadQR}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold hover:from-bright-indigo hover:to-vivid-royal transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-button"
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </button>
            </div>
          ) : generateQR ? (
            <div className="bg-gradient-to-br from-neutral-bg to-white rounded-2xl p-8 flex items-center justify-center h-64 border-2 border-neutral-border shadow-soft">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-electric-sapphire/60" />
                </div>
                <p className="text-sm font-semibold text-neutral-muted">Enter URL to see QR preview</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-neutral-bg to-white rounded-2xl p-8 flex items-center justify-center h-64 border-2 border-neutral-border shadow-soft">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-4">
                  <Link2 className="h-8 w-8 text-electric-sapphire/60" />
                </div>
                <p className="text-sm font-semibold text-neutral-muted">Enable QR generation to see preview</p>
              </div>
            </div>
          )}
          {previewUrl && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
              <p className="text-xs font-semibold text-neutral-muted mb-2 uppercase tracking-wide">Short URL</p>
              <p className="text-sm text-electric-sapphire font-mono break-all font-semibold">
                {previewUrl}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {createdLink && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Your Link is ready!"
          subtitle={createdQRCode ? "Scan the QR code below or copy the link to share" : "Copy the link below to share"}
          qrCode={createdQRCode || undefined}
          shortUrl={createdLink ? `${typeof window !== "undefined" ? window.location.origin : ""}/${createdLink.short_code}` : undefined}
          onDownload={createdQRCode ? handleDownloadQRFromModal : undefined}
          onCopy={handleCopyCode}
          onCustomize={() => {
            setShowSuccessModal(false);
            router.push(`/dashboard/links/${createdLink.id}/edit`);
          }}
          onViewAnalytics={handleViewAnalytics}
          createAnotherText="On a roll? Don't stop now! Create another link →"
          onCreateAnother={handleCreateAnother}
        />
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-neutral-border">
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-bg transition-colors"
      >
        <span className="text-sm font-bold text-neutral-text">{title}</span>
        <ChevronDown className={cn(
          "h-4 w-4 text-neutral-muted transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      {isOpen && <div className="px-5 pb-5 animate-slide-reveal">{children}</div>}
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
  remaining,
  isPremium = false,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  remaining?: number;
  isPremium?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {remaining !== undefined && (
        <span className="text-xs text-neutral-muted font-semibold">{remaining} left</span>
      )}
      {isPremium && (
        <Crown className="h-3.5 w-3.5 text-neon-pink" />
      )}
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
          enabled ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo" : "bg-neutral-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-button",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
