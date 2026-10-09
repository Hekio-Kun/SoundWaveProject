# TÀI LIỆU ĐẶC TẢ CHI TIẾT VÀ HƯỚNG DẪN CẬP NHẬT UC-33: VIEW NOTIFICATIONS
**Dự án:** SoundWave - Website Streaming Music  
**Môn học:** SWP391 (Software Development Project)  
**Phạm vi:** Thuần túy chức năng hiển thị / xem thông báo (**Read-Only**) cho cả 3 vai trò: Listener, Staff, Admin.

---

## PHẦN A: CẬP NHẬT GOOGLE SHEETS (PRODUCT BACKLOG)
👉 [Link Product Backlog](https://docs.google.com/spreadsheets/d/1j6EKq2gF2IDgE6VY3v0zq1_a4AHRiTrrQmq6DHtZ2X8/edit?usp=sharing)

Thêm dòng mới vào cuối bảng Product Backlog (sau `UC-28`):

| Function Name | Feature | Complexity | Planned Code Iteration | In-charge Roll Number | In-charge Full Name | Actual Code Iteration | Time: Begin | Time: Deadline | Time: Resit | Note |
|---|---|---|---|---|---|---|---|---|---|---|
| **[UC-33] View Notifications** | System Notification | **Simple** | Iteration 3 | *(MSSV)* | *(Họ Tên)* | *(Để trống)* | 10/10/2026 | 14/10/2026 | 15/10/2026 | Pending |

> **Lý do điều chỉnh:** Vì chức năng chỉ là **View (Hiển thị danh sách thông báo)** nên độ phức tạp giảm từ *Medium* xuống **Simple**, tương tự như `[UC-13] View Listening History` hay `[UC-20] View Rejection Reason`.

---

## PHẦN B: HƯỚNG DẪN CẬP NHẬT GOOGLE DOCS (RDS SPECIFICATION)
👉 [Link RDS Document](https://docs.google.com/document/d/1h1IlrWmnfAGkxye4IPl7qYri4HjJqpKUiYLjS5jkBxY/edit?usp=sharing)

---

### MỤC 1: RECORD OF CHANGES (Bảng lịch sử chỉnh sửa - Trang 2)
Thêm 1 dòng mới vào bảng:
* **Version:** `V1.8`
* **Date:** `10/10/2026`
* **A\* M, D:** `A`
* **In charge:** *(Tên bạn phụ trách, ví dụ DuyLH / HaoTNT / TuanTA)*
* **Change Description:**  
  `Add (I) Overview: 1.2 Use Cases (UC-33: View Notifications), 2.3 Screen Authorization (Listener, Staff, Admin). Add (II) Requirement Specifications: UC-33 View Notifications. Add (III) Design Specifications: 16. Notification Display. Add (IV) Appendix: BR-45, BR-46.`

---

### MỤC 2: MỤC LỤC (Table of Contents)
* Trong **II. Requirement Specifications**:
  * Thêm: `16. Notification Feature` ➔ `16.1 UC-33: View Notifications`
* Trong **III. Design Specifications**:
  * Thêm: `16. Notification Display` ➔ `16.1 View Notifications Dropdown`

---

### MỤC 3: PHẦN I. OVERVIEW

#### 3.1. Mục 1.1 Actors
Cập nhật nội dung nhận thông báo của 3 Actor:
* **Listener:** Xem thông báo hệ thống gửi về tài khoản khi bài hát được duyệt / bị từ chối kèm lý do (UC-20/24), thông báo kết quả giải quyết báo cáo (UC-25), thông báo lời mời kết bạn (UC-31), bạn bè đăng Note mới (UC-32), hoặc thông báo từ nền tảng.
* **Staff:** Xem thông báo khi có bài hát mới tải lên đang chờ duyệt (UC-24), có báo cáo vi phạm mới từ người nghe cần giải quyết (UC-22, UC-25).
* **Admin:** Xem thông báo hệ thống (báo cáo vi phạm nghiêm trọng cần xử lý, tài khoản bị báo cáo vượt ngưỡng, cảnh báo an ninh, thông báo báo cáo thống kê định kỳ UC-29).

#### 3.2. Mục 1.2 Use Cases
* **Sơ đồ Use Case (1.2.a Diagram):** Thêm Use Case oval: `UC-33: View Notifications`, nối đường liên kết (`Association`) từ cả 3 Actors: **Listener**, **Staff**, **Admin**.
* **Bảng Use Case Descriptions (1.2.b):** Thêm 1 dòng vào cuối bảng:

| ID | Feature | Use Case | Use Case Description |
|---|---|---|---|
| **UC-33** | System Notification | View Notifications | Allows authenticated users across all roles (Listener, Staff, and Admin) to view incoming system notifications in reverse chronological order and see unread alerts on the top navigation bar. |

#### 3.3. Mục 2. Overall Functionalities

##### a. Mục 2.2 Screen Descriptions (Bảng mô tả màn hình)
Điền vào dòng số 33 trong bảng `2.2 Screen Descriptions` (dòng đang bị trống trong Google Doc):

| # | Feature | Screen | Description |
|:---:|---|---|---|
| **33** | **UC-33: View Notifications** | **Notification Dropdown (Topbar)** | Displays recorded system notifications in reverse chronological order for authenticated users across all roles (Listener, Staff, Admin) with real-time unread badges on the navigation bar, allowing users to inspect event updates and navigate directly to referenced resources. |

*(Bản dịch tiếng Việt để nhóm nắm nghiệp vụ: Hiển thị danh sách thông báo hệ thống theo thứ tự thời gian mới nhất cho người dùng đã đăng nhập ở cả 3 vai trò Listener, Staff, Admin với huy hiệu đếm số lượng chưa đọc trên thanh điều hướng, cho phép người dùng theo dõi các sự kiện và click để điều hướng nhanh đến nội dung liên quan).*

##### b. Mục 2.3 Screen Authorization (Bảng phân quyền màn hình)
Thêm dòng mới vào bảng `2.3 Screen Authorization`:

| Screen / Function | Guest | User | Staff | Admin |
|---|:---:|:---:|:---:|:---:|
| **   UC-33 View Notifications** | - | **x** | **x** | **x** |

#### 3.4. Mục 3.2.b Database Design (Table Descriptions)
Bổ sung bảng `notifications`:
* **Table:** `notifications`
* **Description:** Stores system notification records generated for users. Attributes: `id`, `user_id`, `actor_id`, `type`, `title`, `message`, `reference_type`, `reference_id`, `is_read`, `created_at`. Primary key: `id`. Foreign keys: `user_id` references `app_users.id`, `actor_id` references `app_users.id`.

---

### MỤC 4: PHẦN II. REQUIREMENT SPECIFICATIONS (Đặc tả chi tiết UC-33)
*(Copy nguyên văn vào Mục 16 của Part II)*

```text
16. Notification Feature
16.1 UC-33: View Notifications

UC ID and Name:
	UC-33 View Notifications
Created By:
	[Tên bạn phụ trách]
Date Created:
	10/10/2026
Primary Actor:
	Listener, Staff, Admin
Secondary Actors:
	System
Trigger:
	An authenticated user clicks the Notification Bell icon on the top navigation bar.
Description:
	Displays recorded system notifications for the current user in reverse chronological order, allowing the user to review announcements, activity updates, and role-specific alerts.
Preconditions:
	PRE-1: UC-01 (Login) has completed successfully.
	PRE-2: The user's account is active (status = 'ACTIVE', deleted_at IS NULL).
Postconditions:
	POST-1: Notifications are displayed to the user without altering core catalog or account data.
	POST-2: (Optional) Displayed notifications are flagged as viewed in the user's active session.

Normal Flow:
	NF01: View notifications
	1. The user clicks the Notification Bell icon on the top navigation bar.
	2. The system retrieves notification records belonging to the current user's account (user_id), ordered by created_at DESC.
	3. The system renders the notification dropdown list displaying:
	   - Notification title and summary message.
	   - Timestamp (relative time format, e.g., "5 minutes ago", "2 hours ago").
	   - Visual unread indicator if the notification has not yet been viewed.
	4. The user may click a notification item to navigate to the referenced feature (e.g., track details, moderation report, or note).

Alternative Flows:
	AF01: Empty notification list
	1. The user accesses the notification menu, but no notification records exist for the account.
	2. The system renders an empty state message: "You have no notifications right now."

Exceptions:
	EX01: Notification retrieval failure
	1. A database connection error occurs while fetching notification data.
	2. The system displays a brief error notice: "Unable to load notifications. Please try again later."

Priority:
	Should Have
Frequency of Use:
	High
Business Rules:
	BR-45, BR-46
Other Information:
	Applicable to all 3 authenticated roles: Listener, Staff, Admin. Notifications are triggered automatically by backend events.
```

---

### MỤC 5: PHẦN III. DESIGN SPECIFICATIONS (Đặc tả thiết kế)
*(Copy vào Mục 16 của Part III)*

```text
16. Notification Display
16.1 View Notifications Dropdown
This component displays a popover menu attached to the top navigation bar bell icon, allowing authenticated users (Listener, Staff, Admin) to view recent activity notifications.

UI Design:
Field Name           Field Type         Description
---------------------------------------------------------------------------------------------------------
Bell Icon            Icon Button        Opens the notification dropdown panel.
Unread Dot/Badge     Indicator          Displays a highlighted badge/dot when unread notifications exist.
Notification Item    List Row           Displays notification icon/type, title, message preview, and time.
Timestamp            Label              Shows relative time since notification creation.
Empty Notice         Label              Displays placeholder message when no notifications exist.

Database Access:
Table                CRUD               Description
---------------------------------------------------------------------------------------------------------
notifications        R                  Reads user-specific notifications for display.
app_users            R                  Validates recipient identity.

SQL Commands (T-SQL / SQL Server):
1. Retrieve recent notifications for the logged-in user:
SELECT TOP 20 id, type, title, message, reference_type, reference_id, is_read, created_at 
FROM dbo.notifications 
WHERE user_id = ? 
ORDER BY created_at DESC;

2. Check unread count (for bell badge indicator):
SELECT COUNT(id) AS unread_count 
FROM dbo.notifications 
WHERE user_id = ? AND is_read = 0;
```

---

### MỤC 6: PHẦN IV. APPENDIX (Business Rules)
*(Thêm vào cuối bảng Business Rules, sau BR-44)*

```text
BR-45
Fact + Constraint
Notification Visibility by Role:
Notifications are strictly scoped to the targeted account (user_id). Users can only view notifications explicitly addressed to them:
- Listener accounts view notifications regarding track approval/rejection outcomes, content report feedback, social friendship/note updates, and platform notices.
- Staff accounts view notifications regarding pending moderation submissions and newly reported content tickets.
- Admin accounts view system alerts, severe abuse escalations, and administrative status notices.

BR-46
Computation + Action Enabler
Notification Badge Display:
The notification bell displays a badge count based on unread notification records (is_read = 0). When the user opens and views the notification list, the system synchronizes the state and hides the badge or updates unread count accordingly.
```

---

## PHẦN C: SCRIPT DATABASE SQL SERVER CHO BẢNG NOTIFICATIONS

```sql
CREATE TABLE dbo.notifications (
    id BIGINT IDENTITY(1,1) NOT NULL,
    user_id BIGINT NOT NULL,
    actor_id BIGINT NULL,
    type VARCHAR(50) NOT NULL,
    title NVARCHAR(150) NOT NULL,
    message NVARCHAR(500) NOT NULL,
    reference_type VARCHAR(50) NULL,
    reference_id VARCHAR(100) NULL,
    is_read BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT pk_notifications PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES dbo.app_users(id),
    CONSTRAINT fk_notifications_actor FOREIGN KEY (actor_id) REFERENCES dbo.app_users(id)
);

CREATE INDEX idx_notifications_user ON dbo.notifications (user_id, created_at DESC);
```
