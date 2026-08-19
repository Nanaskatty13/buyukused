// ============================================================
// backend/models/Product.js
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// PRODUCT SCHEMA
// ============================================================

const productSchema = new mongoose.Schema(
  {
    // ========================================================
    // BASIC INFORMATION
    // ========================================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    category: {
      type: String,
      enum: [
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
        "Other",
      ],
      default: "Other",
      index: true,
    },

    location: {
      type: String,
      default: "Ghana",
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    // ========================================================
    // SELLER INFORMATION
    // ========================================================

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sellerName: {
      type: String,
      default: "",
      trim: true,
    },

    sellerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // MEDIA
    // ========================================================

    // Legacy single image
    image: {
      type: String,
      default: "",
    },

    // Product images
    images: {
      type: [String],
      default: [],
    },

    // Product videos
    videos: {
      type: [String],
      default: [],
    },

    // ========================================================
    // GENERAL PRODUCT DETAILS
    // ========================================================

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    model: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    condition: {
      type: String,
      enum: [
        "Brand New",
        "Like New",
        "Excellent",
        "Good",
        "Fair",
        "Poor",
      ],
      default: "Good",
    },

    warranty: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // COMPUTER / TABLET DETAILS
    // ========================================================

    storage: {
      type: String,
      default: "",
      trim: true,
    },

    ram: {
      type: String,
      default: "",
      trim: true,
    },

    processor: {
      type: String,
      default: "",
      trim: true,
    },

    graphics: {
      type: String,
      default: "",
      trim: true,
    },

    screenSize: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: String,
      default: "",
      trim: true,
    },

    connectivity: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // ACCESSORY DETAILS
    // ========================================================

    // Example:
    // Charger
    // AirPods
    // Earphones
    // Power Bank
    // Smart Watch
    // Phone Case
    // Screen Protector
    // Cable
    // Wireless Charger
    // Bluetooth Speaker
    accessoryType: {
      type: String,
      default: "",
      trim: true,
    },

    // Example:
    // iPhone 15
    // Samsung Galaxy S24
    // iPad
    // MacBook
    compatibleWith: {
      type: String,
      default: "",
      trim: true,
    },

    // More detailed compatibility information
    compatibility: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    // Accessory material
    // Leather, Silicone, Plastic, Metal, etc.
    material: {
      type: String,
      default: "",
      trim: true,
    },

    // Cable-specific
    cableType: {
      type: String,
      default: "",
      trim: true,
    },

    // USB-C, Lightning, Micro USB, etc.
    connectorType: {
      type: String,
      default: "",
      trim: true,
    },

    // Charger / power bank output
    // Example: 20W, 25W, 65W
    powerOutput: {
      type: String,
      default: "",
      trim: true,
    },

    // Storage/capacity for applicable accessories
    // Example: 128GB memory card
    capacity: {
      type: String,
      default: "",
      trim: true,
    },

    // Power bank / battery-powered accessories
    // Example: 10,000mAh
    batteryCapacity: {
      type: String,
      default: "",
      trim: true,
    },

    // Wireless accessory
    wireless: {
      type: Boolean,
      default: false,
    },

    // Seller indicates whether accessory is original
    original: {
      type: Boolean,
      default: false,
    },

    // ========================================================
    // PHONE DETAILS
    // ========================================================

    batteryHealth: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    faceId: {
      type: String,
      enum: [
        "Working",
        "Not Working",
        "Not Available",
        "",
      ],
      default: "",
    },

    // Only meaningful for Phones.
    // Backend should leave this empty for Accessories.
    simStatus: {
      type: String,
      enum: [
        "eSIM Unlocked",
        "SIM Unlocked",
        "Locked",
        "Bypass",
        "Not Available",
        "",
      ],
      default: "",
      trim: true,
    },

    // ========================================================
    // SELLING OPTIONS
    // ========================================================

    negotiation: {
      type: Boolean,
      default: false,
    },

    swapAccepted: {
      type: Boolean,
      default: false,
    },

    // ========================================================
    // STATISTICS
    // ========================================================

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ========================================================
    // STATUS
    // ========================================================

    status: {
      type: String,
      enum: [
        "active",
        "pending",
        "inactive",
        "sold",
      ],
      default: "active",
      index: true,
    },

    // ========================================================
    // PROMOTION / VERIFICATION
    // ========================================================

    promo: {
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    yearsOnPlatform: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ========================================================
    // SEO
    // ========================================================

    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================================================
// AUTO SLUG
// ============================================================

productSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    this.slug = `${baseSlug}-${Date.now()}`;
  }

  next();
});

// ============================================================
// TEXT SEARCH INDEX
// ============================================================

productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  model: "text",
  accessoryType: "text",
  compatibleWith: "text",
  compatibility: "text",
});

// ============================================================
// CATEGORY / LOCATION / STATUS
// ============================================================

productSchema.index({
  category: 1,
  location: 1,
  status: 1,
});

// ============================================================
// NEWEST PRODUCTS
// ============================================================

productSchema.index({
  createdAt: -1,
});

// ============================================================
// PRICE
// ============================================================

productSchema.index({
  price: 1,
});

// ============================================================
// SELLER PRODUCTS
// ============================================================

productSchema.index({
  sellerId: 1,
  createdAt: -1,
});

// ============================================================
// PHONE FILTERS
// ============================================================

productSchema.index({
  simStatus: 1,
});

productSchema.index({
  batteryHealth: 1,
});

// ============================================================
// ACCESSORY FILTERS
// ============================================================

productSchema.index({
  accessoryType: 1,
});

productSchema.index({
  compatibleWith: 1,
});

productSchema.index({
  brand: 1,
});

productSchema.index({
  wireless: 1,
});

productSchema.index({
  original: 1,
});

// ============================================================
// MODEL
// ============================================================

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

module.exports = Product;