// ============================================================
// frontend/src/services/api.js
// BuyUKUsed - API Service
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🔗 API_URL:", API_URL);

// ============================================================
// HELPERS
// ============================================================

const getStoredToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  } catch (error) {
    console.warn("⚠️ Unable to access localStorage:", error);
    return "";
  }
};

// ============================================================
// MONGODB OBJECTID VALIDATION
// ============================================================

const isValidObjectId = (value) => {
  return (
    typeof value === "string" &&
    /^[a-fA-F0-9]{24}$/.test(value)
  );
};

// ============================================================
// GET USER ID FROM JWT
//
// This is only a fallback.
// The actual user object from AuthContext is preferred.
// ============================================================

const getUserIdFromToken = () => {
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      decodeURIComponent(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map(
            (char) =>
              "%" +
              ("00" + char.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );

    const id =
      payload?.id ||
      payload?._id ||
      payload?.userId ||
      null;

    return isValidObjectId(id) ? id : null;
  } catch (error) {
    console.warn(
      "⚠️ Could not decode user ID from token:",
      error
    );

    return null;
  }
};

// ============================================================
// HANDLE RESPONSE
// ============================================================

const handleResponse = async (response) => {
  let data = null;

  try {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = text
        ? { message: text }
        : null;
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (response.status === 400
        ? "Bad request"
        : response.status === 401
        ? "Unauthorized. Please log in again."
        : response.status === 403
        ? "You do not have permission to perform this action."
        : response.status === 404
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

  // ==========================================================
  // AUTHORIZATION
  // ==========================================================

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
    ...options,
    method: "GET",
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
    ...options,
    method: "POST",
    body:
      body instanceof FormData
        ? body
        : JSON.stringify(body ?? {}),
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
    ...options,
    method: "PATCH",
    ...(body !== undefined
      ? {
          body:
            body instanceof FormData
              ? body
              : JSON.stringify(body ?? {}),
        }
      : {}),
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
    ...options,
    method: "PUT",
    ...(body !== undefined
      ? {
          body:
            body instanceof FormData
              ? body
              : JSON.stringify(body ?? {}),
        }
      : {}),
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
    ...options,
    method: "DELETE",
  });
};

// ============================================================
// IMAGE URL HELPER
// ============================================================

export const getImageUrl = (image) => {
  if (!image) {
    return "/placeholder.png";
  }

  if (typeof image !== "string") {
    return "/placeholder.png";
  }

  const trimmed = image.trim();

  if (!trimmed) {
    return "/placeholder.png";
  }

  // Already a complete URL
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Local/public path
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed}`;
};

// ============================================================
// AUTH
// ============================================================

export const loginUser = async (credentials) => {
  return post(
    "/api/auth/login",
    credentials
  );
};

export const registerUser = async (userData) => {
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
          String(value)
        );
      }
    }
  );

  const queryString = query.toString();

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
  if (!isValidObjectId(userId)) {
    throw new Error("Valid User ID is required");
  }

  return get(
    `/api/admin/users/${userId}`
  );
};

export const updateAdminUserRole = async (
  userId,
  role
) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Valid User ID is required");
  }

  if (!role) {
    throw new Error("User role is required");
  }

  return patch(
    `/api/admin/users/${userId}/role`,
    { role }
  );
};

export const updateAdminUserStatus = async (
  userId,
  isActive
) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Valid User ID is required");
  }

  return patch(
    `/api/admin/users/${userId}/status`,
    { isActive: Boolean(isActive) }
  );
};

// ============================================================
// ADMIN - SELLER VERIFICATION
// ============================================================

export const verifyAdminSeller = async (
  sellerId
) => {
  if (!isValidObjectId(sellerId)) {
    throw new Error(
      "Valid Seller ID is required"
    );
  }

  return patch(
    `/api/admin/users/${sellerId}/verify-seller`
  );
};

export const unverifyAdminSeller = async (
  sellerId
) => {
  if (!isValidObjectId(sellerId)) {
    throw new Error(
      "Valid Seller ID is required"
    );
  }

  return patch(
    `/api/admin/users/${sellerId}/unverify-seller`
  );
};

// ============================================================
// ADMIN - DELETE USER
// ============================================================

export const deleteAdminUser = async (
  userId
) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Valid User ID is required");
  }

  return del(
    `/api/admin/users/${userId}`
  );
};

// ============================================================
// ADMIN - PRODUCTS
// ============================================================

export const getAdminProducts = async () => {
  return get(
    "/api/admin/products"
  );
};

export const deleteAdminProduct = async (
  productId
) => {
  if (!isValidObjectId(productId)) {
    throw new Error(
      "Valid Product ID is required"
    );
  }

  return del(
    `/api/admin/products/${productId}`
  );
};

// ============================================================
// ADMIN - ORDERS
// ============================================================

export const getAdminOrders = async () => {
  return get(
    "/api/admin/orders"
  );
};

export const updateAdminOrderStatus = async (
  orderId,
  status
) => {
  if (!isValidObjectId(orderId)) {
    throw new Error(
      "Valid Order ID is required"
    );
  }

  if (!status) {
    throw new Error(
      "Order status is required"
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

export const getAdminRiders = async (
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
          String(value)
        );
      }
    }
  );

  const queryString = query.toString();

  return get(
    `/api/admin/riders${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
};

export const getAdminRiderById = async (
  riderId
) => {
  if (!isValidObjectId(riderId)) {
    throw new Error(
      "Valid Rider ID is required"
    );
  }

  return get(
    `/api/admin/riders/${riderId}`
  );
};

export const approveAdminRider = async (
  riderId
) => {
  if (!isValidObjectId(riderId)) {
    throw new Error(
      "Valid Rider ID is required"
    );
  }

  return patch(
    `/api/admin/riders/${riderId}/approve`
  );
};

export const rejectAdminRider = async (
  riderId
) => {
  if (!isValidObjectId(riderId)) {
    throw new Error(
      "Valid Rider ID is required"
    );
  }

  return patch(
    `/api/admin/riders/${riderId}/reject`
  );
};

export const updateAdminRiderStatus = async (
  riderId,
  isActive
) => {
  if (!isValidObjectId(riderId)) {
    throw new Error(
      "Valid Rider ID is required"
    );
  }

  return patch(
    `/api/admin/riders/${riderId}/status`,
    {
      isActive: Boolean(isActive),
    }
  );
};

export const updateAdminRiderProfile = async (
  riderId,
  profile
) => {
  if (!isValidObjectId(riderId)) {
    throw new Error(
      "Valid Rider ID is required"
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
//
// IMPORTANT:
// This endpoint expects MongoDB USER ID.
// It must NEVER receive the JWT.
// ============================================================

export const getNotifications = async (
  userId
) => {
  if (!isValidObjectId(userId)) {
    throw new Error(
      "Valid User ID is required to fetch notifications"
    );
  }

  return get(
    `/api/notifications/${userId}`
  );
};

export const markNotificationAsRead =
  async (notificationId) => {
    if (!isValidObjectId(notificationId)) {
      throw new Error(
        "Valid Notification ID is required"
      );
    }

    return patch(
      `/api/notifications/${notificationId}/read`
    );
  };

export const markAllNotificationsAsRead =
  async (userId) => {
    if (!isValidObjectId(userId)) {
      throw new Error(
        "Valid User ID is required"
      );
    }

    return patch(
      `/api/notifications/user/${userId}/read-all`
    );
  };

// ============================================================
// PASSWORD
// ============================================================

export const forgotPassword = async (
  email
) => {
  return post(
    "/api/password/forgot",
    { email }
  );
};

export const resetPassword = async (
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

  getImageUrl,

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