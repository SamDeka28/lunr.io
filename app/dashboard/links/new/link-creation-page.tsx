"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, Upload, ChevronDown, ChevronRight, Crown, Calendar, Clock, Sparkles, X, Image as ImageIcon, Download, QrCode, Monitor, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import QRCode from "qrcode";
import { usePlan } from "@/hooks/use-plan";
import { SuccessModal } from "@/components/success-modal";
import { BulkImportModal } from "@/components/bulk-import-modal";
import { ColorPickerWithInput } from "@/components/color-picker-with-input";
import { Button } from "@/components/ui/button";
import {
  FormWithPreviewShell,
  FormPreviewHeader,
  FormModeTabs,
  PreviewPanel,
} from "@/components/ui/form-with-preview";
import { isCampaignsEnabled } from "@/lib/features";

export function LinkCreationPage({
  userId,
  initialCampaignId = "",
}: {
  userId: string;
  initialCampaignId?: string;
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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [createdLink, setCreatedLink] = useState<any>(null);
  const [createdQRCode, setCreatedQRCode] = useState<string>("");
  const [tags, setTags] = useState("");
  const [folder, setFolder] = useState("");

  // UTM Parameters State
  const [utmEnabled, setUtmEnabled] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");

  // Campaign selection
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Fetch campaigns on mount (when feature enabled)
  useEffect(() => {
    if (!isCampaignsEnabled()) return;
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

  useEffect(() => {
    if (isCampaignsEnabled() && initialCampaignId) {
      setSelectedCampaignId(initialCampaignId);
    }
  }, [initialCampaignId]);

  // Collapsible sections
  const [codeDetailsOpen, setCodeDetailsOpen] = useState(true);
  const [sharingOpen, setSharingOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // QR Code Design State
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrSize, setQrSize] = useState("medium");
  const [addLogo, setAddLogo] = useState(false);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);

  // Branding State (social unfurl — not used when scanning QR)
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [linkDescription, setLinkDescription] = useState("");

  // Preview
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewQR, setPreviewQR] = useState("");

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setLogoImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
    setLogoImageUrl(null);
    setAddLogo(false);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setPreviewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setPreviewImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadOgImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    form.append("pathPrefix", "links");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to upload preview image");
    }
    const data = await res.json();
    return data.publicUrl as string;
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
          logoImageUrl || null,
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
          logoImageUrl || null,
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
  }, [addLogo, logoImageUrl, qrColor, qrBgColor, customCode, url, generateQR]);

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
      let ogImageUrl: string | null = null;
      if (isPremium && previewImage) {
        ogImageUrl = await uploadOgImage(previewImage);
      }

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
          password: password && isPremium ? password : undefined,
          campaign_id: selectedCampaignId || undefined,
          tags: tags.trim()
            ? tags.split(",").map((t) => t.trim()).filter(Boolean)
            : undefined,
          folder: folder.trim() || undefined,
          ...(isPremium
            ? {
                description: linkDescription || null,
                og_image_url: ogImageUrl,
              }
            : {}),
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
        const shortUrl = `${baseUrl}/${linkData.short_code}?utm_medium=qr&utm_source=qr`;
        
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
            logoImageUrl || null,
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
    setTags("");
    setFolder("");
    setPreviewQR("");
    setPreviewImageUrl(null);
    setPreviewImage(null);
    router.push("/dashboard/links/new");
  };

  return (
    <>
    <FormWithPreviewShell
      form={
        <>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-text tracking-tight">
                  Create a new link
                </h1>
                <p className="text-sm text-neutral-muted mt-1.5 leading-relaxed">
                  Shorten a URL and track performance
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkModal(true)}
                className="shrink-0"
              >
                <Upload className="h-4 w-4" />
                Bulk upload
              </Button>
            </div>

            <FormModeTabs
              value={mode}
              onChange={setMode}
              options={[
                { id: "configure" as const, label: "Configure" },
                { id: "design" as const, label: "Design" },
              ]}
            />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                      Tags (optional)
                    </label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="marketing, launch"
                      className={cn(
                        "w-full h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                        "text-neutral-text text-sm font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                        "transition-all"
                      )}
                    />
                    <p className="text-xs text-neutral-muted mt-1.5">Comma-separated</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                      Folder (optional)
                    </label>
                    <input
                      type="text"
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      placeholder="e.g. social"
                      className={cn(
                        "w-full h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                        "text-neutral-text text-sm font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                        "transition-all"
                      )}
                    />
                  </div>
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
                        {isCampaignsEnabled() && campaigns.length > 0 && (
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
                    onChange={(e) => {
                      if (!isPremium) return;
                      setPassword(e.target.value);
                    }}
                    placeholder={isPremium ? "Enter password" : "Premium feature"}
                    disabled={!isPremium}
                    className={cn(
                      "h-10 px-3 rounded-xl border-2 text-xs font-medium transition-all w-48",
                      isPremium
                        ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                        : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed opacity-50"
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
                      <ColorPickerWithInput
                        label="QR Code Color"
                        value={qrColor}
                        onChange={(newColor) => {
                          if (!isPremium) return;
                          setQrColor(newColor);
                        }}
                        disabled={!isPremium}
                      />
                      <p className="mt-2 text-xs text-neutral-muted">
                        Choose a custom color for your QR code
                      </p>
                    </div>

                    <div>
                      <ColorPickerWithInput
                        label="Background Color"
                        value={qrBgColor}
                        onChange={(newBgColor) => {
                          if (!isPremium) return;
                          setQrBgColor(newBgColor);
                        }}
                        disabled={!isPremium}
                      />
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

                    <div
                      className={cn(
                        "rounded-xl border p-4 space-y-3",
                        isPremium
                          ? "bg-neutral-bg/60 border-neutral-border"
                          : "bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border-neon-pink/10"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              isPremium
                                ? "bg-white border border-neutral-border"
                                : "bg-gradient-to-br from-neon-pink/10 to-raspberry-plum/10"
                            )}
                          >
                            {isPremium ? (
                              <ImageIcon className="h-5 w-5 text-electric-sapphire" />
                            ) : (
                              <Crown className="h-5 w-5 text-neon-pink" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-neutral-text">Add Logo to QR Code</div>
                            <div className="text-xs text-neutral-muted">
                              {isPremium
                                ? "Upload a logo, then turn this on"
                                : "Embed your logo in the center of the QR code"}
                            </div>
                          </div>
                        </div>
                        <ToggleSwitch 
                          enabled={addLogo} 
                          onChange={async (val) => {
                            if (!isPremium) return;
                            if (val && !logoImageUrl) {
                              toast.error("Upload a logo image first");
                              logoFileInputRef.current?.click();
                              return;
                            }
                            setAddLogo(val);
                            if (url) {
                              const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                              const shortCode = customCode || "example";
                              const qrUrl = `${baseUrl}/${shortCode}`;
                              try {
                                setPreviewQR("");
                                const qrData = await generateQRWithLogo(
                                  qrUrl,
                                  {
                                    width: 200,
                                    color: { dark: qrColor, light: qrBgColor },
                                  },
                                  logoImageUrl || null,
                                  val
                                );
                                setPreviewQR(qrData);
                              } catch (err) {
                                console.error("Failed to generate QR preview:", err);
                              }
                            }
                          }} 
                          isPremium={!isPremium}
                          disabled={!isPremium}
                        />
                      </div>

                      {isPremium && (
                        <div>
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoSelect}
                            className="hidden"
                          />
                          {logoImageUrl ? (
                            <div className="flex items-center gap-3 rounded-xl border border-neutral-border bg-white p-3">
                              <img
                                src={logoImageUrl}
                                alt="Logo preview"
                                className="h-12 w-12 rounded-lg object-cover border border-neutral-border"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-neutral-text truncate">
                                  {logoImage?.name || "Logo ready"}
                                </p>
                                <p className="text-xs text-neutral-muted">
                                  {addLogo ? "Embedded in QR preview" : "Toggle on to embed in QR"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className="p-2 rounded-lg text-neutral-muted hover:text-neutral-text hover:bg-neutral-bg"
                                title="Remove logo"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-border bg-white px-4 py-3 text-sm font-medium text-neutral-text hover:border-electric-sapphire hover:bg-electric-sapphire/5 transition-colors"
                            >
                              <Upload className="h-4 w-4 text-electric-sapphire" />
                              Upload logo image
                            </button>
                          )}
                        </div>
                      )}

                      {!isPremium && (
                        <p className="text-xs text-neutral-muted">
                          <a href="/dashboard/billing" className="text-neon-pink hover:text-raspberry-plum font-semibold">
                            Upgrade
                          </a>{" "}
                          to embed a logo in your QR codes.
                        </p>
                      )}
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
                        Controls how your short link looks when pasted into Slack, iMessage, Twitter, LinkedIn, etc.{" "}
                        <span className="font-semibold text-electric-sapphire">Not shown when scanning a QR code</span> — scanners open the destination URL.
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
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !url}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    Create link
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      }
      preview={
        <>
          <FormPreviewHeader
            title="Preview"
            description="See how your link will look"
          />
          <div className="space-y-4">
            {generateQR && previewQR ? (
              <PreviewPanel className="!p-6">
                <img
                  src={previewQR}
                  alt="QR Code Preview"
                  className="w-44 h-44 mx-auto mb-4 rounded-2xl shadow-soft"
                />
                <p className="text-xs font-semibold text-neutral-muted mb-4">QR Code</p>
                <Button type="button" onClick={handleDownloadQR} className="w-full">
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </PreviewPanel>
            ) : generateQR ? (
              <PreviewPanel className="h-56">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-7 w-7 text-primary/70" />
                </div>
                <p className="text-sm font-medium text-neutral-muted text-center">
                  Enter URL to see QR preview
                </p>
              </PreviewPanel>
            ) : (
              <PreviewPanel className="h-56">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Link2 className="h-7 w-7 text-primary/70" />
                </div>
                <p className="text-sm font-medium text-neutral-muted text-center px-2">
                  Enable QR generation to see preview
                </p>
              </PreviewPanel>
            )}
            {previewUrl && (
              <div className="p-4 rounded-card bg-primary/5 border border-primary/10 shadow-soft">
                <p className="text-[11px] font-semibold text-neutral-muted mb-1.5 uppercase tracking-wide">
                  Short URL
                </p>
                <p className="text-sm text-primary font-mono break-all font-semibold">
                  {previewUrl}
                </p>
              </div>
            )}
          </div>
        </>
      }
    />

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

      <BulkImportModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onComplete={(summary) => {
          if (summary.created > 0) {
            refreshUserData();
          }
        }}
      />
    </>
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
    <div className="bg-white rounded-card overflow-hidden shadow-soft border border-neutral-border/80">
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-bg/50 transition-colors"
      >
        <span className="text-sm font-semibold text-neutral-text tracking-tight">{title}</span>
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
