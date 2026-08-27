// ============================================================
// backend/controllers/authController.js
// BuyUKUsed / KN Classifieds Authentication Controller
// ============================================================

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ============================================================
// GENERATE JWT
// ============================================================

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// ============================================================
// SAFE USER
// ============================================================

const getSafeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    id: user._id,

    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",

    role: user.role || "user",

    location: user.location || "Ghana",

    avatar: user.avatar || user.photoURL || "",

    photoURL: user.photoURL || user.avatar || "",

    provider: user.provider || "local",

    providerId: user.providerId || "",

    isActive: user.isActive !== false,

    lastLogin: user.lastLogin || null,

    createdAt: user.createdAt || null,

    updatedAt: user.updatedAt || null,

    riderProfile:
      user.role === "rider"
        ? {
            isAvailable:
              user.riderProfile?.isAvailable === true,

            isVerified:
              user.riderProfile?.isVerified === true,

            bikeType:
              user.riderProfile?.bikeType || "",

            bikeNumber:
              user.riderProfile?.bikeNumber || "",

            currentLocation:
              user.riderProfile?.currentLocation || {
                address: "",
                latitude: null,
                longitude: null,
              },

            rating:
              typeof user.riderProfile?.rating === "number"
                ? user.riderProfile.rating
                : 5,

            totalDeliveries:
              user.riderProfile?.totalDeliveries || 0,
          }
        : null,
  };
};

// ============================================================
// REGISTER
// ============================================================

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body || {};

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, and password are required",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE INPUT
    // --------------------------------------------------------

    const trimmedName = String(name).trim();

    const trimmedEmail = String(email)
      .trim()
      .toLowerCase();

    const trimmedPhone =
      phone !== undefined && phone !== null
        ? String(phone).trim()
        : "";

    // --------------------------------------------------------
    // VALIDATE NAME
    // --------------------------------------------------------

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be at least 2 characters long",
      });
    }

    // --------------------------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid email address",
      });
    }

    // --------------------------------------------------------
    // VALIDATE PASSWORD
    // --------------------------------------------------------

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long",
      });
    }

    // --------------------------------------------------------
    // DETERMINE ROLE
    // --------------------------------------------------------

    let selectedRole = "user";

    if (role) {
      const providedRole = String(role)
        .trim()
        .toLowerCase();

      const allowedRoles = [
        "user",
        "buyer",
        "seller",
      ];

      if (allowedRoles.includes(providedRole)) {
        selectedRole = providedRole;
      }
    }

    // --------------------------------------------------------
    // CHECK EXISTING USER
    // --------------------------------------------------------

    const existingUser = await User.findOne({
      email: trimmedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "User with this email already exists",
      });
    }

    // --------------------------------------------------------
    // CREATE USER
    // --------------------------------------------------------

    const user = await User.create({
      name: trimmedName,

      email: trimmedEmail,

      password: String(password),

      phone: trimmedPhone,

      role: selectedRole,

      provider: "local",

      isActive: true,
    });

    // --------------------------------------------------------
    // GENERATE JWT
    // --------------------------------------------------------

    const token = generateToken(user);

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Account created successfully",

      token,

      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ Registration error:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE KEY
    // --------------------------------------------------------

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    // --------------------------------------------------------
    // VALIDATION ERROR
    // --------------------------------------------------------

    if (error.name === "ValidationError") {
      const errors = Object.values(
        error.errors
      ).map((err) => err.message);

      return res.status(400).json({
        success: false,

        message: "Validation error",

        errors,
      });
    }

    // --------------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------------

    return res.status(500).json({
      success: false,

      message:
        "Server error. Please try again later.",
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,

        message:
          "Email and password are required",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE EMAIL
    // --------------------------------------------------------

    const trimmedEmail = String(email)
      .trim()
      .toLowerCase();

    // --------------------------------------------------------
    // FIND USER INCLUDING PASSWORD
    // --------------------------------------------------------

    const user = await User.findOne({
      email: trimmedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password",
      });
    }

    // --------------------------------------------------------
    // CHECK ACCOUNT STATUS
    // --------------------------------------------------------

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,

        message:
          "Your account has been deactivated",
      });
    }

    // --------------------------------------------------------
    // CHECK PASSWORD
    // --------------------------------------------------------

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,

        message:
          "Invalid email or password",
      });
    }

    // --------------------------------------------------------
    // UPDATE LAST LOGIN
    // --------------------------------------------------------

    user.lastLogin = new Date();

    await user.save({
      validateBeforeSave: false,
    });

    // --------------------------------------------------------
    // GENERATE JWT
    // --------------------------------------------------------

    const token = generateToken(user);

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.json({
      success: true,

      message:
        "Login successful",

      token,

      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ Login error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error. Please try again later.",
    });
  }
};

// ============================================================
// GET CURRENT USER
// ============================================================

exports.getMe = async (req, res) => {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION CHECK
    // --------------------------------------------------------

    if (
      !req.user ||
      !req.user._id
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Authentication required",
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user =
      await User.findById(
        req.user._id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }

    // --------------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------------

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,

        message:
          "Your account has been deactivated",
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.json({
      success: true,

      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ GetMe error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error. Please try again later.",
    });
  }
};

// ============================================================
// UPDATE PROFILE
// ============================================================

exports.updateProfile = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION CHECK
    // --------------------------------------------------------

    if (
      !req.user ||
      !req.user._id
    ) {
      return res.status(401).json({
        success: false,

        message:
          "Authentication required",
      });
    }

    // --------------------------------------------------------
    // GET FIELDS
    // --------------------------------------------------------

    const {
      name,
      phone,
      location,
      avatar,
      photoURL,
    } = req.body || {};

    const updateFields = {};

    // --------------------------------------------------------
    // NAME
    // --------------------------------------------------------

    if (
      name !== undefined &&
      name !== null
    ) {
      const trimmedName =
        String(name).trim();

      if (trimmedName.length < 2) {
        return res.status(400).json({
          success: false,

          message:
            "Name must be at least 2 characters long",
        });
      }

      updateFields.name =
        trimmedName;
    }

    // --------------------------------------------------------
    // PHONE
    // --------------------------------------------------------

    if (
      phone !== undefined &&
      phone !== null
    ) {
      updateFields.phone =
        String(phone).trim();
    }

    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    if (
      location !== undefined &&
      location !== null
    ) {
      updateFields.location =
        String(location).trim();
    }

    // --------------------------------------------------------
    // AVATAR
    // --------------------------------------------------------

    if (
      avatar !== undefined &&
      avatar !== null
    ) {
      updateFields.avatar =
        String(avatar).trim();
    }

    // --------------------------------------------------------
    // PHOTO URL
    // --------------------------------------------------------

    if (
      photoURL !== undefined &&
      photoURL !== null
    ) {
      updateFields.photoURL =
        String(photoURL).trim();
    }

    // --------------------------------------------------------
    // NOTHING TO UPDATE
    // --------------------------------------------------------

    if (
      Object.keys(updateFields)
        .length === 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "No fields to update",
      });
    }

    // --------------------------------------------------------
    // UPDATE USER
    // --------------------------------------------------------

    const user =
      await User.findByIdAndUpdate(
        req.user._id,

        {
          $set: updateFields,
        },

        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,

        message:
          "User not found",
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.json({
      success: true,

      message:
        "Profile updated successfully",

      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ UpdateProfile error:",
      error
    );

    // --------------------------------------------------------
    // VALIDATION ERROR
    // --------------------------------------------------------

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (err) => err.message
        );

      return res.status(400).json({
        success: false,

        message:
          "Validation error",

        errors,
      });
    }

    // --------------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------------

    return res.status(500).json({
      success: false,

      message:
        "Server error. Please try again later.",
    });
  }
};

// ============================================================
// LOGOUT
// ============================================================

exports.logout = async (
  req,
  res
) => {
  return res.json({
    success: true,

    message:
      "Logged out successfully",
  });
};

// ============================================================
// EXPORT HELPERS
// ============================================================

module.exports.generateToken =
  generateToken;

module.exports.getSafeUser =
  getSafeUser;