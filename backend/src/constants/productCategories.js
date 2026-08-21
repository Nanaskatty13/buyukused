// ============================================================
// backend/src/constants/productCategories.js
// BuyUKUsed - Product Categories
// ============================================================
//
// SINGLE SOURCE OF TRUTH
//
// Use these category values everywhere:
// - Product model
// - Product controller
// - Product validator
// - API
// - Frontend/PostAd
//
// IMPORTANT:
// The actual stored/display category values are the values below.
// ============================================================

"use strict";

// ============================================================
// VALID PRODUCT CATEGORIES
// ============================================================

const PRODUCT_CATEGORIES = Object.freeze([
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
]);

// ============================================================
// CATEGORY ALIASES
// ============================================================
//
// Allows the backend to accept different spellings/forms
// while always storing the correct canonical category.
// ============================================================

const PRODUCT_CATEGORY_ALIASES = Object.freeze({
  // ----------------------------------------------------------
  // CARS
  // ----------------------------------------------------------

  car: "Cars",
  cars: "Cars",

  automobile: "Cars",
  automobiles: "Cars",

  vehicle: "Cars",
  vehicles: "Cars",

  auto: "Cars",

  // ----------------------------------------------------------
  // PHONES
  // ----------------------------------------------------------

  phone: "Phones",
  phones: "Phones",

  mobile: "Phones",
  mobiles: "Phones",

  smartphone: "Phones",
  smartphones: "Phones",

  "mobile phone": "Phones",
  "mobile phones": "Phones",

  "smart phone": "Phones",
  "smart phones": "Phones",

  iphone: "Phones",
  iphones: "Phones",

  android: "Phones",
  androids: "Phones",

  // ----------------------------------------------------------
  // LAPTOPS
  // ----------------------------------------------------------

  laptop: "Laptops",
  laptops: "Laptops",

  notebook: "Laptops",
  notebooks: "Laptops",

  computer: "Laptops",
  computers: "Laptops",

  "personal computer": "Laptops",
  "personal computers": "Laptops",

  pc: "Laptops",

  // ----------------------------------------------------------
  // TABLETS
  // ----------------------------------------------------------

  tablet: "Tablets",
  tablets: "Tablets",

  ipad: "Tablets",
  ipads: "Tablets",

  "ipad tablet": "Tablets",

  // ----------------------------------------------------------
  // ACCESSORIES
  // ----------------------------------------------------------

  accessory: "Accessories",
  accessories: "Accessories",

  "phone accessory": "Accessories",
  "phone accessories": "Accessories",

  "computer accessory": "Accessories",
  "computer accessories": "Accessories",

  // ----------------------------------------------------------
  // REAL ESTATE
  // ----------------------------------------------------------

  "real estate": "Real Estate",

  property: "Real Estate",
  properties: "Real Estate",

  land: "Real Estate",

  house: "Real Estate",
  houses: "Real Estate",

  apartment: "Real Estate",
  apartments: "Real Estate",

  home: "Home",
  homes: "Home",

  // ----------------------------------------------------------
  // JOBS
  // ----------------------------------------------------------

  job: "Jobs",
  jobs: "Jobs",

  employment: "Jobs",

  career: "Jobs",
  careers: "Jobs",

  vacancy: "Jobs",
  vacancies: "Jobs",

  // ----------------------------------------------------------
  // ELECTRONICS
  // ----------------------------------------------------------

  electronic: "Electronics",
  electronics: "Electronics",

  electronicss: "Electronics",

  gadget: "Electronics",
  gadgets: "Electronics",

  device: "Electronics",
  devices: "Electronics",

  // ----------------------------------------------------------
  // FASHION
  // ----------------------------------------------------------

  fashion: "Fashion",

  clothing: "Fashion",
  clothes: "Fashion",

  apparel: "Fashion",

  shoes: "Fashion",
  footwear: "Fashion",

  bags: "Fashion",
  bag: "Fashion",

  watches: "Smartwatches",

  // ----------------------------------------------------------
  // HOME
  // ----------------------------------------------------------

  homegoods: "Home",
  "home goods": "Home",

  furniture: "Home",

  appliance: "Home",
  appliances: "Home",

  // ----------------------------------------------------------
  // TVS
  // ----------------------------------------------------------

  tv: "TVs",
  tvs: "TVs",

  television: "TVs",
  televisions: "TVs",

  "smart tv": "TVs",
  "smart tvs": "TVs",

  // ----------------------------------------------------------
  // GAME CONSOLES
  // ----------------------------------------------------------

  console: "Game Consoles",
  consoles: "Game Consoles",

  "game console": "Game Consoles",
  "game consoles": "Game Consoles",

  gaming: "Game Consoles",

  "gaming console": "Game Consoles",
  "gaming consoles": "Game Consoles",

  playstation: "Game Consoles",
  playstation5: "Game Consoles",
  ps5: "Game Consoles",
  ps4: "Game Consoles",

  xbox: "Game Consoles",
  "xbox series": "Game Consoles",

  nintendo: "Game Consoles",
  switch: "Game Consoles",
  "nintendo switch": "Game Consoles",

  // ----------------------------------------------------------
  // SMARTWATCHES
  // ----------------------------------------------------------

  watch: "Smartwatches",
  watches: "Smartwatches",

  smartwatch: "Smartwatches",
  smartwatches: "Smartwatches",

  "smart watch": "Smartwatches",
  "smart watches": "Smartwatches",

  "smart-watch": "Smartwatches",
  "smart-watches": "Smartwatches",

  applewatch: "Smartwatches",
  "apple watch": "Smartwatches",

  galaxywatch: "Smartwatches",
  "galaxy watch": "Smartwatches",

  fitbit: "Smartwatches",

  // ----------------------------------------------------------
  // OTHER
  // ----------------------------------------------------------

  other: "Other",
  others: "Other",

  miscellaneous: "Other",
  misc: "Other",

  "other items": "Other",
});

// ============================================================
// NORMALIZE CATEGORY
// ============================================================

const normalizeProductCategory = (value) => {
  // Missing category
  if (
    value === undefined ||
    value === null
  ) {
    return "Other";
  }

  // Convert to string
  let normalized = String(value)
    .trim()
    .toLowerCase();

  // Empty category
  if (!normalized) {
    return "Other";
  }

  // Normalize separators
  normalized = normalized
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Alias lookup
  if (
    Object.prototype.hasOwnProperty.call(
      PRODUCT_CATEGORY_ALIASES,
      normalized
    )
  ) {
    return PRODUCT_CATEGORY_ALIASES[
      normalized
    ];
  }

  // Exact canonical category lookup
  const exactCategory =
    PRODUCT_CATEGORIES.find(
      (category) =>
        category.toLowerCase() ===
        normalized
    );

  if (exactCategory) {
    return exactCategory;
  }

  // Unknown category
  return "Other";
};

// ============================================================
// CHECK CATEGORY
// ============================================================

const isValidProductCategory = (
  value
) => {
  const normalized =
    normalizeProductCategory(value);

  return PRODUCT_CATEGORIES.includes(
    normalized
  );
};

// ============================================================
// STRICT CATEGORY CHECK
// ============================================================
//
// Unlike normalizeProductCategory(),
// this function does NOT silently turn an unknown
// value into "Other".
//
// Useful for validation.
// ============================================================

const isCanonicalProductCategory = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return false;
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  return PRODUCT_CATEGORIES.some(
    (category) =>
      category.toLowerCase() ===
      normalized
  );
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_ALIASES,
  normalizeProductCategory,
  isValidProductCategory,
  isCanonicalProductCategory,
};