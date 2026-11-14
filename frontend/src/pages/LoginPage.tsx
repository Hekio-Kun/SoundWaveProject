import { useState, useEffect, type FormEvent } from "react";
import { AuthApiError, authApi, getAuthErrorMessage } from "../api/auth";
import {
  AlertIcon,
  CheckIcon,
  MailIcon,
  ShieldIcon,
} from "../icons";
import {
  AuthExperience,
  AuthErrorNotice,
  TextField,
  PasswordField,
  focusFirstInvalid,
  emailPattern,
  type AuthProps,
  type FieldErrors,
} from "../components/auth/AuthExperience";

export function LoginPage({ onLoginSuccess, onNavigate }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [apiErrorCode, setApiErrorCode] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  // Self-Service Emergency Unlock via OTP
  const [unlockMode, setUnlockMode] = useState(false);
  const [unlockOtp, setUnlockOtp] = useState("");
  const [unlockOtpError, setUnlockOtpError] = useState("");
  const [unlockSuccess, setUnlockSuccess] = useState("");
  const [unlockCooldown, setUnlockCooldown] = useState(0);
  const [requestingUnlock, setRequestingUnlock] = useState(false);
  const [submittingUnlock, setSubmittingUnlock] = useState(false);

  useEffect(() => {
    if (verificationCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setVerificationCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [verificationCooldown]);

  useEffect(() => {
    if (unlockCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setUnlockCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [unlockCooldown]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!email.trim()) nextErrors["login-email"] = "Please enter your email address.";
    else if (!emailPattern.test(email.trim())) nextErrors["login-email"] = "Please enter a valid email address.";
    if (!password) nextErrors["login-password"] = "Please enter your password.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstInvalid(nextErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setApiErrorCode("");
    setResendMessage("");
    setUnlockSuccess("");
    setSubmitting(true);
    try {
      const session = await authApi.login(email.trim(), password, rememberMe, "LISTENER");

      // Strict role enforcement: Staff and Admin accounts must not login through the Listener portal
      if (session.user.role === "ADMIN" || session.user.role === "STAFF" || session.user.role === "MODERATOR") {
        try {
          await authApi.logout();
        } catch {
          // Ignore transient session cleanup errors
        }
        setApiErrorCode("INVALID_CREDENTIALS");
        setApiError("Email or password is incorrect.");
        return;
      }

      onLoginSuccess(session, rememberMe);
    } catch (error) {
      setApiError(getAuthErrorMessage(error, "Email or password is incorrect."));
      setApiErrorCode(error instanceof AuthApiError ? error.code ?? "" : "");
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerificationOtp = async () => {
    if (verificationCooldown > 0 || resendingVerification) return;
    setResendingVerification(true);
    setResendMessage("");
    try {
      const result = await authApi.resendVerificationOtp(email.trim());
      setApiError("");
      setApiErrorCode("");
      setResendMessage(result.message);
      setVerificationCooldown(60);
    } catch (error) {
      setApiError(getAuthErrorMessage(error, "Unable to resend the verification OTP."));
      setApiErrorCode(error instanceof AuthApiError ? error.code ?? "" : "");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleRequestUnlock = async () => {
    if (!email.trim()) {
      setErrors({ "login-email": "Please enter your email to request an unlock code." });
      focusFirstInvalid({ "login-email": "required" });
      return;
    }
    if (unlockCooldown > 0 || requestingUnlock) return;
    setRequestingUnlock(true);
    setUnlockOtpError("");
    try {
      const result = await authApi.requestUnlock(email.trim());
      setUnlockMode(true);
      setUnlockCooldown(60);
      setUnlockSuccess("");
      setResendMessage(result.message);
    } catch (error) {
      setApiError(getAuthErrorMessage(error, "Unable to send unlock OTP."));
    } finally {
      setRequestingUnlock(false);
    }
  };

  const handleConfirmUnlock = async () => {
    if (unlockOtp.length !== 6) {
      setUnlockOtpError("Please enter the 6-digit OTP code.");
      return;
    }
    setSubmittingUnlock(true);
    setUnlockOtpError("");
    try {
      const result = await authApi.unlockAccount(email.trim(), unlockOtp);
      setUnlockMode(false);
      setUnlockOtp("");
      setApiError("");
      setApiErrorCode("");
      setPassword("");
      setUnlockSuccess(result.message);
    } catch (error) {
      setUnlockOtpError(getAuthErrorMessage(error, "Invalid or expired unlock code."));
    } finally {
      setSubmittingUnlock(false);
    }
  };

  const updateField = (id: string, setter: (value: string) => void) => (value: string) => {
    setter(value);
    setApiError("");
    setApiErrorCode("");
    setResendMessage("");
    setErrors((current) => ({ ...current, [id]: "" }));
  };

  const isWarningRemainingAttempts = apiError.includes("remaining before");

  return (
    <AuthExperience mode="login" eyebrow="WELCOME BACK" title="Continue with SoundWave" description="Login to open your personal library and continue listening where you left off." onNavigate={onNavigate}>
      <form onSubmit={handleSubmit} className="auth-v2-form" noValidate>
        {Object.values(errors).some(Boolean) ? <AuthErrorNotice message="Please review the fields marked below." /> : null}
        {apiError ? (
          <AuthErrorNotice
            title={
              apiErrorCode === "ACCOUNT_BANNED"
                ? "Account banned"
                : apiErrorCode === "LOGIN_LOCKED"
                ? "Account temporarily locked"
                : isWarningRemainingAttempts
                ? "Incorrect password warning"
                : "Unable to login"
            }
            message={apiError}
            action={
              apiErrorCode === "EMAIL_NOT_VERIFIED" ? (
                <button
                  type="button"
                  className="auth-v2-error-action"
                  onClick={resendVerificationOtp}
                  disabled={verificationCooldown > 0 || resendingVerification}
                >
                  {resendingVerification ? "Sending…" : verificationCooldown > 0 ? `Resend OTP (${verificationCooldown}s)` : "Resend verification OTP"}
                </button>
              ) : apiErrorCode === "LOGIN_LOCKED" && !unlockMode ? (
                <button
                  type="button"
                  className="auth-v2-error-action"
                  onClick={handleRequestUnlock}
                  disabled={requestingUnlock || unlockCooldown > 0}
                >
                  {requestingUnlock ? "Sending code…" : unlockCooldown > 0 ? `Resend Unlock OTP (${unlockCooldown}s)` : "Unlock via Email"}
                </button>
              ) : isWarningRemainingAttempts ? (
                <button
                  type="button"
                  className="auth-v2-error-action"
                  onClick={() => onNavigate(`/forgot-password?email=${encodeURIComponent(email.trim())}`)}
                >
                  Reset password now
                </button>
              ) : undefined
            }
          />
        ) : null}

        {unlockSuccess ? (
          <div className="auth-v2-verification-resend" role="status" style={{ marginBottom: "0.5rem" }}>
            <CheckIcon width={17} height={17} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span><b>Account unlocked</b><small>{unlockSuccess}</small></span>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  className="auth-v2-text-button"
                  onClick={() => {
                    setUnlockSuccess("");
                    document.getElementById("login-password")?.focus();
                  }}
                >
                  Login now
                </button>
                <span>·</span>
                <button
                  type="button"
                  className="auth-v2-text-button"
                  onClick={() => onNavigate(`/forgot-password?email=${encodeURIComponent(email.trim())}`)}
                >
                  Reset password
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {unlockMode ? (
          <div style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            backgroundColor: "rgba(2, 132, 199, 0.05)",
            border: "1px solid rgba(2, 132, 199, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldIcon width={18} height={18} />
              <b style={{ fontSize: "0.95rem" }}>Emergency Account Unlock</b>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted, #64748b)" }}>
              We sent a 6-digit unlock code to <b>{email}</b>. Enter it below to restore your account immediately.
            </p>
            <div className={`auth-v2-field ${unlockOtpError ? "has-error" : ""}`}>
              <label htmlFor="unlock-otp">6-digit Unlock OTP</label>
              <div className={`auth-v2-input ${unlockOtpError ? "is-invalid" : ""}`}>
                <span><MailIcon width={17} height={17} /></span>
                <input
                  id="unlock-otp"
                  type="text"
                  value={unlockOtp}
                  onChange={(e) => {
                    setUnlockOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setUnlockOtpError("");
                  }}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                />
              </div>
              {unlockOtpError ? <small className="auth-v2-field-error"><AlertIcon width={12} height={12} />{unlockOtpError}</small> : null}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                className="button button-primary"
                onClick={handleConfirmUnlock}
                disabled={submittingUnlock || unlockOtp.length !== 6}
              >
                {submittingUnlock ? "Unlocking…" : "Confirm Unlock"}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleRequestUnlock}
                disabled={requestingUnlock || unlockCooldown > 0}
              >
                {requestingUnlock ? "Sending…" : unlockCooldown > 0 ? `Resend (${unlockCooldown}s)` : "Resend OTP"}
              </button>
              <button
                type="button"
                className="auth-v2-text-button"
                onClick={() => setUnlockMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {resendMessage ? (
          <div className="auth-v2-verification-resend" role="status">
            <CheckIcon width={17} height={17} />
            <span><b>OTP sent</b><small>{resendMessage}</small></span>
          </div>
        ) : null}
        <TextField id="login-email" type="email" label="Email" value={email} onChange={updateField("login-email", setEmail)} placeholder="you@example.com" autoComplete="email" icon={<MailIcon width={17} height={17} />} error={errors["login-email"]} />
        <PasswordField id="login-password" label="Password" value={password} onChange={updateField("login-password", setPassword)} autoComplete="current-password" action={<button type="button" className="auth-v2-text-button" onClick={() => onNavigate("/forgot-password")}>Forgot Password?</button>} error={errors["login-password"]} />

        <div className="auth-v2-form-options">
          <label><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember Me</span></label>
          <span><ShieldIcon width={13} height={13} /> Secure connection</span>
        </div>

        <button type="submit" className="button button-primary button-large auth-v2-submit" disabled={submitting}>{submitting ? "Logging in…" : "Login"}</button>
      </form>

      <p className="auth-v2-switch">Do not have an account? <button onClick={() => onNavigate("/register")}>Register</button></p>
      <p className="auth-v2-switch" style={{ marginTop: "0.5rem", fontSize: "0.82rem", opacity: 0.85 }}>Are you a SoundWave staff or admin? <button onClick={() => onNavigate("/staff/login")}>Go to Staff Portal</button></p>
    </AuthExperience>
  );
}
