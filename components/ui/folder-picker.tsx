"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Folder, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FolderPickerProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  /** Allow typing a folder that isn't in the list (create/edit). */
  allowCreate?: boolean;
  /** Empty-state label when value is cleared (filter: "All folders"). */
  emptyLabel?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  /** Compact pill trigger for toolbars. */
  compact?: boolean;
  id?: string;
}

type MenuCoords = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function FolderPicker({
  value,
  options,
  onChange,
  allowCreate = false,
  emptyLabel = "No folder",
  placeholder = "Select folder",
  className,
  triggerClassName,
  disabled = false,
  compact = false,
  id,
}: FolderPickerProps) {
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sorted = useMemo(
    () =>
      [...options].sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      ),
    [options]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((o) => o.toLowerCase().includes(q));
  }, [sorted, query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return sorted.some((o) => o.toLowerCase() === q);
  }, [sorted, query]);

  const canCreate = allowCreate && query.trim() && !exactMatch;

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const padding = 8;
    const preferredWidth = Math.max(rect.width, compact ? 256 : rect.width);
    const width = Math.min(preferredWidth, window.innerWidth - padding * 2);
    const spaceBelow = window.innerHeight - rect.bottom - gap - padding;
    const spaceAbove = rect.top - gap - padding;
    const preferBottom = spaceBelow >= 180 || spaceBelow >= spaceAbove;
    const maxHeight = Math.max(160, Math.min(320, preferBottom ? spaceBelow : spaceAbove));

    let left = rect.left;
    if (compact && left + width > window.innerWidth - padding) {
      left = rect.right - width;
    }
    left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));

    if (preferBottom) {
      setCoords({
        top: rect.bottom + gap,
        left,
        width,
        maxHeight,
      });
    } else {
      setCoords({
        bottom: window.innerHeight - rect.top + gap,
        left,
        width,
        maxHeight,
      });
    }
  }, [compact]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScrollOrResize = () => updatePosition();
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, close, updatePosition]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const select = (next: string) => {
    onChange(next);
    close();
  };

  const display = value || emptyLabel;

  const menu =
    mounted &&
    open &&
    coords &&
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
          width: coords.width,
          maxHeight: coords.maxHeight,
          zIndex: 9999,
        }}
        className="bg-white rounded-2xl border border-neutral-border/80 shadow-float overflow-hidden flex flex-col"
      >
        <div className="p-2 border-b border-neutral-border/60 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-muted" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (canCreate) select(query.trim());
                  else if (filtered.length === 1) select(filtered[0]);
                  else if (exactMatch) {
                    const match = sorted.find(
                      (o) => o.toLowerCase() === query.trim().toLowerCase()
                    );
                    if (match) select(match);
                  }
                }
              }}
              placeholder={
                allowCreate ? "Search or create folder…" : "Search folders…"
              }
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-neutral-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
          </div>
        </div>

        <ul
          id={listId}
          role="listbox"
          className="overflow-y-auto py-1 min-h-0 flex-1"
        >
          <li role="option" aria-selected={!value}>
            <button
              type="button"
              onClick={() => select("")}
              className={cn(
                "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                !value
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-neutral-muted hover:bg-neutral-bg"
              )}
            >
              <span className="flex-1 truncate">{emptyLabel}</span>
              {!value && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>
          </li>

          {filtered.map((opt) => (
            <li key={opt} role="option" aria-selected={value === opt}>
              <button
                type="button"
                onClick={() => select(opt)}
                title={opt}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                  value === opt
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-neutral-text hover:bg-neutral-bg"
                )}
              >
                <span className="flex-1 truncate">{opt}</span>
                {value === opt && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </li>
          ))}

          {canCreate && (
            <li role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => select(query.trim())}
                className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-primary/5 font-semibold border-t border-neutral-border/60"
              >
                Create “{query.trim()}”
              </button>
            </li>
          )}

          {filtered.length === 0 && !canCreate && (
            <li className="px-3 py-4 text-center text-xs text-neutral-muted">
              {sorted.length === 0
                ? "No folders yet"
                : "No folders match your search"}
            </li>
          )}
        </ul>
      </div>,
      document.body
    );

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => {
            if (!v) updatePosition();
            return !v;
          });
        }}
        className={cn(
          "w-full flex items-center gap-2 text-left transition-all",
          compact
            ? cn(
                "h-10 sm:h-[42px] px-3 sm:px-4 rounded-full border text-sm font-semibold shadow-soft",
                value
                  ? "border-primary/30 text-primary bg-primary/10"
                  : "border-neutral-border/80 bg-white text-neutral-text hover:border-primary/30 hover:text-primary"
              )
            : cn(
                "h-12 px-4 rounded-xl bg-white border-2 border-neutral-border",
                "text-sm font-medium text-neutral-text",
                "focus:outline-none focus:ring-2 focus:ring-electric-sapphire/40 focus:border-electric-sapphire",
                "hover:border-neutral-text/25"
              ),
          disabled && "opacity-50 cursor-not-allowed",
          triggerClassName
        )}
      >
        <Folder className="h-4 w-4 shrink-0 text-neutral-muted" />
        <span
          className={cn(
            "flex-1 min-w-0 truncate",
            !value && "text-neutral-muted"
          )}
          title={value || undefined}
        >
          {value ? value : compact ? "Folder" : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear folder"
            onClick={(e) => {
              e.stopPropagation();
              select("");
            }}
            className="shrink-0 p-0.5 rounded hover:bg-black/5 text-neutral-muted hover:text-neutral-text"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {menu}

      <span className="sr-only">{display}</span>
    </div>
  );
}
