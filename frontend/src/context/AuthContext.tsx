import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi, type AuthSession } from "../api/auth";
import { clearAccessToken, setAccessToken } from "../api/client";
import type { ProfileDetails } from "../api/profile";
import type { CurrentUser } from "../types";

export interface AuthContextType {
  user: CurrentUser | null;
  authReady: boolean;
  isAuthenticated: boolean;
  logoutDialogOpen: boolean;
  logoutSubmitting: boolean;
  logoutNotice: string;
  handleLoginSuccess: (session: AuthSession, rememberMe?: boolean) => void;
  handleProfileUpdated: (profile: ProfileDetails) => void;
  requestLogout: () => void;
  cancelLogout: () => void;
  confirmLogout: () => Promise<void>;
  setLogoutNotice: (notice: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const [logoutNotice, setLogoutNotice] = useState("");

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    let active = true;
    localStorage.removeItem("soundwave_user");
    localStorage.removeItem("soundwave_access_token");
    sessionStorage.removeItem("soundwave_user");
    sessionStorage.removeItem("soundwave_access_token");

    void authApi.refresh()
      .then((session) => {
        if (active) setUser(session.user);
      })
      .catch(() => {
        clearAccessToken();
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!logoutNotice) return;
    const timeoutId = window.setTimeout(() => setLogoutNotice(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [logoutNotice]);

  const handleLoginSuccess = useCallback((session: AuthSession, _rememberMe: boolean = false) => {
    const loggedInUser: CurrentUser = {
      ...session.user,
      avatarUrl: session.user.avatarUrl,
    };
    setAccessToken(session.accessToken);
    setUser(loggedInUser);
    localStorage.removeItem("soundwave_user");
    localStorage.removeItem("soundwave_access_token");
    sessionStorage.removeItem("soundwave_user");
    sessionStorage.removeItem("soundwave_access_token");
    window.location.hash =
      session.user.role === "ADMIN"
        ? "#/admin/dashboard"
        : session.user.role === "STAFF"
        ? "#/staff/dashboard"
        : "#/";
  }, []);

  const handleProfileUpdated = useCallback((profile: ProfileDetails) => {
    setUser((current) => {
      if (!current) return current;
      const updatedUser: CurrentUser = {
        ...current,
        id: profile.userId,
        userId: profile.userId,
        email: profile.email,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        role: profile.role,
        bio: profile.bio ?? undefined,
        dateOfBirth: profile.dateOfBirth ?? undefined,
        countryCode: profile.countryCode ?? undefined,
      };
      return updatedUser;
    });
  }, []);

  const requestLogout = useCallback(() => {
    setLogoutDialogOpen(true);
  }, []);

  const cancelLogout = useCallback(() => {
    setLogoutDialogOpen(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    setLogoutSubmitting(true);
    let serverSessionRevoked = true;
    try {
      await authApi.logout();
    } catch {
      serverSessionRevoked = false;
    } finally {
      setUser(null);
      clearAccessToken();
      localStorage.removeItem("soundwave_user");
      localStorage.removeItem("soundwave_access_token");
      sessionStorage.removeItem("soundwave_user");
      sessionStorage.removeItem("soundwave_access_token");
      setLogoutSubmitting(false);
      setLogoutDialogOpen(false);
      setLogoutNotice(
        serverSessionRevoked
          ? "You have logged out successfully."
          : "You have been logged out from this device."
      );
      window.location.hash = "#/";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAuthenticated,
        logoutDialogOpen,
        logoutSubmitting,
        logoutNotice,
        handleLoginSuccess,
        handleProfileUpdated,
        requestLogout,
        cancelLogout,
        confirmLogout,
        setLogoutNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
