// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },
    category: {
      type: String,
      enum: ["Cars", "Phones", "Real Estate", "Jobs", "Electronics", "Fashion", "Home", "Other"],
      default: "Other",
    },
    location: { type: String, default: "Ghana", trim: true },
    description: { type: String, default: "", trim: true, maxlength: 5000 },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerName: { type: String, default: "", trim: true },
    sellerPhone: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    brand: { type: String, default: "", trim: true },
    model: { type: String, default: "", trim: true },
    condition: {
      type: String,
      enum: ["Brand New", "Like New", "Excellent", "Good", "Fair", "Poor"],
      default: "Good",
    },
    storage: { type: String, default: "" },
    ram: { type: String, default: "" },
    color: { type: String, default: "" },
    views: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "pending", "inactive", "sold"],
      default: "active",
    },
    promo: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    yearsOnPlatform: { type: Number, default: 0 },
    negotiation: { type: Boolean, default: false },
    swapAccepted: { type: Boolean, default: false },

    // --- NEW FIELDS for detailed product info ---
    batteryHealth: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    faceId: {
      type: String,
      default: "",
      trim: true,
      // No enum – allows "Working", "Not Working", "Not Available", etc.
    },
    simStatus: {
      type: String,
      default: "",
      trim: true,
    },

    // --- Slug (SEO‑friendly URL) ---
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Pre‑save hook to generate unique slug from title
productSchema.pre("save", async function (next) {
  if (!this.slug && this.title) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    this.slug = baseSlug + "-" + Date.now();
  }
  next();
});

// Indexes
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, location: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 }, { unique: true });

// Use existing model if already defined (for hot reload)
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
module.exports = Product;