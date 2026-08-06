// frontend/src/hooks/useProducts.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth'; // or '../context/AuthContext'
import api from '../api';

/**
 * Custom hook to manage products with API integration.
 *
 * @param {Object} options - Default query parameters (e.g., limit, page, category).
 * @returns {Object} { products, loading, error, total, totalPages, 
 *                      fetchProducts, createProduct, createProductWithFiles,
 *                      updateProduct, updateProductWithFiles, deleteProduct,
 *                      clearError, pagination, setFilters }
 */
export const useProducts = (defaultParams = {}) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    ...defaultParams,
  });

  // ---------- Fetch products with current params ----------
  const fetchProducts = useCallback(async (newParams = {}) => {
    // Merge new params with existing ones
    const mergedParams = { ...params, ...newParams };
    setParams(mergedParams);

    setLoading(true);
    setError(null);

    try {
      // Clean up params: remove empty or "all" values
      const cleanParams = Object.fromEntries(
        Object.entries(mergedParams).filter(
          ([key, value]) => value !== '' && value !== null && value !== undefined && value !== 'all'
        )
      );

      const data = await api.products.getAll(cleanParams);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  // ---------- Create product (JSON) ----------
  const createProduct = useCallback(async (productData) => {
    if (!token) {
      setError('You must be logged in to create a product.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.create(productData, token);
      // Refresh products after creation
      await fetchProducts({ page: 1 });
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create product');
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  // ---------- Create product with file uploads ----------
  const createProductWithFiles = useCallback(async (formData) => {
    if (!token) {
      setError('You must be logged in to create a product.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.createWithFiles(formData, token);
      await fetchProducts({ page: 1 });
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create product with files');
      console.error('Error creating product with files:', err);
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  // ---------- Update product (JSON) ----------
  const updateProduct = useCallback(async (id, productData) => {
    if (!token) {
      setError('You must be logged in to update a product.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.update(id, productData, token);
      // Refresh products (or update locally)
      await fetchProducts();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update product');
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  // ---------- Update product with file uploads ----------
  const updateProductWithFiles = useCallback(async (id, formData) => {
    if (!token) {
      setError('You must be logged in to update a product.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.updateWithFiles(id, formData, token);
      await fetchProducts();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update product with files');
      console.error('Error updating product with files:', err);
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  // ---------- Delete product ----------
  const deleteProduct = useCallback(async (id) => {
    if (!token) {
      setError('You must be logged in to delete a product.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.products.delete(id, token);
      // Remove from local state immediately (optimistic update)
      setProducts(prev => prev.filter(p => p._id !== id));
      // Re-fetch to get updated total
      await fetchProducts();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  }, [token, fetchProducts]);

  // ---------- Clear error ----------
  const clearError = useCallback(() => setError(null), []);

  // ---------- Set filters (search, category, location, etc.) ----------
  const setFilters = useCallback((newFilters) => {
    setParams(prev => ({ ...prev, ...newFilters, page: 1 })); // reset to page 1
  }, []);

  // ---------- Pagination helpers ----------
  const goToPage = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    setParams(prev => ({ ...prev, page }));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (params.page < totalPages) {
      goToPage(params.page + 1);
    }
  }, [params.page, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (params.page > 1) {
      goToPage(params.page - 1);
    }
  }, [params.page, goToPage]);

  // ---------- Auto-fetch when params change ----------
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.category, params.location, params.search, params.sellerId]);

  // Also re-fetch if token changes (e.g., login/logout)
  useEffect(() => {
    if (token) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ---------- Memoized return value ----------
  const pagination = useMemo(() => ({
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
  }), [params.page, params.limit, total, totalPages, goToPage, nextPage, prevPage]);

  return {
    products,
    loading,
    error,
    total,
    totalPages,
    params,
    fetchProducts,
    createProduct,
    createProductWithFiles,
    updateProduct,
    updateProductWithFiles,
    deleteProduct,
    clearError,
    setFilters,
    pagination,
    // Direct access to params setters if needed
    setParams,
  };
};