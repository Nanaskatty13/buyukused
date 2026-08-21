// ============================================================
// backend/src/validators/productValidator.js
// BuyUKUsed - Product Validator
// ============================================================

const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "Accessories",
  "Real Estate",
  "Jobs",
  "Electronics",
  "Fashion",
  "Home",
  "TVs",
  "Game Consoles",
  "Smartwatches",
  "Other",
];

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

// ============================================================
// NORMALIZE CATEGORY
// ============================================================

const normalizeCategory = (value) => {
  if (value === undefined || value === null) {
    return "Other";
  }

  const raw = String(value)
    .trim()
    .toLowerCase();

  if (!raw) {
    return "Other";
  }

  const normalized = raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const categoryMap = {
    // --------------------------------------------------------
    // CARS
    // --------------------------------------------------------

    car: "Cars",
    cars: "Cars",
    automobile: "Cars",
    automobiles: "Cars",

    // --------------------------------------------------------
    // PHONES
    // --------------------------------------------------------

    phone: "Phones",
    phones: "Phones",
    mobile: "Phones",
    mobiles: "Phones",
    smartphone: "Phones",
    smartphones: "Phones",

    // --------------------------------------------------------
    // LAPTOPS
    // --------------------------------------------------------

    laptop: "Laptops",
    laptops: "Laptops",
    notebook: "Laptops",
    notebooks: "Laptops",

    // --------------------------------------------------------
    // TABLETS
    // --------------------------------------------------------

    tablet: "Tablets",
    tablets: "Tablets",
    ipad: "Tablets",
    ipads: "Tablets",

    // --------------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------------

    accessory: "Accessories",
    accessories: "Accessories",

    // --------------------------------------------------------
    // REAL ESTATE
    // --------------------------------------------------------

    "real estate": "Real Estate",
    realestate: "Real Estate",
    property: "Real Estate",
    properties: "Real Estate",

    // --------------------------------------------------------
    // JOBS
    // --------------------------------------------------------

    job: "Jobs",
    jobs: "Jobs",
    employment: "Jobs",

    // --------------------------------------------------------
    // ELECTRONICS
    // --------------------------------------------------------

    electronic: "Electronics",
    electronics: "Electronics",

    // --------------------------------------------------------
    // FASHION
    // --------------------------------------------------------

    fashion: "Fashion",
    clothing: "Fashion",
    clothes: "Fashion",

    // --------------------------------------------------------
    // HOME
    // --------------------------------------------------------

    home: "Home",
    homes: "Home",

    // --------------------------------------------------------
    // TVS
    // --------------------------------------------------------

    tv: "TVs",
    tvs: "TVs",
    television: "TVs",
    televisions: "TVs",

    // --------------------------------------------------------
    // GAME CONSOLES
    // --------------------------------------------------------

    console: "Game Consoles",
    consoles: "Game Consoles",
    "game console": "Game Consoles",
    "game consoles": "Game Consoles",
    gaming: "Game Consoles",

    // --------------------------------------------------------
    // SMARTWATCHES
    // --------------------------------------------------------

    watch: "Smartwatches",
    watches: "Smartwatches",
    smartwatch: "Smartwatches",
    smartwatches: "Smartwatches",

    "smart watch": "Smartwatches",
    "smart watches": "Smartwatches",

    // --------------------------------------------------------
    // OTHER
    // --------------------------------------------------------

    other: "Other",
  };

  return (
    categoryMap[normalized] ||
    VALID_CATEGORIES.find(
      (category) =>
        category.toLowerCase() === normalized
    ) ||
    null
  );
};

// ============================================================
// NORMALIZE STATUS
// ============================================================

const normalizeStatus = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "active";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  return VALID_STATUSES.includes(normalized)
    ? normalized
    : null;
};

// ============================================================
// VALIDATE CATEGORY
// ============================================================

const validateCategory = (value) => {
  const category = normalizeCategory(value);

  if (!category) {
    return {
      valid: false,
      value: null,
      message: "Invalid product category",
    };
  }

  return {
    valid: true,
    value: category,
    message: null,
  };
};

// ============================================================
// VALIDATE STATUS
// ============================================================

const validateStatus = (value) => {
  const status = normalizeStatus(value);

  if (!status) {
    return {
      valid: false,
      value: null,
      message: "Invalid product status",
    };
  }

  return {
    valid: true,
    value: status,
    message: null,
  };
};

// ============================================================
// VALIDATE PRODUCT BODY
// ============================================================

const validateProduct = (req, res, next) => {
  try {
    const body = req.body || {};

    const errors = [];

    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    if (
      body.title !== undefined &&
      String(body.title).trim().length < 2
    ) {
      errors.push("Product title must be at least 2 characters");
    }

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    if (
      body.price !== undefined &&
      body.price !== ""
    ) {
      const price = Number(body.price);

      if (!Number.isFinite(price) || price < 0) {
        errors.push("A valid product price is required");
      }
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (body.category !== undefined) {
      const categoryResult = validateCategory(
        body.category
      );

      if (!categoryResult.valid) {
        errors.push(categoryResult.message);
      } else {
        // IMPORTANT:
        // Replace the incoming value with the canonical
        // category used by the database.
        body.category = categoryResult.value;
      }
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (body.status !== undefined) {
      const statusResult = validateStatus(
        body.status
      );

      if (!statusResult.valid) {
        errors.push(statusResult.message);
      } else {
        body.status = statusResult.value;
      }
    }

    // --------------------------------------------------------
    // SELLER PHONE
    // --------------------------------------------------------

    if (
      body.sellerPhone !== undefined &&
      String(body.sellerPhone).trim() === ""
    ) {
      errors.push("Seller phone number is required");
    }

    // --------------------------------------------------------
    // RETURN VALIDATION ERRORS
    // --------------------------------------------------------

    if (errors.length > 0) {
      console.error(
        "❌ Product validator errors:",
        errors
      );

      console.error(
        "📦 Received category:",
        body.category
      );

      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    next();
  } catch (error) {
    console.error(
      "❌ Product validator error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: "Invalid product data",
      error: error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  VALID_CATEGORIES,
  VALID_STATUSES,
  normalizeCategory,
  normalizeStatus,
  validateCategory,
  validateStatus,
  validateProduct,
};