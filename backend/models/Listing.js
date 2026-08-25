// backend/models/Listing.js

const mongoose = require("mongoose");

const CATEGORIES = [
  "Engine",
  "Transmission",
  "Brakes",
  "Suspension & Steering",
  "Electrical",
  "Body & Exterior",
  "Interior",
  "Wheels & Tyres",
  "AC & Cooling",
];

const CONDITIONS = ["New", "Used", "Refurbished"];
const STATUSES = ["draft", "published", "sold"];

const listingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    partType: { type: String, required: true, trim: true },
    partName: { type: String, required: true, trim: true },
    condition: { type: String, enum: CONDITIONS, default: "New" },
    price: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"],
    },
    quantityAvailable: { type: Number, required: true, min: 1, default: 1 },
    description: { type: String, required: true, trim: true },
    images: {
      main: { type: String, required: true },
      additional: [String],
    },
    video: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    negotiable: { type: Boolean, default: false },
    wholesaleAvailable: { type: Boolean, default: false },
    wholesalePrice: { type: Number, min: 0 },
    originalPrice: { type: Number, min: 0 },
    minOrderQty: { type: Number, min: 1, default: 1 },
    deliveryAvailable: { type: Boolean, default: false },
    deliveryFee: { type: Number, min: 0, default: 0 },
    freeDelivery: { type: Boolean, default: false },
    deliveryTime: { type: String, trim: true },
    warranty: { type: String, trim: true },
    returnPolicy: { type: String, trim: true },
    pickupAvailable: { type: Boolean, default: false },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: STATUSES, default: "draft" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes (only here to avoid duplication warnings)
listingSchema.index({ category: 1, partType: 1 });
listingSchema.index({ user: 1, status: 1 });
listingSchema.index({ title: "text", description: "text" });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });

listingSchema.virtual("seller", {
  ref: "User",
  localField: "user",
  foreignField: "_id",
  justOne: true,
});

listingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Listing =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);

module.exports = Listing;