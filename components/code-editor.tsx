"use client";

import { useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { useState } from "react";

interface CodeEditorProps {
  code: string;
  language: string;
  onCopy?: () => void;
  height?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
}

export function CodeEditor({ 
  code, 
  language, 
  onCopy, 
  height, 
  className,
  minHeight = 100,
  maxHeight = 600,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);

  // Calculate height based on content
  const calculatedHeight = useMemo(() => {
    if (height) return height;
    
    const lines = code.split("\n").length;
    const lineHeight = 19; // Monaco default line height
    const padding = 32; // Top and bottom padding
    const calculated = lines * lineHeight + padding;
    
    // Clamp between min and max
    return Math.max(minHeight, Math.min(maxHeight, calculated));
  }, [code, height, minHeight, maxHeight]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const getMonacoLanguage = (lang: string): string => {
    const langMap: Record<string, string> = {
      curl: "shell",
      javascript: "javascript",
      python: "python",
      php: "php",
      json: "json",
      bash: "shell",
      shell: "shell",
    };
    return langMap[lang.toLowerCase()] || "plaintext";
  };

  return (
    <div className={cn("relative border border-neutral-border rounded-lg overflow-hidden bg-[#1e1e1e]", className)}>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#3d3d3d] rounded-lg text-neutral-300 hover:text-white transition-colors shadow-sm"
          title="Copy code"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <Editor
        height={calculatedHeight}
        language={getMonacoLanguage(language)}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          lineDecorationsWidth: 0,
          lineNumbersWidth: 40,
          folding: true,
          wordWrap: "on",
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "none",
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          overviewRulerLanes: 0,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
          },
        }}
        onMount={(editor) => {
          editorRef.current = editor;
        }}
      />
    </div>
  );
}

