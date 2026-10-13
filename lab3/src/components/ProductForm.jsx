/**
 * ==============================================================================
 * File: src/components/ProductForm.jsx
 * Mô tả: Component biểu mẫu (Form) dùng chung cho cả 2 chức năng:
 *  1. Thêm mới sản phẩm (Add New Product - POST /products)
 *  2. Chỉnh sửa sản phẩm (Edit Product - PATCH /products/:id)
 * 
 * Các tiêu chí kiểm tra dữ liệu hợp lệ (Form Validation) theo đề bài:
 *  - Product Name: Required (Bắt buộc nhập, không được để trống)
 *  - Price: Required and greater than 0 (Bắt buộc và phải lớn hơn 0)
 *  - Category: Required (Bắt buộc chọn danh mục)
 *  - Stock: Required and greater than or equal to 0 (Bắt buộc và phải >= 0)
 *  - Description: Required (Bắt buộc nhập mô tả)
 * 
 * Hooks sử dụng:
 *  - useState: Quản lý giá trị form (formData), thông báo lỗi (errors), và cờ touched
 *  - useEffect: Tự động nạp dữ liệu cũ của sản phẩm vào form khi ở chế độ Edit
 *  - useProductContext: Lấy danh mục, gọi hàm tạo/sửa sản phẩm, điều hướng
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useProductContext } from '../context/ProductContext';
import * as api from '../services/api';

export const ProductForm = () => {
  // Lấy các state và actions cần thiết từ Context
  const {
    currentView,
    selectedProductId,
    products,
    categories,
    handleCreateProduct,
    handleUpdateProduct,
    navigateTo,
  } = useProductContext();

  // Xác định chế độ hiện tại là Chỉnh sửa (Edit) hay Thêm mới (Create)
  const isEditMode = currentView === 'edit';

  // ----------------------------------------------------------------------------
  // 1. KHỞI TẠO STATE CỦA FORM (useState)
  // ----------------------------------------------------------------------------
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    image: '',
  });

  // State lưu trữ các lỗi validation của từng trường
  const [errors, setErrors] = useState({});

  // State đánh dấu trường nào đã được người dùng chạm vào (blur)
  const [touched, setTouched] = useState({});

  // Trạng thái đang submit dữ liệu
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----------------------------------------------------------------------------
  // 2. HIỆU ỨNG ĐỒNG BỘ DỮ LIỆU KHI EDIT (useEffect)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (isEditMode && selectedProductId) {
      // 1. Thử tìm sản phẩm trong danh sách đã có trong context
      const existingProduct = products.find(
        (p) => String(p.id) === String(selectedProductId)
      );

      if (existingProduct) {
        // Nạp dữ liệu vào form
        setFormData({
          name: existingProduct.name || '',
          price: existingProduct.price ?? '',
          category: existingProduct.category || '',
          stock: existingProduct.stock ?? '',
          description: existingProduct.description || '',
          image: existingProduct.image || '',
        });
      } else {
        // 2. Nếu không tìm thấy trong context (ví dụ người dùng refresh trang), gọi API GET /products/:id
        api.getProductById(selectedProductId)
          .then((data) => {
            setFormData({
              name: data.name || '',
              price: data.price ?? '',
              category: data.category || '',
              stock: data.stock ?? '',
              description: data.description || '',
              image: data.image || '',
            });
          })
          .catch((err) => {
            console.error('Không thể tải chi tiết sản phẩm để sửa:', err);
          });
      }
    } else {
      // Nếu ở chế độ thêm mới, đặt danh mục mặc định nếu có sẵn
      if (categories.length > 0 && !formData.category) {
        setFormData((prev) => ({
          ...prev,
          category: categories[0]?.name || 'Laptop',
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, selectedProductId, products, categories]);

  // ----------------------------------------------------------------------------
  // 3. LOGIC VALIDATION THEO YÊU CẦU ĐỀ BÀI (Trang 5 & 6)
  // ----------------------------------------------------------------------------
  const validateForm = (data) => {
    const newErrors = {};

    // 1. Product Name: Required
    if (!data.name || data.name.trim() === '') {
      newErrors.name = 'Product Name is required';
    }

    // 2. Price: Required and greater than 0
    if (data.price === '' || data.price === null || data.price === undefined) {
      newErrors.price = 'Price is required';
    } else if (Number(data.price) <= 0 || isNaN(Number(data.price))) {
      newErrors.price = 'Price must be greater than 0';
    }

    // 3. Category: Required
    if (!data.category || data.category.trim() === '') {
      newErrors.category = 'Category is required';
    }

    // 4. Stock: Required and greater than or equal to 0
    if (data.stock === '' || data.stock === null || data.stock === undefined) {
      newErrors.stock = 'Stock is required';
    } else if (Number(data.stock) < 0 || isNaN(Number(data.stock))) {
      newErrors.stock = 'Stock must be greater than or equal to 0';
    }

    // 5. Description: Required
    if (!data.description || data.description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    return newErrors;
  };

  // ----------------------------------------------------------------------------
  // 4. CÁC HÀM XỬ LÝ SỰ KIỆN FORM (HANDLERS)
  // ----------------------------------------------------------------------------

  /**
   * Cập nhật giá trị khi người dùng nhập dữ liệu vào ô input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    // Nếu trường này đã bị chạm, thực hiện kiểm tra lỗi realtime
    if (touched[name]) {
      const currentErrors = validateForm(updatedData);
      setErrors((prev) => ({
        ...prev,
        [name]: currentErrors[name] || undefined,
      }));
    }
  };

  /**
   * Đánh dấu trường input đã bị focus và rời đi (onBlur)
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const currentErrors = validateForm(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: currentErrors[name] || undefined,
    }));
  };

  /**
   * Xử lý khi nhấn nút Lưu (Save) hoặc Cập nhật (Update)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Đánh dấu tất cả các trường đều đã được chạm để hiển thị toàn bộ lỗi nếu có
    const allTouched = {
      name: true,
      price: true,
      category: true,
      stock: true,
      description: true,
    };
    setTouched(allTouched);

    // Chạy kiểm tra tính hợp lệ
    const formValidationErrors = validateForm(formData);
    setErrors(formValidationErrors);

    // Nếu còn tồn tại bất kỳ lỗi nào, dừng quá trình submit
    if (Object.keys(formValidationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Chuẩn bị payload dữ liệu gửi lên server
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock, 10),
        description: formData.description.trim(),
        // Nếu không có ảnh, dùng ảnh ngẫu nhiên hoặc ảnh mặc định công nghệ
        image: formData.image.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      };

      if (isEditMode) {
        // Gọi API PATCH /products/:id
        await handleUpdateProduct(selectedProductId, payload);
      } else {
        // Gọi API POST /products
        await handleCreateProduct(payload);
      }
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu sản phẩm:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 5. GIAO DIỆN (UI RENDER)
  // Thiết kế chuẩn xác theo mẫu đề bài (Trang 3 & Trang 6)
  // ----------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      
      {/* Khung thẻ bao bọc form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {/* Tiêu đề Form: "Add New Product" hoặc "Edit Product" */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center mb-6">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          
          {/* HÀNG 1: Product Name & Price (2 cột trên màn hình desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Logitech MX Master 3"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none ${
                  touched.name && errors.name
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name}</p>
              )}
            </div>

            {/* 2. Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Price <span className="text-rose-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="any"
                value={formData.price}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="99"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none ${
                  touched.price && errors.price
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {touched.price && errors.price && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.price}</p>
              )}
            </div>

          </div>

          {/* HÀNG 2: Category & Stock (2 cột trên màn hình desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 3. Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none cursor-pointer ${
                  touched.category && errors.category
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              >
                <option value="">-- Select Category --</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id || cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Laptop">Laptop</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Accessories">Accessories</option>
                  </>
                )}
              </select>
              {touched.category && errors.category && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category}</p>
              )}
            </div>

            {/* 4. Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Stock <span className="text-rose-500">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="20"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none ${
                  touched.stock && errors.stock
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                    : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {touched.stock && errors.stock && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.stock}</p>
              )}
            </div>

          </div>

          {/* HÀNG 3: Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Wireless mouse"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none resize-none ${
                touched.description && errors.description
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                  : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            {touched.description && errors.description && (
              <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description}</p>
            )}
          </div>

          {/* HÀNG 4: NÚT THAO TÁC (Cancel & Save / Update) */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            {/* Nút Cancel: Hủy bỏ và trở về danh sách */}
            <button
              type="button"
              onClick={() => navigateTo('list')}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            {/* Nút Save (Thêm) hoặc Update (Cập nhật) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'Processing...'
                : isEditMode
                ? 'Update'
                : 'Save'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ProductForm;
