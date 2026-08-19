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
        "Game Consoles",
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
    // COMPUTER / TABLET / GENERAL DEVICE DETAILS
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
    // GAME CONSOLE DETAILS
    // ========================================================

    // Console type
    // Example:
    // Home Console
    // Handheld Console
    // Hybrid Console
    // Retro Console
    consoleType: {
      type: String,
      default: "",
      trim: true,
    },

    // Console edition
    // Example:
    // Standard
    // Digital Edition
    // Disc Edition
    // Slim
    // Pro
    // OLED
    // Special Edition
    edition: {
      type: String,
      default: "",
      trim: true,
    },

    // Storage is already defined above.
    // Example:
    // 256GB
    // 512GB
    // 825GB
    // 1TB
    // 2TB

    // Video output
    // Example:
    // HDMI
    // HDMI 2.1
    // DisplayPort
    // AV
    videoOutput: {
      type: String,
      default: "",
      trim: true,
    },

    // Maximum supported resolution
    // Example:
    // 1080p
    // 1440p
    // 4K
    // 8K
    resolution: {
      type: String,
      default: "",
      trim: true,
    },

    // Region
    // Example:
    // USA
    // UK
    // Europe
    // Japan
    // Ghana / Africa
    // Worldwide
    region: {
      type: String,
      default: "",
      trim: true,
    },

    // Number of controllers included
    controllerCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Type of controller
    // Example:
    // DualSense
    // DualShock 4
    // Xbox Wireless Controller
    // Joy-Con
    controllerType: {
      type: String,
      default: "",
      trim: true,
    },

    // Whether controllers are included
    controllersIncluded: {
      type: Boolean,
      default: false,
    },

    // Physical game disc support
    discDrive: {
      type: String,
      enum: [
        "Yes",
        "No",
        "Not Available",
        "",
      ],
      default: "",
    },

    // Digital games support
    digitalEdition: {
      type: Boolean,
      default: false,
    },

    // Online multiplayer support
    onlineGaming: {
      type: Boolean,
      default: false,
    },

    // Wi-Fi / Bluetooth / Ethernet etc.
    networkSupport: {
      type: String,
      default: "",
      trim: true,
    },

    // CPU information
    cpu: {
      type: String,
      default: "",
      trim: true,
    },

    // GPU information
    gpu: {
      type: String,
      default: "",
      trim: true,
    },

    // Game console operating system
    operatingSystem: {
      type: String,
      default: "",
      trim: true,
    },

    // Whether the original box is included
    boxIncluded: {
      type: Boolean,
      default: false,
    },

    // Whether original accessories are included
    originalAccessories: {
      type: Boolean,
      default: false,
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

  // Game console search
  consoleType: "text",
  edition: "text",
  controllerType: "text",
  videoOutput: "text",
  resolution: "text",
  region: "text",
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
// GAME CONSOLE FILTERS
// ============================================================

productSchema.index({
  consoleType: 1,
});

productSchema.index({
  edition: 1,
});

productSchema.index({
  videoOutput: 1,
});

productSchema.index({
  resolution: 1,
});

productSchema.index({
  region: 1,
});

productSchema.index({
  controllerCount: 1,
});

productSchema.index({
  discDrive: 1,
});

productSchema.index({
  controllersIncluded: 1,
});

productSchema.index({
  onlineGaming: 1,
});

// ============================================================
// MODEL
// ============================================================

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

module.exports = Product;