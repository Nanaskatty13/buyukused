// ============================================================
// backend/models/Review.js
// BuyUKUsed - Reviews & Ratings Model
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// REVIEW SCHEMA
// ============================================================

const reviewSchema = new mongoose.Schema(
  {
    // ==========================================================
    // REVIEWER
    // ==========================================================

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    reviewerName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    reviewerAvatar: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
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
      default: "",
      trim: true,
      maxlength: 100,
    },

    // ==========================================================
    // PRODUCT
    // ==========================================================

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
      index: true,
    },

    productTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    // ==========================================================
    // ORDER
    // ==========================================================

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    // ==========================================================
    // RATING
    // ==========================================================

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

    // ==========================================================
    // REVIEW
    // ==========================================================

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: [
        3,
        "Review must be at least 3 characters.",
      ],
      maxlength: [
        2000,
        "Review cannot exceed 2000 characters.",
      ],
    },

    // ==========================================================
    // VERIFIED PURCHASE
    // ==========================================================

    verifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ==========================================================
    // HELPFUL
    // ==========================================================

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

    // ==========================================================
    // REPORTING
    // ==========================================================

    reportedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        reason: {
          type: String,
          trim: true,
          maxlength: 500,
        },

        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    reportCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================================
    // SELLER REPLY
    // ==========================================================

    sellerReply: {
      text: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },

      repliedAt: {
        type: Date,
        default: null,
      },
    },

    // ==========================================================
    // MODERATION
    // ==========================================================

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
    versionKey: false,
  }
);

// ============================================================
// INDEXES
// ============================================================

// Seller reviews
reviewSchema.index({
  sellerId: 1,
  status: 1,
  createdAt: -1,
});

// Product reviews
reviewSchema.index({
  productId: 1,
  status: 1,
  createdAt: -1,
});

// Seller rating
reviewSchema.index({
  sellerId: 1,
  rating: 1,
});

// Product rating
reviewSchema.index({
  productId: 1,
  rating: 1,
});

// Reviewer history
reviewSchema.index({
  reviewer: 1,
  createdAt: -1,
});

// Helpful lookup
reviewSchema.index({
  helpfulBy: 1,
});

// ============================================================
// MODEL
// ============================================================

const Review =
  mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);

module.exports = Review;