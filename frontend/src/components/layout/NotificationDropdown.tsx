import { useEffect, useRef, useState } from "react";
import {
  AlertIcon,
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  RefreshIcon,
  ShieldIcon,
  UploadIcon,
} from "../../icons";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../api/notification";
import type { NotificationItem } from "../../types";

type NotificationDropdownProps = {
  unreadCount?: number;
  onNavigate?: (route: string) => void;
  onMarkAllRead?: () => void;
};

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

export function NotificationDropdown({
  onNavigate,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Phase 1: Lấy số lượng thông báo chưa đọc ban đầu và tự động đồng bộ định kỳ
  const loadUnreadCount = async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // Bỏ qua lỗi 401 khi chưa đăng nhập
    }
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 20000); // Poll mỗi 20s để nhận thông báo mới
    return () => clearInterval(interval);
  }, []);

  // Phase 2: Khi người dùng mở xem danh sách thông báo
  const loadNotificationList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchNotifications();
      setNotifications(items);
      const unread = items.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      setError("Unable to load notifications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadNotificationList();
    }
  };

  // Đóng khi click ngoài hoặc phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Phase 4: Đánh dấu tất cả là đã đọc
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Lỗi mạng hoặc API
    }
  };

  // Phase 4: Nhấn vào 1 dòng thông báo
  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markNotificationAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Tiếp tục điều hướng ngay cả khi API mark as read lỗi
      }
    }

    setIsOpen(false);
    if (item.navigationUrl && onNavigate) {
      onNavigate(item.navigationUrl);
    }
  };

  // Render icon theo loại thông báo
  const renderItemIcon = (type: string) => {
    switch (type) {
      case "TRACK_APPROVED":
        return (
          <span className="notif-item-icon notif-item-icon--success">
            <CheckIcon width={17} height={17} />
          </span>
        );
      case "TRACK_REJECTED":
        return (
          <span className="notif-item-icon notif-item-icon--warning">
            <AlertIcon width={17} height={17} />
          </span>
        );
      case "TRACK_SUBMISSION":
        return (
          <span className="notif-item-icon notif-item-icon--info">
            <UploadIcon width={17} height={17} />
          </span>
        );
      case "CONTENT_REPORT":
        return (
          <span className="notif-item-icon notif-item-icon--danger">
            <ShieldIcon width={17} height={17} />
          </span>
        );
      default:
        return (
          <span className="notif-item-icon">
            <BellIcon width={17} height={17} />
          </span>
        );
    }
  };

  return (
    <div className="topbar-notification-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className={`topbar-icon-btn ${isOpen ? "is-active" : ""}`}
        onClick={handleToggle}
        aria-label="System notifications"
        aria-expanded={isOpen}
        aria-controls="notification-popover"
      >
        <BellIcon width={19} height={19} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div
          className="notif-popover"
          id="notification-popover"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="notif-header">
            <div>
              <span className="popover-eyebrow">ACTIVITY</span>
              <h4>Notifications</h4>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="notif-read-all"
                onClick={handleMarkAllRead}
              >
                <CheckIcon width={14} height={14} />
                Mark all read
              </button>
            ) : (
              <span className="notif-all-read">
                <CheckIcon width={13} height={13} />
                All caught up
              </span>
            )}
          </div>

          {/* List Content */}
          <div className="notif-list">
            {isLoading ? (
              <>
                <div className="notif-skeleton-item">
                  <div className="notif-skeleton-icon" />
                  <div className="notif-skeleton-lines">
                    <div className="notif-skeleton-line" />
                    <div className="notif-skeleton-line notif-skeleton-line--short" />
                  </div>
                </div>
                <div className="notif-skeleton-item">
                  <div className="notif-skeleton-icon" />
                  <div className="notif-skeleton-lines">
                    <div className="notif-skeleton-line" />
                    <div className="notif-skeleton-line notif-skeleton-line--short" />
                  </div>
                </div>
              </>
            ) : error ? (
              <div className="notif-error">
                <p>{error}</p>
                <button
                  type="button"
                  className="notif-retry-btn"
                  onClick={loadNotificationList}
                >
                  <RefreshIcon width={13} height={13} />
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-empty">
                <BellIcon width={28} height={28} />
                <p>No notifications right now</p>
                <small>You will be notified when your tracks or activities have updates.</small>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notif-item ${!item.isRead ? "is-unread" : ""}`}
                  onClick={() => handleItemClick(item)}
                >
                  {renderItemIcon(item.type)}
                  <span className="notif-item-copy">
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <small>{formatRelativeTime(item.createdAt)}</small>
                  </span>
                  <ChevronRightIcon width={16} height={16} className="notif-item-arrow" />
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="notif-footer">
            <span>
              <i />
              Updates from your SoundWave workspace
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
