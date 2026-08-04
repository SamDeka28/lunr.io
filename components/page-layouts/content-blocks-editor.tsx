"use client";

import { useState } from "react";
import { Plus, Trash2, Video, Type, Mail, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PageBlock, PageBlockType } from "@/lib/utils/page-blocks";
import { createBlockId } from "@/lib/utils/page-blocks";

interface ContentBlocksEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

export function ContentBlocksEditor({ blocks, onChange }: ContentBlocksEditorProps) {
  const [adding, setAdding] = useState<PageBlockType | null>(null);

  const addBlock = (type: PageBlockType) => {
    const id = createBlockId(type);
    let next: PageBlock;
    if (type === "video") {
      next = { id, type, url: "", title: "" };
    } else if (type === "text") {
      next = { id, type, content: "" };
    } else {
      next = {
        id,
        type: "email_capture",
        heading: "Stay in the loop",
        buttonText: "Subscribe",
        placeholder: "you@example.com",
      };
    }
    onChange([...blocks, next]);
    setAdding(null);
  };

  const updateBlock = (index: number, patch: Partial<PageBlock>) => {
    const next = blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as PageBlock) : b));
    onChange(next);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-text uppercase tracking-wide">
          Content Blocks ({blocks.length})
        </label>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding("text")}
            className="text-xs text-neutral-text hover:opacity-70 font-semibold flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {adding && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl border border-neutral-border bg-neutral-bg">
          {(
            [
              { type: "text" as const, label: "Text", icon: Type },
              { type: "video" as const, label: "Video", icon: Video },
              { type: "email_capture" as const, label: "Email", icon: Mail },
            ] as const
          ).map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-border bg-white hover:bg-neutral-bg transition-colors"
            >
              <Icon className="h-4 w-4 text-neutral-muted" />
              <span className="text-xs font-semibold text-neutral-text">{label}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAdding(null)}
            className="col-span-3 text-xs text-neutral-muted font-medium mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-xl border border-neutral-border bg-white p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-muted uppercase tracking-wide">
                <GripVertical className="h-3.5 w-3.5" />
                {block.type === "email_capture" ? "Email capture" : block.type}
              </div>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="p-1 rounded-lg hover:bg-red-50 text-neutral-muted hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {block.type === "video" && (
              <>
                <input
                  type="url"
                  value={block.url}
                  onChange={(e) => updateBlock(index, { url: e.target.value })}
                  placeholder="YouTube or Vimeo URL"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                />
                <input
                  type="text"
                  value={block.title || ""}
                  onChange={(e) => updateBlock(index, { title: e.target.value })}
                  placeholder="Optional title"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                />
              </>
            )}

            {block.type === "text" && (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(index, { content: e.target.value })}
                placeholder="Write something… Use **bold** or *italic*"
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-neutral-border bg-white text-sm resize-none"
              />
            )}

            {block.type === "email_capture" && (
              <>
                <input
                  type="text"
                  value={block.heading || ""}
                  onChange={(e) => updateBlock(index, { heading: e.target.value })}
                  placeholder="Heading"
                  className="w-full h-9 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={block.placeholder || ""}
                    onChange={(e) => updateBlock(index, { placeholder: e.target.value })}
                    placeholder="Input placeholder"
                    className="w-full h-9 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                  />
                  <input
                    type="text"
                    value={block.buttonText || ""}
                    onChange={(e) => updateBlock(index, { buttonText: e.target.value })}
                    placeholder="Button text"
                    className="w-full h-9 px-3 rounded-xl border border-neutral-border bg-white text-sm"
                  />
                </div>
              </>
            )}
          </div>
        ))}

        {blocks.length === 0 && !adding && (
          <p className={cn("text-xs text-neutral-muted text-center py-3")}>
            Add video, text, or email capture blocks
          </p>
        )}
      </div>
    </div>
  );
}
