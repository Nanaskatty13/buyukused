// ================================================================
//  IMPORTS (must be at the top)
// ================================================================

import { getToken } from '../utils/storage'; // ✅ kept, but moved to top

// ================================================================
//  API CONFIG
// ================================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('🔗 API_URL:', API_URL);

const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }
  return data;
};

// ================================================================
//  AUTH API
// ================================================================

export const auth = {
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
  register: async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
  getMe: async (token) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
  logout: async (token) => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
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
    const res = await fetch(url);
    return handleResponse(res);
  },
  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/products/${id}`);
    return handleResponse(res);
  },
  create: async (productData, token) => {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },
  createWithFiles: async (formData, token) => {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return handleResponse(res);
  },
  update: async (id, productData, token) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
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
    const res = await fetch(url, { headers: getHeaders(token) });
    return handleResponse(res);
  },
  getById: async (id, token) => {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
  update: async (id, userData, token) => {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
  getStats: async (token) => {
    const res = await fetch(`${API_URL}/api/users/stats`, {
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
    const res = await fetch(`${API_URL}/api/notifications/${userId}`, {
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
  getForAdmin: async (token) => {
    const res = await fetch(`${API_URL}/api/notifications/admin`, {
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
  create: async (data, token) => {
    const res = await fetch(`${API_URL}/api/notifications`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
  markRead: async (id, token) => {
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
  delete: async (id, token) => {
    const res = await fetch(`${API_URL}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// ================================================================
//  NAMED EXPORTS FOR CONVENIENCE
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

// ================================================================
//  DEFAULT EXPORT
// ================================================================

export default {
  auth,
  products,
  users,
  notifications,
  login,
  register,
  getMe,
  logout,
  getProducts,
  getProduct,
  createProduct,
  createProductWithFiles,
  updateProduct,
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
};

// ================================================================
//  EXPORT API_URL
// ================================================================

export { API_URL };