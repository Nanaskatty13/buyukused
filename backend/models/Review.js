// ============================================================
// backend/models/Review.js
// BuyUKUsed Review Model
// ============================================================

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // REVIEWER (user who wrote the review) – consistent name
    // ----------------------------------------------------------

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ----------------------------------------------------------
    // REVIEW TYPE: PRODUCT, SELLER, or USER
    // ----------------------------------------------------------

    type: {
      type: String,
      enum: ["PRODUCT", "SELLER", "USER"],
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // ----------------------------------------------------------
    // TARGET USER (for USER type reviews)
    // ----------------------------------------------------------

    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // PRODUCT (for PRODUCT type reviews)
    // ----------------------------------------------------------

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // SELLER (for SELLER or PRODUCT reviews)
    // ----------------------------------------------------------

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // OPTIONAL ORDER
    // ----------------------------------------------------------

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // RATING
    // ----------------------------------------------------------

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // ----------------------------------------------------------
    // COMMENT
    // ----------------------------------------------------------

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },

    // ----------------------------------------------------------
    // ACTIVE STATUS (soft delete)
    // ----------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ----------------------------------------------------------
    // OPTIONAL MODERATION
    // ----------------------------------------------------------

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// VALIDATION – ensures required fields per review type
// ============================================================

reviewSchema.pre("validate", function (next) {
  const type = String(this.type || "").toUpperCase();

  if (type === "PRODUCT") {
    if (!this.productId) {
      return next(new Error("Product ID is required for a product review."));
    }
    if (!this.sellerId) {
      return next(new Error("Seller ID is required for a product review."));
    }
    this.targetUserId = null;
  } else if (type === "SELLER") {
    if (!this.sellerId) {
      return next(new Error("Seller ID is required for a seller review."));
    }
    this.productId = null;
    this.targetUserId = null;
  } else if (type === "USER") {
    if (!this.targetUserId) {
      return next(new Error("Target user ID is required for a user review."));
    }
    this.productId = null;
    this.sellerId = null;
  }
  next();
});

// ============================================================
// UNIQUE INDEXES (partial – prevent duplicate reviews)
// ============================================================

// -- PRODUCT: one user can review a product once
reviewSchema.index(
  { userId: 1, productId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "PRODUCT",
      productId: { $exists: true, $ne: null },
    },
    name: "unique_user_product_review",
  }
);

// -- SELLER: one user can review a seller once
reviewSchema.index(
  { userId: 1, sellerId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "SELLER",
      sellerId: { $exists: true, $ne: null },
    },
    name: "unique_user_seller_review",
  }
);

// -- USER: one user can review another user once
reviewSchema.index(
  { userId: 1, targetUserId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "USER",
      targetUserId: { $exists: true, $ne: null },
    },
    name: "unique_user_target_review",
  }
);

// ============================================================
// QUERY INDEXES
// ============================================================

reviewSchema.index({ productId: 1, type: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ sellerId: 1, type: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ targetUserId: 1, type: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, type: 1, createdAt: -1 });

// ============================================================
// JSON TRANSFORM
// ============================================================

reviewSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);