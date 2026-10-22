import { useState, useEffect, type FormEvent } from "react";
import { AuthApiError, authApi, getAuthErrorMessage, type AuthSession } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import {
  ActivityIcon,
  AlertIcon,
  ChevronLeftIcon,
  LockIcon,
  LogoutIcon,
  MailIcon,
  ShieldIcon,
  ZapIcon,
} from "../icons";

type StaffLoginPageProps = {
  onLoginSuccess: (session: AuthSession, rememberMe: boolean) => void;
  onNavigate: (route: string) => void;
};

type FieldErrors = Record<string, string>;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function focusFirstInvalid(errors: FieldErrors) {
  const firstInvalidId = Object.keys(errors).find((key) => errors[key]);
  if (firstInvalidId) {
    window.requestAnimationFrame(() => {
      document.getElementById(firstInvalidId)?.focus();
    });
  }
}

export function StaffLoginPage({ onLoginSuccess, onNavigate }: StaffLoginPageProps) {
  const { user, isAuthenticated, requestLogout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [listenerRejectedError, setListenerRejectedError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState<"admin" | "staff" | null>(null);

  // Auto redirect if already authenticated with administrative or staff privileges
  useEffect(() => {
    if (user?.role === "ADMIN") {
      window.location.hash = "#/admin/dashboard";
    } else if (user?.role === "STAFF" || user?.role === "MODERATOR") {
      window.location.hash = "#/staff/dashboard";
    }
  }, [user]);

  const handleFillDemo = (demoType: "admin" | "staff", demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setActiveDemo(demoType);
    setErrors({});
    setApiError("");
    setListenerRejectedError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors["staff-email"] = "Please enter your official work email.";
    } else if (!emailPattern.test(email.trim())) {
      nextErrors["staff-email"] = "Please enter a valid work email address format.";
    }

    if (!password) {
      nextErrors["staff-password"] = "Please enter your operational security password.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstInvalid(nextErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setListenerRejectedError(null);
    setSubmitting(true);

    try {
      const session = await authApi.login(email.trim(), password, rememberMe, "STAFF");

      // Strict role enforcement: Only STAFF or ADMIN are granted entry to this portal
      if (session.user.role === "LISTENER") {
        try {
          await authApi.logout();
        } catch {
          // Ignore transient session cleanup errors
        }

        setListenerRejectedError(
          `Account "${session.user.email}" possesses standard Listener permissions. Access to the Operations Portal is strictly reserved for Staff and System Administrators.`
        );
        return;
      }

      // Valid administrative session
      onLoginSuccess(session, rememberMe);

      if (session.user.role === "ADMIN") {
        window.location.hash = "#/admin/dashboard";
      } else {
        window.location.hash = "#/staff/dashboard";
      }
    } catch (error) {
      if (error instanceof AuthApiError) {
        if (error.code === "LISTENER_ACCOUNT_NOT_ALLOWED") {
          setListenerRejectedError(
            error.message ||
              "This account possesses standard Listener permissions. Access to the Operations Portal is strictly reserved for Staff and System Administrators."
          );
        } else if (error.code === "LOGIN_LOCKED") {
          setApiError(
            "Account temporarily locked due to consecutive failed attempts. Contact System Administrator for security unlock."
          );
        } else if (error.code === "ACCOUNT_BANNED") {
          setApiError("This staff account has been suspended by System Administration.");
        } else {
          setApiError(error.message || "Invalid work credentials or unauthorized access.");
        }
      } else {
        setApiError(getAuthErrorMessage(error, "Unable to establish connection with SoundWave authentication service."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-v2-experience">
      {/* Operations Story / Command Center Panel (Left Column) */}
      <section className="auth-v2-story ops-auth-story" aria-label="SoundWave Operations Command">
        <div className="auth-v2-orbit auth-v2-orbit--one" />
        <div className="auth-v2-orbit auth-v2-orbit--two" />

        <button
          type="button"
          className="auth-v2-brand"
          onClick={() => onNavigate("/")}
          aria-label="Return to SoundWave Explore"
        >
          <img src="/soundwave-logo.png" alt="SoundWave" />
          <span>SoundWave</span>
          <span className="ops-auth-env-pill">Operations</span>
        </button>

        <div className="auth-v2-story-content">
          <span className="auth-v2-story-tag">
            <ShieldIcon width={14} height={14} /> RESTRICTED OPERATIONS GATEWAY
          </span>

          <h2>
            Unified Governance for<br />
            <span>Platform & Creators.</span>
          </h2>

          <p>
            Dedicated operational environment for SoundWave Staff and System Administrators
            to supervise music moderation, review submissions, and manage system telemetry.
          </p>

          {/* Operations Live Status Widget */}
          <div className="ops-auth-telemetry" role="status">
            <div className="ops-telemetry-top">
              <span className="ops-pulse-badge">
                <i className="ops-pulse-dot" /> SYSTEM OPERATIONAL
              </span>
              <small>TLS 1.3 · ENCRYPTED</small>
            </div>

            <div className="ops-telemetry-grid">
              <div className="ops-telemetry-item">
                <span className="ops-telemetry-icon ops-telemetry-icon--blue">
                  <ShieldIcon width={18} height={18} />
                </span>
                <div>
                  <strong>Track Moderation</strong>
                  <small>Submission review queue</small>
                </div>
              </div>

              <div className="ops-telemetry-item">
                <span className="ops-telemetry-icon ops-telemetry-icon--sand">
                  <ActivityIcon width={18} height={18} />
                </span>
                <div>
                  <strong>System Governance</strong>
                  <small>Staff role enforcement</small>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-v2-trust-row">
            <span>
              <ShieldIcon width={16} height={16} />
              <b>Role-Based Access</b>
              <small>Admin & Staff privileged scope</small>
            </span>
            <span>
              <LockIcon width={16} height={16} />
              <b>Audit Trail Logged</b>
              <small>All operations securely tracked</small>
            </span>
          </div>
        </div>
      </section>

      {/* Operations Workspace (Right Column) */}
      <section className="auth-v2-workspace">
        {/* Top Navigation Controls */}
        <button
          type="button"
          className="auth-v2-back-home"
          onClick={() => onNavigate("/")}
        >
          <ChevronLeftIcon width={16} height={16} />
          Back to Explore
        </button>

        <button
          type="button"
          className="auth-v2-switch-portal"
          onClick={() => onNavigate("/login")}
        >
          <span>Listener Portal</span>
          <span>→</span>
        </button>

        <div className="auth-v2-card">
          <div className="auth-v2-heading">
            <span>SECURE OPERATIONS ACCESS</span>
            <h1>Staff & Admin Login</h1>
            <p>
              Please enter your authorized credentials to access moderation queues and administrative tools.
            </p>
          </div>

          {/* Active Listener Session Warning Banner */}
          {isAuthenticated && user?.role === "LISTENER" && (
            <div className="ops-listener-alert" role="alert">
              <div className="ops-listener-alert-header">
                <AlertIcon width={18} height={18} />
                <strong>Standard Listener Account Detected</strong>
              </div>
              <p>
                You are currently signed in as <b>{user.email}</b> ({user.displayName || "Listener"}).
                This portal requires Staff or Administrator access.
              </p>
              <div className="ops-listener-alert-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={requestLogout}
                >
                  <LogoutIcon width={14} height={14} />
                  <span>Log Out Current Account</span>
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => onNavigate("/")}
                >
                  Return to Explore
                </button>
              </div>
            </div>
          )}

          {/* Listener Rejection Banner */}
          {listenerRejectedError && (
            <div className="auth-v2-error" role="alert">
              <span>
                <AlertIcon width={17} height={17} />
              </span>
              <div>
                <b>Access Denied</b>
                <small>{listenerRejectedError}</small>
                <button
                  type="button"
                  className="auth-v2-error-action"
                  onClick={() => onNavigate("/login")}
                >
                  Switch to Public Listener Login →
                </button>
              </div>
            </div>
          )}

          {/* API Error Notice */}
          {apiError && !listenerRejectedError && (
            <div className="auth-v2-error" role="alert">
              <span>
                <AlertIcon width={17} height={17} />
              </span>
              <div>
                <b>Authentication Failed</b>
                <small>{apiError}</small>
              </div>
            </div>
          )}

          {/* Quick Demo Pre-fill for Review & Development */}
          <div className="ops-demo-card">
            <div className="ops-demo-header">
              <span>
                <ZapIcon width={13} height={13} /> ONE-CLICK DEMO ACCOUNTS
              </span>
              <small>Click to fill credentials:</small>
            </div>
            <div className="ops-demo-grid">
              <button
                type="button"
                className={`ops-demo-btn ops-demo-btn--admin ${activeDemo === "admin" ? "is-active" : ""}`}
                onClick={() => handleFillDemo("admin", "admin@soundwave.com", "Admin@123456")}
                title="Fill Administrator account"
              >
                <span className="ops-demo-role-badge">Admin</span>
                <div className="ops-demo-details">
                  <strong>admin@soundwave.com</strong>
                  <small>Password: Admin@123456</small>
                </div>
              </button>

              <button
                type="button"
                className={`ops-demo-btn ops-demo-btn--staff ${activeDemo === "staff" ? "is-active" : ""}`}
                onClick={() => handleFillDemo("staff", "staff@soundwave.com", "Staff@123456")}
                title="Fill Moderation Staff account"
              >
                <span className="ops-demo-role-badge">Staff</span>
                <div className="ops-demo-details">
                  <strong>staff@soundwave.com</strong>
                  <small>Password: Staff@123456</small>
                </div>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form className="auth-v2-form" onSubmit={handleSubmit} noValidate>
            <div className={`auth-v2-field ${errors["staff-email"] ? "has-error" : ""}`}>
              <label htmlFor="staff-email">Official work email</label>
              <div className={`auth-v2-input ${errors["staff-email"] ? "is-invalid" : ""}`}>
                <span>
                  <MailIcon width={17} height={17} />
                </span>
                <input
                  id="staff-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="e.g. staff@soundwave.com or admin@soundwave.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors["staff-email"]) {
                      setErrors((prev) => ({ ...prev, "staff-email": "" }));
                    }
                  }}
                  disabled={submitting}
                  aria-invalid={Boolean(errors["staff-email"])}
                  aria-describedby={errors["staff-email"] ? "staff-email-error" : undefined}
                />
              </div>
              {errors["staff-email"] && (
                <small className="auth-v2-field-error" id="staff-email-error">
                  <AlertIcon width={12} height={12} />
                  {errors["staff-email"]}
                </small>
              )}
            </div>

            <div className={`auth-v2-field ${errors["staff-password"] ? "has-error" : ""}`}>
              <label htmlFor="staff-password">Operational security password</label>
              <div className={`auth-v2-input auth-v2-input--password ${errors["staff-password"] ? "is-invalid" : ""}`}>
                <span>
                  <LockIcon width={17} height={17} />
                </span>
                <input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors["staff-password"]) {
                      setErrors((prev) => ({ ...prev, "staff-password": "" }));
                    }
                  }}
                  disabled={submitting}
                  aria-invalid={Boolean(errors["staff-password"])}
                  aria-describedby={errors["staff-password"] ? "staff-password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors["staff-password"] && (
                <small className="auth-v2-field-error" id="staff-password-error">
                  <AlertIcon width={12} height={12} />
                  {errors["staff-password"]}
                </small>
              )}
            </div>

            <div className="auth-v2-form-options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={submitting}
                />
                <span>Remember this workstation</span>
              </label>
              <span style={{ color: "#0369a1", fontSize: "8.5px", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <ShieldIcon width={13} height={13} />
                <span>Encrypted Session</span>
              </span>
            </div>

            <button
              className="button button-primary button-large auth-v2-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="ops-submit-spinner" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <ShieldIcon width={17} height={17} />
                  <span>Sign In to Operations</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Access Compliance Note */}
          <div className="auth-v2-access-note">
            <ShieldIcon width={16} height={16} />
            <span>
              <b>Strict Internal Access Policy</b>
              <small>
                All logins, IP addresses, and operational decisions are audited in security logs.
                Unauthorized access attempts will trigger automatic workstation lockouts.
              </small>
            </span>
          </div>

          <p className="auth-v2-switch">
            Not a staff member?{" "}
            <button type="button" onClick={() => onNavigate("/login")}>
              Go to Public Listener Login
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
