import { useEffect, useMemo, useState } from "react";
import { useMotionReveal } from "./useMotionReveal";
import { getCurrentRoute, LOCATION_CHANGE_EVENT, navigateTo } from "../utils/navigation";

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
  const [route, setRoute] = useState(() => getCurrentRoute());

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getCurrentRoute());
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
    };
  }, []);

  // navigateTo() tự phát event "soundwave:navigate" (cancelable) để trang có thay đổi chưa lưu chặn lại
  const navigate = (path: string) => navigateTo(path);

  const [pathname, queryString] = route.split("?");
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
