"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2, Upload, ChevronDown, ChevronRight, Crown, Calendar, Clock, X, Image as ImageIcon, Download, QrCode, Monitor, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import QRCode from "qrcode";
import { usePlan } from "@/hooks/use-plan";
import { ColorPickerWithInput } from "@/components/color-picker-with-input";
import { Button } from "@/components/ui/button";
import {
  FormWithPreviewShell,
  FormPreviewHeader,
  FormModeTabs,
  PreviewPanel,
} from "@/components/ui/form-with-preview";

export default function LinkEditForm({
  link,
  existingQRCode,
}: {
  link: any;
  existingQRCode?: any;
}) {
  // Get plan data from Zustand store
  const {
    canSetExpiration,
    canUseUTMParameters,
    canUseCustomBackHalf,
    planName,
    planDisplayName,
    isPremium,
    refreshUserData,
  } = usePlan();
  const router = useRouter();

  // Ensure store is initialized on mount
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Fetch campaigns
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
  const [mode, setMode] = useState<"configure" | "design">("configure");
  const [url, setUrl] = useState(link.original_url);
  const [title, setTitle] = useState(link.title || "");
  const [shortCode, setShortCode] = useState(link.short_code || "");
  const [tags, setTags] = useState(
    Array.isArray(link.tags) ? link.tags.join(", ") : ""
  );
  const [folder, setFolder] = useState(link.folder || "");
  const [expiresAt, setExpiresAt] = useState(
    link.expires_at ? new Date(link.expires_at).toISOString().split("T")[0] : ""
  );
  const [password, setPassword] = useState("");
  const [qrFormat, setQrFormat] = useState<"png" | "svg">("png");
  const [generateQR, setGenerateQR] = useState(!!existingQRCode);
  const [linkActive, setLinkActive] = useState(link.is_active !== false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UTM Parameters State - Initialize from link data
  const utmParams = (link.utm_parameters as Record<string, string>) || {};
  const [utmEnabled, setUtmEnabled] = useState(!!(utmParams.utm_source || utmParams.utm_medium));
  const [utmSource, setUtmSource] = useState(utmParams.utm_source || "");
  const [utmMedium, setUtmMedium] = useState(utmParams.utm_medium || "");
  const [utmCampaign, setUtmCampaign] = useState(utmParams.utm_campaign || "");
  const [utmTerm, setUtmTerm] = useState(utmParams.utm_term || "");
  const [utmContent, setUtmContent] = useState(utmParams.utm_content || "");

  // Campaign selection
  const [selectedCampaignId, setSelectedCampaignId] = useState(link.campaign_id || "");
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Collapsible sections
  const [codeDetailsOpen, setCodeDetailsOpen] = useState(true);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // QR Code Design State
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrSize, setQrSize] = useState("medium");
  const [addLogo, setAddLogo] = useState(false);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(null);

  // Branding State (social link unfurl — not used when scanning QR)
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(
    link.og_image_url || null
  );
  const [linkDescription, setLinkDescription] = useState(link.description || "");
  const [ogImageRemoved, setOgImageRemoved] = useState(false);

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
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      setLogoImageUrl(imageUrl);
      if (addLogo) {
        await updateQRPreview();
      }
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
    updateQRPreview();
  };

  // Handle social preview image selection
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
    reader.onloadend = () => {
      setPreviewImageUrl(reader.result as string);
      setOgImageRemoved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setPreviewImageUrl(null);
    setOgImageRemoved(true);
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
      const downloadLink = document.createElement("a");
      downloadLink.href = previewQR;
      downloadLink.download = `qr-code-${link.short_code}-${Date.now()}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shortUrl = `${baseUrl}/${shortCode || link.short_code}?utm_medium=qr&utm_source=qr`;

    try {
      const qrData = await generateQRWithLogo(
        shortUrl,
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

  // Pre-populate QR code if it exists
  useEffect(() => {
    if (existingQRCode && existingQRCode.qr_data) {
      setPreviewQR(existingQRCode.qr_data);
    }
  }, [existingQRCode]);

  // Update preview when settings change (only if generateQR is enabled)
  useEffect(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const shortUrl = `${baseUrl}/${shortCode || link.short_code}?utm_medium=qr&utm_source=qr`;
    setPreviewUrl(`${baseUrl}/${shortCode || link.short_code}`);
    
    if (!generateQR) {
      setPreviewQR("");
      return;
    }
    
    // If we have an existing QR code, use it initially
    if (existingQRCode && existingQRCode.qr_data && !logoImageUrl && !addLogo && qrColor === "#000000" && qrBgColor === "#FFFFFF") {
      setPreviewQR(existingQRCode.qr_data);
      return;
    }
    
    // Generate QR code with current settings
    const generateQRCode = async () => {
      try {
        // Clear any previous QR code first to avoid caching issues
        setPreviewQR("");
        
        const qrData = await generateQRWithLogo(
          shortUrl,
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
  }, [shortCode, link.short_code, qrColor, qrBgColor, addLogo, logoImageUrl, generateQR, existingQRCode]);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let ogImageUrl: string | null | undefined = undefined;
      if (isPremium) {
        if (previewImage) {
          ogImageUrl = await uploadOgImage(previewImage);
        } else if (ogImageRemoved) {
          ogImageUrl = null;
        } else if (previewImageUrl && previewImageUrl.startsWith("http")) {
          ogImageUrl = previewImageUrl;
        }
      }

      const response = await fetch(`/api/links/${link.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          original_url: url,
          short_code: shortCode !== link.short_code ? shortCode : undefined,
          expires_at: expiresAt || null,
          password: password || undefined,
          title: title || undefined,
          is_active: linkActive,
          ...(isPremium
            ? {
                description: linkDescription || null,
                og_image_url: ogImageUrl !== undefined ? ogImageUrl : link.og_image_url || null,
              }
            : {}),
          campaign_id: selectedCampaignId || null,
          tags: tags.trim()
            ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : [],
          folder: folder.trim() || null,
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
        throw new Error(errorData.error || "Failed to update link");
      }

      // Generate and save QR code only if toggle is enabled
      if (generateQR) {
        // Create new QR code (API appends utm_medium=qr)
        try {
          const qrResponse = await fetch("/api/qr", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              link_id: link.id,
              format: qrFormat,
            }),
          });

          if (!qrResponse.ok) {
            const qrError = await qrResponse.json();
            console.error("Failed to save QR code:", qrError);
            toast.error("Link updated, but QR code could not be saved");
          }
        } catch (qrSaveErr) {
          console.error("Failed to save QR code:", qrSaveErr);
          toast.error("Link updated, but QR code could not be saved");
        }
      }

      toast.success("Link updated successfully!");
      router.push("/dashboard/links");
    } catch (err: any) {
      setError(err.message || "Failed to update link");
      toast.error(err.message || "Failed to update link");
    } finally {
      setLoading(false);
    }
  };

  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${shortCode || link.short_code}`;

  return (
    <FormWithPreviewShell
      form={
        <>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-text tracking-tight">
                Edit Link
              </h1>
              <p className="text-sm text-neutral-muted mt-1.5 leading-relaxed">
                Update your link destination and settings
              </p>
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
                {/* Short Code - editable */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Short Code
                    {!canUseCustomBackHalf() && <Crown className="h-3.5 w-3.5 text-neon-pink" />}
                  </label>
                  {!canUseCustomBackHalf() && (
                    <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-neon-pink/5 to-raspberry-plum/5 border border-neon-pink/10">
                      <p className="text-xs text-neutral-muted flex items-center gap-2">
                        <Crown className="h-3.5 w-3.5 text-neon-pink" />
                        Changing short codes is a premium feature.{" "}
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
                      value={shortCode}
                      onChange={(e) => {
                        if (!canUseCustomBackHalf()) return;
                        const value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "");
                        setShortCode(value);
                      }}
                      disabled={!canUseCustomBackHalf()}
                      minLength={2}
                      maxLength={20}
                      className={cn(
                        "flex-1 h-12 px-4 rounded-xl border-2",
                        canUseCustomBackHalf()
                          ? "bg-white border-neutral-border text-neutral-text"
                          : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed",
                        "text-sm font-mono font-medium",
                        canUseCustomBackHalf() &&
                          "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                        "transition-all"
                      )}
                    />
                  </div>
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
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-electric-sapphire" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-text">
                        {linkActive ? "Link is active" : "Link is inactive"}
                      </div>
                      <div className="text-xs text-neutral-muted">
                        {linkActive
                          ? "People can open this short link"
                          : "Short link returns not found until re-enabled"}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={linkActive}
                    onChange={setLinkActive}
                  />
                </div>
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
                        {!canSetExpiration && <Crown className="h-3.5 w-3.5 text-neon-pink" />}
                      </div>
                      <div className="text-xs text-neutral-muted">
                        {canSetExpiration
                          ? "Set when this link expires"
                          : "Premium feature - Upgrade to set expiration dates"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!canSetExpiration && (
                      <a
                        href="/dashboard/billing"
                        className="text-xs text-neon-pink hover:text-raspberry-plum font-semibold"
                      >
                        Upgrade →
                      </a>
                    )}
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => {
                        if (!canSetExpiration) return;
                        setExpiresAt(e.target.value);
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      disabled={!canSetExpiration}
                      className={cn(
                        "h-10 px-3 rounded-xl border-2 text-xs font-medium transition-all",
                        canSetExpiration
                          ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
                          : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
                      )}
                      />
                    </div>
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
                        {link.password_hash ? "Password is set. Enter new password to change." : "Require a password to access this link"}
                      </div>
                    </div>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={link.password_hash ? "New password (leave blank to keep)" : "Enter password"}
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
                          {!canUseUTMParameters && <Crown className="h-3.5 w-3.5 text-neon-pink" />}
                        </div>
                        <div className="text-xs text-neutral-muted">
                          {canUseUTMParameters
                            ? "Add tracking parameters to your link"
                            : "Premium feature - Upgrade to add UTM parameters"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!canUseUTMParameters && (
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
                          if (!canUseUTMParameters) return;
                          setUtmEnabled(val);
                        }} 
                        isPremium={!canUseUTMParameters} 
                      />
                    </div>
                  </div>
                  {utmEnabled && canUseUTMParameters && (
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
                            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                            const shortUrl = `${baseUrl}/${link.short_code}`;
                            try {
                              setPreviewQR("");
                              const qrData = await generateQRWithLogo(
                                shortUrl,
                                {
                                  width: 200,
                                  color: { dark: qrColor, light: qrBgColor },
                                },
                                logoImageUrl || null,
                                val,
                                qrFormat
                              );
                              setPreviewQR(qrData);
                            } catch (err) {
                              console.error("Failed to generate QR preview:", err);
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
                            <p className="text-xs text-white font-medium">
                              {previewImage?.name || "Social preview image"}
                            </p>
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
                    Updating…
                  </>
                ) : (
                  <>
                    Update link
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
                  Generating QR preview…
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
  isPremium = false,
  disabled = false,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isPremium?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
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
