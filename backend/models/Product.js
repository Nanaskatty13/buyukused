// ============================================================
// backend/models/Product.js
// ============================================================

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
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
        "Game Consoles",   // ✅ added
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
      enum: ["Brand New", "Like New", "Excellent", "Good", "Fair", "Poor"],
      default: "Good",
    },
    warranty: {
      type: String,
      default: "",
      trim: true,
    },
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
    // ─── Console fields ──────────────────────────────────────
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
    // ─── Accessory fields ────────────────────────────────────
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
    // ─── Phone fields ────────────────────────────────────────
    batteryHealth: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    faceId: {
      type: String,
      enum: ["Working", "Not Working", "Not Available", ""],
      default: "",
    },
    simStatus: {
      type: String,
      enum: ["eSIM Unlocked", "SIM Unlocked", "Locked", "Bypass", "Not Available", ""],
      default: "",
      trim: true,
    },
    negotiation: {
      type: Boolean,
      default: false,
    },
    swapAccepted: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "pending", "inactive", "sold"],
      default: "active",
      index: true,
    },
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

// Auto‑slug
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

// Indexes
productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  model: "text",
  accessoryType: "text",
  compatibleWith: "text",
  compatibility: "text",
});
productSchema.index({ category: 1, location: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ sellerId: 1, createdAt: -1 });
productSchema.index({ simStatus: 1 });
productSchema.index({ batteryHealth: 1 });
productSchema.index({ accessoryType: 1 });
productSchema.index({ compatibleWith: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ wireless: 1 });
productSchema.index({ original: 1 });
productSchema.index({ videoOutput: 1 });
productSchema.index({ region: 1 });
productSchema.index({ resolution: 1 });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;