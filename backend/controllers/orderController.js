// ============================================================
// backend/controllers/orderController.js
// BuyUKUsed Order Controller
// ============================================================

"use strict";

const mongoose = require("mongoose");

const Order = require("../models/Orders");
const Product = require("../models/Product");

// ============================================================
// CONSTANTS
// ============================================================

const VALID_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const VALID_PAYMENT_METHODS = [
  "cash",
  "paystack",
  "mobile_money",
  "card",
];

const VALID_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

// ============================================================
// HELPERS
// ============================================================

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId
  );
};

// ------------------------------------------------------------
// Convert Mongo ID safely
// ------------------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ------------------------------------------------------------
// Get product image
// ------------------------------------------------------------

const getProductImage = (product) => {
  if (!product) return "";

  if (product.image) {
    return product.image;
  }

  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return product.images[0];
  }

  return "";
};

// ------------------------------------------------------------
// Normalize items
// ------------------------------------------------------------

const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items;
};

// ============================================================
// CREATE ORDER
// ============================================================

exports.createOrder = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentResult,
      totalAmount,
      payment,
    } = req.body;

    // ========================================================
    // VALIDATE ITEMS
    // ========================================================

    const normalizedItems = normalizeItems(items);

    if (normalizedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items.",
      });
    }

    // ========================================================
    // VALIDATE SHIPPING ADDRESS
    // ========================================================

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, phone, and location are required.",
      });
    }

    // ========================================================
    // VALIDATE TOTAL
    // ========================================================

    const parsedTotal = Number(totalAmount);

    if (
      !Number.isFinite(parsedTotal) ||
      parsedTotal < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount.",
      });
    }

    // ========================================================
    // BUILD ORDER ITEMS FROM DATABASE
    //
    // We intentionally retrieve products from MongoDB instead
    // of blindly trusting product names/prices sent by frontend.
    // ========================================================

    const orderItems = [];

    let calculatedTotal = 0;

    for (const item of normalizedItems) {
      const productId =
        item.product ||
        item.productId ||
        item._id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Every order item must contain a product ID.",
        });
      }

      if (!isValidObjectId(productId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      const product =
        await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            `Product ${productId} was not found.`,
        });
      }

      // ======================================================
      // PRODUCT MUST BE ACTIVE
      // ======================================================

      if (
        product.status &&
        product.status !== "active"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${product.title} is no longer available.`,
        });
      }

      // ======================================================
      // QUANTITY
      // ======================================================

      const quantity = Number(
        item.quantity || 1
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product quantity.",
        });
      }

      // ======================================================
      // PRICE FROM DATABASE
      // ======================================================

      const price = Number(product.price);

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid price for ${product.title}.`,
        });
      }

      const itemTotal =
        price * quantity;

      calculatedTotal += itemTotal;

      // ======================================================
      // SELLER
      // ======================================================

      const sellerId =
        product.sellerId ||
        item.seller ||
        null;

      // ======================================================
      // SNAPSHOT
      // ======================================================

      orderItems.push({
        product: product._id,

        seller: sellerId,

        name: product.title,

        image: getProductImage(product),

        quantity,

        price,
      });
    }

    // ========================================================
    // TOTAL VALIDATION
    //
    // We use the database-calculated amount.
    // This prevents a frontend user from changing the price.
    // ========================================================

    const roundedCalculatedTotal =
      Math.round(
        calculatedTotal * 100
      ) / 100;

    const roundedClientTotal =
      Math.round(
        parsedTotal * 100
      ) / 100;

    // Allow tiny floating point difference
    const difference =
      Math.abs(
        roundedCalculatedTotal -
          roundedClientTotal
      );

    if (difference > 0.01) {
      return res.status(400).json({
        success: false,
        message:
          "Order total does not match product prices.",
        calculatedTotal:
          roundedCalculatedTotal,
        submittedTotal:
          roundedClientTotal,
      });
    }

    // ========================================================
    // PAYMENT
    // ========================================================

    let selectedPaymentMethod =
      paymentMethod ||
      payment?.method ||
      "paystack";

    if (
      !VALID_PAYMENT_METHODS.includes(
        selectedPaymentMethod
      )
    ) {
      selectedPaymentMethod =
        "paystack";
    }

    let paymentReference = "";

    let paymentStatus = "pending";

    // Support old/new frontend formats
    if (paymentResult) {
      paymentReference =
        paymentResult.reference ||
        paymentResult.trxref ||
        paymentResult.transaction ||
        "";

      if (
        VALID_PAYMENT_STATUSES.includes(
          paymentResult.status
        )
      ) {
        paymentStatus =
          paymentResult.status;
      }
    }

    if (payment) {
      paymentReference =
        payment.reference ||
        paymentReference;

      if (
        VALID_PAYMENT_STATUSES.includes(
          payment.status
        )
      ) {
        paymentStatus =
          payment.status;
      }
    }

    // ========================================================
    // CREATE ORDER
    // ========================================================

    const order =
      await Order.create({
        user: userId,

        items: orderItems,

        totalAmount:
          roundedCalculatedTotal,

        payment: {
          method:
            selectedPaymentMethod,

          reference:
            paymentReference,

          status:
            paymentStatus,
        },

        shippingAddress: {
          fullName:
            shippingAddress.fullName
              .trim(),

          phone:
            shippingAddress.phone
              .trim(),

          location:
            shippingAddress.location
              .trim(),

          address:
            shippingAddress.address
              ? shippingAddress.address.trim()
              : "",
        },

        status: "pending",
      });

    // ========================================================
    // RESPONSE
    // ========================================================

    const populatedOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product"
        )
        .populate(
          "items.seller",
          "name email phone"
        );

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully.",

      order:
        populatedOrder ||
        order,
    });
  } catch (error) {
    console.error(
      "❌ Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create order.",
    });
  }
};

// ============================================================
// GET MY ORDERS
// ============================================================

exports.getMyOrders = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const orders =
      await Order.find({
        user: userId,
      })
        .populate(
          "items.product"
        )
        .populate(
          "items.seller",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "❌ Get my orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load orders.",
    });
  }
};

// ============================================================
// GET SINGLE ORDER
// ============================================================

exports.getOrderById = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(id)
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product"
        )
        .populate(
          "items.seller",
          "name email phone"
        );

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    // ========================================================
    // OWNERSHIP CHECK
    //
    // Admin routes should use the admin controller/middleware.
    // A normal user should only access their own order.
    // ========================================================

    const isOwner =
      String(order.user?._id || order.user) ===
      String(userId);

    const isAdmin =
      req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this order.",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "❌ Get order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load order.",
    });
  }
};

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

exports.updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { status } =
      req.body;

    // ========================================================
    // VALIDATE STATUS
    // ========================================================

    if (
      !VALID_ORDER_STATUSES.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status.",
        validStatuses:
          VALID_ORDER_STATUSES,
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    // ========================================================
    // UPDATE STATUS
    // ========================================================

    order.status = status;

    // ========================================================
    // STATUS TIMESTAMPS
    // ========================================================

    const now = new Date();

    if (
      status === "processing" &&
      !order.processedAt
    ) {
      order.processedAt = now;
    }

    if (
      status === "shipped" &&
      !order.shippedAt
    ) {
      order.shippedAt = now;
    }

    if (
      status === "delivered" &&
      !order.deliveredAt
    ) {
      order.deliveredAt = now;
    }

    if (
      status === "cancelled" &&
      !order.cancelledAt
    ) {
      order.cancelledAt = now;
    }

    await order.save();

    // ========================================================
    // POPULATE RESPONSE
    // ========================================================

    const updatedOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product"
        )
        .populate(
          "items.seller",
          "name email phone"
        );

    return res.json({
      success: true,

      message:
        "Order status updated successfully.",

      order:
        updatedOrder ||
        order,
    });
  } catch (error) {
    console.error(
      "❌ Update order status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update order status.",
    });
  }
};

// ============================================================
// UPDATE PAYMENT STATUS
// ============================================================

exports.updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const {
      status,
      reference,
      method,
    } = req.body;

    // ========================================================
    // VALIDATE PAYMENT STATUS
    // ========================================================

    if (
      !VALID_PAYMENT_STATUSES.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status.",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    // ========================================================
    // UPDATE PAYMENT
    // ========================================================

    order.payment.status =
      status;

    if (reference) {
      order.payment.reference =
        String(reference).trim();
    }

    if (
      method &&
      VALID_PAYMENT_METHODS.includes(
        method
      )
    ) {
      order.payment.method =
        method;
    }

    if (
      status === "paid" &&
      !order.payment.paidAt
    ) {
      order.payment.paidAt =
        new Date();
    }

    await order.save();

    const updatedOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product"
        )
        .populate(
          "items.seller",
          "name email phone"
        );

    return res.json({
      success: true,

      message:
        "Payment status updated successfully.",

      order:
        updatedOrder ||
        order,
    });
  } catch (error) {
    console.error(
      "❌ Update payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update payment status.",
    });
  }
};

// ============================================================
// GET ALL ORDERS - ADMIN
// ============================================================

exports.getAllOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product"
        )
        .populate(
          "items.seller",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "❌ Get all orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load orders.",
    });
  }
};

// ============================================================
// DELETE ORDER
// ============================================================

exports.deleteOrder = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID.",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    await Order.findByIdAndDelete(id);

    return res.json({
      success: true,
      message:
        "Order deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ Delete order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete order.",
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = exports;