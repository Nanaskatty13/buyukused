// frontend/src/services/api.js

import {
  getToken,
  clearAuthData,
} from "../utils/storage";

// ================================================================
// API CONFIG
// ================================================================

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const API_URL = RAW_API_URL.replace(/\/+$/, "");

console.log("🔗 API_URL:", API_URL);

// ================================================================
// REQUEST CONFIG – IMPROVED FOR RENDER COLD START
// ================================================================

// Allow up to 30 seconds for the server to respond (Render cold start ~20s)
const REQUEST_TIMEOUT = 30000;

// Retry up to 2 times (total 3 attempts) to handle transient failures
const MAX_RETRIES = 2;

// ================================================================
// HEADERS
// ================================================================

const getHeaders = (token = getToken()) => ({
  "Content-Type": "application/json",

  ...(token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}),
});

// IMPORTANT:
// Do NOT set Content-Type for FormData.
// The browser automatically adds:
// multipart/form-data; boundary=...
const getFileHeaders = (token = getToken()) => ({
  ...(token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}),
});

// ================================================================
// RESPONSE HANDLER
// ================================================================

const handleResponse = async (response) => {
  let data = {};

  if (response.status !== 204) {
    const contentType =
      response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
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
// SLEEP
// ================================================================

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ================================================================
// REQUEST HELPER – WITH RETRY ON TIMEOUT
// ================================================================

const request = async (
  url,
  options = {},
  retries = MAX_RETRIES
) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,

      // Respect an externally supplied signal.
      signal:
        options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);

    const isAbortError =
      error?.name === "AbortError";

    const isNetworkError =
      error?.name === "TypeError" ||
      error?.message === "Failed to fetch";

    // ------------------------------------------------------------
    // TIMEOUT – RETRY IF ATTEMPTS REMAIN
    // ------------------------------------------------------------

    if (isAbortError) {
      if (retries > 0) {
        console.warn(
          `⏳ Request timeout (server cold start?) – retrying... ${retries} attempt(s) left`
        );
        await sleep(1500); // give the server a bit more time to wake
        return request(url, options, retries - 1);
      }

      const timeoutError = new Error(
        "The server is taking too long to respond. Please try again in a moment."
      );

      timeoutError.code = "REQUEST_TIMEOUT";
      timeoutError.url = url;

      throw timeoutError;
    }

    // ------------------------------------------------------------
    // NETWORK ERRORS – RETRY IF ATTEMPTS REMAIN
    // ------------------------------------------------------------

    if (
      isNetworkError &&
      retries > 0
    ) {
      console.warn(
        `🔄 Network error – retrying... ${retries} attempt(s) left`
      );

      await sleep(800);

      return request(
        url,
        options,
        retries - 1
      );
    }

    console.error(
      "❌ API request failed:",
      url,
      error
    );

    throw error;
  }
};

// ================================================================
// QUERY BUILDER
// ================================================================

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      // Ignore undefined/null/empty values.
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      // Don't send "all" filters to backend.
      if (
        (key === "category" ||
          key === "location") &&
        value === "all"
      ) {
        return;
      }

      searchParams.set(
        key,
        String(value)
      );
    }
  );

  const query = searchParams.toString();

  return query ? `?${query}` : "";
};

// ================================================================
// IMAGE URL
// ================================================================

export const getImageUrl = (path) => {
  if (!path) {
    return "/placeholder.png";
  }

  if (typeof path !== "string") {
    return "/placeholder.png";
  }

  const cleanPath = path.trim();

  if (!cleanPath) {
    return "/placeholder.png";
  }

  // --------------------------------------------------------------
  // External URL
  // --------------------------------------------------------------

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://")
  ) {
    // Cloudinary optimization.
    if (
      cleanPath.includes(
        "res.cloudinary.com"
      ) &&
      cleanPath.includes("/image/upload/")
    ) {
      return cleanPath.replace(
        "/image/upload/",
        "/image/upload/f_auto,q_auto,w_600/"
      );
    }

    return cleanPath;
  }

  // --------------------------------------------------------------
  // Base64
  // --------------------------------------------------------------

  if (
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  // --------------------------------------------------------------
  // Blob
  // --------------------------------------------------------------

  if (
    cleanPath.startsWith("blob:")
  ) {
    return cleanPath;
  }

  // --------------------------------------------------------------
  // Relative backend path
  // --------------------------------------------------------------

  return `${API_URL}${
    cleanPath.startsWith("/")
      ? cleanPath
      : `/${cleanPath}`
  }`;
};

// ================================================================
// KEEP ALIVE – Ping the server every 10 minutes to prevent sleep
// ================================================================

export const startKeepAlive = (intervalMs = 10 * 60 * 1000) => {
  const ping = () => {
    fetch(`${API_URL}/api/health`, { method: "HEAD" })
      .catch(() => {});
  };
  ping(); // ping immediately
  return setInterval(ping, intervalMs);
};

// ================================================================
// AUTH
// ================================================================

export const auth = {
  // --------------------------------------------------------------
  // LOGIN
  // --------------------------------------------------------------

  login: async (
    email,
    password
  ) => {
    return request(
      `${API_URL}/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email: String(email || "")
            .trim()
            .toLowerCase(),

          password: String(
            password || ""
          ),
        }),
      }
    );
  },

  // --------------------------------------------------------------
  // REGISTER
  // --------------------------------------------------------------

  register: async (
    userData = {}
  ) => {
    const registrationData = {
      name: String(
        userData.name || ""
      ).trim(),

      email: String(
        userData.email || ""
      )
        .trim()
        .toLowerCase(),

      password: String(
        userData.password || ""
      ),

      phone: String(
        userData.phone || ""
      ).trim(),

      role: String(
        userData.role || "buyer"
      )
        .trim()
        .toLowerCase(),
    };

    console.log(
      "📝 Registration:",
      {
        name:
          registrationData.name,

        email:
          registrationData.email,

        phone:
          registrationData.phone,

        role:
          registrationData.role,

        passwordProvided:
          Boolean(
            registrationData.password
          ),
      }
    );

    return request(
      `${API_URL}/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          registrationData
        ),
      }
    );
  },

  // --------------------------------------------------------------
  // CURRENT USER
  // --------------------------------------------------------------

  getMe: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/auth/me`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // LOGOUT
  // --------------------------------------------------------------

  logout: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/auth/logout`,
      {
        method: "POST",
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// PRODUCTS
// ================================================================

export const products = {
  // --------------------------------------------------------------
  // GET PRODUCTS
  // --------------------------------------------------------------

  getAll: async (
    params = {}
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/products${query}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
        },
      }
    );
  },

  // --------------------------------------------------------------
  // GET PRODUCT BY ID
  // --------------------------------------------------------------

  getById: async (
    id
  ) => {
    if (!id) {
      throw new Error(
        "Product ID is required"
      );
    }

    return request(
      `${API_URL}/api/products/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
        headers: {
          Accept:
            "application/json",
        },
      }
    );
  },

  // --------------------------------------------------------------
  // CREATE PRODUCT
  // --------------------------------------------------------------

  create: async (
    productData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products`,
      {
        method: "POST",

        headers:
          getHeaders(token),

        body: JSON.stringify(
          productData
        ),
      }
    );
  },

  // --------------------------------------------------------------
  // CREATE PRODUCT WITH FILES
  // --------------------------------------------------------------

  createWithFiles: async (
    formData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products`,
      {
        method: "POST",

        headers:
          getFileHeaders(token),

        body: formData,
      }
    );
  },

  // --------------------------------------------------------------
  // UPDATE PRODUCT
  // --------------------------------------------------------------

  update: async (
    id,
    productData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products/${encodeURIComponent(
        id
      )}`,
      {
        method: "PUT",

        headers:
          getHeaders(token),

        body: JSON.stringify(
          productData
        ),
      }
    );
  },

  // --------------------------------------------------------------
  // UPDATE PRODUCT WITH FILES
  // --------------------------------------------------------------

  updateWithFiles: async (
    id,
    formData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products/${encodeURIComponent(
        id
      )}`,
      {
        method: "PUT",

        headers:
          getFileHeaders(token),

        body: formData,
      }
    );
  },

  // --------------------------------------------------------------
  // DELETE PRODUCT
  // --------------------------------------------------------------

  delete: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // UPDATE PRODUCT STATUS
  // --------------------------------------------------------------

  updateStatus: async (
    productId,
    status,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products/${encodeURIComponent(
        productId
      )}/status`,
      {
        method: "PATCH",

        headers:
          getHeaders(token),

        body: JSON.stringify({
          status,
        }),
      }
    );
  },
};

// ================================================================
// USERS
// ================================================================

export const users = {
  getAll: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/users${query}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  getById: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  update: async (
    id,
    userData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/${encodeURIComponent(
        id
      )}`,
      {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(
          userData
        ),
      }
    );
  },

  updateWithFiles: async (
    id,
    formData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/${encodeURIComponent(
        id
      )}`,
      {
        method: "PUT",
        headers:
          getFileHeaders(token),
        body: formData,
      }
    );
  },

  delete: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
      }
    );
  },

  getStats: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/stats`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// NOTIFICATIONS
// ================================================================

export const notifications = {
  getForUser: async (
    userId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications/${encodeURIComponent(
        userId
      )}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  getForAdmin: async (
    token = getToken()
  ) => {
    if (!token) {
      throw new Error(
        "Authentication token is missing"
      );
    }

    return request(
      `${API_URL}/api/notifications/admin`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  create: async (
    data,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications`,
      {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(data),
      }
    );
  },

  markRead: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications/${encodeURIComponent(
        id
      )}/read`,
      {
        method: "PUT",
        headers: getHeaders(token),
      }
    );
  },

  delete: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// ORDERS
// ================================================================

export const orders = {
  getAll: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/orders${query}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  getById: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  create: async (
    orderData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders`,
      {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify(
          orderData
        ),
      }
    );
  },

  update: async (
    id,
    updates,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders/${encodeURIComponent(
        id
      )}`,
      {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(
          updates
        ),
      }
    );
  },

  delete: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// MESSAGES
// ================================================================

export const messages = {
  getForUser: async (
    userId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/${encodeURIComponent(
        userId
      )}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  getConversations: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/conversations`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  getConversation: async (
    otherUserId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/conversation/${encodeURIComponent(
        otherUserId
      )}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  send: async (
    receiver,
    message,
    productId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages`,
      {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({
          receiver,
          message,
          productId,
        }),
      }
    );
  },

  markRead: async (
    messageId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/${encodeURIComponent(
        messageId
      )}/read`,
      {
        method: "PUT",
        headers: getHeaders(token),
      }
    );
  },

  delete: async (
    messageId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/${encodeURIComponent(
        messageId
      )}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// FAVORITES
// ================================================================

export const favorites = {
  getAll: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/favorites`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },

  add: async (
    productId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/favorites`,
      {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({
          productId,
        }),
      }
    );
  },

  remove: async (
    productId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/favorites/${encodeURIComponent(
        productId
      )}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// NAMED AUTH EXPORTS
// ================================================================

export const login = auth.login;
export const register = auth.register;
export const getMe = auth.getMe;
export const logout = auth.logout;

// ================================================================
// PRODUCT EXPORTS
// ================================================================

export const getProducts =
  products.getAll;

export const getProduct =
  products.getById;

export const createProduct =
  products.create;

export const createProductWithFiles =
  products.createWithFiles;

export const updateProduct =
  products.update;

export const updateProductWithFiles =
  products.updateWithFiles;

export const deleteProduct =
  products.delete;

export const updateProductStatus =
  products.updateStatus;

// ================================================================
// USER EXPORTS
// ================================================================

export const getUsers =
  users.getAll;

export const getUser =
  users.getById;

export const updateUser =
  users.update;

export const updateUserWithFiles =
  users.updateWithFiles;

export const deleteUser =
  users.delete;

export const getUserStats =
  users.getStats;

// ================================================================
// NOTIFICATION EXPORTS
// ================================================================

export const getNotifications =
  notifications.getForAdmin;

export const getAdminNotifications =
  notifications.getForAdmin;

export const getUserNotifications =
  notifications.getForUser;

export const createNotification =
  notifications.create;

export const markNotificationRead =
  notifications.markRead;

export const deleteNotification =
  notifications.delete;

// ================================================================
// ORDER EXPORTS
// ================================================================

export const getOrders =
  orders.getAll;

export const getOrder =
  orders.getById;

export const createOrder =
  orders.create;

export const updateOrder =
  orders.update;

export const deleteOrder =
  orders.delete;

// ================================================================
// MESSAGE EXPORTS
// ================================================================

export const getMessages =
  messages.getForUser;

export const getConversations =
  messages.getConversations;

export const getConversation =
  messages.getConversation;

export const sendMessage =
  messages.send;

export const markMessageRead =
  messages.markRead;

export const deleteMessage =
  messages.delete;

// ================================================================
// FAVORITE EXPORTS
// ================================================================

export const getFavorites =
  favorites.getAll;

export const addFavorite =
  favorites.add;

export const removeFavorite =
  favorites.remove;

// ================================================================
// DEFAULT API OBJECT
// ================================================================

const api = {
  API_URL,

  auth,
  products,
  users,
  notifications,
  orders,
  messages,
  favorites,

  login,
  register,
  getMe,
  logout,

  getProducts,
  getProduct,
  createProduct,
  createProductWithFiles,
  updateProduct,
  updateProductWithFiles,
  deleteProduct,
  updateProductStatus,

  getUsers,
  getUser,
  updateUser,
  updateUserWithFiles,
  deleteUser,
  getUserStats,

  getNotifications,
  getUserNotifications,
  getAdminNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,

  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,

  getMessages,
  getConversations,
  getConversation,
  sendMessage,
  markMessageRead,
  deleteMessage,

  getFavorites,
  addFavorite,
  removeFavorite,

  getImageUrl,
  getToken,
  clearAuthData,

  // Keep‑alive utility
  startKeepAlive,
};

export default api;