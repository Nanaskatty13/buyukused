// ============================================================
// backend/src/constants/productCategories.js
// BuyUKUsed Product Categories
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
  "Car Spare Parts",
  "Cosmetics",           // ← added
  "Other",
];

/**
 * Normalize a raw category string to a valid category from the list.
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

  // Map common frontend variants to the proper display name
  const lower = trimmed.toLowerCase();
  const mapping = {
    // Cars & Spare Parts
    carspareparts: "Car Spare Parts",
    "car spare parts": "Car Spare Parts",
    "car-spare-parts": "Car Spare Parts",
    cars: "Cars",

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
    "beauty": "Cosmetics",
    "skincare": "Cosmetics",
    "makeup": "Cosmetics",
  };

  if (mapping[lower]) {
    return mapping[lower];
  }

  // Fallback
  return "Other";
}

module.exports = {
  PRODUCT_CATEGORIES,
  normalizeProductCategory,
};