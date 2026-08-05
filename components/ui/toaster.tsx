"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      closeButton
      gap={10}
      offset={20}
      duration={3200}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group lunr-toast flex w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-hover",
          title: "text-sm font-semibold leading-snug tracking-tight",
          description: "text-xs leading-relaxed mt-0.5 opacity-80",
          actionButton:
            "ml-auto shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold",
          cancelButton:
            "ml-auto shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium opacity-70",
          closeButton:
            "lunr-toast-close !left-auto !right-2 !top-2 !h-6 !w-6 !rounded-lg !border-0 !bg-transparent !text-current opacity-50 transition-opacity hover:opacity-100",
          success: "lunr-toast-success",
          error: "lunr-toast-error",
          warning: "lunr-toast-warning",
          info: "lunr-toast-info",
        },
      }}
    />
  );
}
