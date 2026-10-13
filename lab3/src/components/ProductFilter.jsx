/**
 * ==============================================================================
 * File: src/components/ProductFilter.jsx
 * Mô tả: Component bộ lọc sản phẩm cung cấp các chức năng:
 *  1. Tìm kiếm theo tên sản phẩm (Search Input với icon kính lúp và nút xóa 'x')
 *  2. Lọc theo danh mục (Category Select Dropdown: All Categories, Laptop, Smartphone, Tablet...)
 *  3. Nút "+ Add Product" để chuyển sang màn hình thêm mới sản phẩm
 * 
 * Hooks sử dụng:
 *  - useProductContext: Lấy các biến trạng thái và hàm xử lý bộ lọc
 * ==============================================================================
 */

import React from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';

export const ProductFilter = () => {
  // Trích xuất các state và hàm xử lý liên quan đến tìm kiếm & lọc từ Context
  const {
    searchTerm,
    handleSearchChange,
    clearSearch,
    selectedCategory,
    handleCategoryChange,
    categories,
    navigateTo,
  } = useProductContext();

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 mb-6 transition-all">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* ==================================================================== */}
        {/* KHU VỰC TÌM KIẾM VÀ CHỌN DANH MỤC (BÊN TRÁI & GIỮA) */}
        {/* ==================================================================== */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          
          {/* 1. Input tìm kiếm tên sản phẩm */}
          <div className="relative w-full sm:w-80">
            {/* Icon kính lúp tìm kiếm ở đầu ô input */}
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>

            {/* Ô nhập từ khóa tìm kiếm */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search product name..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />

            {/* Nút 'x' để xóa nhanh nội dung tìm kiếm (chỉ hiển thị khi có chữ) */}
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Xóa từ khóa tìm kiếm"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5 text-slate-600" />
              </button>
            )}
          </div>

          {/* 2. Dropdown chọn danh mục (Category filter) */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
            >
              {/* Lựa chọn tất cả danh mục mặc định */}
              <option value="All Categories">All Categories</option>

              {/* Duyệt qua danh sách danh mục nạp từ JSON Server */}
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* NÚT BẤM "+ ADD PRODUCT" (BÊN PHẢI) */}
        {/* ==================================================================== */}
        <div className="w-full md:w-auto">
          <button
            type="button"
            onClick={() => navigateTo('create')}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all duration-150"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Product</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductFilter;
