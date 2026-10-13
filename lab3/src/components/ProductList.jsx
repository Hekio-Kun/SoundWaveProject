/**
 * ==============================================================================
 * File: src/components/ProductList.jsx
 * Mô tả: Component hiển thị bảng danh sách sản phẩm (Table layout), xử lý các trạng thái:
 *  1. Đang tải dữ liệu (Loading skeleton / spinner)
 *  2. Lỗi kết nối (Error message)
 *  3. Không tìm thấy sản phẩm nào khớp bộ lọc (Empty State với icon hộp rỗng và thông điệp)
 *  4. Bảng sản phẩm tiêu chuẩn kèm bộ đếm số lượng:
 *     - "Showing X products" (khi không lọc)
 *     - "Showing X product(s) (filtered)" (khi đang lọc theo tên hoặc danh mục)
 * 
 * Hooks sử dụng:
 *  - useProductContext: Lấy filteredProducts, loading, error, isFiltering...
 * ==============================================================================
 */

import React from 'react';
import { PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import ProductItem from './ProductItem';

export const ProductList = () => {
  // Lấy dữ liệu sản phẩm sau khi lọc và các trạng thái từ Context
  const {
    filteredProducts,
    loading,
    error,
    isFiltering,
    loadProducts,
  } = useProductContext();

  // ----------------------------------------------------------------------------
  // 1. TRẠNG THÁI ĐANG TẢI DỮ LIỆU (LOADING STATE)
  // ----------------------------------------------------------------------------
  if (loading && filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-full animate-spin mb-4">
          <RefreshCw className="w-8 h-8" />
        </div>
        <p className="text-slate-600 font-medium">Đang tải danh sách sản phẩm từ JSON Server...</p>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // 2. TRẠNG THÁI LỖI KẾT NỐI SERVER (ERROR STATE)
  // ----------------------------------------------------------------------------
  if (error && filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 p-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-rose-50 text-rose-500 rounded-full mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Không thể kết nối đến JSON Server</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">{error}</p>
        <p className="text-xs text-slate-400 mb-4">
          Vui lòng đảm bảo bạn đã chạy lệnh: <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">npm run server</code> hoặc <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">json-server --watch db.json --port 4000</code>
        </p>
        <button
          type="button"
          onClick={loadProducts}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // 3. TRẠNG THÁI DANH SÁCH RỖNG / KHÔNG TÌM THẤY KẾT QUẢ (EMPTY STATE)
  // Theo ảnh mẫu đề bài Trang 3 & 4: Icon hộp carton mở nắp + Tiêu đề + Phụ đề
  // ----------------------------------------------------------------------------
  if (filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-16 px-6 text-center">
        {/* Hình minh họa hộp carton rỗng 3D */}
        <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner">
          <PackageOpen className="w-14 h-14 text-slate-400 stroke-[1.5]" />
        </div>

        {/* Tiêu đề thông báo rỗng theo đúng ảnh mẫu đề bài */}
        <h3 className="text-xl font-bold text-slate-800 mb-1">
          No products found.
        </h3>

        {/* Phụ đề hướng dẫn theo ảnh mẫu đề bài */}
        <p className="text-sm text-slate-500">
          Try a different keyword or category.
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------------------
  // 4. BẢNG DANH SÁCH SẢN PHẨM TIÊU CHUẨN (TABLE LAYOUT)
  // ----------------------------------------------------------------------------
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Khung cuộn ngang trên màn hình di động nhỏ */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header của bảng */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-16">ID</th>
              <th className="py-3.5 px-4">Product Name</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4 w-44">Actions</th>
            </tr>
          </thead>

          {/* Danh sách các dòng sản phẩm */}
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>

      {/* 
        Thanh đếm số lượng sản phẩm ở cuối bảng theo mẫu đề bài (Trang 3 & 4)
        - Khi không lọc: "Showing 5 products"
        - Khi có lọc: "Showing 1 product (filtered)" hoặc "Showing 2 products (filtered)"
      */}
      <div className="px-4 py-3.5 bg-slate-50/70 border-t border-slate-200 text-sm font-medium text-slate-500">
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        {isFiltering && ' (filtered)'}
      </div>

    </div>
  );
};

export default ProductList;
