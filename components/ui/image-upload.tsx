"use client";

import { useCallback, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  pathPrefix?: "pages" | "avatars" | "qr";
  label?: string;
  helperText?: string;
  className?: string;
  aspectClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  pathPrefix = "pages",
  label,
  helperText = "JPEG, PNG, WebP, or GIF · max 5MB",
  className,
  aspectClassName = "aspect-video",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be 5MB or smaller");
        return;
      }

      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("pathPrefix", pathPrefix);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        onChange(data.publicUrl);
        toast.success("Image uploaded");
      } catch (err: any) {
        toast.error(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onChange, pathPrefix]
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void uploadFile(file);
  };

  const handleRemove = async () => {
    if (value) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicUrl: value }),
        });
      } catch {
        // Soft-fail: still clear the field locally
      }
    }
    onChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-xs font-semibold text-neutral-text uppercase tracking-wide">
          {label}
        </label>
      )}

      {value ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-neutral-border bg-neutral-bg",
            aspectClassName
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 p-3 bg-gradient-to-t from-black/50 to-transparent">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="flex-1 h-9 rounded-lg bg-white/95 text-sm font-semibold text-neutral-text hover:bg-white transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="h-9 w-9 rounded-lg bg-white/95 text-neutral-muted hover:text-red-600 hover:bg-white flex items-center justify-center transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-text" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "w-full rounded-xl border border-dashed transition-colors text-center",
            aspectClassName,
            !aspectClassName?.includes("aspect-") && "p-6 sm:p-8",
            aspectClassName?.includes("aspect-") && "p-4",
            "flex flex-col items-center justify-center gap-3",
            dragOver
              ? "border-neutral-text bg-neutral-bg"
              : "border-neutral-border bg-white hover:bg-neutral-bg/60",
            uploading && "opacity-70 cursor-wait"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-neutral-muted" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-neutral-bg border border-neutral-border flex items-center justify-center shrink-0">
                {dragOver ? (
                  <Upload className="h-5 w-5 text-neutral-text" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-neutral-muted" />
                )}
              </div>
              <div className="w-full min-w-0 px-1">
                <p className="text-sm font-semibold text-neutral-text text-balance">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-neutral-muted mt-1 text-balance">
                  {helperText}
                </p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
