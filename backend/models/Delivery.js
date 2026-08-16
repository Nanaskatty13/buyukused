// backend/models/Delivery.js

const mongoose = require("mongoose");

// ============================================================
// DELIVERY SCHEMA
// ============================================================

const deliverySchema = new mongoose.Schema(
  {
    // ==========================================================
    // PERSON WHO REQUESTED THE DELIVERY
    // ==========================================================

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    requesterRole: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },

    // ==========================================================
    // PRODUCT
    // ==========================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    productTitle: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // SELLER
    // ==========================================================

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sellerName: {
      type: String,
      default: "",
      trim: true,
    },

    sellerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // BUYER
    // ==========================================================

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    buyerName: {
      type: String,
      default: "",
      trim: true,
    },

    buyerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // PICKUP LOCATION
    // ==========================================================

    pickupLocation: {
      type: String,
      required: [true, "Pickup location is required"],
      trim: true,
    },

    pickupContactName: {
      type: String,
      default: "",
      trim: true,
    },

    pickupPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // DELIVERY DESTINATION
    // ==========================================================

    deliveryLocation: {
      type: String,
      required: [true, "Delivery location is required"],
      trim: true,
    },

    deliveryContactName: {
      type: String,
      default: "",
      trim: true,
    },

    deliveryPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // DELIVERY NOTES
    // ==========================================================

    notes: {
      type: String,
      default: "",
      maxlength: 1000,
      trim: true,
    },

    // ==========================================================
    // DELIVERY FEE
    // ==========================================================

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "GHS",
      trim: true,
      uppercase: true,
    },

    // ==========================================================
    // RIDER
    // ==========================================================

    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    riderName: {
      type: String,
      default: "",
      trim: true,
    },

    riderPhone: {
      type: String,
      default: "",
      trim: true,
    },

    riderBikeType: {
      type: String,
      default: "",
      trim: true,
    },

    riderBikeNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // DELIVERY STATUS
    // ==========================================================

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // ==========================================================
    // ACCEPTANCE TIME
    // ==========================================================

    acceptedAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    inTransitAt: {
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

    // ==========================================================
    // CANCELLATION
    // ==========================================================

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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

// Quickly find pending deliveries.
deliverySchema.index({
  status: 1,
  createdAt: -1,
});

// Quickly find a user's deliveries.
deliverySchema.index({
  requester: 1,
  createdAt: -1,
});

// Quickly find rider's deliveries.
deliverySchema.index({
  rider: 1,
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

const Delivery =
  mongoose.models.Delivery ||
  mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;