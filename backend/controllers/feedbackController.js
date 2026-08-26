// ============================================================
// backend/controllers/feedbackController.js
// BuyUKUsed Seller Feedback Controller
// ============================================================

"use strict";

const mongoose = require("mongoose");

const Feedback = require("../models/Feedback");
const User = require("../models/User");
const Order = require("../models/Orders");

// ============================================================
// HELPERS
// ============================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeFeedbackType = (value) => {
  const type = String(value || "")
    .trim()
    .toLowerCase();

  if (
    !["positive", "neutral", "negative"].includes(type)
  ) {
    return null;
  }

  return type;
};

const cleanComment = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, 1000);
};

// ============================================================
// RECALCULATE SELLER FEEDBACK
// ============================================================

const recalculateSellerFeedback = async (sellerId) => {
  const stats = await Feedback.aggregate([
    {
      $match: {
        seller: new mongoose.Types.ObjectId(sellerId),
        status: "active",
      },
    },

    {
      $group: {
        _id: "$type",

        count: {
          $sum: 1,
        },
      },
    },
  ]);

  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const item of stats) {
    if (item._id === "positive") {
      positive = item.count;
    }

    if (item._id === "neutral") {
      neutral = item.count;
    }

    if (item._id === "negative") {
      negative = item.count;
    }
  }

  const total =
    positive +
    neutral +
    negative;

  // ----------------------------------------------------------
  // Convert feedback into a 5-point rating.
  //
  // Positive = 5
  // Neutral  = 3
  // Negative = 1
  // ----------------------------------------------------------

  const rating =
    total > 0
      ? Number(
          (
            (positive * 5 +
              neutral * 3 +
              negative * 1) /
            total
          ).toFixed(2)
        )
      : 0;

  await User.findByIdAndUpdate(
    sellerId,
    {
      $set: {
        rating,
        feedbackStats: {
          positive,
          neutral,
          negative,
          total,
        },
      },
    },
    {
      new: false,
    }
  );

  return {
    positive,
    neutral,
    negative,
    total,
    rating,
  };
};

// ============================================================
// GET SELLER FEEDBACK
// GET /api/feedback/seller/:sellerId
// ============================================================

exports.getSellerFeedback = async (req, res) => {
  try {
    const { sellerId } = req.params;

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

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      50
    );

    const skip =
      (page - 1) * limit;

    const filter = {
      seller: sellerId,
      status: "active",
    };

    const type = normalizeFeedbackType(
      req.query.type
    );

    if (type) {
      filter.type = type;
    }

    const [
      feedback,
      total,
      stats,
    ] = await Promise.all([
      Feedback.find(filter)
        .populate(
          "buyer",
          "name avatar profileImage photo photoURL"
        )
        .populate(
          "product",
          "title image images"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Feedback.countDocuments(filter),

      Feedback.aggregate([
        {
          $match: {
            seller:
              new mongoose.Types.ObjectId(
                sellerId
              ),
            status: "active",
          },
        },

        {
          $group: {
            _id: "$type",
            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

    let positive = 0;
    let neutral = 0;
    let negative = 0;

    for (const item of stats) {
      if (item._id === "positive") {
        positive = item.count;
      }

      if (item._id === "neutral") {
        neutral = item.count;
      }

      if (item._id === "negative") {
        negative = item.count;
      }
    }

    const totalFeedback =
      positive +
      neutral +
      negative;

    const rating =
      totalFeedback > 0
        ? Number(
            (
              (positive * 5 +
                neutral * 3 +
                negative * 1) /
              totalFeedback
            ).toFixed(2)
          )
        : 0;

    return res.json({
      success: true,

      feedback,

      stats: {
        positive,
        neutral,
        negative,
        total: totalFeedback,
        rating,
      },

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(
          total / limit
        ),
        totalFeedback: total,
        limit,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get seller feedback error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load seller feedback.",
    });
  }
};

// ============================================================
// CHECK WHETHER BUYER CAN REVIEW SELLER
// GET /api/feedback/can-review/:sellerId
// ============================================================

exports.canReviewSeller = async (req, res) => {
  try {
    const buyerId = getUserId(req);
    const { sellerId } = req.params;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Please sign in.",
      });
    }

    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID.",
      });
    }

    // --------------------------------------------------------
    // Find delivered orders belonging to this buyer
    // that contain a product sold by this seller.
    // --------------------------------------------------------

    const orders = await Order.find({
      user: buyerId,
      status: "delivered",
      "items.seller": sellerId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (!orders.length) {
      return res.json({
        success: true,
        canReview: false,
        reason:
          "You need a delivered order from this seller before leaving feedback.",
        orders: [],
      });
    }

    // --------------------------------------------------------
    // Find which orders already have feedback.
    // --------------------------------------------------------

    const orderIds = orders.map(
      (order) => order._id
    );

    const existingFeedback =
      await Feedback.find({
        buyer: buyerId,
        seller: sellerId,
        order: {
          $in: orderIds,
        },
      })
        .select("order")
        .lean();

    const reviewedOrderIds =
      new Set(
        existingFeedback.map(
          (item) =>
            item.order.toString()
        )
      );

    const availableOrders =
      orders
        .map((order) => ({
          _id: order._id,

          createdAt:
            order.createdAt,

          items:
            order.items
              .filter(
                (item) =>
                  String(
                    item.seller
                  ) ===
                  String(sellerId)
              )
              .map((item) => ({
                product:
                  item.product,

                name:
                  item.name,

                image:
                  item.image,

                price:
                  item.price,

                quantity:
                  item.quantity,
              })),
        }))
        .filter(
          (order) =>
            !reviewedOrderIds.has(
              order._id.toString()
            )
        );

    return res.json({
      success: true,

      canReview:
        availableOrders.length > 0,

      orders: availableOrders,

      reason:
        availableOrders.length > 0
          ? ""
          : "You have already left feedback for all eligible orders.",
    });
  } catch (error) {
    console.error(
      "❌ Can review seller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to determine review eligibility.",
    });
  }
};

// ============================================================
// CREATE FEEDBACK
// POST /api/feedback/seller/:sellerId
// ============================================================

exports.createFeedback = async (req, res) => {
  try {
    const buyerId = getUserId(req);
    const { sellerId } = req.params;

    const {
      type,
      comment,
      orderId,
      productId,
    } = req.body || {};

    // --------------------------------------------------------
    // AUTH
    // --------------------------------------------------------

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message:
          "Please sign in to leave feedback.",
      });
    }

    // --------------------------------------------------------
    // SELLER ID
    // --------------------------------------------------------

    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID.",
      });
    }

    // --------------------------------------------------------
    // FEEDBACK TYPE
    // --------------------------------------------------------

    const normalizedType =
      normalizeFeedbackType(type);

    if (!normalizedType) {
      return res.status(400).json({
        success: false,
        message:
          "Feedback must be positive, neutral, or negative.",
      });
    }

    // --------------------------------------------------------
    // COMMENT
    // --------------------------------------------------------

    const cleanText =
      cleanComment(comment);

    if (cleanText.length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Feedback is too long.",
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
          "A valid delivered order is required.",
      });
    }

    const order =
      await Order.findOne({
        _id: orderId,
        user: buyerId,
        status: "delivered",
      }).lean();

    if (!order) {
      return res.status(403).json({
        success: false,
        message:
          "You can only leave feedback for a delivered order.",
      });
    }

    // --------------------------------------------------------
    // SELLER MUST BE INSIDE THE ORDER
    // --------------------------------------------------------

    const sellerItems =
      order.items.filter(
        (item) =>
          item.seller &&
          String(item.seller) ===
            String(sellerId)
      );

    if (!sellerItems.length) {
      return res.status(403).json({
        success: false,
        message:
          "This order does not contain a product from this seller.",
      });
    }

    // --------------------------------------------------------
    // OPTIONAL PRODUCT
    // --------------------------------------------------------

    let selectedItem =
      sellerItems[0];

    if (
      productId &&
      isValidObjectId(productId)
    ) {
      const matchingItem =
        sellerItems.find(
          (item) =>
            item.product &&
            String(item.product) ===
              String(productId)
        );

      if (!matchingItem) {
        return res.status(403).json({
          success: false,
          message:
            "The selected product was not part of this order.",
        });
      }

      selectedItem =
        matchingItem;
    }

    // --------------------------------------------------------
    // SELLER EXISTS
    // --------------------------------------------------------

    const seller =
      await User.findById(
        sellerId
      ).select("_id role isActive");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found.",
      });
    }

    // --------------------------------------------------------
    // DON'T REVIEW YOURSELF
    // --------------------------------------------------------

    if (
      String(buyerId) ===
      String(sellerId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot leave feedback for yourself.",
      });
    }

    // --------------------------------------------------------
    // CHECK DUPLICATE
    // --------------------------------------------------------

    const existing =
      await Feedback.findOne({
        buyer: buyerId,
        seller: sellerId,
        order: orderId,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "You have already left feedback for this order.",
      });
    }

    // --------------------------------------------------------
    // CREATE FEEDBACK
    // --------------------------------------------------------

    const feedback =
      await Feedback.create({
        seller: sellerId,

        buyer: buyerId,

        order: orderId,

        product:
          selectedItem?.product ||
          null,

        productName:
          selectedItem?.name ||
          "",

        type:
          normalizedType,

        comment:
          cleanText,

        status:
          "active",
      });

    // --------------------------------------------------------
    // UPDATE SELLER REPUTATION
    // --------------------------------------------------------

    const stats =
      await recalculateSellerFeedback(
        sellerId
      );

    // --------------------------------------------------------
    // POPULATE RESPONSE
    // --------------------------------------------------------

    const populatedFeedback =
      await Feedback.findById(
        feedback._id
      )
        .populate(
          "buyer",
          "name avatar profileImage photo photoURL"
        )
        .populate(
          "product",
          "title image images"
        )
        .lean();

    return res.status(201).json({
      success: true,

      message:
        "Your feedback has been posted successfully.",

      feedback:
        populatedFeedback,

      stats,
    });
  } catch (error) {
    console.error(
      "❌ Create seller feedback error:",
      error
    );

    // MongoDB duplicate index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "You have already left feedback for this order.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create feedback.",
    });
  }
};

// ============================================================
// SELLER RESPONSE
// PUT /api/feedback/:feedbackId/respond
// ============================================================

exports.respondToFeedback = async (
  req,
  res
) => {
  try {
    const sellerId = getUserId(req);

    const { feedbackId } =
      req.params;

    const response =
      cleanComment(
        req.body?.response
      );

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (
      !isValidObjectId(
        feedbackId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid feedback ID.",
      });
    }

    if (!response) {
      return res.status(400).json({
        success: false,
        message:
          "Response cannot be empty.",
      });
    }

    const feedback =
      await Feedback.findOne({
        _id: feedbackId,
        seller: sellerId,
        status: "active",
      });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message:
          "Feedback not found.",
      });
    }

    feedback.sellerResponse =
      response;

    feedback.sellerRespondedAt =
      new Date();

    await feedback.save();

    return res.json({
      success: true,

      message:
        "Response posted successfully.",

      feedback,
    });
  } catch (error) {
    console.error(
      "❌ Seller feedback response error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to respond to feedback.",
    });
  }
};