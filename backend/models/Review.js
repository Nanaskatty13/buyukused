// ============================================================
// backend/models/Review.js
// BuyUKUsed - Review Model
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// REPORT SUB-SCHEMA
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
// SELLER REPLY SUB-SCHEMA
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
    // ========================================================
    // REVIEWER
    // ========================================================

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reviewerName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "Buyer",
    },

    reviewerAvatar: {
      type: String,
      trim: true,
      default: "",
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
      trim: true,
      maxlength: 200,
      default: "Seller",
    },

    // ========================================================
    // PRODUCT
    // ========================================================

    // IMPORTANT:
    // This is OPTIONAL.
    //
    // Seller review:
    // productId = undefined
    //
    // Product review:
    // productId = ObjectId

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

    // ========================================================
    // ORDER
    // ========================================================

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: undefined,
      index: true,
    },

    // ========================================================
    // RATING
    // ========================================================

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

    // ========================================================
    // COMMENT
    // ========================================================

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },

    // ========================================================
    // VERIFIED PURCHASE
    // ========================================================

    verifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ========================================================
    // HELPFUL
    // ========================================================

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

    // ========================================================
    // REPORTS
    // ========================================================

    reportedBy: {
      type: [reportSchema],
      default: [],
    },

    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ========================================================
    // SELLER REPLY
    // ========================================================

    sellerReply: {
      type: sellerReplySchema,
      default: () => ({
        text: "",
        repliedAt: null,
      }),
    },

    // ========================================================
    // STATUS
    // ========================================================

    status: {
      type: String,
      enum: [
        "published",
        "hidden",
        "removed",
      ],
      default: "published",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================
//
// IMPORTANT:
// Do NOT use:
//
// { reviewer: 1, sellerId: 1, productId: 1 }
//
// as a normal unique index.
//
// MongoDB can treat missing/null productId values as the same
// value and cause seller-only reviews to conflict.
//
// We therefore use PARTIAL UNIQUE indexes.
//
// ============================================================

// ------------------------------------------------------------
// ONE SELLER REVIEW PER BUYER
// ------------------------------------------------------------
//
// Applies ONLY to reviews where productId does NOT exist.
//
// Example:
//
// reviewer A -> seller A = allowed once
// reviewer A -> seller B = allowed
// reviewer B -> seller A = allowed
//
// ------------------------------------------------------------

reviewSchema.index(
  {
    reviewer: 1,
    sellerId: 1,
  },
  {
    unique: true,
    name: "unique_seller_review_per_buyer",
    partialFilterExpression: {
      productId: {
        $exists: false,
      },
      status: {
        $ne: "removed",
      },
    },
  }
);

// ------------------------------------------------------------
// ONE PRODUCT REVIEW PER BUYER
// ------------------------------------------------------------
//
// Example:
//
// reviewer A -> product A = allowed once
// reviewer A -> product B = allowed
//
// ------------------------------------------------------------

reviewSchema.index(
  {
    reviewer: 1,
    sellerId: 1,
    productId: 1,
  },
  {
    unique: true,
    name: "unique_product_review_per_buyer",
    partialFilterExpression: {
      productId: {
        $type: "objectId",
      },
      status: {
        $ne: "removed",
      },
    },
  }
);

// ============================================================
// QUERY INDEXES
// ============================================================

reviewSchema.index({
  sellerId: 1,
  status: 1,
  createdAt: -1,
});

reviewSchema.index({
  productId: 1,
  status: 1,
  createdAt: -1,
});

reviewSchema.index({
  sellerId: 1,
  rating: 1,
  status: 1,
});

reviewSchema.index({
  productId: 1,
  rating: 1,
  status: 1,
});

reviewSchema.index({
  reviewer: 1,
  createdAt: -1,
});

// ============================================================
// KEEP HELPFUL COUNT CORRECT
// ============================================================

reviewSchema.pre("save", function (next) {
  if (Array.isArray(this.helpfulBy)) {
    const uniqueIds = [];

    for (const id of this.helpfulBy) {
      const stringId = String(id);

      if (!uniqueIds.includes(stringId)) {
        uniqueIds.push(stringId);
      }
    }

    this.helpfulBy = uniqueIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    this.helpfulCount =
      this.helpfulBy.length;
  }

  // ----------------------------------------------------------
  // KEEP REPORT COUNT CORRECT
  // ----------------------------------------------------------

  if (Array.isArray(this.reportedBy)) {
    this.reportCount =
      this.reportedBy.length;
  }

  next();
});

// ============================================================
// MODEL
// ============================================================

const Review =
  mongoose.models.Review ||
  mongoose.model(
    "Review",
    reviewSchema
  );

module.exports = Review;