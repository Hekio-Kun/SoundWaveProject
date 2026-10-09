# SoundWave Full-Stack — AI Agent Master Orchestrator

Tài liệu này là **tổng chỉ huy quy tắc (Master Orchestrator)** cho AI Agent khi phát triển và bảo trì hệ thống SoundWave (Website nghe và chia sẻ âm nhạc đa vai trò: Guest, User, Staff, Admin).

---

## 1. Cấu trúc dự án Monorepo

```text
soundwave/
├── agent/            # Thư mục tổng hợp toàn bộ AI agents & rules
│   ├── AGENTS.md           # Master Orchestrator
│   ├── AGENTS_BACKEND.md   # Quy tắc chi tiết cho Backend
│   ├── AGENTS_FRONTEND.md  # Quy tắc chi tiết cho Frontend
│   └── *.md                # 68 chuyên viên AI chuyên sâu (architect, reviewer, security,...)
├── backend/          # Java 21, Spring Boot, Spring Data JPA, SQL Server, Lombok
├── frontend/         # Vite, React, TypeScript, TailwindCSS / Custom CSS Tokens
├── .ecc/             # Bộ quy chuẩn Everything Claude Code (Rules, Workflows)
└── AGENTS.md         # File này (Master Router)
```

---

## 2. Quy tắc định tuyến tự động cho AI (Routing Rules)

Mỗi khi nhận yêu cầu từ lập trình viên, AI **bắt buộc** phải tuân theo định tuyến sau:

1. **Nếu task chỉ liên quan Backend (API, Database, Entity, Service, Auth)**:
   - Phải đọc và tuân thủ tuyệt đối [agent/AGENTS_BACKEND.md](file:///C:/Users/lehai/IdeaProjects/soundwave/agent/AGENTS_BACKEND.md).
   - Luồng bắt buộc: `Controller -> Service -> Repository -> Database`. Dùng DTO, không bao giờ để Controller gọi trực tiếp Repository.
   - Tuân thủ quy chuẩn Java & Spring Boot trong `.ecc/rules/java/`.

2. **Nếu task chỉ liên quan Frontend (Giao diện, Component, Page, Player, State)**:
   - Phải đọc và tuân thủ tuyệt đối [agent/AGENTS_FRONTEND.md](file:///C:/Users/lehai/IdeaProjects/soundwave/agent/AGENTS_FRONTEND.md).
   - Chuẩn thiết kế: Light-first, tối giản, vibe biển & bờ cát tự nhiên, màu chủ đạo là **Xanh dương sáng** (`#0284C7` / `#0EA5E9`) kết hợp **Màu cát** (`#E6D5B8` / `#D4B996`), không dùng gradient quá mức, không duplicate Header/Footer/Player.
   - Tuân thủ quy chuẩn React & TypeScript trong `.ecc/rules/react/`.

3. **Nếu task Full-Stack (Tính năng mới đi từ Database -> API -> UI)**:
   - Phải tuân theo **Quy trình 4 bước ECC** bên dưới.

---

## 3. Quy trình 4 bước chuẩn ECC khi phát triển tính năng

Khi được yêu cầu tạo tính năng mới (ví dụ: Tạo Playlist, Upload nhạc, Phân quyền Admin/Staff):

```text
[1. Plan] ──> [2. Backend First] ──> [3. Frontend Integration] ──> [4. Review & Gate]
```

### Bước 1: Lập kế hoạch (Plan)
- Không nhảy vào viết code ngay.
- Liệt kê:
  - Database schema & Entity thay đổi.
  - Các API endpoints cần tạo (HTTP method, Request/Response DTO).
  - Các component frontend cần tạo/sửa.
  - Phân quyền (Guest, User, Staff, Admin) cho tính năng này.
- Chờ người dùng xác nhận kế hoạch trước khi bắt đầu.

### Bước 2: Triển khai Backend (`backend/`)
- Tạo/cập nhật Entity, Migration script.
- Tạo Repository, DTO (Request/Response), Mapper.
- Viết Service logic, xử lý Exception nghiệp vụ.
- Viết Controller và áp dụng `@PreAuthorize` hoặc Security filter.
- Chạy thử / kiểm thử API.

### Bước 3: Triển khai Frontend (`frontend/`)
- Khai báo kiểu dữ liệu trong `src/types.ts` khớp với Response DTO của Backend.
- Viết service/fetch API.
- Tạo component/page tuân thủ Design Tokens trong `AGENTS_FRONTEND.md` (Xanh dương sáng `#0284C7` & Màu cát `#E6D5B8`, không duplicate Player/Header).
- Xử lý các trạng thái: Loading, Success, Error, Empty state.

### Bước 4: Kiểm tra & Review (Quality Gate)
- Kiểm tra bảo mật: Không lộ JWT, validate input ở cả Backend và Frontend, kiểm tra phân quyền đúng vai trò (Role-based Access Control).
- Kiểm tra lỗi build: `mvn test` (backend) và `npm run build` (frontend).

---

## 4. Các chuyên viên AI tích hợp (`agent/`)

Khi thực hiện các nhiệm vụ chuyên sâu, AI sẽ đóng vai các chuyên viên sau:
- **Architect ([agent/architect.md](file:///C:/Users/lehai/IdeaProjects/soundwave/agent/architect.md))**: Phân tích kiến trúc, thiết kế database và API contract.
- **Code Reviewer ([agent/code-reviewer.md](file:///C:/Users/lehai/IdeaProjects/soundwave/agent/code-reviewer.md))**: Đánh giá chất lượng code, phát hiện code smell.
- **Security Reviewer ([agent/security-reviewer.md](file:///C:/Users/lehai/IdeaProjects/soundwave/agent/security-reviewer.md))**: Rà soát bảo mật SQL Injection, CORS, JWT và lỗ hổng xác thực.
- Cùng toàn bộ danh mục 68 chuyên viên AI chuyên sâu nằm trong thư mục [agent/](file:///C:/Users/lehai/IdeaProjects/soundwave/agent/).

---

## 5. Quy tắc quản lý Git (Git Safety Rules) — BẮT BUỘC

1. **TUYỆT ĐỐI KHÔNG TỰ Ý COMMIT HOẶC PUSH CODE**:
   - AI **nghiêm cấm** tự ý chạy các lệnh `git commit` hoặc `git push` trong bất kỳ tình huống nào nếu lập trình viên chưa yêu cầu rõ ràng.
   - Khi hoàn thành việc viết code, kiểm thử hoặc sửa đổi:
     - AI chỉ chạy kiểm tra build/test (`mvn test`, `npm run build`), kiểm tra `git status`.
     - Báo cáo rõ ràng danh sách các file đã thay đổi cho người dùng và chờ chỉ thị tiếp theo.
   - Chỉ thực hiện `git commit` hoặc `git push` khi và chỉ khi có yêu cầu bằng lời nói rõ ràng từ người dùng (ví dụ: *"hãy commit code cho tui"*, *"commit và push lên github"*).
2. **Quy chuẩn khi được lệnh commit**:
   - Sử dụng định dạng Conventional Commits chuẩn mực (`feat:`, `fix:`, `style:`, `refactor:`, `test:`, `chore:`).
   - Chỉ stage (`git add`) đúng các file thuộc phạm vi tính năng/yêu cầu đó.

