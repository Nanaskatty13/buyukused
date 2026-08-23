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
// SANITIZE USER
// ------------------------------------------------------------

const sanitizeUser = (user) => {
  if (!user) return null;

  const obj = user.toObject
    ? user.toObject()
    : { ...user };

  delete obj.password;
  delete obj.__v;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;

  return obj;
};

// ------------------------------------------------------------
// PAGINATION
// ------------------------------------------------------------

const getPagination = (
  page = 1,
  limit = 20,
  maxLimit = 100
) => {
  const pageNumber = Math.max(
    1,
    parseInt(page, 10) || 1
  );

  const limitNumber = Math.min(
    Math.max(
      1,
      parseInt(limit, 10) || 20
    ),
    maxLimit
  );

  return {
    page: pageNumber,
    limit: limitNumber,
    skip:
      (pageNumber - 1) *
      limitNumber,
  };
};

// ------------------------------------------------------------
// SORT
// ------------------------------------------------------------

const parseSort = (
  sort = "-createdAt"
) => {
  const sortObject = {};

  String(sort)
    .split(",")
    .forEach((field) => {
      field = field.trim();

      if (!field) return;

      const descending =
        field.startsWith("-");

      const key = descending
        ? field.substring(1)
        : field;

      if (!key) return;

      sortObject[key] =
        descending ? -1 : 1;
    });

  return Object.keys(sortObject).length
    ? sortObject
    : {
        createdAt: -1,
      };
};

// ============================================================
// 1. ADMIN DASHBOARD
// ============================================================

const getDashboardStats = async (
  req,
  res
) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalBuyers,
      totalAdmins,
      totalRiders,
      verifiedSellers,
      pendingSellerVerification,
      activeUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "seller",
      }),

      User.countDocuments({
        role: "buyer",
      }),

      User.countDocuments({
        role: "admin",
      }),

      User.countDocuments({
        role: "rider",
      }),

      User.countDocuments({
        role: "seller",
        sellerVerified: true,
        sellerVerificationStatus:
          "approved",
      }),

      User.countDocuments({
        role: "seller",
        sellerVerificationStatus:
          "pending",
      }),

      User.countDocuments({
        isActive: {
          $ne: false,
        },
      }),

      Product.countDocuments(),

      Product.countDocuments({
        status: "active",
      }),

      Order.countDocuments(),

      Order.countDocuments({
        status: "pending",
      }),

      Order.countDocuments({
        status: "completed",
      }),
    ]);

    // ----------------------------------------------------------
    // TOTAL SALES
    // ----------------------------------------------------------

    const salesResult =
      await Order.aggregate([
        {
          $match: {
            status: {
              $in: [
                "paid",
                "processing",
                "shipped",
                "delivered",
                "completed",
              ],
            },
          },
        },

        {
          $unwind: {
            path: "$items",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $group: {
            _id: null,

            totalSales: {
              $sum: {
                $multiply: [
                  {
                    $convert: {
                      input:
                        "$items.price",
                      to: "double",
                      onError: 0,
                      onNull: 0,
                    },
                  },
                  {
                    $convert: {
                      input:
                        "$items.quantity",
                      to: "double",
                      onError: 0,
                      onNull: 0,
                    },
                  },
                ],
              },
            },
          },
        },
      ]);

    const totalSales =
      Number(
        salesResult?.[0]?.totalSales || 0
      );

    // ----------------------------------------------------------
    // RECENT USERS
    // ----------------------------------------------------------

    const recentUsers =
      await User.find()
        .select(
          "-password -__v -resetPasswordToken -resetPasswordExpires"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    // ----------------------------------------------------------
    // RECENT PRODUCTS
    // ----------------------------------------------------------

    const recentProducts =
      await Product.find()
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    // ----------------------------------------------------------
    // RECENT ORDERS
    // ----------------------------------------------------------

    const recentOrders =
      await Order.find()
        .populate(
          "user",
          "name email phone"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    return res.json({
      success: true,

      stats: {
        totalUsers,
        totalSellers,
        totalBuyers,
        totalAdmins,
        totalRiders,

        verifiedSellers,
        pendingSellerVerification,

        activeUsers,

        totalProducts,
        activeProducts,

        totalOrders,
        pendingOrders,
        completedOrders,

        totalSales,
      },

      recentUsers,
      recentProducts,
      recentOrders,
    });
  } catch (error) {
    console.error(
      "❌ Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load admin dashboard.",
    });
  }
};

// ============================================================
// 2. GET ALL USERS
// ============================================================

const getUsers = async (
  req,
  res
) => {
  try {
    const {
      page,
      limit,
      skip,
    } = getPagination(
      req.query.page,
      req.query.limit,
      100
    );

    const sort = parseSort(
      req.query.sort ||
        "-createdAt"
    );

    const filter = {};

    // ----------------------------------------------------------
    // ROLE FILTER
    // ----------------------------------------------------------

    if (req.query.role) {
      filter.role = req.query.role;
    }

    // ----------------------------------------------------------
    // STATUS FILTER
    // ----------------------------------------------------------

    if (
      req.query.status !==
      undefined
    ) {
      if (
        req.query.status ===
        "active"
      ) {
        filter.isActive = true;
      }

      if (
        req.query.status ===
        "inactive"
      ) {
        filter.isActive = false;
      }
    }

    // ----------------------------------------------------------
    // VERIFICATION FILTER
    // ----------------------------------------------------------

    if (
      req.query.verified ===
      "true"
    ) {
      filter.sellerVerified = true;
    }

    if (
      req.query.verified ===
      "false"
    ) {
      filter.sellerVerified = {
        $ne: true,
      };
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (req.query.search) {
      const search =
        String(
          req.query.search
        ).trim();

      if (search) {
        filter.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: search,
              $options: "i",
            },
          },
          {
            shopName: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }
    }

    const [
      users,
      total,
    ] = await Promise.all([
      User.find(filter)
        .select(
          "-password -__v -resetPasswordToken -resetPasswordExpires"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,

      users,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Get admin users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch users.",
    });
  }
};

// ============================================================
// 3. GET SINGLE USER
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
          "Invalid user ID.",
      });
    }

    const user =
      await User.findById(id)
        .select(
          "-password -__v -resetPasswordToken -resetPasswordExpires"
        )
        .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    // ----------------------------------------------------------
    // USER PRODUCTS
    // ----------------------------------------------------------

    const products =
      await Product.find({
        sellerId: id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean();

    return res.json({
      success: true,

      user,

      products,
    });
  } catch (error) {
    console.error(
      "❌ Get admin user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch user.",
    });
  }
};

// ============================================================
// 4. UPDATE USER ROLE
// ============================================================

const updateUserRole = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID.",
      });
    }

    const allowedRoles = [
      "buyer",
      "seller",
      "rider",
      "admin",
    ];

    if (
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role.",
      });
    }

    // ----------------------------------------------------------
    // PREVENT ADMIN FROM CHANGING THEIR OWN ROLE
    // ----------------------------------------------------------

    const currentAdminId =
      req.user?._id ||
      req.user?.id;

    if (
      currentAdminId &&
      String(currentAdminId) ===
        String(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change your own admin role.",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    user.role = role;

    // ----------------------------------------------------------
    // SELLER INITIALIZATION
    // ----------------------------------------------------------

    if (role === "seller") {
      if (!user.sellerStatus) {
        user.sellerStatus =
          "active";
      }

      if (
        !user.sellerVerificationStatus
      ) {
        user.sellerVerificationStatus =
          "not_submitted";
      }

      if (
        user.sellerVerified !== true
      ) {
        user.sellerVerified =
          false;
      }
    }

    // ----------------------------------------------------------
    // NON-SELLER RESET
    // ----------------------------------------------------------

    if (role !== "seller") {
      user.sellerVerified =
        false;

      user.sellerVerificationStatus =
        "not_submitted";

      user.sellerVerifiedAt = null;
      user.sellerVerifiedBy = null;
    }

    await user.save();

    return res.json({
      success: true,

      message:
        "User role updated successfully.",

      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ Update user role error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update user role.",
    });
  }
};

// ============================================================
// 5. UPDATE USER ACCOUNT STATUS
// ============================================================

const updateUserStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      isActive,
      status,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid user ID.",
      });
    }

    const currentAdminId =
      req.user?._id ||
      req.user?.id;

    if (
      currentAdminId &&
      String(currentAdminId) ===
        String(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own account.",
      });
    }

    let activeValue;

    if (
      typeof isActive ===
      "boolean"
    ) {
      activeValue = isActive;
    } else if (
      status !== undefined
    ) {
      activeValue =
        status === "active" ||
        status === "enabled";
    } else {
      return res.status(400).json({
        success: false,
        message:
          "isActive or status is required.",
      });
    }

    const user =
      await User.findByIdAndUpdate(
        id,
        {
          $set: {
            isActive:
              activeValue,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .select(
          "-password -__v -resetPasswordToken -resetPasswordExpires"
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    return res.json({
      success: true,

      message: activeValue
        ? "User activated successfully."
        : "User deactivated successfully.",

      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error(
      "❌ Update user status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update user status.",
    });
  }
};

// ============================================================
// 6. VERIFY SELLER
// ============================================================

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
          "Invalid seller ID.",
      });
    }

    const adminId =
      req.user?._id ||
      req.user?.id;

    const seller =
      await User.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found.",
      });
    }

    // ----------------------------------------------------------
    // MUST BE SELLER
    // ----------------------------------------------------------

    if (
      seller.role !== "seller"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only seller accounts can be verified.",
      });
    }

    // ----------------------------------------------------------
    // VERIFY
    // ----------------------------------------------------------

    seller.sellerVerified =
      true;

    seller.sellerVerificationStatus =
      "approved";

    seller.sellerVerifiedAt =
      new Date();

    seller.sellerVerifiedBy =
      adminId || null;

    seller.sellerVerificationNote =
      req.body?.note
        ? String(
            req.body.note
          ).trim()
        : seller.sellerVerificationNote ||
          "";

    // Ensure seller remains active.
    if (!seller.sellerStatus) {
      seller.sellerStatus =
        "active";
    }

    await seller.save();

    const cleanSeller =
      sanitizeUser(seller);

    console.log(
      "✅ Seller verified:",
      {
        sellerId:
          seller._id.toString(),

        name:
          seller.name,

        sellerVerified:
          seller.sellerVerified,

        sellerVerificationStatus:
          seller.sellerVerificationStatus,

        sellerVerifiedAt:
          seller.sellerVerifiedAt,

        sellerVerifiedBy:
          seller.sellerVerifiedBy,
      }
    );

    return res.json({
      success: true,

      message:
        "Seller verified successfully.",

      seller: cleanSeller,

      // Convenient frontend fields.
      verified: true,

      sellerVerified: true,

      sellerVerificationStatus:
        "approved",
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
        "Failed to verify seller.",
    });
  }
};

// ============================================================
// 7. UNVERIFY SELLER
// ============================================================

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
          "Invalid seller ID.",
      });
    }

    const seller =
      await User.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message:
          "Seller not found.",
      });
    }

    if (
      seller.role !== "seller"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only seller accounts can have seller verification removed.",
      });
    }

    // ----------------------------------------------------------
    // REMOVE VERIFICATION
    // ----------------------------------------------------------

    seller.sellerVerified =
      false;

    seller.sellerVerificationStatus =
      "not_submitted";

    seller.sellerVerifiedAt =
      null;

    seller.sellerVerifiedBy =
      null;

    seller.sellerVerificationNote =
      req.body?.note
        ? String(
            req.body.note
          ).trim()
        : "";

    await seller.save();

    console.log(
      "⚪ Seller verification removed:",
      {
        sellerId:
          seller._id.toString(),

        name:
          seller.name,

        sellerVerified:
          seller.sellerVerified,

        sellerVerificationStatus:
          seller.sellerVerificationStatus,
      }
    );

    return res.json({
      success: true,

      message:
        "Seller verification removed successfully.",

      seller:
        sanitizeUser(seller),

      verified: false,

      sellerVerified: false,

      sellerVerificationStatus:
        "not_submitted",
    });
  } catch (error) {
    console.error(
      "❌ Unverify seller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to remove seller verification.",
    });
  }
};

// ============================================================
// 8. DELETE USER
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
          "Invalid user ID.",
      });
    }

    const adminId =
      req.user?._id ||
      req.user?.id;

    if (
      adminId &&
      String(adminId) ===
        String(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own admin account.",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    // ----------------------------------------------------------
    // DELETE USER
    // ----------------------------------------------------------

    await User.findByIdAndDelete(id);

    // ----------------------------------------------------------
    // DELETE USER PRODUCTS
    // ----------------------------------------------------------

    await Product.deleteMany({
      sellerId: id,
    });

    return res.json({
      success: true,

      message:
        "User deleted successfully.",

      deletedUserId: id,
    });
  } catch (error) {
    console.error(
      "❌ Delete user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete user.",
    });
  }
};

// ============================================================
// 9. GET ALL PRODUCTS
// ============================================================

const getProducts = async (
  req,
  res
) => {
  try {
    const {
      page,
      limit,
      skip,
    } = getPagination(
      req.query.page,
      req.query.limit,
      100
    );

    const sort = parseSort(
      req.query.sort ||
        "-createdAt"
    );

    const filter = {};

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.category) {
      filter.category =
        req.query.category;
    }

    if (req.query.sellerId) {
      if (
        !isValidObjectId(
          req.query.sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      filter.sellerId =
        req.query.sellerId;
    }

    if (req.query.search) {
      const search =
        String(
          req.query.search
        ).trim();

      if (search) {
        filter.$or = [
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          {
            description: {
              $regex: search,
              $options: "i",
            },
          },
          {
            sellerName: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }
    }

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .populate(
          "sellerId",
          "name email phone shopName sellerVerified sellerVerificationStatus"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,

      products,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Admin products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch products.",
    });
  }
};

// ============================================================
// 10. DELETE PRODUCT
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
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    await Product.findByIdAndDelete(
      id
    );

    return res.json({
      success: true,

      message:
        "Product deleted successfully.",

      deletedProductId: id,
    });
  } catch (error) {
    console.error(
      "❌ Admin delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete product.",
    });
  }
};

// ============================================================
// 11. GET ALL ORDERS
// ============================================================

const getOrders = async (
  req,
  res
) => {
  try {
    const {
      page,
      limit,
      skip,
    } = getPagination(
      req.query.page,
      req.query.limit,
      100
    );

    const sort = parseSort(
      req.query.sort ||
        "-createdAt"
    );

    const filter = {};

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (req.query.userId) {
      if (
        !isValidObjectId(
          req.query.userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID.",
        });
      }

      filter.user =
        req.query.userId;
    }

    const [
      orders,
      total,
    ] = await Promise.all([
      Order.find(filter)
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "items.product",
          "title price images"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.json({
      success: true,

      orders,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Admin orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch orders.",
    });
  }
};

// ============================================================
// 12. UPDATE ORDER STATUS
// ============================================================

const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      status,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID.",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message:
          "Order status is required.",
      });
    }

    const allowedStatuses = [
      "pending",
      "paid",
      "processing",
      "confirmed",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
      "canceled",
      "failed",
      "refunded",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status.",
      });
    }

    const order =
      await Order.findByIdAndUpdate(
        id,
        {
          $set: {
            status,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "user",
          "name email phone"
        )
        .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found.",
      });
    }

    return res.json({
      success: true,

      message:
        "Order status updated successfully.",

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
        error.message ||
        "Failed to update order status.",
    });
  }
};

// ============================================================
// 13. GET RIDERS
// ============================================================
//
// This implementation uses the User collection with
// role === "rider".
// It does NOT require a separate Rider model.
// ============================================================

const getRiders = async (
  req,
  res
) => {
  try {
    const {
      page,
      limit,
      skip,
    } = getPagination(
      req.query.page,
      req.query.limit,
      100
    );

    const sort = parseSort(
      req.query.sort ||
        "-createdAt"
    );

    const filter = {
      role: "rider",
    };

    if (req.query.status) {
      filter.riderStatus =
        req.query.status;
    }

    if (
      req.query.approved ===
      "true"
    ) {
      filter.riderApproved =
        true;
    }

    if (
      req.query.approved ===
      "false"
    ) {
      filter.riderApproved = {
        $ne: true,
      };
    }

    if (req.query.search) {
      const search =
        String(
          req.query.search
        ).trim();

      if (search) {
        filter.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }
    }

    const [
      riders,
      total,
    ] = await Promise.all([
      User.find(filter)
        .select(
          "-password -__v -resetPasswordToken -resetPasswordExpires"
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,

      riders,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Get riders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch riders.",
    });
  }
};

// ============================================================
// 14. GET RIDER BY ID
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
          "Invalid rider ID.",
      });
    }

    const rider =
      await User.findOne({
        _id: id,
        role: "rider",
      })
        .select(
          "-password -__v -resetPasswordToken -resetPasswordExpires"
        )
        .lean();

    if (!rider) {
      return res.status(404).json({
        success: false,
        message:
          "Rider not found.",
      });
    }

    return res.json({
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
        error.message ||
        "Failed to fetch rider.",
    });
  }
};

// ============================================================
// 15. APPROVE RIDER
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
          "Invalid rider ID.",
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
          "Rider not found.",
      });
    }

    rider.riderApproved =
      true;

    rider.riderStatus =
      "approved";

    rider.riderApprovedAt =
      new Date();

    rider.riderApprovedBy =
      req.user?._id ||
      req.user?.id ||
      null;

    await rider.save();

    return res.json({
      success: true,

      message:
        "Rider approved successfully.",

      rider:
        sanitizeUser(rider),
    });
  } catch (error) {
    console.error(
      "❌ Approve rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to approve rider.",
    });
  }
};

// ============================================================
// 16. REJECT RIDER
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
          "Invalid rider ID.",
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
          "Rider not found.",
      });
    }

    rider.riderApproved =
      false;

    rider.riderStatus =
      "rejected";

    rider.riderApprovedAt =
      null;

    rider.riderApprovedBy =
      null;

    if (req.body?.reason) {
      rider.riderRejectionReason =
        String(
          req.body.reason
        ).trim();
    }

    await rider.save();

    return res.json({
      success: true,

      message:
        "Rider rejected successfully.",

      rider:
        sanitizeUser(rider),
    });
  } catch (error) {
    console.error(
      "❌ Reject rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to reject rider.",
    });
  }
};

// ============================================================
// 17. UPDATE RIDER STATUS
// ============================================================

const updateRiderStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      status,
      riderStatus,
      isActive,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rider ID.",
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
          "Rider not found.",
      });
    }

    if (
      status !== undefined
    ) {
      rider.riderStatus =
        String(status);
    }

    if (
      riderStatus !== undefined
    ) {
      rider.riderStatus =
        String(riderStatus);
    }

    if (
      typeof isActive ===
      "boolean"
    ) {
      rider.isActive =
        isActive;
    }

    await rider.save();

    return res.json({
      success: true,

      message:
        "Rider status updated successfully.",

      rider:
        sanitizeUser(rider),
    });
  } catch (error) {
    console.error(
      "❌ Update rider status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update rider status.",
    });
  }
};

// ============================================================
// 18. UPDATE RIDER PROFILE
// ============================================================

const updateRiderProfile = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid rider ID.",
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
          "Rider not found.",
      });
    }

    const allowedFields = [
      "name",
      "phone",
      "email",
      "location",
      "avatar",
      "profileImage",
      "photo",
      "photoURL",

      "vehicleType",
      "vehicleModel",
      "vehicleNumber",

      "riderStatus",
      "isActive",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          rider[field] =
            req.body[field];
        }
      }
    );

    await rider.save();

    return res.json({
      success: true,

      message:
        "Rider profile updated successfully.",

      rider:
        sanitizeUser(rider),
    });
  } catch (error) {
    console.error(
      "❌ Update rider profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update rider profile.",
    });
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  // Dashboard
  getDashboardStats,

  // Users
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,

  // Seller verification
  verifySeller,
  unverifySeller,

  // Users
  deleteUser,

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