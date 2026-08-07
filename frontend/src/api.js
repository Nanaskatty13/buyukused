// ================================================================
//  IMPORTS
// ================================================================

import { getToken, clearAuthData } from './utils/storage';

// ================================================================
//  API CONFIG
// ================================================================

// ✅ CORRECT: plain string, no Markdown
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

console.log("🔗 API_URL:", API_URL);

// ================================================================
//  FETCH WITH TIMEOUT (prevents hanging requests)
// ================================================================

const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
};

// ================================================================
//  HEADERS & RESPONSE HANDLER
// ================================================================

const getHeaders = (token = getToken()) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const handleResponse = async (response) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (
      (response.status === 401 || response.status === 403) &&
      !response.url.includes("/auth/login")
    ) {
      clearAuthData();
    }

    throw new Error(
      data.message ||
      data.error ||
      `HTTP ${response.status}`
    );
  }

  return data;
};

// ================================================================
//  AUTH API
// ================================================================

export const auth = {
  login: async (email, password) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: userData.name,
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        phone: userData.phone || "",
      }),
    });
    return handleResponse(res);
  },

  getMe: async (token) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  logout: async (token) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  PRODUCTS API
// ================================================================

export const products = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/products${query ? `?${query}` : ''}`;
    const res = await fetchWithTimeout(url, {
      credentials: "include",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getById: async (id) => {
    const res = await fetchWithTimeout(`${API_URL}/api/products/${id}`, {
      credentials: "include",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  create: async (productData, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/products`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  createWithFiles: async (formData, token = getToken()) => {
    const res = await fetchWithTimeout(`${API_URL}/api/products`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(res);
  },

  update: async (id, productData, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  updateWithFiles: async (id, formData, token = getToken()) => {
    const res = await fetchWithTimeout(`${API_URL}/api/products/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(res);
  },

  delete: async (id, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  USERS API (Admin only)
// ================================================================

export const users = {
  getAll: async (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/users${query ? `?${query}` : ''}`;
    const res = await fetchWithTimeout(url, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  getById: async (id, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/users/${id}`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  update: async (id, userData, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/users/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  delete: async (id, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  getStats: async (token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/users/stats`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  NOTIFICATIONS API
// ================================================================

export const notifications = {
  getForUser: async (userId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/notifications/${userId}`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  getForAdmin: async (token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/notifications/admin`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  create: async (data, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/notifications`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  markRead: async (id, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/notifications/${id}/read`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  delete: async (id, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  ORDERS API
// ================================================================

export const orders = {
  getAll: async (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/orders${query ? `?${query}` : ''}`;
    const res = await fetchWithTimeout(url, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  getById: async (id, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/orders/${id}`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  create: async (orderData, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/orders`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify(orderData),
    });
    return handleResponse(res);
  },

  update: async (id, updates, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/orders/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  delete: async (id, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/orders/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  MESSAGES API
// ================================================================

export const messages = {
  getForUser: async (userId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/messages/${userId}`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  getConversations: async (token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/messages/conversations`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  getConversation: async (otherUserId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/messages/conversation/${otherUserId}`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  send: async (receiver, message, productId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/messages`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify({ receiver, message, productId }),
    });
    return handleResponse(res);
  },

  markRead: async (messageId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/messages/${messageId}/read`, {
      method: "PUT",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  delete: async (messageId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/messages/${messageId}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  FAVORITES / WISHLIST
// ================================================================

export const favorites = {
  getAll: async (token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/favorites`, {
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  add: async (productId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/favorites`, {
      method: "POST",
      credentials: "include",
      headers: getHeaders(token),
      body: JSON.stringify({ productId }),
    });
    return handleResponse(res);
  },

  remove: async (productId, token) => {
    const res = await fetchWithTimeout(`${API_URL}/api/favorites/${productId}`, {
      method: "DELETE",
      credentials: "include",
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  NAMED EXPORTS (convenience)
// ================================================================

export const login = auth.login;
export const register = auth.register;
export const getMe = auth.getMe;
export const logout = auth.logout;

export const getProducts = products.getAll;
export const getProduct = products.getById;
export const createProduct = products.create;
export const createProductWithFiles = products.createWithFiles;
export const updateProduct = products.update;
export const updateProductWithFiles = products.updateWithFiles;
export const deleteProduct = products.delete;

export const getUsers = users.getAll;
export const getUser = users.getById;
export const updateUser = users.update;
export const deleteUser = users.delete;
export const getUserStats = users.getStats;

export const getNotifications = notifications.getForUser;
export const getAdminNotifications = notifications.getForAdmin;
export const createNotification = notifications.create;
export const markNotificationRead = notifications.markRead;
export const deleteNotification = notifications.delete;

export const getOrders = orders.getAll;
export const getOrder = orders.getById;
export const createOrder = orders.create;
export const updateOrder = orders.update;
export const deleteOrder = orders.delete;

export const getMessages = messages.getForUser;
export const getConversations = messages.getConversations;
export const getConversation = messages.getConversation;
export const sendMessage = messages.send;
export const markMessageRead = messages.markRead;
export const deleteMessage = messages.delete;

export const getFavorites = favorites.getAll;
export const addFavorite = favorites.add;
export const removeFavorite = favorites.remove;

// ================================================================
//  DEFAULT EXPORT
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
};

export default api;

export { API_URL };