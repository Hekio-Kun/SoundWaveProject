import { useState, type FormEvent } from "react";
import { authApi, getAuthErrorMessage } from "../api/auth";
import {
  AlertIcon,
  CheckIcon,
  MailIcon,
  UserIcon,
} from "../icons";
import {
  AuthExperience,
  AuthErrorNotice,
  TextField,
  PasswordField,
  focusFirstInvalid,
  emailPattern,
  type FieldErrors,
} from "../components/auth/AuthExperience";

export function RegisterPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passwordRules = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Number", valid: /\d/.test(password) },
  ];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!displayName.trim()) nextErrors["reg-name"] = "Please enter your display name.";
    else if (displayName.trim().length < 2) nextErrors["reg-name"] = "Display Name must contain at least 2 characters.";
    if (!email.trim()) nextErrors["reg-email"] = "Please enter your email address.";
    else if (!emailPattern.test(email.trim())) nextErrors["reg-email"] = "Please enter a valid email address.";
    if (!password) nextErrors["reg-password"] = "Please create a password.";
    else if (!passwordRules.every((rule) => rule.valid)) nextErrors["reg-password"] = "Password does not meet all security requirements.";
    if (!confirmPassword) nextErrors["reg-confirm"] = "Please confirm your password.";
    else if (password !== confirmPassword) nextErrors["reg-confirm"] = "Confirm Password does not match.";
    if (!termsAccepted) nextErrors["reg-terms"] = "Please accept the terms to continue.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstInvalid(nextErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setSubmitting(true);
    try {
      await authApi.register({ displayName: displayName.trim(), email: email.trim(), password, confirmPassword });
      onNavigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      setApiError(getAuthErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (id: string, setter: (value: string) => void) => (value: string) => {
    setter(value);
    setApiError("");
    setErrors((current) => ({ ...current, [id]: "" }));
  };

  return (
    <AuthExperience mode="register" eyebrow="START FOR FREE" title="Create your music space" description="One account to listen, save playlists, and share new music." onNavigate={onNavigate}>
      <>
        <form onSubmit={handleSubmit} className="auth-v2-form" noValidate>
          {Object.values(errors).some(Boolean) ? <AuthErrorNotice message="Complete all required information before registering." /> : null}
          {apiError ? <AuthErrorNotice title="Unable to register" message={apiError} /> : null}
          <div className="auth-v2-two-columns">
            <TextField id="reg-name" label="Display Name" value={displayName} onChange={updateField("reg-name", setDisplayName)} placeholder="For example: Le An" autoComplete="name" minLength={2} icon={<UserIcon width={17} height={17} />} error={errors["reg-name"]} />
            <TextField id="reg-email" type="email" label="Email" value={email} onChange={updateField("reg-email", setEmail)} placeholder="you@example.com" autoComplete="email" icon={<MailIcon width={17} height={17} />} error={errors["reg-email"]} />
          </div>
          <PasswordField id="reg-password" label="Password" value={password} onChange={updateField("reg-password", setPassword)} autoComplete="new-password" error={errors["reg-password"]} />
          <div className="auth-v2-password-rules">
            {passwordRules.map((rule) => <span key={rule.label} className={rule.valid ? "is-valid" : ""}><i>{rule.valid ? <CheckIcon width={10} height={10} /> : null}</i>{rule.label}</span>)}
          </div>
          <PasswordField id="reg-confirm" label="Confirm Password" value={confirmPassword} onChange={updateField("reg-confirm", setConfirmPassword)} autoComplete="new-password" error={errors["reg-confirm"]} />
          <div className={`auth-v2-terms-wrap ${errors["reg-terms"] ? "has-error" : ""}`}>
            <label className="auth-v2-terms"><input id="reg-terms" type="checkbox" checked={termsAccepted} onChange={(event) => { setTermsAccepted(event.target.checked); setErrors((current) => ({ ...current, "reg-terms": "" })); }} aria-invalid={Boolean(errors["reg-terms"])} aria-describedby={errors["reg-terms"] ? "reg-terms-error" : undefined} /><span>I accept SoundWave's <button type="button">Terms of Use</button> and <button type="button">Community Policy</button>.</span></label>
            {errors["reg-terms"] ? <small className="auth-v2-field-error" id="reg-terms-error"><AlertIcon width={12} height={12} />{errors["reg-terms"]}</small> : null}
          </div>
          <button type="submit" className="button button-primary button-large auth-v2-submit" disabled={submitting}>{submitting ? "Creating account…" : "Register"}</button>
        </form>
        <p className="auth-v2-switch">Already have an account? <button onClick={() => onNavigate("/login")}>Login</button></p>
      </>
    </AuthExperience>
  );
}
