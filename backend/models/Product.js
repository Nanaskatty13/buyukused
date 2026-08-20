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
        "TVs",
        "Game Consoles",
        "Smartwatches",
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

    image: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

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
    // COMPUTER / TABLET / CONSOLE / TV / SMARTWATCH / CAR DETAILS
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

    // ─── Console‑specific ──────────────────────────────────────
    videoOutput: {
      type: String,
      default: "",
      trim: true,
    },

    region: {
      type: String,
      default: "",
      trim: true,
    },

    consoleType: {
      type: String,
      default: "",
      trim: true,
    },

    edition: {
      type: String,
      default: "",
      trim: true,
    },

    discDrive: {
      type: String,
      default: "",
      trim: true,
    },

    controllersIncluded: {
      type: String,
      default: "",
      trim: true,
    },

    battery: {
      type: String,
      default: "",
      trim: true,
    },

    resolution: {
      type: String,
      default: "",
      trim: true,
    },

    // ─── Smartwatch‑specific ──────────────────────────────────
    watchSize: {
      type: String,
      default: "",
      trim: true,
    },

    // ─── TV‑specific ──────────────────────────────────────────
    tvType: {
      type: String,
      default: "",
      trim: true,
    },

    displayTechnology: {
      type: String,
      default: "",
      trim: true,
    },

    refreshRate: {
      type: String,
      default: "",
      trim: true,
    },

    operatingSystem: {
      type: String,
      default: "",
      trim: true,
    },

    hdr: {
      type: String,
      default: "",
      trim: true,
    },

    hdmiPorts: {
      type: String,
      default: "",
      trim: true,
    },

    usbPorts: {
      type: String,
      default: "",
      trim: true,
    },

    smartTV: {
      type: Boolean,
      default: false,
    },

    voiceControl: {
      type: Boolean,
      default: false,
    },

    wallMountable: {
      type: Boolean,
      default: false,
    },

    // ─── Car‑specific ──────────────────────────────────────────
    mileage: {
      type: Number,
      default: null,
      min: 0,
    },

    bodyType: {
      type: String,
      default: "",
      trim: true,
    },

    fuelType: {
      type: String,
      default: "",
      trim: true,
    },

    transmission: {
      type: String,
      default: "",
      trim: true,
    },

    driveType: {
      type: String,
      default: "",
      trim: true,
    },

    engineSize: {
      type: String,
      default: "",
      trim: true,
    },

    seatingCapacity: {
      type: Number,
      default: null,
      min: 0,
    },

    exteriorColor: {
      type: String,
      default: "",
      trim: true,
    },

    interiorColor: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // ACCESSORY DETAILS
    // ========================================================

    accessoryType: {
      type: String,
      default: "",
      trim: true,
    },

    compatibleWith: {
      type: String,
      default: "",
      trim: true,
    },

    compatibility: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    material: {
      type: String,
      default: "",
      trim: true,
    },

    cableType: {
      type: String,
      default: "",
      trim: true,
    },

    connectorType: {
      type: String,
      default: "",
      trim: true,
    },

    powerOutput: {
      type: String,
      default: "",
      trim: true,
    },

    capacity: {
      type: String,
      default: "",
      trim: true,
    },

    batteryCapacity: {
      type: String,
      default: "",
      trim: true,
    },

    wireless: {
      type: Boolean,
      default: false,
    },

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
// CONSOLE / TV / SMARTWATCH FILTERS
// ============================================================

productSchema.index({
  videoOutput: 1,
});

productSchema.index({
  region: 1,
});

productSchema.index({
  resolution: 1,
});

productSchema.index({
  watchSize: 1,
});

// ─── TV indexes ────────────────────────────────────────────────

productSchema.index({
  tvType: 1,
});

productSchema.index({
  displayTechnology: 1,
});

productSchema.index({
  refreshRate: 1,
});

productSchema.index({
  operatingSystem: 1,
});

productSchema.index({
  hdr: 1,
});

productSchema.index({
  smartTV: 1,
});

// ─── Car indexes ────────────────────────────────────────────────

productSchema.index({
  mileage: 1,
});

productSchema.index({
  fuelType: 1,
});

productSchema.index({
  transmission: 1,
});

productSchema.index({
  bodyType: 1,
});

// ============================================================
// MODEL
// ============================================================

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

module.exports = Product;