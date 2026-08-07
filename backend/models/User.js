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


// ===============================
// PASSWORD HASHING
// ===============================
userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) {
    return next();
  }

  if (!this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});


// ===============================
// COMPARE PASSWORD
// ===============================
userSchema.methods.comparePassword = async function(password){

  if (!this.password){
    return false;
  }

  return bcrypt.compare(
    password,
    this.password
  );
};


// ===============================
// ADMIN CHECK
// ===============================
userSchema.methods.isAdmin = function(){

  return this.role === "admin";

};


// ===============================
// SELLER CHECK
// ===============================
userSchema.methods.isSeller = function(){

  return (
    this.role === "seller" ||
    this.role === "admin"
  );

};


// ===============================
// HIDE PASSWORD
// ===============================
userSchema.set("toJSON", {

  transform:function(doc, ret){

    delete ret.password;
    delete ret.__v;

    return ret;

  }

});


// ===============================
// FIND USER BY EMAIL
// ===============================
userSchema.statics.findByEmail = function(email){

  return this.findOne({
    email: email.toLowerCase()
  });

};


// ===============================
// INDEXES
// ===============================
userSchema.index({
  email:1
});


module.exports = mongoose.model(
  "User",
  userSchema
);