// ============================================================
// backend/models/Review.js
// BuyUKUsed - Review Model
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// SELLER REPLY SCHEMA
// ============================================================

const sellerReplySchema = new mongoose.Schema(
  {
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
  {
    _id: false,
  }
);

// ============================================================
// REPORT SCHEMA
// ============================================================

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "No reason provided",
    },

    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

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

    reviewerName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    reviewerAvatar: {
      type: String,
      trim: true,
      default: "",
    },

    // ----------------------------------------------------------
    // SELLER
    // ----------------------------------------------------------

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sellerName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
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

    productTitle: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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
    // REPORTS
    // ----------------------------------------------------------

    reportedBy: {
      type: [reportSchema],
      default: [],
    },

    reportCount: {
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
      index: true,
    },

    // ----------------------------------------------------------
    // SELLER REPLY
    // ----------------------------------------------------------

    sellerReply: {
      type: sellerReplySchema,
      default: () => ({
        text: "",
        repliedAt: null,
        repliedBy: null,
      }),
    },

    // ----------------------------------------------------------
    // VISIBILITY / ACTIVE STATUS
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
  moderationStatus: 1,
  createdAt: -1,
});

reviewSchema.index({
  productId: 1,
  createdAt: -1,
});

// ============================================================
// UNIQUE SELLER-ONLY REVIEW
// ============================================================
//
// One seller-only review per buyer.
//
// Applies when:
// - productId does NOT exist
// - orderId does NOT exist
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

      isActive: true,
    },

    name: "unique_seller_review_per_buyer",
  }
);

// ============================================================
// UNIQUE PRODUCT REVIEW
// ============================================================
//
// One review per buyer for the same product.
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

      isActive: true,
    },

    name: "unique_product_review_per_buyer",
  }
);

// ============================================================
// UNIQUE ORDER REVIEW
// ============================================================
//
// One review per buyer for the same order.
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

      isActive: true,
    },

    name: "unique_order_review_per_buyer",
  }
);

// ============================================================
// PRE-VALIDATION
// ============================================================

reviewSchema.pre("validate", function (next) {
  // ----------------------------------------------------------
  // Normalize optional productId
  // ----------------------------------------------------------

  if (
    this.productId === null ||
    this.productId === ""
  ) {
    this.productId = undefined;
  }

  // ----------------------------------------------------------
  // Normalize optional orderId
  // ----------------------------------------------------------

  if (
    this.orderId === null ||
    this.orderId === ""
  ) {
    this.orderId = undefined;
  }

  // ----------------------------------------------------------
  // Clean comment
  // ----------------------------------------------------------

  if (typeof this.comment === "string") {
    this.comment = this.comment.trim();
  }

  // ----------------------------------------------------------
  // Clean names
  // ----------------------------------------------------------

  if (typeof this.reviewerName === "string") {
    this.reviewerName =
      this.reviewerName.trim();
  }

  if (typeof this.sellerName === "string") {
    this.sellerName =
      this.sellerName.trim();
  }

  if (typeof this.productTitle === "string") {
    this.productTitle =
      this.productTitle.trim();
  }

  // ----------------------------------------------------------
  // Normalize rating
  // ----------------------------------------------------------

  if (this.rating !== undefined) {
    this.rating = Number(this.rating);
  }

  next();
});

// ============================================================
// PRE-SAVE COUNTERS
// ============================================================

reviewSchema.pre("save", function (next) {
  // Helpful count
  if (Array.isArray(this.helpfulBy)) {
    this.helpfulCount =
      this.helpfulBy.length;
  } else {
    this.helpfulCount = 0;
  }

  // Report count
  if (Array.isArray(this.reportedBy)) {
    this.reportCount =
      this.reportedBy.length;
  } else {
    this.reportCount = 0;
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

    // Do not expose the complete list of users
    // who marked a review helpful.
    delete ret.helpfulBy;

    // Do not expose the complete reporting list.
    delete ret.reportedBy;

    return ret;
  },
});

// ============================================================
// MODEL
// ============================================================

const Review =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);

module.exports = Review;