// ============================================================
// sellerService.js
// BuyUKUsed Seller API Service
// ============================================================

// ------------------------------------------------------------
// API BASE URL
// ------------------------------------------------------------
//
// VITE_API_URL should normally be:
//
// https://buyukused.onrender.com
//
// NOT:
//
// https://buyukused.onrender.com/api
//
// We add /api/sellers below.
// ------------------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

// ============================================================
// HELPERS
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
};

// ============================================================
// RESPONSE HANDLER
// ============================================================

const handleResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        `HTTP ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

// ============================================================
// REQUEST HELPERS
// ============================================================

const publicRequest = async (
  endpoint,
  options = {}
) => {
  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    `🌐 Seller API → ${options.method || "GET"} ${url}`
  );

  const response = await fetch(url, {
    ...options,

    headers: {
      Accept: "application/json",

      ...(options.body
        ? {
            "Content-Type":
              "application/json",
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
};

const authenticatedRequest = async (
  endpoint,
  options = {}
) => {
  const token = getToken();

  const url =
    `${API_BASE_URL}${endpoint}`;

  console.log(
    `🔐 Seller API → ${options.method || "GET"} ${url}`
  );

  const response = await fetch(url, {
    ...options,

    headers: {
      Accept: "application/json",

      ...(options.body
        ? {
            "Content-Type":
              "application/json",
          }
        : {}),

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
};

// ============================================================
// 1. REGISTER SELLER
// ============================================================

export const registerSeller = async (
  sellerData
) => {
  return authenticatedRequest(
    "/api/sellers/register",
    {
      method: "POST",
      body: JSON.stringify(
        sellerData
      ),
    }
  );
};

// ============================================================
// 2. GET MY SELLER PROFILE
// ============================================================

export const getSellerProfile =
  async () => {
    return authenticatedRequest(
      "/api/sellers/profile"
    );
  };

// ============================================================
// 3. UPDATE MY SELLER PROFILE
// ============================================================

export const updateSellerProfile =
  async (sellerData) => {
    return authenticatedRequest(
      "/api/sellers/profile",
      {
        method: "PUT",
        body: JSON.stringify(
          sellerData
        ),
      }
    );
  };

// ============================================================
// 4. SELLER DASHBOARD
// ============================================================

export const getSellerDashboard =
  async (period = "all") => {
    const params =
      new URLSearchParams();

    if (period) {
      params.set(
        "period",
        period
      );
    }

    const query =
      params.toString();

    return authenticatedRequest(
      `/api/sellers/dashboard${
        query ? `?${query}` : ""
      }`
    );
  };

// ============================================================
// 5. SELLER EARNINGS
// ============================================================

export const getSellerEarnings =
  async (period = "all") => {
    const params =
      new URLSearchParams();

    if (period) {
      params.set(
        "period",
        period
      );
    }

    const query =
      params.toString();

    return authenticatedRequest(
      `/api/sellers/earnings${
        query ? `?${query}` : ""
      }`
    );
  };

// ============================================================
// 6. MY PRODUCTS
// ============================================================

export const getMyProducts =
  async ({
    page = 1,
    limit = 20,
    sort = "-createdAt",
    status,
  } = {}) => {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(page)
    );

    params.set(
      "limit",
      String(limit)
    );

    if (sort) {
      params.set(
        "sort",
        sort
      );
    }

    if (status) {
      params.set(
        "status",
        status
      );
    }

    return authenticatedRequest(
      `/api/sellers/products?${params.toString()}`
    );
  };

// ============================================================
// 7. SELLER ORDERS
// ============================================================

export const getSellerOrders =
  async ({
    page = 1,
    limit = 20,
    sort = "-createdAt",
    status,
  } = {}) => {
    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(page)
    );

    params.set(
      "limit",
      String(limit)
    );

    if (sort) {
      params.set(
        "sort",
        sort
      );
    }

    if (status) {
      params.set(
        "status",
        status
      );
    }

    return authenticatedRequest(
      `/api/sellers/orders?${params.toString()}`
    );
  };

// ============================================================
// 8. PUBLIC SELLER PROFILE
// ============================================================
//
// THIS FIXES YOUR CURRENT 404.
//
// Correct:
// /api/sellers/:sellerId
//
// Wrong:
// /sellers/:sellerId
// ============================================================

export const getPublicSellerProfile =
  async (sellerId) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return publicRequest(
      `/api/sellers/${encodeURIComponent(
        sellerId
      )}`
    );
  };

// ============================================================
// 9. PUBLIC SELLER PRODUCTS
// ============================================================

export const getPublicSellerProducts =
  async (
    sellerId,
    {
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = {}
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    const params =
      new URLSearchParams();

    params.set(
      "page",
      String(page)
    );

    params.set(
      "limit",
      String(limit)
    );

    if (sort) {
      params.set(
        "sort",
        sort
      );
    }

    return publicRequest(
      `/api/sellers/${encodeURIComponent(
        sellerId
      )}/products?${params.toString()}`
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
  getSellerEarnings,
  getMyProducts,
  getSellerOrders,
  getPublicSellerProfile,
  getPublicSellerProducts,
};

export default sellerService;