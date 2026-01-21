"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Loader2, Link2, ChevronDown, ChevronRight, Crown, Download, ExternalLink, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import QRCodeLib from "qrcode";
import { usePlan } from "@/hooks/use-plan";
import { SuccessModal } from "@/components/success-modal";

export default function QRCodeForm({
  userId,
  links,
}: {
  userId: string;
  links: Array<{ id: string; short_code: string; original_url: string; title?: string }>;
}) {
  // Get plan data from Zustand store
  const {
    plan,
    planName,
    planDisplayName,
    isPremium,
    usage,
    refreshUserData,
  } = usePlan();

  const remainingQR = usage?.remainingQRCodes === -1 ? Infinity : (usage?.remainingQRCodes ?? 0);
  const maxQR = plan?.maxQRCodes === -1 ? Infinity : (plan?.maxQRCodes ?? 2);

  // Ensure store is initialized
  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const router = useRouter();
  const [linkId, setLinkId] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQR, setCreatedQR] = useState<any>(null);
  const [createdQRCode, setCreatedQRCode] = useState<string>("");

  // Collapsible sections
  const [sourceOpen, setSourceOpen] = useState(true);
  const [designOpen, setDesignOpen] = useState(true);

  // QR Code Design State
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrSize, setQrSize] = useState("medium");
  const [addLogo, setAddLogo] = useState(false);

  // Logo State
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview
  const [previewQR, setPreviewQR] = useState("");

  // Function to generate QR code with optional logo
  const generateQRWithLogo = useCallback(async (
    data: string,
    options: { width: number; color: { dark: string; light: string } },
    logoUrl?: string | null,
    shouldAddLogo: boolean = false
  ): Promise<string> => {
    const qrOptions = {
      ...options,
      errorCorrectionLevel: 'H' as const,
      margin: 2,
    };

    const qrDataUrl = await QRCodeLib.toDataURL(data, qrOptions);

    if (!shouldAddLogo || !logoUrl) {
      return qrDataUrl;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return qrDataUrl;
    }

    canvas.width = options.width;
    canvas.height = options.width;

    return new Promise((resolve) => {
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      
      logoImg.onload = () => {
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        
        qrImg.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(qrImg, 0, 0);

          const logoSize = Math.floor(options.width * 0.15);
          const logoX = Math.floor((options.width - logoSize) / 2);
          const logoY = Math.floor((options.width - logoSize) / 2);

          const padding = Math.floor(logoSize * 0.15);
          ctx.fillStyle = options.color.light;
          ctx.fillRect(
            logoX - padding,
            logoY - padding,
            logoSize + padding * 2,
            logoSize + padding * 2
          );

          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          resolve(canvas.toDataURL());
        };
        
        qrImg.onerror = () => resolve(qrDataUrl);
        qrImg.src = qrDataUrl;
      };
      
      logoImg.onerror = () => resolve(qrDataUrl);
      logoImg.src = logoUrl;
    });
  }, [qrColor, qrBgColor]);

  // Update QR preview when settings change
  useEffect(() => {
    const targetUrl = linkId 
      ? links.find(l => l.id === linkId)?.original_url || url
      : url;

    if (!targetUrl) {
      setPreviewQR("");
      return;
    }

    const generateQR = async () => {
      try {
        setPreviewQR("");
        
        const qrData = await generateQRWithLogo(
          targetUrl,
          {
            width: 200,
            color: { dark: qrColor, light: qrBgColor },
          },
          previewImageUrl || null,
          addLogo
        );
        setPreviewQR(qrData);
      } catch (err) {
        console.error("Failed to generate QR preview:", err);
      }
    };
    
    generateQR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, url, qrColor, qrBgColor, addLogo, previewImageUrl, generateQRWithLogo]);

  // Handle image selection
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
      const imageUrl = reader.result as string;
      setPreviewImageUrl(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setPreviewImageUrl(null);
    setAddLogo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadQR = () => {
    if (!previewQR) {
      toast.error("No QR code to download.");
      return;
    }
    const link = document.createElement('a');
    link.href = previewQR;
    const filename = `qr-code-${Date.now()}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link_id: linkId || undefined,
          url: url || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate QR code");
      }

      const qrData = await response.json();
      setCreatedQR(qrData);

      // Generate final QR code with current design settings
      const targetUrl = linkId 
        ? links.find(l => l.id === linkId)?.original_url || url
        : url;

      if (targetUrl) {
        try {
          const finalQR = await generateQRWithLogo(
            targetUrl,
            {
              width: 300,
              color: { dark: qrColor, light: qrBgColor },
            },
            previewImageUrl || null,
            addLogo
          );
          setCreatedQRCode(finalQR);
        } catch (qrErr) {
          console.error("Failed to generate QR for success modal:", qrErr);
        }
      }

      // Show success modal instead of redirecting
      setShowSuccessModal(true);
      refreshUserData();
    } catch (err: any) {
      setError(err.message || "Failed to generate QR code");
      toast.error(err.message || "Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (createdQR) {
      router.push("/dashboard/qr");
    }
  };

  const handleViewAnalytics = () => {
    if (createdQR?.id) {
      setShowSuccessModal(false);
      router.push(`/dashboard/qr/${createdQR.id}/analytics`);
    } else {
      setShowSuccessModal(false);
      router.push("/dashboard/qr");
    }
  };

  const handleDownloadQRFromModal = () => {
    if (createdQRCode) {
      const link = document.createElement("a");
      link.href = createdQRCode;
      const filename = `qr-code-${Date.now()}.png`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded!");
    }
  };

  const handleCopyCode = () => {
    const targetUrl = linkId 
      ? links.find(l => l.id === linkId)?.original_url || url
      : url;
    if (targetUrl) {
      navigator.clipboard.writeText(targetUrl);
      toast.success("URL copied to clipboard!");
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setCreatedQR(null);
    setCreatedQRCode("");
    setLinkId("");
    setUrl("");
    setPreviewQR("");
    setPreviewImageUrl(null);
    setPreviewImage(null);
    setAddLogo(false);
    router.push("/dashboard/qr/new");
  };

  const selectedLink = linkId ? links.find(l => l.id === linkId) : null;

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-text mb-2">Generate QR Code</h1>
                <p className="text-sm text-neutral-muted">
                  Create a QR code for any URL or existing link
                </p>
              </div>
              <button 
                type="button"
                className="px-4 py-2 rounded-xl border-2 border-neutral-border hover:border-electric-sapphire hover:text-electric-sapphire text-sm font-semibold text-neutral-text transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Bulk upload
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Source Section */}
            <CollapsibleSection
              title="Source"
              isOpen={sourceOpen}
              onToggle={setSourceOpen}
            >
              <div className="space-y-4 pt-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                  <p className="text-xs text-neutral-muted">
                    {remainingQR === Infinity ? (
                      <>
                        You're on the <span className="font-semibold text-electric-sapphire">{planName}</span> plan with unlimited QR codes.
                      </>
                    ) : (
                      <>
                        You can create <span className="font-semibold text-electric-sapphire">{remainingQR}</span> more {remainingQR === 1 ? "QR code" : "QR codes"} this month.{" "}
                        <a href="/dashboard/billing" className="text-electric-sapphire hover:text-bright-indigo font-semibold">
                          Upgrade for more →
                        </a>
                      </>
                    )}
                  </p>
                </div>

                {links.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                      Select an existing link (optional)
                    </label>
                    <select
                      value={linkId}
                      onChange={(e) => {
                        setLinkId(e.target.value);
                        setUrl("");
                      }}
                      className={cn(
                        "w-full h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                        "text-neutral-text text-sm font-medium",
                        "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                        "transition-all"
                      )}
                    >
                      <option value="">-- Select a link --</option>
                      {links.map((link) => (
                        <option key={link.id} value={link.id}>
                          {link.title || link.short_code} - {link.original_url}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-sm text-neutral-muted font-semibold">OR</span>
                  </div>
                  <div className="h-px bg-neutral-border" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Enter a URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Link2 className="h-5 w-5 text-neutral-muted" />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setLinkId("");
                      }}
                      placeholder="https://example.com"
                      disabled={!!linkId}
                      className={cn(
                        "w-full pl-12 pr-4 h-12 rounded-xl border-2",
                        linkId
                          ? "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed"
                          : "bg-white border-neutral-border text-neutral-text",
                        "text-sm font-medium",
                        !linkId && "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                        "transition-all"
                      )}
                    />
                  </div>
                </div>

                {selectedLink && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-electric-sapphire/5 to-bright-indigo/5 border border-electric-sapphire/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wide">Selected Link</span>
                    </div>
                    <a
                      href={selectedLink.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-electric-sapphire hover:text-bright-indigo font-semibold flex items-center gap-1.5"
                    >
                      {selectedLink.original_url}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Design Section */}
            <CollapsibleSection
              title="QR Code Design"
              isOpen={designOpen}
              onToggle={setDesignOpen}
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
                        setQrColor(e.target.value);
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
                          setQrColor(e.target.value);
                        }}
                        placeholder="#000000"
                        className={cn(
                          "w-full h-12 px-4 rounded-xl border-2 text-sm font-mono font-medium transition-all",
                          isPremium ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire" : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed opacity-50"
                        )}
                        disabled={!isPremium}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={qrBgColor}
                      onChange={(e) => {
                        if (!isPremium) return;
                        setQrBgColor(e.target.value);
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
                          setQrBgColor(e.target.value);
                        }}
                        placeholder="#FFFFFF"
                        className={cn(
                          "w-full h-12 px-4 rounded-xl border-2 text-sm font-mono font-medium transition-all",
                          isPremium ? "bg-white border-neutral-border text-neutral-text focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire" : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed opacity-50"
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
                      isPremium ? "bg-white border-neutral-border text-neutral-text" : "bg-neutral-bg border-neutral-border text-neutral-muted cursor-not-allowed opacity-50"
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
                    }} 
                    isPremium={!isPremium}
                    disabled={!previewImageUrl && isPremium}
                  />
                </div>

                {isPremium && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-text mb-2 uppercase tracking-wide">
                      Logo Image
                    </label>
                    {previewImageUrl ? (
                      <div className="relative border-2 border-neutral-border rounded-xl overflow-hidden">
                        <img
                          src={previewImageUrl}
                          alt="Logo preview"
                          className="w-full h-48 object-contain bg-neutral-bg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-2 rounded-xl bg-white/90 hover:bg-white border border-neutral-border text-neutral-text transition-colors"
                          title="Remove image"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                          "border-neutral-border hover:border-electric-sapphire hover:bg-electric-sapphire/5"
                        )}
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-3">
                          <QrCode className="h-8 w-8 text-electric-sapphire/60" />
                        </div>
                        <p className="text-sm font-semibold text-neutral-text mb-1">Upload logo image</p>
                        <p className="text-xs text-neutral-muted">Recommended: Square image, max 5MB</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (fileInputRef.current) {
                              fileInputRef.current.click();
                            }
                          }}
                          className="mt-4 px-4 py-2 rounded-xl border-2 border-neutral-border text-neutral-text hover:bg-neutral-bg text-sm font-semibold transition-colors"
                        >
                          Choose Image
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleSection>

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
                disabled={loading || (!linkId && !url)}
                className={cn(
                  "h-11 px-6 rounded-xl bg-gradient-to-r from-electric-sapphire to-bright-indigo text-white text-sm font-semibold",
                  "hover:from-bright-indigo hover:to-vivid-royal disabled:opacity-30 disabled:cursor-not-allowed",
                  "transition-all active:scale-[0.98] flex items-center gap-2 shadow-button"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate QR Code
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
          <p className="text-xs text-neutral-muted">See how your QR code will look</p>
        </div>
        <div className="space-y-6">
          {previewQR ? (
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
                Download QR
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-neutral-bg to-white rounded-2xl p-8 flex items-center justify-center h-64 border-2 border-neutral-border shadow-soft">
              <div className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-electric-sapphire/10 to-bright-indigo/10 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-electric-sapphire/60" />
                </div>
                <p className="text-sm font-semibold text-neutral-muted">Enter URL or select link to see preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {createdQR && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          title="Your QR Code is ready!"
          subtitle="Scan the image below to preview your code"
          qrCode={createdQRCode}
          onDownload={handleDownloadQRFromModal}
          onCopy={handleCopyCode}
          onCustomize={() => {
            setShowSuccessModal(false);
            router.push("/dashboard/qr");
          }}
          onViewAnalytics={handleViewAnalytics}
          createAnotherText="On a roll? Don't stop now! Create another QR Code →"
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
        onClick={() => {
          if (disabled) return;
          onChange(!enabled);
        }}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
          enabled ? "bg-gradient-to-r from-electric-sapphire to-bright-indigo" : "bg-neutral-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
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
