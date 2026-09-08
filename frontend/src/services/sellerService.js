// ================================================================
// frontend/src/services/sellerService.js
// BuyUKUsed - Seller API Service
// ================================================================

import { API_URL } from "./api";
import { getToken } from "../utils/storage";

// ================================================================
// API BASE URL
// ================================================================

const getBaseUrl = () => {
  const base = String(API_URL || "").trim();

  if (!base) {
    return "http://localhost:5000";
  }

  return base.replace(/\/+$/, "");
};

// ================================================================
// NORMALIZE SELLER ID
//
// Supports:
//
// sellerId
// seller._id
// seller.id
// seller.userId
// populated seller objects
// MongoDB ObjectId-like values
// ================================================================

export const normalizeSellerId = (seller) => {
  if (!seller) {
    return "";
  }

  if (
    typeof seller === "string" ||
    typeof seller === "number"
  ) {
    return String(seller).trim();
  }

  if (typeof seller === "object") {
    const possibleId =
      seller._id ??
      seller.id ??
      seller.sellerId ??
      seller.userId ??
      seller.user?._id ??
      seller.user?.id ??
      "";

    if (
      possibleId &&
      typeof possibleId === "object" &&
      possibleId.toString
    ) {
      return String(possibleId.toString()).trim();
    }

    return String(possibleId || "").trim();
  }

  return "";
};

// ================================================================
// BUILD QUERY STRING
// ================================================================

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();

  return query ? `?${query}` : "";
};

// ================================================================
// HANDLE RESPONSE
// ================================================================

const handleResponse = async (response) => {
  let data = {};

  if (response.status !== 204) {
    const contentType =
      response.headers.get("content-type") || "";

    try {
      if (
        contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        data = await response.json();
      } else {
        const text = await response.text();

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
        data?.msg ||
        `HTTP ${response.status}`
    );

    error.status = response.status;
    error.data = data;
    error.url = response.url;

    throw error;
  }

  return data;
};

// ================================================================
// CREATE HEADERS
// ================================================================

const createHeaders = ({
  includeToken = true,
  includeJsonContentType = true,
  customHeaders = {},
} = {}) => {
  const token = getToken();

  const headers = {
    Accept: "application/json",
  };

  if (includeJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (includeToken && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return {
    ...headers,
    ...customHeaders,
  };
};

// ================================================================
// STANDARD REQUEST
// ================================================================

const request = async (
  url,
  options = {}
) => {
  const baseUrl = getBaseUrl();

  const {
    includeToken = true,
    credentials = "include",
    ...fetchOptions
  } = options;

  const response = await fetch(
    `${baseUrl}${url}`,
    {
      ...fetchOptions,

      credentials,

      headers: createHeaders({
        includeToken,
        includeJsonContentType:
          fetchOptions.method !== "GET" &&
          fetchOptions.method !== "HEAD"
            ? true
            : false,
        customHeaders:
          fetchOptions.headers || {},
      }),
    }
  );

  return handleResponse(response);
};

// ================================================================
// FORMDATA REQUEST
//
// IMPORTANT:
// Do NOT manually set Content-Type.
// Browser must generate multipart/form-data boundary.
// ================================================================

const requestWithFiles = async (
  url,
  formData,
  options = {}
) => {
  const baseUrl = getBaseUrl();

  const token = getToken();

  const {
    method = "POST",
    credentials = "include",
    headers: customHeaders = {},
  } = options;

  const headers = {
    Accept: "application/json",
    ...customHeaders,
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${baseUrl}${url}`,
    {
      method,
      credentials,
      headers,
      body: formData,
    }
  );

  return handleResponse(response);
};

// ================================================================
// PUBLIC REQUEST
//
// No authentication is required.
//
// This is used for seller pages viewed by:
//
// - logged-in users
// - logged-out users
// - mobile visitors
// - search-engine visitors
// ================================================================

const publicRequest = async (
  url,
  options = {}
) => {
  const baseUrl = getBaseUrl();

  const {
    credentials = "omit",
    ...fetchOptions
  } = options;

  const response = await fetch(
    `${baseUrl}${url}`,
    {
      ...fetchOptions,

      credentials,

      headers: {
        Accept: "application/json",
        ...(fetchOptions.headers || {}),
      },
    }
  );

  return handleResponse(response);
};

// ================================================================
// NORMALIZE API DATA
//
// Allows the frontend to safely work with:
//
// { data: ... }
// { seller: ... }
// { profile: ... }
// { products: ... }
// { items: ... }
// { results: ... }
// or direct arrays/objects.
// ================================================================

const unwrapData = (response) => {
  if (!response) {
    return response;
  }

  if (
    response.data !== undefined &&
    response.data !== null
  ) {
    return response.data;
  }

  return response;
};

// ================================================================
// NORMALIZE SELLER PROFILE RESPONSE
// ================================================================

const normalizeSellerProfileResponse = (
  response
) => {
  const data = unwrapData(response);

  if (!data) {
    return {
      ...response,
      seller: null,
    };
  }

  if (data.seller) {
    return {
      ...response,
      ...data,
      seller: data.seller,
    };
  }

  if (data.profile) {
    return {
      ...response,
      ...data,
      seller: data.profile,
    };
  }

  if (data.user) {
    return {
      ...response,
      ...data,
      seller: data.user,
    };
  }

  return {
    ...response,
    ...data,
    seller: data,
  };
};

// ================================================================
// NORMALIZE PRODUCT RESPONSE
// ================================================================

const normalizeProductsResponse = (
  response
) => {
  const data = unwrapData(response);

  if (Array.isArray(data)) {
    return {
      ...response,
      products: data,
      items: data,
    };
  }

  if (!data || typeof data !== "object") {
    return {
      ...response,
      products: [],
      items: [],
    };
  }

  const products =
    Array.isArray(data.products)
      ? data.products
      : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.results)
      ? data.results
      : Array.isArray(data.data)
      ? data.data
      : [];

  return {
    ...response,
    ...data,
    products,
    items: products,
  };
};

// ================================================================
// SELLER SERVICE FUNCTIONS
// ================================================================

// ================================================================
// 1. REGISTER SELLER
// ================================================================

export const registerSeller = async (
  data
) => {
  if (!data || typeof data !== "object") {
    throw new Error(
      "Seller registration data is required"
    );
  }

  return request(
    "/sellers/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
};

// ================================================================
// 2. GET OWN SELLER PROFILE
// ================================================================

export const getSellerProfile = async () => {
  const response = await request(
    "/sellers/profile"
  );

  return normalizeSellerProfileResponse(
    response
  );
};

// ================================================================
// 3. UPDATE OWN SELLER PROFILE
// ================================================================

export const updateSellerProfile = async (
  data
) => {
  if (!data || typeof data !== "object") {
    throw new Error(
      "Seller profile data is required"
    );
  }

  const response = await request(
    "/sellers/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  return normalizeSellerProfileResponse(
    response
  );
};

// ================================================================
// DASHBOARD & ANALYTICS
// ================================================================

// ================================================================
// 4. SELLER DASHBOARD
// ================================================================

export const getSellerDashboard = async (
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

export const getSellerEarnings = async (
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

export const getSellerAnalytics = async (
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

export const getMyProducts = async (
  params = {}
) => {
  const {
    page = 1,
    limit = 20,
    sort = "-createdAt",
    status,
  } = params;

  const query = buildQuery({
    page,
    limit,
    sort,
    status,
  });

  const response = await request(
    `/sellers/products${query}`
  );

  return normalizeProductsResponse(
    response
  );
};

// ================================================================
// 8. CREATE PRODUCT
// ================================================================

export const createProductSeller = async (
  formData
) => {
  if (!(formData instanceof FormData)) {
    throw new Error(
      "FormData is required to create a product"
    );
  }

  const response =
    await requestWithFiles(
      "/sellers/products",
      formData,
      {
        method: "POST",
      }
    );

  return response;
};

// ================================================================
// 9. UPDATE PRODUCT
// ================================================================

export const updateProductSeller = async (
  productId,
  formData
) => {
  if (!productId) {
    throw new Error(
      "Product ID is required"
    );
  }

  if (!(formData instanceof FormData)) {
    throw new Error(
      "FormData is required to update a product"
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

export const deleteProductSeller = async (
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

export const getSellerOrders = async (
  params = {}
) => {
  const {
    page = 1,
    limit = 20,
    status,
  } = params;

  const query = buildQuery({
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

export const getSellerOrderById = async (
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
        body: JSON.stringify({
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
//
// Backend:
//
// GET /sellers/:sellerId
//
// This MUST remain public.
// Do not require the visitor to be logged in.
// ================================================================

export const getPublicSellerProfile =
  async (sellerId) => {
    const normalizedId =
      normalizeSellerId(sellerId);

    if (!normalizedId) {
      throw new Error(
        "Valid Seller ID is required"
      );
    }

    const response =
      await publicRequest(
        `/sellers/${encodeURIComponent(
          normalizedId
        )}`
      );

    return normalizeSellerProfileResponse(
      response
    );
  };

// ================================================================
// 15. GET PUBLIC SELLER PRODUCTS
//
// Backend:
//
// GET /sellers/:sellerId/products
//
// IMPORTANT:
// Do NOT use:
//
// /products?sellerId=...
//
// and do NOT require authentication.
// ================================================================

export const getPublicSellerProducts =
  async (
    sellerId,
    params = {}
  ) => {
    const normalizedId =
      normalizeSellerId(sellerId);

    if (!normalizedId) {
      throw new Error(
        "Valid Seller ID is required"
      );
    }

    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = params;

    const query = buildQuery({
      page,
      limit,
      sort,
    });

    const response =
      await publicRequest(
        `/sellers/${encodeURIComponent(
          normalizedId
        )}/products${query}`
      );

    return normalizeProductsResponse(
      response
    );
  };

// ================================================================
// 16. GET COMPLETE PUBLIC SELLER PAGE DATA
//
// Convenience helper.
//
// Fetches:
//
// seller profile
// +
// seller products
//
// Useful for seller page components.
// ================================================================

export const getPublicSellerPage =
  async (
    sellerId,
    params = {}
  ) => {
    const normalizedId =
      normalizeSellerId(sellerId);

    if (!normalizedId) {
      throw new Error(
        "Valid Seller ID is required"
      );
    }

    const [
      profileResponse,
      productsResponse,
    ] = await Promise.all([
      getPublicSellerProfile(
        normalizedId
      ),
      getPublicSellerProducts(
        normalizedId,
        params
      ),
    ]);

    return {
      sellerId: normalizedId,

      seller:
        profileResponse?.seller ||
        profileResponse?.profile ||
        profileResponse?.user ||
        null,

      profile:
        profileResponse,

      products:
        productsResponse?.products ||
        productsResponse?.items ||
        [],

      productsResponse,
    };
  };

// ================================================================
// DEFAULT EXPORT
// ================================================================

const sellerService = {
  normalizeSellerId,

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
  getPublicSellerPage,
};

export default sellerService;