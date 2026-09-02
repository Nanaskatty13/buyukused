// ============================================================
// backend/controllers/adminController.js
// BuyUKUsed - Admin Controller
// ============================================================

const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");

// If your Order model has a different filename, change this.
let Order;

try {
  Order = require("../models/Order");
} catch (error) {
  console.warn(
    "⚠️ Order model could not be loaded. Order statistics will be limited."
  );
}

// ============================================================
// HELPERS
// ============================================================

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return value._id.toString();
  }

  return null;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// DASHBOARD STATS
// ============================================================

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalSellers,
      verifiedUsers,
      unverifiedUsers,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      User.countDocuments({
        role: "seller",
      }),

      User.countDocuments({
        isVerified: true,
      }),

      User.countDocuments({
        $or: [
          {
            isVerified: false,
          },
          {
            isVerified: {
              $exists: false,
            },
          },
        ],
      }),
    ]);

    let totalOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    if (Order) {
      [
        totalOrders,
        pendingOrders,
        completedOrders,
      ] = await Promise.all([
        Order.countDocuments(),

        Order.countDocuments({
          status: {
            $in: [
              "pending",
              "processing",
            ],
          },
        }),

        Order.countDocuments({
          status: {
            $in: [
              "completed",
              "delivered",
            ],
          },
        }),
      ]);
    }

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalProducts,
        totalSellers,

        verifiedUsers,
        unverifiedUsers,

        totalOrders,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error) {
    console.error(
      "❌ getDashboardStats error:",
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
// USERS
// ============================================================

// ------------------------------------------------------------
// GET ALL USERS
// ------------------------------------------------------------

const getUsers = async (req, res) => {
  try {
    const {
      search = "",
      role,
      isVerified,
      limit = 100,
      page = 1,
    } = req.query;

    const query = {};

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (search.trim()) {
      const regex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        {
          name: regex,
        },
        {
          email: regex,
        },
        {
          phone: regex,
        },
      ];
    }

    // --------------------------------------------------------
    // ROLE
    // --------------------------------------------------------

    if (role) {
      query.role = role;
    }

    // --------------------------------------------------------
    // VERIFICATION
    // --------------------------------------------------------

    if (
      isVerified === "true"
    ) {
      query.isVerified = true;
    }

    if (
      isVerified === "false"
    ) {
      query.$or = [
        ...(query.$or || []),
        {
          isVerified: false,
        },
        {
          isVerified: {
            $exists: false,
          },
        },
      ];
    }

    // --------------------------------------------------------
    // PAGINATION
    // --------------------------------------------------------

    const safeLimit = Math.min(
      Math.max(
        parseInt(limit, 10) || 100,
        1
      ),
      200
    );

    const safePage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const skip =
      (safePage - 1) *
      safeLimit;

    const [
      users,
      total,
    ] = await Promise.all([
      User.find(query)
        .select(
          "-password -resetPasswordToken -resetPasswordExpires"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,

      users,

      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(
          total / safeLimit
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ getUsers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load users",
    });
  }
};

// ============================================================
// GET USER BY ID
// ============================================================

const getUserById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    const user = await User.findById(
      id
    )
      .select(
        "-password -resetPasswordToken -resetPasswordExpires"
      )
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
      "❌ getUserById error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load user",
    });
  }
};

// ============================================================
// VERIFY USER
// ============================================================

const verifyUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // --------------------------------------------------------
    // VALIDATE ID
    // --------------------------------------------------------

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "User ID is required",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    // --------------------------------------------------------
    // ALREADY VERIFIED
    // --------------------------------------------------------

    if (user.isVerified === true) {
      return res.status(200).json({
        success: true,
        message:
          "User is already verified",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified:
            user.isVerified,
          verified:
            user.verified,
          verificationStatus:
            user.verificationStatus,
        },
      });
    }

    // --------------------------------------------------------
    // VERIFY USER
    // --------------------------------------------------------

    user.isVerified = true;

    // If your User model contains these fields,
    // keep them synchronized.
    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "verified"
      )
    ) {
      user.verified = true;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "verificationStatus"
      )
    ) {
      user.verificationStatus =
        "verified";
    }

    // --------------------------------------------------------
    // OPTIONAL VERIFICATION DATE
    // --------------------------------------------------------

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "verifiedAt"
      )
    ) {
      user.verifiedAt =
        new Date();
    }

    // --------------------------------------------------------
    // OPTIONAL VERIFIED BY
    // --------------------------------------------------------

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "verifiedBy"
      ) &&
      req.user?._id
    ) {
      user.verifiedBy =
        req.user._id;
    }

    await user.save();

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "User verified successfully",

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,

        isVerified:
          user.isVerified,

        verified:
          user.verified,

        verificationStatus:
          user.verificationStatus,

        verifiedAt:
          user.verifiedAt,

        verifiedBy:
          user.verifiedBy,
      },
    });
  } catch (error) {
    console.error(
      "❌ verifyUser error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify user",
    });
  }
};

// ============================================================
// UNVERIFY USER
// ============================================================

const unverifyUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    user.isVerified = false;

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "verified"
      )
    ) {
      user.verified = false;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        user.toObject(),
        "verificationStatus"
      )
    ) {
      user.verificationStatus =
        "unverified";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "User verification removed",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified:
          user.isVerified,
        verified:
          user.verified,
        verificationStatus:
          user.verificationStatus,
      },
    });
  } catch (error) {
    console.error(
      "❌ unverifyUser error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to unverify user",
    });
  }
};

// ============================================================
// UPDATE USER ROLE
// ============================================================

const updateUserRole = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "buyer",
      "seller",
      "rider",
      "admin",
    ];

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    if (
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user role",
      });
    }

    const user =
      await User.findByIdAndUpdate(
        id,
        {
          role,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select(
          "-password -resetPasswordToken -resetPasswordExpires"
        )
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
      message:
        "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "❌ updateUserRole error:",
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
// UPDATE USER STATUS
// ============================================================

const updateUserStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      isActive,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    if (
      typeof isActive !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be a boolean",
      });
    }

    const user =
      await User.findByIdAndUpdate(
        id,
        {
          isActive,
        },
        {
          new: true,
        }
      )
        .select(
          "-password -resetPasswordToken -resetPasswordExpires"
        )
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
      message:
        isActive
          ? "User activated successfully"
          : "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error(
      "❌ updateUserStatus error:",
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
// DELETE USER
// ============================================================

const deleteUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID",
      });
    }

    // Prevent admin from deleting
    // their own account.
    if (
      req.user?._id &&
      req.user._id.toString() ===
        id.toString()
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
      "❌ deleteUser error:",
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
// SELLER VERIFICATION
// ============================================================

const getUnverifiedSellers =
  async (req, res) => {
    try {
      const sellers =
        await User.find({
          role: "seller",
          $or: [
            {
              isVerified: false,
            },
            {
              isVerified: {
                $exists: false,
              },
            },
          ],
        })
          .select(
            "-password -resetPasswordToken -resetPasswordExpires"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        sellers,
      });
    } catch (error) {
      console.error(
        "❌ getUnverifiedSellers error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load unverified sellers",
      });
    }
  };

// ------------------------------------------------------------
// VERIFY SELLER
// ------------------------------------------------------------

const verifySeller = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID",
      });
    }

    const seller =
      await User.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(400).json({
        success: false,
        message:
          "This user is not a seller",
      });
    }

    seller.isVerified = true;

    if (
      Object.prototype.hasOwnProperty.call(
        seller.toObject(),
        "verified"
      )
    ) {
      seller.verified = true;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        seller.toObject(),
        "verificationStatus"
      )
    ) {
      seller.verificationStatus =
        "verified";
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
        phone: seller.phone,
        role: seller.role,
        isVerified:
          seller.isVerified,
        verified:
          seller.verified,
        verificationStatus:
          seller.verificationStatus,
      },
    });
  } catch (error) {
    console.error(
      "❌ verifySeller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to verify seller",
    });
  }
};

// ------------------------------------------------------------
// UNVERIFY SELLER
// ------------------------------------------------------------

const unverifySeller = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid seller ID",
      });
    }

    const seller =
      await User.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found",
      });
    }

    seller.isVerified = false;

    if (
      Object.prototype.hasOwnProperty.call(
        seller.toObject(),
        "verified"
      )
    ) {
      seller.verified = false;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        seller.toObject(),
        "verificationStatus"
      )
    ) {
      seller.verificationStatus =
        "unverified";
    }

    await seller.save();

    return res.status(200).json({
      success: true,
      message:
        "Seller verification removed",
      seller,
    });
  } catch (error) {
    console.error(
      "❌ unverifySeller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to unverify seller",
    });
  }
};

// ============================================================
// PRODUCTS
// ============================================================

const getProducts = async (
  req,
  res
) => {
  try {
    const {
      limit = 100,
      page = 1,
    } = req.query;

    const safeLimit = Math.min(
      Math.max(
        parseInt(limit, 10) || 100,
        1
      ),
      200
    );

    const safePage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const skip =
      (safePage - 1) *
      safeLimit;

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find({})
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(safeLimit)
        .lean(),

      Product.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      products,

      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(
          total / safeLimit
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ getProducts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load products",
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

const deleteProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await Product.findByIdAndDelete(
        id
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
      "❌ deleteProduct error:",
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
// ORDERS
// ============================================================

const getOrders = async (
  req,
  res
) => {
  try {
    if (!Order) {
      return res.status(200).json({
        success: true,
        orders: [],
        message:
          "Order model is not available",
      });
    }

    const orders =
      await Order.find({})
        .sort({
          createdAt: -1,
        })
        .limit(200)
        .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "❌ getOrders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load orders",
    });
  }
};

// ============================================================
// UPDATE ORDER STATUS
// ============================================================

const updateOrderStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Order) {
        return res.status(500).json({
          success: false,
          message:
            "Order model is not available",
        });
      }

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message:
            "Order status is required",
        });
      }

      const order =
        await Order.findByIdAndUpdate(
          id,
          {
            status,
          },
          {
            new: true,
          }
        ).lean();

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
        "❌ updateOrderStatus error:",
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
// RIDERS
// ============================================================

const getRiders = async (
  req,
  res
) => {
  try {
    const riders =
      await User.find({
        role: "rider",
      })
        .select(
          "-password -resetPasswordToken -resetPasswordExpires"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      riders,
    });
  } catch (error) {
    console.error(
      "❌ getRiders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load riders",
    });
  }
};

// ============================================================
// GET RIDER BY ID
// ============================================================

const getRiderById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rider ID",
      });
    }

    const rider =
      await User.findOne({
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
      "❌ getRiderById error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load rider",
    });
  }
};

// ============================================================
// APPROVE RIDER
// ============================================================

const approveRider = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rider ID",
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
        message:
          "Rider not found",
      });
    }

    rider.isApproved = true;
    rider.isActive = true;

    await rider.save();

    return res.status(200).json({
      success: true,
      message:
        "Rider approved successfully",
      rider,
    });
  } catch (error) {
    console.error(
      "❌ approveRider error:",
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

const rejectRider = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rider ID",
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
        message:
          "Rider not found",
      });
    }

    rider.isApproved = false;
    rider.isActive = false;

    await rider.save();

    return res.status(200).json({
      success: true,
      message:
        "Rider rejected successfully",
      rider,
    });
  } catch (error) {
    console.error(
      "❌ rejectRider error:",
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

const updateRiderStatus =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID",
        });
      }

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be a boolean",
        });
      }

      const rider =
        await User.findOneAndUpdate(
          {
            _id: id,
            role: "rider",
          },
          {
            isActive,
          },
          {
            new: true,
          }
        )
          .select(
            "-password -resetPasswordToken -resetPasswordExpires"
          )
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
        message:
          isActive
            ? "Rider activated successfully"
            : "Rider deactivated successfully",
        rider,
      });
    } catch (error) {
      console.error(
        "❌ updateRiderStatus error:",
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

const updateRiderProfile =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid rider ID",
        });
      }

      const allowedFields = [
        "name",
        "phone",
        "email",
        "riderProfile",
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            field
          )
        ) {
          updates[field] =
            req.body[field];
        }
      }

      const rider =
        await User.findOneAndUpdate(
          {
            _id: id,
            role: "rider",
          },
          updates,
          {
            new: true,
            runValidators: true,
          }
        )
          .select(
            "-password -resetPasswordToken -resetPasswordExpires"
          )
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
        message:
          "Rider profile updated successfully",
        rider,
      });
    } catch (error) {
      console.error(
        "❌ updateRiderProfile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update rider profile",
      });
    }
  };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getDashboardStats,

  // Users
  getUsers,
  getUserById,
  verifyUser,
  unverifyUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,

  // Seller verification
  getUnverifiedSellers,
  verifySeller,
  unverifySeller,

  // Products
  getProducts,
  deleteProduct,

  // Orders
  getOrders,
  updateOrderStatus,

  // Riders
  getRiders,
  getRiderById,
  approveRider,
  rejectRider,
  updateRiderStatus,
  updateRiderProfile,
};