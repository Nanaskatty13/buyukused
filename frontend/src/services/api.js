// src/services/api.js

import { getToken, clearAuthData } from "../utils/storage";

// ================================================================
// API CONFIG
// ================================================================

export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

console.log("🔗 API_URL:", API_URL);

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

// ================================================================
// RESPONSE HANDLER
// ================================================================

const handleResponse = async (response) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    // Only clear authentication for genuine authentication failures.
    if (
      (response.status === 401 || response.status === 403) &&
      !response.url.includes("/auth/login")
    ) {
      clearAuthData();
    }

    const error = new Error(
      data?.message ||
        data?.error ||
        `HTTP ${response.status}`
    );

    error.status = response.status;

    throw error;
  }

  return data;
};

// ================================================================
// REQUEST HELPER
// ================================================================

const request = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("❌ API request failed:", url, error);
    throw error;
  }
};

// ================================================================
// IMAGE URL
// ================================================================

export const getImageUrl = (path) => {
  if (!path) {
    return "/placeholder.png";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  if (path.startsWith("data:")) {
    return path;
  }

  return `${API_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;
};

// ================================================================
// AUTH
// ================================================================

export const auth = {
  login: async (email, password) => {
    return request(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });
  },

  register: async (userData) => {
    return request(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        phone: userData.phone || "",
      }),
    });
  },

  getMe: async (token = getToken()) => {
    return request(`${API_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(token),
    });
  },

  logout: async (token = getToken()) => {
    return request(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(token),
    });
  },
};

// ================================================================
// PRODUCTS
// ================================================================

export const products = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return request(
      `${API_URL}/api/products${
        query ? `?${query}` : ""
      }`
    );
  },

  getById: async (id) => {
    return request(
      `${API_URL}/api/products/${id}`
    );
  },

  create: async (productData, token = getToken()) => {
    return request(`${API_URL}/api/products`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(productData),
    });
  },

  createWithFiles: async (
    formData,
    token = getToken()
  ) => {
    return request(`${API_URL}/api/products`, {
      method: "POST",
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: formData,
    });
  },

  update: async (
    id,
    productData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products/${id}`,
      {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(productData),
      }
    );
  },

  updateWithFiles: async (
    id,
    formData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/products/${id}`,
      {
        method: "PUT",
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: formData,
      }
    );
  },

  delete: async (id, token = getToken()) => {
    return request(
      `${API_URL}/api/products/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
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
    const query = new URLSearchParams(params).toString();

    return request(
      `${API_URL}/api/users${
        query ? `?${query}` : ""
      }`,
      {
        headers: getHeaders(token),
      }
    );
  },

  getById: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/${id}`,
      {
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
      `${API_URL}/api/users/${id}`,
      {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(userData),
      }
    );
  },

  delete: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/users/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
      }
    );
  },

  getStats: async (token = getToken()) => {
    return request(
      `${API_URL}/api/users/stats`,
      {
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// NOTIFICATIONS
// ================================================================

export const notifications = {
  // Notifications for a specific user
  getForUser: async (
    userId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications/${userId}`,
      {
        headers: getHeaders(token),
      }
    );
  },

  // Admin notifications
  getForAdmin: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications/admin`,
      {
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
      `${API_URL}/api/notifications/${id}/read`,
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
      `${API_URL}/api/notifications/${id}`,
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
    const query = new URLSearchParams(params).toString();

    return request(
      `${API_URL}/api/orders${
        query ? `?${query}` : ""
      }`,
      {
        headers: getHeaders(token),
      }
    );
  },

  getById: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders/${id}`,
      {
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
        body: JSON.stringify(orderData),
      }
    );
  },

  update: async (
    id,
    updates,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders/${id}`,
      {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify(updates),
      }
    );
  },

  delete: async (
    id,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/orders/${id}`,
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
      `${API_URL}/api/messages/${userId}`,
      {
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
        headers: getHeaders(token),
      }
    );
  },

  getConversation: async (
    otherUserId,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/conversation/${otherUserId}`,
      {
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
      `${API_URL}/api/messages/${messageId}/read`,
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
      `${API_URL}/api/messages/${messageId}`,
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
  getAll: async (token = getToken()) => {
    return request(
      `${API_URL}/api/favorites`,
      {
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
      `${API_URL}/api/favorites/${productId}`,
      {
        method: "DELETE",
        headers: getHeaders(token),
      }
    );
  },
};

// ================================================================
// NAMED EXPORTS
// ================================================================

export const login = auth.login;
export const register = auth.register;
export const getMe = auth.getMe;
export const logout = auth.logout;

export const getProducts = products.getAll;
export const getProduct = products.getById;
export const createProduct = products.create;
export const createProductWithFiles =
  products.createWithFiles;
export const updateProduct = products.update;
export const updateProductWithFiles =
  products.updateWithFiles;
export const deleteProduct = products.delete;

export const getUsers = users.getAll;
export const getUser = users.getById;
export const updateUser = users.update;
export const deleteUser = users.delete;
export const getUserStats = users.getStats;

// IMPORTANT:
// This is now the admin notification function.
export const getNotifications =
  notifications.getForAdmin;

// Explicit user notification function.
export const getUserNotifications =
  notifications.getForUser;

export const getAdminNotifications =
  notifications.getForAdmin;

export const createNotification =
  notifications.create;

export const markNotificationRead =
  notifications.markRead;

export const deleteNotification =
  notifications.delete;

export const getOrders = orders.getAll;
export const getOrder = orders.getById;
export const createOrder = orders.create;
export const updateOrder = orders.update;
export const deleteOrder = orders.delete;

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

  getUsers,
  getUser,
  updateUser,
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
};

export default api;