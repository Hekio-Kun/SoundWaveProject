import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, AlertIcon, CloseIcon } from "../../icons";

export type CenterNotificationType = "success" | "info" | "warning" | "error";

export type CenterNotificationPopupProps = {
  open: boolean;
  type?: CenterNotificationType;
  message: string;
  durationMs?: number;
  icon?: React.ReactNode;
  onClose: () => void;
};

export function CenterNotificationPopup({
  open,
  type = "success",
  message,
  durationMs = 3000,
  icon,
  onClose,
}: CenterNotificationPopupProps) {
  const timerRef = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    window.setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (!open) {
      setIsClosing(false);
      return;
    }
    if (durationMs > 0) {
      timerRef.current = window.setTimeout(() => {
        handleClose();
      }, durationMs);
    }
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, durationMs]);

  if (!open) return null;

  return createPortal(
    <div
      className={`sw-top-toast sw-top-toast--${type} ${isClosing ? "sw-top-toast--exit" : ""}`}
      role="status"
      aria-live="polite"
      onClick={handleClose}
    >
      <div className="sw-top-toast-icon-wrap">
        <span className="sw-top-toast-wave" />
        <div className={`sw-top-toast-icon sw-top-toast-icon--${type}`}>
          {icon ? (
            icon
          ) : type === "success" ? (
            <CheckIcon width={16} height={16} strokeWidth={2.5} />
          ) : (
            <AlertIcon width={16} height={16} strokeWidth={2.5} />
          )}
        </div>
      </div>

      <span className="sw-top-toast-message">{message}</span>

      <button
        type="button"
        className="sw-top-toast-close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Dismiss notification"
      >
        <CloseIcon width={13} height={13} />
      </button>

      {durationMs > 0 && (
        <span
          className={`sw-top-toast-progress sw-top-toast-progress--${type}`}
          style={{ animationDuration: `${durationMs}ms` }}
        />
      )}
    </div>,
    document.body
  );
}
