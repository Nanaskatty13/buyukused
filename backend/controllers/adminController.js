// ============================================================
// backend/controllers/adminController.js
// BuyUKUsed - Admin Controller
// ============================================================

const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ------------------------------------------------------------
// Escape user input before putting it into RegExp.
// ------------------------------------------------------------

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ------------------------------------------------------------
// Get authenticated admin ID safely.
// ------------------------------------------------------------

const getCurrentUserId = (req) => {
  return req.user?._id
    ? String(req.user._id)
    : req.user?.id
      ? String(req.user.id)
      : null;
};

// ============================================================
// ADMIN DASHBOARD STATISTICS
// GET /api/admin/dashboard
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
      pendingSellerVerifications,
    ] = await Promise.all([
      // USERS
      User.countDocuments(),

      // PRODUCTS
      Product.countDocuments(),

      // ORDERS
      Order.countDocuments(),

      // RIDERS
      User.countDocuments({
        role: "rider",
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved": true,
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved": false,
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved": true,
        "riderProfile.isAvailable": true,
        isActive: true,
      }),

      // SELLERS
      User.countDocuments({
        role: "seller",
      }),

      User.countDocuments({
        role: "seller",
        $or: [
          {
            isVerified: true,
            verificationStatus: "approved",
          },
          {
            sellerVerified: true,
            sellerVerificationStatus: "approved",
          },
        ],
      }),

      User.countDocuments({
        role: "seller",
        $or: [
          {
            verificationStatus: "pending",
          },
          {
            sellerVerificationStatus: "pending",
          },
        ],
      }),
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        users,
        products,
        orders,

        riders,
        approvedRiders,
        pendingRiders,
        availableRiders,

        sellers,
        verifiedSellers,
        pendingSellerVerifications,
      },
    });
  } catch (error) {
    console.error(
      "❌ Admin dashboard stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard statistics",
    });
  }
};

// ============================================================
// GET ALL USERS
// GET /api/admin/users
// ============================================================

exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role = "",
      status = "",
    } = req.query;

    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const currentLimit = Math.min(
      Math.max(
        parseInt(limit, 10) || 20,
        1
      ),
      100
    );

    const filter = {};

    // ROLE
    const allowedRoles = [
      "buyer",
      "seller",
      "rider",
      "admin",
    ];

    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter",
        });
      }

      filter.role = role;
    }

    // STATUS
    if (status === "active") {
      filter.isActive = true;
    } else if (
      status === "suspended" ||
      status === "banned"
    ) {
      filter.isActive = false;
    } else if (status) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter",
      });
    }

    // SEARCH
    const cleanSearch = String(
      search || ""
    ).trim();

    if (cleanSearch) {
      const searchRegex = new RegExp(
        escapeRegex(cleanSearch),
        "i"
      );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
        {
          phone: searchRegex,
        },
        {
          shopName: searchRegex,
        },
      ];
    }

    const skip =
      (currentPage - 1) *
      currentLimit;

    const [
      users,
      total,
    ] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(currentLimit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const totalPages =
      Math.ceil(
        total / currentLimit
      );

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,

      users,
    });
  } catch (error) {
    console.error(
      "❌ Get users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch users",
    });
  }
};

// ============================================================
// GET USER BY ID
// GET /api/admin/users/:id
// ============================================================

exports.getUserById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user =
      await User.findById(id)
        .select("-password")
        .lean();

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
      message:
        "Failed to fetch user",
    });
  }
};

// ============================================================
// UPDATE USER ROLE
// PATCH /api/admin/users/:id/role
// ============================================================

exports.updateUserRole = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const allowedRoles = [
      "buyer",
      "seller",
      "rider",
      "admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentAdminId =
      getCurrentUserId(req);

    // ----------------------------------------------------------
    // ADMIN CANNOT REMOVE OWN ADMIN ROLE
    // ----------------------------------------------------------

    if (
      currentAdminId &&
      currentAdminId ===
        String(user._id) &&
      role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your own admin role",
      });
    }

    // ----------------------------------------------------------
    // CHANGING AWAY FROM SELLER
    // Remove seller verification.
    // ----------------------------------------------------------

    if (role !== "seller") {
      user.isVerified = false;
      user.verifiedAt = null;
      user.verifiedBy = null;

      user.verificationStatus =
        "not_submitted";

      user.verificationRejectedReason =
        "";

      // Keep seller-controller fields synchronized.
      user.sellerVerified = false;
      user.sellerVerifiedAt = null;
      user.sellerVerifiedBy = null;

      user.sellerVerificationStatus =
        "not_submitted";

      user.sellerVerificationNote =
        "";
    }

    // ----------------------------------------------------------
    // CHANGING AWAY FROM RIDER
    // ----------------------------------------------------------

    if (
      role !== "rider" &&
      user.riderProfile
    ) {
      user.riderProfile.isAvailable =
        false;
    }

    user.role = role;

    await user.save();

    const safeUser =
      await User.findById(
        user._id
      )
        .select("-password")
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "User role updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "❌ Update user role error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user role",
    });
  }
};

// ============================================================
// UPDATE USER ACCOUNT STATUS
// PATCH /api/admin/users/:id/status
// ============================================================

exports.updateUserStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false",
      });
    }

    const currentAdminId =
      getCurrentUserId(req);

    if (
      currentAdminId &&
      currentAdminId === id &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own admin account",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ----------------------------------------------------------
    // NEVER DEACTIVATE LAST ACTIVE ADMIN
    // ----------------------------------------------------------

    if (
      user.role === "admin" &&
      isActive === false
    ) {
      const activeAdmins =
        await User.countDocuments({
          role: "admin",
          isActive: true,
        });

      if (activeAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot deactivate the last active admin account",
        });
      }
    }

    user.isActive = isActive;

    // ----------------------------------------------------------
    // DEACTIVATE RIDER AVAILABILITY
    // ----------------------------------------------------------

    if (
      user.role === "rider" &&
      user.riderProfile &&
      !isActive
    ) {
      user.riderProfile.isAvailable =
        false;
    }

    await user.save();

    const safeUser =
      await User.findById(
        user._id
      )
        .select("-password")
        .lean();

    return res.status(200).json({
      success: true,

      message: isActive
        ? "User activated successfully"
        : "User suspended successfully",

      user: safeUser,
    });
  } catch (error) {
    console.error(
      "❌ Update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update user status",
    });
  }
};

// ============================================================
// VERIFY SELLER
// PATCH /api/admin/users/:id/verify-seller
//
// IMPORTANT:
// Updates BOTH:
//   1. Original User verification fields
//   2. Seller-controller verification fields
//
// This keeps the entire application synchronized.
// ============================================================

exports.verifySeller = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const seller =
      await User.findOne({
        _id: id,
        role: "seller",
      });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const adminId =
      getCurrentUserId(req);

    const now = new Date();

    // ==========================================================
    // PRIMARY VERIFICATION FIELDS
    // Used by User model / Admin dashboard
    // ==========================================================

    seller.isVerified = true;

    seller.verificationStatus =
      "approved";

    seller.verifiedAt = now;

    seller.verifiedBy =
      adminId || null;

    seller.verificationRejectedReason =
      "";

    // ==========================================================
    // SELLER VERIFICATION FIELDS
    // Used by sellerController/public seller profile
    // ==========================================================

    seller.sellerVerified = true;

    seller.sellerVerificationStatus =
      "approved";

    seller.sellerVerifiedAt = now;

    seller.sellerVerifiedBy =
      adminId || null;

    seller.sellerVerificationNote =
      "";

    // ==========================================================
    // SELLER STATUS
    // ==========================================================

    seller.isActive = true;

    if (
      !seller.sellerStatus ||
      seller.sellerStatus ===
        "pending"
    ) {
      seller.sellerStatus =
        "active";
    }

    // ==========================================================
    // SELLER SINCE
    // ==========================================================

    if (!seller.sellerSince) {
      seller.sellerSince = now;
    }

    await seller.save();

    // ==========================================================
    // RETURN UPDATED SELLER
    // ==========================================================

    const safeSeller =
      await User.findById(
        seller._id
      )
        .select("-password")
        .populate(
          "verifiedBy",
          "name email"
        )
        .populate(
          "sellerVerifiedBy",
          "name email"
        )
        .lean();

    return res.status(200).json({
      success: true,

      message:
        "Seller verified successfully",

      seller: safeSeller,

      verification: {
        verified: true,
        isVerified: true,
        sellerVerified: true,

        verificationStatus:
          "approved",

        sellerVerificationStatus:
          "approved",

        verifiedAt: now,

        sellerVerifiedAt: now,

        verifiedBy:
          adminId || null,

        sellerVerifiedBy:
          adminId || null,
      },
    });
  } catch (error) {
    console.error(
      "❌ Verify seller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to verify seller",
    });
  }
};

// ============================================================
// UNVERIFY SELLER
// PATCH /api/admin/users/:id/unverify-seller
// ============================================================

exports.unverifySeller = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const seller =
      await User.findOne({
        _id: id,
        role: "seller",
      });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // ==========================================================
    // PRIMARY VERIFICATION FIELDS
    // ==========================================================

    seller.isVerified = false;

    seller.verificationStatus =
      "rejected";

    seller.verifiedAt = null;

    seller.verifiedBy = null;

    seller.verificationRejectedReason =
      "Seller verification was removed by an administrator.";

    // ==========================================================
    // SELLER VERIFICATION FIELDS
    // ==========================================================

    seller.sellerVerified = false;

    seller.sellerVerificationStatus =
      "rejected";

    seller.sellerVerifiedAt = null;

    seller.sellerVerifiedBy = null;

    seller.sellerVerificationNote =
      "Seller verification was removed by an administrator.";

    await seller.save();

    const safeSeller =
      await User.findById(
        seller._id
      )
        .select("-password")
        .lean();

    return res.status(200).json({
      success: true,

      message:
        "Seller verification removed",

      seller: safeSeller,

      verification: {
        verified: false,
        isVerified: false,
        sellerVerified: false,

        verificationStatus:
          "rejected",

        sellerVerificationStatus:
          "rejected",
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
        "Failed to remove seller verification",
    });
  }
};

// ============================================================
// DELETE USER
// DELETE /api/admin/users/:id
// ============================================================

exports.deleteUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const currentAdminId =
      getCurrentUserId(req);

    if (
      currentAdminId &&
      currentAdminId === id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own admin account",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      const adminCount =
        await User.countDocuments({
          role: "admin",
        });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete the last admin account",
        });
      }
    }

    await User.deleteOne({
      _id: user._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Delete user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete user",
    });
  }
};

// ============================================================
// GET ALL PRODUCTS
// GET /api/admin/products
// ============================================================

exports.getProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find()
        .populate(
          "sellerId",
          "name email phone isVerified verificationStatus sellerVerified sellerVerificationStatus"
        )
        .sort({
          createdAt: -1,
        })
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
      message:
        "Failed to fetch products",
    });
  }
};

// ============================================================
// DELETE PRODUCT
// DELETE /api/admin/products/:id
// ============================================================

exports.deleteProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.deleteOne({
      _id: product._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete product",
    });
  }
};

// ============================================================
// GET ALL ORDERS
// GET /api/admin/orders
// ============================================================

exports.getOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find()
        .sort({
          createdAt: -1,
        })
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
      message:
        "Failed to fetch orders",
    });
  }
};

// ============================================================
// UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id/status
// ============================================================

exports.updateOrderStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      if (
        typeof status !== "string" ||
        !status.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order status is required",
        });
      }

      const cleanStatus =
        status.trim();

      const order =
        await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.status =
        cleanStatus;

      await order.save();

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

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
          error:
            error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update order status",
      });
    }
  };

// ============================================================
// GET ALL RIDERS
// GET /api/admin/riders
// ============================================================

exports.getRiders = async (
  req,
  res
) => {
  try {
    const {
      status,
      availability,
      search,
    } = req.query;

    const filter = {
      role: "rider",
    };

    // APPROVAL STATUS
    if (status === "approved") {
      filter[
        "riderProfile.isApproved"
      ] = true;
    } else if (
      status === "pending"
    ) {
      filter[
        "riderProfile.isApproved"
      ] = false;
    } else if (status) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rider status filter",
      });
    }

    // AVAILABILITY
    if (
      availability ===
      "available"
    ) {
      filter[
        "riderProfile.isAvailable"
      ] = true;

      filter.isActive = true;
    } else if (
      availability ===
      "unavailable"
    ) {
      filter.$or = [
        {
          "riderProfile.isAvailable":
            false,
        },
        {
          isActive: false,
        },
      ];
    } else if (
      availability
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid availability filter",
      });
    }

    // SEARCH
    const cleanSearch = String(
      search || ""
    ).trim();

    if (cleanSearch) {
      const searchRegex = new RegExp(
        escapeRegex(cleanSearch),
        "i"
      );

      const searchConditions = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
        {
          phone: searchRegex,
        },
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

      if (filter.$or) {
        filter.$and = [
          {
            $or: filter.$or,
          },
          {
            $or: searchConditions,
          },
        ];

        delete filter.$or;
      } else {
        filter.$or =
          searchConditions;
      }
    }

    const riders =
      await User.find(filter)
        .select("-password")
        .sort({
          createdAt: -1,
        })
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
      message:
        "Failed to fetch riders",
    });
  }
};

// ============================================================
// GET RIDER BY ID
// GET /api/admin/riders/:id
// ============================================================

exports.getRiderById =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rider ID",
        });
      }

      const rider =
        await User.findOne({
          _id: id,
          role: "rider",
        })
          .select("-password")
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
        message:
          "Failed to fetch rider",
      });
    }
  };

// ============================================================
// APPROVE RIDER
// PATCH /api/admin/riders/:id/approve
// ============================================================

exports.approveRider =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rider ID",
        });
      }

      const rider =
        await User.findOne({
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

      rider.riderProfile.isApproved =
        true;

      rider.riderProfile.isAvailable =
        false;

      rider.isActive = true;

      await rider.save();

      const safeRider =
        await User.findById(
          rider._id
        )
          .select("-password")
          .lean();

      return res.status(200).json({
        success: true,
        message:
          "Rider approved successfully",
        rider: safeRider,
      });
    } catch (error) {
      console.error(
        "❌ Approve rider error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to approve rider",
      });
    }
  };

// ============================================================
// REJECT RIDER
// PATCH /api/admin/riders/:id/reject
// ============================================================

exports.rejectRider =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rider ID",
        });
      }

      const rider =
        await User.findOne({
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

      rider.riderProfile.isApproved =
        false;

      rider.riderProfile.isAvailable =
        false;

      await rider.save();

      const safeRider =
        await User.findById(
          rider._id
        )
          .select("-password")
          .lean();

      return res.status(200).json({
        success: true,
        message:
          "Rider application rejected",
        rider: safeRider,
      });
    } catch (error) {
      console.error(
        "❌ Reject rider error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to reject rider",
      });
    }
  };

// ============================================================
// UPDATE RIDER ACCOUNT STATUS
// PATCH /api/admin/riders/:id/status
// ============================================================

exports.updateRiderStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rider ID",
        });
      }

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false",
        });
      }

      const rider =
        await User.findOne({
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

      if (
        isActive === true &&
        rider.riderProfile
          .isApproved !== true
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rider must be approved before activation",
        });
      }

      rider.isActive =
        isActive;

      if (!isActive) {
        rider.riderProfile.isAvailable =
          false;
      }

      await rider.save();

      const safeRider =
        await User.findById(
          rider._id
        )
          .select("-password")
          .lean();

      return res.status(200).json({
        success: true,

        message: isActive
          ? "Rider activated successfully"
          : "Rider deactivated successfully",

        rider: safeRider,
      });
    } catch (error) {
      console.error(
        "❌ Update rider status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update rider status",
      });
    }
  };

// ============================================================
// UPDATE RIDER PROFILE
// PATCH /api/admin/riders/:id/profile
// ============================================================

exports.updateRiderProfile =
  async (req, res) => {
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

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid rider ID",
        });
      }

      const rider =
        await User.findOne({
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

      // BIKE TYPE
      if (
        bikeType !== undefined
      ) {
        rider.riderProfile.bikeType =
          String(
            bikeType
          ).trim();
      }

      // BIKE NUMBER
      if (
        bikeNumber !== undefined
      ) {
        rider.riderProfile.bikeNumber =
          String(
            bikeNumber
          ).trim();
      }

      // SERVICE AREA
      if (
        serviceArea !== undefined
      ) {
        rider.riderProfile.serviceArea =
          String(
            serviceArea
          ).trim();
      }

      // IDENTIFICATION
      if (
        identificationNumber !==
        undefined
      ) {
        rider.riderProfile.identificationNumber =
          String(
            identificationNumber
          ).trim();
      }

      // RATING
      if (
        rating !== undefined
      ) {
        const numericRating =
          Number(rating);

        if (
          !Number.isFinite(
            numericRating
          ) ||
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

      // COMPLETED DELIVERIES
      if (
        completedDeliveries !==
        undefined
      ) {
        const deliveries =
          Number(
            completedDeliveries
          );

        if (
          !Number.isInteger(
            deliveries
          ) ||
          deliveries < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Completed deliveries must be a non-negative integer",
          });
        }

        rider.riderProfile.completedDeliveries =
          deliveries;
      }

      await rider.save();

      const safeRider =
        await User.findById(
          rider._id
        )
          .select("-password")
          .lean();

      return res.status(200).json({
        success: true,
        message:
          "Rider profile updated successfully",
        rider: safeRider,
      });
    } catch (error) {
      console.error(
        "❌ Update rider profile error:",
        error
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider profile data",
          error:
            error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to update rider profile",
      });
    }
  };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getDashboardStats:
    exports.getDashboardStats,

  getUsers:
    exports.getUsers,

  getUserById:
    exports.getUserById,

  updateUserRole:
    exports.updateUserRole,

  updateUserStatus:
    exports.updateUserStatus,

  verifySeller:
    exports.verifySeller,

  unverifySeller:
    exports.unverifySeller,

  deleteUser:
    exports.deleteUser,

  getProducts:
    exports.getProducts,

  deleteProduct:
    exports.deleteProduct,

  getOrders:
    exports.getOrders,

  updateOrderStatus:
    exports.updateOrderStatus,

  getRiders:
    exports.getRiders,

  getRiderById:
    exports.getRiderById,

  approveRider:
    exports.approveRider,

  rejectRider:
    exports.rejectRider,

  updateRiderStatus:
    exports.updateRiderStatus,

  updateRiderProfile:
    exports.updateRiderProfile,
};