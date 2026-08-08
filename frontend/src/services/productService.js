// frontend/src/services/productService.js

// Import the actual fetch-based API functions (not an Axios instance)
import {
  // Public product endpoints
  getProducts as apiGetProducts,
  getProduct as apiGetProduct,

  // Seller endpoints (with files)
  createProductWithFiles,      // ✅ FormData version – NO Content‑Type header
  updateProduct as apiUpdateProduct,      // JSON version (if no files)
  deleteProduct as apiDeleteProduct,

  // You'll need to add updateProductWithFiles to api.js later
  // For now, we'll handle it conditionally.
} from './api';

// If you've added updateProductWithFiles to api.js, import it:
// import { updateProductWithFiles } from './api';

/**
 * Product Service - Wrapper around fetch-based API functions
 *
 * CRITICAL FOR MOBILE:
 * - createProduct() uses createProductWithFiles() which sends FormData
 *   WITHOUT the Content-Type header (perfect for mobile uploads).
 * - updateProduct() will use FormData if passed, else JSON.
 */
export const productService = {
  // ========================================
  // PUBLIC ENDPOINTS (No auth required)
  // ========================================

  /**
   * Get all products with pagination, filtering, and sorting
   */
  getProducts: async (params = {}) => {
    // apiGetProducts already accepts a params object and builds the query string
    return await apiGetProducts(params);
  },

  /**
   * Get a single product by ID
   */
  getProductById: async (id) => {
    return await apiGetProduct(id);
  },

  /**
   * Get products by category
   * (You'll need to add getProductsByCategory to api.js if not present)
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    // This endpoint isn't defined in api.js yet; add it if needed.
    // For now, we'll construct the URL manually using the same fetch pattern.
    const { API_URL } = await import('./api');
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/categories/${categoryId}/products${query ? `?${query}` : ''}`;
    const res = await fetch(url);
    // We need to re-implement handleResponse; ideally add to api.js.
    // Better: add getProductsByCategory to api.js and import it.
    // For now, we'll throw a warning.
    throw new Error(
      'getProductsByCategory is not yet implemented in api.js. ' +
      'Please add it or use a different method.'
    );
  },

  /**
   * Search products globally
   */
  searchProducts: async (query, params = {}) => {
    // Similarly, add searchProducts to api.js or use the existing getProducts with search param.
    // Since apiGetProducts already accepts a 'search' param, we can reuse it:
    return await apiGetProducts({ q: query, ...params });
  },

  /**
   * Get related products (based on category)
   */
  getRelatedProducts: async (productId, limit = 4) => {
    // You'll need to add getRelatedProducts to api.js.
    // For now, we'll fetch from the product endpoint and filter? Not ideal.
    // Better: add the endpoint.
    throw new Error(
      'getRelatedProducts is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  // ========================================
  // SELLER ENDPOINTS (Requires Seller/Admin auth)
  // ========================================

  /**
   * Create a new product (SELLER ONLY)
   * @param {FormData} formData - Contains text fields + 'images' files
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Created product object
   *
   * ✅ Uses createProductWithFiles – NO Content-Type header!
   */
  createProduct: async (formData, token) => {
    return await createProductWithFiles(formData, token);
  },

  /**
   * Get all products for the currently logged-in seller
   * (You'll need to add getSellerProducts to api.js)
   */
  getSellerProducts: async (token, params = {}) => {
    throw new Error(
      'getSellerProducts is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  /**
   * Update an existing product (SELLER ONLY)
   * @param {string} id - Product ID
   * @param {FormData|Object} formData - Either FormData (with files) or plain object (JSON)
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Updated product object
   *
   * ✅ If FormData, it uses updateProductWithFiles (once you add it to api.js)
   * ❌ If plain object, it uses apiUpdateProduct (JSON)
   */
  updateProduct: async (id, formData, token) => {
    // Check if we have a FormData instance
    if (formData instanceof FormData) {
      // You need to add updateProductWithFiles to api.js
      // For now, we'll try to import it dynamically or throw a helpful error.
      // If you've added it, uncomment the import and use it.
      // return await updateProductWithFiles(id, formData, token);

      throw new Error(
        'updateProduct with FormData requires updateProductWithFiles in api.js. ' +
        'Please add it using the same pattern as createProductWithFiles.'
      );
    } else {
      // JSON update (no new files)
      return await apiUpdateProduct(id, formData, token);
    }
  },

  /**
   * Delete a product (SELLER ONLY)
   */
  deleteProduct: async (id, token) => {
    return await apiDeleteProduct(id, token);
  },

  /**
   * Toggle product active/inactive status (SELLER ONLY)
   * (You'll need to add updateProductStatus to api.js)
   */
  updateProductStatus: async (id, isActive, token) => {
    throw new Error(
      'updateProductStatus is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  /**
   * Upload additional images to an existing product
   * (You'll need to add uploadProductImages to api.js)
   */
  uploadProductImages: async (id, formData, token) => {
    throw new Error(
      'uploadProductImages is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  /**
   * Remove a specific image from a product (by public_id)
   * (You'll need to add removeProductImage to api.js)
   */
  removeProductImage: async (productId, publicId, token) => {
    throw new Error(
      'removeProductImage is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  // ========================================
  // ADMIN ENDPOINTS (Requires Admin auth)
  // ========================================

  /**
   * Get all products across all sellers (ADMIN ONLY)
   * (You'll need to add getAdminProducts to api.js)
   */
  getAdminProducts: async (token, params = {}) => {
    throw new Error(
      'getAdminProducts is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  /**
   * Force delete any product (ADMIN ONLY)
   * (You'll need to add adminDeleteProduct to api.js)
   */
  adminDeleteProduct: async (id, token) => {
    throw new Error(
      'adminDeleteProduct is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  /**
   * Bulk update product statuses (ADMIN ONLY)
   * (You'll need to add bulkUpdateStatus to api.js)
   */
  bulkUpdateStatus: async (productIds, isActive, token) => {
    throw new Error(
      'bulkUpdateStatus is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  // ========================================
  // REVIEWS (Nested under products)
  // ========================================

  /**
   * Get all reviews for a product
   * (You'll need to add getProductReviews to api.js)
   */
  getProductReviews: async (productId, params = {}) => {
    throw new Error(
      'getProductReviews is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  /**
   * Add a review to a product (AUTH REQUIRED)
   * (You'll need to add addProductReview to api.js)
   */
  addProductReview: async (productId, data, token) => {
    throw new Error(
      'addProductReview is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },

  /**
   * Delete a review (Review owner or Admin)
   * (You'll need to add deleteProductReview to api.js)
   */
  deleteProductReview: async (productId, reviewId, token) => {
    throw new Error(
      'deleteProductReview is not yet implemented in api.js. ' +
      'Please add it.'
    );
  },
};

// Default export for convenience
export default productService;