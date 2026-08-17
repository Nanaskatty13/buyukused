// frontend/src/services/deliveryService.js

import axios from "axios";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("🚴 Delivery API URL:", API_URL);

// ============================================================
// AUTH TOKEN
// ============================================================
//
// IMPORTANT:
//
// The application can have multiple old token keys in
// localStorage from previous versions.
//
// We use the current token first and remove stale duplicates
// when possible.
//
// ============================================================

const getToken = () => {
  try {
    const authToken =
      localStorage.getItem("authToken");

    const token =
      localStorage.getItem("token");

    const accessToken =
      localStorage.getItem("accessToken");

    // Prefer authToken because this is the dedicated
    // authentication key.
    if (
      authToken &&
      authToken.trim()
    ) {
      return authToken.trim();
    }

    if (
      token &&
      token.trim()
    ) {
      return token.trim();
    }

    if (
      accessToken &&
      accessToken.trim()
    ) {
      return accessToken.trim();
    }

    return "";
  } catch (error) {
    console.error(
      "❌ Could not read authentication token:",
      error
    );

    return "";
  }
};

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = () => {
  const token = getToken();

  if (!token) {
    console.warn(
      "⚠️ No authentication token available."
    );

    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ============================================================
// AXIOS INSTANCE
// ============================================================

const deliveryApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
//
// Every request gets the CURRENT token immediately before
// the request is sent.
//
// This prevents a token captured earlier from becoming stale.
//
// ============================================================

deliveryApi.interceptors.request.use(
  (config) => {
    const token = getToken();

    config.headers =
      config.headers || {};

    config.headers[
      "Content-Type"
    ] = "application/json";

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    console.log(
      "🚴 Delivery request:",
      config.method?.toUpperCase(),
      config.url,
      token
        ? "🔐 authenticated"
        : "⚠️ no token"
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

deliveryApi.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    const status =
      error?.response?.status;

    const message =
      error?.response?.data?.message;

    console.error(
      "❌ Delivery API error:",
      {
        status,
        message,
        url: error?.config?.url,
      }
    );

    // --------------------------------------------------------
    // AUTHENTICATION FAILURE
    // --------------------------------------------------------

    if (status === 401) {
      console.warn(
        "🔐 Delivery API rejected authentication."
      );

      console.warn(
        "🔐 Current token exists:",
        Boolean(getToken())
      );

      // Do NOT automatically delete the token here.
      //
      // AuthContext owns the application's login state.
      // Automatically deleting tokens here could log the user
      // out unexpectedly.
    }

    return Promise.reject(error);
  }
);

// ============================================================
// ERROR NORMALIZER
// ============================================================

const handleDeliveryError = (
  error,
  operation
) => {
  console.error(
    `❌ Delivery ${operation} failed:`,
    error
  );

  if (error?.response) {
    const status =
      error.response.status;

    const data =
      error.response.data;

    console.error(
      `❌ Delivery ${operation} status:`,
      status
    );

    console.error(
      `❌ Delivery ${operation} response:`,
      data
    );

    let message =
      data?.message ||
      `Delivery request failed with status ${status}.`;

    if (status === 401) {
      message =
        data?.message ||
        "Your login session is no longer valid. Please log in again.";
    }

    if (status === 403) {
      message =
        data?.message ||
        "You do not have permission to perform this delivery action.";
    }

    const enhancedError =
      new Error(message);

    enhancedError.status =
      status;

    enhancedError.data =
      data;

    throw enhancedError;
  }

  if (error?.request) {
    const enhancedError =
      new Error(
        "Could not connect to the delivery server."
      );

    enhancedError.status = 0;

    throw enhancedError;
  }

  throw error;
};

// ============================================================
// CREATE DELIVERY
// ============================================================
//
// Buyers and sellers can book delivery.
//
// POST /api/deliveries
//
// ============================================================

export const createDelivery =
  async (deliveryData) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "You must be logged in before booking a rider."
      );
    }

    try {
      console.log(
        "🚴 Creating delivery..."
      );

      const response =
        await deliveryApi.post(
          "/api/deliveries",
          deliveryData
        );

      console.log(
        "✅ Delivery created:",
        response.data
      );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "creation"
      );
    }
  };

// ============================================================
// CUSTOMER DELIVERY HISTORY
// ============================================================

export const getCustomerDeliveries =
  async () => {
    try {
      const response =
        await deliveryApi.get(
          "/api/deliveries/customer"
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "customer delivery history"
      );
    }
  };

// ============================================================
// AVAILABLE DELIVERIES
// ============================================================
//
// RIDER ONLY
//
// ============================================================

export const getAvailableDeliveries =
  async () => {
    try {
      const response =
        await deliveryApi.get(
          "/api/deliveries/available"
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "available deliveries"
      );
    }
  };

// ============================================================
// RIDER DELIVERIES
// ============================================================
//
// RIDER ONLY
//
// ============================================================

export const getRiderDeliveries =
  async () => {
    try {
      const response =
        await deliveryApi.get(
          "/api/deliveries/my"
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "rider deliveries"
      );
    }
  };

// ============================================================
// GET SINGLE DELIVERY
// ============================================================

export const getDelivery =
  async (deliveryId) => {
    if (!deliveryId) {
      throw new Error(
        "Delivery ID is required."
      );
    }

    try {
      const response =
        await deliveryApi.get(
          `/api/deliveries/${deliveryId}`
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "fetch"
      );
    }
  };

// ============================================================
// ACCEPT DELIVERY
// ============================================================
//
// RIDER ONLY
//
// ============================================================

export const acceptDelivery =
  async (deliveryId) => {
    if (!deliveryId) {
      throw new Error(
        "Delivery ID is required."
      );
    }

    try {
      const response =
        await deliveryApi.patch(
          `/api/deliveries/${deliveryId}/accept`,
          {}
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "acceptance"
      );
    }
  };

// ============================================================
// UPDATE DELIVERY STATUS
// ============================================================
//
// RIDER ONLY
//
// ============================================================

export const updateDeliveryStatus =
  async (
    deliveryId,
    status
  ) => {
    if (!deliveryId) {
      throw new Error(
        "Delivery ID is required."
      );
    }

    if (!status) {
      throw new Error(
        "Delivery status is required."
      );
    }

    try {
      const response =
        await deliveryApi.patch(
          `/api/deliveries/${deliveryId}/status`,
          {
            status,
          }
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "status update"
      );
    }
  };

// ============================================================
// TOGGLE RIDER AVAILABILITY
// ============================================================
//
// RIDER ONLY
//
// ============================================================

export const toggleRiderAvailability =
  async (isAvailable) => {
    try {
      const response =
        await deliveryApi.patch(
          "/api/deliveries/rider/availability",
          {
            isAvailable:
              Boolean(isAvailable),
          }
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "rider availability update"
      );
    }
  };

// ============================================================
// UPDATE RIDER LOCATION
// ============================================================
//
// RIDER ONLY
//
// ============================================================

export const updateRiderLocation =
  async (
    deliveryId,
    location
  ) => {
    if (!deliveryId) {
      throw new Error(
        "Delivery ID is required."
      );
    }

    if (!location) {
      throw new Error(
        "Location is required."
      );
    }

    try {
      const response =
        await deliveryApi.patch(
          `/api/deliveries/${deliveryId}/location`,
          location
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "rider location update"
      );
    }
  };

// ============================================================
// CANCEL DELIVERY
// ============================================================

export const cancelDelivery =
  async (
    deliveryId,
    reason = ""
  ) => {
    if (!deliveryId) {
      throw new Error(
        "Delivery ID is required."
      );
    }

    try {
      const response =
        await deliveryApi.patch(
          `/api/deliveries/${deliveryId}/cancel`,
          {
            reason,
          }
        );

      return response.data;
    } catch (error) {
      return handleDeliveryError(
        error,
        "cancellation"
      );
    }
  };

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  createDelivery,
  getCustomerDeliveries,
  getAvailableDeliveries,
  getRiderDeliveries,
  getDelivery,
  acceptDelivery,
  updateDeliveryStatus,
  toggleRiderAvailability,
  updateRiderLocation,
  cancelDelivery,
};