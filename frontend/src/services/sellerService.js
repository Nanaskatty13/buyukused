// ================================================================
// frontend/src/services/sellerService.js
// BuyUKUsed - Seller API Service
// ================================================================

import { API_URL } from "./api";
import { getToken } from "../utils/storage";

// ================================================================
// API BASE URL
// ================================================================

const getBaseUrl = () => {
  try {
    const base = String(API_URL || "").trim();

    if (!base) {
      return "http://localhost:5000";
    }

    return base.replace(/\/+$/, "");
  } catch {
    return "http://localhost:5000";
  }
};

// ================================================================
// TOKEN
// ================================================================

const safeGetToken = () => {
  try {
    return getToken() || null;
  } catch {
    return null;
  }
};

// ================================================================
// SAFE STRING
// ================================================================

const safeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return String(value).trim();
  }

  return "";
};

// ================================================================
// OBJECT ID NORMALIZER
// ================================================================

export const normalizeObjectIdValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  // --------------------------------------------------------------
  // String
  // --------------------------------------------------------------

  if (typeof value === "string") {
    const result = value.trim();

    if (
      !result ||
      result === "[object Object]"
    ) {
      return "";
    }

    return result;
  }

  // --------------------------------------------------------------
  // Number
  // --------------------------------------------------------------

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "";
    }

    return String(value);
  }

  // --------------------------------------------------------------
  // BigInt
  // --------------------------------------------------------------

  if (typeof value === "bigint") {
    return String(value);
  }

  // --------------------------------------------------------------
  // Object
  // --------------------------------------------------------------

  if (typeof value === "object") {
    // MongoDB:
    // { $oid: "..." }

    if (value.$oid !== undefined) {
      const oid = safeString(value.$oid);

      if (oid) {
        return oid;
      }
    }

    // ------------------------------------------------------------
    // Mongo / Mongoose _id
    // ------------------------------------------------------------

    if (
      value._id !== undefined &&
      value._id !== null
    ) {
      const id = normalizeObjectIdValue(
        value._id
      );

      if (id) {
        return id;
      }
    }

    // ------------------------------------------------------------
    // Generic id
    // ------------------------------------------------------------

    if (
      value.id !== undefined &&
      value.id !== null
    ) {
      const id = normalizeObjectIdValue(
        value.id
      );

      if (id) {
        return id;
      }
    }

    // ------------------------------------------------------------
    // toString
    // ------------------------------------------------------------

    if (
      typeof value.toString === "function"
    ) {
      try {
        const result = String(
          value.toString()
        ).trim();

        if (
          result &&
          result !== "[object Object]"
        ) {
          return result;
        }
      } catch {
        // Ignore
      }
    }
  }

  return "";
};

// ================================================================
// VALID MONGO OBJECT ID CHECK
//
// We don't require this everywhere because your backend may use
// another ID format, but this helper is useful for diagnostics.
// ================================================================

export const isMongoObjectId = (value) => {
  const id = normalizeObjectIdValue(value);

  return /^[a-fA-F0-9]{24}$/.test(id);
};

// ================================================================
// NORMALIZE SELLER ID
// ================================================================

export const normalizeSellerId = (seller) => {
  if (
    seller === undefined ||
    seller === null
  ) {
    return "";
  }

  // --------------------------------------------------------------
  // Primitive
  // --------------------------------------------------------------

  if (
    typeof seller === "string" ||
    typeof seller === "number" ||
    typeof seller === "bigint"
  ) {
    return normalizeObjectIdValue(
      seller
    );
  }

  if (
    typeof seller !== "object"
  ) {
    return "";
  }

  // --------------------------------------------------------------
  // EXPLICIT SELLER IDs
  //
  // These MUST be checked before generic _id.
  // --------------------------------------------------------------

  const explicitCandidates = [
    seller.sellerId,
    seller.seller_id,
    seller.sellerUserId,
    seller.sellerUserID,

    seller.userId,
    seller.userID,

    seller.ownerId,
    seller.ownerID,

    seller.seller?.sellerId,
    seller.seller?.seller_id,
    seller.seller?.userId,
    seller.seller?.userID,

    seller.seller?.user?._id,
    seller.seller?.user?.id,

    seller.user?._id,
    seller.user?.id,

    seller.owner?._id,
    seller.owner?.id,
  ];

  for (
    const candidate of explicitCandidates
  ) {
    const id =
      normalizeObjectIdValue(
        candidate
      );

    if (id) {
      return id;
    }
  }

  // --------------------------------------------------------------
  // Nested seller object
  // --------------------------------------------------------------

  const nestedCandidates = [
    seller.seller,
    seller.profile,
    seller.user,
    seller.owner,
  ];

  for (
    const candidate of nestedCandidates
  ) {
    if (
      !candidate ||
      typeof candidate !== "object"
    ) {
      continue;
    }

    const id =
      normalizeSellerId(
        candidate
      );

    if (id) {
      return id;
    }
  }

  // --------------------------------------------------------------
  // ONLY NOW use object's own ID.
  //
  // This is safe when the object itself is known to represent
  // the seller.
  // --------------------------------------------------------------

  const ownId =
    normalizeObjectIdValue(
      seller._id
    );

  if (ownId) {
    return ownId;
  }

  const genericId =
    normalizeObjectIdValue(
      seller.id
    );

  if (genericId) {
    return genericId;
  }

  return "";
};

// ================================================================
// BUILD QUERY
// ================================================================

const buildQuery = (params = {}) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(params || {}).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      if (
        typeof value === "object"
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
// HANDLE RESPONSE
// ================================================================

const handleResponse = async (
  response
) => {
  let data = {};

  if (
    response.status !== 204
  ) {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    try {
      if (
        contentType
          .toLowerCase()
          .includes(
            "application/json"
          )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

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
    const error =
      new Error(
        data?.message ||
          data?.error ||
          data?.msg ||
          `HTTP ${response.status}`
      );

    error.status =
      response.status;

    error.data =
      data;

    error.url =
      response.url;

    throw error;
  }

  return data;
};

// ================================================================
// AUTH HEADERS
// ================================================================

const createHeaders = ({
  includeToken = true,
  includeJsonContentType = true,
  customHeaders = {},
} = {}) => {
  const token =
    safeGetToken();

  const headers = {
    Accept:
      "application/json",
  };

  if (
    includeJsonContentType
  ) {
    headers[
      "Content-Type"
    ] =
      "application/json";
  }

  if (
    includeToken &&
    token
  ) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  return {
    ...headers,
    ...customHeaders,
  };
};

// ================================================================
// AUTHENTICATED REQUEST
// ================================================================

const request = async (
  url,
  options = {}
) => {
  const baseUrl =
    getBaseUrl();

  const {
    includeToken = true,
    credentials = "include",
    ...fetchOptions
  } = options;

  const method =
    String(
      fetchOptions.method ||
        "GET"
    ).toUpperCase();

  const response =
    await fetch(
      `${baseUrl}${url}`,
      {
        ...fetchOptions,

        credentials,

        headers:
          createHeaders({
            includeToken,

            includeJsonContentType:
              method !== "GET" &&
              method !== "HEAD",

            customHeaders:
              fetchOptions.headers ||
              {},
          }),
      }
    );

  return handleResponse(
    response
  );
};

// ================================================================
// FORMDATA REQUEST
// ================================================================

const requestWithFiles =
  async (
    url,
    formData,
    options = {}
  ) => {
    const baseUrl =
      getBaseUrl();

    const token =
      safeGetToken();

    const {
      method = "POST",
      credentials = "include",
      headers:
        customHeaders = {},
    } = options;

    const headers = {
      Accept:
        "application/json",

      ...customHeaders,
    };

    if (token) {
      headers.Authorization =
        `Bearer ${token}`;
    }

    const response =
      await fetch(
        `${baseUrl}${url}`,
        {
          method,

          credentials,

          headers,

          body:
            formData,
        }
      );

    return handleResponse(
      response
    );
  };

// ================================================================
// PUBLIC REQUEST
// ================================================================

const publicRequest =
  async (
    url,
    options = {}
  ) => {
    const baseUrl =
      getBaseUrl();

    const {
      credentials = "omit",
      ...fetchOptions
    } = options;

    const response =
      await fetch(
        `${baseUrl}${url}`,
        {
          ...fetchOptions,

          credentials,

          headers: {
            Accept:
              "application/json",

            ...(fetchOptions.headers ||
              {}),
          },
        }
      );

    return handleResponse(
      response
    );
  };

// ================================================================
// UNWRAP RESPONSE
// ================================================================

const unwrapData = (
  response
) => {
  if (
    response === undefined ||
    response === null
  ) {
    return null;
  }

  if (
    response.data !== undefined &&
    response.data !== null
  ) {
    return response.data;
  }

  return response;
};

// ================================================================
// FIND SELLER OBJECT
// ================================================================

const findSellerObject = (
  value
) => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  // --------------------------------------------------------------
  // Direct seller
  // --------------------------------------------------------------

  if (
    value.seller &&
    typeof value.seller ===
      "object" &&
    !Array.isArray(
      value.seller
    )
  ) {
    return value.seller;
  }

  // --------------------------------------------------------------
  // Profile
  // --------------------------------------------------------------

  if (
    value.profile &&
    typeof value.profile ===
      "object" &&
    !Array.isArray(
      value.profile
    )
  ) {
    return value.profile;
  }

  // --------------------------------------------------------------
  // User
  // --------------------------------------------------------------

  if (
    value.user &&
    typeof value.user ===
      "object" &&
    !Array.isArray(
      value.user
    )
  ) {
    return value.user;
  }

  // --------------------------------------------------------------
  // Nested data
  // --------------------------------------------------------------

  if (
    value.data &&
    typeof value.data ===
      "object" &&
    !Array.isArray(
      value.data
    )
  ) {
    const nested =
      findSellerObject(
        value.data
      );

    if (nested) {
      return nested;
    }
  }

  // --------------------------------------------------------------
  // Direct seller-like object
  // --------------------------------------------------------------

  const hasSellerFields =
    Boolean(
      value.name ||
        value.email ||
        value.phone ||
        value.shopName ||
        value.storeName ||
        value.businessName ||
        value.profileImage ||
        value.avatar ||
        value.photo ||
        value.picture
    );

  if (
    hasSellerFields &&
    normalizeSellerId(value)
  ) {
    return value;
  }

  return null;
};

// ================================================================
// NORMALIZE SELLER PROFILE
// ================================================================

const normalizeSellerProfileResponse =
  (response) => {
    const data =
      unwrapData(response);

    if (
      data === undefined ||
      data === null
    ) {
      return {
        ...(response || {}),

        seller: null,

        profile: null,

        user: null,
      };
    }

    // ------------------------------------------------------------
    // Array response
    // ------------------------------------------------------------

    if (
      Array.isArray(data)
    ) {
      const first =
        data[0] || null;

      if (first) {
        const seller =
          findSellerObject(
            first
          ) || first;

        return {
          ...(response || {}),

          seller,

          profile: seller,

          user: seller,
        };
      }

      return {
        ...(response || {}),

        seller: null,

        profile: null,

        user: null,
      };
    }

    // ------------------------------------------------------------
    // Object
    // ------------------------------------------------------------

    if (
      typeof data === "object"
    ) {
      const seller =
        findSellerObject(
          data
        );

      if (seller) {
        return {
          ...(response || {}),

          ...data,

          seller,

          profile:
            data.profile &&
            typeof data.profile ===
              "object"
              ? data.profile
              : seller,

          user:
            data.user &&
            typeof data.user ===
              "object"
              ? data.user
              : seller,
        };
      }

      // Backend may return seller directly.

      const directSellerId =
        normalizeSellerId(
          data
        );

      if (directSellerId) {
        return {
          ...(response || {}),

          ...data,

          seller: data,

          profile: data,

          user: data,
        };
      }
    }

    return {
      ...(response || {}),

      seller: null,

      profile: null,

      user: null,
    };
  };

// ================================================================
// EXTRACT PRODUCTS
// ================================================================

const extractProducts = (
  data
) => {
  if (
    Array.isArray(data)
  ) {
    return data;
  }

  if (
    !data ||
    typeof data !== "object"
  ) {
    return [];
  }

  const directArrays = [
    data.products,
    data.items,
    data.results,
    data.listings,
  ];

  for (
    const list of directArrays
  ) {
    if (
      Array.isArray(list)
    ) {
      return list;
    }
  }

  if (
    data.data &&
    typeof data.data ===
      "object"
  ) {
    return extractProducts(
      data.data
    );
  }

  return [];
};

// ================================================================
// NORMALIZE PRODUCTS RESPONSE
// ================================================================

const normalizeProductsResponse =
  (response) => {
    const data =
      unwrapData(response);

    const products =
      extractProducts(
        data
      );

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return {
        ...(response || {}),

        products,

        items: products,

        results: products,

        total:
          products.length,

        page: 1,

        limit:
          products.length,

        pages: 1,

        pagination: {
          page: 1,

          limit:
            products.length,

          total:
            products.length,

          pages: 1,
        },
      };
    }

    const pagination =
      data.pagination ||
      data.meta ||
      {};

    const rawTotal =
      data.total ??
      pagination.total ??
      products.length;

    const rawPage =
      data.page ??
      pagination.page ??
      1;

    const rawLimit =
      data.limit ??
      pagination.limit ??
      products.length;

    const total =
      Number(rawTotal);

    const page =
      Number(rawPage);

    const limit =
      Number(rawLimit);

    const calculatedPages =
      limit > 0
        ? Math.ceil(
            total / limit
          )
        : 1;

    const pages =
      Number(
        data.pages ??
          pagination.pages ??
          calculatedPages
      );

    const normalizedTotal =
      Number.isFinite(total)
        ? total
        : products.length;

    const normalizedPage =
      Number.isFinite(page) &&
      page > 0
        ? page
        : 1;

    const normalizedLimit =
      Number.isFinite(limit) &&
      limit >= 0
        ? limit
        : products.length;

    const normalizedPages =
      Number.isFinite(pages) &&
      pages > 0
        ? pages
        : 1;

    return {
      ...(response || {}),

      ...data,

      products,

      items: products,

      results: products,

      total:
        normalizedTotal,

      page:
        normalizedPage,

      limit:
        normalizedLimit,

      pages:
        normalizedPages,

      pagination:
        data.pagination || {
          page:
            normalizedPage,

          limit:
            normalizedLimit,

          total:
            normalizedTotal,

          pages:
            normalizedPages,
        },
    };
  };

// ================================================================
// 1. REGISTER SELLER
// ================================================================

export const registerSeller =
  async (data) => {
    if (
      !data ||
      typeof data !== "object"
    ) {
      throw new Error(
        "Seller registration data is required"
      );
    }

    return request(
      "/sellers/register",
      {
        method: "POST",

        body:
          JSON.stringify(
            data
          ),
      }
    );
  };

// ================================================================
// 2. GET OWN SELLER PROFILE
// ================================================================

export const getSellerProfile =
  async () => {
    const response =
      await request(
        "/sellers/profile"
      );

    return normalizeSellerProfileResponse(
      response
    );
  };

// ================================================================
// 3. UPDATE OWN SELLER PROFILE
// ================================================================

export const updateSellerProfile =
  async (data) => {
    if (
      !data ||
      typeof data !== "object"
    ) {
      throw new Error(
        "Seller profile data is required"
      );
    }

    const response =
      await request(
        "/sellers/profile",
        {
          method: "PUT",

          body:
            JSON.stringify(
              data
            ),
        }
      );

    return normalizeSellerProfileResponse(
      response
    );
  };

// ================================================================
// 4. SELLER DASHBOARD
// ================================================================

export const getSellerDashboard =
  async (
    period = "all"
  ) => {
    const query =
      buildQuery({
        period,
      });

    return request(
      `/sellers/dashboard${query}`
    );
  };

// ================================================================
// 5. SELLER EARNINGS
// ================================================================

export const getSellerEarnings =
  async (
    period = "all"
  ) => {
    const query =
      buildQuery({
        period,
      });

    return request(
      `/sellers/earnings${query}`
    );
  };

// ================================================================
// 6. SELLER ANALYTICS
// ================================================================

export const getSellerAnalytics =
  async (
    period = "today"
  ) => {
    const query =
      buildQuery({
        period,
      });

    return request(
      `/sellers/analytics${query}`
    );
  };

// ================================================================
// 7. GET MY PRODUCTS
// ================================================================

export const getMyProducts =
  async (
    params = {}
  ) => {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      status,
    } = params;

    const query =
      buildQuery({
        page,
        limit,
        sort,
        status,
      });

    const response =
      await request(
        `/sellers/products${query}`
      );

    return normalizeProductsResponse(
      response
    );
  };

// ================================================================
// 8. CREATE PRODUCT
// ================================================================

export const createProductSeller =
  async (
    formData
  ) => {
    if (
      !(formData instanceof FormData)
    ) {
      throw new Error(
        "FormData is required to create a product"
      );
    }

    return requestWithFiles(
      "/sellers/products",
      formData,
      {
        method: "POST",
      }
    );
  };

// ================================================================
// 9. UPDATE PRODUCT
// ================================================================

export const updateProductSeller =
  async (
    productId,
    formData
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    if (
      !(formData instanceof FormData)
    ) {
      throw new Error(
        "FormData is required to update a product"
      );
    }

    const id =
      normalizeObjectIdValue(
        productId
      );

    if (!id) {
      throw new Error(
        "Valid Product ID is required"
      );
    }

    return requestWithFiles(
      `/sellers/products/${encodeURIComponent(
        id
      )}`,
      formData,
      {
        method: "PUT",
      }
    );
  };

// ================================================================
// 10. DELETE PRODUCT
// ================================================================

export const deleteProductSeller =
  async (
    productId
  ) => {
    if (!productId) {
      throw new Error(
        "Product ID is required"
      );
    }

    const id =
      normalizeObjectIdValue(
        productId
      );

    if (!id) {
      throw new Error(
        "Valid Product ID is required"
      );
    }

    return request(
      `/sellers/products/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
      }
    );
  };

// ================================================================
// 11. GET SELLER ORDERS
// ================================================================

export const getSellerOrders =
  async (
    params = {}
  ) => {
    const {
      page = 1,
      limit = 20,
      status,
    } = params;

    const query =
      buildQuery({
        page,
        limit,
        status,
      });

    return request(
      `/sellers/orders${query}`
    );
  };

// ================================================================
// 12. GET SELLER ORDER BY ID
// ================================================================

export const getSellerOrderById =
  async (
    orderId
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    const id =
      normalizeObjectIdValue(
        orderId
      );

    if (!id) {
      throw new Error(
        "Valid Order ID is required"
      );
    }

    return request(
      `/sellers/orders/${encodeURIComponent(
        id
      )}`
    );
  };

// ================================================================
// 13. UPDATE SELLER ORDER STATUS
// ================================================================

export const updateSellerOrderStatus =
  async (
    orderId,
    status
  ) => {
    if (!orderId) {
      throw new Error(
        "Order ID is required"
      );
    }

    if (!status) {
      throw new Error(
        "Order status is required"
      );
    }

    const id =
      normalizeObjectIdValue(
        orderId
      );

    if (!id) {
      throw new Error(
        "Valid Order ID is required"
      );
    }

    return request(
      `/sellers/orders/${encodeURIComponent(
        id
      )}/status`,
      {
        method: "PUT",

        body:
          JSON.stringify({
            status,
          }),
      }
    );
  };

// ================================================================
// 14. PUBLIC SELLER PROFILE
// ================================================================

export const getPublicSellerProfile =
  async (
    sellerId
  ) => {
    const normalizedId =
      normalizeSellerId(
        sellerId
      );

    if (!normalizedId) {
      throw new Error(
        "Valid Seller ID is required"
      );
    }

    const response =
      await publicRequest(
        `/sellers/${encodeURIComponent(
          normalizedId
        )}`
      );

    return normalizeSellerProfileResponse(
      response
    );
  };

// ================================================================
// 15. PUBLIC SELLER PRODUCTS
// ================================================================

export const getPublicSellerProducts =
  async (
    sellerId,
    params = {}
  ) => {
    const normalizedId =
      normalizeSellerId(
        sellerId
      );

    if (!normalizedId) {
      throw new Error(
        "Valid Seller ID is required"
      );
    }

    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
    } = params;

    const query =
      buildQuery({
        page,
        limit,
        sort,
      });

    const response =
      await publicRequest(
        `/sellers/${encodeURIComponent(
          normalizedId
        )}/products${query}`
      );

    return normalizeProductsResponse(
      response
    );
  };

// ================================================================
// 16. COMPLETE PUBLIC SELLER PAGE
//
// IMPORTANT:
// Do NOT use Promise.all() here.
//
// If seller profile succeeds but products fail,
// the seller profile should STILL display.
//
// This is one of the biggest reliability fixes.
// ================================================================

export const getPublicSellerPage =
  async (
    sellerId,
    params = {}
  ) => {
    const normalizedId =
      normalizeSellerId(
        sellerId
      );

    if (!normalizedId) {
      throw new Error(
        "Valid Seller ID is required"
      );
    }

    let profile = null;
    let productsResponse = null;

    let profileError = null;
    let productsError = null;

    // ------------------------------------------------------------
    // PROFILE
    // ------------------------------------------------------------

    try {
      profile =
        await getPublicSellerProfile(
          normalizedId
        );
    } catch (error) {
      profileError =
        error;
    }

    // ------------------------------------------------------------
    // PRODUCTS
    // ------------------------------------------------------------

    try {
      productsResponse =
        await getPublicSellerProducts(
          normalizedId,
          params
        );
    } catch (error) {
      productsError =
        error;
    }

    // ------------------------------------------------------------
    // SELLER
    // ------------------------------------------------------------

    const seller =
      profile?.seller ||
      profile?.profile ||
      profile?.user ||
      null;

    // ------------------------------------------------------------
    // PRODUCTS
    // ------------------------------------------------------------

    const products =
      productsResponse?.products ||
      productsResponse?.items ||
      productsResponse?.results ||
      [];

    // ------------------------------------------------------------
    // If profile completely failed AND no seller exists,
    // throw the profile error.
    //
    // Products failing alone should NOT destroy the page.
    // ------------------------------------------------------------

    if (
      !seller &&
      profileError
    ) {
      throw profileError;
    }

    return {
      sellerId:
        normalizedId,

      seller,

      profile,

      products:
        Array.isArray(products)
          ? products
          : [],

      productsResponse,

      errors: {
        profile:
          profileError,

        products:
          productsError,
      },

      hasProfileError:
        Boolean(profileError),

      hasProductsError:
        Boolean(productsError),
    };
  };

// ================================================================
// 17. GET SELLER ID FROM PRODUCT
// ================================================================

export const getSellerIdFromProduct =
  (product) => {
    if (
      !product ||
      typeof product !== "object"
    ) {
      return "";
    }

    // ------------------------------------------------------------
    // Explicit seller ID fields
    // ------------------------------------------------------------

    const directCandidates = [
      product.sellerId,
      product.seller_id,

      product.sellerUserId,
      product.sellerUserID,

      product.userId,
      product.userID,

      product.ownerId,
      product.ownerID,

      product.seller?.sellerId,
      product.seller?.seller_id,

      product.seller?.userId,
      product.seller?.userID,

      product.seller?.user?._id,
      product.seller?.user?.id,

      product.user?._id,
      product.user?.id,

      product.owner?._id,
      product.owner?.id,
    ];

    for (
      const candidate of directCandidates
    ) {
      const id =
        normalizeObjectIdValue(
          candidate
        );

      if (id) {
        return id;
      }
    }

    // ------------------------------------------------------------
    // Nested seller
    // ------------------------------------------------------------

    const nestedCandidates = [
      product.seller,
      product.user,
      product.owner,
    ];

    for (
      const candidate of nestedCandidates
    ) {
      if (
        !candidate ||
        typeof candidate !== "object"
      ) {
        continue;
      }

      const id =
        normalizeSellerId(
          candidate
        );

      if (id) {
        return id;
      }
    }

    return "";
  };

// ================================================================
// 18. VALID SELLER ID
// ================================================================

export const hasValidSellerId =
  (seller) => {
    return Boolean(
      normalizeSellerId(
        seller
      )
    );
  };

// ================================================================
// 19. PUBLIC SELLER URL
// ================================================================

export const buildPublicSellerUrl =
  (seller) => {
    const sellerId =
      normalizeSellerId(
        seller
      );

    if (!sellerId) {
      return "";
    }

    return `/seller/${encodeURIComponent(
      sellerId
    )}`;
  };

// ================================================================
// 20. SAFE PUBLIC SELLER DATA
// ================================================================

export const normalizePublicSellerData =
  (response) => {
    if (
      !response ||
      typeof response !== "object"
    ) {
      return {
        seller: null,

        sellerId: "",

        products: [],

        errors: {},
      };
    }

    const seller =
      response.seller ||
      response.profile?.seller ||
      response.profile?.profile ||
      response.profile?.user ||
      response.profile ||
      response.user ||
      null;

    const products =
      response.products ||
      response.productsResponse?.products ||
      response.productsResponse?.items ||
      response.productsResponse?.results ||
      [];

    const sellerId =
      normalizeSellerId(
        seller
      ) ||
      safeString(
        response.sellerId
      );

    return {
      seller,

      sellerId,

      products:
        Array.isArray(products)
          ? products
          : [],

      errors:
        response.errors || {},
    };
  };

// ================================================================
// 21. GET SELLER ID FROM ANY COMMON OBJECT
//
// Useful when different API endpoints return different shapes.
// ================================================================

export const extractSellerId =
  (value) => {
    if (
      value === undefined ||
      value === null
    ) {
      return "";
    }

    // Direct normalization first.
    const direct =
      normalizeSellerId(
        value
      );

    if (direct) {
      return direct;
    }

    if (
      typeof value !== "object"
    ) {
      return "";
    }

    const candidates = [
      value.seller,
      value.sellerId,
      value.seller_id,

      value.user,
      value.userId,
      value.userID,

      value.owner,
      value.ownerId,
      value.ownerID,

      value.profile,

      value.author,
      value.authorId,

      value.createdBy,
      value.createdById,
    ];

    for (
      const candidate of candidates
    ) {
      const id =
        normalizeSellerId(
          candidate
        );

      if (id) {
        return id;
      }
    }

    return "";
  };

// ================================================================
// 22. DEBUG SELLER DATA
//
// Safe helper for development.
// ================================================================

export const inspectSellerData =
  (value) => {
    const sellerId =
      extractSellerId(
        value
      );

    return {
      sellerId,

      valid:
        Boolean(sellerId),

      mongoObjectId:
        isMongoObjectId(
          sellerId
        ),

      raw: value,
    };
  };

// ================================================================
// DEFAULT EXPORT
// ================================================================

const sellerService = {
  normalizeObjectIdValue,

  isMongoObjectId,

  normalizeSellerId,

  extractSellerId,

  getSellerIdFromProduct,

  hasValidSellerId,

  buildPublicSellerUrl,

  normalizePublicSellerData,

  inspectSellerData,

  registerSeller,

  getSellerProfile,

  updateSellerProfile,

  getSellerDashboard,

  getSellerEarnings,

  getSellerAnalytics,

  getMyProducts,

  createProductSeller,

  updateProductSeller,

  deleteProductSeller,

  getSellerOrders,

  getSellerOrderById,

  updateSellerOrderStatus,

  getPublicSellerProfile,

  getPublicSellerProducts,

  getPublicSellerPage,
};

export default sellerService;