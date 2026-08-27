// ============================================================
// backend/controllers/reviewController.js
// BuyUKUsed - Review Controller
// ============================================================

const mongoose = require("mongoose");

const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");

// IMPORTANT:
// Change this ONLY if your actual model exports a different model.
// Your project previously used Orders.js.
const Order = require("../models/Orders");

// ============================================================
// HELPERS
// ============================================================

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.userId ||
    null
  );
};

// ============================================================
// OBJECT ID
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// ROUND RATING
// ============================================================

const roundRating = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number * 10) / 10;
};

// ============================================================
// SAFE AVATAR
// ============================================================

const getReviewerAvatar = (user) => {
  if (!user) {
    return "";
  }

  return (
    user.avatar ||
    user.profileImage ||
    user.photo ||
    user.photoURL ||
    ""
  );
};

// ============================================================
// CHECK COMPLETED ORDER
// ============================================================

const isCompletedOrder = (order) => {
  if (!order) {
    return false;
  }

  const status = String(
    order.status || ""
  )
    .trim()
    .toLowerCase();

  const completedStatuses = [
    "completed",
    "delivered",
    "paid",
    "confirmed",
    "successful",
    "success",
  ];

  // If an order has a status, require a successful status.
  if (status) {
    return completedStatuses.includes(status);
  }

  // If your existing order system doesn't use status,
  // don't automatically mark it verified.
  return false;
};

// ============================================================
// VERIFY PURCHASE
// ============================================================

const verifyPurchase = async ({
  orderId,
  buyerId,
  sellerId,
  productId,
}) => {
  if (!orderId || !buyerId || !sellerId || !productId) {
    return false;
  }

  if (!isValidObjectId(orderId)) {
    return false;
  }

  if (!Order) {
    return false;
  }

  try {
    const order = await Order.findOne({
      _id: orderId,
    }).lean();

    if (!order) {
      return false;
    }

    // --------------------------------------------------------
    // Verify buyer
    // --------------------------------------------------------

    const possibleBuyerIds = [
      order.user,
      order.userId,
      order.buyer,
      order.buyerId,
      order.customer,
      order.customerId,
    ].filter(Boolean);

    const buyerMatches = possibleBuyerIds.some(
      (id) =>
        String(id) === String(buyerId)
    );

    if (!buyerMatches) {
      return false;
    }

    // --------------------------------------------------------
    // Verify completed order
    // --------------------------------------------------------

    if (!isCompletedOrder(order)) {
      return false;
    }

    // --------------------------------------------------------
    // Verify product + seller inside items
    // --------------------------------------------------------

    const items = Array.isArray(order.items)
      ? order.items
      : [];

    const matchingItem = items.find(
      (item) => {
        const itemProduct =
          item.productId ||
          item.product ||
          item.productID;

        const itemSeller =
          item.sellerId ||
          item.seller ||
          item.sellerID;

        return (
          String(itemProduct) ===
            String(productId) &&
          String(itemSeller) ===
            String(sellerId)
        );
      }
    );

    return Boolean(matchingItem);
  } catch (error) {
    console.error(
      "❌ Purchase verification error:",
      error
    );

    return false;
  }
};

// ============================================================
// RECALCULATE SELLER RATING
// ============================================================

const recalculateSellerRating = async (
  sellerId
) => {
  if (!sellerId || !isValidObjectId(sellerId)) {
    return;
  }

  const result = await Review.aggregate([
    {
      $match: {
        sellerId:
          new mongoose.Types.ObjectId(
            sellerId
          ),

        status: "published",
      },
    },

    {
      $group: {
        _id: "$sellerId",

        averageRating: {
          $avg: "$rating",
        },

        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const stats = result[0] || {
    averageRating: 0,
    reviewCount: 0,
  };

  /*
   * IMPORTANT:
   * These fields must exist in User.js.
   * If they don't exist, add them there:
   *
   * rating: { type: Number, default: 0 }
   * reviewCount: { type: Number, default: 0 }
   */

  await User.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        rating: roundRating(
          stats.averageRating
        ),

        reviewCount:
          stats.reviewCount || 0,
      },
    },
    {
      new: false,
    }
  );
};

// ============================================================
// RECALCULATE PRODUCT RATING
// ============================================================

const recalculateProductRating = async (
  productId
) => {
  if (!productId || !isValidObjectId(productId)) {
    return;
  }

  const result = await Review.aggregate([
    {
      $match: {
        productId:
          new mongoose.Types.ObjectId(
            productId
          ),

        status: "published",
      },
    },

    {
      $group: {
        _id: "$productId",

        averageRating: {
          $avg: "$rating",
        },

        reviewCount: {
          $sum: 1,
        },
      },
    },
  ]);

  const stats = result[0] || {
    averageRating: 0,
    reviewCount: 0,
  };

  /*
   * IMPORTANT:
   * These fields must exist in Product.js.
   *
   * rating: {
   *   type: Number,
   *   default: 0,
   * }
   *
   * reviewCount: {
   *   type: Number,
   *   default: 0,
   * }
   */

  await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        rating: roundRating(
          stats.averageRating
        ),

        reviewCount:
          stats.reviewCount || 0,
      },
    },
    {
      new: false,
    }
  );
};

// ============================================================
// RATING SUMMARY
// ============================================================

const buildRatingSummary = async (
  match
) => {
  const result = await Review.aggregate([
    {
      $match: {
        ...match,
        status: "published",
      },
    },

    {
      $group: {
        _id: null,

        averageRating: {
          $avg: "$rating",
        },

        totalReviews: {
          $sum: 1,
        },

        rating1: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 1],
              },
              1,
              0,
            ],
          },
        },

        rating2: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 2],
              },
              1,
              0,
            ],
          },
        },

        rating3: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 3],
              },
              1,
              0,
            ],
          },
        },

        rating4: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 4],
              },
              1,
              0,
            ],
          },
        },

        rating5: {
          $sum: {
            $cond: [
              {
                $eq: ["$rating", 5],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const stats = result[0];

  if (!stats) {
    return {
      averageRating: 0,
      totalReviews: 0,

      breakdown: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  return {
    averageRating: roundRating(
      stats.averageRating
    ),

    totalReviews:
      stats.totalReviews || 0,

    breakdown: {
      5: stats.rating5 || 0,
      4: stats.rating4 || 0,
      3: stats.rating3 || 0,
      2: stats.rating2 || 0,
      1: stats.rating1 || 0,
    },
  };
};

// ============================================================
// GET REVIEWS
// ============================================================
// GET /api/reviews?sellerId=...&productId=...
// ============================================================

exports.getReviews = async (
  req,
  res
) => {
  try {
    const {
      sellerId,
      productId,
      rating,
      page = 1,
      limit = 10,
    } = req.query;

    if (!sellerId && !productId) {
      return res.status(400).json({
        success: false,
        message:
          "sellerId or productId is required.",
      });
    }

    if (
      sellerId &&
      !isValidObjectId(sellerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID.",
      });
    }

    if (
      productId &&
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const currentLimit = Math.min(
      Math.max(
        parseInt(limit, 10) || 10,
        1
      ),
      50
    );

    const filter = {
      status: "published",
    };

    if (sellerId) {
      filter.sellerId =
        new mongoose.Types.ObjectId(
          sellerId
        );
    }

    if (productId) {
      filter.productId =
        new mongoose.Types.ObjectId(
          productId
        );
    }

    if (rating !== undefined) {
      const parsedRating =
        Number(rating);

      if (
        !Number.isInteger(
          parsedRating
        ) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5.",
        });
      }

      filter.rating = parsedRating;
    }

    const skip =
      (currentPage - 1) *
      currentLimit;

    const [
      reviews,
      total,
      summary,
    ] = await Promise.all([
      Review.find(filter)
        .populate(
          "reviewer",
          "name avatar profileImage photo photoURL"
        )
        .populate(
          "sellerId",
          "name shopName avatar profileImage photo photoURL isVerified verificationStatus"
        )
        .populate(
          "productId",
          "title images image rating reviewCount sellerId"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(currentLimit)
        .lean(),

      Review.countDocuments(filter),

      buildRatingSummary(filter),
    ]);

    const currentUserId =
      getUserId(req);

    const processedReviews =
      reviews.map((review) => {
        const helpfulBy =
          Array.isArray(
            review.helpfulBy
          )
            ? review.helpfulBy
            : [];

        const hasHelpful =
          currentUserId
            ? helpfulBy.some(
                (id) =>
                  String(id) ===
                  String(
                    currentUserId
                  )
              )
            : false;

        return {
          ...review,

          helpfulBy: undefined,

          helpfulCount:
            helpfulBy.length,

          hasHelpful,
        };
      });

    return res.json({
      success: true,

      reviews:
        processedReviews,

      summary,

      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,

        totalPages:
          Math.ceil(
            total / currentLimit
          ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Get reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load reviews.",
    });
  }
};

// ============================================================
// CREATE REVIEW
// ============================================================
// POST /api/reviews
// ============================================================

exports.createReview = async (
  req,
  res
) => {
  try {
    const reviewerId =
      getUserId(req);

    if (!reviewerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const {
      sellerId,
      productId,
      orderId,
      rating,
      comment,
    } = req.body || {};

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message:
          "Seller ID is required.",
      });
    }

    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID.",
      });
    }

    // --------------------------------------------------------
    // PRODUCT
    // --------------------------------------------------------

    if (
      !productId ||
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid product ID is required.",
      });
    }

    // --------------------------------------------------------
    // ORDER
    // --------------------------------------------------------

    if (
      !orderId ||
      !isValidObjectId(orderId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid order ID is required for a verified review.",
      });
    }

    // --------------------------------------------------------
    // CANNOT REVIEW YOURSELF
    // --------------------------------------------------------

    if (
      String(reviewerId) ===
      String(sellerId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot review yourself.",
      });
    }

    // --------------------------------------------------------
    // RATING
    // --------------------------------------------------------

    const parsedRating =
      Number(rating);

    if (
      !Number.isInteger(
        parsedRating
      ) ||
      parsedRating < 1 ||
      parsedRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be a whole number from 1 to 5.",
      });
    }

    // --------------------------------------------------------
    // COMMENT
    // --------------------------------------------------------

    const cleanComment =
      String(comment || "")
        .trim();

    if (cleanComment.length < 3) {
      return res.status(400).json({
        success: false,
        message:
          "Review must be at least 3 characters.",
      });
    }

    if (cleanComment.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Review cannot exceed 2000 characters.",
      });
    }

    // --------------------------------------------------------
    // FIND REVIEWER
    // --------------------------------------------------------

    const reviewer =
      await User.findById(
        reviewerId
      );

    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message:
          "Reviewer account not found.",
      });
    }

    // --------------------------------------------------------
    // FIND SELLER
    // --------------------------------------------------------

    const seller =
      await User.findById(
        sellerId
      );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found.",
      });
    }

    if (
      seller.isActive === false
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This seller account is inactive.",
      });
    }

    // --------------------------------------------------------
    // FIND PRODUCT
    // --------------------------------------------------------

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    // --------------------------------------------------------
    // PRODUCT MUST BELONG TO SELLER
    // --------------------------------------------------------

    if (
      String(product.sellerId) !==
      String(sellerId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This product does not belong to the selected seller.",
      });
    }

    // --------------------------------------------------------
    // VERIFY PURCHASE
    // --------------------------------------------------------

    const verifiedPurchase =
      await verifyPurchase({
        orderId,
        buyerId: reviewerId,
        sellerId,
        productId,
      });

    if (!verifiedPurchase) {
      return res.status(403).json({
        success: false,
        message:
          "We could not verify this purchase. Only completed purchases can be reviewed.",
      });
    }

    // --------------------------------------------------------
    // PREVENT DUPLICATE REVIEW FOR ORDER
    // --------------------------------------------------------

    const existingOrderReview =
      await Review.findOne({
        reviewer: reviewerId,
        orderId,
      });

    if (existingOrderReview) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this order.",
      });
    }

    // --------------------------------------------------------
    // PREVENT DUPLICATE PRODUCT REVIEW
    // --------------------------------------------------------

    const existingProductReview =
      await Review.findOne({
        reviewer: reviewerId,
        sellerId,
        productId,
      });

    if (existingProductReview) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this product.",
      });
    }

    // --------------------------------------------------------
    // CREATE REVIEW
    // --------------------------------------------------------

    const review =
      await Review.create({
        reviewer:
          reviewerId,

        reviewerName:
          reviewer.name ||
          "Buyer",

        reviewerAvatar:
          getReviewerAvatar(
            reviewer
          ),

        sellerId,

        sellerName:
          seller.shopName ||
          seller.name ||
          "Seller",

        productId,

        productTitle:
          product.title ||
          "",

        orderId,

        rating:
          parsedRating,

        comment:
          cleanComment,

        verifiedPurchase:
          true,

        helpfulBy: [],

        helpfulCount: 0,

        reportedBy: [],

        reportCount: 0,

        sellerReply: {
          text: "",
          repliedAt: null,
        },

        status:
          "published",
      });

    // --------------------------------------------------------
    // UPDATE SELLER RATING
    // --------------------------------------------------------

    await recalculateSellerRating(
      sellerId
    );

    // --------------------------------------------------------
    // UPDATE PRODUCT RATING
    // --------------------------------------------------------

    await recalculateProductRating(
      productId
    );

    // --------------------------------------------------------
    // POPULATE REVIEW
    // --------------------------------------------------------

    const populatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "reviewer",
          "name avatar profileImage photo photoURL"
        )
        .populate(
          "sellerId",
          "name shopName avatar profileImage photo photoURL isVerified verificationStatus rating reviewCount"
        )
        .populate(
          "productId",
          "title images image rating reviewCount sellerId"
        )
        .lean();

    return res.status(201).json({
      success: true,

      message:
        "Review posted successfully.",

      review:
        populatedReview,
    });
  } catch (error) {
    console.error(
      "❌ Create review error:",
      error
    );

    // Handle duplicate MongoDB indexes
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "You have already submitted this review.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to post review.",
    });
  }
};

// ============================================================
// UPDATE REVIEW
// ============================================================
// PUT /api/reviews/:id
// ============================================================

exports.updateReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const reviewId =
      req.params.id;

    if (
      !isValidObjectId(
        reviewId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review ID.",
      });
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });
    }

    if (
      String(review.reviewer) !==
      String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only edit your own review.",
      });
    }

    const {
      rating,
      comment,
    } = req.body || {};

    let changed = false;

    if (rating !== undefined) {
      const parsedRating =
        Number(rating);

      if (
        !Number.isInteger(
          parsedRating
        ) ||
        parsedRating < 1 ||
        parsedRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be a whole number from 1 to 5.",
        });
      }

      review.rating =
        parsedRating;

      changed = true;
    }

    if (comment !== undefined) {
      const cleanComment =
        String(comment)
          .trim();

      if (cleanComment.length < 3) {
        return res.status(400).json({
          success: false,
          message:
            "Review must be at least 3 characters.",
        });
      }

      if (cleanComment.length > 2000) {
        return res.status(400).json({
          success: false,
          message:
            "Review cannot exceed 2000 characters.",
        });
      }

      review.comment =
        cleanComment;

      changed = true;
    }

    if (!changed) {
      return res.status(400).json({
        success: false,
        message:
          "No review changes were provided.",
      });
    }

    await review.save();

    await recalculateSellerRating(
      review.sellerId
    );

    if (review.productId) {
      await recalculateProductRating(
        review.productId
      );
    }

    return res.json({
      success: true,

      message:
        "Review updated successfully.",

      review,
    });
  } catch (error) {
    console.error(
      "❌ Update review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update review.",
    });
  }
};

// ============================================================
// DELETE REVIEW
// ============================================================
// DELETE /api/reviews/:id
// ============================================================

exports.deleteReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const reviewId =
      req.params.id;

    if (
      !isValidObjectId(
        reviewId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review ID.",
      });
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });
    }

    const isOwner =
      String(review.reviewer) ===
      String(userId);

    const isAdmin =
      req.user?.role ===
      "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this review.",
      });
    }

    const sellerId =
      review.sellerId;

    const productId =
      review.productId;

    await Review.findByIdAndDelete(
      reviewId
    );

    await recalculateSellerRating(
      sellerId
    );

    if (productId) {
      await recalculateProductRating(
        productId
      );
    }

    return res.json({
      success: true,
      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ Delete review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete review.",
    });
  }
};

// ============================================================
// HELPFUL TOGGLE
// ============================================================
// POST /api/reviews/:id/helpful
// ============================================================

exports.toggleHelpful = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const reviewId =
      req.params.id;

    if (
      !isValidObjectId(
        reviewId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review ID.",
      });
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });
    }

    if (
      String(review.reviewer) ===
      String(userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot vote on your own review.",
      });
    }

    const index =
      review.helpfulBy.findIndex(
        (id) =>
          String(id) ===
          String(userId)
      );

    let helpful;

    if (index >= 0) {
      review.helpfulBy.splice(
        index,
        1
      );

      helpful = false;
    } else {
      review.helpfulBy.push(
        userId
      );

      helpful = true;
    }

    review.helpfulCount =
      review.helpfulBy.length;

    await review.save();

    return res.json({
      success: true,

      helpful,

      helpfulCount:
        review.helpfulBy.length,
    });
  } catch (error) {
    console.error(
      "❌ Helpful review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update helpful vote.",
    });
  }
};

// ============================================================
// REPORT REVIEW
// ============================================================
// POST /api/reviews/:id/report
// ============================================================

exports.reportReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const reviewId =
      req.params.id;

    if (
      !isValidObjectId(
        reviewId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review ID.",
      });
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });
    }

    if (
      String(review.reviewer) ===
      String(userId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot report your own review.",
      });
    }

    const alreadyReported =
      review.reportedBy.some(
        (report) =>
          String(
            report.userId
          ) === String(userId)
      );

    if (alreadyReported) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reported this review.",
      });
    }

    const reason =
      String(
        req.body?.reason ||
          "Inappropriate content"
      )
        .trim()
        .slice(0, 500);

    review.reportedBy.push({
      userId,
      reason,
      reportedAt:
        new Date(),
    });

    review.reportCount =
      review.reportedBy.length;

    await review.save();

    return res.json({
      success: true,

      message:
        "Thank you. This review has been reported.",
    });
  } catch (error) {
    console.error(
      "❌ Report review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to report review.",
    });
  }
};

// ============================================================
// SELLER REPLY
// ============================================================
// POST /api/reviews/:id/reply
// ============================================================

exports.replyToReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const reviewId =
      req.params.id;

    if (
      !isValidObjectId(
        reviewId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review ID.",
      });
    }

    const cleanText =
      String(
        req.body?.text || ""
      ).trim();

    if (cleanText.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Reply is required.",
      });
    }

    if (cleanText.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Reply cannot exceed 2000 characters.",
      });
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });
    }

    if (
      String(review.sellerId) !==
      String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the seller can reply to this review.",
      });
    }

    review.sellerReply = {
      text: cleanText,
      repliedAt: new Date(),
    };

    await review.save();

    return res.json({
      success: true,

      message:
        "Reply posted successfully.",

      sellerReply:
        review.sellerReply,
    });
  } catch (error) {
    console.error(
      "❌ Seller reply error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to post seller reply.",
    });
  }
};

// ============================================================
// DELETE SELLER REPLY
// ============================================================
// DELETE /api/reviews/:id/reply
// ============================================================

exports.deleteReply = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const reviewId =
      req.params.id;

    if (
      !isValidObjectId(
        reviewId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid review ID.",
      });
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message:
          "Review not found.",
      });
    }

    const isSeller =
      String(review.sellerId) ===
      String(userId);

    const isAdmin =
      req.user?.role ===
      "admin";

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to remove this reply.",
      });
    }

    review.sellerReply = {
      text: "",
      repliedAt: null,
    };

    await review.save();

    return res.json({
      success: true,

      message:
        "Seller reply removed.",
    });
  } catch (error) {
    console.error(
      "❌ Delete seller reply error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to remove seller reply.",
    });
  }
};

// ============================================================
// GET SELLER SUMMARY
// ============================================================
// GET /api/reviews/seller/:sellerId/summary
// ============================================================

exports.getSellerSummary = async (
  req,
  res
) => {
  try {
    const {
      sellerId,
    } = req.params;

    if (
      !isValidObjectId(
        sellerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID.",
      });
    }

    const seller =
      await User.findById(
        sellerId
      )
        .select(
          "name shopName avatar profileImage photo photoURL rating reviewCount isVerified verificationStatus sellerSince createdAt location"
        )
        .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found.",
      });
    }

    const summary =
      await buildRatingSummary({
        sellerId:
          new mongoose.Types.ObjectId(
            sellerId
          ),
      });

    return res.json({
      success: true,

      seller: {
        ...seller,

        rating:
          summary.averageRating,

        reviewCount:
          summary.totalReviews,
      },

      summary,
    });
  } catch (error) {
    console.error(
      "❌ Seller summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load seller rating.",
    });
  }
};

// ============================================================
// GET PRODUCT SUMMARY
// ============================================================
// GET /api/reviews/product/:productId/summary
// ============================================================

exports.getProductSummary = async (
  req,
  res
) => {
  try {
    const {
      productId,
    } = req.params;

    if (
      !isValidObjectId(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findById(
        productId
      )
        .select(
          "title rating reviewCount sellerId"
        )
        .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    const summary =
      await buildRatingSummary({
        productId:
          new mongoose.Types.ObjectId(
            productId
          ),
      });

    return res.json({
      success: true,

      product: {
        ...product,

        rating:
          summary.averageRating,

        reviewCount:
          summary.totalReviews,
      },

      summary,
    });
  } catch (error) {
    console.error(
      "❌ Product summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load product rating.",
    });
  }
};

// ============================================================
// EXPORT HELPERS
// ============================================================

exports.recalculateSellerRating =
  recalculateSellerRating;

exports.recalculateProductRating =
  recalculateProductRating;