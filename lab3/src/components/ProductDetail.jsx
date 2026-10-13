/**
 * ==============================================================================
 * File: src/components/ProductDetail.jsx
 * Mô tả: Component hiển thị chi tiết sản phẩm đơn lẻ (Product Detail).
 * 
 * Đáp ứng yêu cầu nghiệp vụ:
 *  - Read Detail: Gửi HTTP GET /products/:id lên JSON Server để lấy dữ liệu mới nhất
 *  - Hiển thị layout thẻ (Card) chuẩn giao diện đề bài (Trang 8):
 *      + Bên trái: Hình ảnh sản phẩm (có cơ chế fallback nếu ảnh lỗi)
 *      + Bên phải: Bảng thông số: ID, Name, Category, Price, Stock, Description
 *      + Nút "← Back" để quay trở lại màn hình danh sách sản phẩm
 * 
 * Hooks sử dụng:
 *  - useState: Quản lý chi tiết sản phẩm, trạng thái tải (loading) và lỗi (error)
 *  - useEffect: Tự động gọi API GET /products/:id khi component mount hoặc ID thay đổi
 *  - useProductContext: Lấy selectedProductId và hàm điều hướng navigateTo
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import * as api from '../services/api';

export const ProductDetail = () => {
  // Lấy ID sản phẩm đã chọn và hàm điều hướng từ Context
  const { selectedProductId, navigateTo } = useProductContext();

  // State lưu dữ liệu chi tiết của sản phẩm lấy từ API
  const [product, setProduct] = useState(null);

  // Trạng thái đang tải dữ liệu
  const [loading, setLoading] = useState(true);

  // Lưu thông báo lỗi nếu không tìm thấy sản phẩm
  const [error, setError] = useState(null);

  // ----------------------------------------------------------------------------
  // HIỆU ỨNG GỌI API GET /products/:id (useEffect)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    // Nếu không có ID sản phẩm được chọn, quay lại danh sách
    if (!selectedProductId) {
      navigateTo('list');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Gọi API GET /products/:id từ dịch vụ api.js
    api.getProductById(selectedProductId)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Không thể tải thông tin chi tiết sản phẩm');
          setLoading(false);
        }
      });

    // Cleanup function tránh cập nhật state khi component đã unmount
    return () => {
      isMounted = false;
    };
  }, [selectedProductId, navigateTo]);

  // ----------------------------------------------------------------------------
  // 1. GIAO DIỆN KHI ĐANG TẢI (LOADING)
  // ----------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-full animate-spin mb-3">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-slate-600 font-medium">Đang tải thông tin chi tiết sản phẩm...</p>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // 2. GIAO DIỆN KHI XẢY RA LỖI (ERROR)
  // ----------------------------------------------------------------------------
  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-xl shadow-sm border border-rose-200 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-rose-50 text-rose-500 rounded-full mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy sản phẩm</h3>
        <p className="text-slate-500 text-sm mb-4">{error || 'Sản phẩm không tồn tại hoặc đã bị xóa.'}</p>
        <button
          type="button"
          onClick={() => navigateTo('list')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách</span>
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // 3. GIAO DIỆN CHI TIẾT SẢN PHẨM CHUẨN ĐỀ BÀI (Trang 8)
  // ----------------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto my-8 px-4">
      
      {/* Khung chính chứa toàn bộ thông tin chi tiết */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {/* Tiêu đề "Product Detail" căn giữa */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center mb-8">
          Product Detail
        </h2>

        {/* Nội dung chi tiết: 2 cột (Hình ảnh bên trái + Thông tin bên phải) */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
          
          {/* CỘT TRÁI: Hình ảnh minh họa sản phẩm */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 shadow-inner">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback nếu link ảnh hỏng
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <Package className="w-20 h-20 text-slate-300" />
            )}
          </div>

          {/* CỘT PHẢI: Bảng thông tin chi tiết các trường */}
          <div className="flex-1 w-full space-y-3.5 text-sm sm:text-base">
            
            {/* 1. ID */}
            <div className="flex items-start">
              <span className="w-28 text-slate-500 font-semibold">ID:</span>
              <span className="text-slate-800 font-medium">{product.id}</span>
            </div>

            {/* 2. Name */}
            <div className="flex items-start">
              <span className="w-28 text-slate-500 font-semibold">Name:</span>
              <span className="text-slate-800 font-semibold text-lg">{product.name}</span>
            </div>

            {/* 3. Category */}
            <div className="flex items-start">
              <span className="w-28 text-slate-500 font-semibold">Category:</span>
              <span className="text-slate-700 font-medium">{product.category}</span>
            </div>

            {/* 4. Price */}
            <div className="flex items-start">
              <span className="w-28 text-slate-500 font-semibold">Price:</span>
              <span className="text-slate-900 font-bold text-lg">
                ${Number(product.price).toLocaleString('en-US')}
              </span>
            </div>

            {/* 5. Stock */}
            <div className="flex items-start">
              <span className="w-28 text-slate-500 font-semibold">Stock:</span>
              <span className="text-slate-800 font-medium">{product.stock}</span>
            </div>

            {/* 6. Description */}
            <div className="flex items-start">
              <span className="w-28 text-slate-500 font-semibold">Description:</span>
              <span className="text-slate-600 font-normal leading-relaxed flex-1">
                {product.description}
              </span>
            </div>

          </div>

        </div>

        {/* NÚT "← Back" Ở CUỐI GIAO DIỆN (theo đúng mẫu đề bài Trang 8) */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-start">
          <button
            type="button"
            onClick={() => navigateTo('list')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductDetail;
