/**
 * Utility for persisting and retrieving cross-route flash toast messages via sessionStorage.
 */

export type FlashToast = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
};

const FLASH_TOAST_KEY = "soundwave_flash_toast";

export function setFlashToast(message: string, type: "success" | "error" | "info" | "warning" = "success"): void {
  try {
    sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify({ message, type }));
  } catch {
    // Ignore session storage errors (e.g. private browsing quota)
  }
}

export function consumeFlashToast(): FlashToast | null {
  try {
    const raw = sessionStorage.getItem(FLASH_TOAST_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(FLASH_TOAST_KEY);
    return JSON.parse(raw) as FlashToast;
  } catch {
    return null;
  }
}

