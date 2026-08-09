// frontend/src/services/api.js

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://sell-platform2.onrender.com";

console.log("🔗 API_URL:", API_URL);

// ============================================================
// GENERIC REQUEST
// ============================================================

const request = async (
  endpoint,
  options = {}
) => {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    ...(options.headers || {}),
  };

  // Never manually set Content-Type for FormData.
  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  try {
    const response =
      await fetch(url, {
        ...options,
        headers,
      });

    const contentType =
      response.headers.get(
        "content-type"
      );

    let data;

    if (
      contentType?.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      data = {
        success: response.ok,
        message:
          text ||
          response.statusText,
      };
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "❌ API request failed:",
      url,
      error
    );

    throw error;
  }
};

// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProductWithFiles = (
  formData,
  token
) => {
  return request(
    "/api/products",
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body: formData,
    }
  );
};

// ============================================================
// GET PRODUCTS
// ============================================================

export const getProducts = (
  params = {}
) => {
  const query =
    new URLSearchParams(
      params
    ).toString();

  return request(
    `/api/products${
      query
        ? `?${query}`
        : ""
    }`
  );
};

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

export const getProduct = (
  id
) => {
  return request(
    `/api/products/${id}`
  );
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProductWithFiles = (
  id,
  formData,
  token
) => {
  return request(
    `/api/products/${id}`,
    {
      method: "PUT",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body: formData,
    }
  );
};

// ============================================================
// DELETE PRODUCT
// ============================================================

export const deleteProduct = (
  id,
  token
) => {
  return request(
    `/api/products/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );
};