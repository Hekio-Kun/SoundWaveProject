/**
 * ==============================================================================
 * File: src/components/Header.jsx
 * Mô tả: Component Header hiển thị thanh điều hướng chính của ứng dụng Product Management.
 * 
 * Chức năng:
 *  - Hiển thị logo ứng dụng dạng icon khối lập phương (Box/Package 3D style)
 *  - Hiển thị tiêu đề ứng dụng "Product Management"
 *  - Cung cấp các liên kết điều hướng: "Products" và "Categories"
 *  - Hỗ trợ thanh điều hướng phụ với nút "← Product Management" khi đang ở các màn hình con (Add, Edit, Detail)
 * 
 * Hooks sử dụng:
 *  - useProductContext: Lấy view hiện tại và hàm điều hướng navigateTo
 * ==============================================================================
 */

import React from 'react';
import { Package, ArrowLeft } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';

export const Header = () => {
  // Lấy trạng thái view hiện tại và hàm chuyển đổi view từ Context
  const { currentView, navigateTo } = useProductContext();

  // Kiểm tra xem hiện tại có đang ở các trang con (Create, Edit, Detail) hay không
  const isSubView = currentView !== 'list';

  return (
    <header className="w-full shadow-md">
      {/* 
        1. THANH ĐIỀU HƯỚNG CHÍNH (MAIN NAVBAR) 
        Màu xanh đậm chủ đạo theo thiết kế giao diện đề bài
      */}
      <div className="bg-[#1e40af] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo và Tên ứng dụng */}
          <div 
            onClick={() => navigateTo('list')} 
            className="flex items-center space-x-3 cursor-pointer group select-none"
            title="Quay về trang danh sách sản phẩm"
          >
            {/* Biểu tượng hộp sản phẩm 3D */}
            <div className="p-2 bg-blue-500/30 rounded-lg group-hover:bg-blue-500/50 transition-colors">
              <Package className="w-6 h-6 text-blue-200" />
            </div>
            
            {/* Tiêu đề ứng dụng */}
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-100 transition-colors">
              Product Management
            </span>
          </div>

          {/* Menu liên kết bên phải: Products & Categories */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigateTo('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentView === 'list'
                  ? 'bg-blue-700/60 text-white shadow-inner font-semibold'
                  : 'text-blue-100 hover:bg-blue-700/40 hover:text-white'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => {
                // Điều hướng về danh sách và reset bộ lọc
                navigateTo('list');
              }}
              className="px-4 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700/40 hover:text-white transition-all"
            >
              Categories
            </button>
          </nav>
        </div>
      </div>

      {/* 
        2. THANH SUB-HEADER (HIỂN THỊ KHI Ở MÀN HÌNH CON: CREATE, EDIT, DETAIL)
        Theo ảnh chụp giao diện đề bài (Trang 3, 6, 8): Thanh xanh dương có nút "← Product Management"
      */}
      {isSubView && (
        <div className="bg-[#1d4ed8] text-white border-t border-blue-400/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <button
              onClick={() => navigateTo('list')}
              className="inline-flex items-center text-sm font-medium text-white hover:text-blue-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Product Management</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
