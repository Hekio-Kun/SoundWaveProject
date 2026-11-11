import { useState, type FormEvent } from "react";
import { authApi, getAuthErrorMessage } from "../api/auth";
import { MailIcon } from "../icons";
import {
  AuthExperience,
  AuthErrorNotice,
  TextField,
  focusFirstInvalid,
  emailPattern,
  type FieldErrors,
} from "../components/auth/AuthExperience";

export function ForgotPasswordPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!email.trim()) nextErrors["forgot-email"] = "Please enter your email address.";
    else if (!emailPattern.test(email.trim())) nextErrors["forgot-email"] = "Please enter a valid email address.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstInvalid(nextErrors);
      return;
    }
    setErrors({});
    setApiError("");
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      onNavigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      setApiError(getAuthErrorMessage(error, "Unable to send the reset OTP. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthExperience mode="recovery" eyebrow="ACCOUNT RECOVERY" title="Forgot Password?" description="Enter your registered email and SoundWave will send password-reset instructions." onNavigate={onNavigate}>
      <form className="auth-v2-form" onSubmit={handleSubmit} noValidate>
        {Object.values(errors).some(Boolean) ? <AuthErrorNotice message="Enter the email used to register your SoundWave account." /> : null}
        {apiError ? <AuthErrorNotice title="Unable to send OTP" message={apiError} /> : null}
        <TextField id="forgot-email" type="email" label="Email" value={email} onChange={(value) => { setEmail(value); setErrors({}); setApiError(""); }} placeholder="you@example.com" autoComplete="email" icon={<MailIcon width={17} height={17} />} error={errors["forgot-email"]} />
        <button className="button button-primary button-large auth-v2-submit" disabled={submitting}>{submitting ? "Sending OTP…" : "Send Reset OTP"}</button>
        <button type="button" className="auth-v2-back" onClick={() => onNavigate("/login")}>← Back to Login</button>
      </form>
    </AuthExperience>
  );
}
