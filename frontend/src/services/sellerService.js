// ================================================================
// frontend/src/services/sellerService.js
// BuyUKUsed - Seller API Service
// ================================================================

import {
  API_URL,
} from "./api";

import {
  getToken,
} from "../utils/storage";

// ================================================================
// HELPER: BUILD QUERY STRING
// ================================================================

const buildQuery = (
  params = {}
) => {
  const searchParams =
    new URLSearchParams();

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

// ================================================================
// HELPER: HANDLE RESPONSE
// ================================================================

const handleResponse = async (
  response
) => {
  let data = {};

  if (response.status !== 204) {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    try {
      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await response.json();
      } else {
        const text =
          await response.text();

        if (text) {
          data = {
            message: text,
          };
        }
      }
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.error ||
        `HTTP ${response.status}`
    );

    error.status =
      response.status;

    error.data = data;

    error.url =
      response.url;

    throw error;
  }

  return data;
};

// ================================================================
// HELPER: JSON REQUEST WITH TOKEN
// ================================================================

const request = async (
  url,
  options = {}
) => {
  const token =
    getToken();

  const headers = {
    "Content-Type":
      "application/json",

    Accept:
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

        credentials:
          "include",

        headers,
      }
    );

  return handleResponse(
    response
  );
};

// ================================================================
// HELPER: FORMDATA REQUEST WITH TOKEN
// ================================================================

const requestWithFiles =
  async (
    url,
    formData,
    options = {}
  ) => {
    const token =
      getToken();

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

          credentials:
            "include",

          headers,

          body: formData,
        }
      );

    return handleResponse(
      response
    );
  };

// ================================================================
// SELLER SERVICE FUNCTIONS
// ================================================================

// ================================================================
// 1. REGISTER SELLER
// ================================================================

export const registerSeller =
  async (data) => {
    return request(
      "/sellers/register",
      {
        method: "POST",

        body:
          JSON.stringify(data),
      }
    );
  };

// ================================================================
// 2. GET OWN SELLER PROFILE
// ================================================================

export const getSellerProfile =
  async () => {
    return request(
      "/sellers/profile"
    );
  };

// ================================================================
// 3. UPDATE OWN SELLER PROFILE
// ================================================================

export const updateSellerProfile =
  async (data) => {
    return request(
      "/sellers/profile",
      {
        method: "PUT",

        body:
          JSON.stringify(data),
      }
    );
  };

// ================================================================
// DASHBOARD & ANALYTICS
// ================================================================

// ================================================================
// 4. SELLER DASHBOARD
// ================================================================

export const getSellerDashboard =
  async (
    period = "all"
  ) => {
    return request(
      `/sellers/dashboard?period=${encodeURIComponent(
        period
      )}`
    );
  };

// ================================================================
// 5. SELLER EARNINGS
// ================================================================

export const getSellerEarnings =
  async (
    period = "all"
  ) => {
    return request(
      `/sellers/earnings?period=${encodeURIComponent(
        period
      )}`
    );
  };

// ================================================================
// 6. SELLER ANALYTICS
// ================================================================

export const getSellerAnalytics =
  async (
    period = "today"
  ) => {
    return request(
      `/sellers/analytics?period=${encodeURIComponent(
        period
      )}`
    );
  };

// ================================================================
// PRODUCT MANAGEMENT
// ================================================================

// ================================================================
// 7. GET MY PRODUCTS
// ================================================================

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

// ================================================================
// 8. CREATE PRODUCT
// ================================================================

export const createProductSeller =
  async (
    formData
  ) => {
    return requestWithFiles(
      "/sellers/products",
      formData,
      {
        method: "POST",
      }
    );
  };

// ================================================================
// 9. UPDATE PRODUCT
// ================================================================

export const updateProductSeller =
  async (
    productId,
    formData
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    return requestWithFiles(
      `/sellers/products/${encodeURIComponent(
        productId
      )}`,
      formData,
      {
        method: "PUT",
      }
    );
  };

// ================================================================
// 10. DELETE PRODUCT
// ================================================================

export const deleteProductSeller =
  async (
    productId
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    return request(
      `/sellers/products/${encodeURIComponent(
        productId
      )}`,
      {
        method: "DELETE",
      }
    );
  };

// ================================================================
// ORDER MANAGEMENT
// ================================================================

// ================================================================
// 11. GET SELLER ORDERS
// ================================================================

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

// ================================================================
// 12. GET SELLER ORDER BY ID
// ================================================================

export const getSellerOrderById =
  async (
    orderId
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    return request(
      `/sellers/orders/${encodeURIComponent(
        orderId
      )}`
    );
  };

// ================================================================
// 13. UPDATE SELLER ORDER STATUS
// ================================================================

export const updateSellerOrderStatus =
  async (
    orderId,
    status
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    if (!status) {
      throw new Error(
        "Order status is required"
      );
    }

    return request(
      `/sellers/orders/${encodeURIComponent(
        orderId
      )}/status`,
      {
        method: "PUT",

        body:
          JSON.stringify({
            status,
          }),
      }
    );
  };

// ================================================================
// PUBLIC SELLER ROUTES
// ================================================================

// ================================================================
// 14. GET PUBLIC SELLER PROFILE
// ================================================================

export const getPublicSellerProfile =
  async (
    sellerId
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return request(
      `/sellers/${encodeURIComponent(
        sellerId
      )}`
    );
  };

// ================================================================
// 15. GET PUBLIC SELLER PRODUCTS
//
// IMPORTANT:
// Backend route:
// GET /sellers/:sellerId/products
//
// Do NOT use:
// /api/products?sellerId=...
// ================================================================

export const getPublicSellerProducts =
  async (
    sellerId,
    params = {}
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = params;

    const query =
      buildQuery({
        page,
        limit,
        sort,
      });

    return request(
      `/sellers/${encodeURIComponent(
        sellerId
      )}/products${query}`
    );
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