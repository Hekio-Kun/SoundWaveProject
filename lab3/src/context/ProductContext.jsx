/**
 * ==============================================================================
 * File: src/context/ProductContext.jsx
 * Mô tả: React Context quản lý toàn bộ Global State của ứng dụng Quản lý Sản phẩm (Product Management).
 * 
 * Các Hook cốt lõi được sử dụng:
 *  - createContext: Khởi tạo ngữ cảnh dữ liệu dùng chung
 *  - useContext: Custom hook (useProductContext) giúp các component con truy xuất dữ liệu dễ dàng
 *  - useState: Quản lý trạng thái danh sách sản phẩm, danh mục, bộ lọc tìm kiếm, view hiện tại, modal...
 *  - useEffect: Tự động nạp dữ liệu ban đầu từ JSON Server khi ứng dụng khởi chạy
 *  - useMemo: Tối ưu hiệu năng tính toán danh sách sản phẩm sau khi lọc (filtered products)
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';

// 1. Tạo Context đối tượng
const ProductContext = createContext(null);

/**
 * Component Provider cung cấp State và Actions cho toàn bộ cây component
 */
export const ProductProvider = ({ children }) => {
  // ----------------------------------------------------------------------------
  // A. KHỞI TẠO STATE CỦA HỆ THỐNG
  // ----------------------------------------------------------------------------

  // Danh sách sản phẩm đầy đủ lấy từ JSON Server
  const [products, setProducts] = useState([]);

  // Danh sách danh mục sản phẩm (Laptop, Smartphone, Tablet...)
  const [categories, setCategories] = useState([]);

  // Trạng thái đang tải dữ liệu (Loading indicator)
  const [loading, setLoading] = useState(false);

  // Lưu trữ thông báo lỗi nếu có sự cố mạng hoặc server
  const [error, setError] = useState(null);

  // Từ khóa tìm kiếm tên sản phẩm (Product Name)
  const [searchTerm, setSearchTerm] = useState('');

  // Danh mục đang được chọn để lọc (mặc định 'All Categories')
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Điều hướng màn hình hiện tại: 'list' (danh sách) | 'create' (thêm mới) | 'edit' (sửa) | 'detail' (chi tiết)
  const [currentView, setCurrentView] = useState('list');

  // ID của sản phẩm đang được chọn để xem chi tiết hoặc chỉnh sửa
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Trạng thái Modal xác nhận xóa sản phẩm
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null,
  });

  // Trạng thái Modal thông báo thành công (Product added / updated / deleted successfully)
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: '',
  });

  // ----------------------------------------------------------------------------
  // B. SIDE EFFECTS (useEffect) - NẠP DỮ LIỆU BAN ĐẦU
  // ----------------------------------------------------------------------------

  /**
   * Tải danh sách sản phẩm từ backend JSON Server
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Không thể kết nối đến JSON Server');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tải danh sách danh mục từ backend JSON Server
   */
  const loadCategories = async () => {
    try {
      const data = await api.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.warn('Không thể tải categories từ API, sử dụng categories mặc định từ danh sách sản phẩm');
    }
  };

  // useEffect chạy 1 lần duy nhất khi component mount để load dữ liệu ban đầu
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // ----------------------------------------------------------------------------
  // C. CÁC HÀM XỬ LÝ ĐIỀU HƯỚNG & BỘ LỌC (FILTER / SEARCH)
  // ----------------------------------------------------------------------------

  /**
   * Chuyển đổi màn hình hiển thị
   * @param {'list' | 'create' | 'edit' | 'detail'} view - Tên màn hình cần chuyển tới
   * @param {string|number|null} productId - ID sản phẩm (nếu xem chi tiết hoặc chỉnh sửa)
   */
  const navigateTo = (view, productId = null) => {
    setCurrentView(view);
    setSelectedProductId(productId);
    // Cuộn lên đầu trang khi chuyển view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Cập nhật từ khóa tìm kiếm khi người dùng gõ phím
   * @param {string} term - Chuỗi tìm kiếm
   */
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  /**
   * Xóa nội dung tìm kiếm (nhấn nút 'x')
   */
  const clearSearch = () => {
    setSearchTerm('');
  };

  /**
   * Thay đổi danh mục lọc sản phẩm
   * @param {string} category - Danh mục được chọn
   */
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // ----------------------------------------------------------------------------
  // D. TÍNH TOÁN DANH SÁCH SẢN PHẨM SAU KHI LỌC (useMemo)
  // ----------------------------------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Kiểm tra khớp từ khóa tìm kiếm trong tên sản phẩm (không phân biệt hoa thường)
      const matchesSearch = searchTerm.trim() === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase().trim());

      // 2. Kiểm tra khớp danh mục đã chọn
      const matchesCategory = selectedCategory === 'All Categories' || 
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Kiểm tra xem người dùng hiện có đang áp dụng bất kỳ bộ lọc nào không
  const isFiltering = searchTerm.trim() !== '' || selectedCategory !== 'All Categories';

  // ----------------------------------------------------------------------------
  // E. CÁC THAO TÁC CRUD NGHIỆP VỤ (CREATE, UPDATE, DELETE)
  // ----------------------------------------------------------------------------

  /**
   * Thao tác THÊM MỚI SẢN PHẨM (Create)
   * Gửi POST request lên JSON Server và cập nhật state products
   * 
   * @param {Object} productData - Dữ liệu nhập từ ProductForm
   * @returns {Promise<boolean>} Trả về true nếu thành công
   */
  const handleCreateProduct = async (productData) => {
    try {
      setLoading(true);
      setError(null);
      // Gọi API POST /products
      const createdItem = await api.createProduct(productData);

      // Cập nhật State cục bộ: thêm sản phẩm mới vào danh sách hiện tại
      setProducts((prev) => [...prev, createdItem]);

      // Hiển thị Modal thông báo thành công theo đề bài
      setSuccessModal({
        isOpen: true,
        message: 'Product added successfully.',
      });

      return true;
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi thêm sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Thao tác CẬP NHẬT SẢN PHẨM (Update)
   * Gửi PATCH request lên JSON Server và đồng bộ lại danh sách
   * 
   * @param {string|number} id - ID sản phẩm cần cập nhật
   * @param {Object} productData - Dữ liệu mới đã chỉnh sửa
   * @returns {Promise<boolean>} Trả về true nếu thành công
   */
  const handleUpdateProduct = async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      // Gọi API PATCH /products/:id
      const updatedItem = await api.updateProduct(id, productData);

      // Cập nhật State: tìm sản phẩm có ID khớp và ghi đè dữ liệu mới
      setProducts((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? updatedItem : item))
      );

      // Hiển thị Modal thông báo cập nhật thành công
      setSuccessModal({
        isOpen: true,
        message: 'Product updated successfully.',
      });

      return true;
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mở modal xác nhận trước khi xóa sản phẩm
   * @param {Object} product - Sản phẩm người dùng muốn xóa
   */
  const openDeleteModal = (product) => {
    setDeleteModal({
      isOpen: true,
      product,
    });
  };

  /**
   * Đóng modal xác nhận xóa
   */
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      product: null,
    });
  };

  /**
   * Thao tác XÓA SẢN PHẨM (Delete)
   * Gửi DELETE request lên JSON Server và loại bỏ khỏi state products
   */
  const confirmDeleteProduct = async () => {
    if (!deleteModal.product) return;

    const productId = deleteModal.product.id;
    try {
      setLoading(true);
      setError(null);
      // Gọi API DELETE /products/:id
      await api.deleteProduct(productId);

      // Loại bỏ sản phẩm khỏi state
      setProducts((prev) => prev.filter((item) => String(item.id) !== String(productId)));

      // Đóng modal xác nhận
      closeDeleteModal();

      // Hiển thị modal thông báo xóa thành công theo yêu cầu đề bài
      setSuccessModal({
        isOpen: true,
        message: 'Product deleted successfully.',
      });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đóng modal thông báo thành công và chuyển về màn hình danh sách
   */
  const closeSuccessModal = () => {
    setSuccessModal({
      isOpen: false,
      message: '',
    });
    // Trở về trang danh sách sản phẩm
    navigateTo('list');
  };

  // ----------------------------------------------------------------------------
  // F. ĐÓNG GÓI VALUE TRẢ VỀ CHO CONTEXT
  // ----------------------------------------------------------------------------
  const contextValue = {
    // State dữ liệu
    products,
    categories,
    filteredProducts,
    loading,
    error,
    searchTerm,
    selectedCategory,
    isFiltering,
    currentView,
    selectedProductId,
    deleteModal,
    successModal,

    // Actions & Handlers
    loadProducts,
    navigateTo,
    handleSearchChange,
    clearSearch,
    handleCategoryChange,
    handleCreateProduct,
    handleUpdateProduct,
    openDeleteModal,
    closeDeleteModal,
    confirmDeleteProduct,
    closeSuccessModal,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

/**
 * Custom Hook: useProductContext
 * Cho phép các component con truy xuất dữ liệu dễ dàng và an toàn
 */
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext phải được sử dụng bên trong một <ProductProvider>');
  }
  return context;
};
