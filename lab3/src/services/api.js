/**
 * ==============================================================================
 * File: src/services/api.js
 * Mô tả: Module dịch vụ quản lý toàn bộ các lời gọi HTTP REST API tương tác với JSON Server.
 * Base URL mặc định: http://localhost:4000
 * Hỗ trợ đầy đủ các thao tác CRUD:
 *  - Create: POST /products
 *  - Read All: GET /products
 *  - Read Detail: GET /products/:id
 *  - Update: PATCH /products/:id
 *  - Delete: DELETE /products/:id
 *  - Categories: GET /categories
 * ==============================================================================
 */

// Địa chỉ cổng mặc định của JSON Server theo yêu cầu đề bài (port 4000)
const BASE_URL = 'http://localhost:4000';

/**
 * Hàm trợ giúp xử lý phản hồi HTTP từ fetch API
 * Kiểm tra response.ok, ném lỗi chi tiết nếu request thất bại, ngược lại parse JSON
 * 
 * @param {Response} response - Đối tượng Response trả về từ fetch
 * @param {string} errorMessage - Thông báo lỗi mô tả ngữ cảnh
 * @returns {Promise<any>} Dữ liệu JSON đã được giải mã
 */
const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`${errorMessage} (Mã lỗi HTTP: ${response.status} - ${response.statusText}) ${errorText}`);
  }
  return await response.json();
};

/**
 * 1. Lấy danh sách tất cả sản phẩm
 * Endpoint: GET /products
 * 
 * @returns {Promise<Array>} Mảng danh sách sản phẩm
 */
export const getAllProducts = async () => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    return await handleResponse(response, 'Không thể tải danh sách sản phẩm từ server');
  } catch (error) {
    console.error('[API Error] getAllProducts:', error);
    throw error;
  }
};

/**
 * 2. Lấy thông tin chi tiết của 1 sản phẩm theo ID
 * Endpoint: GET /products/:id
 * 
 * @param {string|number} id - Mã định danh của sản phẩm
 * @returns {Promise<Object>} Đối tượng chi tiết sản phẩm
 */
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    return await handleResponse(response, `Không thể tìm thấy sản phẩm có ID: ${id}`);
  } catch (error) {
    console.error(`[API Error] getProductById (id=${id}):`, error);
    throw error;
  }
};

/**
 * 3. Tạo mới một sản phẩm
 * Endpoint: POST /products
 * 
 * @param {Object} productData - Dữ liệu sản phẩm mới (name, category, price, stock, description, image)
 * @returns {Promise<Object>} Sản phẩm mới vừa được tạo kèm ID do server cấp
 */
export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        // Đảm bảo kiểu dữ liệu chuẩn xác cho số liệu giá và tồn kho
        price: Number(productData.price),
        stock: Number(productData.stock),
      }),
    });
    return await handleResponse(response, 'Thêm mới sản phẩm thất bại');
  } catch (error) {
    console.error('[API Error] createProduct:', error);
    throw error;
  }
};

/**
 * 4. Cập nhật thông tin sản phẩm đã tồn tại
 * Endpoint: PATCH /products/:id
 * Ghi chú: Sử dụng PATCH để cập nhật từng phần (hoặc PUT để thay thế toàn bộ)
 * 
 * @param {string|number} id - ID sản phẩm cần cập nhật
 * @param {Object} productData - Dữ liệu cập nhật mới
 * @returns {Promise<Object>} Sản phẩm sau khi đã được cập nhật
 */
export const updateProduct = async (id, productData) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
      }),
    });
    return await handleResponse(response, `Cập nhật sản phẩm có ID: ${id} thất bại`);
  } catch (error) {
    console.error(`[API Error] updateProduct (id=${id}):`, error);
    throw error;
  }
};

/**
 * 5. Xóa một sản phẩm theo ID
 * Endpoint: DELETE /products/:id
 * 
 * @param {string|number} id - ID sản phẩm cần xóa
 * @returns {Promise<Object>} Kết quả trả về từ server xác nhận xóa
 */
export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return await handleResponse(response, `Xóa sản phẩm có ID: ${id} thất bại`);
  } catch (error) {
    console.error(`[API Error] deleteProduct (id=${id}):`, error);
    throw error;
  }
};

/**
 * 6. Lấy danh sách toàn bộ danh mục sản phẩm
 * Endpoint: GET /categories
 * 
 * @returns {Promise<Array>} Mảng danh sách danh mục (Laptop, Smartphone, Tablet, ...)
 */
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/categories`);
    return await handleResponse(response, 'Không thể tải danh sách danh mục từ server');
  } catch (error) {
    console.error('[API Error] getAllCategories:', error);
    throw error;
  }
};
