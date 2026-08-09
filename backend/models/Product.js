// backend/models/Product.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ==========================
    // Basic Product Information
    // ==========================

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
    },

    category: {
      type: String,
      enum: [
        "Cars",
        "Phones",
        "Real Estate",
        "Jobs",
        "Electronics",
        "Fashion",
        "Home",
        "Other",
      ],
      default: "Other",
    },

    location: {
      type: String,
      default: "Ghana",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    // ==========================
    // Seller
    // ==========================

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

    // ==========================
    // Images / Videos
    // ==========================

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

    // ==========================
    // Product Details
    // ==========================

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

    storage: {
      type: String,
      default: "",
    },

    ram: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "",
    },

    // ==========================
    // Statistics
    // ==========================

    views: {
      type: Number,
      default: 0,
    },

    // ==========================
    // Status
    // ==========================

    status: {
      type: String,
      enum: [
        "active",
        "pending",
        "inactive",
        "sold",
      ],
      default: "active",
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
    },

    negotiation: {
      type: Boolean,
      default: false,
    },

    swapAccepted: {
      type: Boolean,
      default: false,
    },

    // ==========================
    // Phone-specific Details
    // ==========================

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
      default: "",
    },

    // ==========================
    // SEO
    // ==========================

    slug: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================================================
// AUTO-GENERATE SLUG
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
// INDEXES
// ============================================================

productSchema.index({
  title: "text",
  description: "text",
});

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

// ONLY ONE slug index definition
productSchema.index(
  { slug: 1 },
  {
    unique: true,
    sparse: true,
  }
);

// ============================================================
// MODEL
// ============================================================

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

module.exports = Product;