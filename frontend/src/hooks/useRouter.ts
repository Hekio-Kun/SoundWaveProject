import { useCallback, useEffect, useMemo, useState } from "react";
import { useMotionReveal } from "./useMotionReveal";
import {
  getCurrentRoute,
  getRouteReloadKey,
  LOCATION_CHANGE_EVENT,
  navigateTo,
  type NavigateOptions,
} from "../utils/navigation";

export interface AppRouterState {
  route: string;
  pathname: string;
  queryString: string;
  queryParams: URLSearchParams;
  reloadKey: number;
  navigate: (path: string, options?: NavigateOptions) => void;
  isAuthRoute: boolean;
  isDashboardRoute: boolean;
  isMusicRoute: boolean;
  isExploreRoute: boolean;
}

export function useRouter(): AppRouterState {
  const [route, setRoute] = useState(() => getCurrentRoute());
  const [reloadKey, setReloadKey] = useState(() => getRouteReloadKey());

  useEffect(() => {
    const handlePopState = () => {
      const event = new CustomEvent("soundwave:back", { cancelable: true });
      const notCancelled = window.dispatchEvent(event);
      if (!notCancelled) {
        // Navigation was intercepted by an unsaved changes guard
        window.history.pushState(null, "", route);
        return;
      }
      setRoute(getCurrentRoute());
      setReloadKey(getRouteReloadKey());
    };
    const handleLocationChange = () => {
      setRoute(getCurrentRoute());
      setReloadKey(getRouteReloadKey());
    };
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
    };
  }, [route]);

  // navigateTo() tự phát event "soundwave:navigate" (cancelable) để trang có thay đổi chưa lưu chặn lại
  const navigate = useCallback((path: string, options?: NavigateOptions) => navigateTo(path, options), []);

  const [pathname, queryString] = route.split("?");
  const queryParams = useMemo(() => new URLSearchParams(queryString || ""), [queryString]);

  useMotionReveal(`${pathname}-${reloadKey}`);

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
    reloadKey,
    navigate,
    isAuthRoute,
    isDashboardRoute,
    isMusicRoute,
    isExploreRoute,
  };
}
