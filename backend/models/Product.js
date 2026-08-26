// ============================================================
// backend/models/Product.js
// BuyUKUsed Product Model
// ============================================================

"use strict";

const mongoose = require("mongoose");

// ============================================================
// CONSTANTS
// ============================================================

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
      maxlength: 200,
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
      enum: PRODUCT_CATEGORIES,
      default: "Other",
      trim: true,
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
    // SELLER
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

    // Legacy single-image field.
    // Kept for backwards compatibility.
    image: {
      type: String,
      default: "",
      trim: true,
    },

    // Main product images.
    images: {
      type: [String],
      default: [],
    },

    // Product videos.
    videos: {
      type: [String],
      default: [],
    },

    // ========================================================
    // VISUAL SEARCH
    // ========================================================

    imageEmbedding: {
      type: [Number],
      default: undefined,
      select: false,
    },

    imageEmbeddingModel: {
      type: String,
      default: "",
      trim: true,
      select: false,
    },

    imageEmbeddingUpdatedAt: {
      type: Date,
      default: null,
      select: false,
    },

    // ========================================================
    // GENERAL PRODUCT DETAILS
    // ========================================================

    brand: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    model: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    condition: {
      type: String,
      enum: PRODUCT_CONDITIONS,
      default: "Good",
      trim: true,
    },

    warranty: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // COMPUTER / LAPTOP / TABLET
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

    operatingSystem: {
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

    // ========================================================
    // PHONE
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
      trim: true,
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
    // GAME CONSOLES
    // ========================================================

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

    // ========================================================
    // SMARTWATCH
    // ========================================================

    watchSize: {
      type: String,
      default: "",
      trim: true,
    },

    // ========================================================
    // TV
    // ========================================================

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

    // ========================================================
    // CARS
    // ========================================================

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
    // ACCESSORIES
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
    // SPARE PARTS
    // ========================================================

    sparePartType: {
      type: String,
      default: "",
      trim: true,
    },

    partNumber: {
      type: String,
      default: "",
      trim: true,
    },

    oemNumber: {
      type: String,
      default: "",
      trim: true,
    },

    partBrand: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleMake: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleModel: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleYear: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleGeneration: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleEngine: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleTrim: {
      type: String,
      default: "",
      trim: true,
    },

    partPosition: {
      type: String,
      default: "",
      trim: true,
    },

    partSide: {
      type: String,
      default: "",
      trim: true,
    },

    partMaterial: {
      type: String,
      default: "",
      trim: true,
    },

    partColor: {
      type: String,
      default: "",
      trim: true,
    },

    partCondition: {
      type: String,
      default: "",
      trim: true,
    },

    isOEM: {
      type: Boolean,
      default: false,
    },

    isAftermarket: {
      type: Boolean,
      default: false,
    },

    isGenuine: {
      type: Boolean,
      default: false,
    },

    isUsedPart: {
      type: Boolean,
      default: false,
    },

    isNewPart: {
      type: Boolean,
      default: false,
    },

    // ========================================================
    // COSMETICS
    // ========================================================

    cosmeticType: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticBrand: {
      type: String,
      default: "",
      trim: true,
    },

    productSize: {
      type: String,
      default: "",
      trim: true,
    },

    volume: {
      type: String,
      default: "",
      trim: true,
    },

    skinType: {
      type: String,
      default: "",
      trim: true,
    },

    hairType: {
      type: String,
      default: "",
      trim: true,
    },

    shade: {
      type: String,
      default: "",
      trim: true,
    },

    scent: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      default: "",
      trim: true,
    },

    ageGroup: {
      type: String,
      default: "",
      trim: true,
    },

    expiryDate: {
      type: String,
      default: "",
      trim: true,
    },

    ingredients: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    benefits: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    usageInstructions: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    countryOfOrigin: {
      type: String,
      default: "",
      trim: true,
    },

    crueltyFree: {
      type: Boolean,
      default: false,
    },

    vegan: {
      type: Boolean,
      default: false,
    },

    organic: {
      type: Boolean,
      default: false,
    },

    sealed: {
      type: Boolean,
      default: false,
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
      enum: PRODUCT_STATUSES,
      default: "active",
      index: true,
    },

    // ========================================================
    // PROMOTION
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
      index: true,
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

    this.slug = `${baseSlug || "product"}-${Date.now()}`;
  }

  next();
});

// ============================================================
// TEXT INDEX
// ============================================================

productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  model: "text",
  accessoryType: "text",
  compatibleWith: "text",
  compatibility: "text",
  sparePartType: "text",
  partNumber: "text",
  oemNumber: "text",
  partBrand: "text",
  vehicleMake: "text",
  vehicleModel: "text",
  cosmeticType: "text",
  cosmeticBrand: "text",
  skinType: "text",
  hairType: "text",
  ingredients: "text",
  benefits: "text",
  tvType: "text",
  consoleType: "text",
});

// ============================================================
// COMPOUND INDEXES
// ============================================================

productSchema.index({
  category: 1,
  location: 1,
  status: 1,
});

productSchema.index({
  sellerId: 1,
  createdAt: -1,
});

// ============================================================
// GENERAL INDEXES
// ============================================================

productSchema.index({
  createdAt: -1,
});

productSchema.index({
  price: 1,
});

// NOTE:
// brand and model already have index: true in their fields.
// Do NOT create productSchema.index({ brand: 1 })
// or productSchema.index({ model: 1 }) again.

// ============================================================
// PHONE INDEXES
// ============================================================

productSchema.index({
  simStatus: 1,
});

productSchema.index({
  batteryHealth: 1,
});

// ============================================================
// ACCESSORY INDEXES
// ============================================================

productSchema.index({
  accessoryType: 1,
});

productSchema.index({
  compatibleWith: 1,
});

productSchema.index({
  wireless: 1,
});

productSchema.index({
  original: 1,
});

// ============================================================
// GAME CONSOLE INDEXES
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

// ============================================================
// SMARTWATCH INDEX
// ============================================================

productSchema.index({
  watchSize: 1,
});

// ============================================================
// TV INDEXES
// ============================================================

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

// ============================================================
// CAR INDEXES
// ============================================================

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