/**
 * ==============================================================================
 * File: src/components/SuccessModal.jsx
 * Mô tả: Hộp thoại Modal thông báo thành công sau khi hoàn tất các thao tác CRUD:
 *  - Thêm mới sản phẩm: "Product added successfully!"
 *  - Cập nhật sản phẩm: "Product updated successfully!"
 *  - Xóa sản phẩm: "Product deleted successfully."
 * 
 * Thiết kế giao diện (UI) chuẩn theo ảnh mẫu đề bài (Trang 3 & Trang 7):
 *  - Vòng tròn màu xanh lá cây chứa biểu tượng dấu tích (Checkmark ✓)
 *  - Dòng thông báo kết quả thành công
 *  - Nút bấm "[ OK ]" màu xanh dương để đóng modal và quay lại danh sách
 * 
 * Hooks sử dụng:
 *  - useProductContext: Lấy trạng thái successModal và hàm đóng closeSuccessModal
 * ==============================================================================
 */

import React from 'react';
import { Check } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';

export const SuccessModal = () => {
  // Lấy dữ liệu modal thông báo thành công và hàm đóng từ Context
  const { successModal, closeSuccessModal } = useProductContext();

  // Nếu modal không ở trạng thái mở, không render gì ra DOM
  if (!successModal.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
      
      {/* Khung nội dung hộp thoại */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-7 text-center transform transition-all animate-scale-up">
        
        {/* Biểu tượng dấu tích tròn màu xanh lá cây (Green Checkmark) chuẩn ảnh Trang 3 */}
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
        </div>

        {/* Nội dung thông báo thành công */}
        <p className="text-base sm:text-lg font-semibold text-slate-800 mb-6">
          {successModal.message || 'Product operation completed successfully!'}
        </p>

        {/* Nút bấm "[ OK ]" màu xanh dương */}
        <button
          type="button"
          onClick={closeSuccessModal}
          autoFocus
          className="w-28 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow transition-colors"
        >
          OK
        </button>

      </div>

    </div>
  );
};

export default SuccessModal;
