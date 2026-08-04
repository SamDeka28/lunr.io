"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (result: {
    created: number;
    failed: number;
    stopped_due_to_limit: boolean;
  }) => void;
}

type ParsedRow = {
  original_url: string;
  title?: string;
  short_code?: string;
  tags?: string[];
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseBulkInput(text: string): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const firstCells = parseCsvLine(lines[0]).map((c) => c.toLowerCase());
  const hasHeader =
    firstCells.includes("url") ||
    firstCells.includes("original_url") ||
    firstCells.includes("title") ||
    firstCells.includes("short_code");

  let urlIdx = 0;
  let titleIdx = 1;
  let shortCodeIdx = 2;
  let tagsIdx = -1;
  let start = 0;

  if (hasHeader) {
    urlIdx = firstCells.findIndex((c) => c === "url" || c === "original_url");
    titleIdx = firstCells.findIndex((c) => c === "title");
    shortCodeIdx = firstCells.findIndex(
      (c) => c === "short_code" || c === "shortcode" || c === "code"
    );
    tagsIdx = firstCells.findIndex((c) => c === "tags");
    if (urlIdx < 0) urlIdx = 0;
    start = 1;
  }

  const rows: ParsedRow[] = [];
  for (let i = start; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const original_url = cells[urlIdx]?.trim();
    if (!original_url) continue;

    const title = titleIdx >= 0 ? cells[titleIdx]?.trim() : undefined;
    const short_code =
      shortCodeIdx >= 0 ? cells[shortCodeIdx]?.trim() : undefined;
    const tagsRaw = tagsIdx >= 0 ? cells[tagsIdx]?.trim() : undefined;
    const tags = tagsRaw
      ? tagsRaw
          .split(/[|;]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    rows.push({
      original_url,
      ...(title ? { title } : {}),
      ...(short_code ? { short_code } : {}),
      ...(tags?.length ? { tags } : {}),
    });
  }

  return rows;
}

export function BulkImportModal({
  open,
  onClose,
  onComplete,
}: BulkImportModalProps) {
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    failed: number;
    stopped_due_to_limit: boolean;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = async (file: File) => {
    const text = await file.text();
    setCsvText(text);
    setResult(null);
  };

  const handleImport = async () => {
    const links = parseBulkInput(csvText);
    if (links.length === 0) {
      toast.error("No valid rows found. Use columns: url, title, short_code");
      return;
    }
    if (links.length > 100) {
      toast.error("Maximum 100 links per import");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/links/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Bulk import failed");
      }

      const summary = data.summary || {
        created: data.created?.length || 0,
        failed: data.failed?.length || 0,
        stopped_due_to_limit: false,
      };

      const errors = (data.failed || [])
        .slice(0, 5)
        .map(
          (f: any) =>
            `Row ${f.index + 1}${f.original_url ? ` (${f.original_url})` : ""}: ${f.error}`
        );

      setResult({
        created: summary.created,
        failed: summary.failed,
        stopped_due_to_limit: summary.stopped_due_to_limit,
        errors,
      });

      if (summary.created > 0) {
        toast.success(`Created ${summary.created} link${summary.created === 1 ? "" : "s"}`);
      }
      if (summary.stopped_due_to_limit) {
        toast.warning("Stopped early — plan link limit reached");
      } else if (summary.failed > 0 && summary.created === 0) {
        toast.error("No links were created");
      }

      onComplete?.(summary);
    } catch (err: any) {
      toast.error(err.message || "Bulk import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-border shadow-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-text">Bulk import</h2>
            <p className="text-sm text-neutral-muted mt-1">
              Paste CSV or upload a file. Columns:{" "}
              <code className="text-xs">url, title, short_code</code> (max 100)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-neutral-bg text-neutral-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <textarea
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            setResult(null);
          }}
          rows={8}
          placeholder={`url,title,short_code\nhttps://example.com,My Link,my-code\nhttps://another.com,Another`}
          className={cn(
            "w-full px-3 py-2 rounded-xl border-2 border-neutral-border bg-white",
            "text-sm font-mono text-neutral-text",
            "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire"
          )}
          disabled={loading}
        />

        <div className="mt-3 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-3 py-2 rounded-xl border-2 border-neutral-border text-sm font-semibold text-neutral-text hover:border-electric-sapphire hover:text-electric-sapphire flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Upload CSV
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={loading || !csvText.trim()}
            className={cn(
              "ml-auto px-4 py-2 rounded-xl text-sm font-semibold text-white",
              "bg-gradient-to-r from-electric-sapphire to-bright-indigo",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-2"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-3 rounded-xl bg-neutral-bg border border-neutral-border text-sm space-y-1">
            <p className="font-semibold text-neutral-text">
              Created {result.created}, failed {result.failed}
              {result.stopped_due_to_limit ? " (limit reached)" : ""}
            </p>
            {result.errors.map((err, i) => (
              <p key={i} className="text-xs text-neutral-muted">
                {err}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
