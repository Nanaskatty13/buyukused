// ============================================================
// backend/models/Review.js
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// REVIEW SCHEMA
// ============================================================

const reviewSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // BUYER / REVIEWER
    // ----------------------------------------------------------

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ----------------------------------------------------------
    // SELLER BEING REVIEWED
    // ----------------------------------------------------------

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ----------------------------------------------------------
    // OPTIONAL PRODUCT
    // ----------------------------------------------------------

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: undefined,
      index: true,
    },

    // ----------------------------------------------------------
    // OPTIONAL ORDER
    // ----------------------------------------------------------

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: undefined,
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
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5.",
      },
    },

    // ----------------------------------------------------------
    // COMMENT
    // ----------------------------------------------------------

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

    // ----------------------------------------------------------
    // HELPFUL
    // ----------------------------------------------------------

    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ----------------------------------------------------------
    // VERIFIED PURCHASE
    // ----------------------------------------------------------

    verifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // ----------------------------------------------------------
    // SELLER REPLY
    // ----------------------------------------------------------

    sellerReply: {
      text: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      repliedAt: {
        type: Date,
        default: null,
      },

      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ----------------------------------------------------------
    // MODERATION
    // ----------------------------------------------------------

    moderationStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "approved",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// NORMAL INDEXES
// ============================================================

reviewSchema.index({
  sellerId: 1,
  createdAt: -1,
});

reviewSchema.index({
  reviewerId: 1,
  createdAt: -1,
});

reviewSchema.index({
  sellerId: 1,
  rating: 1,
});

reviewSchema.index({
  sellerId: 1,
  isActive: 1,
  isVisible: 1,
  createdAt: -1,
});

// ============================================================
// IMPORTANT UNIQUE INDEXES
// ============================================================
//
// DO NOT create one giant unique index such as:
//
// sellerId + reviewerId + productId + orderId
//
// because productId/orderId are optional.
//
// For seller-only reviews, allow only ONE review from the
// same buyer for the same seller.
//
// This index applies ONLY when productId and orderId do not
// exist.
//
// ============================================================

reviewSchema.index(
  {
    sellerId: 1,
    reviewerId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      productId: {
        $exists: false,
      },
      orderId: {
        $exists: false,
      },
    },

    name: "unique_seller_review_per_buyer",
  }
);

// ============================================================
// PRODUCT REVIEW INDEX
// ============================================================
//
// If a product is supplied, the same buyer can review different
// products from the same seller.
//
// But they cannot review the SAME product twice.
//
// ============================================================

reviewSchema.index(
  {
    sellerId: 1,
    reviewerId: 1,
    productId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      productId: {
        $exists: true,
      },
      orderId: {
        $exists: false,
      },
    },

    name: "unique_product_review_per_buyer",
  }
);

// ============================================================
// ORDER REVIEW INDEX
// ============================================================
//
// If an order is supplied, the same buyer can review multiple
// orders from the same seller.
//
// But they cannot review the SAME order twice.
//
// ============================================================

reviewSchema.index(
  {
    sellerId: 1,
    reviewerId: 1,
    orderId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      orderId: {
        $exists: true,
      },
    },

    name: "unique_order_review_per_buyer",
  }
);

// ============================================================
// PRE-VALIDATION
// ============================================================

reviewSchema.pre("validate", function (next) {
  // ----------------------------------------------------------
  // Normalize IDs
  // ----------------------------------------------------------

  if (this.productId === null || this.productId === "") {
    this.productId = undefined;
  }

  if (this.orderId === null || this.orderId === "") {
    this.orderId = undefined;
  }

  // ----------------------------------------------------------
  // Clean comment
  // ----------------------------------------------------------

  if (typeof this.comment === "string") {
    this.comment = this.comment.trim();
  }

  // ----------------------------------------------------------
  // Clean rating
  // ----------------------------------------------------------

  if (this.rating !== undefined) {
    this.rating = Number(this.rating);
  }

  next();
});

// ============================================================
// HELPFUL COUNT
// ============================================================

reviewSchema.pre("save", function (next) {
  if (Array.isArray(this.helpfulBy)) {
    this.helpfulCount = this.helpfulBy.length;
  } else {
    this.helpfulCount = 0;
  }

  next();
});

// ============================================================
// JSON TRANSFORM
// ============================================================

reviewSchema.set("toJSON", {
  virtuals: true,

  transform: function (doc, ret) {
    delete ret.__v;

    // Never expose internal helpfulBy list unnecessarily.
    delete ret.helpfulBy;

    return ret;
  },
});

// ============================================================
// VIRTUAL
// ============================================================

reviewSchema.virtual("hasHelpful").get(function () {
  return false;
});

// ============================================================
// MODEL
// ============================================================

const Review =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);

module.exports = Review;