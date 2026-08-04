"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type NavigationLoaderContextValue = {
  isNavigating: boolean;
  startNavigation: (href?: string) => void;
};

const NavigationLoaderContext = createContext<NavigationLoaderContextValue>({
  isNavigating: false,
  startNavigation: () => {},
});

export function useNavigationLoader() {
  return useContext(NavigationLoaderContext);
}

function normalizePath(href: string) {
  return href.split("?")[0].split("#")[0];
}

function isInternalNavHref(href: string | null, currentPath: string) {
  if (!href) return false;
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return false;
  }
  if (!href.startsWith("/")) return false;
  return normalizePath(href) !== currentPath;
}

/** Centerline traced from lunr-mark.png (viewBox 0 0 243 243) */
const LUNR_MARK_PATH =
  "M135.0 181.0 C131.8 178.5 123.8 166.0 116.0 166.0 C108.2 166.0 96.5 179.2 88.0 181.0 C79.5 182.8 70.8 179.7 65.0 177.0 C59.2 174.3 55.8 170.3 53.0 165.0 C50.2 159.7 47.8 151.7 48.0 145.0 C48.2 138.3 49.0 134.0 54.0 125.0 C59.0 116.0 71.2 99.5 78.0 91.0 C84.8 82.5 88.7 78.5 95.0 74.0 C101.3 69.5 109.0 65.0 116.0 64.0 C123.0 63.0 133.5 67.3 137.0 68.0";

function LunrMarkLoader({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 243 243"
      className={className}
      aria-hidden
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient
          id="lunr-loader-grad"
          x1="18%"
          y1="12%"
          x2="88%"
          y2="92%"
        >
          <stop offset="0%" stopColor="#4361ee" />
          <stop offset="55%" stopColor="#3f37c9" />
          <stop offset="100%" stopColor="#f72585" />
        </linearGradient>
      </defs>

      {/* Squircle tile */}
      <rect
        x="14"
        y="14"
        width="215"
        height="215"
        rx="48"
        ry="48"
        fill="url(#lunr-loader-grad)"
      />

      {/* Glyph stroke — drawn via dash offset */}
      <path
        d={LUNR_MARK_PATH}
        fill="none"
        stroke="#111827"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="lunr-loader-path"
      />

      {/* Dot above the tip */}
      <circle
        cx="180.9"
        cy="71.1"
        r="12"
        fill="#111827"
        className="lunr-loader-dot"
      />
    </svg>
  );
}

export function NavigationLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const startedAtRef = useRef(0);
  const pathWhenStartedRef = useRef(pathname);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minVisibleMs = 720;

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const startNavigation = useCallback(
    (href?: string) => {
      if (href && !isInternalNavHref(href, pathname)) return;
      clearHideTimer();
      startedAtRef.current = Date.now();
      pathWhenStartedRef.current = pathname;
      setIsNavigating(true);
    },
    [pathname]
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!isInternalNavHref(href, pathname)) return;

      startNavigation(href || undefined);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, startNavigation]);

  useEffect(() => {
    if (!isNavigating) return;
    if (pathname === pathWhenStartedRef.current) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, minVisibleMs - elapsed);

    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, remaining);

    return clearHideTimer;
  }, [pathname, isNavigating]);

  useEffect(() => {
    if (!isNavigating) return;
    const timeout = setTimeout(() => setIsNavigating(false), 8000);
    return () => clearTimeout(timeout);
  }, [isNavigating]);

  const value = useMemo(
    () => ({ isNavigating, startNavigation }),
    [isNavigating, startNavigation]
  );

  return (
    <NavigationLoaderContext.Provider value={value}>
      {children}
      {isNavigating && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/45 backdrop-blur-[2px]"
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading"
          role="status"
        >
          <div className="lunr-loader-mark w-[72px] h-[72px] sm:w-[84px] sm:h-[84px]">
            <LunrMarkLoader className="w-full h-full" />
          </div>
        </div>
      )}
    </NavigationLoaderContext.Provider>
  );
}
