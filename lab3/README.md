# LAB 3 – REACTJS COMPONENT, JSON SERVER, FILTER & CRUD

Dự án hoàn chỉnh cho bài thực hành **Lab 3** ứng dụng ReactJS kết hợp JSON Server REST API, quản lý sản phẩm với đầy đủ tính năng lọc, tìm kiếm và các thao tác CRUD.

---

## 1. Cấu trúc thư mục dự án (Project Architecture)

Tuân thủ chính xác 100% theo yêu cầu đề bài:

```text
lab3/
├── src/
│   ├── components/
│   │   ├── Header.jsx             # Thanh tiêu đề, logo và điều hướng ứng dụng
│   │   ├── ProductFilter.jsx      # Bộ lọc tìm kiếm theo tên và danh mục, nút thêm mới
│   │   ├── ProductList.jsx        # Bảng danh sách sản phẩm, đếm số lượng, empty state
│   │   ├── ProductItem.jsx        # Dòng sản phẩm đơn lẻ (ID, Tên, Danh mục, Giá, Stock, Actions)
│   │   ├── ProductForm.jsx        # Form thêm mới và chỉnh sửa sản phẩm kèm validation (Lazy loaded)
│   │   ├── ProductDetail.jsx      # Xem chi tiết sản phẩm kèm ảnh và thông số (Lazy loaded)
│   │   ├── ConfirmDeleteModal.jsx # Hộp thoại xác nhận trước khi xóa
│   │   └── SuccessModal.jsx       # Hộp thoại thông báo kết quả thành công
│   ├── context/
│   │   └── ProductContext.jsx     # Quản lý Global State bằng React Context (useState, useEffect, useMemo)
│   ├── services/
│   │   └── api.js                 # Module tập trung toàn bộ lời gọi REST API (GET, POST, PATCH, DELETE)
│   ├── App.jsx                    # Quản lý bố cục ứng dụng & tích hợp React.lazy/Suspense
│   ├── main.jsx                   # Điểm khởi chạy React 19 (createRoot)
│   └── index.css                  # Cấu hình Tailwind CSS & định dạng cơ bản
├── db.json                        # Cơ sở dữ liệu JSON Server (products, categories)
├── package.json                   # Cấu hình thư viện và scripts khởi chạy
├── vite.config.js                 # Cấu hình Vite & Tailwind plugin
└── README.md                      # Hướng dẫn chi tiết dự án
```

---

## 2. Hướng dẫn cài đặt và chạy ứng dụng

### Bước 1: Mở thư mục `lab3`
```bash
cd lab3
```

### Bước 2: Cài đặt dependencies (nếu chưa cài)
```bash
npm install
```

### Bước 3: Khởi chạy dự án
Bạn có thể chọn một trong hai cách khởi chạy sau:

#### Cách 1: Khởi chạy đồng thời cả Backend và Frontend (Khuyên dùng)
```bash
npm start
```
*Lệnh này sử dụng thư viện `concurrently` để chạy song song cả JSON Server (port 4000) và Vite Dev Server (port 5173).*

#### Cách 2: Khởi chạy riêng biệt từng phần
- **Mở Terminal 1 (Chạy JSON Server REST API trên port 4000):**
  ```bash
  npm run server
  # hoặc: json-server --watch db.json --port 4000
  ```
  API sẽ chạy tại:
  - `http://localhost:4000/products`
  - `http://localhost:4000/categories`

- **Mở Terminal 2 (Chạy React Vite Frontend):**
  ```bash
  npm run dev
  ```
  Truy cập ứng dụng tại: `http://localhost:5173`

---

## 3. Các API Endpoints & Thao tác CRUD hoàn chỉnh

| Thao tác (Operation) | Phương thức HTTP | Endpoint | Mô tả nghiệp vụ |
| :--- | :---: | :--- | :--- |
| **Create** | `POST` | `/products` | Thêm mới một sản phẩm vào cơ sở dữ liệu |
| **Read** | `GET` | `/products` | Hiển thị toàn bộ danh sách sản phẩm |
| **Read Detail** | `GET` | `/products/:id` | Hiển thị màn hình chi tiết sản phẩm theo ID |
| **Update** | `PATCH` | `/products/:id` | Cập nhật thông tin sản phẩm đã có |
| **Delete** | `DELETE` | `/products/:id` | Xóa sản phẩm khỏi database sau khi xác nhận |
| **Categories** | `GET` | `/categories` | Lấy danh mục sản phẩm phục vụ dropdown |

---

## 4. Các Built-in Hook & Kỹ thuật nâng cao đã áp dụng

Dự án áp dụng đầy đủ các kỹ thuật hiện đại theo yêu cầu mở rộng:

1. **`useContext` (`ProductContext.jsx`)**:
   - Quản trị trạng thái tập trung toàn ứng dụng: danh sách sản phẩm, danh mục, từ khóa tìm kiếm, lọc danh mục, trạng thái modal, view hiện tại.
   - Tránh hiện tượng truyền props lòng vòng (prop-drilling).
   - Cung cấp custom hook `useProductContext()` an toàn và tiện dụng.

2. **`useState`**:
   - Quản lý dữ liệu biểu mẫu `formData` (`name`, `price`, `category`, `stock`, `description`).
   - Quản lý trạng thái lỗi `errors` và tương tác `touched` khi người dùng nhập liệu.
   - Quản lý trạng thái đóng/mở của các modal hộp thoại.

3. **`useEffect`**:
   - Tự động gọi API lấy dữ liệu sản phẩm và danh mục khi ứng dụng khởi chạy (`mount`).
   - Tự động nạp dữ liệu cũ của sản phẩm khi chuyển sang chế độ chỉnh sửa (`Edit`).
   - Gọi API `GET /products/:id` khi vào màn hình xem chi tiết sản phẩm (`ProductDetail`).

4. **`useMemo`**:
   - Tối ưu hiệu năng tính toán danh sách sản phẩm sau khi lọc (`filteredProducts`), chỉ tính toán lại khi `products`, `searchTerm` hoặc `selectedCategory` thay đổi.

5. **`React.lazy` & `<Suspense>` (`App.jsx`)**:
   - Tách mã nguồn (Code Splitting) cho các màn hình `ProductForm` và `ProductDetail`.
   - Giảm dung lượng tải ban đầu, hiển thị spinner mượt mà trong quá trình tải thành phần giao diện.

---

## 5. Các tiêu chuẩn kiểm tra hợp lệ dữ liệu (Form Validation)

Theo đúng quy định trong đề bài:

| Trường (Field) | Quy tắc kiểm tra (Validation Rule) |
| :--- | :--- |
| **Product Name** | Bắt buộc nhập (`Required`), không được để trống hoặc chỉ có khoảng trắng |
| **Price** | Bắt buộc nhập và phải lớn hơn 0 (`Required and greater than 0`) |
| **Category** | Bắt buộc chọn một danh mục hợp lệ (`Required`) |
| **Stock** | Bắt buộc nhập và phải lớn hơn hoặc bằng 0 (`Required and greater than or equal to 0`) |
| **Description** | Bắt buộc nhập nội dung mô tả (`Required`) |

---

## 6. Giao diện và Trải nghiệm người dùng (UI / UX)

- Thiết kế bám sát 100% hình ảnh thực tế trong tài liệu:
  - Header xanh navy (`#1e40af`) với logo hộp lập phương và điều hướng.
  - Sub-header với nút `← Product Management` khi ở các trang con (Create, Edit, Detail).
  - Nút xóa 'x' tích hợp ngay trong ô tìm kiếm khi có ký tự.
  - Empty search state với hình minh họa hộp carton rỗng cùng thông điệp: *"No products found. Try a different keyword or category."*
  - Modal xác nhận xóa với icon dấu chấm than đỏ (!) to bản.
  - Modal thông báo thành công với icon dấu tích xanh lá (✓) và nút `[ OK ]`.
  - Bộ đếm sản phẩm linh hoạt: *"Showing 5 products"* hoặc *"Showing 1 product (filtered)"*.
