// ================================================================
// frontend/src/services/api.js
// BuyUKUsed API Service
// Complete API service for Auth, Products, Users, Sellers,
// Riders, Notifications, Orders, Messages, Favorites and Admin.
// ================================================================

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
// REQUEST CONFIG
// ================================================================

const REQUEST_TIMEOUT = 30000;
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
// Do not manually set Content-Type when sending FormData.

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
        options.signal ||
        controller.signal,
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
    // TIMEOUT
    // ------------------------------------------------------------

    if (isAbortError) {
      if (retries > 0) {
        console.warn(
          `⏳ Request timeout - retrying... ${retries} attempt(s) left`
        );

        await sleep(1500);

        return request(
          url,
          options,
          retries - 1
        );
      }

      const timeoutError = new Error(
        "The server is taking too long to respond. Please try again in a moment."
      );

      timeoutError.code = "REQUEST_TIMEOUT";
      timeoutError.url = url;

      throw timeoutError;
    }

    // ------------------------------------------------------------
    // NETWORK ERROR
    // ------------------------------------------------------------

    if (
      isNetworkError &&
      retries > 0
    ) {
      console.warn(
        `🔄 Network error - retrying... ${retries} attempt(s) left`
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
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

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

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
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

  // ------------------------------------------------------------
  // EXTERNAL URL / CLOUDINARY
  // ------------------------------------------------------------

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://")
  ) {
    if (
      cleanPath.includes(
        "res.cloudinary.com"
      ) &&
      cleanPath.includes(
        "/image/upload/"
      )
    ) {
      return cleanPath.replace(
        "/image/upload/",
        "/image/upload/f_auto,q_auto,w_600/"
      );
    }

    return cleanPath;
  }

  // ------------------------------------------------------------
  // BASE64
  // ------------------------------------------------------------

  if (
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  // ------------------------------------------------------------
  // BLOB
  // ------------------------------------------------------------

  if (
    cleanPath.startsWith("blob:")
  ) {
    return cleanPath;
  }

  // ------------------------------------------------------------
  // RELATIVE BACKEND PATH
  // ------------------------------------------------------------

  return `${API_URL}${
    cleanPath.startsWith("/")
      ? cleanPath
      : `/${cleanPath}`
  }`;
};

// ================================================================
// KEEP ALIVE
// ================================================================

export const startKeepAlive = (
  intervalMs = 10 * 60 * 1000
) => {
  const ping = () => {
    fetch(
      `${API_URL}/api/health`,
      {
        method: "HEAD",
      }
    ).catch(() => {});
  };

  ping();

  return setInterval(
    ping,
    intervalMs
  );
};

// ================================================================
// AUTH
// ================================================================

export const auth = {
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
          email: String(
            email || ""
          )
            .trim()
            .toLowerCase(),

          password: String(
            password || ""
          ),
        }),
      }
    );
  },

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

  getById: async (id) => {
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
        headers:
          getHeaders(token),
      }
    );
  },

  getById: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "User ID is required"
      );
    }

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

  update: async (
    id,
    userData,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "User ID is required"
      );
    }

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

        headers:
          getHeaders(token),
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

        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// SELLERS
// ================================================================

export const sellers = {
  // ------------------------------------------------------------
  // Register seller
  // ------------------------------------------------------------

  register: async (
    sellerData = {},
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/sellers/register`,
      {
        method: "POST",

        headers:
          getHeaders(token),

        body: JSON.stringify(
          sellerData
        ),
      }
    );
  },

  // ------------------------------------------------------------
  // Private seller profile
  // ------------------------------------------------------------

  getProfile: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/sellers/profile`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // ------------------------------------------------------------
  // Update seller profile
  // ------------------------------------------------------------

  updateProfile: async (
    sellerData = {},
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/sellers/profile`,
      {
        method: "PUT",

        headers:
          getHeaders(token),

        body: JSON.stringify(
          sellerData
        ),
      }
    );
  },

  // ------------------------------------------------------------
  // Seller dashboard
  // ------------------------------------------------------------

  getDashboard: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/sellers/dashboard${query}`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // ------------------------------------------------------------
  // My products
  // ------------------------------------------------------------

  getMyProducts: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/sellers/products${query}`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // ------------------------------------------------------------
  // Seller orders
  // ------------------------------------------------------------

  getOrders: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/sellers/orders${query}`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // ------------------------------------------------------------
  // Seller earnings
  // ------------------------------------------------------------

  getEarnings: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/sellers/earnings${query}`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  },

  // ------------------------------------------------------------
  // Public seller profile
  // ------------------------------------------------------------

  getPublicProfile: async (
    sellerId
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return request(
      `${API_URL}/api/sellers/${encodeURIComponent(
        sellerId
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

  // ------------------------------------------------------------
  // Public seller products
  // ------------------------------------------------------------

  getPublicProducts: async (
    sellerId,
    params = {}
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/sellers/${encodeURIComponent(
        sellerId
      )}/products${query}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      }
    );
  },
};

// ================================================================
// ADMIN SELLERS
// ================================================================

export const getSellers = async (
  params = {},
  token = getToken()
) => {
  const query =
    buildQuery(params);

  return request(
    `${API_URL}/api/admin/sellers${query}`,
    {
      method: "GET",

      headers:
        getHeaders(token),
    }
  );
};

// ================================================================
// GET SINGLE SELLER
// ================================================================

export const getSeller = async (
  sellerId,
  token = getToken()
) => {
  if (!sellerId) {
    throw new Error(
      "Seller ID is required"
    );
  }

  return request(
    `${API_URL}/api/admin/sellers/${encodeURIComponent(
      sellerId
    )}`,
    {
      method: "GET",

      headers:
        getHeaders(token),
    }
  );
};

// ================================================================
// GET UNVERIFIED SELLERS
// ================================================================

export const getUnverifiedSellers =
  async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/admin/sellers/unverified${query}`,
      {
        method: "GET",

        headers:
          getHeaders(token),
      }
    );
  };

// ================================================================
// VERIFY SELLER
// ================================================================

export const verifySeller = async (
  sellerId,
  token = getToken()
) => {
  if (!sellerId) {
    throw new Error(
      "Seller ID is required"
    );
  }

  return request(
    `${API_URL}/api/admin/sellers/${encodeURIComponent(
      sellerId
    )}/verify`,
    {
      method: "PATCH",

      headers:
        getHeaders(token),
    }
  );
};

// ================================================================
// REVOKE SELLER VERIFICATION
// ================================================================

export const revokeVerification =
  async (
    sellerId,
    token = getToken()
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/sellers/${encodeURIComponent(
        sellerId
      )}/verification`,
      {
        method: "DELETE",

        headers:
          getHeaders(token),
      }
    );
  };

// ================================================================
// RIDERS
// ================================================================

export const getRiders = async (
  params = {},
  token = getToken()
) => {
  const query =
    buildQuery(params);

  return request(
    `${API_URL}/api/admin/riders${query}`,
    {
      method: "GET",

      headers:
        getHeaders(token),
    }
  );
};

// ================================================================
// GET SINGLE RIDER
// ================================================================

export const getRider = async (
  riderId,
  token = getToken()
) => {
  if (!riderId) {
    throw new Error(
      "Rider ID is required"
    );
  }

  return request(
    `${API_URL}/api/admin/riders/${encodeURIComponent(
      riderId
    )}`,
    {
      method: "GET",

      headers:
        getHeaders(token),
    }
  );
};

// ================================================================
// APPROVE RIDER
// ================================================================

export const approveRider = async (
  riderId,
  token = getToken()
) => {
  if (!riderId) {
    throw new Error(
      "Rider ID is required"
    );
  }

  return request(
    `${API_URL}/api/admin/riders/${encodeURIComponent(
      riderId
    )}/approve`,
    {
      method: "PATCH",

      headers:
        getHeaders(token),
    }
  );
};

// ================================================================
// REJECT / REVOKE RIDER APPROVAL
// ================================================================

export const rejectRider = async (
  riderId,
  token = getToken()
) => {
  if (!riderId) {
    throw new Error(
      "Rider ID is required"
    );
  }

  return request(
    `${API_URL}/api/admin/riders/${encodeURIComponent(
      riderId
    )}/approve`,
    {
      method: "DELETE",

      headers:
        getHeaders(token),
    }
  );
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

        headers:
          getHeaders(token),
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

        headers:
          getHeaders(token),
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

        headers:
          getHeaders(token),
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

        headers:
          getHeaders(token),
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

        headers:
          getHeaders(token),

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

        headers:
          getHeaders(token),

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

export const login =
  auth.login;

export const register =
  auth.register;

export const getMe =
  auth.getMe;

export const logout =
  auth.logout;

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
// SELLER EXPORTS
// ================================================================

export const registerSeller =
  sellers.register;

export const getSellerProfile =
  sellers.getProfile;

export const updateSellerProfile =
  sellers.updateProfile;

export const getSellerDashboard =
  sellers.getDashboard;

export const getMyProducts =
  sellers.getMyProducts;

export const getSellerOrders =
  sellers.getOrders;

export const getSellerEarnings =
  sellers.getEarnings;

export const getPublicSellerProfile =
  sellers.getPublicProfile;

export const getPublicSellerProducts =
  sellers.getPublicProducts;

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
// ADMIN SELLER/RIDER EXPORTS
// ================================================================
//
// These are intentionally named exports because your admin
// components import them directly:
//
// import {
//   getRiders,
//   approveRider,
//   rejectRider,
//   getUnverifiedSellers,
//   revokeVerification
// } from "../../../services/api";
//
// ================================================================

// Already declared above:
// getSellers
// getSeller
// getUnverifiedSellers
// verifySeller
// revokeVerification
// getRiders
// getRider
// approveRider
// rejectRider

// ================================================================
// DEFAULT API OBJECT
// ================================================================

const api = {
  API_URL,

  // Helpers
  getImageUrl,
  getToken,
  clearAuthData,
  startKeepAlive,

  // Auth
  auth,
  login,
  register,
  getMe,
  logout,

  // Products
  products,
  getProducts,
  getProduct,
  createProduct,
  createProductWithFiles,
  updateProduct,
  updateProductWithFiles,
  deleteProduct,
  updateProductStatus,

  // Users
  users,
  getUsers,
  getUser,
  updateUser,
  updateUserWithFiles,
  deleteUser,
  getUserStats,

  // Sellers
  sellers,
  registerSeller,
  getSellerProfile,
  updateSellerProfile,
  getSellerDashboard,
  getMyProducts,
  getSellerOrders,
  getSellerEarnings,
  getPublicSellerProfile,
  getPublicSellerProducts,

  // Admin sellers
  getSellers,
  getSeller,
  getUnverifiedSellers,
  verifySeller,
  revokeVerification,

  // Riders
  getRiders,
  getRider,
  approveRider,
  rejectRider,

  // Notifications
  notifications,
  getNotifications,
  getAdminNotifications,
  getUserNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,

  // Orders
  orders,
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,

  // Messages
  messages,
  getMessages,
  getConversations,
  getConversation,
  sendMessage,
  markMessageRead,
  deleteMessage,

  // Favorites
  favorites,
  getFavorites,
  addFavorite,
  removeFavorite,
};

export default api;