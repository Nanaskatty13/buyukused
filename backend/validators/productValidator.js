// ============================================================
// backend/validators/productValidator.js
// BuyUKUsed Product Validator
// ============================================================

const {
  PRODUCT_CATEGORIES,
  normalizeCategory,
} = require("../constants/productCategories");

// ============================================================
// CONSTANTS
// ============================================================

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

const VALID_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

// ============================================================
// HELPERS
// ============================================================

const cleanString = (value, defaultValue = "") => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (Array.isArray(value)) {
    value = value[0];
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    value =
      value.value ??
      value.name ??
      value.label ??
      "";
  }

  return String(value).trim();
};

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "string") {
    value = value.replace(/,/g, "").trim();
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    if (
      ["true", "1", "yes", "on"].includes(
        normalized
      )
    ) {
      return true;
    }

    if (
      ["false", "0", "no", "off"].includes(
        normalized
      )
    ) {
      return false;
    }
  }

  return Boolean(value);
};

// ============================================================
// STATUS NORMALIZATION
// ============================================================

const normalizeStatus = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "active";
  }

  const status = String(value)
    .trim()
    .toLowerCase();

  return VALID_STATUSES.includes(status)
    ? status
    : "active";
};

// ============================================================
// CONDITION NORMALIZATION
// ============================================================

const normalizeCondition = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Good";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  const match = VALID_CONDITIONS.find(
    (condition) =>
      condition.toLowerCase() === normalized
  );

  return match || "Good";
};

// ============================================================
// VALIDATE CATEGORY
// ============================================================

const validateCategory = (value) => {
  const normalized = normalizeCategory(value);

  return {
    valid: PRODUCT_CATEGORIES.includes(
      normalized
    ),
    category: normalized,
  };
};

// ============================================================
// VALIDATE PRODUCT
// ============================================================

const validateProduct = (data = {}) => {
  const errors = [];

  const categoryResult =
    validateCategory(data.category);

  const title = cleanString(data.title);

  const price = toNumberOrNull(
    data.price
  );

  const sellerPhone = cleanString(
    data.sellerPhone
  );

  const status = normalizeStatus(
    data.status
  );

  const condition = normalizeCondition(
    data.condition
  );

  // ==========================================================
  // TITLE
  // ==========================================================

  if (!title || title.length < 2) {
    errors.push({
      field: "title",
      message:
        "Product title is required",
    });
  }

  // ==========================================================
  // PRICE
  // ==========================================================

  if (
    price === null ||
    !Number.isFinite(price) ||
    price < 0
  ) {
    errors.push({
      field: "price",
      message:
        "A valid product price is required",
    });
  }

  // ==========================================================
  // SELLER
  // ==========================================================

  if (!data.sellerId) {
    errors.push({
      field: "sellerId",
      message:
        "Seller authentication is required",
    });
  }

  if (!sellerPhone) {
    errors.push({
      field: "sellerPhone",
      message:
        "Seller phone number is required",
    });
  }

  // ==========================================================
  // CATEGORY
  // ==========================================================

  if (!categoryResult.valid) {
    errors.push({
      field: "category",
      message:
        `Invalid product category: ${categoryResult.category}`,
    });
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  if (!VALID_STATUSES.includes(status)) {
    errors.push({
      field: "status",
      message:
        `Invalid product status: ${status}`,
    });
  }

  // ==========================================================
  // CONDITION
  // ==========================================================

  if (!VALID_CONDITIONS.includes(condition)) {
    errors.push({
      field: "condition",
      message:
        `Invalid product condition: ${condition}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      ...data,
      title,
      price,
      category: categoryResult.category,
      sellerPhone,
      status,
      condition,
    },
  };
};

// ============================================================
// EXPRESS MIDDLEWARE
// ============================================================

const validateProductMiddleware = (
  req,
  res,
  next
) => {
  try {
    const body = req.body || {};

    const category =
      normalizeCategory(
        body.category
      );

    // IMPORTANT:
    // Write the canonical category back to req.body.
    //
    // Therefore:
    // "game consoles"
    // "Game Consoles"
    // "game-console"
    // "game_consoles"
    // "PS5"
    //
    // all become:
    //
    // "Game Consoles"

    req.body.category = category;

    const result =
      validateProduct({
        ...req.body,
        sellerId:
          req.user?.id ||
          req.user?._id ||
          req.user?.userId,
      });

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message:
          result.errors[0]?.message ||
          "Product validation failed",
        errors: result.errors,
      });
    }

    // Put normalized values back into body
    req.body.category =
      result.data.category;

    req.body.status =
      result.data.status;

    req.body.condition =
      result.data.condition;

    if (result.data.price !== null) {
      req.body.price =
        result.data.price;
    }

    next();
  } catch (error) {
    console.error(
      "❌ Product validator error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        "Product validation failed",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  PRODUCT_CATEGORIES,

  VALID_CATEGORIES:
    PRODUCT_CATEGORIES,

  VALID_STATUSES,

  VALID_CONDITIONS,

  normalizeCategory,

  normalizeStatus,

  normalizeCondition,

  validateCategory,

  validateProduct,

  validateProductMiddleware,

  cleanString,

  toNumberOrNull,

  toBoolean,
};