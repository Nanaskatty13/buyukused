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
  if (
    id === null ||
    id === undefined ||
    id === ""
  ) {
    return false;
  }

  return mongoose.Types.ObjectId.isValid(
    String(id)
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
// CONVERT TO OBJECT ID
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
// NORMALIZE OPTIONAL ID
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
// ERROR HANDLER
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
    "Stack:",
    error?.stack
  );

  // ==========================================================
  // DUPLICATE KEY
  // ==========================================================

  if (error?.code === 11000) {
    const keyPattern =
      error.keyPattern || {};

    // Product review duplicate
    if (
      keyPattern.productId
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this product.",
        error:
          "REVIEW_ALREADY_EXISTS",
        canEdit: true,
      });
    }

    // Seller review duplicate
    return res.status(409).json({
      success: false,
      message:
        "You have already reviewed this seller.",
      error:
        "REVIEW_ALREADY_EXISTS",
      canEdit: true,
    });
  }

  // ==========================================================
  // VALIDATION
  // ==========================================================

  if (
    error?.name ===
    "ValidationError"
  ) {
    const errors = {};

    Object.keys(
      error.errors || {}
    ).forEach((field) => {
      errors[field] =
        error.errors[field]?.message ||
        "Invalid value.";
    });

    return res.status(400).json({
      success: false,
      message:
        "Review validation failed.",
      error:
        "VALIDATION_ERROR",
      errors,
    });
  }

  // ==========================================================
  // CAST ERROR
  // ==========================================================

  if (
    error?.name ===
    "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message:
        `Invalid ${error.path || "ID"} value.`,
      error:
        "CAST_ERROR",
    });
  }

  // ==========================================================
  // GENERIC
  // ==========================================================

  return res.status(500).json({
    success: false,
    message:
      error?.message ||
      `Failed to ${operation.toLowerCase()}.`,
    error:
      process.env.NODE_ENV === "production"
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

    // ========================================================
    // REQUIRE SELLER OR PRODUCT
    // ========================================================

    if (
      !sellerId &&
      !productId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "sellerId or productId is required.",
      });
    }

    // ========================================================
    // VALIDATE SELLER
    // ========================================================

    if (
      sellerId &&
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

    // ========================================================
    // VALIDATE PRODUCT
    // ========================================================

    if (
      productId &&
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

    // ========================================================
    // RATING
    // ========================================================

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

    // ========================================================
    // PAGINATION
    // ========================================================

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

    // ========================================================
    // QUERY
    // ========================================================

    const query = {
      status: "published",
    };

    if (sellerId) {
      query.sellerId =
        toObjectId(
          sellerId
        );
    }

    if (productId) {
      query.productId =
        toObjectId(
          productId
        );
    }

    if (
      numericRating !== null
    ) {
      query.rating =
        numericRating;
    }

    // ========================================================
    // REVIEWS
    // ========================================================

    const [
      reviews,
      total,
    ] = await Promise.all([
      Review.find(query)
        .populate(
          "reviewer",
          "name email avatar profileImage photo photoURL"
        )
        .populate(
          "sellerId",
          "name email avatar profileImage photo photoURL"
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

    // ========================================================
    // ADD USER-SPECIFIC HELPFUL STATUS
    // ========================================================

    const authenticatedUserId =
      getUserId(req);

    const formattedReviews =
      reviews.map(
        (review) => ({
          ...review,

          helpfulCount:
            Array.isArray(
              review.helpfulBy
            )
              ? review.helpfulBy.length
              : review.helpfulCount ||
                0,

          hasHelpful:
            authenticatedUserId
              ? Array.isArray(
                  review.helpfulBy
                ) &&
                review.helpfulBy.some(
                  (id) =>
                    String(id) ===
                    String(
                      authenticatedUserId
                    )
                )
              : false,
        })
      );

    // ========================================================
    // SUMMARY
    // ========================================================

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

    // ========================================================
    // PAGINATION
    // ========================================================

    const totalPages =
      total === 0
        ? 1
        : Math.ceil(
            total /
              perPage
          );

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      reviews:
        formattedReviews,

      summary: {
        averageRating:
          Number(
            summary.averageRating ||
              0
          ).toFixed(1),

        totalReviews:
          summary.totalReviews ||
          0,

        // Keep both formats available
        // for frontend compatibility.

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

        breakdown: {
          5:
            summary.fiveStars ||
            0,

          4:
            summary.fourStars ||
            0,

          3:
            summary.threeStars ||
            0,

          2:
            summary.twoStars ||
            0,

          1:
            summary.oneStars ||
            0,
        },
      },

      pagination: {
        page:
          currentPage,

        currentPage:
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
//
// POST /api/reviews
//
// Seller review:
//
// {
//   sellerId: "...",
//   rating: 5,
//   comment: "Great seller"
// }
//
// Product review:
//
// {
//   sellerId: "...",
//   productId: "...",
//   rating: 5,
//   comment: "Great product"
// }
//
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
    // AUTH
    // ========================================================

    const authenticatedUserId =
      getUserId(req);

    console.log(
      "⭐ Authenticated user:",
      authenticatedUserId
        ? String(
            authenticatedUserId
          )
        : "NONE"
    );

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
    // REQUEST DATA
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

    console.log(
      "⭐ Seller ID:",
      sellerId
        ? String(sellerId)
        : "NONE"
    );

    console.log(
      "⭐ Product ID:",
      productId
        ? String(productId)
        : "NONE"
    );

    console.log(
      "⭐ Order ID:",
      orderId
        ? String(orderId)
        : "NONE"
    );

    console.log(
      "⭐ Rating:",
      rating
    );

    console.log(
      "⭐ Comment:",
      comment
    );

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
      toObjectId(
        sellerId
      );

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
        toObjectId(
          productId
        );

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

      // ------------------------------------------------------
      // PRODUCT MUST BELONG TO SELLER
      // ------------------------------------------------------

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
        toObjectId(
          orderId
        );
    }

    // ========================================================
    // PREVENT SELF REVIEW
    // ========================================================

    if (
      String(
        reviewerId
      ) ===
      String(
        sellerObjectId
      )
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

    if (
      comment.length < 3
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Review must be at least 3 characters.",
      });
    }

    if (
      comment.length > 2000
    ) {
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
        "name avatar profileImage photo photoURL email isActive role"
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
        "name shopName email avatar profileImage photo photoURL isActive role"
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
    // IMPORTANT:
    // Seller-only reviews do NOT set productId to null.
    //
    // They leave productId undefined.
    //
    // This matches the partial unique index in Review.js.
    //
    // ========================================================

    const duplicateQuery = {
      reviewer:
        reviewerId,

      sellerId:
        sellerObjectId,

      status: {
        $ne: "removed",
      },
    };

    if (
      productObjectId
    ) {
      duplicateQuery.productId =
        productObjectId;
    } else {
      duplicateQuery.productId = {
        $exists: false,
      };
    }

    console.log(
      "⭐ Duplicate check:",
      duplicateQuery
    );

    const existingReview =
      await Review.findOne(
        duplicateQuery
      )
        .sort({
          createdAt: -1,
        })
        .lean();

    if (
      existingReview
    ) {
      console.log(
        "⚠️ Existing review:",
        String(
          existingReview._id
        )
      );

      return res.status(409).json({
        success: false,

        message:
          productObjectId
            ? "You have already reviewed this product."
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

    if (
      orderObjectId
    ) {
      try {
        const Order =
          require(
            "../models/Order"
          );

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
      } catch (
        orderError
      ) {
        console.warn(
          "⚠️ Order verification skipped:",
          orderError.message
        );

        verifiedPurchase =
          false;
      }
    }

    // ========================================================
    // NAME / AVATAR
    // ========================================================

    const reviewerName =
      typeof reviewer.name ===
      "string"
        ? reviewer.name.trim()
        : "Buyer";

    const reviewerAvatar =
      reviewer.avatar ||
      reviewer.profileImage ||
      reviewer.photo ||
      reviewer.photoURL ||
      "";

    const sellerName =
      typeof (
        seller.shopName ||
        seller.name
      ) === "string"
        ? String(
            seller.shopName ||
              seller.name
          ).trim()
        : "Seller";

    // ========================================================
    // REVIEW DATA
    // ========================================================
    //
    // IMPORTANT:
    // We intentionally DO NOT put productId: null
    // on seller-only reviews.
    //
    // ========================================================

    const reviewData = {
      reviewer:
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
      },

      status:
        "published",
    };

    // --------------------------------------------------------
    // ONLY ADD PRODUCT FIELDS IF PRODUCT EXISTS
    // --------------------------------------------------------

    if (
      productObjectId
    ) {
      reviewData.productId =
        productObjectId;

      reviewData.productTitle =
        product?.title || "";
    }

    // --------------------------------------------------------
    // ONLY ADD ORDER IF ORDER EXISTS
    // --------------------------------------------------------

    if (
      orderObjectId
    ) {
      reviewData.orderId =
        orderObjectId;
    }

    // ========================================================
    // LOG
    // ========================================================

    console.log(
      "⭐ FINAL REVIEW DATA:"
    );

    console.log(
      JSON.stringify(
        {
          reviewer:
            String(
              reviewData.reviewer
            ),

          sellerId:
            String(
              reviewData.sellerId
            ),

          productId:
            reviewData.productId
              ? String(
                  reviewData.productId
                )
              : "UNDEFINED",

          orderId:
            reviewData.orderId
              ? String(
                  reviewData.orderId
                )
              : "UNDEFINED",

          rating:
            reviewData.rating,

          comment:
            reviewData.comment,

          verifiedPurchase:
            reviewData.verifiedPurchase,
        },
        null,
        2
      )
    );

    // ========================================================
    // CREATE
    // ========================================================

    let review;

    try {
      review =
        await Review.create(
          reviewData
        );
    } catch (
      createError
    ) {
      return handleDatabaseError(
        res,
        createError,
        "CREATE REVIEW"
      );
    }

    console.log(
      "✅ REVIEW CREATED:",
      String(
        review._id
      )
    );

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
            "reviewer",
            "name email avatar profileImage photo photoURL"
          )
          .populate(
            "sellerId",
            "name shopName email avatar profileImage photo photoURL"
          )
          .populate(
            "productId",
            "title image images price"
          )
          .lean();
    } catch (
      populateError
    ) {
      console.warn(
        "⚠️ Review population failed:",
        populateError.message
      );

      populatedReview =
        review.toObject();
    }

    // ========================================================
    // UPDATE SELLER RATING
    // ========================================================

    await recalculateSellerRating(
      sellerObjectId
    );

    // ========================================================
    // UPDATE PRODUCT RATING
    // ========================================================

    if (
      productObjectId
    ) {
      await recalculateProductRating(
        productObjectId
      );
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    console.log(
      "✅ REVIEW COMPLETE"
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
//
// PUT /api/reviews/:id
//
// ============================================================

const updateReview = async (
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

    // ========================================================
    // OWNER ONLY
    // ========================================================

    if (
      String(
        review.reviewer
      ) !==
      String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only edit your own review.",
      });
    }

    if (
      review.status ===
      "removed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This review has been removed.",
      });
    }

    // ========================================================
    // RATING
    // ========================================================

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

    // ========================================================
    // COMMENT
    // ========================================================

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

      if (
        comment.length < 3
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Review must be at least 3 characters.",
        });
      }

      if (
        comment.length > 2000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Review cannot exceed 2000 characters.",
        });
      }

      review.comment =
        comment;
    }

    // ========================================================
    // SAVE
    // ========================================================

    await review.save();

    // ========================================================
    // RECALCULATE
    // ========================================================

    await recalculateSellerRating(
      review.sellerId
    );

    if (
      review.productId
    ) {
      await recalculateProductRating(
        review.productId
      );
    }

    // ========================================================
    // POPULATE
    // ========================================================

    const updatedReview =
      await Review.findById(
        review._id
      )
        .populate(
          "reviewer",
          "name email avatar profileImage photo photoURL"
        )
        .populate(
          "sellerId",
          "name shopName email avatar profileImage photo photoURL"
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
//
// DELETE /api/reviews/:id
//
// Soft delete.
//
// ============================================================

const deleteReview = async (
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

    // ========================================================
    // OWNER OR ADMIN
    // ========================================================

    const isOwner =
      String(
        review.reviewer
      ) ===
      String(userId);

    const isAdmin =
      req.user?.role ===
      "admin";

    if (
      !isOwner &&
      !isAdmin
    ) {
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

    // ========================================================
    // SOFT DELETE
    // ========================================================

    review.status =
      "removed";

    await review.save();

    // ========================================================
    // RECALCULATE
    // ========================================================

    await recalculateSellerRating(
      sellerId
    );

    if (productId) {
      await recalculateProductRating(
        productId
      );
    }

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
// HELPFUL TOGGLE
// ============================================================
//
// POST /api/reviews/:id/helpful
//
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
      review.status !==
      "published"
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

    let helpful = false;

    if (
      existingIndex >= 0
    ) {
      review.helpfulBy.splice(
        existingIndex,
        1
      );

      helpful = false;
    } else {
      review.helpfulBy.push(
        toObjectId(
          userId
        )
      );

      helpful = true;
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

    next(error);
  }
};

// ============================================================
// REPORT REVIEW
// ============================================================
//
// POST /api/reviews/:id/report
//
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
      review.status ===
      "removed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This review is no longer available.",
      });
    }

    // ========================================================
    // PREVENT DUPLICATE REPORT
    // ========================================================

    const alreadyReported =
      review.reportedBy.some(
        (report) =>
          report.userId &&
          String(
            report.userId
          ) ===
            String(userId)
      );

    if (
      alreadyReported
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reported this review.",
      });
    }

    const reason =
      typeof req.body?.reason ===
      "string"
        ? req.body.reason.trim()
        : "No reason provided";

    if (
      reason.length > 500
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Report reason cannot exceed 500 characters.",
      });
    }

    review.reportedBy.push({
      userId:
        toObjectId(
          userId
        ),

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

    next(error);
  }
};

// ============================================================
// SELLER REPLY
// ============================================================
//
// POST /api/reviews/:id/reply
//
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

    if (
      text.length < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reply cannot be empty.",
      });
    }

    if (
      text.length > 2000
    ) {
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

    // ========================================================
    // SELLER OWNERSHIP
    // ========================================================

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
      review.status !==
      "published"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot reply to this review.",
      });
    }

    review.sellerReply = {
      text,

      repliedAt:
        new Date(),
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

    next(error);
  }
};

// ============================================================
// DELETE SELLER REPLY
// ============================================================
//
// DELETE /api/reviews/:id/reply
//
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

    next(error);
  }
};

// ============================================================
// SELLER SUMMARY
// ============================================================
//
// GET /api/reviews/seller/:sellerId/summary
//
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

            status:
              "published",
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

        breakdown: {
          5:
            summary.fiveStars ||
            0,

          4:
            summary.fourStars ||
            0,

          3:
            summary.threeStars ||
            0,

          2:
            summary.twoStars ||
            0,

          1:
            summary.oneStars ||
            0,
        },
      },
    });
  } catch (error) {
    console.error(
      "❌ getSellerSummary error:",
      error
    );

    next(error);
  }
};

// ============================================================
// PRODUCT SUMMARY
// ============================================================
//
// GET /api/reviews/product/:productId/summary
//
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

            status:
              "published",
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

        breakdown: {
          5:
            summary.fiveStars ||
            0,

          4:
            summary.fourStars ||
            0,

          3:
            summary.threeStars ||
            0,

          2:
            summary.twoStars ||
            0,

          1:
            summary.oneStars ||
            0,
        },
      },
    });
  } catch (error) {
    console.error(
      "❌ getProductSummary error:",
      error
    );

    next(error);
  }
};

// ============================================================
// RECALCULATE SELLER RATING
// ============================================================

const recalculateSellerRating =
  async (sellerId) => {
    try {
      const result =
        await Review.aggregate([
          {
            $match: {
              sellerId:
                toObjectId(
                  sellerId
                ),

              status:
                "published",
            },
          },

          {
            $group: {
              _id: null,

              averageRating: {
                $avg: "$rating",
              },

              reviewCount: {
                $sum: 1,
              },
            },
          },
        ]);

      const averageRating =
        result[0]
          ?.averageRating ||
        0;

      const reviewCount =
        result[0]
          ?.reviewCount ||
        0;

      // --------------------------------------------------------
      // Only update fields that actually exist on User.
      // --------------------------------------------------------
      //
      // Mongoose strict mode ignores fields that aren't
      // declared in the User schema.
      //
      // --------------------------------------------------------

      await User.findByIdAndUpdate(
        sellerId,
        {
          $set: {
            averageRating:
              Number(
                averageRating
              ).toFixed(1),

            reviewCount:
              reviewCount,
          },
        }
      );

      console.log(
        "⭐ Seller rating recalculated:",
        String(
          sellerId
        ),
        averageRating,
        reviewCount
      );
    } catch (error) {
      console.warn(
        "⚠️ Seller rating recalculation failed:",
        error.message
      );
    }
  };

// ============================================================
// RECALCULATE PRODUCT RATING
// ============================================================

const recalculateProductRating =
  async (productId) => {
    try {
      const result =
        await Review.aggregate([
          {
            $match: {
              productId:
                toObjectId(
                  productId
                ),

              status:
                "published",
            },
          },

          {
            $group: {
              _id: null,

              averageRating: {
                $avg: "$rating",
              },

              reviewCount: {
                $sum: 1,
              },
            },
          },
        ]);

      const averageRating =
        result[0]
          ?.averageRating ||
        0;

      const reviewCount =
        result[0]
          ?.reviewCount ||
        0;

      await Product.findByIdAndUpdate(
        productId,
        {
          $set: {
            rating:
              Number(
                averageRating
              ).toFixed(1),

            reviewCount:
              reviewCount,
          },
        }
      );

      console.log(
        "⭐ Product rating recalculated:",
        String(
          productId
        ),
        averageRating,
        reviewCount
      );
    } catch (error) {
      console.warn(
        "⚠️ Product rating recalculation failed:",
        error.message
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