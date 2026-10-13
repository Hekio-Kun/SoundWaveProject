/**
 * ==============================================================================
 * File: src/App.jsx
 * Mô tả: Component gốc (Root Component) quản lý bố cục chính (Application Layout) của ứng dụng.
 * 
 * Các kỹ thuật & Hook nâng cao được áp dụng:
 *  1. React.lazy & Suspense:
 *     - Áp dụng Code Splitting để tải lười (lazy load) các component màn hình phụ như ProductForm và ProductDetail
 *     - Giúp tăng tốc độ tải trang ban đầu (Initial Page Load Performance)
 *  2. React Context (ProductProvider & useProductContext):
 *     - Quản lý toàn bộ State tập trung, tránh hiện tượng prop drilling
 *  3. Điều hướng linh hoạt (Conditional Rendering):
 *     - Màn hình 'list': Hiển thị Header + ProductFilter + ProductList
 *     - Màn hình 'create' / 'edit': Hiển thị ProductForm (Lazy loaded)
 *     - Màn hình 'detail': Hiển thị ProductDetail (Lazy loaded)
 *  4. Quản lý Modal toàn cục (ConfirmDeleteModal, SuccessModal)
 * ==============================================================================
 */

import React, { Suspense, lazy } from 'react';
import { ProductProvider, useProductContext } from './context/ProductContext';
import Header from './components/Header';
import ProductFilter from './components/ProductFilter';
import ProductList from './components/ProductList';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import SuccessModal from './components/SuccessModal';
import { RefreshCw } from 'lucide-react';

// ==============================================================================
// ÁP DỤNG REACT.LAZY ĐỂ TẢI LƯỜI CÁC COMPONENT FORM VÀ CHI TIẾT
// ==============================================================================
const ProductForm = lazy(() => import('./components/ProductForm'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));

/**
 * Component hiển thị trạng thái chờ (Fallback Loader) khi tải lười các component bằng Suspense
 */
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-16">
    <div className="inline-flex items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-full animate-spin mb-3">
      <RefreshCw className="w-8 h-8" />
    </div>
    <p className="text-slate-500 font-medium text-sm">Đang tải thành phần giao diện...</p>
  </div>
);

/**
 * Component Bố cục nội dung chính bên trong Provider
 */
const MainLayout = () => {
  // Lấy trạng thái màn hình hiện tại từ Context
  const { currentView } = useProductContext();

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      
      {/* 1. Header chính của ứng dụng */}
      <Header />

      {/* 2. Vùng chứa nội dung chính (Main Content Area) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Trường hợp 1: Màn hình danh sách sản phẩm (Mặc định) */}
        {currentView === 'list' && (
          <div className="animate-fade-in">
            {/* Thanh tìm kiếm và bộ lọc danh mục */}
            <ProductFilter />
            {/* Bảng hiển thị danh sách sản phẩm */}
            <ProductList />
          </div>
        )}

        {/* Trường hợp 2: Màn hình Thêm mới hoặc Chỉnh sửa sản phẩm (Lazy Loaded) */}
        {(currentView === 'create' || currentView === 'edit') && (
          <Suspense fallback={<LoadingFallback />}>
            <ProductForm />
          </Suspense>
        )}

        {/* Trường hợp 3: Màn hình Xem chi tiết sản phẩm (Lazy Loaded) */}
        {currentView === 'detail' && (
          <Suspense fallback={<LoadingFallback />}>
            <ProductDetail />
          </Suspense>
        )}

      </main>

      {/* 3. Footer bản quyền ứng dụng */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© 2026 SoundWave / Lab 3 - ReactJS Component, JSON Server, Filter & CRUD</p>
      </footer>

      {/* 4. Các Modal thông báo toàn cục (Global Modals) */}
      <ConfirmDeleteModal />
      <SuccessModal />

    </div>
  );
};

/**
 * Component App gốc bọc Provider ra ngoài cùng
 */
export const App = () => {
  return (
    <ProductProvider>
      <MainLayout />
    </ProductProvider>
  );
};

export default App;
