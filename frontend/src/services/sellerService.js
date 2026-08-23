// ============================================================
// frontend/src/services/sellerService.js
// BuyUKUsed Seller Service
// ============================================================

import { API_URL } from "./api";
import { getToken } from "../utils/storage";

// ============================================================
// BUILD QUERY STRING
// ============================================================

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

// ============================================================
// HANDLE RESPONSE
// ============================================================

const handleResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      data?.error ||
      `HTTP ${response.status}`;

    const error = new Error(errorMessage);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

// ============================================================
// AUTHENTICATED JSON REQUEST
// ============================================================

const request = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// ============================================================
// PUBLIC JSON REQUEST
// ============================================================

const publicRequest = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
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
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  // IMPORTANT:
  // Do NOT manually set Content-Type for FormData.
  // Browser must generate the multipart boundary.
  delete headers["Content-Type"];

  const response = await fetch(`${API_URL}${url}`, {
    method: options.method || "POST",
    headers,
    body: formData,
  });

  return handleResponse(response);
};

// ============================================================
// SELLER REGISTRATION
// ============================================================

export const registerSeller = async (data) => {
  return request("/sellers/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// ============================================================
// PRIVATE SELLER PROFILE
// ============================================================

export const getSellerProfile = async () => {
  return request("/sellers/profile");
};

export const updateSellerProfile = async (data) => {
  return request("/sellers/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ============================================================
// DASHBOARD
// ============================================================

export const getSellerDashboard = async (
  period = "all"
) => {
  const query = buildQuery({
    period,
  });

  return request(`/sellers/dashboard${query}`);
};

// ============================================================
// ANALYTICS
// ============================================================

export const getSellerAnalytics = async (
  period = "today"
) => {
  const query = buildQuery({
    period,
  });

  return request(`/sellers/analytics${query}`);
};

// ============================================================
// EARNINGS
// ============================================================

export const getSellerEarnings = async (
  period = "all"
) => {
  const query = buildQuery({
    period,
  });

  return request(`/sellers/earnings${query}`);
};

// ============================================================
// SELLER PRODUCTS
// ============================================================

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

  return request(`/sellers/products${query}`);
};

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProductSeller = async (
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

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProductSeller = async (
  productId,
  formData
) => {
  if (!productId) {
    throw new Error("Product ID is required.");
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

// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProductSeller = async (
  productId
) => {
  if (!productId) {
    throw new Error("Product ID is required.");
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

// ============================================================
// SELLER ORDERS
// ============================================================

export const getSellerOrders = async (
  params = {}
) => {
  const {
    page = 1,
    limit = 20,
    status,
    sort = "-createdAt",
  } = params;

  const query = buildQuery({
    page,
    limit,
    status,
    sort,
  });

  return request(`/sellers/orders${query}`);
};

// ============================================================
// SINGLE SELLER ORDER
// ============================================================

export const getSellerOrderById = async (
  orderId
) => {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  return request(
    `/sellers/orders/${encodeURIComponent(
      orderId
    )}`
  );
};

// ============================================================
// UPDATE SELLER ORDER STATUS
// ============================================================

export const updateSellerOrderStatus = async (
  orderId,
  status
) => {
  if (!orderId) {
    throw new Error("Order ID is required.");
  }

  if (!status) {
    throw new Error("Order status is required.");
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

// ============================================================
// PUBLIC SELLER PROFILE
// ============================================================

export const getPublicSellerProfile = async (
  sellerId
) => {
  if (!sellerId) {
    throw new Error("Seller ID is required.");
  }

  return publicRequest(
    `/sellers/${encodeURIComponent(
      sellerId
    )}`
  );
};

// ============================================================
// PUBLIC SELLER PRODUCTS
// ============================================================

export const getPublicSellerProducts = async (
  sellerId,
  params = {}
) => {
  if (!sellerId) {
    throw new Error("Seller ID is required.");
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

  return publicRequest(
    `/sellers/${encodeURIComponent(
      sellerId
    )}/products${query}`
  );
};

// ============================================================
// ADMIN SELLER VERIFICATION
// ============================================================

export const verifySeller = async (
  sellerId
) => {
  if (!sellerId) {
    throw new Error("Seller ID is required.");
  }

  return request(
    `/admin/sellers/${encodeURIComponent(
      sellerId
    )}/verify`,
    {
      method: "POST",
    }
  );
};

// ============================================================
// ADMIN SELLER REJECTION
// ============================================================

export const rejectSeller = async (
  sellerId,
  reason = ""
) => {
  if (!sellerId) {
    throw new Error("Seller ID is required.");
  }

  return request(
    `/admin/sellers/${encodeURIComponent(
      sellerId
    )}/reject`,
    {
      method: "POST",
      body: JSON.stringify({
        reason,
      }),
    }
  );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const sellerService = {
  registerSeller,

  getSellerProfile,
  updateSellerProfile,

  getSellerDashboard,
  getSellerAnalytics,
  getSellerEarnings,

  getMyProducts,
  createProductSeller,
  updateProductSeller,
  deleteProductSeller,

  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,

  getPublicSellerProfile,
  getPublicSellerProducts,

  verifySeller,
  rejectSeller,
};

export default sellerService;