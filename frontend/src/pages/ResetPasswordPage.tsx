import { useState, useEffect, type FormEvent } from "react";
import { authApi, getAuthErrorMessage } from "../api/auth";
import { CheckIcon, ShieldIcon } from "../icons";
import {
  AuthExperience,
  AuthErrorNotice,
  TextField,
  PasswordField,
  focusFirstInvalid,
  type FieldErrors,
} from "../components/auth/AuthExperience";

export function ResetPasswordPage({ email, onNavigate }: { email: string; onNavigate: (route: string) => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!/^\d{6}$/.test(otp)) nextErrors["reset-otp"] = "Enter the 6-digit code from your email.";
    if (!newPassword) nextErrors["new-password"] = "Please enter a new password.";
    else if (newPassword.length < 8) nextErrors["new-password"] = "New Password must contain at least 8 characters.";
    if (!confirmPassword) nextErrors["confirm-password"] = "Please confirm your new password.";
    else if (newPassword !== confirmPassword) nextErrors["confirm-password"] = "Confirm Password does not match.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstInvalid(nextErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setSubmitting(true);
    try {
      await authApi.resetPassword(email, otp, newPassword, confirmPassword);
      setSubmitted(true);
    } catch (error) {
      setApiError(getAuthErrorMessage(error, "Unable to reset your password. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    if (!email) {
      setApiError("Email address is missing. Please return to Forgot Password.");
      return;
    }
    setApiError("");
    setResendMessage("");
    setResending(true);
    try {
      const response = await authApi.forgotPassword(email);
      setResendMessage(response.message || "A new 6-digit OTP has been sent to your email.");
      setCooldown(60);
    } catch (error) {
      setApiError(getAuthErrorMessage(error, "Unable to send another OTP right now. Please wait before retrying."));
    } finally {
      setResending(false);
    }
  };

  const updateField = (id: string, setter: (value: string) => void) => (value: string) => {
    setter(value);
    setApiError("");
    setErrors((current) => ({ ...current, [id]: "" }));
  };

  return (
    <AuthExperience mode="recovery" eyebrow="ACCOUNT SECURITY" title="Create a new password" description={`Enter the OTP sent to ${email || "your email"} and choose a secure password.`} onNavigate={onNavigate}>
      {submitted ? (
        <div className="auth-v2-success"><span><CheckIcon width={28} height={28} /></span><h2>Password updated</h2><p>You can now login with your new password.</p><button className="button button-primary button-large" onClick={() => onNavigate("/login")}>Login</button></div>
      ) : (
        <form className="auth-v2-form" onSubmit={handleSubmit} noValidate>
          {Object.values(errors).some(Boolean) ? <AuthErrorNotice message="Review the New Password and Confirm Password fields." /> : null}
          {apiError ? <AuthErrorNotice title="Unable to reset password" message={apiError} /> : null}
          {resendMessage ? (
            <div className="auth-v2-verification-resend" role="status">
              <CheckIcon width={17} height={17} />
              <span><b>OTP sent</b><small>{resendMessage}</small></span>
            </div>
          ) : null}
          <TextField
            id="reset-otp"
            label="6-digit OTP"
            value={otp}
            onChange={updateField("reset-otp", setOtp)}
            placeholder="000000"
            autoComplete="one-time-code"
            icon={<ShieldIcon width={17} height={17} />}
            action={
              <button
                type="button"
                className="auth-v2-text-button"
                disabled={cooldown > 0 || resending || submitting}
                onClick={handleResendOtp}
              >
                {resending ? "Sending…" : cooldown > 0 ? `Resend (${cooldown}s)` : "Resend OTP"}
              </button>
            }
            error={errors["reset-otp"]}
          />
          <PasswordField id="new-password" label="New Password" value={newPassword} onChange={updateField("new-password", setNewPassword)} autoComplete="new-password" error={errors["new-password"]} />
          <PasswordField id="confirm-password" label="Confirm Password" value={confirmPassword} onChange={updateField("confirm-password", setConfirmPassword)} autoComplete="new-password" error={errors["confirm-password"]} />
          <button className="button button-primary button-large auth-v2-submit" disabled={submitting}>{submitting ? "Saving…" : "Save Password"}</button>
          <button
            type="button"
            className="button button-secondary"
            disabled={cooldown > 0 || resending || submitting}
            onClick={handleResendOtp}
          >
            {resending ? "Sending OTP…" : cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
          </button>
          <button type="button" className="auth-v2-back" onClick={() => onNavigate("/forgot-password")}>
            ← Back to Forgot Password
          </button>
        </form>
      )}
    </AuthExperience>
  );
}
