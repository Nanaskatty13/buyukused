// frontend/src/services/api.js

// ================================================================
// API CONFIG
// ================================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

console.log(
  "🔗 API_URL:",
  API_URL
);

// ================================================================
// HEADERS
// ================================================================

const getHeaders = (token) => ({
  "Content-Type":
    "application/json",

  ...(token
    ? {
        Authorization:
          `Bearer ${token}`,
      }
    : {}),
});

// ================================================================
// RESPONSE HANDLER
// ================================================================

const handleResponse =
  async (response) => {
    let data = {};

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`
        );

      // Preserve HTTP status.
      // AuthContext uses this to distinguish
      // invalid authentication from network errors.
      error.status =
        response.status;

      throw error;
    }

    return data;
  };

// ================================================================
// FETCH HELPER
// ================================================================

const request = async (
  url,
  options = {}
) => {
  try {
    const response =
      await fetch(
        url,
        options
      );

    return await handleResponse(
      response
    );
  } catch (error) {
    console.error(
      `❌ API request failed: ${url}`,
      error
    );

    throw error;
  }
};

// ================================================================
// IMAGE URL HELPER
// ================================================================

export const getImageUrl = (
  path
) => {
  if (!path) {
    return "/placeholder.png";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  if (
    path.startsWith("data:")
  ) {
    return path;
  }

  return `${API_URL}${
    path.startsWith("/")
      ? path
      : `/${path}`
  }`;
};

// ================================================================
// AUTH API
// ================================================================

export const auth = {
  // ============================================================
  // LOGIN
  // ============================================================

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
          email,
          password,
        }),
      }
    );
  },

  // ============================================================
  // REGISTER
  // ============================================================

  register: async (
    userData
  ) => {
    return request(
      `${API_URL}/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          userData
        ),
      }
    );
  },

  // ============================================================
  // CURRENT USER
  // ============================================================

  getMe: async (
    token
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

  // ============================================================
  // LOGOUT
  // ============================================================

  logout: async (
    token
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
// PRODUCTS API
// ================================================================

export const products = {
  getAll: async (
    params = {}
  ) => {
    const query =
      new URLSearchParams(
        params
      ).toString();

    const url =
      `${API_URL}/api/products` +
      (query
        ? `?${query}`
        : "");

    return request(url);
  },

  getById: async (
    id
  ) => {
    return request(
      `${API_URL}/api/products/${id}`
    );
  },

  create: async (
    productData,
    token
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

  createWithFiles: async (
    formData,
    token
  ) => {
    return request(
      `${API_URL}/api/products`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      }
    );
  },

  updateWithFiles: async (
    id,
    formData,
    token
  ) => {
    return request(
      `${API_URL}/api/products/${id}`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      }
    );
  },

  update: async (
    id,
    productData,
    token
  ) => {
    return request(
      `${API_URL}/api/products/${id}`,
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

  delete: async (
    id,
    token
  ) => {
    return request(
      `${API_URL}/api/products/${id}`,
      {
        method: "DELETE",

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// USERS API
// ================================================================

export const users = {
  getAll: async (
    params = {},
    token
  ) => {
    const query =
      new URLSearchParams(
        params
      ).toString();

    const url =
      `${API_URL}/api/users` +
      (query
        ? `?${query}`
        : "");

    return request(
      url,
      {
        headers:
          getHeaders(token),
      }
    );
  },

  getById: async (
    id,
    token
  ) => {
    return request(
      `${API_URL}/api/users/${id}`,
      {
        headers:
          getHeaders(token),
      }
    );
  },

  update: async (
    id,
    userData,
    token
  ) => {
    return request(
      `${API_URL}/api/users/${id}`,
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

  delete: async (
    id,
    token
  ) => {
    return request(
      `${API_URL}/api/users/${id}`,
      {
        method: "DELETE",

        headers:
          getHeaders(token),
      }
    );
  },

  getStats: async (
    token
  ) => {
    return request(
      `${API_URL}/api/users/stats`,
      {
        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// NOTIFICATIONS API
// ================================================================

export const notifications = {
  getForUser: async (
    userId,
    token
  ) => {
    return request(
      `${API_URL}/api/notifications/${userId}`,
      {
        headers:
          getHeaders(token),
      }
    );
  },

  getForAdmin: async (
    token
  ) => {
    return request(
      `${API_URL}/api/notifications/admin`,
      {
        headers:
          getHeaders(token),
      }
    );
  },

  create: async (
    data,
    token
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

  markRead: async (
    id,
    token
  ) => {
    return request(
      `${API_URL}/api/notifications/${id}/read`,
      {
        method: "PUT",

        headers:
          getHeaders(token),
      }
    );
  },

  delete: async (
    id,
    token
  ) => {
    return request(
      `${API_URL}/api/notifications/${id}`,
      {
        method: "DELETE",

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// NAMED EXPORTS
// ================================================================

export const login =
  auth.login;

export const register =
  auth.register;

export const getMe =
  auth.getMe;

export const logout =
  auth.logout;

export const getProducts =
  products.getAll;

export const getProduct =
  products.getById;

export const createProduct =
  products.create;

export const createProductWithFiles =
  products.createWithFiles;

export const updateProductWithFiles =
  products.updateWithFiles;

export const updateProduct =
  products.update;

export const deleteProduct =
  products.delete;

export const getUsers =
  users.getAll;

export const getUser =
  users.getById;

export const updateUser =
  users.update;

export const deleteUser =
  users.delete;

export const getUserStats =
  users.getStats;

export const getNotifications =
  notifications.getForUser;

export const getAdminNotifications =
  notifications.getForAdmin;

export const createNotification =
  notifications.create;

export const markNotificationRead =
  notifications.markRead;

export const deleteNotification =
  notifications.delete;

// ================================================================
// DEFAULT EXPORT
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
  updateProductWithFiles,
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

  getImageUrl,
};

// ================================================================
// EXPORT API URL
// ================================================================

export {
  API_URL,
};