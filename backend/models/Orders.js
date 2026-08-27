// ============================================================
// backend/models/Orders.js
// BuyUKUsed Order Model
// ============================================================

"use strict";

const mongoose = require("mongoose");

// ============================================================
// CONSTANTS
// ============================================================

const PAYMENT_METHODS = [
  "cash",
  "paystack",
  "mobile_money",
  "card",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// ============================================================
// ORDER ITEM SCHEMA
// ============================================================

const orderItemSchema = new mongoose.Schema(
  {
    // Product purchased
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Seller of the product
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Snapshot of product name at time of purchase
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Snapshot of product image at time of purchase
    image: {
      type: String,
      default: "",
      trim: true,
    },

    // Quantity purchased
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // Price at time of purchase
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// SHIPPING ADDRESS SCHEMA
// ============================================================

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    address: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// PAYMENT SCHEMA
// ============================================================

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "paystack",
    },

    // Paystack/payment transaction reference
    reference: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

// ============================================================
// ORDER SCHEMA
// ============================================================

const orderSchema = new mongoose.Schema(
  {
    // ========================================================
    // CUSTOMER
    // ========================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ========================================================
    // PRODUCTS
    // ========================================================

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Order must contain at least one item.",
      },
    },

    // ========================================================
    // TOTAL
    // ========================================================

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ========================================================
    // PAYMENT
    // ========================================================

    payment: {
      type: paymentSchema,
      default: () => ({}),
    },

    // ========================================================
    // DELIVERY / SHIPPING
    // ========================================================

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // ========================================================
    // ORDER STATUS
    // ========================================================

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
      index: true,
    },

    // ========================================================
    // DELIVERY DATES
    // ========================================================

    processedAt: {
      type: Date,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
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

// User's orders
orderSchema.index({
  user: 1,
  createdAt: -1,
});

// Status + date
orderSchema.index({
  status: 1,
  createdAt: -1,
});

// Payment reference
//
// IMPORTANT:
// This is intentionally NOT unique because:
// - old orders may have empty references
// - different payment providers may use different references
// - we don't want duplicate-index warnings
//
orderSchema.index({
  "payment.reference": 1,
});

// Seller lookup
orderSchema.index({
  "items.seller": 1,
  createdAt: -1,
});

// ============================================================
// PRE-SAVE STATUS TIMESTAMPS
// ============================================================

orderSchema.pre("save", function (next) {
  const now = new Date();

  if (
    this.isModified("status") &&
    this.status === "processing" &&
    !this.processedAt
  ) {
    this.processedAt = now;
  }

  if (
    this.isModified("status") &&
    this.status === "shipped" &&
    !this.shippedAt
  ) {
    this.shippedAt = now;
  }

  if (
    this.isModified("status") &&
    this.status === "delivered" &&
    !this.deliveredAt
  ) {
    this.deliveredAt = now;
  }

  if (
    this.isModified("status") &&
    this.status === "cancelled" &&
    !this.cancelledAt
  ) {
    this.cancelledAt = now;
  }

  if (
    this.isModified("payment.status") &&
    this.payment?.status === "paid" &&
    !this.payment.paidAt
  ) {
    this.payment.paidAt = now;
  }

  next();
});

// ============================================================
// MODEL
// ============================================================

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

module.exports = Order;