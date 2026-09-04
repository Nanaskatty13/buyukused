// ============================================================
// backend/controllers/adminController.js
// BuyUKUsed - Admin Controller
// ============================================================

const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

// ============================================================
// HELPER - VALIDATE MONGODB OBJECT ID
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// HELPER - GET SAFE USER
// ============================================================

const getSafeUser = async (userId) => {
  return User.findById(userId)
    .select(
      "-password -resetPasswordToken -resetPasswordExpires"
    )
    .lean();
};

// ============================================================
// ADMIN DASHBOARD STATISTICS
// ============================================================

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      users,
      products,
      orders,
      riders,
      approvedRiders,
      pendingRiders,
      availableRiders,
      sellers,
      verifiedSellers,
      unverifiedSellers,
      buyers,
      admins,
      activeUsers,
      inactiveUsers,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      Order.countDocuments(),

      // --------------------------------------------------------
      // ALL RIDERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "rider",
      }),

      // --------------------------------------------------------
      // APPROVED RIDERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved": true,
      }),

      // --------------------------------------------------------
      // PENDING / UNAPPROVED RIDERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved": false,
      }),

      // --------------------------------------------------------
      // CURRENTLY AVAILABLE RIDERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved": true,
        "riderProfile.isAvailable": true,
        isActive: true,
      }),

      // --------------------------------------------------------
      // SELLERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "seller",
      }),

      // --------------------------------------------------------
      // VERIFIED SELLERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "seller",
        isVerified: true,
      }),

      // --------------------------------------------------------
      // UNVERIFIED SELLERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "seller",
        isVerified: false,
      }),

      // --------------------------------------------------------
      // BUYERS
      // --------------------------------------------------------

      User.countDocuments({
        role: "buyer",
      }),

      // --------------------------------------------------------
      // ADMINS
      // --------------------------------------------------------

      User.countDocuments({
        role: "admin",
      }),

      // --------------------------------------------------------
      // ACTIVE USERS
      // --------------------------------------------------------

      User.countDocuments({
        isActive: true,
      }),

      // --------------------------------------------------------
      // INACTIVE USERS
      // --------------------------------------------------------

      User.countDocuments({
        isActive: false,
      }),
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        users,
        products,
        orders,

        buyers,
        sellers,
        verifiedSellers,
        unverifiedSellers,
        admins,

        riders,
        approvedRiders,
        pendingRiders,
        availableRiders,

        activeUsers,
        inactiveUsers,
      },
    });
  } catch (error) {
    console.error(
      "❌ Admin dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
};

// ============================================================
// GET ALL USERS
// ============================================================

exports.getUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      search,
    } = req.query;

    const filter = {};

    // --------------------------------------------------------
    // ROLE FILTER
    // --------------------------------------------------------

    if (role) {
      const allowedRoles = [
        "buyer",
        "seller",
        "rider",
        "admin",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role filter",
        });
      }

      filter.role = role;
    }

    // --------------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------------

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (
      search &&
      String(search).trim()
    ) {
      const searchRegex = new RegExp(
        String(search).trim(),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { shopName: searchRegex },
      ];
    }

    const users = await User.find(filter)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "❌ Get users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ============================================================
// GET USER BY ID
// ============================================================

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await getSafeUser(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "❌ Get user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// ============================================================
// UPDATE USER ROLE
// ============================================================

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "buyer",
      "seller",
      "rider",
      "admin",
    ];

    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // --------------------------------------------------------
    // VALIDATE ROLE
    // --------------------------------------------------------

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------------
    // PREVENT ADMIN FROM REMOVING OWN ADMIN ROLE
    // --------------------------------------------------------

    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === user._id.toString() &&
      role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your own admin role",
      });
    }

    // --------------------------------------------------------
    // UPDATE ROLE
    // --------------------------------------------------------

    user.role = role;

    // If user stops being a rider,
    // force availability off.

    if (role !== "rider") {
      if (user.riderProfile) {
        user.riderProfile.isAvailable = false;
      }
    }

    // If user becomes a rider,
    // make sure rider profile exists.

    if (role === "rider" && !user.riderProfile) {
      user.riderProfile = {};
    }

    await user.save();

    const safeUser = await getSafeUser(user._id);

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "❌ Update user role error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

// ============================================================
// UPDATE USER STATUS
// ============================================================

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // --------------------------------------------------------
    // VALIDATE STATUS
    // --------------------------------------------------------

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------------
    // PREVENT ADMIN FROM DEACTIVATING OWN ACCOUNT
    // --------------------------------------------------------

    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === user._id.toString() &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own admin account",
      });
    }

    // --------------------------------------------------------
    // UPDATE STATUS
    // --------------------------------------------------------

    user.isActive = isActive;

    // If a rider is deactivated,
    // they must become unavailable.

    if (
      user.role === "rider" &&
      user.riderProfile &&
      isActive === false
    ) {
      user.riderProfile.isAvailable = false;
    }

    await user.save();

    const safeUser = await getSafeUser(user._id);

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "❌ Update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// ============================================================
// VERIFY USER
// ============================================================
//
// PATCH /api/admin/users/:id/verify
// PUT   /api/admin/users/:id/verify
//
// This verifies a NORMAL marketplace user.
//
// IMPORTANT:
// - Does NOT change the user's role.
// - Does NOT make a buyer a seller.
// - Does NOT modify rider information.
// - Does NOT modify seller-specific information.
// - Only changes verification information.
//
// ============================================================

exports.verifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(
      "🔐 Admin verifying user:",
      id
    );

    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------------
    // PREVENT ADMIN FROM VERIFYING THEMSELVES
    // --------------------------------------------------------

    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change your own verification status",
      });
    }

    // --------------------------------------------------------
    // ALREADY VERIFIED
    // --------------------------------------------------------

    if (user.isVerified === true) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    // --------------------------------------------------------
    // VERIFY USER
    // --------------------------------------------------------

    user.isVerified = true;

    // These fields are part of the verification system.
    // They are only assigned when the schema supports them.

    if (User.schema.path("verifiedAt")) {
      user.verifiedAt = new Date();
    }

    if (User.schema.path("verifiedBy")) {
      user.verifiedBy =
        req.user?._id ||
        req.user?.id ||
        null;
    }

    if (User.schema.path("verificationStatus")) {
      user.verificationStatus = "approved";
    }

    if (
      User.schema.path(
        "verificationRejectedReason"
      )
    ) {
      user.verificationRejectedReason = "";
    }

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    await user.save();

    // --------------------------------------------------------
    // RETURN SAFE USER
    // --------------------------------------------------------

    const safeUser = await getSafeUser(user._id);

    console.log(
      "✅ User verified successfully:",
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "❌ Verify user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify user",
    });
  }
};

// ============================================================
// UNVERIFY USER
// ============================================================
//
// PATCH /api/admin/users/:id/unverify
// PUT   /api/admin/users/:id/unverify
//
// Removes verification from a NORMAL marketplace user.
//
// IMPORTANT:
// - Does NOT change the user's role.
// - Does NOT delete the user.
// - Does NOT modify seller role.
// - Does NOT modify rider role.
// - Only removes verification.
//
// ============================================================

exports.unverifyUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(
      "🔓 Admin unverifying user:",
      id
    );

    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------------
    // PREVENT ADMIN FROM CHANGING OWN VERIFICATION
    // --------------------------------------------------------

    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change your own verification status",
      });
    }

    // --------------------------------------------------------
    // ALREADY UNVERIFIED
    // --------------------------------------------------------

    if (user.isVerified !== true) {
      return res.status(400).json({
        success: false,
        message: "User is not verified",
      });
    }

    // --------------------------------------------------------
    // REMOVE VERIFICATION
    // --------------------------------------------------------

    user.isVerified = false;

    if (User.schema.path("verifiedAt")) {
      user.verifiedAt = null;
    }

    if (User.schema.path("verifiedBy")) {
      user.verifiedBy = null;
    }

    // Return user to pending verification.

    if (User.schema.path("verificationStatus")) {
      user.verificationStatus = "pending";
    }

    if (
      User.schema.path(
        "verificationRejectedReason"
      )
    ) {
      user.verificationRejectedReason = "";
    }

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    await user.save();

    // --------------------------------------------------------
    // RETURN SAFE USER
    // --------------------------------------------------------

    const safeUser = await getSafeUser(user._id);

    console.log(
      "✅ User verification removed:",
      user._id.toString()
    );

    return res.status(200).json({
      success: true,
      message:
        "User verification removed successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "❌ Unverify user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove user verification",
    });
  }
};

// ============================================================
// DELETE USER
// ============================================================

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // --------------------------------------------------------
    // PREVENT SELF-DELETION
    // --------------------------------------------------------

    if (
      req.user &&
      req.user._id &&
      req.user._id.toString() === id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own admin account",
      });
    }

    const user =
      await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Delete user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate(
        "sellerId",
        "name email phone isVerified shopName profileImage"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "❌ Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// ============================================================
// GET ALL ORDERS
// ============================================================

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "❌ Get orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

exports.updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    if (
      !status ||
      typeof status !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const order =
      await Order.findByIdAndUpdate(
        id,
        {
          $set: {
            status: status.trim(),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "❌ Update order status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

// ============================================================
// GET ALL RIDERS
// ============================================================

exports.getRiders = async (req, res) => {
  try {
    const {
      status,
      availability,
      search,
    } = req.query;

    const filter = {
      role: "rider",
    };

    // --------------------------------------------------------
    // APPROVAL STATUS
    // --------------------------------------------------------

    if (status === "approved") {
      filter["riderProfile.isApproved"] = true;
    }

    if (status === "pending") {
      filter["riderProfile.isApproved"] = false;
    }

    // --------------------------------------------------------
    // AVAILABILITY
    // --------------------------------------------------------

    if (availability === "available") {
      filter["riderProfile.isAvailable"] = true;
      filter.isActive = true;
      filter["riderProfile.isApproved"] = true;
    }

    if (availability === "unavailable") {
      filter["riderProfile.isAvailable"] = false;
    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (
      search &&
      String(search).trim()
    ) {
      const searchRegex = new RegExp(
        String(search).trim(),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        {
          "riderProfile.bikeNumber":
            searchRegex,
        },
        {
          "riderProfile.bikeType":
            searchRegex,
        },
        {
          "riderProfile.serviceArea":
            searchRegex,
        },
        {
          "riderProfile.identificationNumber":
            searchRegex,
        },
      ];
    }

    const riders = await User.find(filter)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: riders.length,
      riders,
    });
  } catch (error) {
    console.error(
      "❌ Get riders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch riders",
    });
  }
};

// ============================================================
// GET RIDER BY ID
// ============================================================

exports.getRiderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    const rider = await User.findOne({
      _id: id,
      role: "rider",
    })
      .select(
        "-password -resetPasswordToken -resetPasswordExpires"
      )
      .lean();

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    return res.status(200).json({
      success: true,
      rider,
    });
  } catch (error) {
    console.error(
      "❌ Get rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch rider",
    });
  }
};

// ============================================================
// APPROVE RIDER
// ============================================================

exports.approveRider = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    const rider = await User.findOne({
      _id: id,
      role: "rider",
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (!rider.riderProfile) {
      rider.riderProfile = {};
    }

    rider.riderProfile.isApproved = true;

    // Newly approved riders start offline.

    rider.riderProfile.isAvailable = false;

    rider.isActive = true;

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Rider approved successfully",
      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Approve rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to approve rider",
    });
  }
};

// ============================================================
// REJECT RIDER
// ============================================================

exports.rejectRider = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    const rider = await User.findOne({
      _id: id,
      role: "rider",
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (!rider.riderProfile) {
      rider.riderProfile = {};
    }

    rider.riderProfile.isApproved = false;

    rider.riderProfile.isAvailable = false;

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Rider application rejected",
      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Reject rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to reject rider",
    });
  }
};

// ============================================================
// UPDATE RIDER STATUS
// ============================================================

exports.updateRiderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false",
      });
    }

    const rider = await User.findOne({
      _id: id,
      role: "rider",
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    rider.isActive = isActive;

    if (!rider.riderProfile) {
      rider.riderProfile = {};
    }

    // An inactive rider can never remain available.

    if (!isActive) {
      rider.riderProfile.isAvailable = false;
    }

    await rider.save();

    return res.status(200).json({
      success: true,

      message: isActive
        ? "Rider activated successfully"
        : "Rider deactivated successfully",

      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Update rider status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update rider status",
    });
  }
};

// ============================================================
// UPDATE RIDER PROFILE
// ============================================================

exports.updateRiderProfile = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      bikeType,
      bikeNumber,
      serviceArea,
      identificationNumber,
      rating,
      completedDeliveries,
    } = req.body;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    const rider = await User.findOne({
      _id: id,
      role: "rider",
    });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (!rider.riderProfile) {
      rider.riderProfile = {};
    }

    // --------------------------------------------------------
    // BIKE TYPE
    // --------------------------------------------------------

    if (bikeType !== undefined) {
      rider.riderProfile.bikeType =
        String(bikeType).trim();
    }

    // --------------------------------------------------------
    // BIKE NUMBER
    // --------------------------------------------------------

    if (bikeNumber !== undefined) {
      rider.riderProfile.bikeNumber =
        String(bikeNumber).trim();
    }

    // --------------------------------------------------------
    // SERVICE AREA
    // --------------------------------------------------------

    if (serviceArea !== undefined) {
      rider.riderProfile.serviceArea =
        String(serviceArea).trim();
    }

    // --------------------------------------------------------
    // IDENTIFICATION NUMBER
    // --------------------------------------------------------

    if (
      identificationNumber !== undefined
    ) {
      rider.riderProfile.identificationNumber =
        String(identificationNumber).trim();
    }

    // --------------------------------------------------------
    // RATING
    // --------------------------------------------------------

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        Number.isNaN(numericRating) ||
        numericRating < 0 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 0 and 5",
        });
      }

      rider.riderProfile.rating =
        numericRating;
    }

    // --------------------------------------------------------
    // COMPLETED DELIVERIES
    // --------------------------------------------------------

    if (
      completedDeliveries !== undefined
    ) {
      const deliveries =
        Number(completedDeliveries);

      if (
        Number.isNaN(deliveries) ||
        deliveries < 0 ||
        !Number.isInteger(deliveries)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Completed deliveries must be a non-negative whole number",
        });
      }

      rider.riderProfile.completedDeliveries =
        deliveries;
    }

    await rider.save();

    return res.status(200).json({
      success: true,
      message:
        "Rider profile updated successfully",
      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Update rider profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update rider profile",
    });
  }
};

// ============================================================
// GET UNVERIFIED SELLERS
// ============================================================

exports.getUnverifiedSellers = async (
  req,
  res
) => {
  try {
    const sellers = await User.find({
      role: "seller",
      isVerified: false,
    })
      .select(
        "_id name email phone shopName shopDescription profileImage avatar createdAt verificationStatus"
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (error) {
    console.error(
      "❌ Get unverified sellers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch unverified sellers",
    });
  }
};

// ============================================================
// VERIFY SELLER
// ============================================================

exports.verifySeller = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const seller = await User.findOne({
      _id: id,
      role: "seller",
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Seller is already verified",
      });
    }

    // --------------------------------------------------------
    // VERIFY SELLER
    // --------------------------------------------------------

    seller.isVerified = true;

    if (User.schema.path("verifiedAt")) {
      seller.verifiedAt = new Date();
    }

    if (User.schema.path("verifiedBy")) {
      seller.verifiedBy =
        req.user?._id ||
        req.user?.id ||
        null;
    }

    if (User.schema.path("verificationStatus")) {
      seller.verificationStatus = "approved";
    }

    if (
      User.schema.path(
        "verificationRejectedReason"
      )
    ) {
      seller.verificationRejectedReason = "";
    }

    // If seller status was empty, activate it.

    if (!seller.sellerStatus) {
      seller.sellerStatus = "active";
    }

    if (!seller.sellerSince) {
      seller.sellerSince = new Date();
    }

    await seller.save();

    return res.status(200).json({
      success: true,

      message:
        "Seller verified successfully",

      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        isVerified: seller.isVerified,
        verifiedAt: seller.verifiedAt,
        verifiedBy: seller.verifiedBy,
        verificationStatus:
          seller.verificationStatus,
      },
    });
  } catch (error) {
    console.error(
      "❌ Verify seller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify seller",
    });
  }
};

// ============================================================
// UNVERIFY SELLER
// ============================================================

exports.unverifySeller = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const seller = await User.findOne({
      _id: id,
      role: "seller",
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (!seller.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Seller is not verified",
      });
    }

    // --------------------------------------------------------
    // REMOVE VERIFICATION
    // --------------------------------------------------------

    seller.isVerified = false;

    if (User.schema.path("verifiedAt")) {
      seller.verifiedAt = null;
    }

    if (User.schema.path("verifiedBy")) {
      seller.verifiedBy = null;
    }

    // A revoked seller verification should no longer
    // be considered approved.

    if (User.schema.path("verificationStatus")) {
      seller.verificationStatus = "rejected";
    }

    if (
      User.schema.path(
        "verificationRejectedReason"
      )
    ) {
      seller.verificationRejectedReason =
        "Seller verification was revoked by an administrator.";
    }

    await seller.save();

    return res.status(200).json({
      success: true,

      message:
        "Seller verification revoked successfully",

      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        isVerified: seller.isVerified,
        verifiedAt: seller.verifiedAt,
        verifiedBy: seller.verifiedBy,
        verificationStatus:
          seller.verificationStatus,
      },
    });
  } catch (error) {
    console.error(
      "❌ Unverify seller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to revoke seller verification",
    });
  }
};

// ============================================================
// BACKWARD-COMPATIBILITY ALIAS
// ============================================================
//
// Existing admin routes use:
//
// revokeVerification
//
// Keep the alias so those routes continue working.
//
// ============================================================

exports.revokeVerification =
  exports.unverifySeller;

// ============================================================
// EXPORT COMPLETE
// ============================================================