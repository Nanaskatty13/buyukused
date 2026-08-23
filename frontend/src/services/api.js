// ============================================================
// frontend/src/services/api.js
// BuyUKUsed - API Service
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com";

console.log("🔗 API_URL:", API_URL);

// ============================================================
// HELPERS
// ============================================================

const getStoredToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
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
    const message =
      data?.message ||
      data?.error ||
      (response.status === 404
        ? "API endpoint not found"
        : `Request failed with status ${response.status}`);

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

// ============================================================
// GENERIC REQUEST
// ============================================================

export const request = async (
  endpoint,
  options = {}
) => {
  const token = getStoredToken();

  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_URL}${cleanEndpoint}`;

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(options.headers || {}),
  };

  // ----------------------------------------------------------
  // Authorization
  // ----------------------------------------------------------

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(
      "❌ API request failed:",
      url,
      error
    );

    throw error;
  }
};

// ============================================================
// GET
// ============================================================

export const get = async (
  endpoint,
  options = {}
) => {
  return request(endpoint, {
    method: "GET",
    ...options,
  });
};

// ============================================================
// POST
// ============================================================

export const post = async (
  endpoint,
  body,
  options = {}
) => {
  return request(endpoint, {
    method: "POST",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
    ...options,
  });
};

// ============================================================
// PATCH
// ============================================================

export const patch = async (
  endpoint,
  body,
  options = {}
) => {
  return request(endpoint, {
    method: "PATCH",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
    ...options,
  });
};

// ============================================================
// PUT
// ============================================================

export const put = async (
  endpoint,
  body,
  options = {}
) => {
  return request(endpoint, {
    method: "PUT",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body),
    ...options,
  });
};

// ============================================================
// DELETE
// ============================================================

export const del = async (
  endpoint,
  options = {}
) => {
  return request(endpoint, {
    method: "DELETE",
    ...options,
  });
};

// ============================================================
// AUTH
// ============================================================

export const loginUser = async (
  credentials
) => {
  return post(
    "/api/auth/login",
    credentials
  );
};

export const registerUser = async (
  userData
) => {
  return post(
    "/api/auth/register",
    userData
  );
};

export const getCurrentUser = async () => {
  return get("/api/auth/me");
};

// ============================================================
// ADMIN - USERS
// ============================================================

export const getAdminUsers = async (
  params = {}
) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          value
        );
      }
    }
  );

  const queryString =
    query.toString();

  return get(
    `/api/admin/users${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
};

export const getAdminUserById = async (
  userId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  return get(
    `/api/admin/users/${userId}`
  );
};

export const updateAdminUserRole = async (
  userId,
  role
) => {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  return patch(
    `/api/admin/users/${userId}/role`,
    { role }
  );
};

export const updateAdminUserStatus =
  async (
    userId,
    isActive
  ) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    return patch(
      `/api/admin/users/${userId}/status`,
      { isActive }
    );
  };

// ============================================================
// ADMIN - SELLER VERIFICATION
// ============================================================

export const verifyAdminSeller =
  async (sellerId) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return patch(
      `/api/admin/users/${sellerId}/verify-seller`
    );
  };

export const unverifyAdminSeller =
  async (sellerId) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return patch(
      `/api/admin/users/${sellerId}/unverify-seller`
    );
  };

// ============================================================
// ADMIN - DELETE USER
// ============================================================

export const deleteAdminUser =
  async (userId) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    return del(
      `/api/admin/users/${userId}`
    );
  };

// ============================================================
// ADMIN - PRODUCTS
// ============================================================

export const getAdminProducts =
  async () => {
    return get(
      "/api/admin/products"
    );
  };

export const deleteAdminProduct =
  async (productId) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    return del(
      `/api/admin/products/${productId}`
    );
  };

// ============================================================
// ADMIN - ORDERS
// ============================================================

export const getAdminOrders =
  async () => {
    return get(
      "/api/admin/orders"
    );
  };

export const updateAdminOrderStatus =
  async (
    orderId,
    status
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    return patch(
      `/api/admin/orders/${orderId}/status`,
      { status }
    );
  };

// ============================================================
// ADMIN - RIDERS
// ============================================================

export const getAdminRiders =
  async (params = {}) => {
    const query =
      new URLSearchParams();

    Object.entries(params).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          query.append(
            key,
            value
          );
        }
      }
    );

    const queryString =
      query.toString();

    return get(
      `/api/admin/riders${
        queryString
          ? `?${queryString}`
          : ""
      }`
    );
  };

export const getAdminRiderById =
  async (riderId) => {
    if (!riderId) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return get(
      `/api/admin/riders/${riderId}`
    );
  };

export const approveAdminRider =
  async (riderId) => {
    if (!riderId) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return patch(
      `/api/admin/riders/${riderId}/approve`
    );
  };

export const rejectAdminRider =
  async (riderId) => {
    if (!riderId) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return patch(
      `/api/admin/riders/${riderId}/reject`
    );
  };

export const updateAdminRiderStatus =
  async (
    riderId,
    isActive
  ) => {
    if (!riderId) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return patch(
      `/api/admin/riders/${riderId}/status`,
      { isActive }
    );
  };

export const updateAdminRiderProfile =
  async (
    riderId,
    profile
  ) => {
    if (!riderId) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return patch(
      `/api/admin/riders/${riderId}/profile`,
      profile
    );
  };

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const getAdminDashboardStats =
  async () => {
    return get(
      "/api/admin/stats"
    );
  };

// ============================================================
// NOTIFICATIONS
// IMPORTANT:
// This endpoint expects USER ID, NOT JWT TOKEN.
// ============================================================

export const getNotifications =
  async (userId) => {
    if (!userId) {
      throw new Error(
        "User ID is required to fetch notifications"
      );
    }

    return get(
      `/api/notifications/${userId}`
    );
  };

export const markNotificationAsRead =
  async (
    notificationId
  ) => {
    if (!notificationId) {
      throw new Error(
        "Notification ID is required"
      );
    }

    return patch(
      `/api/notifications/${notificationId}/read`
    );
  };

export const markAllNotificationsAsRead =
  async (userId) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    return patch(
      `/api/notifications/user/${userId}/read-all`
    );
  };

// ============================================================
// PASSWORD
// ============================================================

export const forgotPassword =
  async (email) => {
    return post(
      "/api/password/forgot",
      { email }
    );
  };

export const resetPassword =
  async (
    token,
    password
  ) => {
    return post(
      "/api/password/reset",
      {
        token,
        password,
      }
    );
  };

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  API_URL,
  request,
  get,
  post,
  patch,
  put,
  del,

  loginUser,
  registerUser,
  getCurrentUser,

  getAdminUsers,
  getAdminUserById,
  updateAdminUserRole,
  updateAdminUserStatus,

  verifyAdminSeller,
  unverifyAdminSeller,

  deleteAdminUser,

  getAdminProducts,
  deleteAdminProduct,

  getAdminOrders,
  updateAdminOrderStatus,

  getAdminRiders,
  getAdminRiderById,
  approveAdminRider,
  rejectAdminRider,
  updateAdminRiderStatus,
  updateAdminRiderProfile,

  getAdminDashboardStats,

  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  forgotPassword,
  resetPassword,
};