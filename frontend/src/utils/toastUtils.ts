/**
 * Flash toast helper utilities via sessionStorage across page navigations.
 */

export type FlashToastPayload = {
  message: string;
  type?: "success" | "error";
};

const FLASH_TOAST_KEY = "soundwave_flash_toast";

export function setFlashToast(message: string, type: "success" | "error" = "success"): void {
  try {
    sessionStorage.setItem(FLASH_TOAST_KEY, JSON.stringify({ message, type }));
  } catch {
    // ignore sessionStorage errors
  }
}

export function consumeFlashToast(): FlashToastPayload | null {
  try {
    const raw = sessionStorage.getItem(FLASH_TOAST_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(FLASH_TOAST_KEY);
    return JSON.parse(raw) as FlashToastPayload;
  } catch {
    return null;
  }
}
