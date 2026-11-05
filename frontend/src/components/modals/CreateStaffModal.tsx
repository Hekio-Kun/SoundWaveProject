import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ApiError } from "../../api/client";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { AlertIcon, CloseIcon, LockIcon, MailIcon, ShieldIcon, UserIcon } from "../../icons";
import type { CreateStaffInput, CreateStaffResult } from "../../types";

type Props = {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateStaffInput) => Promise<CreateStaffResult>;
};

type FieldErrors = Partial<Record<keyof CreateStaffInput, string>>;

export function CreateStaffModal({ open, submitting, onClose, onSubmit }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setFullName("");
    setEmail("");
    setFieldErrors({});
    setFormError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const clearFieldError = (field: keyof CreateStaffInput) => {
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
    setFormError("");
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      errors.fullName = "Please enter staff member's full name.";
    } else if (trimmedName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    } else if (trimmedName.length > 120) {
      errors.fullName = "Full name must not exceed 120 characters.";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = "Please enter a valid work email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email format (e.g. staff@soundwave.io).";
    } else if (trimmedEmail.length > 320) {
      errors.email = "Email must not exceed 320 characters.";
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please check the highlighted fields below.");
      const firstField = Object.keys(errors)[0];
      window.setTimeout(() => document.getElementById(`staff-${firstField}`)?.focus(), 0);
      return;
    }

    try {
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim(),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors as FieldErrors);
        } else if (err.status === 409 || err.message?.toLowerCase().includes("email")) {
          setFieldErrors({ email: err.message || "Email address is already in use by another account." });
        }
        setFormError(err.message || "Failed to create staff account.");
      } else {
        setFormError("Unable to create staff account. Please try again.");
      }
    }
  };

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={() => !submitting && onClose()}>
      <section
        className="modal-card genre-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-staff-modal-title"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: "540px" }}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ShieldIcon width={13} height={13} />
              STAFF ACCOUNTS MANAGEMENT
            </span>
            <h2 id="create-staff-modal-title" style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0 0" }}>
              Create Staff Account
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close create staff modal"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        <form className="modal-form" noValidate onSubmit={handleSubmit}>
          {formError ? (
            <div className="genre-form-alert" role="alert">
              <AlertIcon width={16} height={16} />
              <span>{formError}</span>
            </div>
          ) : null}

          {/* Business Rule Explanation Callout */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#F0F9FF",
              border: "1px solid #BAE6FD",
              color: "#0369A1",
              fontSize: "13px",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <ShieldIcon width={18} height={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Staff Role Assignment (ACTIVE)</strong>
              <div style={{ marginTop: "2px", color: "#0C4A6E" }}>
                Staff accounts have access to the Content Moderation Portal. A welcome email containing login credentials will be automatically dispatched upon creation.
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="staff-fullName" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <UserIcon width={14} height={14} />
              <span>Full Name <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span></span>
            </label>
            <input
              id="staff-fullName"
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                clearFieldError("fullName");
              }}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? "staff-fullName-error" : undefined}
              disabled={submitting}
              autoFocus
            />
            {fieldErrors.fullName ? (
              <small id="staff-fullName-error" className="auth-v2-field-error">
                {fieldErrors.fullName}
              </small>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="staff-email" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <MailIcon width={14} height={14} />
              <span>Work Email <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span></span>
            </label>
            <input
              id="staff-email"
              type="email"
              placeholder="e.g. s.jenkins@soundwave.io"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError("email");
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "staff-email-error" : undefined}
              disabled={submitting}
            />
            {fieldErrors.email ? (
              <small id="staff-email-error" className="auth-v2-field-error">
                {fieldErrors.email}
              </small>
            ) : null}
          </div>

          {/* System-Generated Password Notice */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#475569",
            }}
          >
            <LockIcon width={15} height={15} style={{ flexShrink: 0, color: "#64748B" }} />
            <span>
              A secure password will be automatically generated and sent to this email.
            </span>
          </div>

          <div className="modal-actions" style={{ marginTop: "12px" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
              style={{ minWidth: "140px" }}
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}
