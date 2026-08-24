// ============================================================
// backend/controllers/favoriteController.js
// ============================================================

const mongoose = require("mongoose");

const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// ============================================================
// HELPER: GET USER ID
// ============================================================

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    null
  );
};

// ============================================================
// ADD PRODUCT TO FAVORITES
// POST /api/favorites
// ============================================================

const addFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Make sure product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check whether it already exists
    const existingFavorite = await Favorite.findOne({
      userId,
      productId,
    });

    if (existingFavorite) {
      return res.status(200).json({
        success: true,
        message: "Product is already in your favorites.",
        favorite: existingFavorite,
        isFavorite: true,
      });
    }

    const favorite = await Favorite.create({
      userId,
      productId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to favorites.",
      favorite,
      isFavorite: true,
    });
  } catch (error) {
    console.error("❌ Add favorite error:", error);

    // Duplicate index protection
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Product is already in your favorites.",
        isFavorite: true,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add product to favorites.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// REMOVE PRODUCT FROM FAVORITES
// DELETE /api/favorites/:productId
// ============================================================

const removeFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const deletedFavorite = await Favorite.findOneAndDelete({
      userId,
      productId,
    });

    if (!deletedFavorite) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your favorites.",
        isFavorite: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from favorites.",
      isFavorite: false,
    });
  } catch (error) {
    console.error("❌ Remove favorite error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from favorites.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// TOGGLE FAVORITE
// POST /api/favorites/:productId/toggle
// ============================================================

const toggleFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    // Make sure product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Check current favorite
    const existingFavorite = await Favorite.findOne({
      userId,
      productId,
    });

    // ========================================================
    // REMOVE
    // ========================================================

    if (existingFavorite) {
      await Favorite.deleteOne({
        _id: existingFavorite._id,
      });

      return res.status(200).json({
        success: true,
        message: "Product removed from favorites.",
        isFavorite: false,
        favorite: null,
      });
    }

    // ========================================================
    // ADD
    // ========================================================

    const favorite = await Favorite.create({
      userId,
      productId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to favorites.",
      isFavorite: true,
      favorite,
    });
  } catch (error) {
    console.error("❌ Toggle favorite error:", error);

    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Product is already in your favorites.",
        isFavorite: true,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update favorite.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// GET MY FAVORITES
// GET /api/favorites
// ============================================================

const getMyFavorites = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const favorites = await Favorite.find({
      userId,
    })
      .populate({
        path: "productId",
        populate: {
          path: "sellerId",
          select:
            "name email phone avatar profileImage photo photoURL isVerified shopName rating role",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Remove favorites whose product was deleted
    const validFavorites = favorites.filter(
      (favorite) => favorite.productId
    );

    return res.status(200).json({
      success: true,
      count: validFavorites.length,
      favorites: validFavorites,
    });
  } catch (error) {
    console.error("❌ Get favorites error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load favorites.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// CHECK IF PRODUCT IS FAVORITED
// GET /api/favorites/check/:productId
// ============================================================

const checkFavorite = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        isFavorite: false,
      });
    }

    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
        isFavorite: false,
      });
    }

    const favorite = await Favorite.findOne({
      userId,
      productId,
    }).lean();

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
      favorite: favorite || null,
    });
  } catch (error) {
    console.error("❌ Check favorite error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to check favorite.",
      isFavorite: false,
    });
  }
};

// ============================================================
// GET FAVORITE PRODUCT IDS
// GET /api/favorites/ids
// ============================================================

const getFavoriteIds = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const favorites = await Favorite.find({
      userId,
    })
      .select("productId")
      .lean();

    const productIds = favorites
      .map((favorite) => favorite.productId)
      .filter(Boolean)
      .map((id) => String(id));

    return res.status(200).json({
      success: true,
      count: productIds.length,
      productIds,
    });
  } catch (error) {
    console.error("❌ Get favorite IDs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load favorite IDs.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  getMyFavorites,
  checkFavorite,
  getFavoriteIds,
};