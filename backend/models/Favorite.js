// ============================================================
// backend/models/Favorite.js
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// FAVORITE SCHEMA
// ============================================================

const favoriteSchema = new mongoose.Schema(
  {
    // The user who favorited the product
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The product that was favorited
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================================================
// PREVENT DUPLICATE FAVORITES
// ============================================================

favoriteSchema.index(
  { userId: 1, productId: 1 },
  { unique: true }
);

// ============================================================
// MODEL
// ============================================================

const Favorite =
  mongoose.models.Favorite ||
  mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;