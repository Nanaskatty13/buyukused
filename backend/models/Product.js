// ============================================================
// backend/models/Product.js
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// PRODUCT SCHEMA
// ============================================================

const productSchema = new mongoose.Schema(
  {
    // ==========================================================
    // BASIC PRODUCT INFORMATION
    // ==========================================================

    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: 200,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    oldPrice: {
      type: Number,
      min: [0, "Old price cannot be negative"],
      default: null,
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: [
          "Phones",
          "Laptops",
          "Tablets",
          "Accessories",
          "Electronics",
          "Game Consoles",
          "Smartwatches",
          "TVs",
          "Cars",

          // ====================================================
          // COSMETICS
          // ====================================================

          "Cosmetics",
        ],
        message: "Invalid product category",
      },
      index: true,
    },

    location: {
      type: String,
      required: [true, "Product location is required"],
      trim: true,
      default: "Ghana",
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    // ==========================================================
    // SELLER
    // ==========================================================

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sellerName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    sellerPhone: {
      type: String,
      trim: true,
      required: [true, "Seller phone number is required"],
      maxlength: 30,
    },

    // ==========================================================
    // GENERAL PRODUCT INFORMATION
    // ==========================================================

    brand: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    model: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    color: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    condition: {
      type: String,
      trim: true,
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
      trim: true,
      default: "",
      maxlength: 100,
    },

    // ==========================================================
    // SELLING OPTIONS
    // ==========================================================

    negotiation: {
      type: Boolean,
      default: false,
    },

    swapAccepted: {
      type: Boolean,
      default: false,
    },

    // ==========================================================
    // PHONE FIELDS
    // ==========================================================

    storage: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    batteryHealth: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    faceId: {
      type: String,
      trim: true,
      default: "",
      enum: [
        "",
        "Working",
        "Not Working",
        "Not Available",
      ],
    },

    simStatus: {
      type: String,
      trim: true,
      default: "",
      enum: [
        "",
        "SIM Unlocked",
        "eSIM Unlocked",
        "Locked",
        "Bypass",
        "Not Available",
      ],
    },

    // ==========================================================
    // LAPTOP FIELDS
    // ==========================================================

    processor: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    ram: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    screenSize: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    graphics: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    // ==========================================================
    // TABLET / GENERAL ELECTRONICS
    // ==========================================================

    year: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    connectivity: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    // ==========================================================
    // ACCESSORIES
    // ==========================================================

    accessoryType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    compatibility: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    material: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    // ==========================================================
    // GAME CONSOLES
    // ==========================================================

    consoleType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    edition: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    discDrive: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    controllersIncluded: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    battery: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    resolution: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    videoOutput: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    // ==========================================================
    // SMARTWATCH
    // ==========================================================

    watchSize: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // ==========================================================
    // TV
    // ==========================================================

    tvType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    displayTechnology: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    refreshRate: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    operatingSystem: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    hdr: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    hdmiPorts: {
      type: String,
      trim: true,
      default: "",
      maxlength: 50,
    },

    usbPorts: {
      type: String,
      trim: true,
      default: "",
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

    // ==========================================================
    // CAR
    // ==========================================================

    mileage: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    bodyType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    fuelType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    transmission: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    driveType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    engineSize: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    seatingCapacity: {
      type: String,
      trim: true,
      default: "",
      maxlength: 50,
    },

    exteriorColor: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    interiorColor: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // ==========================================================
    // COSMETICS
    // ==========================================================

    cosmeticType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    cosmeticSubcategory: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    gender: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    skinType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    hairType: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    shade: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    volume: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    formulation: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    finish: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    fragrance: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    ingredients: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    benefits: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    suitableFor: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    skinConcern: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    spf: {
      type: String,
      trim: true,
      default: "",
      maxlength: 50,
    },

    expirationDate: {
      type: String,
      trim: true,
      default: "",
      maxlength: 50,
    },

    batchNumber: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    countryOfOrigin: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    authenticity: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    sealed: {
      type: Boolean,
      default: false,
    },

    // ==========================================================
    // MEDIA
    // ==========================================================

    // Legacy single-image field.
    // Kept for backwards compatibility.
    image: {
      type: String,
      trim: true,
      default: "",
    },

    // Multiple product images.
    images: {
      type: [String],
      default: [],
    },

    // Product videos.
    videos: {
      type: [String],
      default: [],
    },

    // ==========================================================
    // PRODUCT STATUS
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isSold: {
      type: Boolean,
      default: false,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  model: "text",
});

productSchema.index({
  category: 1,
  isActive: 1,
  createdAt: -1,
});

productSchema.index({
  sellerId: 1,
  createdAt: -1,
});

productSchema.index({
  location: 1,
  category: 1,
});

// ============================================================
// CLEAN JSON OUTPUT
// ============================================================

productSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;

    return ret;
  },
});

// ============================================================
// MODEL
// ============================================================

module.exports = mongoose.model(
  "Product",
  productSchema
);