// ============================================================
// backend/models/Review.js
// BuyUKUsed Review Model
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// REVIEW SCHEMA
// ============================================================

const reviewSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // USER WHO CREATED THE REVIEW
    // ----------------------------------------------------------

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ----------------------------------------------------------
    // REVIEW TYPE
    // ----------------------------------------------------------

    type: {
      type: String,
      enum: ["PRODUCT", "SELLER"],
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    // ----------------------------------------------------------
    // PRODUCT
    // ----------------------------------------------------------

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },

    // ----------------------------------------------------------
    // SELLER
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
    // ACTIVE STATUS
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
// VALIDATION
// ============================================================

reviewSchema.pre("validate", function (next) {
  const type = String(this.type || "").toUpperCase();

  // ----------------------------------------------------------
  // PRODUCT REVIEW
  // ----------------------------------------------------------

  if (type === "PRODUCT") {
    if (!this.productId) {
      return next(
        new Error(
          "Product ID is required for a product review."
        )
      );
    }

    if (!this.sellerId) {
      return next(
        new Error(
          "Seller ID is required for a product review."
        )
      );
    }
  }

  // ----------------------------------------------------------
  // SELLER REVIEW
  // ----------------------------------------------------------

  if (type === "SELLER") {
    if (!this.sellerId) {
      return next(
        new Error(
          "Seller ID is required for a seller review."
        )
      );
    }

    // Seller reviews do NOT require a product.
    this.productId = null;
  }

  next();
});

// ============================================================
// IMPORTANT UNIQUE INDEXES
// ============================================================
//
// PRODUCT:
// One user can review each product only once.
//
// SELLER:
// One user can review each seller only once.
//
// These are partial indexes so PRODUCT reviews don't interfere
// with SELLER reviews and vice versa.
// ============================================================

reviewSchema.index(
  {
    userId: 1,
    productId: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "PRODUCT",
      productId: {
        $exists: true,
        $ne: null,
      },
    },
    name: "unique_user_product_review",
  }
);

reviewSchema.index(
  {
    userId: 1,
    sellerId: 1,
    type: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "SELLER",
      sellerId: {
        $exists: true,
        $ne: null,
      },
    },
    name: "unique_user_seller_review",
  }
);

// ============================================================
// QUERY INDEXES
// ============================================================

reviewSchema.index({
  productId: 1,
  type: 1,
  isActive: 1,
  createdAt: -1,
});

reviewSchema.index({
  sellerId: 1,
  type: 1,
  isActive: 1,
  createdAt: -1,
});

reviewSchema.index({
  userId: 1,
  type: 1,
  createdAt: -1,
});

// ============================================================
// JSON OUTPUT
// ============================================================

reviewSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

// ============================================================
// MODEL
// ============================================================

module.exports =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);