// ============================================================
// backend/src/constants/productCategories.js
// BuyUKUsed - Product Categories
// ============================================================

"use strict";

// ============================================================
// CANONICAL PRODUCT CATEGORIES
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
  "Spare Parts",
  "Cosmetics",
  "Other",
]);

// ============================================================
// CATEGORY ALIASES
// ============================================================

const PRODUCT_CATEGORY_ALIASES = Object.freeze({
  // Cars
  car: "Cars",
  cars: "Cars",
  automobile: "Cars",
  automobiles: "Cars",
  vehicle: "Cars",
  vehicles: "Cars",
  auto: "Cars",

  // Phones
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

  // Laptops
  laptop: "Laptops",
  laptops: "Laptops",
  notebook: "Laptops",
  notebooks: "Laptops",
  computer: "Laptops",
  computers: "Laptops",
  "personal computer": "Laptops",
  "personal computers": "Laptops",
  pc: "Laptops",

  // Tablets
  tablet: "Tablets",
  tablets: "Tablets",
  ipad: "Tablets",
  ipads: "Tablets",
  "ipad tablet": "Tablets",

  // Accessories
  accessory: "Accessories",
  accessories: "Accessories",
  "phone accessory": "Accessories",
  "phone accessories": "Accessories",
  "computer accessory": "Accessories",
  "computer accessories": "Accessories",

  // Real Estate
  "real estate": "Real Estate",
  property: "Real Estate",
  properties: "Real Estate",
  land: "Real Estate",
  house: "Real Estate",
  houses: "Real Estate",
  apartment: "Real Estate",
  apartments: "Real Estate",

  // Jobs
  job: "Jobs",
  jobs: "Jobs",
  employment: "Jobs",
  career: "Jobs",
  careers: "Jobs",
  vacancy: "Jobs",
  vacancies: "Jobs",

  // Electronics
  electronic: "Electronics",
  electronics: "Electronics",
  electronicss: "Electronics",
  gadget: "Electronics",
  gadgets: "Electronics",
  device: "Electronics",
  devices: "Electronics",

  // Fashion
  fashion: "Fashion",
  clothing: "Fashion",
  clothes: "Fashion",
  apparel: "Fashion",
  shoes: "Fashion",
  footwear: "Fashion",
  bags: "Fashion",
  bag: "Fashion",

  // Home
  home: "Home",
  homes: "Home",
  homegoods: "Home",
  "home goods": "Home",
  furniture: "Home",
  appliance: "Home",
  appliances: "Home",

  // TVs
  tv: "TVs",
  tvs: "TVs",
  television: "TVs",
  televisions: "TVs",
  "smart tv": "TVs",
  "smart tvs": "TVs",

  // Game Consoles
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

  // Smartwatches
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

  // Spare Parts
  "spare part": "Spare Parts",
  "spare parts": "Spare Parts",
  sparepart: "Spare Parts",
  spareparts: "Spare Parts",
  auto_part: "Spare Parts",
  "auto part": "Spare Parts",
  "auto parts": "Spare Parts",
  "car part": "Spare Parts",
  "car parts": "Spare Parts",
  "vehicle part": "Spare Parts",
  "vehicle parts": "Spare Parts",

  // Cosmetics
  cosmetic: "Cosmetics",
  cosmetics: "Cosmetics",
  makeup: "Cosmetics",
  beauty: "Cosmetics",
  skincare: "Cosmetics",
  "skin care": "Cosmetics",
  haircare: "Cosmetics",
  "hair care": "Cosmetics",
  perfume: "Cosmetics",
  perfumes: "Cosmetics",
  fragrance: "Cosmetics",
  fragrances: "Cosmetics",

  // Other
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
  if (value === undefined || value === null) {
    return "Other";
  }

  let normalized = String(value)
    .trim()
    .toLowerCase();

  if (!normalized) {
    return "Other";
  }

  normalized = normalized
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (
    Object.prototype.hasOwnProperty.call(
      PRODUCT_CATEGORY_ALIASES,
      normalized
    )
  ) {
    return PRODUCT_CATEGORY_ALIASES[normalized];
  }

  const exactCategory = PRODUCT_CATEGORIES.find(
    (category) =>
      category.toLowerCase() === normalized
  );

  return exactCategory || "Other";
};

// ============================================================
// VALID CATEGORY
// ============================================================

const isValidProductCategory = (value) => {
  return PRODUCT_CATEGORIES.includes(
    normalizeProductCategory(value)
  );
};

// ============================================================
// STRICT CANONICAL CATEGORY CHECK
// ============================================================

const isCanonicalProductCategory = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  return PRODUCT_CATEGORIES.some(
    (category) =>
      category.toLowerCase() === normalized
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