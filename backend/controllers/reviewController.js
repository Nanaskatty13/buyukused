// ============================================================
// backend/controllers/reviewController.js
// BuyUKUsed - Reviews & Ratings Controller
// ============================================================
//
// Handles:
//
// GET    /api/reviews
// POST   /api/reviews
// PUT    /api/reviews/:id
// DELETE /api/reviews/:id
//
// POST   /api/reviews/:id/helpful
// POST   /api/reviews/:id/report
//
// POST   /api/reviews/:id/reply
// DELETE /api/reviews/:id/reply
//
// GET    /api/reviews/seller/:sellerId/summary
// GET    /api/reviews/product/:productId/summary
//
// ============================================================

const mongoose = require("mongoose");

const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(String(id));
};

const getUserId = (req) => {
  if (req.userId) {
    return String(req.userId);
  }

  if (req.user?._id) {
    return String(req.user._id);
  }

  return null;
};

const sendError = (
  res,
  status,
  message
) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

// ============================================================
// GET REVIEWS
// ============================================================
//
// Examples:
//
// GET /api/reviews?sellerId=xxx
// GET /api/reviews?productId=xxx
//
// Optional:
//
// ?page=1
// ?limit=10
// ?rating=5
//
// ============================================================

const getReviews = async (
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

    const currentPage =
      Math.max(
        Number(page) || 1,
        1
      );

    const perPage = Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      100
    );

    const filter = {
      status: "published",
    };

    // --------------------------------------------------------
    // SELLER FILTER
    // --------------------------------------------------------

    if (sellerId) {
      if (
        !isValidObjectId(
          sellerId
        )
      ) {
        return sendError(
          res,
          400,
          "Invalid seller ID."
        );
      }

      filter.sellerId =
        sellerId;
    }

    // --------------------------------------------------------
    // PRODUCT FILTER
    // --------------------------------------------------------

    if (productId) {
      if (
        !isValidObjectId(
          productId
        )
      ) {
        return sendError(
          res,
          400,
          "Invalid product ID."
        );
      }

      filter.productId =
        productId;
    }

    // --------------------------------------------------------
    // RATING FILTER
    // --------------------------------------------------------

    if (rating !== undefined) {
      const numericRating =
        Number(rating);

      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return sendError(
          res,
          400,
          "Rating must be a whole number from 1 to 5."
        );
      }

      filter.rating =
        numericRating;
    }

    // --------------------------------------------------------
    // COUNT
    // --------------------------------------------------------

    const total =
      await Review.countDocuments(
        filter
      );

    // --------------------------------------------------------
    // REVIEWS
    // --------------------------------------------------------

    const reviews =
      await Review.find(filter)
        .populate(
          "reviewer",
          "name email avatar profileImage"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (currentPage - 1) *
            perPage
        )
        .limit(perPage)
        .lean();

    // --------------------------------------------------------
    // NORMALIZE REVIEW DATA
    // --------------------------------------------------------

    const normalizedReviews =
      reviews.map(
        (review) => ({
          ...review,

          reviewerName:
            review.reviewerName ||
            review.reviewer?.name ||
            "",

          reviewerAvatar:
            review.reviewerAvatar ||
            review.reviewer?.avatar ||
            review.reviewer?.profileImage ||
            "",

          helpfulCount:
            Array.isArray(
              review.helpfulBy
            )
              ? review.helpfulBy.length
              : Number(
                  review.helpfulCount || 0
                ),

          reportCount:
            Array.isArray(
              review.reportedBy
            )
              ? review.reportedBy.length
              : Number(
                  review.reportCount || 0
                ),

          sellerReply:
            review.sellerReply || {
              text: "",
              repliedAt: null,
            },
        })
      );

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    const summaryFilter = {
      ...filter,
    };

    delete summaryFilter.rating;

    const summaryRows =
      await Review.aggregate([
        {
          $match:
            summaryFilter,
        },
        {
          $group: {
            _id: "$rating",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

    const ratingBreakdown = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    summaryRows.forEach(
      (row) => {
        ratingBreakdown[
          row._id
        ] = row.count;
      }
    );

    const summaryCount =
      Object.values(
        ratingBreakdown
      ).reduce(
        (sum, value) =>
          sum + value,
        0
      );

    const weightedTotal =
      Object.entries(
        ratingBreakdown
      ).reduce(
        (sum, [star, count]) =>
          sum +
          Number(star) *
            count,
        0
      );

    const averageRating =
      summaryCount > 0
        ? Number(
            (
              weightedTotal /
              summaryCount
            ).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      success: true,

      reviews:
        normalizedReviews,

      summary: {
        averageRating,
        totalReviews:
          summaryCount,

        ratingBreakdown,
      },

      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages:
          Math.ceil(
            total /
              perPage
          ),
        hasNextPage:
          currentPage *
            perPage <
          total,
        hasPreviousPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ getReviews error:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to load reviews."
    );
  }
};

// ============================================================
// CREATE REVIEW
// ============================================================

const createReview = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const reviewerId =
      getUserId(req);

    if (!reviewerId) {
      return sendError(
        res,
        401,
        "Authentication required."
      );
    }

    if (
      !isValidObjectId(
        reviewerId
      )
    ) {
      return sendError(
        res,
        401,
        "Invalid user account."
      );
    }

    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    const {
      sellerId,
      productId,
      orderId,
      rating,
      comment,
    } = req.body || {};

    // --------------------------------------------------------
    // SELLER ID
    // --------------------------------------------------------

    if (!sellerId) {
      return sendError(
        res,
        400,
        "Seller ID is required."
      );
    }

    if (
      !isValidObjectId(
        sellerId
      )
    ) {
      return sendError(
        res,
        400,
        "Invalid seller ID."
      );
    }

    // --------------------------------------------------------
    // PREVENT SELF REVIEW
    // --------------------------------------------------------

    if (
      String(sellerId) ===
      String(reviewerId)
    ) {
      return sendError(
        res,
        400,
        "You cannot review yourself."
      );
    }

    // --------------------------------------------------------
    // RATING
    // --------------------------------------------------------

    const numericRating =
      Number(rating);

    if (
      !Number.isInteger(
        numericRating
      ) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return sendError(
        res,
        400,
        "Rating must be a whole number from 1 to 5."
      );
    }

    // --------------------------------------------------------
    // COMMENT
    // --------------------------------------------------------

    const cleanComment =
      String(
        comment || ""
      ).trim();

    if (
      cleanComment.length <
      3
    ) {
      return sendError(
        res,
        400,
        "Review must be at least 3 characters."
      );
    }

    if (
      cleanComment.length >
      2000
    ) {
      return sendError(
        res,
        400,
        "Review cannot exceed 2000 characters."
      );
    }

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    const seller =
      await User.findById(
        sellerId
      ).select(
        "name avatar profileImage"
      );

    if (!seller) {
      return sendError(
        res,
        404,
        "Seller not found."
      );
    }

    // --------------------------------------------------------
    // PRODUCT
    // --------------------------------------------------------

    let product = null;

    if (productId) {
      if (
        !isValidObjectId(
          productId
        )
      ) {
        return sendError(
          res,
          400,
          "Invalid product ID."
        );
      }

      product =
        await Product.findById(
          productId
        ).select(
          "title sellerId sellerName"
        );

      if (!product) {
        return sendError(
          res,
          404,
          "Product not found."
        );
      }

      // ------------------------------------------------------
      // MAKE SURE PRODUCT BELONGS TO SELLER
      // ------------------------------------------------------

      if (
        product.sellerId &&
        String(
          product.sellerId
        ) !==
          String(sellerId)
      ) {
        return sendError(
          res,
          400,
          "This product does not belong to the selected seller."
        );
      }
    }

    // --------------------------------------------------------
    // REVIEWER
    // --------------------------------------------------------

    const reviewer =
      await User.findById(
        reviewerId
      ).select(
        "name avatar profileImage"
      );

    if (!reviewer) {
      return sendError(
        res,
        401,
        "User account no longer exists."
      );
    }

    // --------------------------------------------------------
    // PREVENT DUPLICATE REVIEW
    // --------------------------------------------------------
    //
    // One review per reviewer/product.
    //
    // Seller-only reviews can have one review per seller.
    //
    // --------------------------------------------------------

    const duplicateFilter = {
      reviewer: reviewerId,
      sellerId,
    };

    if (productId) {
      duplicateFilter.productId =
        productId;
    } else {
      duplicateFilter.productId =
        null;
    }

    const existingReview =
      await Review.findOne(
        duplicateFilter
      );

    if (existingReview) {
      return sendError(
        res,
        409,
        "You have already reviewed this seller."
      );
    }

    // --------------------------------------------------------
    // VERIFIED PURCHASE
    // --------------------------------------------------------
    //
    // Do not trust the frontend for this value.
    //
    // A supplied orderId is stored only when valid.
    // Actual purchase verification can be added when the
    // Order model/structure is available.
    //
    // --------------------------------------------------------

    let verifiedPurchase =
      false;

    let validOrderId =
      null;

    if (orderId) {
      if (
        isValidObjectId(
          orderId
        )
      ) {
        validOrderId =
          orderId;
      }
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
          "",

        reviewerAvatar:
          reviewer.avatar ||
          reviewer.profileImage ||
          "",

        sellerId,

        sellerName:
          seller.name ||
          "",

        productId:
          productId || null,

        productTitle:
          product?.title ||
          "",

        orderId:
          validOrderId,

        rating:
          numericRating,

        comment:
          cleanComment,

        verifiedPurchase,

        helpfulBy: [],

        helpfulCount: 0,

        reportedBy: [],

        reportCount: 0,

        sellerReply: {
          text: "",
          repliedAt: null,
        },

        status: "published",
      });

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Review created successfully.",
      review,
    });
  } catch (error) {
    console.error(
      "❌ createReview error:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to create review."
    );
  }
};

// ============================================================
// UPDATE REVIEW
// ============================================================

const updateReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return sendError(
        res,
        401,
        "Authentication required."
      );
    }

    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return sendError(
        res,
        400,
        "Invalid review ID."
      );
    }

    const review =
      await Review.findById(id);

    if (!review) {
      return sendError(
        res,
        404,
        "Review not found."
      );
    }

    // --------------------------------------------------------
    // OWNER CHECK
    // --------------------------------------------------------

    if (
      String(
        review.reviewer
      ) !== String(userId)
    ) {
      return sendError(
        res,
        403,
        "You can only edit your own review."
      );
    }

    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    const {
      rating,
      comment,
    } = req.body || {};

    if (rating !== undefined) {
      const numericRating =
        Number(rating);

      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return sendError(
          res,
          400,
          "Rating must be a whole number from 1 to 5."
        );
      }

      review.rating =
        numericRating;
    }

    if (comment !== undefined) {
      const cleanComment =
        String(
          comment
        ).trim();

      if (
        cleanComment.length <
        3
      ) {
        return sendError(
          res,
          400,
          "Review must be at least 3 characters."
        );
      }

      if (
        cleanComment.length >
        2000
      ) {
        return sendError(
          res,
          400,
          "Review cannot exceed 2000 characters."
        );
      }

      review.comment =
        cleanComment;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message:
        "Review updated successfully.",
      review,
    });
  } catch (error) {
    console.error(
      "❌ updateReview error:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to update review."
    );
  }
};

// ============================================================
// DELETE REVIEW
// ============================================================

const deleteReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return sendError(
        res,
        401,
        "Authentication required."
      );
    }

    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return sendError(
        res,
        400,
        "Invalid review ID."
      );
    }

    const review =
      await Review.findById(id);

    if (!review) {
      return sendError(
        res,
        404,
        "Review not found."
      );
    }

    const isOwner =
      String(
        review.reviewer
      ) === String(userId);

    const isAdmin =
      req.user?.role ===
      "admin";

    if (
      !isOwner &&
      !isAdmin
    ) {
      return sendError(
        res,
        403,
        "You do not have permission to delete this review."
      );
    }

    await Review.findByIdAndDelete(
      id
    );

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

    return sendError(
      res,
      500,
      "Failed to delete review."
    );
  }
};

// ============================================================
// TOGGLE HELPFUL
// ============================================================

const toggleHelpful = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return sendError(
        res,
        401,
        "Authentication required."
      );
    }

    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return sendError(
        res,
        400,
        "Invalid review ID."
      );
    }

    const review =
      await Review.findById(id);

    if (!review) {
      return sendError(
        res,
        404,
        "Review not found."
      );
    }

    const existingIndex =
      review.helpfulBy.findIndex(
        (value) =>
          String(value) ===
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
        userId
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

    return sendError(
      res,
      500,
      "Failed to update helpful vote."
    );
  }
};

// ============================================================
// REPORT REVIEW
// ============================================================

const reportReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return sendError(
        res,
        401,
        "Authentication required."
      );
    }

    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return sendError(
        res,
        400,
        "Invalid review ID."
      );
    }

    const review =
      await Review.findById(id);

    if (!review) {
      return sendError(
        res,
        404,
        "Review not found."
      );
    }

    const {
      reason = "Other",
    } = req.body || {};

    const cleanReason =
      String(
        reason
      ).trim();

    if (
      cleanReason.length >
      500
    ) {
      return sendError(
        res,
        400,
        "Report reason cannot exceed 500 characters."
      );
    }

    const alreadyReported =
      review.reportedBy.some(
        (report) =>
          String(
            report.userId
          ) ===
          String(userId)
      );

    if (
      alreadyReported
    ) {
      return sendError(
        res,
        409,
        "You have already reported this review."
      );
    }

    review.reportedBy.push({
      userId,
      reason:
        cleanReason ||
        "Other",
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

    return sendError(
      res,
      500,
      "Failed to report review."
    );
  }
};

// ============================================================
// SELLER REPLY
// ============================================================

const replyToReview = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return sendError(
        res,
        401,
        "Authentication required."
      );
    }

    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return sendError(
        res,
        400,
        "Invalid review ID."
      );
    }

    const {
      text,
    } = req.body || {};

    const cleanText =
      String(
        text || ""
      ).trim();

    if (
      cleanText.length <
      1
    ) {
      return sendError(
        res,
        400,
        "Reply text is required."
      );
    }

    if (
      cleanText.length >
      2000
    ) {
      return sendError(
        res,
        400,
        "Reply cannot exceed 2000 characters."
      );
    }

    const review =
      await Review.findById(id);

    if (!review) {
      return sendError(
        res,
        404,
        "Review not found."
      );
    }

    // --------------------------------------------------------
    // ONLY THE SELLER CAN REPLY
    // --------------------------------------------------------

    if (
      String(
        review.sellerId
      ) !== String(userId)
    ) {
      return sendError(
        res,
        403,
        "Only the seller can reply to this review."
      );
    }

    review.sellerReply = {
      text:
        cleanText,
      repliedAt:
        new Date(),
    };

    await review.save();

    return res.status(200).json({
      success: true,
      message:
        "Seller reply saved successfully.",
      review,
    });
  } catch (error) {
    console.error(
      "❌ replyToReview error:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to save seller reply."
    );
  }
};

// ============================================================
// DELETE SELLER REPLY
// ============================================================

const deleteReply = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return sendError(
        res,
        401,
        "Authentication required."
      );
    }

    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return sendError(
        res,
        400,
        "Invalid review ID."
      );
    }

    const review =
      await Review.findById(id);

    if (!review) {
      return sendError(
        res,
        404,
        "Review not found."
      );
    }

    if (
      String(
        review.sellerId
      ) !== String(userId)
    ) {
      return sendError(
        res,
        403,
        "Only the seller can delete this reply."
      );
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
      review,
    });
  } catch (error) {
    console.error(
      "❌ deleteReply error:",
      error
    );

    return sendError(
      res,
      500,
      "Failed to delete seller reply."
    );
  }
};

// ============================================================
// SELLER SUMMARY
// ============================================================

const getSellerSummary = async (
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
      return sendError(
        res,
        400,
        "Invalid seller ID."
      );
    }

    const result =
      await Review.aggregate([
        {
          $match: {
            sellerId:
              new mongoose.Types.ObjectId(
                sellerId
              ),
            status:
              "published",
          },
        },
        {
          $group: {
            _id: null,

            totalReviews: {
              $sum: 1,
            },

            averageRating: {
              $avg: "$rating",
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
        totalReviews: 0,
        averageRating: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0,
      };

    return res.status(200).json({
      success: true,

      summary: {
        totalReviews:
          summary.totalReviews,

        averageRating:
          summary.averageRating
            ? Number(
                Number(
                  summary.averageRating
                ).toFixed(1)
              )
            : 0,

        ratingBreakdown: {
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

    return sendError(
      res,
      500,
      "Failed to load seller review summary."
    );
  }
};

// ============================================================
// PRODUCT SUMMARY
// ============================================================

const getProductSummary = async (
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
      return sendError(
        res,
        400,
        "Invalid product ID."
      );
    }

    const result =
      await Review.aggregate([
        {
          $match: {
            productId:
              new mongoose.Types.ObjectId(
                productId
              ),
            status:
              "published",
          },
        },
        {
          $group: {
            _id: null,

            totalReviews: {
              $sum: 1,
            },

            averageRating: {
              $avg: "$rating",
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
        totalReviews: 0,
        averageRating: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0,
      };

    return res.status(200).json({
      success: true,

      summary: {
        totalReviews:
          summary.totalReviews,

        averageRating:
          summary.averageRating
            ? Number(
                Number(
                  summary.averageRating
                ).toFixed(1)
              )
            : 0,

        ratingBreakdown: {
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

    return sendError(
      res,
      500,
      "Failed to load product review summary."
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