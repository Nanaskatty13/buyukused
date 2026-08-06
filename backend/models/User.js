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
        validator: function(v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },

    password: {
      type: String,
      default: "",
      minlength: [6, "Password must be at least 6 characters"],
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "Ghana",
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
      enum: ["user", "buyer", "seller", "admin"],
      default: "buyer",
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

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (this.isModified("password") && this.password && this.password.length > 0) {
    if (this.password.length < 6) {
      return next(new Error("Password must be at least 6 characters"));
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(password) {
  if (!this.password || this.password === "") {
    return false;
  }
  return await bcrypt.compare(password, this.password);
};

// Transform JSON response
userSchema.set("toJSON", {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model("User", userSchema);