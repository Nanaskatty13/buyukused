// ============================================================
// backend/constants/productCategories.js
// BuyUKUsed Product Categories – shared constants
// ============================================================

"use strict";

const PRODUCT_CATEGORIES = [
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
];

const PRODUCT_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

const PRODUCT_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

/**
 * Normalize a raw category string to a valid category from the list.
 * Maps common frontend / API variants to the proper display name.
 * @param {string} category
 * @returns {string} Valid category or "Other"
 */
function normalizeProductCategory(category) {
  if (!category) return "Other";

  const trimmed = category.trim();

  // If it's already in the list, return it
  if (PRODUCT_CATEGORIES.includes(trimmed)) {
    return trimmed;
  }

  // Map common frontend / API variants
  const lower = trimmed.toLowerCase();
  const mapping = {
    // Cars & Spare Parts
    cars: "Cars",
    carspareparts: "Spare Parts",
    "car spare parts": "Spare Parts",
    "car-spare-parts": "Spare Parts",
    "spare parts": "Spare Parts",
    spareparts: "Spare Parts",

    // Phones, Laptops, Tablets
    phones: "Phones",
    laptops: "Laptops",
    tablets: "Tablets",
    accessories: "Accessories",
    electronics: "Electronics",

    // Consoles & Watches
    gameconsoles: "Game Consoles",
    "game consoles": "Game Consoles",
    smartwatches: "Smartwatches",
    tvs: "TVs",

    // Real Estate, Jobs, Fashion, Home
    realestate: "Real Estate",
    "real estate": "Real Estate",
    jobs: "Jobs",
    fashion: "Fashion",
    home: "Home",

    // Cosmetics
    cosmetics: "Cosmetics",
    cosmetic: "Cosmetics",
    "cosmetic products": "Cosmetics",
    beauty: "Cosmetics",
    skincare: "Cosmetics",
    makeup: "Cosmetics",
  };

  return mapping[lower] || "Other";
}

module.exports = {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  PRODUCT_CONDITIONS,
  normalizeProductCategory,
};