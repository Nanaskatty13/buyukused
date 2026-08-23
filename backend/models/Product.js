// ============================================================
// backend/models/Product.js
// BuyUKUsed Product Model
// ============================================================

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
      default: null,
      min: [0, "Old price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: {
        values: PRODUCT_CATEGORIES,
        message: "Invalid product category: {VALUE}",
      },
      default: "Other",
      index: true,
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Product location is required"],
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
      required: [true, "Seller phone number is required"],
      default: "",
      trim: true,
      maxlength: 30,
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
    // GENERAL PRODUCT DETAILS
    // ========================================================

    brand: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
      index: true,
    },

    model: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
      index: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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
      maxlength: 100,
    },

    // ========================================================
    // COMPUTER / TABLET
    // ========================================================

    storage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
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
      maxlength: 20,
    },

    connectivity: {
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
      maxlength: 300,
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
      maxlength: 200,
    },

    cableType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    connectorType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
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
    // GAME CONSOLES
    // ========================================================

    videoOutput: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
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
      maxlength: 100,
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
      maxlength: 100,
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
      maxlength: 100,
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
      maxlength: 100,
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

    operatingSystem: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
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
    // CAR
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
    // COSMETICS
    // ========================================================

    cosmeticType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    cosmeticSubcategory: {
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

    skinType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    hairType: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    shade: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    volume: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    formulation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    finish: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    fragrance: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    ingredients: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    benefits: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    suitableFor: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    skinConcern: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    spf: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    expirationDate: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    batchNumber: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    countryOfOrigin: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    authenticity: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
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
    strict: true,
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
  cosmeticType: "text",
  cosmeticSubcategory: "text",
  ingredients: "text",
  benefits: "text",
});

// ============================================================
// OTHER INDEXES
// ============================================================

productSchema.index({
  category: 1,
  location: 1,
  status: 1,
});

productSchema.index({
  createdAt: -1,
});

productSchema.index({
  price: 1,
});

productSchema.index({
  sellerId: 1,
  createdAt: -1,
});

productSchema.index({
  simStatus: 1,
});

productSchema.index({
  batteryHealth: 1,
});

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
  model: 1,
});

productSchema.index({
  wireless: 1,
});

productSchema.index({
  original: 1,
});

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

productSchema.index({
  cosmeticType: 1,
});

productSchema.index({
  cosmeticSubcategory: 1,
});

productSchema.index({
  skinType: 1,
});

productSchema.index({
  hairType: 1,
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

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

module.exports = Product;