const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
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
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
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

    avatar: {
      type: String,
      default: "",
    },

    photoURL: {
      type: String,
      default: "",
    },

    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    providerId: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "seller",   // ✅ changed from "buyer" so users can post products
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// ===============================
// HASH PASSWORD BEFORE SAVE
// ===============================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  if (!this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ===============================
// CHECK PASSWORD
// ===============================
userSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// ===============================
// ROLE HELPERS
// ===============================
userSchema.methods.isAdmin = function() {
  return this.role === "admin";
};

userSchema.methods.isSeller = function() {
  return this.role === "seller" || this.role === "admin";
};

// ===============================
// REMOVE PASSWORD FROM JSON
// ===============================
userSchema.set("toJSON", {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

// ===============================
// FIND BY EMAIL
// ===============================
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

module.exports = mongoose.model("User", userSchema);