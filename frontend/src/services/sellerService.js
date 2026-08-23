// frontend/src/services/sellerService.js

import { API_URL } from "./api";
import { getToken } from "../utils/storage";

// ============================================================
// BUILD QUERY STRING
// ============================================================

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      searchParams.set(
        key,
        String(value)
      );
    }
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
};

// ============================================================
// HANDLE RESPONSE
// ============================================================

const handleResponse = async (
  response
) => {
  if (!response.ok) {
    let errorMessage =
      `HTTP ${response.status}`;

    try {
      const data =
        await response.json();

      errorMessage =
        data.message ||
        data.error ||
        errorMessage;
    } catch {
      // Ignore invalid JSON response
    }

    const error =
      new Error(errorMessage);

    error.status =
      response.status;

    throw error;
  }

  return response.json();
};

// ============================================================
// AUTHENTICATED JSON REQUEST
// ============================================================

const request = async (
  url,
  options = {}
) => {
  const token = getToken();

  const headers = {
    "Content-Type":
      "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response =
    await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers,
      }
    );

  return handleResponse(
    response
  );
};

// ============================================================
// PUBLIC JSON REQUEST
// ============================================================
//
// IMPORTANT:
// Public seller pages should work without requiring
// the visitor to be logged in.
//
// We intentionally do NOT require a token here.
//
// If a token exists, we may still send it so the backend
// can optionally provide authenticated features, but the
// request itself does not depend on authentication.
// ============================================================

const publicRequest = async (
  url,
  options = {}
) => {
  const token = getToken();

  const headers = {
    "Content-Type":
      "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response =
    await fetch(
      `${API_URL}${url}`,
      {
        ...options,
        headers,
      }
    );

  return handleResponse(
    response
  );
};

// ============================================================
// FORM DATA REQUEST
// ============================================================

const requestWithFiles = async (
  url,
  formData,
  options = {}
) => {
  const token = getToken();

  const headers = {
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response =
    await fetch(
      `${API_URL}${url}`,
      {
        method:
          options.method ||
          "POST",

        headers,

        body: formData,
      }
    );

  return handleResponse(
    response
  );
};

// ============================================================
// SELLER SERVICE FUNCTIONS
// ============================================================

// ============================================================
// REGISTER SELLER
// ============================================================

/**
 * Register as a seller.
 */
export const registerSeller =
  async (data) => {
    return request(
      "/sellers/register",
      {
        method: "POST",
        body:
          JSON.stringify(
            data
          ),
      }
    );
  };

// ============================================================
// OWN SELLER PROFILE
// ============================================================

/**
 * Get the currently authenticated seller profile.
 */
export const getSellerProfile =
  async () => {
    return request(
      "/sellers/profile"
    );
  };

/**
 * Update the currently authenticated seller profile.
 */
export const updateSellerProfile =
  async (data) => {
    return request(
      "/sellers/profile",
      {
        method: "PUT",
        body:
          JSON.stringify(
            data
          ),
      }
    );
  };

// ============================================================
// DASHBOARD & ANALYTICS
// ============================================================

/**
 * Get seller dashboard statistics.
 */
export const getSellerDashboard =
  async (
    period = "all"
  ) => {
    const query =
      buildQuery({
        period,
      });

    return request(
      `/sellers/dashboard${query}`
    );
  };

/**
 * Get seller earnings.
 */
export const getSellerEarnings =
  async (
    period = "all"
  ) => {
    const query =
      buildQuery({
        period,
      });

    return request(
      `/sellers/earnings${query}`
    );
  };

/**
 * Get seller analytics.
 */
export const getSellerAnalytics =
  async (
    period = "today"
  ) => {
    const query =
      buildQuery({
        period,
      });

    return request(
      `/sellers/analytics${query}`
    );
  };

// ============================================================
// PRODUCT MANAGEMENT
// ============================================================

/**
 * Get the authenticated seller's own products.
 */
export const getMyProducts =
  async (
    params = {}
  ) => {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      status,
    } = params;

    const query =
      buildQuery({
        page,
        limit,
        sort,
        status,
      });

    return request(
      `/sellers/products${query}`
    );
  };

/**
 * Create a new seller product.
 *
 * Accepts FormData for images/videos.
 */
export const createProductSeller =
  async (formData) => {
    return requestWithFiles(
      "/sellers/products",
      formData,
      {
        method: "POST",
      }
    );
  };

/**
 * Update an existing seller product.
 *
 * Accepts FormData.
 */
export const updateProductSeller =
  async (
    productId,
    formData
  ) => {
    return requestWithFiles(
      `/sellers/products/${productId}`,
      formData,
      {
        method: "PUT",
      }
    );
  };

/**
 * Delete a seller product.
 */
export const deleteProductSeller =
  async (
    productId
  ) => {
    return request(
      `/sellers/products/${productId}`,
      {
        method: "DELETE",
      }
    );
  };

// ============================================================
// ORDER MANAGEMENT
// ============================================================

/**
 * Get orders containing the seller's items.
 */
export const getSellerOrders =
  async (
    params = {}
  ) => {
    const {
      page = 1,
      limit = 20,
      status,
    } = params;

    const query =
      buildQuery({
        page,
        limit,
        status,
      });

    return request(
      `/sellers/orders${query}`
    );
  };

/**
 * Get a specific seller order.
 */
export const getSellerOrderById =
  async (
    orderId
  ) => {
    return request(
      `/sellers/orders/${orderId}`
    );
  };

/**
 * Update seller order status.
 */
export const updateSellerOrderStatus =
  async (
    orderId,
    status
  ) => {
    return request(
      `/sellers/orders/${orderId}/status`,
      {
        method: "PUT",

        body:
          JSON.stringify({
            status,
          }),
      }
    );
  };

// ============================================================
// PUBLIC SELLER ROUTES
// ============================================================
//
// These endpoints are designed for:
// /seller/:sellerId
//
// Visitors should be able to view:
// - seller name
// - profile image
// - location
// - seller statistics
// - seller products
// - product descriptions
// - product specifications
//
// without being forced to authenticate.
// ============================================================

/**
 * Get a public seller profile.
 */
export const getPublicSellerProfile =
  async (
    sellerId
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required."
      );
    }

    return publicRequest(
      `/sellers/${encodeURIComponent(
        sellerId
      )}`
    );
  };

/**
 * Get public products belonging to a seller.
 */
export const getPublicSellerProducts =
  async (
    sellerId,
    params = {}
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required."
      );
    }

    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      status,
      category,
      search,
    } = params;

    const query =
      buildQuery({
        page,
        limit,
        sort,
        status,
        category,
        search,
      });

    return publicRequest(
      `/sellers/${encodeURIComponent(
        sellerId
      )}/products${query}`
    );
  };

// ============================================================
// DEFAULT EXPORT
// ============================================================

const sellerService = {
  // Seller registration
  registerSeller,

  // Own profile
  getSellerProfile,
  updateSellerProfile,

  // Dashboard
  getSellerDashboard,
  getSellerEarnings,
  getSellerAnalytics,

  // Product management
  getMyProducts,
  createProductSeller,
  updateProductSeller,
  deleteProductSeller,

  // Orders
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,

  // Public seller profile
  getPublicSellerProfile,
  getPublicSellerProducts,
};

export default sellerService;