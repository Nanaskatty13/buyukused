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

// Remove trailing slash(es)
export const API_URL = RAW_API_URL.replace(/\/+$/, "");

console.log("🔗 API_URL:", API_URL);

// ================================================================
// REQUEST CONFIG
// ================================================================

const REQUEST_TIMEOUT = 20000;
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

  // 204 No Content
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
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

// ================================================================
// REQUEST HELPER
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
      error?.message === "Failed to fetch" ||
      isAbortError;

    console.error(
      "❌ API request failed:",
      url,
      error
    );

    // ------------------------------------------------------------
    // RETRY NETWORK ERRORS ONLY
    // ------------------------------------------------------------

    if (
      isNetworkError &&
      retries > 0
    ) {
      console.warn(
        `🔄 Retrying API request... ${retries} attempt${
          retries === 1 ? "" : "s"
        } left`
      );

      await sleep(1500);

      return request(
        url,
        options,
        retries - 1
      );
    }

    // ------------------------------------------------------------
    // BETTER ERROR MESSAGE
    // ------------------------------------------------------------

    if (isAbortError) {
      const timeoutError =
        new Error(
          "The server took too long to respond."
        );

      timeoutError.code =
        "REQUEST_TIMEOUT";

      timeoutError.url = url;

      throw timeoutError;
    }

    throw error;
  }
};

// ================================================================
// IMAGE URL
// ================================================================

export const getImageUrl = (path) => {
  // No image
  if (!path) {
    return "/placeholder.png";
  }

  // Must be a string
  if (typeof path !== "string") {
    return "/placeholder.png";
  }

  const cleanPath = path.trim();

  if (!cleanPath) {
    return "/placeholder.png";
  }

  // --------------------------------------------------------------
  // Full external URL
  // --------------------------------------------------------------

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://")
  ) {
    return cleanPath;
  }

  // --------------------------------------------------------------
  // Base64
  // --------------------------------------------------------------

  if (cleanPath.startsWith("data:")) {
    return cleanPath;
  }

  // --------------------------------------------------------------
  // Blob
  // --------------------------------------------------------------

  if (cleanPath.startsWith("blob:")) {
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
      "📝 Registration data:",
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

        headers:
          getHeaders(token),
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

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// PRODUCTS
// ================================================================

export const products = {
  // --------------------------------------------------------------
  // GET ALL PRODUCTS
  // --------------------------------------------------------------

  getAll: async (
    params = {}
  ) => {
    const query =
      new URLSearchParams(
        params
      ).toString();

    return request(
      `${API_URL}/api/products${
        query
          ? `?${query}`
          : ""
      }`
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
      )}`
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
  // --------------------------------------------------------------
  // GET ALL USERS
  // --------------------------------------------------------------

  getAll: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      new URLSearchParams(
        params
      ).toString();

    return request(
      `${API_URL}/api/users${
        query
          ? `?${query}`
          : ""
      }`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // GET USER BY ID
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // UPDATE USER
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),

        body: JSON.stringify(
          userData
        ),
      }
    );
  },

  // --------------------------------------------------------------
  // UPDATE USER WITH FILES
  // --------------------------------------------------------------

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

  // --------------------------------------------------------------
  // DELETE USER
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // USER STATS
  // --------------------------------------------------------------

  getStats: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/stats`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// NOTIFICATIONS
// ================================================================

export const notifications = {
  // --------------------------------------------------------------
  // USER NOTIFICATIONS
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // ADMIN NOTIFICATIONS
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // CREATE NOTIFICATION
  // --------------------------------------------------------------

  create: async (
    data,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications`,
      {
        method: "POST",

        headers:
          getHeaders(token),

        body: JSON.stringify(
          data
        ),
      }
    );
  },

  // --------------------------------------------------------------
  // MARK NOTIFICATION READ
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // DELETE NOTIFICATION
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// ORDERS
// ================================================================

export const orders = {
  // --------------------------------------------------------------
  // GET ALL ORDERS
  // --------------------------------------------------------------

  getAll: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      new URLSearchParams(
        params
      ).toString();

    return request(
      `${API_URL}/api/orders${
        query
          ? `?${query}`
          : ""
      }`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // GET ORDER BY ID
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // CREATE ORDER
  // --------------------------------------------------------------

  create: async (
    orderData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders`,
      {
        method: "POST",

        headers:
          getHeaders(token),

        body: JSON.stringify(
          orderData
        ),
      }
    );
  },

  // --------------------------------------------------------------
  // UPDATE ORDER
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),

        body: JSON.stringify(
          updates
        ),
      }
    );
  },

  // --------------------------------------------------------------
  // DELETE ORDER
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// MESSAGES
// ================================================================

export const messages = {
  // --------------------------------------------------------------
  // GET USER MESSAGES
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // GET CONVERSATIONS
  // --------------------------------------------------------------

  getConversations: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/conversations`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // GET CONVERSATION
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),

        body: JSON.stringify({
          receiver,
          message,
          productId,
        }),
      }
    );
  },

  // --------------------------------------------------------------
  // MARK MESSAGE READ
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // DELETE MESSAGE
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// FAVORITES
// ================================================================

export const favorites = {
  // --------------------------------------------------------------
  // GET FAVORITES
  // --------------------------------------------------------------

  getAll: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/favorites`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // --------------------------------------------------------------
  // ADD FAVORITE
  // --------------------------------------------------------------

  add: async (
    productId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/favorites`,
      {
        method: "POST",

        headers:
          getHeaders(token),

        body: JSON.stringify({
          productId,
        }),
      }
    );
  },

  // --------------------------------------------------------------
  // REMOVE FAVORITE
  // --------------------------------------------------------------

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

        headers:
          getHeaders(token),
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

  // Services
  auth,
  products,
  users,
  notifications,
  orders,
  messages,
  favorites,

  // Auth
  login,
  register,
  getMe,
  logout,

  // Products
  getProducts,
  getProduct,
  createProduct,
  createProductWithFiles,
  updateProduct,
  updateProductWithFiles,
  deleteProduct,
  updateProductStatus,

  // Users
  getUsers,
  getUser,
  updateUser,
  updateUserWithFiles,
  deleteUser,
  getUserStats,

  // Notifications
  getNotifications,
  getUserNotifications,
  getAdminNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,

  // Orders
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,

  // Messages
  getMessages,
  getConversations,
  getConversation,
  sendMessage,
  markMessageRead,
  deleteMessage,

  // Favorites
  getFavorites,
  addFavorite,
  removeFavorite,

  // Utilities
  getImageUrl,
  getToken,
  clearAuthData,
};

export default api;