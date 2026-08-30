// ============================================================
// backend/controllers/reviewController.js
// BuyUKUsed Review Controller
// ============================================================

const mongoose = require("mongoose");

const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

// ============================================================
// HELPERS
// ============================================================

const normalizeType = (type) => {
  return String(type || "")
    .trim()
    .toUpperCase();
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.auth?.userId ||
    req.auth?.id ||
    null
  );
};

// ============================================================
// GET PRODUCT REVIEWS
// ============================================================

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.query;

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const skip = (page - 1) * limit;

    const filter = {
      productId,
      type: "PRODUCT",
      isActive: true,
    };

    const [reviews, total] =
      await Promise.all([
        Review.find(filter)
          .populate(
            "userId",
            "name email profileImage avatar"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Review.countDocuments(filter),
      ]);

    const totalPages =
      Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,

      reviews,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ getProductReviews:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load product reviews.",
    });
  }
};

// ============================================================
// GET SELLER REVIEWS
// ============================================================

const getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.query;

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required.",
      });
    }

    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID.",
      });
    }

    const skip = (page - 1) * limit;

    const filter = {
      sellerId,
      type: "SELLER",
      isActive: true,
    };

    const [reviews, total] =
      await Promise.all([
        Review.find(filter)
          .populate(
            "userId",
            "name email profileImage avatar"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Review.countDocuments(filter),
      ]);

    const totalPages =
      Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,

      reviews,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ getSellerReviews:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load seller reviews.",
    });
  }
};

// ============================================================
// GET USER REVIEWS (NEW)
// ============================================================

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.query;

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 10,
        1
      ),
      50
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const skip = (page - 1) * limit;

    const filter = {
      targetUserId: userId,
      type: "USER",
      isActive: true,
    };

    const [reviews, total] =
      await Promise.all([
        Review.find(filter)
          .populate(
            "userId",
            "name email profileImage avatar"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Review.countDocuments(filter),
      ]);

    const totalPages =
      Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,

      reviews,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ getUserReviews:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load user reviews.",
    });
  }
};

// ============================================================
// GET SINGLE REVIEW
// ============================================================

const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const review =
      await Review.findOne({
        _id: id,
        isActive: true,
      })
        .populate(
          "userId",
          "name email profileImage avatar"
        )
        .populate(
          "productId",
          "title price image images"
        )
        .populate(
          "sellerId",
          "name email profileImage avatar"
        )
        .populate(
          "targetUserId",
          "name email profileImage avatar"
        );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error(
      "❌ getReviewById:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load review.",
    });
  }
};

// ============================================================
// CREATE REVIEW
// ============================================================

const createReview = async (req, res) => {
  try {
    const userId = getUserId(req);

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required to create a review.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user.",
      });
    }

    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    const type = normalizeType(
      req.body.type
    );

    const productId =
      req.body.productId || null;

    const sellerId =
      req.body.sellerId || null;

    const targetUserId =
      req.body.targetUserId || req.body.userId || null; // for USER type

    const orderId =
      req.body.orderId || null;

    const rating = Number(
      req.body.rating
    );

    const comment = String(
      req.body.comment || ""
    ).trim();

    // --------------------------------------------------------
    // TYPE
    // --------------------------------------------------------

    if (
      !["PRODUCT", "SELLER", "USER"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Review type must be PRODUCT, SELLER, or USER.",
      });
    }

    // --------------------------------------------------------
    // RATING
    // --------------------------------------------------------

    if (
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5.",
      });
    }

    // --------------------------------------------------------
    // COMMENT
    // --------------------------------------------------------

    if (!comment) {
      return res.status(400).json({
        success: false,
        message:
          "Review comment is required.",
      });
    }

    if (comment.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Review comment cannot exceed 2000 characters.",
      });
    }

    // ========================================================
    // PRODUCT REVIEW
    // ========================================================

    if (type === "PRODUCT") {
      console.log(
        "⭐ Creating PRODUCT review"
      );

      console.log(
        "⭐ User:",
        userId
      );

      console.log(
        "⭐ Product:",
        productId
      );

      console.log(
        "⭐ Seller:",
        sellerId
      );

      // ------------------------------------------------------
      // PRODUCT REQUIRED
      // ------------------------------------------------------

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required for a product review.",
        });
      }

      if (!isValidObjectId(productId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      // ------------------------------------------------------
      // PRODUCT EXISTS
      // ------------------------------------------------------

      const product =
        await Product.findById(productId)
          .select(
            "_id sellerId sellerName title"
          )
          .lean();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      // ------------------------------------------------------
      // DETERMINE SELLER
      // ------------------------------------------------------

      let finalSellerId =
        sellerId || product.sellerId;

      if (!finalSellerId) {
        return res.status(400).json({
          success: false,
          message:
            "Seller information is missing for this product.",
        });
      }

      if (
        !isValidObjectId(finalSellerId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      // ------------------------------------------------------
      // VERIFY SELLER
      // ------------------------------------------------------

      const seller =
        await User.findById(finalSellerId)
          .select("_id")
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
        });
      }

      // ------------------------------------------------------
      // UNIQUENESS
      // ------------------------------------------------------

      const existingProductReview =
        await Review.findOne({
          userId,
          productId,
          type: "PRODUCT",
        })
          .select("_id")
          .lean();

      if (existingProductReview) {
        return res.status(409).json({
          success: false,
          message:
            "You have already reviewed this product.",
          errorCode:
            "PRODUCT_REVIEW_EXISTS",
          reviewId:
            existingProductReview._id,
        });
      }

      // ------------------------------------------------------
      // CREATE PRODUCT REVIEW
      // ------------------------------------------------------

      const review =
        await Review.create({
          userId,
          type: "PRODUCT",
          productId,
          sellerId: finalSellerId,
          orderId:
            orderId &&
            isValidObjectId(orderId)
              ? orderId
              : null,
          rating,
          comment,
          isActive: true,
        });

      // ------------------------------------------------------
      // RETURN
      // ------------------------------------------------------

      const populatedReview =
        await Review.findById(
          review._id
        )
          .populate(
            "userId",
            "name email profileImage avatar"
          )
          .populate(
            "productId",
            "title price image images"
          )
          .populate(
            "sellerId",
            "name email profileImage avatar"
          );

      return res.status(201).json({
        success: true,
        message:
          "Product review created successfully.",
        review: populatedReview,
      });
    }

    // ========================================================
    // SELLER REVIEW
    // ========================================================

    if (type === "SELLER") {
      console.log(
        "⭐ Creating SELLER review"
      );

      console.log(
        "⭐ User:",
        userId
      );

      console.log(
        "⭐ Seller:",
        sellerId
      );

      // ------------------------------------------------------
      // SELLER REQUIRED
      // ------------------------------------------------------

      if (!sellerId) {
        return res.status(400).json({
          success: false,
          message:
            "Seller ID is required for a seller review.",
        });
      }

      if (
        !isValidObjectId(sellerId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      // ------------------------------------------------------
      // SELLER EXISTS
      // ------------------------------------------------------

      const seller =
        await User.findById(sellerId)
          .select("_id role name")
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
        });
      }

      // ------------------------------------------------------
      // DON'T REVIEW YOURSELF
      // ------------------------------------------------------

      if (
        String(sellerId) ===
        String(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot review yourself.",
        });
      }

      // ------------------------------------------------------
      // UNIQUENESS
      // ------------------------------------------------------

      const existingSellerReview =
        await Review.findOne({
          userId,
          sellerId,
          type: "SELLER",
        })
          .select("_id")
          .lean();

      if (existingSellerReview) {
        return res.status(409).json({
          success: false,
          message:
            "You have already reviewed this seller.",
          errorCode:
            "SELLER_REVIEW_EXISTS",
          reviewId:
            existingSellerReview._id,
        });
      }

      // ------------------------------------------------------
      // CREATE SELLER REVIEW
      // ------------------------------------------------------

      const review =
        await Review.create({
          userId,
          type: "SELLER",
          productId: null,
          sellerId,
          orderId:
            orderId &&
            isValidObjectId(orderId)
              ? orderId
              : null,
          rating,
          comment,
          isActive: true,
        });

      // ------------------------------------------------------
      // RETURN
      // ------------------------------------------------------

      const populatedReview =
        await Review.findById(
          review._id
        )
          .populate(
            "userId",
            "name email profileImage avatar"
          )
          .populate(
            "sellerId",
            "name email profileImage avatar"
          );

      return res.status(201).json({
        success: true,
        message:
          "Seller review created successfully.",
        review: populatedReview,
      });
    }

    // ========================================================
    // USER REVIEW (NEW)
    // ========================================================

    if (type === "USER") {
      console.log(
        "⭐ Creating USER review"
      );

      console.log(
        "⭐ User (reviewer):",
        userId
      );

      console.log(
        "⭐ Target user:",
        targetUserId
      );

      // ------------------------------------------------------
      // TARGET USER REQUIRED
      // ------------------------------------------------------

      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message:
            "Target user ID is required for a user review.",
        });
      }

      if (
        !isValidObjectId(targetUserId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid target user ID.",
        });
      }

      // ------------------------------------------------------
      // TARGET USER EXISTS
      // ------------------------------------------------------

      const targetUser =
        await User.findById(targetUserId)
          .select("_id name role")
          .lean();

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message:
            "Target user not found.",
        });
      }

      // ------------------------------------------------------
      // DON'T REVIEW YOURSELF
      // ------------------------------------------------------

      if (
        String(targetUserId) ===
        String(userId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot review yourself.",
        });
      }

      // ------------------------------------------------------
      // UNIQUENESS
      // ------------------------------------------------------

      const existingUserReview =
        await Review.findOne({
          userId,
          targetUserId,
          type: "USER",
        })
          .select("_id")
          .lean();

      if (existingUserReview) {
        return res.status(409).json({
          success: false,
          message:
            "You have already reviewed this user.",
          errorCode:
            "USER_REVIEW_EXISTS",
          reviewId:
            existingUserReview._id,
        });
      }

      // ------------------------------------------------------
      // CREATE USER REVIEW
      // ------------------------------------------------------

      const review =
        await Review.create({
          userId,
          type: "USER",
          targetUserId,
          productId: null,
          sellerId: null,
          orderId:
            orderId &&
            isValidObjectId(orderId)
              ? orderId
              : null,
          rating,
          comment,
          isActive: true,
        });

      // ------------------------------------------------------
      // RETURN
      // ------------------------------------------------------

      const populatedReview =
        await Review.findById(
          review._id
        )
          .populate(
            "userId",
            "name email profileImage avatar"
          )
          .populate(
            "targetUserId",
            "name email profileImage avatar"
          );

      return res.status(201).json({
        success: true,
        message:
          "User review created successfully.",
        review: populatedReview,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid review type.",
    });
  } catch (error) {
    console.error(
      "❌ createReview error:",
      error
    );

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error?.code === 11000) {
      const duplicateFields =
        Object.keys(
          error.keyPattern || {}
        );

      // ------------------------------------------------------
      // PRODUCT DUPLICATE
      // ------------------------------------------------------

      if (
        duplicateFields.includes(
          "productId"
        )
      ) {
        return res.status(409).json({
          success: false,
          message:
            "You have already reviewed this product.",
          errorCode:
            "PRODUCT_REVIEW_EXISTS",
        });
      }

      // ------------------------------------------------------
      // SELLER DUPLICATE
      // ------------------------------------------------------

      if (
        duplicateFields.includes(
          "sellerId"
        )
      ) {
        return res.status(409).json({
          success: false,
          message:
            "You have already reviewed this seller.",
          errorCode:
            "SELLER_REVIEW_EXISTS",
        });
      }

      // ------------------------------------------------------
      // USER DUPLICATE
      // ------------------------------------------------------

      if (
        duplicateFields.includes(
          "targetUserId"
        )
      ) {
        return res.status(409).json({
          success: false,
          message:
            "You have already reviewed this user.",
          errorCode:
            "USER_REVIEW_EXISTS",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "You have already submitted this review.",
        errorCode:
          "REVIEW_EXISTS",
      });
    }

    // ========================================================
    // VALIDATION ERROR
    // ========================================================

    if (
      error?.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors || {}
        ).map(
          (item) => item.message
        );

      return res.status(400).json({
        success: false,
        message:
          "Review validation failed.",
        errors,
      });
    }

    // ========================================================
    // DEFAULT
    // ========================================================

    return res.status(500).json({
      success: false,
      message:
        "Failed to create review.",
    });
  }
};

// ============================================================
// UPDATE REVIEW
// ============================================================

const updateReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const review =
      await Review.findOne({
        _id: id,
        isActive: true,
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // --------------------------------------------------------
    // OWNER ONLY
    // --------------------------------------------------------

    if (
      String(review.userId) !==
      String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only edit your own review.",
      });
    }

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    if (
      req.body.rating !== undefined
    ) {
      const rating = Number(
        req.body.rating
      );

      if (
        !Number.isFinite(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5.",
        });
      }

      review.rating = rating;
    }

    if (
      req.body.comment !== undefined
    ) {
      const comment = String(
        req.body.comment || ""
      ).trim();

      if (!comment) {
        return res.status(400).json({
          success: false,
          message:
            "Review comment cannot be empty.",
        });
      }

      if (comment.length > 2000) {
        return res.status(400).json({
          success: false,
          message:
            "Review comment cannot exceed 2000 characters.",
        });
      }

      review.comment = comment;
    }

    await review.save();

    const populatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "userId",
          "name email profileImage avatar"
        )
        .populate(
          "productId",
          "title price image images"
        )
        .populate(
          "sellerId",
          "name email profileImage avatar"
        )
        .populate(
          "targetUserId",
          "name email profileImage avatar"
        );

    return res.status(200).json({
      success: true,
      message:
        "Review updated successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error(
      "❌ updateReview:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update review.",
    });
  }
};

// ============================================================
// DELETE REVIEW
// ============================================================

const deleteReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const review =
      await Review.findOne({
        _id: id,
        isActive: true,
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (
      String(review.userId) !==
      String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own review.",
      });
    }

    // Soft delete
    review.isActive = false;

    await review.save();

    return res.status(200).json({
      success: true,
      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ deleteReview:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete review.",
    });
  }
};

// ============================================================
// CHECK WHETHER USER HAS REVIEWED
// ============================================================

const checkUserReview = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(200).json({
        success: true,
        hasReviewed: false,
        review: null,
      });
    }

    const type = normalizeType(
      req.query.type
    );

    const productId =
      req.query.productId;

    const sellerId =
      req.query.sellerId;

    const targetUserId =
      req.query.targetUserId || req.query.userId;

    if (
      !["PRODUCT", "SELLER", "USER"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review type.",
      });
    }

    let filter;

    // --------------------------------------------------------
    // PRODUCT
    // --------------------------------------------------------

    if (type === "PRODUCT") {
      if (
        !productId ||
        !isValidObjectId(productId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid product ID is required.",
        });
      }

      filter = {
        userId,
        productId,
        type: "PRODUCT",
        isActive: true,
      };
    }

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    if (type === "SELLER") {
      if (
        !sellerId ||
        !isValidObjectId(sellerId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid seller ID is required.",
        });
      }

      filter = {
        userId,
        sellerId,
        type: "SELLER",
        isActive: true,
      };
    }

    // --------------------------------------------------------
    // USER
    // --------------------------------------------------------

    if (type === "USER") {
      if (
        !targetUserId ||
        !isValidObjectId(targetUserId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid target user ID is required.",
        });
      }

      filter = {
        userId,
        targetUserId,
        type: "USER",
        isActive: true,
      };
    }

    const review =
      await Review.findOne(filter)
        .populate(
          "productId",
          "title price image images"
        )
        .populate(
          "sellerId",
          "name email profileImage avatar"
        )
        .populate(
          "targetUserId",
          "name email profileImage avatar"
        )
        .lean();

    return res.status(200).json({
      success: true,
      hasReviewed: Boolean(review),
      review: review || null,
    });
  } catch (error) {
    console.error(
      "❌ checkUserReview:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to check review status.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getProductReviews,
  getSellerReviews,
  getUserReviews,       // <-- NEW
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  checkUserReview,
};