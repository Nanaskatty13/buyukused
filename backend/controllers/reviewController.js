// ============================================================
// backend/controllers/reviewController.js
// BuyUKUsed - Reviews & Ratings Controller
// ============================================================

const mongoose = require("mongoose");

const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return (
    id !== null &&
    id !== undefined &&
    mongoose.Types.ObjectId.isValid(String(id))
  );
};

// ============================================================
// GET AUTHENTICATED USER ID
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
// NORMALIZE ID
// ============================================================

const normalizeId = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    value._id
  ) {
    return value._id;
  }

  return value;
};

// ============================================================
// TO OBJECT ID
// ============================================================

const toObjectId = (id) => {
  if (!isValidObjectId(id)) {
    return null;
  }

  return new mongoose.Types.ObjectId(
    String(id)
  );
};

// ============================================================
// ACTIVE/PUBLISHED FILTER
// ============================================================

const publicReviewFilter = () => ({
  isActive: true,
  isVisible: true,
  moderationStatus: "approved",
});

// ============================================================
// DATABASE ERROR HANDLER
// ============================================================

const handleDatabaseError = (
  res,
  error,
  operation
) => {
  console.error(
    `\n❌ ${operation} DATABASE ERROR`
  );

  console.error(
    "Name:",
    error?.name
  );

  console.error(
    "Message:",
    error?.message
  );

  console.error(
    "Code:",
    error?.code
  );

  console.error(
    "KeyPattern:",
    error?.keyPattern
  );

  console.error(
    "KeyValue:",
    error?.keyValue
  );

  console.error(
    "Errors:",
    error?.errors
  );

  console.error(
    "Stack:",
    error?.stack
  );

  // ----------------------------------------------------------
  // DUPLICATE KEY
  // ----------------------------------------------------------

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,

      message:
        "A review with these details already exists.",

      error: "DUPLICATE_KEY",

      details:
        error.keyValue || null,
    });
  }

  // ----------------------------------------------------------
  // VALIDATION ERROR
  // ----------------------------------------------------------

  if (
    error?.name ===
    "ValidationError"
  ) {
    const validationErrors = {};

    Object.keys(
      error.errors || {}
    ).forEach((field) => {
      validationErrors[field] =
        error.errors[field]?.message ||
        "Invalid value.";
    });

    return res.status(400).json({
      success: false,

      message:
        "Review validation failed.",

      error:
        "VALIDATION_ERROR",

      errors:
        validationErrors,
    });
  }

  // ----------------------------------------------------------
  // CAST ERROR
  // ----------------------------------------------------------

  if (
    error?.name ===
    "CastError"
  ) {
    return res.status(400).json({
      success: false,

      message:
        `Invalid ${
          error.path || "ID"
        } value.`,

      error:
        "CAST_ERROR",
    });
  }

  // ----------------------------------------------------------
  // GENERIC ERROR
  // ----------------------------------------------------------

  return res.status(500).json({
    success: false,

    message:
      process.env.NODE_ENV ===
      "production"
        ? "Something went wrong."
        : error?.message ||
          `Failed to ${operation.toLowerCase()}.`,

    error:
      process.env.NODE_ENV ===
      "production"
        ? "DATABASE_ERROR"
        : error?.name ||
          "DATABASE_ERROR",
  });
};

// ============================================================
// GET REVIEWS
// ============================================================
//
// GET /api/reviews?sellerId=...
// GET /api/reviews?productId=...
//
// ============================================================

const getReviews = async (
  req,
  res,
  next
) => {
  try {
    const {
      sellerId,
      productId,
      rating,
      page = 1,
      limit = 10,
    } = req.query;

    // --------------------------------------------------------
    // REQUIRE SELLER OR PRODUCT
    // --------------------------------------------------------

    if (!sellerId && !productId) {
      return res.status(400).json({
        success: false,

        message:
          "sellerId or productId is required.",
      });
    }

    // --------------------------------------------------------
    // VALIDATE SELLER
    // --------------------------------------------------------

    if (
      sellerId &&
      !isValidObjectId(sellerId)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid seller ID.",
      });
    }

    // --------------------------------------------------------
    // VALIDATE PRODUCT
    // --------------------------------------------------------

    if (
      productId &&
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid product ID.",
      });
    }

    // --------------------------------------------------------
    // VALIDATE RATING
    // --------------------------------------------------------

    let numericRating = null;

    if (
      rating !== undefined &&
      rating !== ""
    ) {
      numericRating =
        Number(rating);

      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Rating must be a whole number from 1 to 5.",
        });
      }
    }

    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------

    const currentPage =
      Math.max(
        Number.parseInt(
          page,
          10
        ) || 1,
        1
      );

    const perPage =
      Math.min(
        Math.max(
          Number.parseInt(
            limit,
            10
          ) || 10,
          1
        ),
        100
      );

    const skip =
      (currentPage - 1) *
      perPage;

    // --------------------------------------------------------
    // QUERY
    // --------------------------------------------------------

    const query = {
      ...publicReviewFilter(),
    };

    if (sellerId) {
      query.sellerId =
        toObjectId(sellerId);
    }

    if (productId) {
      query.productId =
        toObjectId(productId);
    }

    if (
      numericRating !== null
    ) {
      query.rating =
        numericRating;
    }

    // --------------------------------------------------------
    // FETCH REVIEWS
    // --------------------------------------------------------

    const [
      reviews,
      total,
    ] = await Promise.all([
      Review.find(query)
        .populate(
          "reviewerId",
          "name email avatar profileImage"
        )
        .populate(
          "sellerId",
          "name email avatar profileImage"
        )
        .populate(
          "productId",
          "title image images price"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Review.countDocuments(
        query
      ),
    ]);

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    const summaryMatch = {
      ...query,
    };

    delete summaryMatch.rating;

    const summaryResult =
      await Review.aggregate([
        {
          $match:
            summaryMatch,
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

            fiveStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      5,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            fourStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      4,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            threeStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      3,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            twoStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      2,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            oneStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      1,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const summary =
      summaryResult[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0,
      };

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total / perPage
          );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      reviews,

      summary: {
        averageRating:
          Number(
            summary.averageRating ||
              0
          ).toFixed(1),

        totalReviews:
          summary.totalReviews ||
          0,

        fiveStars:
          summary.fiveStars ||
          0,

        fourStars:
          summary.fourStars ||
          0,

        threeStars:
          summary.threeStars ||
          0,

        twoStars:
          summary.twoStars ||
          0,

        oneStars:
          summary.oneStars ||
          0,
      },

      pagination: {
        page:
          currentPage,

        limit:
          perPage,

        total,

        totalPages,

        hasNextPage:
          currentPage <
          totalPages,

        hasPreviousPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ getReviews error:",
      error
    );

    next(error);
  }
};

// ============================================================
// CREATE REVIEW
// ============================================================

const createReview = async (
  req,
  res,
  next
) => {
  try {
    console.log(
      "\n============================================================"
    );

    console.log(
      "⭐ CREATE REVIEW START"
    );

    // ========================================================
    // AUTHENTICATION
    // ========================================================

    const authenticatedUserId =
      getUserId(req);

    if (
      !authenticatedUserId
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Authentication required.",
      });
    }

    if (
      !isValidObjectId(
        authenticatedUserId
      )
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid authenticated user ID.",
      });
    }

    const reviewerId =
      toObjectId(
        authenticatedUserId
      );

    // ========================================================
    // BODY
    // ========================================================

    const sellerId =
      normalizeId(
        req.body?.sellerId
      );

    const productId =
      normalizeId(
        req.body?.productId
      );

    const orderId =
      normalizeId(
        req.body?.orderId
      );

    const rating =
      Number(
        req.body?.rating
      );

    const comment =
      typeof req.body?.comment ===
      "string"
        ? req.body.comment.trim()
        : "";

    // ========================================================
    // SELLER
    // ========================================================

    if (!sellerId) {
      return res.status(400).json({
        success: false,

        message:
          "sellerId is required.",
      });
    }

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

    const sellerObjectId =
      toObjectId(sellerId);

    // ========================================================
    // PRODUCT
    // ========================================================

    let productObjectId =
      null;

    let product = null;

    if (productId) {
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

      productObjectId =
        toObjectId(productId);

      product =
        await Product.findById(
          productObjectId
        ).select(
          "title sellerId sellerName image images price"
        );

      if (!product) {
        return res.status(404).json({
          success: false,

          message:
            "Product not found.",
        });
      }

      // Product must belong to seller
      if (
        product.sellerId &&
        String(
          product.sellerId
        ) !==
          String(
            sellerObjectId
          )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "The selected product does not belong to this seller.",
        });
      }
    }

    // ========================================================
    // ORDER
    // ========================================================

    let orderObjectId =
      null;

    if (orderId) {
      if (
        !isValidObjectId(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order ID.",
        });
      }

      orderObjectId =
        toObjectId(orderId);
    }

    // ========================================================
    // PREVENT SELF REVIEW
    // ========================================================

    if (
      String(reviewerId) ===
      String(sellerObjectId)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "You cannot review yourself.",
      });
    }

    // ========================================================
    // RATING
    // ========================================================

    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Rating must be a whole number from 1 to 5.",
      });
    }

    // ========================================================
    // COMMENT
    // ========================================================

    if (comment.length < 3) {
      return res.status(400).json({
        success: false,

        message:
          "Review must be at least 3 characters.",
      });
    }

    if (comment.length > 2000) {
      return res.status(400).json({
        success: false,

        message:
          "Review cannot exceed 2000 characters.",
      });
    }

    // ========================================================
    // REVIEWER
    // ========================================================

    const reviewer =
      await User.findById(
        reviewerId
      ).select(
        "name avatar profileImage email isActive role"
      );

    if (!reviewer) {
      return res.status(404).json({
        success: false,

        message:
          "Reviewer account not found.",
      });
    }

    if (
      reviewer.isActive ===
      false
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Your account is inactive.",
      });
    }

    // ========================================================
    // SELLER
    // ========================================================

    const seller =
      await User.findById(
        sellerObjectId
      ).select(
        "name email avatar profileImage isActive role"
      );

    if (!seller) {
      return res.status(404).json({
        success: false,

        message:
          "Seller not found.",
      });
    }

    if (
      seller.isActive ===
      false
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This seller account is inactive.",
      });
    }

    // ========================================================
    // DUPLICATE CHECK
    // ========================================================
    //
    // The query exactly mirrors the three unique indexes.
    //
    // ========================================================

    const duplicateQuery = {
      sellerId:
        sellerObjectId,

      reviewerId:
        reviewerId,

      isActive: true,
    };

    if (productObjectId) {
      // Product review
      duplicateQuery.productId =
        productObjectId;

      duplicateQuery.orderId = {
        $exists: false,
      };
    } else if (orderObjectId) {
      // Order review
      duplicateQuery.orderId =
        orderObjectId;

      duplicateQuery.productId = {
        $exists: false,
      };
    } else {
      // Seller-only review
      duplicateQuery.productId = {
        $exists: false,
      };

      duplicateQuery.orderId = {
        $exists: false,
      };
    }

    const existingReview =
      await Review.findOne(
        duplicateQuery
      )
        .sort({
          createdAt: -1,
        })
        .lean();

    if (existingReview) {
      return res.status(409).json({
        success: false,

        message:
          productObjectId
            ? "You have already reviewed this product."
            : orderObjectId
            ? "You have already reviewed this order."
            : "You have already reviewed this seller.",

        error:
          "REVIEW_ALREADY_EXISTS",

        review:
          existingReview,

        canEdit: true,
      });
    }

    // ========================================================
    // VERIFIED PURCHASE
    // ========================================================

    let verifiedPurchase =
      false;

    if (orderObjectId) {
      try {
        const Order =
          require("../models/Order");

        const order =
          await Order.findById(
            orderObjectId
          ).lean();

        if (order) {
          const buyerIds = [
            order.userId,
            order.buyerId,
            order.customerId,
            order.customer,
            order.user,
          ].filter(Boolean);

          const sellerIds = [
            order.sellerId,
            order.seller,
          ].filter(Boolean);

          const buyerMatches =
            buyerIds.some(
              (id) =>
                String(id) ===
                String(
                  reviewerId
                )
            );

          const sellerMatches =
            sellerIds.some(
              (id) =>
                String(id) ===
                String(
                  sellerObjectId
                )
            );

          if (
            buyerMatches &&
            sellerMatches
          ) {
            verifiedPurchase =
              true;
          }
        }
      } catch (orderError) {
        console.warn(
          "⚠️ Order verification skipped:",
          orderError.message
        );
      }
    }

    // ========================================================
    // NAMES / AVATARS
    // ========================================================

    const reviewerName =
      typeof reviewer.name ===
      "string"
        ? reviewer.name.trim()
        : "";

    const reviewerAvatar =
      reviewer.avatar ||
      reviewer.profileImage ||
      "";

    const sellerName =
      typeof seller.name ===
      "string"
        ? seller.name.trim()
        : "";

    // ========================================================
    // REVIEW DATA
    // ========================================================

    const reviewData = {
      reviewerId:
        reviewerId,

      reviewerName:
        reviewerName,

      reviewerAvatar:
        reviewerAvatar,

      sellerId:
        sellerObjectId,

      sellerName:
        sellerName,

      rating:
        rating,

      comment:
        comment,

      verifiedPurchase:
        verifiedPurchase,

      helpfulBy:
        [],

      helpfulCount:
        0,

      reportedBy:
        [],

      reportCount:
        0,

      sellerReply: {
        text: "",
        repliedAt: null,
        repliedBy: null,
      },

      isActive:
        true,

      isVisible:
        true,

      moderationStatus:
        "approved",
    };

    // --------------------------------------------------------
    // ONLY ADD OPTIONAL IDS WHEN THEY EXIST
    // --------------------------------------------------------

    if (productObjectId) {
      reviewData.productId =
        productObjectId;

      reviewData.productTitle =
        product?.title || "";
    }

    if (orderObjectId) {
      reviewData.orderId =
        orderObjectId;
    }

    // ========================================================
    // CREATE
    // ========================================================

    let review;

    try {
      review =
        await Review.create(
          reviewData
        );
    } catch (createError) {
      return handleDatabaseError(
        res,
        createError,
        "CREATE REVIEW"
      );
    }

    // ========================================================
    // POPULATE
    // ========================================================

    let populatedReview;

    try {
      populatedReview =
        await Review.findById(
          review._id
        )
          .populate(
            "reviewerId",
            "name email avatar profileImage"
          )
          .populate(
            "sellerId",
            "name email avatar profileImage"
          )
          .populate(
            "productId",
            "title image images price"
          )
          .lean();
    } catch (populateError) {
      console.error(
        "⚠️ Review population error:",
        populateError
      );

      populatedReview =
        review.toObject();
    }

    console.log(
      "✅ REVIEW CREATED:",
      String(
        review._id
      )
    );

    console.log(
      "============================================================\n"
    );

    return res.status(201).json({
      success: true,

      message:
        "Review created successfully.",

      review:
        populatedReview,
    });
  } catch (error) {
    console.error(
      "\n❌ CREATE REVIEW ERROR"
    );

    console.error(
      error
    );

    return handleDatabaseError(
      res,
      error,
      "CREATE REVIEW"
    );
  }
};

// ============================================================
// UPDATE REVIEW
// ============================================================

const updateReview = async (
  req,
  res,
  next
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
      String(
        review.reviewerId
      ) !==
      String(
        reviewerId
      )
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You can only edit your own review.",
      });
    }

    if (
      review.isActive ===
      false
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This review has been deleted.",
      });
    }

    // --------------------------------------------------------
    // RATING
    // --------------------------------------------------------

    if (
      req.body.rating !==
      undefined
    ) {
      const rating =
        Number(
          req.body.rating
        );

      if (
        !Number.isInteger(
          rating
        ) ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Rating must be a whole number from 1 to 5.",
        });
      }

      review.rating =
        rating;
    }

    // --------------------------------------------------------
    // COMMENT
    // --------------------------------------------------------

    if (
      req.body.comment !==
      undefined
    ) {
      if (
        typeof req.body.comment !==
        "string"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Comment must be text.",
        });
      }

      const comment =
        req.body.comment.trim();

      if (comment.length < 3) {
        return res.status(400).json({
          success: false,

          message:
            "Review must be at least 3 characters.",
        });
      }

      if (comment.length > 2000) {
        return res.status(400).json({
          success: false,

          message:
            "Review cannot exceed 2000 characters.",
        });
      }

      review.comment =
        comment;
    }

    await review.save();

    const updatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "reviewerId",
          "name email avatar profileImage"
        )
        .populate(
          "sellerId",
          "name email avatar profileImage"
        )
        .populate(
          "productId",
          "title image images price"
        )
        .lean();

    return res.status(200).json({
      success: true,

      message:
        "Review updated successfully.",

      review:
        updatedReview,
    });
  } catch (error) {
    console.error(
      "❌ updateReview error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "UPDATE REVIEW"
    );
  }
};

// ============================================================
// DELETE REVIEW
// ============================================================

const deleteReview = async (
  req,
  res,
  next
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
      String(
        review.reviewerId
      ) !==
      String(
        reviewerId
      )
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You can only delete your own review.",
      });
    }

    if (
      review.isActive ===
      false
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Review is already deleted.",
      });
    }

    // Soft delete
    review.isActive =
      false;

    review.isVisible =
      false;

    await review.save();

    return res.status(200).json({
      success: true,

      message:
        "Review deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ deleteReview error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "DELETE REVIEW"
    );
  }
};

// ============================================================
// TOGGLE HELPFUL
// ============================================================

const toggleHelpful = async (
  req,
  res,
  next
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
      review.isActive !==
        true ||
      review.isVisible !==
        true ||
      review.moderationStatus !==
        "approved"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This review is not available.",
      });
    }

    const existingIndex =
      review.helpfulBy.findIndex(
        (id) =>
          String(id) ===
          String(userId)
      );

    let helpful =
      false;

    if (
      existingIndex >=
      0
    ) {
      review.helpfulBy.splice(
        existingIndex,
        1
      );

      helpful =
        false;
    } else {
      review.helpfulBy.push(
        userId
      );

      helpful =
        true;
    }

    review.helpfulCount =
      review.helpfulBy.length;

    await review.save();

    return res.status(200).json({
      success: true,

      helpful,

      helpfulCount:
        review.helpfulCount,
    });
  } catch (error) {
    console.error(
      "❌ toggleHelpful error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "TOGGLE HELPFUL"
    );
  }
};

// ============================================================
// REPORT REVIEW
// ============================================================

const reportReview = async (
  req,
  res,
  next
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
      review.isActive ===
        false ||
      review.isVisible ===
        false
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This review is no longer available.",
      });
    }

    // --------------------------------------------------------
    // CHECK EXISTING REPORT
    // --------------------------------------------------------

    const alreadyReported =
      review.reportedBy.some(
        (item) =>
          item.userId &&
          String(
            item.userId
          ) ===
            String(
              userId
            )
      );

    if (alreadyReported) {
      return res.status(409).json({
        success: false,

        message:
          "You have already reported this review.",
      });
    }

    // --------------------------------------------------------
    // REASON
    // --------------------------------------------------------

    const reason =
      typeof req.body?.reason ===
      "string"
        ? req.body.reason.trim()
        : "No reason provided";

    if (reason.length > 500) {
      return res.status(400).json({
        success: false,

        message:
          "Report reason cannot exceed 500 characters.",
      });
    }

    // --------------------------------------------------------
    // ADD REPORT
    // --------------------------------------------------------

    review.reportedBy.push({
      userId:
        toObjectId(userId),

      reason,

      reportedAt:
        new Date(),
    });

    review.reportCount =
      review.reportedBy.length;

    await review.save();

    return res.status(200).json({
      success: true,

      message:
        "Review reported successfully.",

      reportCount:
        review.reportCount,
    });
  } catch (error) {
    console.error(
      "❌ reportReview error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "REPORT REVIEW"
    );
  }
};

// ============================================================
// SELLER REPLY
// ============================================================

const replyToReview = async (
  req,
  res,
  next
) => {
  try {
    const sellerUserId =
      getUserId(req);

    if (!sellerUserId) {
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

    const text =
      typeof req.body?.text ===
      "string"
        ? req.body.text.trim()
        : "";

    if (text.length < 1) {
      return res.status(400).json({
        success: false,

        message:
          "Reply cannot be empty.",
      });
    }

    if (text.length > 2000) {
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

    // --------------------------------------------------------
    // ONLY SELLER CAN REPLY
    // --------------------------------------------------------

    if (
      String(
        review.sellerId
      ) !==
      String(
        sellerUserId
      )
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Only the seller can reply to this review.",
      });
    }

    if (
      review.isActive !==
        true ||
      review.isVisible !==
        true ||
      review.moderationStatus !==
        "approved"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Cannot reply to this review.",
      });
    }

    // --------------------------------------------------------
    // SAVE REPLY
    // --------------------------------------------------------

    review.sellerReply = {
      text,

      repliedAt:
        new Date(),

      repliedBy:
        toObjectId(
          sellerUserId
        ),
    };

    await review.save();

    return res.status(200).json({
      success: true,

      message:
        "Seller reply added successfully.",

      sellerReply:
        review.sellerReply,
    });
  } catch (error) {
    console.error(
      "❌ replyToReview error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "REPLY TO REVIEW"
    );
  }
};

// ============================================================
// DELETE SELLER REPLY
// ============================================================

const deleteReply = async (
  req,
  res,
  next
) => {
  try {
    const sellerUserId =
      getUserId(req);

    if (!sellerUserId) {
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
      String(
        review.sellerId
      ) !==
      String(
        sellerUserId
      )
    ) {
      return res.status(403).json({
        success: false,

        message:
          "Only the seller can delete this reply.",
      });
    }

    review.sellerReply = {
      text: "",
      repliedAt: null,
      repliedBy: null,
    };

    await review.save();

    return res.status(200).json({
      success: true,

      message:
        "Seller reply deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ deleteReply error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "DELETE SELLER REPLY"
    );
  }
};

// ============================================================
// GET SELLER SUMMARY
// ============================================================

const getSellerSummary = async (
  req,
  res,
  next
) => {
  try {
    const sellerId =
      req.params.sellerId;

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

    const result =
      await Review.aggregate([
        {
          $match: {
            sellerId:
              toObjectId(
                sellerId
              ),

            ...publicReviewFilter(),
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

            fiveStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      5,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            fourStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      4,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            threeStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      3,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            twoStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      2,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            oneStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      1,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const summary =
      result[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0,
      };

    return res.status(200).json({
      success: true,

      summary: {
        averageRating:
          Number(
            summary.averageRating ||
              0
          ).toFixed(1),

        totalReviews:
          summary.totalReviews ||
          0,

        fiveStars:
          summary.fiveStars ||
          0,

        fourStars:
          summary.fourStars ||
          0,

        threeStars:
          summary.threeStars ||
          0,

        twoStars:
          summary.twoStars ||
          0,

        oneStars:
          summary.oneStars ||
          0,
      },
    });
  } catch (error) {
    console.error(
      "❌ getSellerSummary error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "GET SELLER SUMMARY"
    );
  }
};

// ============================================================
// GET PRODUCT SUMMARY
// ============================================================

const getProductSummary = async (
  req,
  res,
  next
) => {
  try {
    const productId =
      req.params.productId;

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

    const result =
      await Review.aggregate([
        {
          $match: {
            productId:
              toObjectId(
                productId
              ),

            ...publicReviewFilter(),
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

            fiveStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      5,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            fourStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      4,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            threeStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      3,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            twoStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      2,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            oneStars: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$rating",
                      1,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const summary =
      result[0] || {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0,
      };

    return res.status(200).json({
      success: true,

      summary: {
        averageRating:
          Number(
            summary.averageRating ||
              0
          ).toFixed(1),

        totalReviews:
          summary.totalReviews ||
          0,

        fiveStars:
          summary.fiveStars ||
          0,

        fourStars:
          summary.fourStars ||
          0,

        threeStars:
          summary.threeStars ||
          0,

        twoStars:
          summary.twoStars ||
          0,

        oneStars:
          summary.oneStars ||
          0,
      },
    });
  } catch (error) {
    console.error(
      "❌ getProductSummary error:",
      error
    );

    return handleDatabaseError(
      res,
      error,
      "GET PRODUCT SUMMARY"
    );
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  reportReview,
  replyToReview,
  deleteReply,
  getSellerSummary,
  getProductSummary,
};