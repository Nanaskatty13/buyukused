// frontend/src/services/sellerService.js
import { API_URL } from "./api";
import { getToken } from "../utils/storage";

// ─── Helper: build query string ──────────────────────────────
const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

// ─── Helper: handle response ──────────────────────────────────
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      errorMessage = data.message || data.error || errorMessage;
    } catch {
      // ignore
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

// ─── Helper: JSON request with token ──────────────────────────
const request = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// ─── Helper: FormData request with token ──────────────────────
const requestWithFiles = async (url, formData, options = {}) => {
  const token = getToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${url}`, {
    method: options.method || "POST",
    headers,
    body: formData,
  });

  return handleResponse(response);
};

// ================================================================
// SELLER SERVICE FUNCTIONS
// ================================================================

/**
 * Register as a seller (become a seller)
 */
export const registerSeller = async (data) => {
  return request("/sellers/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Get own seller profile
 */
export const getSellerProfile = async () => {
  return request("/sellers/profile");
};

/**
 * Update own seller profile
 */
export const updateSellerProfile = async (data) => {
  return request("/sellers/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ================================================================
// DASHBOARD & ANALYTICS
// ================================================================

/**
 * Get seller dashboard stats (with optional period filter)
 */
export const getSellerDashboard = async (period = "all") => {
  return request(`/sellers/dashboard?period=${period}`);
};

/**
 * Get seller earnings (with optional period filter)
 */
export const getSellerEarnings = async (period = "all") => {
  return request(`/sellers/earnings?period=${period}`);
};

/**
 * Get product analytics (views, clicks, etc.)
 */
export const getSellerAnalytics = async (period = "today") => {
  return request(`/sellers/analytics?period=${period}`);
};

// ================================================================
// PRODUCT MANAGEMENT
// ================================================================

/**
 * Get seller's own products (with pagination, sorting, filtering)
 */
export const getMyProducts = async (params = {}) => {
  const { page = 1, limit = 20, sort = "-createdAt", status } = params;
  let query = `page=${page}&limit=${limit}&sort=${encodeURIComponent(sort)}`;
  if (status) query += `&status=${status}`;
  return request(`/sellers/products?${query}`);
};

/**
 * Create a new product (seller version)
 * Accepts FormData for files (images)
 */
export const createProductSeller = async (formData) => {
  return requestWithFiles("/sellers/products", formData, { method: "POST" });
};

/**
 * Update an existing product (seller version)
 * Accepts FormData for files (images)
 */
export const updateProductSeller = async (productId, formData) => {
  return requestWithFiles(`/sellers/products/${productId}`, formData, {
    method: "PUT",
  });
};

/**
 * Delete a product
 */
export const deleteProductSeller = async (productId) => {
  return request(`/sellers/products/${productId}`, {
    method: "DELETE",
  });
};

// ================================================================
// ORDER MANAGEMENT
// ================================================================

/**
 * Get orders containing seller's items (with pagination & status filter)
 */
export const getSellerOrders = async (params = {}) => {
  const { page = 1, limit = 20, status } = params;
  let query = `page=${page}&limit=${limit}`;
  if (status) query += `&status=${status}`;
  return request(`/sellers/orders?${query}`);
};

/**
 * Get a specific order by ID (must contain seller's items)
 */
export const getSellerOrderById = async (orderId) => {
  return request(`/sellers/orders/${orderId}`);
};

/**
 * Update order status (processing, shipped, delivered, cancelled)
 */
export const updateSellerOrderStatus = async (orderId, status) => {
  return request(`/sellers/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

// ================================================================
// PUBLIC SELLER ROUTES (No authentication required)
// ================================================================

/**
 * Get public seller profile (for SellerPage)
 */
export const getPublicSellerProfile = async (sellerId) => {
  return request(`/sellers/${sellerId}`);
};

/**
 * Get public products for a seller (with pagination)
 */
export const getPublicSellerProducts = async (sellerId, params = {}) => {
  const { page = 1, limit = 20, sort = "-createdAt" } = params;
  const query = `page=${page}&limit=${limit}&sort=${encodeURIComponent(sort)}`;
  return request(`/sellers/${sellerId}/products?${query}`);
};

// ================================================================
// DEFAULT EXPORT
// ================================================================

const sellerService = {
  registerSeller,
  getSellerProfile,
  updateSellerProfile,

  getSellerDashboard,
  getSellerEarnings,
  getSellerAnalytics,

  getMyProducts,
  createProductSeller,
  updateProductSeller,
  deleteProductSeller,

  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,

  getPublicSellerProfile,
  getPublicSellerProducts,
};

export default sellerService;