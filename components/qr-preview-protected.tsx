"use client";

import { useEffect, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Renders a QR preview that cannot be downloaded cleanly:
 * - Clean data URL is never mounted as <img src>
 * - Watermark is baked into a canvas bitmap
 * - Context menu / drag / selection blocked
 */
export function ProtectedQrPreview({
  src,
  size = 176,
  className,
  label = "Preview only",
  watermark = "PREVIEW",
  brand = "lunr.to",
}: {
  src: string;
  size?: number;
  className?: string;
  label?: string;
  watermark?: string;
  brand?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src) {
      setReady(false);
      return;
    }

    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      // Soft veil so screenshots aren't scannable as-is (keep center readable for logo)
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillRect(0, 0, size, size);

      // Diagonal repeating watermark — skip a hole around the logo center
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(26, 26, 46, 0.2)";
      ctx.font = `bold ${Math.max(14, Math.round(size * 0.11))}px system-ui, sans-serif`;
      const step = Math.round(size * 0.38);
      const logoClear = size * 0.18;
      for (let y = -size; y <= size; y += step) {
        for (let x = -size; x <= size; x += step * 1.6) {
          // Avoid stamping directly over the logo zone (after rotation, origin is center)
          if (Math.hypot(x, y) < logoClear) continue;
          ctx.fillText(watermark, x, y);
        }
      }
      ctx.restore();

      // Top badge — leaves the center logo visible
      const badgeW = Math.min(size * 0.72, 130);
      const badgeH = Math.max(20, size * 0.12);
      const bx = (size - badgeW) / 2;
      const by = Math.max(8, size * 0.045);
      ctx.fillStyle = "rgba(26, 26, 46, 0.78)";
      roundRect(ctx, bx, by, badgeW, badgeH, 8);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `600 ${Math.max(10, Math.round(size * 0.06))}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, size / 2, by + badgeH / 2);

      // Brand stamp along bottom edge
      ctx.fillStyle = "rgba(67, 97, 238, 0.55)";
      ctx.font = `600 ${Math.max(10, Math.round(size * 0.07))}px system-ui, sans-serif`;
      ctx.fillText(brand, size / 2, size - Math.max(10, size * 0.06));

      setReady(true);
    };
    img.onerror = () => {
      if (!cancelled) setReady(false);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, size, watermark, brand, label]);

  return (
    <div
      className={cn(
        "relative mx-auto select-none",
        className
      )}
      style={{ width: size, height: size }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "rounded-2xl shadow-soft bg-white pointer-events-none",
          !ready && "opacity-0"
        )}
        aria-label="QR code preview (watermarked)"
      />
      {!ready && (
        <div className="absolute inset-0 rounded-2xl bg-neutral-bg animate-pulse" />
      )}
      {/* Opaque interaction shield — blocks inspect/drag of the canvas */}
      <div
        className="absolute inset-0 rounded-2xl"
        onContextMenu={(e) => e.preventDefault()}
        aria-hidden
      />
      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 translate-y-full pt-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-muted whitespace-nowrap">
        <Lock className="h-3 w-3" />
        Create to unlock download
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
