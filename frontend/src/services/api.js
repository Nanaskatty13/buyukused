// ================================================================
// frontend/src/services/api.js
// BuyUKUsed API Service
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

export const API_URL = String(RAW_API_URL).replace(
  /\/+$/,
  ""
);

console.log("🔗 API_URL:", API_URL);

// ================================================================
// REQUEST CONFIG
// ================================================================

const REQUEST_TIMEOUT = 30000;
const MAX_RETRIES = 2;

// ================================================================
// AUTH HELPERS
// ================================================================

const hasUsableToken = (token) => {
  return (
    typeof token === "string" &&
    token.trim().length > 0
  );
};

// ================================================================
// JSON HEADERS
// ================================================================

const getHeaders = (token = getToken()) => {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (hasUsableToken(token)) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  return headers;
};

// ================================================================
// FILE / FORMDATA HEADERS
// ================================================================

const getFileHeaders = (token = getToken()) => {
  const headers = {
    Accept: "application/json",
  };

  if (hasUsableToken(token)) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  return headers;
};

// ================================================================
// RESPONSE HANDLER (ENHANCED)
// ================================================================

const handleResponse = async (response) => {
  let data = {};

  if (response.status !== 204) {
    const contentType =
      response.headers.get("content-type") || "";

    try {
      if (
        contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          data = { message: text, raw: text };
        }
      }
    } catch (parseError) {
      console.warn(
        "⚠️ Could not parse API response:",
        parseError
      );
      data = {};
    }
  }

  if (!response.ok) {
    if (response.status === 400) {
      console.error(
        "❌ 400 Bad Request - Full response:",
        {
          status: response.status,
          url: response.url,
          data: data,
        }
      );
    }

    const message =
      data?.message ||
      data?.error ||
      data?.errors?.[0]?.message ||
      data?.raw ||
      `HTTP ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    error.url = response.url;

    if (response.status === 401) {
      error.isAuthError = true;
    }

    throw error;
  }

  return data;
};

// ================================================================
// SLEEP
// ================================================================

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// ================================================================
// REQUEST HELPER
// ================================================================

const request = async (
  url,
  options = {},
  retries = MAX_RETRIES
) => {
  let controller;
  let timeoutId;

  try {
    controller = new AbortController();

    timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    const latestToken = getToken();

    const incomingHeaders =
      options.headers || {};

    const isFormData =
      typeof FormData !== "undefined" &&
      options.body instanceof FormData;

    let headers;

    if (isFormData) {
      headers = {
        ...incomingHeaders,
      };

      if (
        !headers.Authorization &&
        !headers.authorization &&
        hasUsableToken(latestToken)
      ) {
        headers.Authorization =
          `Bearer ${latestToken.trim()}`;
      }

      delete headers["Content-Type"];
      delete headers["content-type"];
    } else {
      headers = {
        ...incomingHeaders,
      };

      if (
        !headers["Content-Type"] &&
        !headers["content-type"]
      ) {
        headers["Content-Type"] =
          "application/json";
      }

      if (
        !headers.Accept &&
        !headers.accept
      ) {
        headers.Accept =
          "application/json";
      }

      if (
        !headers.Authorization &&
        !headers.authorization &&
        hasUsableToken(latestToken)
      ) {
        headers.Authorization =
          `Bearer ${latestToken.trim()}`;
      }
    }

    if (url.includes("/reviews")) {
      console.log("⭐ Review API request");
      console.log("➡️ URL:", url);

      console.log(
        "🔐 Token available:",
        hasUsableToken(latestToken)
      );

      console.log(
        "🔐 Token length:",
        hasUsableToken(latestToken)
          ? latestToken.length
          : 0
      );

      console.log(
        "🔐 Authorization header:",
        headers.Authorization ||
          headers.authorization
          ? "Bearer [PRESENT]"
          : "[MISSING]"
      );

      if (
        options.body &&
        typeof options.body === "string"
      ) {
        try {
          console.log(
            "⭐ Review request body:",
            JSON.parse(options.body)
          );
        } catch {
          console.log(
            "⭐ Review request body:",
            options.body
          );
        }
      }
    }

    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
      signal:
        options.signal ||
        controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      console.error(
        "🔐 401 Unauthorized:",
        url
      );

      console.error(
        "🔐 Token available:",
        hasUsableToken(latestToken)
      );
    }

    return await handleResponse(response);
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const isAbortError =
      error?.name === "AbortError";

    if (isAbortError) {
      if (retries > 0) {
        console.warn(
          `⏳ API timeout. Retrying... ${retries} attempt(s) left`,
          url
        );

        await sleep(1500);

        return request(
          url,
          options,
          retries - 1
        );
      }

      const timeoutError = new Error(
        "The server took too long to respond."
      );

      timeoutError.code =
        "REQUEST_TIMEOUT";

      timeoutError.url = url;

      console.error(
        "❌ API timeout:",
        url
      );

      throw timeoutError;
    }

    const isNetworkError =
      error?.name === "TypeError" ||
      error?.message === "Failed to fetch";

    if (
      isNetworkError &&
      retries > 0
    ) {
      console.warn(
        `🔄 Network error. Retrying... ${retries} attempt(s) left`,
        url
      );

      await sleep(1000);

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
  const searchParams =
    new URLSearchParams();

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
        String(value).toLowerCase() ===
          "all"
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

  const cleanPath =
    path.trim();

  if (!cleanPath) {
    return "/placeholder.png";
  }

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

  if (
    cleanPath.startsWith("data:")
  ) {
    return cleanPath;
  }

  if (
    cleanPath.startsWith("blob:")
  ) {
    return cleanPath;
  }

  return `${API_URL}${
    cleanPath.startsWith("/")
      ? cleanPath
      : `/${cleanPath}`
  }`;
};

// ================================================================
// HEALTH
// ================================================================

export const health = {
  check: async () => {
    return request(
      `${API_URL}/health`,
      {
        method: "GET",
      }
    );
  },
};

// ================================================================
// AUTH
// ================================================================

export const auth = {
  login: async (
    email,
    password
  ) => {
    console.log(
      "🔐 Login request:",
      `${API_URL}/auth/login`
    );

    return request(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          Accept:
            "application/json",
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
          Accept:
            "application/json",
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
    if (!hasUsableToken(token)) {
      const error = new Error(
        "Authentication token is missing."
      );

      error.status = 401;
      error.isAuthError = true;

      throw error;
    }

    console.log(
      "🔎 Checking:",
      `${API_URL}/auth/me`
    );

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
    if (!hasUsableToken(token)) {
      clearAuthData();

      return {
        success: true,
      };
    }

    try {
      return await request(
        `${API_URL}/auth/logout`,
        {
          method: "POST",
          headers:
            getHeaders(token),
        }
      );
    } finally {
      clearAuthData();
    }
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
      }
    );
  },

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
      }
    );
  },

  create: async (
    productData,
    token = getToken()
  ) => {
    if (!hasUsableToken(token)) {
      const error = new Error(
        "Authentication token is missing."
      );

      error.status = 401;

      throw error;
    }

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
    if (!hasUsableToken(token)) {
      const error = new Error(
        "Authentication token is missing."
      );

      error.status = 401;

      throw error;
    }

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
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

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
          getFileHeaders(token),
        body: formData,
      }
    );
  },

  delete: async (
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
// NOTIFICATIONS
// ================================================================

export const notifications = {
  getForUser: async (
    userId,
    token = getToken()
  ) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

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
        body: JSON.stringify(data),
      }
    );
  },

  markRead: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Notification ID is required"
      );
    }

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
    if (!id) {
      throw new Error(
        "Notification ID is required"
      );
    }

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

  unreadCount: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/notifications/unread-count`,
      {
        method: "GET",
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
    if (!id) {
      throw new Error(
        "Order ID is required"
      );
    }

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
    if (!id) {
      throw new Error(
        "Order ID is required"
      );
    }

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
    if (!id) {
      throw new Error(
        "Order ID is required"
      );
    }

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
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

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
    if (!otherUserId) {
      throw new Error(
        "Other user ID is required"
      );
    }

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
    if (!messageId) {
      throw new Error(
        "Message ID is required"
      );
    }

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
    if (!messageId) {
      throw new Error(
        "Message ID is required"
      );
    }

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

  unreadCount: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/messages/unread-count`,
      {
        method: "GET",
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
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

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
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

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
// REVIEWS
// ================================================================

export const reviews = {
  getAll: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/reviews${query}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getSellerReviews: async (
    sellerId,
    params = {},
    token = getToken()
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    const query =
      buildQuery({
        sellerId,
        ...params,
      });

    return request(
      `${API_URL}/api/reviews${query}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getProductReviews: async (
    productId,
    params = {},
    token = getToken()
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const query =
      buildQuery({
        productId,
        ...params,
      });

    return request(
      `${API_URL}/api/reviews${query}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  create: async (
    reviewData = {},
    token = getToken()
  ) => {
    if (!hasUsableToken(token)) {
      const error = new Error(
        "Authentication token is missing."
      );

      error.status = 401;
      error.isAuthError = true;

      console.error(
        "🔐 Cannot create review: token missing."
      );

      throw error;
    }

    const data =
      reviewData &&
      typeof reviewData === "object"
        ? reviewData
        : {};

    const rawReviewType =
      data.type ??
      data.reviewType ??
      data.review_type ??
      "";

    const reviewType = String(
      rawReviewType
    )
      .trim()
      .toUpperCase();

    console.log(
      "🔎 Raw review type:",
      rawReviewType
    );

    console.log(
      "🔎 Normalized review type:",
      reviewType
    );

    if (
      reviewType !== "PRODUCT" &&
      reviewType !== "SELLER"
    ) {
      const error = new Error(
        "Review type must be PRODUCT or SELLER."
      );

      error.code =
        "INVALID_REVIEW_TYPE";

      error.data = {
        received:
          rawReviewType,
        normalized:
          reviewType,
        reviewData: data,
      };

      console.error(
        "❌ Invalid review type:",
        error.data
      );

      throw error;
    }

    const sellerId =
      data.sellerId ??
      data.seller_id ??
      "";

    if (
      !sellerId ||
      String(sellerId).trim() === ""
    ) {
      throw new Error(
        "Seller ID is required"
      );
    }

    const productId =
      data.productId ??
      data.product_id ??
      null;

    if (
      reviewType === "PRODUCT" &&
      (!productId ||
        String(productId).trim() === "")
    ) {
      throw new Error(
        "Product ID is required for a product review."
      );
    }

    const rating =
      Number(data.rating);

    if (
      data.rating ===
        undefined ||
      data.rating === null ||
      data.rating === ""
    ) {
      throw new Error(
        "Rating is required"
      );
    }

    if (
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      throw new Error(
        "Rating must be between 1 and 5"
      );
    }

    const comment =
      String(
        data.comment ??
        data.text ??
        ""
      ).trim();

    if (!comment) {
      throw new Error(
        "Review comment is required"
      );
    }

    const orderId =
      data.orderId ??
      data.order_id ??
      null;

    const payload = {
      type: reviewType,
      reviewType: reviewType,
      review_type: reviewType,

      sellerId: String(sellerId).trim(),
      seller: String(sellerId).trim(),

      rating,
      comment,
      text: comment,

      ...(productId && String(productId).trim()
        ? {
            productId: String(productId).trim(),
            product: String(productId).trim(),
            product_id: String(productId).trim(),
          }
        : {}),

      ...(orderId && String(orderId).trim()
        ? {
            orderId: String(orderId).trim(),
            order: String(orderId).trim(),
            order_id: String(orderId).trim(),
          }
        : {}),
    };

    console.log(
      "⭐ Creating review"
    );

    console.log(
      "⭐ Review type:",
      payload.type
    );

    console.log(
      "⭐ Seller ID:",
      payload.sellerId
    );

    console.log(
      "⭐ Product ID:",
      payload.productId ||
        "none"
    );

    console.log(
      "⭐ Order ID:",
      payload.orderId ||
        "none"
    );

    console.log(
      "⭐ Rating:",
      payload.rating
    );

    console.log(
      "⭐ Comment:",
      payload.comment
    );

    console.log(
      "⭐ Auth token:",
      hasUsableToken(token)
        ? "PRESENT"
        : "MISSING"
    );

    console.log(
      "⭐ FINAL REVIEW PAYLOAD:",
      payload
    );

    return request(
      `${API_URL}/api/reviews`,
      {
        method: "POST",
        headers:
          getHeaders(token),
        body: JSON.stringify(
          payload
        ),
      }
    );
  },

  update: async (
    id,
    reviewData = {},
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Review ID is required"
      );
    }

    const payload = {};

    if (
      reviewData?.rating !==
      undefined
    ) {
      const rating =
        Number(
          reviewData.rating
        );

      if (
        !Number.isFinite(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        throw new Error(
          "Rating must be between 1 and 5"
        );
      }

      payload.rating = rating;
    }

    if (
      reviewData?.comment !==
      undefined
    ) {
      payload.comment =
        String(
          reviewData.comment
        ).trim();
    }

    return request(
      `${API_URL}/api/reviews/${encodeURIComponent(
        id
      )}`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
        body: JSON.stringify(
          payload
        ),
      }
    );
  },

  delete: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Review ID is required"
      );
    }

    return request(
      `${API_URL}/api/reviews/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers:
          getHeaders(token),
      }
    );
  },

  toggleHelpful: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Review ID is required"
      );
    }

    return request(
      `${API_URL}/api/reviews/${encodeURIComponent(
        id
      )}/helpful`,
      {
        method: "POST",
        headers:
          getHeaders(token),
      }
    );
  },

  report: async (
    id,
    reason = "Inappropriate content",
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Review ID is required"
      );
    }

    const cleanReason =
      String(
        reason ||
          "Inappropriate content"
      ).trim();

    return request(
      `${API_URL}/api/reviews/${encodeURIComponent(
        id
      )}/report`,
      {
        method: "POST",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          reason:
            cleanReason,
        }),
      }
    );
  },

  reply: async (
    id,
    text,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Review ID is required"
      );
    }

    const cleanText =
      String(text || "").trim();

    if (!cleanText) {
      throw new Error(
        "Reply is required"
      );
    }

    return request(
      `${API_URL}/api/reviews/${encodeURIComponent(
        id
      )}/reply`,
      {
        method: "POST",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          text: cleanText,
        }),
      }
    );
  },

  deleteReply: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Review ID is required"
      );
    }

    return request(
      `${API_URL}/api/reviews/${encodeURIComponent(
        id
      )}/reply`,
      {
        method: "DELETE",
        headers:
          getHeaders(token),
      }
    );
  },

  getSellerSummary: async (
    sellerId,
    token = getToken()
  ) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return request(
      `${API_URL}/api/reviews/seller/${encodeURIComponent(
        sellerId
      )}/summary`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getProductSummary: async (
    productId,
    token = getToken()
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    return request(
      `${API_URL}/api/reviews/product/${encodeURIComponent(
        productId
      )}/summary`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// ADMIN
// ================================================================

export const admin = {
  getDashboardStats: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/admin/dashboard`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getUsers: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/admin/users${query}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getUserById: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "User ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/users/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  updateUserRole: async (
    id,
    role,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "User ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/users/${encodeURIComponent(
        id
      )}/role`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          role,
        }),
      }
    );
  },

  deleteUser: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "User ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/users/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers:
          getHeaders(token),
      }
    );
  },

  getProducts: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/admin/products${query}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  deleteProduct: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Product ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/products/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers:
          getHeaders(token),
      }
    );
  },

  getOrders: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/admin/orders${query}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  updateOrderStatus: async (
    id,
    status,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Order ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/orders/${encodeURIComponent(
        id
      )}/status`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          status,
        }),
      }
    );
  },

  getRiders: async (
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
  },

  getRiderById: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/riders/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  approveRider: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/riders/${encodeURIComponent(
        id
      )}/approve`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
      }
    );
  },

  rejectRider: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/riders/${encodeURIComponent(
        id
      )}/reject`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
      }
    );
  },

  updateRiderApproval: async (
    id,
    isApproved,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/riders/${encodeURIComponent(
        id
      )}/approval`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          isApproved:
            Boolean(isApproved),
        }),
      }
    );
  },

  deleteRider: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Rider ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/riders/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
        headers:
          getHeaders(token),
      }
    );
  },

  getDeliveries: async (
    params = {},
    token = getToken()
  ) => {
    const query =
      buildQuery(params);

    return request(
      `${API_URL}/api/admin/deliveries${query}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getDeliveryById: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Delivery ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/deliveries/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  updateDeliveryStatus: async (
    id,
    status,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Delivery ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/deliveries/${encodeURIComponent(
        id
      )}/status`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          status,
        }),
      }
    );
  },

  getUnverifiedSellers: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/admin/sellers/unverified`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  verifySeller: async (
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
        method: "PUT",
        headers:
          getHeaders(token),
      }
    );
  },

  // ============================================================
  // ✅ NEW: Verify a specific user (admin only)
  // ============================================================
  verifyUserById: async (
    userId,
    token = getToken()
  ) => {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    return request(
      `${API_URL}/api/admin/users/${encodeURIComponent(
        userId
      )}/verify`,
      {
        method: "PUT",
        headers:
          getHeaders(token),
      }
    );
  },
};

// ================================================================
// DELIVERY
// ================================================================

export const deliveries = {
  create: async (
    deliveryData,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/deliveries`,
      {
        method: "POST",
        headers:
          getHeaders(token),
        body: JSON.stringify(
          deliveryData
        ),
      }
    );
  },

  getCustomerDeliveries: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/deliveries/customer`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getAvailable: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/deliveries/available`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getMy: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/deliveries/my`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  getRiderDeliveries: async (
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/deliveries/rider`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  updateAvailability: async (
    isAvailable,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/deliveries/rider/availability`,
      {
        method: "PATCH",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          isAvailable:
            Boolean(isAvailable),
        }),
      }
    );
  },

  toggleAvailability: async (
    isAvailable,
    token = getToken()
  ) => {
    return request(
      `${API_URL}/api/deliveries/rider/availability`,
      {
        method: "PATCH",
        headers:
          getHeaders(token),
        body: JSON.stringify({
          isAvailable:
            Boolean(isAvailable),
        }),
      }
    );
  },

  accept: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Delivery ID is required"
      );
    }

    return request(
      `${API_URL}/api/deliveries/${encodeURIComponent(
        id
      )}/accept`,
      {
        method: "PATCH",
        headers:
          getHeaders(token),
      }
    );
  },

  updateStatus: async (
    id,
    status,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Delivery ID is required"
      );
    }

    return request(
      `${API_URL}/api/deliveries/${encodeURIComponent(
        id
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

  updateLocation: async (
    id,
    location,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Delivery ID is required"
      );
    }

    return request(
      `${API_URL}/api/deliveries/${encodeURIComponent(
        id
      )}/location`,
      {
        method: "PATCH",
        headers:
          getHeaders(token),
        body: JSON.stringify(
          location
        ),
      }
    );
  },

  getById: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Delivery ID is required"
      );
    }

    return request(
      `${API_URL}/api/deliveries/${encodeURIComponent(
        id
      )}`,
      {
        method: "GET",
        headers:
          getHeaders(token),
      }
    );
  },

  cancel: async (
    id,
    token = getToken()
  ) => {
    if (!id) {
      throw new Error(
        "Delivery ID is required"
      );
    }

    return request(
      `${API_URL}/api/deliveries/${encodeURIComponent(
        id
      )}/cancel`,
      {
        method: "PATCH",
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

export const getSellerProducts =
  async (sellerId) => {
    if (!sellerId) {
      throw new Error(
        "Seller ID is required"
      );
    }

    return products.getAll({
      sellerId,
    });
  };

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
  notifications.getForUser;

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

export const getNotificationUnreadCount =
  notifications.unreadCount;

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

export const getMessageUnreadCount =
  messages.unreadCount;

// ================================================================
// FAVORITES
// ================================================================

export const getFavorites =
  favorites.getAll;

export const addFavorite =
  favorites.add;

export const removeFavorite =
  favorites.remove;

// ================================================================
// REVIEW EXPORTS
// ================================================================

export const getReviews =
  reviews.getAll;

export const getSellerReviews =
  reviews.getSellerReviews;

export const getProductReviews =
  reviews.getProductReviews;

export const createReview =
  reviews.create;

export const updateReview =
  reviews.update;

export const deleteReview =
  reviews.delete;

export const toggleReviewHelpful =
  reviews.toggleHelpful;

export const reportReview =
  reviews.report;

export const replyToReview =
  reviews.reply;

export const deleteReviewReply =
  reviews.deleteReply;

export const getSellerReviewSummary =
  reviews.getSellerSummary;

export const getProductReviewSummary =
  reviews.getProductSummary;

// ================================================================
// ADMIN EXPORTS
// ================================================================

export const getAdminDashboardStats =
  admin.getDashboardStats;

export const getAdminUsers =
  admin.getUsers;

export const getAdminUserById =
  admin.getUserById;

export const updateAdminUserRole =
  admin.updateUserRole;

export const deleteAdminUser =
  admin.deleteUser;

export const getAdminProducts =
  admin.getProducts;

export const deleteAdminProduct =
  admin.deleteProduct;

export const getAdminOrders =
  admin.getOrders;

export const updateAdminOrderStatus =
  admin.updateOrderStatus;

export const getRiders =
  admin.getRiders;

export const getRiderById =
  admin.getRiderById;

export const approveRider =
  admin.approveRider;

export const rejectRider =
  admin.rejectRider;

export const updateRiderApproval =
  admin.updateRiderApproval;

export const deleteRider =
  admin.deleteRider;

export const getAdminDeliveries =
  admin.getDeliveries;

export const getAdminDeliveryById =
  admin.getDeliveryById;

export const updateAdminDeliveryStatus =
  admin.updateDeliveryStatus;

export const getUnverifiedSellers =
  admin.getUnverifiedSellers;

export const verifySeller =
  admin.verifySeller;

// ================================================================
// ✅ NEW EXPORT: Admin verification of a user
// ================================================================
export const verifyUserById = admin.verifyUserById;

// ================================================================
// DELIVERY EXPORTS
// ================================================================

export const createDelivery =
  deliveries.create;

export const getCustomerDeliveries =
  deliveries.getCustomerDeliveries;

export const getAvailableDeliveries =
  deliveries.getAvailable;

export const getMyDeliveries =
  deliveries.getMy;

export const getRiderDeliveries =
  deliveries.getRiderDeliveries;

export const updateRiderAvailability =
  deliveries.updateAvailability;

export const toggleRiderAvailability =
  deliveries.toggleAvailability;

export const acceptDelivery =
  deliveries.accept;

export const updateDeliveryStatus =
  deliveries.updateStatus;

export const updateDeliveryLocation =
  deliveries.updateLocation;

export const getDelivery =
  deliveries.getById;

export const cancelDelivery =
  deliveries.cancel;

// ================================================================
// DEFAULT API OBJECT
// ================================================================

const api = {
  API_URL,

  health,

  auth,

  products,

  users,

  notifications,

  orders,

  messages,

  favorites,

  reviews,

  admin,

  deliveries,

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
  getSellerProducts,

  getUsers,
  getUser,
  updateUser,
  updateUserWithFiles,
  deleteUser,
  getUserStats,

  getNotifications,
  getAdminNotifications,
  getUserNotifications,
  createNotification,
  markNotificationRead,
  deleteNotification,
  getNotificationUnreadCount,

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
  getMessageUnreadCount,

  getFavorites,
  addFavorite,
  removeFavorite,

  getReviews,
  getSellerReviews,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleReviewHelpful,
  reportReview,
  replyToReview,
  deleteReviewReply,
  getSellerReviewSummary,
  getProductReviewSummary,

  getAdminDashboardStats,
  getAdminUsers,
  getAdminUserById,
  updateAdminUserRole,
  deleteAdminUser,
  getAdminProducts,
  deleteAdminProduct,
  getAdminOrders,
  updateAdminOrderStatus,

  getRiders,
  getRiderById,
  approveRider,
  rejectRider,
  updateRiderApproval,
  deleteRider,

  getAdminDeliveries,
  getAdminDeliveryById,
  updateAdminDeliveryStatus,

  getUnverifiedSellers,
  verifySeller,

  verifyUserById, // ✅ added

  createDelivery,
  getCustomerDeliveries,
  getAvailableDeliveries,
  getMyDeliveries,
  getRiderDeliveries,
  updateRiderAvailability,
  toggleRiderAvailability,
  acceptDelivery,
  updateDeliveryStatus,
  updateDeliveryLocation,
  getDelivery,
  cancelDelivery,

  getImageUrl,
  getToken,
  clearAuthData,
};

export default api;