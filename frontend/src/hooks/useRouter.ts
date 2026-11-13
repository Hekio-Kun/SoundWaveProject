import { useEffect, useMemo, useState } from "react";
import { useMotionReveal } from "./useMotionReveal";

export interface AppRouterState {
  route: string;
  pathname: string;
  queryString: string;
  queryParams: URLSearchParams;
  navigate: (path: string) => void;
  isAuthRoute: boolean;
  isDashboardRoute: boolean;
  isMusicRoute: boolean;
  isExploreRoute: boolean;
}

export function useRouter(): AppRouterState {
  const [route, setRoute] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (path: string) => {
    const target = path.startsWith("#") ? path : `#${path.startsWith("/") ? path : `/${path}`}`;
    const cleanTarget = path.startsWith("#") ? path.slice(1) : (path.startsWith("/") ? path : `/${path}`);

    // Dispatch a cancelable navigation event so active pages with unsaved changes can intercept
    const event = new CustomEvent("soundwave:navigate", {
      cancelable: true,
      detail: { to: cleanTarget },
    });
    const allowed = window.dispatchEvent(event);
    if (!allowed) {
      return;
    }

    window.location.hash = target;
  };

  const cleanRoute = route.startsWith("#") ? route.slice(1) : route;
  const [pathname, queryString] = cleanRoute.split("?");
  const queryParams = useMemo(() => new URLSearchParams(queryString || ""), [queryString]);

  useMotionReveal(pathname);

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/staff/login" ||
    pathname === "/staff-login";

  const isDashboardRoute = (pathname.startsWith("/admin") || pathname.startsWith("/staff")) && !isAuthRoute;
  const isMusicRoute = !isAuthRoute && !isDashboardRoute;
  const isExploreRoute =
    pathname === "/" ||
    pathname === "" ||
    pathname === "/home" ||
    pathname === "/explore" ||
    pathname === "/landing";

  return {
    route,
    pathname,
    queryString,
    queryParams,
    navigate,
    isAuthRoute,
    isDashboardRoute,
    isMusicRoute,
    isExploreRoute,
  };
}
