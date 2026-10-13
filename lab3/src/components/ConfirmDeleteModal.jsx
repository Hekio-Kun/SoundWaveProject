/**
 * ==============================================================================
 * File: src/components/ConfirmDeleteModal.jsx
 * Mô tả: Modal hộp thoại xác nhận trước khi xóa sản phẩm (Delete Confirmation Modal).
 * 
 * Đáp ứng yêu cầu đề bài (Mục 3.4 & Trang 7):
 *  - "Before deleting a product, the application must ask for confirmation."
 *  - Giao diện chuẩn xác theo ảnh chụp mẫu:
 *      + Tiêu đề: "Confirm Delete" kèm nút đóng 'X'
 *      + Icon cảnh báo dấu chấm than màu đỏ (!) nổi bật
 *      + Dòng chữ: Are you sure you want to delete "[Tên sản phẩm]"?
 *      + 2 nút hành động: [Cancel] và [Delete]
 * 
 * Hooks sử dụng:
 *  - useProductContext: Lấy trạng thái deleteModal, closeDeleteModal, confirmDeleteProduct
 * ==============================================================================
 */

import React from 'react';
import { X } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';

export const ConfirmDeleteModal = () => {
  // Lấy dữ liệu và hàm xử lý xóa từ Context
  const { deleteModal, closeDeleteModal, confirmDeleteProduct } = useProductContext();

  // Nếu modal không được bật, không render gì cả
  if (!deleteModal.isOpen || !deleteModal.product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in">
      
      {/* Khung nội dung Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all p-6 text-center">
        
        {/* Nút đóng 'X' ở góc trên bên phải */}
        <button
          type="button"
          onClick={closeDeleteModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Đóng hộp thoại"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề hộp thoại */}
        <h3 className="text-xl font-bold text-slate-800 mb-6 text-left">
          Confirm Delete
        </h3>

        {/* Biểu tượng dấu chấm than đỏ (!) to bản trong vòng tròn đỏ */}
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md">
            <span className="text-2xl font-black leading-none">!</span>
          </div>
        </div>

        {/* Thông điệp xác nhận kèm tên sản phẩm */}
        <div className="text-slate-700 text-base mb-6">
          <p>Are you sure you want to delete</p>
          <p className="font-bold text-slate-900 text-lg mt-1">
            "{deleteModal.product.name}"?
          </p>
        </div>

        {/* 2 nút thao tác: Cancel và Delete */}
        <div className="flex items-center justify-center space-x-3">
          
          {/* Nút Cancel: Đóng hộp thoại mà không xóa */}
          <button
            type="button"
            onClick={closeDeleteModal}
            className="w-32 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>

          {/* Nút Delete: Thực thi xóa sản phẩm */}
          <button
            type="button"
            onClick={confirmDeleteProduct}
            className="w-32 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  );
};

export default ConfirmDeleteModal;
