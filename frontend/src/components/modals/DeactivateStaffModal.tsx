import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ApiError } from "../../api/client";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { AlertIcon, CloseIcon, ShieldIcon, UserIcon } from "../../icons";
import type { DeactivateStaffInput, StaffSummaryItem } from "../../types";

type Props = {
  open: boolean;
  staff: StaffSummaryItem | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (input: DeactivateStaffInput) => Promise<void>;
};

export function DeactivateStaffModal({
  open,
  staff,
  submitting,
  onClose,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setError("");
  }, [open, staff]);

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

  if (!open || !staff) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a mandatory justification for deactivating this account.");
      return;
    }
    if (trimmed.length < 5) {
      setError("Deactivation reason must be at least 5 characters.");
      return;
    }
    if (trimmed.length > 500) {
      setError("Deactivation reason must not exceed 500 characters.");
      return;
    }

    try {
      await onConfirm({ reason: trimmed });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to deactivate staff account.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={() => !submitting && onClose()}>
      <section
        className="modal-card genre-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-staff-title"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: "520px" }}
      >
        <div className="modal-header">
          <div>
            <span
              className="eyebrow"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#B42318" }}
            >
              <AlertIcon width={13} height={13} />
              STAFF ACCESS REVOCATION
            </span>
            <h2 id="deactivate-staff-title" style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0 0" }}>
              Deactivate Staff Account
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close deactivate modal"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        <form className="modal-form" noValidate onSubmit={handleSubmit}>
          {error ? (
            <div className="genre-form-alert" role="alert">
              <AlertIcon width={16} height={16} />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Warning Impact Callout */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
              fontSize: "13px",
              lineHeight: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <AlertIcon width={18} height={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>Immediate Access Revocation</strong>
              <div style={{ marginTop: "2px", color: "#7F1D1D" }}>
                All active login sessions and tokens for this staff member will be immediately terminated. Their historical moderation decisions will remain securely preserved in audit logs.
              </div>
            </div>
          </div>

          {/* Target Account Summary */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "10px",
              padding: "12px 14px",
              display: "grid",
              gap: "8px",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Staff Member:</span>
              <strong style={{ color: "#0F172A" }}>{staff.fullName}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748B" }}>Work Email:</span>
              <strong style={{ color: "#0F172A" }}>{staff.email}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748B" }}>Current Role:</span>
              <span
                className="ops-role-chip"
                style={{
                  background: "#f5ead8",
                  color: "#8c5828",
                  borderColor: "#e8dccb",
                  fontWeight: 600,
                  fontSize: "12px",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <UserIcon width={12} height={12} />
                <span>{staff.roleName || staff.roleCode}</span>
              </span>
            </div>
          </div>

          {/* Mandatory Reason Input */}
          <div className="form-group">
            <div className="form-label-row" style={{ display: "flex", justifyContent: "space-between" }}>
              <label htmlFor="deactivate-reason">
                Justification / Reason <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span>
              </label>
              <small style={{ color: "#64748B" }}>{reason.length}/500</small>
            </div>
            <textarea
              id="deactivate-reason"
              rows={4}
              placeholder="e.g. Staff member resigned, role reassignment, or moderation policy violation..."
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
              disabled={submitting}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: error ? "1px solid #EF4444" : "1px solid #CBD5E1",
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <small style={{ fontSize: "11px", color: "#64748B" }}>
              This reason will be recorded in the administrative audit log.
            </small>
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
              className="button button-danger"
              disabled={submitting}
              style={{ minWidth: "160px" }}
            >
              {submitting ? "Deactivating..." : "Confirm Deactivation"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}

