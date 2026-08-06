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
import { cn } from "@/lib/utils/cn";

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

/** Brand mark — full lunr-mark.png (glyph is a cutout in the asset). */
function LunrMarkLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Soft ambient bloom */}
      <div
        className="lunr-loader-halo absolute inset-[-18%] rounded-[28%] bg-gradient-to-br from-electric-sapphire/30 via-bright-indigo/20 to-neon-pink/30 blur-2xl"
        aria-hidden
      />
      {/* Spinning progress ring */}
      <div
        className="lunr-loader-ring absolute inset-[-7%] rounded-[26%]"
        aria-hidden
      />
      <img
        src="/lunr-mark.png"
        alt=""
        width={243}
        height={243}
        draggable={false}
        className="lunr-loader-mark-img relative h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(67,97,238,0.28)] select-none"
      />
      {/* Soft shine sweep */}
      <div className="lunr-loader-shine pointer-events-none absolute inset-0 overflow-hidden rounded-[22%]" aria-hidden>
        <div className="lunr-loader-shine-beam" />
      </div>
    </div>
  );
}

export function NavigationLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const startedAtRef = useRef(0);
  const pathWhenStartedRef = useRef(pathname);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minVisibleMs = 680;
  const exitMs = 220;

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const clearExitTimer = () => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  };

  const finishNavigation = useCallback(() => {
    setIsExiting(true);
    clearExitTimer();
    exitTimerRef.current = setTimeout(() => {
      setIsNavigating(false);
      setIsExiting(false);
    }, exitMs);
  }, []);

  const startNavigation = useCallback(
    (href?: string) => {
      if (href && !isInternalNavHref(href, pathname)) return;
      clearHideTimer();
      clearExitTimer();
      startedAtRef.current = Date.now();
      pathWhenStartedRef.current = pathname;
      setIsExiting(false);
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
    if (!isNavigating || isExiting) return;
    if (pathname === pathWhenStartedRef.current) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, minVisibleMs - elapsed);

    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      finishNavigation();
    }, remaining);

    return clearHideTimer;
  }, [pathname, isNavigating, isExiting, finishNavigation]);

  useEffect(() => {
    if (!isNavigating || isExiting) return;
    const timeout = setTimeout(() => finishNavigation(), 8000);
    return () => clearTimeout(timeout);
  }, [isNavigating, isExiting, finishNavigation]);

  useEffect(() => {
    return () => {
      clearHideTimer();
      clearExitTimer();
    };
  }, []);

  const value = useMemo(
    () => ({ isNavigating, startNavigation }),
    [isNavigating, startNavigation]
  );

  const showOverlay = isNavigating;

  return (
    <NavigationLoaderContext.Provider value={value}>
      {children}
      {showOverlay && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex flex-col pointer-events-none",
            isExiting ? "lunr-loader-overlay-out" : "lunr-loader-overlay-in"
          )}
          aria-live="polite"
          aria-busy="true"
          aria-label="Loading"
          role="status"
        >
          {/* Thin brand progress rail */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] overflow-hidden bg-transparent">
            <div className="lunr-loader-bar h-full w-1/3 rounded-full bg-gradient-to-r from-electric-sapphire via-bright-indigo to-neon-pink" />
          </div>

          <div className="flex-1 flex items-center justify-center bg-white/50 backdrop-blur-[3px]">
            <div className="lunr-loader-mark relative flex flex-col items-center gap-4">
              <div className="relative w-[76px] h-[76px] sm:w-[88px] sm:h-[88px]">
                <LunrMarkLoader className="h-full w-full" />
              </div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-neutral-muted/90 lunr-loader-caption">
                Loading
              </p>
            </div>
          </div>
        </div>
      )}
    </NavigationLoaderContext.Provider>
  );
}
