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
// TOKEN
// ============================================================

const getToken = () => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      "";

    return token.trim();
  } catch (error) {
    console.error(
      "❌ Could not read authentication token:",
      error
    );

    return "";
  }
};

// ============================================================
// AUTH CONFIG
// ============================================================

const authConfig = () => {
  const token = getToken();

  if (!token) {
    console.warn(
      "⚠️ No authentication token found for delivery request."
    );
  }

  return {
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },

    // Safe even though the application primarily uses JWT.
    withCredentials: true,
  };
};

// ============================================================
// ERROR HANDLER
// ============================================================

const handleDeliveryError = (error, operation) => {
  console.error(
    `❌ Delivery ${operation} failed:`,
    error
  );

  if (error?.response) {
    console.error(
      `❌ Delivery ${operation} status:`,
      error.response.status
    );

    console.error(
      `❌ Delivery ${operation} response:`,
      error.response.data
    );

    const message =
      error.response.data?.message ||
      `Delivery request failed with status ${error.response.status}`;

    const enhancedError = new Error(message);

    enhancedError.status =
      error.response.status;

    enhancedError.data =
      error.response.data;

    throw enhancedError;
  }

  if (error?.request) {
    const enhancedError = new Error(
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
// Buyers AND sellers can create delivery requests.
//
// POST /api/deliveries
//
// ============================================================

export const createDelivery = async (
  deliveryData
) => {
  const token = getToken();

  if (!token) {
    throw new Error(
      "You must be logged in before booking a rider."
    );
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/deliveries`,
      deliveryData,
      authConfig()
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
//
// GET /api/deliveries/customer
//
// ============================================================

export const getCustomerDeliveries =
  async () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "You must be logged in to view your deliveries."
      );
    }

    try {
      const response =
        await axios.get(
          `${API_URL}/api/deliveries/customer`,
          authConfig()
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
// Rider only.
//
// GET /api/deliveries/available
//
// ============================================================

export const getAvailableDeliveries =
  async () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "You must be logged in as a rider."
      );
    }

    try {
      const response =
        await axios.get(
          `${API_URL}/api/deliveries/available`,
          authConfig()
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
// GET /api/deliveries/my
//
// Rider only.
//
// ============================================================

export const getRiderDeliveries =
  async () => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "You must be logged in as a rider."
      );
    }

    try {
      const response =
        await axios.get(
          `${API_URL}/api/deliveries/my`,
          authConfig()
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
//
// GET /api/deliveries/:id
//
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
        await axios.get(
          `${API_URL}/api/deliveries/${deliveryId}`,
          authConfig()
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
// PATCH /api/deliveries/:id/accept
//
// Rider only.
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
        await axios.patch(
          `${API_URL}/api/deliveries/${deliveryId}/accept`,
          {},
          authConfig()
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
// PATCH /api/deliveries/:id/status
//
// Rider only.
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
        await axios.patch(
          `${API_URL}/api/deliveries/${deliveryId}/status`,
          {
            status,
          },
          authConfig()
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
// PATCH /api/deliveries/rider/availability
//
// Rider only.
//
// ============================================================

export const toggleRiderAvailability =
  async (
    isAvailable
  ) => {
    try {
      const response =
        await axios.patch(
          `${API_URL}/api/deliveries/rider/availability`,
          {
            isAvailable:
              Boolean(isAvailable),
          },
          authConfig()
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
// PATCH /api/deliveries/:id/location
//
// Rider only.
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
        await axios.patch(
          `${API_URL}/api/deliveries/${deliveryId}/location`,
          location,
          authConfig()
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
//
// PATCH /api/deliveries/:id/cancel
//
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
        await axios.patch(
          `${API_URL}/api/deliveries/${deliveryId}/cancel`,
          {
            reason,
          },
          authConfig()
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