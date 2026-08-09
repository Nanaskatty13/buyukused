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
    // CONTACT
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
    // PROFILE IMAGES
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

    // Cloudinary public ID.
    //
    // This allows us to delete the old Cloudinary image
    // when the user uploads a new profile photo or removes
    // their current profile photo.

    photoPublicId: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================================
    // SOCIAL AUTHENTICATION
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
    // ROLE
    // ==========================================================

    // New users are buyer/seller.
    // Admin should only be assigned by backend/admin logic.

    role: {
      type: String,

      enum: [
        "buyer",
        "seller",
        "admin",
      ],

      default: "buyer",
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
// HASH PASSWORD BEFORE SAVE
// ============================================================

userSchema.pre(
  "save",
  async function (next) {
    try {
      // Nothing to hash if password was not changed.
      if (!this.isModified("password")) {
        return next();
      }

      // Social accounts may not have a password.
      if (!this.password) {
        return next();
      }

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
// CHECK PASSWORD
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
        .toLowerCase()
        .trim(),
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