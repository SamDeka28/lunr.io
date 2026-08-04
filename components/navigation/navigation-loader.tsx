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
import dynamic from "next/dynamic";
import navLoaderAnimation from "./nav-loader.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

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
  const minVisibleMs = 320;

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

  // Catch all in-app link clicks across the dashboard
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

  // Hide only after the route actually changes
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

  // Safety: never leave the overlay stuck
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-[4px]"
          aria-live="polite"
          aria-busy="true"
          role="status"
        >
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/95 px-10 py-8 shadow-soft border border-neutral-border">
            <div className="w-[120px] h-[120px]">
              <Lottie
                animationData={navLoaderAnimation}
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <p className="text-sm font-semibold text-neutral-text tracking-tight">
              Loading…
            </p>
          </div>
        </div>
      )}
    </NavigationLoaderContext.Provider>
  );
}
