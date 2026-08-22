// ============================================================
// backend/models/Delivery.js
// ============================================================

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
      index: true,
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
      maxlength: 1000,
    },

    pickupContactName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    pickupPhone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    // ==========================================================
    // DELIVERY DESTINATION
    // ==========================================================

    deliveryLocation: {
      type: String,
      required: [true, "Delivery location is required"],
      trim: true,
      maxlength: 1000,
    },

    deliveryContactName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    deliveryPhone: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
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
    // RIDER LOCATION
    // ==========================================================

    riderLocation: {
      latitude: {
        type: Number,
        default: null,
        min: -90,
        max: 90,
      },

      longitude: {
        type: Number,
        default: null,
        min: -180,
        max: 180,
      },

      address: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
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
    // DELIVERY TIMESTAMPS
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

deliverySchema.index({
  status: 1,
  createdAt: -1,
});

deliverySchema.index({
  requester: 1,
  createdAt: -1,
});

deliverySchema.index({
  rider: 1,
  createdAt: -1,
});

deliverySchema.index({
  buyer: 1,
  createdAt: -1,
});

deliverySchema.index({
  seller: 1,
  createdAt: -1,
});

// ============================================================
// MODEL
// ============================================================

const Delivery =
  mongoose.models.Delivery ||
  mongoose.model("Delivery", deliverySchema);

module.exports = Delivery;