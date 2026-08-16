// backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ============================================================
// USER SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(
  {
    // ==========================================================
    // BASIC INFORMATION
    // ==========================================================

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [
        2,
        "Name must be at least 2 characters",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,

      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            value
          );
        },

        message:
          "Please enter a valid email address",
      },
    },

    password: {
      type: String,

      required: function () {
        return this.provider === "local";
      },

      minlength: [
        6,
        "Password must be at least 6 characters",
      ],

      select: true,
    },

    // ==========================================================
    // CONTACT INFORMATION
    // ==========================================================

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "Ghana",
      trim: true,
    },

    // ==========================================================
    // PROFILE IMAGE
    // ==========================================================

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    photoURL: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // AUTH PROVIDER
    // ==========================================================

    provider: {
      type: String,
      enum: [
        "local",
        "google",
        "facebook",
      ],
      default: "local",
    },

    providerId: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // USER ROLE
    // ==========================================================

    role: {
      type: String,

      enum: [
        "buyer",
        "seller",
        "rider",
        "admin",
      ],

      default: "buyer",
    },

    // ==========================================================
    // RIDER INFORMATION
    // ==========================================================

    riderProfile: {
      // Whether the rider is currently available
      isAvailable: {
        type: Boolean,
        default: false,
      },

      // Whether the rider account has been approved
      isApproved: {
        type: Boolean,
        default: false,
      },

      // Motorcycle information
      bikeType: {
        type: String,
        default: "",
        trim: true,
      },

      bikeNumber: {
        type: String,
        default: "",
        trim: true,
      },

      // Rider's service area
      serviceArea: {
        type: String,
        default: "",
        trim: true,
      },

      // Optional rider photo / ID
      identificationNumber: {
        type: String,
        default: "",
        trim: true,
      },

      // Rating
      rating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5,
      },

      completedDeliveries: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ==========================================================
    // ACCOUNT STATUS
    // ==========================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
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
// HASH PASSWORD
// ============================================================

userSchema.pre(
  "save",
  async function (next) {
    if (!this.isModified("password")) {
      return next();
    }

    if (!this.password) {
      return next();
    }

    try {
      this.password =
        await bcrypt.hash(
          this.password,
          10
        );

      next();
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// COMPARE PASSWORD
// ============================================================

userSchema.methods.comparePassword =
  async function (password) {
    if (!this.password) {
      return false;
    }

    return bcrypt.compare(
      password,
      this.password
    );
  };

// ============================================================
// ROLE HELPERS
// ============================================================

userSchema.methods.isAdmin =
  function () {
    return this.role === "admin";
  };

userSchema.methods.isSeller =
  function () {
    return (
      this.role === "seller" ||
      this.role === "admin"
    );
  };

userSchema.methods.isBuyer =
  function () {
    return this.role === "buyer";
  };

userSchema.methods.isRider =
  function () {
    return this.role === "rider";
  };

// ============================================================
// RIDER AVAILABILITY
// ============================================================

userSchema.methods.canAcceptDeliveries =
  function () {
    return (
      this.role === "rider" &&
      this.isActive !== false &&
      this.riderProfile?.isApproved ===
        true &&
      this.riderProfile?.isAvailable ===
        true
    );
  };

// ============================================================
// REMOVE PASSWORD FROM JSON
// ============================================================

userSchema.set(
  "toJSON",
  {
    transform: function (
      doc,
      ret
    ) {
      delete ret.password;
      delete ret.__v;

      return ret;
    },
  }
);

// ============================================================
// FIND USER BY EMAIL
// ============================================================

userSchema.statics.findByEmail =
  function (email) {
    return this.findOne({
      email: String(email)
        .trim()
        .toLowerCase(),
    });
  };

// ============================================================
// MODEL
// ============================================================

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );

module.exports = User;