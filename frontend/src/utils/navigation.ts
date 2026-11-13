/**
 * History-based navigation helpers (thay thế hash routing "#/path").
 * Mọi điều hướng trong app nên đi qua navigateTo() để useRouter và các listener được cập nhật.
 */

export const LOCATION_CHANGE_EVENT = "soundwave:locationchange";

/** Route hiện tại dạng "/path?query" (không có dấu #). */
export function getCurrentRoute(): string {
  const { pathname, search } = window.location;
  return `${pathname || "/"}${search || ""}`;
}

/** Chuẩn hóa đầu vào: chấp nhận "#/x", "/x", "x" → "/x". */
export function normalizePath(path: string): string {
  let clean = path.trim();
  if (clean.startsWith("#")) clean = clean.slice(1);
  if (!clean.startsWith("/")) clean = `/${clean}`;
  return clean;
}

/** Phát sự kiện để mọi nơi đang lắng nghe route cập nhật lại. */
export function notifyLocationChange(): void {
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}

/**
 * Điều hướng không reload trang.
 * Phát event "soundwave:navigate" (cancelable) để trang có thay đổi chưa lưu có thể chặn.
 */
export function navigateTo(path: string, options: { replace?: boolean; force?: boolean } = {}): void {
  const target = normalizePath(path);

  if (!options.force) {
    const event = new CustomEvent("soundwave:navigate", {
      cancelable: true,
      detail: { to: target },
    });
    if (!window.dispatchEvent(event)) return;
  }

  if (target === getCurrentRoute()) {
    notifyLocationChange();
    return;
  }

  if (options.replace) {
    window.history.replaceState(window.history.state, "", target);
  } else {
    window.history.pushState(null, "", target);
  }
  notifyLocationChange();
}

/** Chuyển URL cũ dạng "/#/path" sang "/path" (bookmark / email cũ). */
export function migrateLegacyHashUrl(): void {
  const { hash } = window.location;
  if (hash.startsWith("#/")) {
    window.history.replaceState(window.history.state, "", hash.slice(1));
  }
}

let linkInterceptorInstalled = false;

/**
 * Bắt click vào <a href="/..."> cùng origin để điều hướng SPA (không reload, giữ nhạc đang phát).
 * Bỏ qua: Ctrl/Cmd/Shift/Alt-click, chuột giữa, target="_blank", download, link ngoài, anchor "#section".
 * Chạy ở bubble phase nên component nào đã tự preventDefault() thì không bị xử lý lại.
 */
export function installLinkInterceptor(): void {
  if (linkInterceptorInstalled) return;
  linkInterceptorInstalled = true;

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = (event.target as Element | null)?.closest?.("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("/") || href.startsWith("//")) return;
    if (anchor.hasAttribute("download")) return;
    const target = anchor.getAttribute("target");
    if (target && target !== "_self") return;

    event.preventDefault();
    navigateTo(href);
  });
}
