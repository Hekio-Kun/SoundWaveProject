/**
 * ==============================================================================
 * File: src/components/ProductItem.jsx
 * Mô tả: Component hiển thị một hàng (table row) thông tin của một sản phẩm đơn lẻ.
 * 
 * Các trường hiển thị:
 *  - ID: Mã định danh sản phẩm
 *  - Product Name: Tên sản phẩm
 *  - Category: Tên danh mục (Laptop, Smartphone, Tablet...)
 *  - Price: Đơn giá (được format dạng tiền tệ USD, ví dụ $999, $1,199)
 *  - Stock: Số lượng hàng tồn kho
 *  - Actions: 3 nút hành động riêng biệt:
 *      + View (Màu xanh dương): Xem chi tiết sản phẩm (GET /products/:id)
 *      + Edit (Màu vàng cam): Mở form chỉnh sửa sản phẩm (PATCH /products/:id)
 *      + Delete (Màu đỏ): Bật modal xác nhận trước khi xóa (DELETE /products/:id)
 * 
 * Props:
 *  - product {Object}: Đối tượng thông tin sản phẩm
 * ==============================================================================
 */

import React from 'react';
import { useProductContext } from '../context/ProductContext';

export const ProductItem = ({ product }) => {
  // Lấy các hàm điều hướng và mở modal xác nhận xóa từ Context
  const { navigateTo, openDeleteModal } = useProductContext();

  /**
   * Định dạng giá tiền theo chuẩn USD ($999, $1,199)
   * @param {number|string} priceValue - Giá sản phẩm
   * @returns {string} Chuỗi định dạng $...
   */
  const formatPrice = (priceValue) => {
    const num = Number(priceValue) || 0;
    return `$${num.toLocaleString('en-US')}`;
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-100">
      
      {/* 1. ID sản phẩm */}
      <td className="py-3.5 px-4 text-sm font-medium text-slate-600">
        {product.id}
      </td>

      {/* 2. Tên sản phẩm */}
      <td className="py-3.5 px-4 text-sm font-semibold text-slate-800">
        {product.name}
      </td>

      {/* 3. Danh mục sản phẩm */}
      <td className="py-3.5 px-4 text-sm text-slate-600">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {product.category}
        </span>
      </td>

      {/* 4. Đơn giá */}
      <td className="py-3.5 px-4 text-sm font-medium text-slate-700">
        {formatPrice(product.price)}
      </td>

      {/* 5. Tồn kho */}
      <td className="py-3.5 px-4 text-sm text-slate-600">
        <span className={`font-medium ${product.stock <= 5 ? 'text-amber-600' : 'text-slate-700'}`}>
          {product.stock}
        </span>
      </td>

      {/* 6. Cột Thao tác (Actions: View, Edit, Delete) */}
      <td className="py-3.5 px-4 text-sm text-right sm:text-left">
        <div className="flex items-center gap-2">
          
          {/* Nút View - Xem chi tiết */}
          <button
            type="button"
            onClick={() => navigateTo('detail', product.id)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium rounded shadow-xs transition-colors"
            title="Xem chi tiết sản phẩm"
          >
            View
          </button>

          {/* Nút Edit - Sửa thông tin */}
          <button
            type="button"
            onClick={() => navigateTo('edit', product.id)}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-medium rounded shadow-xs transition-colors"
            title="Chỉnh sửa sản phẩm"
          >
            Edit
          </button>

          {/* Nút Delete - Xóa sản phẩm */}
          <button
            type="button"
            onClick={() => openDeleteModal(product)}
            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-xs font-medium rounded shadow-xs transition-colors"
            title="Xóa sản phẩm này"
          >
            Delete
          </button>

        </div>
      </td>

    </tr>
  );
};

export default ProductItem;
