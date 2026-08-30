// backend/models/Product.js

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
      maxlength: 150,
    },

    sellerPhone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    // ========================================================
    // MEDIA
    // ========================================================

    image: {
      type: String,
      default: "",
      trim: true,
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
      maxlength: 150,
    },

    model: {
      type: String,
      default: "",
      trim: true,
      index: true,
      maxlength: 150,
    },

    color: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
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
      maxlength: 500,
    },

    // ========================================================
    // COMPUTER / LAPTOP / TABLET
    // ========================================================

    storage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    ram: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    processor: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    graphics: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    screenSize: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    year: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    connectivity: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    operatingSystem: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    battery: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    resolution: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
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
      maxlength: 200,
    },

    region: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    consoleType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    edition: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    discDrive: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    controllersIncluded: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    // ========================================================
    // SMARTWATCH
    // ========================================================

    watchSize: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ========================================================
    // TV
    // ========================================================

    tvType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    displayTechnology: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    refreshRate: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    hdr: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    hdmiPorts: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    usbPorts: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
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
      maxlength: 100,
    },

    fuelType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    transmission: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    driveType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    engineSize: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
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
      maxlength: 100,
    },

    interiorColor: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ========================================================
    // ACCESSORIES
    // ========================================================

    accessoryType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    compatibleWith: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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
      maxlength: 150,
    },

    cableType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    connectorType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    powerOutput: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    capacity: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    batteryCapacity: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
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
      maxlength: 150,
    },

    partNumber: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    oemNumber: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    partBrand: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    vehicleMake: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    vehicleModel: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    vehicleYear: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    vehicleGeneration: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    vehicleEngine: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    vehicleTrim: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    partPosition: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    partSide: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    partMaterial: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    partColor: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    partCondition: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
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
      maxlength: 150,
    },

    cosmeticBrand: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    productSize: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    volume: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    skinType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    hairType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    shade: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    scent: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    gender: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    ageGroup: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    expiryDate: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
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
      maxlength: 150,
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
      maxlength: 300,
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
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    this.slug = `${baseSlug || "product"}-${Date.now()}`;
  }

  next();
});

// ============================================================
// WEIGHTED TEXT INDEX FOR SMART SEARCH
// ============================================================

productSchema.index(
  {
    title: 'text',
    brand: 'text',
    model: 'text',
    category: 'text',
    description: 'text',
    storage: 'text',
    processor: 'text',
    ram: 'text',
    screenSize: 'text',
    // Additional fields for completeness (default weight 1)
    accessoryType: 'text',
    compatibleWith: 'text',
    compatibility: 'text',
    sparePartType: 'text',
    partNumber: 'text',
    oemNumber: 'text',
    partBrand: 'text',
    vehicleMake: 'text',
    vehicleModel: 'text',
    cosmeticType: 'text',
    cosmeticBrand: 'text',
    skinType: 'text',
    hairType: 'text',
    ingredients: 'text',
    benefits: 'text',
    tvType: 'text',
    consoleType: 'text',
  },
  {
    weights: {
      title: 10,
      brand: 8,
      model: 8,
      description: 5,
      category: 5,
      storage: 3,
      processor: 3,
      ram: 3,
      screenSize: 3,
      // All other fields default to weight 1
    },
    name: 'product_text_search_index',
  }
);

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