// ============================================================
// backend/models/User.js
// BuyUKUsed - User Model
// Neutral Role: Users can Buy + Sell
// ============================================================

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
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please enter a valid email address",
      },
    },

    password: {
      type: String,

      required: function () {
        return this.provider === "local";
      },

      minlength: [6, "Password must be at least 6 characters"],

      select: true,
    },

    // ==========================================================
    // PASSWORD RESET
    // ==========================================================

    resetPasswordToken: {
      type: String,
      default: undefined,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      default: undefined,
      select: false,
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

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    photo: {
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
    // SELLER INFORMATION
    // ==========================================================

    shopName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    shopDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    businessType: {
      type: String,

      enum: [
        "individual",
        "business",
        "organization",
        "",
      ],

      default: "individual",
    },

    taxId: {
      type: String,
      default: "",
      trim: true,
    },

    sellerStatus: {
      type: String,

      enum: [
        "pending",
        "active",
        "suspended",
        "inactive",
        "",
      ],

      default: "",
      index: true,
    },

    sellerSince: {
      type: Date,
      default: null,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // ==========================================================
    // SELLER VERIFICATION
    // ==========================================================

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verificationStatus: {
      type: String,

      enum: [
        "not_submitted",
        "pending",
        "approved",
        "rejected",
      ],

      default: "not_submitted",

      index: true,
    },

    verificationRejectedReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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
    //
    // "user" = normal neutral account
    // A normal user can BUY and SELL.
    //
    // "buyer" / "seller" = legacy roles
    // "rider" = delivery rider
    // "admin" = administrator
    // ==========================================================

    role: {
      type: String,

      enum: [
        "user",
        "buyer",
        "seller",
        "rider",
        "admin",
      ],

      default: "user",

      index: true,
    },

    // ==========================================================
    // RIDER INFORMATION
    // ==========================================================

    riderProfile: {
      isAvailable: {
        type: Boolean,
        default: false,
      },

      isApproved: {
        type: Boolean,
        default: false,
      },

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

      serviceArea: {
        type: String,
        default: "",
        trim: true,
      },

      identificationNumber: {
        type: String,
        default: "",
        trim: true,
      },

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
      index: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // ==========================================================
    // ACTIVITY TRACKING
    // ==========================================================

    lastActive: {
      type: Date,
      default: null,
    },

    lastSeen: {
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

userSchema.pre("save", async function (next) {
  try {
    // Nothing to hash if password was not changed.
    if (!this.isModified("password")) {
      return next();
    }

    // OAuth users may not have a password.
    if (!this.password) {
      return next();
    }

    this.password = await bcrypt.hash(
      this.password,
      10
    );

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================================
// COMPARE PASSWORD
// ============================================================

userSchema.methods.comparePassword = async function (
  password
) {
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

userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

userSchema.methods.isRider = function () {
  return this.role === "rider";
};

// ============================================================
// CAN BUY
// ============================================================
//
// Neutral users can buy.
// Legacy buyer users can buy.
// Admins can buy.
//
// ============================================================

userSchema.methods.isBuyer = function () {
  return (
    this.role === "user" ||
    this.role === "buyer" ||
    this.role === "admin"
  );
};

// ============================================================
// CAN SELL
// ============================================================
//
// Neutral users can sell.
// Legacy seller users can sell.
// Admins can sell.
//
// ============================================================

userSchema.methods.isSeller = function () {
  return (
    this.role === "user" ||
    this.role === "seller" ||
    this.role === "admin"
  );
};

// ============================================================
// HAS SELLER PROFILE
// ============================================================
//
// This is useful for seller pages.
//
// A user can be considered to have seller information if:
//
// - they are allowed to sell
// - OR they have a shop name
// - OR they have seller information
//
// ============================================================

userSchema.methods.hasSellerProfile = function () {
  if (!this.isSeller()) {
    return false;
  }

  return Boolean(
    this.shopName ||
    this.shopDescription ||
    this.sellerSince ||
    this.sellerStatus ||
    this.isVerified
  );
};

// ============================================================
// VERIFIED SELLER
// ============================================================

userSchema.methods.isVerifiedSeller = function () {
  return (
    this.isSeller() &&
    this.isVerified === true &&
    this.verificationStatus === "approved"
  );
};

// ============================================================
// ACTIVE SELLER
// ============================================================

userSchema.methods.isActiveSeller = function () {
  if (!this.isSeller()) {
    return false;
  }

  if (this.isActive === false) {
    return false;
  }

  if (this.sellerStatus === "suspended") {
    return false;
  }

  return true;
};

// ============================================================
// RIDER AVAILABILITY
// ============================================================

userSchema.methods.canAcceptDeliveries = function () {
  return (
    this.role === "rider" &&
    this.isActive !== false &&
    this.riderProfile?.isApproved === true &&
    this.riderProfile?.isAvailable === true
  );
};

// ============================================================
// SAFE PROFILE IMAGE
// ============================================================
//
// Returns the first available profile image.
// ============================================================

userSchema.methods.getProfileImage = function () {
  return (
    this.profileImage ||
    this.avatar ||
    this.photo ||
    this.photoURL ||
    ""
  );
};

// ============================================================
// REMOVE SENSITIVE INFORMATION FROM JSON
// ============================================================

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;

    return ret;
  },
});

// ============================================================
// REMOVE SENSITIVE INFORMATION FROM OBJECT
// ============================================================

userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;

    return ret;
  },
});

// ============================================================
// FIND USER BY EMAIL
// ============================================================

userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: String(email)
      .trim()
      .toLowerCase(),
  });
};

// ============================================================
// FIND USERS WHO CAN SELL
// ============================================================
//
// IMPORTANT:
//
// Do NOT use:
//
// User.find({ role: "seller" })
//
// because neutral users have role "user".
//
// Use this method whenever you genuinely need users
// based on their account role.
//
// ============================================================

userSchema.statics.findSellers = function (filter = {}) {
  return this.find({
    ...filter,

    role: {
      $in: [
        "user",
        "seller",
        "admin",
      ],
    },
  });
};

// ============================================================
// FIND ONE SELLER
// ============================================================

userSchema.statics.findSellerById = function (
  userId
) {
  return this.findOne({
    _id: userId,

    role: {
      $in: [
        "user",
        "seller",
        "admin",
      ],
    },
  });
};

// ============================================================
// MODEL
// ============================================================

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

module.exports = User;