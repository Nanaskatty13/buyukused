const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper to get auth headers
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

// === AUTH ===
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const register = async (userData) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const getMe = async (token) => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders(token),
  });
  return res.json();
};

export const logout = async (token) => {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(token),
  });
  return res.json();
};

// === PRODUCTS ===
export const getProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/products?${query}`);
  return res.json();
};

export const getProduct = async (id) => {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  return res.json();
};

export const createProduct = async (productData, token) => {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(productData),
  });
  return res.json();
};

export const updateProduct = async (id, productData, token) => {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(productData),
  });
  return res.json();
};

export const deleteProduct = async (id, token) => {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return res.json();
};

// === NOTIFICATIONS ===
export const getNotifications = async (userId, token) => {
  const res = await fetch(`${API_URL}/api/notifications/${userId}`, {
    headers: getHeaders(token),
  });
  return res.json();
};

export const markNotificationRead = async (id, token) => {
  const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders(token),
  });
  return res.json();
};

export const createNotification = async (data, token) => {
  const res = await fetch(`${API_URL}/api/notifications`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return res.json();
};