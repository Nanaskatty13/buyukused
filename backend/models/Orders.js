// ============================================================
// backend/models/Orders.js
// BuyUKUsed Order Model
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// ORDER ITEM SCHEMA
// ============================================================

const orderItemSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // Product
    // --------------------------------------------------------

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // --------------------------------------------------------
    // Seller
    // --------------------------------------------------------

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --------------------------------------------------------
    // Product snapshot
    // --------------------------------------------------------

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // Quantity
    // --------------------------------------------------------

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    // --------------------------------------------------------
    // Price at time of purchase
    // --------------------------------------------------------

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
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
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0,

        message:
          "An order must contain at least one item.",
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
      method: {
        type: String,
        enum: [
          "cash",
          "paystack",
          "mobile_money",
          "card",
        ],
        default: "paystack",
      },

      reference: {
        type: String,
        default: "",
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "refunded",
        ],
        default: "pending",
      },

      paidAt: {
        type: Date,
        default: null,
      },
    },

    // ========================================================
    // SHIPPING ADDRESS
    // ========================================================

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      location: {
        type: String,
        required: true,
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ========================================================
    // ORDER STATUS
    // ========================================================

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// INDEXES
// ============================================================

// Customer orders
orderSchema.index({
  user: 1,
  createdAt: -1,
});

// Seller orders
orderSchema.index({
  "items.seller": 1,
  createdAt: -1,
});

// Seller + status
orderSchema.index({
  "items.seller": 1,
  status: 1,
  createdAt: -1,
});

// Payment reference lookup
orderSchema.index({
  "payment.reference": 1,
});

// ============================================================
// MODEL
// ============================================================

const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    orderSchema
  );

module.exports = Order;