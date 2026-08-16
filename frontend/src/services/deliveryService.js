// frontend/src/services/deliveryService.js

import axios from "axios";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

// ============================================================
// AUTH
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
};

// ============================================================
// CREATE DELIVERY
// ============================================================

export const createDelivery = async (
  deliveryData
) => {
  const response =
    await axios.post(
      `${API_URL}/api/deliveries`,
      deliveryData,
      authConfig()
    );

  return response.data;
};

// ============================================================
// MY DELIVERIES
// ============================================================

export const getMyDeliveries =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/api/deliveries/my`,
        authConfig()
      );

    return response.data;
  };

// ============================================================
// AVAILABLE DELIVERIES
// ============================================================

export const getAvailableDeliveries =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/api/deliveries/available`,
        authConfig()
      );

    return response.data;
  };

// ============================================================
// RIDER DELIVERIES
// ============================================================

export const getRiderDeliveries =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/api/deliveries/rider`,
        authConfig()
      );

    return response.data;
  };

// ============================================================
// GET SINGLE DELIVERY
// ============================================================

export const getDelivery =
  async (deliveryId) => {
    const response =
      await axios.get(
        `${API_URL}/api/deliveries/${deliveryId}`,
        authConfig()
      );

    return response.data;
  };

// ============================================================
// ACCEPT DELIVERY
// ============================================================

export const acceptDelivery =
  async (deliveryId) => {
    const response =
      await axios.post(
        `${API_URL}/api/deliveries/${deliveryId}/accept`,
        {},
        authConfig()
      );

    return response.data;
  };

// ============================================================
// UPDATE DELIVERY STATUS
// ============================================================

export const updateDeliveryStatus =
  async (
    deliveryId,
    status
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/api/deliveries/${deliveryId}/status`,
        {
          status,
        },
        authConfig()
      );

    return response.data;
  };

// ============================================================
// TOGGLE RIDER AVAILABILITY
// ============================================================

export const toggleRiderAvailability =
  async (isAvailable) => {
    const response =
      await axios.patch(
        `${API_URL}/api/deliveries/rider/availability`,
        {
          isAvailable,
        },
        authConfig()
      );

    return response.data;
  };