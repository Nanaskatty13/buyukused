// ============================================================
// backend/controllers/adminController.js
// BuyUKUsed - Admin Controller
// ============================================================

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

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
      pendingSellerVerifications,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      Order.countDocuments(),

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

      User.countDocuments({
        role: "seller",
      }),

      User.countDocuments({
        role: "seller",
        isVerified: true,
        verificationStatus: "approved",
      }),

      User.countDocuments({
        role: "seller",
        verificationStatus: "pending",
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
      Number(page) || 1,
      1
    );

    const currentLimit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const filter = {};

    // ----------------------------------------------------------
    // Role filter
    // ----------------------------------------------------------

    if (role) {
      filter.role = role;
    }

    // ----------------------------------------------------------
    // Status filter
    // ----------------------------------------------------------

    if (status === "active") {
      filter.isActive = true;
    }

    if (
      status === "suspended" ||
      status === "banned"
    ) {
      filter.isActive = false;
    }

    // ----------------------------------------------------------
    // Search
    // ----------------------------------------------------------

    if (
      search &&
      String(search).trim()
    ) {
      const searchRegex = new RegExp(
        String(search).trim(),
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

    const [users, total] =
      await Promise.all([
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

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: currentPage,
      limit: currentLimit,
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

exports.getUserById = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.params.id
      )
        .select("-password")
        .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
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
    const { role } = req.body;

    const allowedRoles = [
      "buyer",
      "seller",
      "rider",
      "admin",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user role",
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // Prevent admin from removing own admin role.
    if (
      req.user &&
      req.user._id.toString() ===
        user._id.toString() &&
      role !== "admin"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your own admin role",
      });
    }

    // ----------------------------------------------------------
    // If changing away from seller, remove verification.
    // ----------------------------------------------------------

    if (role !== "seller") {
      user.isVerified = false;
      user.verifiedAt = null;
      user.verifiedBy = null;
      user.verificationStatus =
        "not_submitted";
      user.verificationRejectedReason =
        "";
    }

    user.role = role;

    // If no longer a rider,
    // force rider offline.
    if (
      role !== "rider" &&
      user.riderProfile
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
    const { isActive } = req.body;

    if (
      typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false",
      });
    }

    if (
      req.user &&
      req.user._id.toString() ===
        req.params.id &&
      isActive === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own admin account",
      });
    }

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    user.isActive = isActive;

    if (
      user.role === "rider" &&
      user.riderProfile
    ) {
      if (!isActive) {
        user.riderProfile.isAvailable =
          false;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "User activated successfully"
        : "User suspended successfully",
      user: user.toJSON(),
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
// ============================================================

exports.verifySeller = async (
  req,
  res
) => {
  try {
    const seller =
      await User.findOne({
        _id: req.params.id,
        role: "seller",
      });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found",
      });
    }

    // ----------------------------------------------------------
    // Already verified
    // ----------------------------------------------------------

    if (
      seller.isVerified === true &&
      seller.verificationStatus ===
        "approved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Seller is already verified",
      });
    }

    // ----------------------------------------------------------
    // Verify seller
    // ----------------------------------------------------------

    seller.isVerified = true;

    seller.verificationStatus =
      "approved";

    seller.verifiedAt = new Date();

    seller.verifiedBy =
      req.user?._id || null;

    seller.verificationRejectedReason =
      "";

    // Seller is active after verification.
    seller.isActive = true;

    // Set seller status if not already set.
    if (
      !seller.sellerStatus ||
      seller.sellerStatus ===
        "pending"
    ) {
      seller.sellerStatus =
        "active";
    }

    // Set sellerSince if empty.
    if (!seller.sellerSince) {
      seller.sellerSince =
        new Date();
    }

    await seller.save();

    const safeSeller =
      await User.findById(
        seller._id
      )
        .select("-password")
        .populate(
          "verifiedBy",
          "name email"
        )
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Seller verified successfully",
      seller: safeSeller,
    });
  } catch (error) {
    console.error(
      "❌ Verify seller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
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
    const seller =
      await User.findOne({
        _id: req.params.id,
        role: "seller",
      });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found",
      });
    }

    seller.isVerified = false;

    seller.verificationStatus =
      "rejected";

    seller.verifiedAt = null;

    seller.verifiedBy = null;

    seller.verificationRejectedReason =
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
    if (
      req.user &&
      req.user._id.toString() ===
        req.params.id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own admin account",
      });
    }

    const user =
      await User.findByIdAndDelete(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

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
          "name email phone isVerified verificationStatus"
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
// ============================================================

exports.deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

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
// ============================================================

exports.updateOrderStatus =
  async (req, res) => {
    try {
      const { status } =
        req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message:
            "Order status is required",
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
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
        message:
          "Failed to update order status",
      });
    }
  };

// ============================================================
// GET ALL RIDERS
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

    if (status === "approved") {
      filter[
        "riderProfile.isApproved"
      ] = true;
    }

    if (status === "pending") {
      filter[
        "riderProfile.isApproved"
      ] = false;
    }

    if (
      availability ===
      "available"
    ) {
      filter[
        "riderProfile.isAvailable"
      ] = true;

      filter.isActive = true;
    }

    if (
      availability ===
      "unavailable"
    ) {
      filter[
        "riderProfile.isAvailable"
      ] = false;
    }

    if (
      search &&
      String(search).trim()
    ) {
      const searchRegex =
        new RegExp(
          String(search).trim(),
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
// ============================================================

exports.getRiderById =
  async (req, res) => {
    try {
      const rider =
        await User.findOne({
          _id: req.params.id,
          role: "rider",
        })
          .select("-password")
          .lean();

      if (!rider) {
        return res.status(404).json({
          success: false,
          message:
            "Rider not found",
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
// ============================================================

exports.approveRider =
  async (req, res) => {
    try {
      const rider =
        await User.findOne({
          _id: req.params.id,
          role: "rider",
        });

      if (!rider) {
        return res.status(404).json({
          success: false,
          message:
            "Rider not found",
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

      return res.status(200).json({
        success: true,
        message:
          "Rider approved successfully",
        rider:
          rider.toJSON(),
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
// ============================================================

exports.rejectRider =
  async (req, res) => {
    try {
      const rider =
        await User.findOne({
          _id: req.params.id,
          role: "rider",
        });

      if (!rider) {
        return res.status(404).json({
          success: false,
          message:
            "Rider not found",
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

      return res.status(200).json({
        success: true,
        message:
          "Rider application rejected",
        rider:
          rider.toJSON(),
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
// UPDATE RIDER STATUS
// ============================================================

exports.updateRiderStatus =
  async (req, res) => {
    try {
      const { isActive } =
        req.body;

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
          _id: req.params.id,
          role: "rider",
        });

      if (!rider) {
        return res.status(404).json({
          success: false,
          message:
            "Rider not found",
        });
      }

      rider.isActive =
        isActive;

      if (!rider.riderProfile) {
        rider.riderProfile = {};
      }

      if (!isActive) {
        rider.riderProfile.isAvailable =
          false;
      }

      await rider.save();

      return res.status(200).json({
        success: true,
        message: isActive
          ? "Rider activated successfully"
          : "Rider deactivated successfully",
        rider:
          rider.toJSON(),
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
// ============================================================

exports.updateRiderProfile =
  async (req, res) => {
    try {
      const {
        bikeType,
        bikeNumber,
        serviceArea,
        identificationNumber,
        rating,
        completedDeliveries,
      } = req.body;

      const rider =
        await User.findOne({
          _id: req.params.id,
          role: "rider",
        });

      if (!rider) {
        return res.status(404).json({
          success: false,
          message:
            "Rider not found",
        });
      }

      if (!rider.riderProfile) {
        rider.riderProfile = {};
      }

      if (
        bikeType !== undefined
      ) {
        rider.riderProfile.bikeType =
          String(
            bikeType
          ).trim();
      }

      if (
        bikeNumber !== undefined
      ) {
        rider.riderProfile.bikeNumber =
          String(
            bikeNumber
          ).trim();
      }

      if (
        serviceArea !== undefined
      ) {
        rider.riderProfile.serviceArea =
          String(
            serviceArea
          ).trim();
      }

      if (
        identificationNumber !==
        undefined
      ) {
        rider.riderProfile.identificationNumber =
          String(
            identificationNumber
          ).trim();
      }

      if (
        rating !== undefined
      ) {
        const numericRating =
          Number(rating);

        if (
          Number.isNaN(
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

      if (
        completedDeliveries !==
        undefined
      ) {
        const deliveries =
          Number(
            completedDeliveries
          );

        if (
          Number.isNaN(
            deliveries
          ) ||
          deliveries < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Completed deliveries cannot be negative",
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
        rider:
          rider.toJSON(),
      });
    } catch (error) {
      console.error(
        "❌ Update rider profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update rider profile",
      });
    }
  };