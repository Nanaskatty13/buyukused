// ============================================================
// backend/controllers/sellerController.js
// BuyUKUsed Seller Controller
// ============================================================

const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

// ============================================================
// HELPERS
// ============================================================

const sanitizeSeller = (user) => {
  const obj = user?.toObject
    ? user.toObject()
    : { ...user };

  delete obj.password;
  delete obj.__v;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;

  return obj;
};

// ============================================================
// GET USER ID
// ============================================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

// ============================================================
// VALIDATE USER ID
// ============================================================

const getValidUserId = (req) => {
  const userId = getUserId(req);

  if (!userId) {
    return null;
  }

  return userId.toString();
};

// ============================================================
// PAGINATION
// ============================================================

const getPagination = (
  page = 1,
  limit = 20,
  maxLimit = 50
) => {
  const pageNum = Math.max(
    1,
    parseInt(page, 10) || 1
  );

  const limitNum = Math.min(
    Math.max(
      1,
      parseInt(limit, 10) || 20
    ),
    maxLimit
  );

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
};

// ============================================================
// SORT
// ============================================================

const parseSort = (sortStr) => {
  if (!sortStr) {
    return {
      createdAt: -1,
    };
  }

  const fields = String(sortStr)
    .split(",");

  const sortObj = {};

  fields.forEach((field) => {
    const trimmed = field.trim();

    if (!trimmed) {
      return;
    }

    const isDesc =
      trimmed.startsWith("-");

    const key = isDesc
      ? trimmed.slice(1)
      : trimmed;

    if (key) {
      sortObj[key] = isDesc ? -1 : 1;
    }
  });

  return Object.keys(sortObj).length
    ? sortObj
    : { createdAt: -1 };
};

// ============================================================
// DATE FILTER
// ============================================================

const buildDateFilter = (
  period = "all"
) => {
  if (period === "all") {
    return {};
  }

  const now = new Date();
  let startDate = null;

  switch (period) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "week":
      startDate = new Date(now);
      startDate.setDate(
        startDate.getDate() - 7
      );
      break;

    case "month":
      startDate = new Date(now);
      startDate.setMonth(
        startDate.getMonth() - 1
      );
      break;

    case "year":
      startDate = new Date(now);
      startDate.setFullYear(
        startDate.getFullYear() - 1
      );
      break;

    default:
      return {};
  }

  return {
    createdAt: {
      $gte: startDate,
    },
  };
};

// ============================================================
// 1. REGISTER SELLER
// ============================================================

exports.registerSeller = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      shopName,
      description,
      phone,
      location,
      termsAccepted,
      businessType,
      taxId,
    } = req.body;

    if (termsAccepted !== true) {
      return res.status(400).json({
        success: false,
        message:
          "You must accept the terms and conditions.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      user.role === "seller" ||
      user.role === "admin"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You are already a seller or admin.",
      });
    }

    user.shopName =
      typeof shopName === "string" &&
      shopName.trim()
        ? shopName.trim()
        : user.shopName || user.name;

    user.shopDescription =
      typeof description === "string"
        ? description.trim()
        : user.shopDescription || "";

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (location !== undefined) {
      user.location =
        String(location).trim();
    }

    user.businessType =
      businessType ||
      user.businessType ||
      "individual";

    if (taxId !== undefined) {
      user.taxId = String(taxId).trim();
    }

    user.role = "seller";

    user.sellerStatus = "active";

    user.sellerSince = new Date();

    // ========================================================
    // VERIFICATION
    // ========================================================

    user.isVerified = false;

    user.verificationStatus =
      "not_submitted";

    user.verifiedAt = null;

    user.verifiedBy = null;

    user.verificationRejectedReason = "";

    // ========================================================
    // ACTIVITY
    // ========================================================

    user.lastActive = new Date();

    user.lastSeen = new Date();

    await user.save();

    return res.status(201).json({
      success: true,
      message:
        "Seller account created successfully.",
      seller: sanitizeSeller(user),
    });
  } catch (error) {
    console.error(
      "Register seller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to register as seller.",
    });
  }
};

// ============================================================
// 2. PRIVATE SELLER PROFILE
// ============================================================

exports.getSellerProfile =
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const seller =
        await User.findById(userId)
          .select(
            "-password -resetPasswordToken -resetPasswordExpires"
          )
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found.",
        });
      }

      if (
        !["seller", "admin"].includes(
          seller.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not a seller.",
        });
      }

      return res.json({
        success: true,
        seller,
      });
    } catch (error) {
      console.error(
        "Get seller profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller profile.",
      });
    }
  };

// ============================================================
// 3. UPDATE SELLER PROFILE
// ============================================================

exports.updateSellerProfile =
  async (req, res) => {
    try {
      const {
        shopName,
        shopDescription,
        description,
        phone,
        location,
        avatar,
        profileImage,
        photo,
        photoURL,
        businessType,
        taxId,
      } = req.body;

      const updates = {};

      if (shopName !== undefined) {
        updates.shopName =
          String(shopName).trim();
      }

      if (
        shopDescription !== undefined
      ) {
        updates.shopDescription =
          String(
            shopDescription
          ).trim();
      }

      if (
        description !== undefined &&
        shopDescription === undefined
      ) {
        updates.shopDescription =
          String(description).trim();
      }

      if (phone !== undefined) {
        updates.phone =
          String(phone).trim();
      }

      if (location !== undefined) {
        updates.location =
          String(location).trim();
      }

      if (avatar !== undefined) {
        updates.avatar =
          String(avatar).trim();
      }

      if (
        profileImage !== undefined
      ) {
        updates.profileImage =
          String(
            profileImage
          ).trim();
      }

      if (photo !== undefined) {
        updates.photo =
          String(photo).trim();
      }

      if (photoURL !== undefined) {
        updates.photoURL =
          String(photoURL).trim();
      }

      if (businessType !== undefined) {
        updates.businessType =
          businessType;
      }

      if (taxId !== undefined) {
        updates.taxId =
          String(taxId).trim();
      }

      updates.lastActive = new Date();
      updates.lastSeen = new Date();

      // NEVER allow seller to modify
      // security / verification fields.

      delete updates.role;
      delete updates.isVerified;
      delete updates.verifiedAt;
      delete updates.verifiedBy;
      delete updates.verificationStatus;
      delete updates.verificationRejectedReason;
      delete updates.sellerStatus;
      delete updates.sellerSince;

      const seller =
        await User.findByIdAndUpdate(
          getUserId(req),
          {
            $set: updates,
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

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Seller profile updated successfully.",
        seller,
      });
    } catch (error) {
      console.error(
        "Update seller profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update seller profile.",
      });
    }
  };

// ============================================================
// 4. SELLER DASHBOARD
// ============================================================

exports.getSellerDashboard =
  async (req, res) => {
    try {
      const userId =
        getValidUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const period =
        req.query.period || "all";

      const dateFilter =
        buildDateFilter(period);

      const productsCount =
        await Product.countDocuments({
          sellerId: userId,
          ...dateFilter,
        });

      const orders =
        await Order.find({
          "items.seller": userId,
          ...dateFilter,
        }).lean();

      let totalSales = 0;
      let totalItemsSold = 0;

      const orderIds = new Set();

      orders.forEach((order) => {
        (order.items || []).forEach(
          (item) => {
            if (
              item.seller?.toString() !==
              userId
            ) {
              return;
            }

            const price =
              Number(item.price || 0);

            const quantity =
              Number(item.quantity || 0);

            if (
              order.status !==
              "cancelled"
            ) {
              totalSales +=
                price * quantity;

              totalItemsSold +=
                quantity;
            }

            orderIds.add(
              order._id.toString()
            );
          }
        );
      });

      const pendingOrders =
        await Order.countDocuments({
          "items.seller": userId,
          status: "pending",
        });

      return res.json({
        success: true,
        stats: {
          products: productsCount,
          orders: orderIds.size,
          totalSales,
          totalItemsSold,
          pendingOrders,
          period,
        },
      });
    } catch (error) {
      console.error(
        "Get dashboard stats error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch dashboard stats.",
      });
    }
  };

// ============================================================
// 5. SELLER ANALYTICS
// ============================================================

exports.getSellerAnalytics =
  async (req, res) => {
    try {
      const userId =
        getValidUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const period =
        req.query.period || "today";

      const dateFilter =
        buildDateFilter(period);

      const [
        products,
        orders,
      ] = await Promise.all([
        Product.find({
          sellerId: userId,
          ...dateFilter,
        })
          .select(
            "title price status createdAt"
          )
          .sort({
            createdAt: -1,
          })
          .lean(),

        Order.find({
          "items.seller": userId,
          ...dateFilter,
        }).lean(),
      ]);

      let revenue = 0;
      let itemsSold = 0;
      let cancelledItems = 0;
      let deliveredItems = 0;

      const orderIds = new Set();

      orders.forEach((order) => {
        let sellerHasItem = false;

        (order.items || []).forEach(
          (item) => {
            if (
              item.seller?.toString() !==
              userId
            ) {
              return;
            }

            sellerHasItem = true;

            const amount =
              Number(item.price || 0) *
              Number(item.quantity || 0);

            const quantity =
              Number(item.quantity || 0);

            if (
              order.status ===
              "cancelled"
            ) {
              cancelledItems +=
                quantity;
            } else {
              revenue += amount;
              itemsSold += quantity;
            }

            if (
              order.status ===
              "delivered"
            ) {
              deliveredItems +=
                quantity;
            }
          }
        );

        if (sellerHasItem) {
          orderIds.add(
            order._id.toString()
          );
        }
      });

      const statusCounts = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders.forEach((order) => {
        const hasSellerItem =
          (order.items || []).some(
            (item) =>
              item.seller?.toString() ===
              userId
          );

        if (
          hasSellerItem &&
          statusCounts[
            order.status
          ] !== undefined
        ) {
          statusCounts[
            order.status
          ]++;
        }
      });

      return res.json({
        success: true,
        analytics: {
          period,
          revenue,
          itemsSold,
          orders: orderIds.size,
          cancelledItems,
          deliveredItems,

          products:
            products.length,

          activeProducts:
            products.filter(
              (product) =>
                product.status ===
                "active"
            ).length,

          pendingProducts:
            products.filter(
              (product) =>
                product.status ===
                "pending"
            ).length,

          soldProducts:
            products.filter(
              (product) =>
                product.status ===
                "sold"
            ).length,

          orderStatuses:
            statusCounts,
        },
      });
    } catch (error) {
      console.error(
        "Get seller analytics error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller analytics.",
      });
    }
  };

// ============================================================
// 6. GET MY PRODUCTS
// ============================================================

exports.getMyProducts =
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const {
        page,
        limit,
        skip,
      } = getPagination(
        req.query.page,
        req.query.limit
      );

      const sort =
        parseSort(
          req.query.sort ||
            "-createdAt"
        );

      const filter = {
        sellerId: userId,
      };

      if (req.query.status) {
        filter.status =
          req.query.status;
      }

      const [
        products,
        total,
      ] = await Promise.all([
        Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),

        Product.countDocuments(
          filter
        ),
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
        "Get my products error:",
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
// 7. SELLER ORDERS
// ============================================================

exports.getSellerOrders =
  async (req, res) => {
    try {
      const userId =
        getValidUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const {
        page,
        limit,
        skip,
      } = getPagination(
        req.query.page,
        req.query.limit
      );

      const sort =
        parseSort(
          req.query.sort ||
            "-createdAt"
        );

      const filter = {
        "items.seller": userId,
      };

      if (req.query.status) {
        filter.status =
          req.query.status;
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

        Order.countDocuments(
          filter
        ),
      ]);

      const processedOrders =
        orders.map((order) => {
          const sellerItems =
            (order.items || []).filter(
              (item) =>
                item.seller?.toString() ===
                userId
            );

          const sellerTotal =
            sellerItems.reduce(
              (sum, item) =>
                sum +
                Number(
                  item.price || 0
                ) *
                  Number(
                    item.quantity || 0
                  ),
              0
            );

          return {
            ...order,

            sellerItems,

            totalSellerItems:
              sellerItems.length,

            sellerTotal,
          };
        });

      return res.json({
        success: true,

        orders: processedOrders,

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
        "Get seller orders error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller orders.",
      });
    }
  };

// ============================================================
// 8. GET SINGLE SELLER ORDER
// ============================================================

exports.getSellerOrderById =
  async (req, res) => {
    try {
      const userId =
        getValidUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const { orderId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
      }

      const order =
        await Order.findOne({
          _id: orderId,
          "items.seller": userId,
        })
          .populate(
            "user",
            "name email phone"
          )
          .populate(
            "items.product",
            "title price images"
          )
          .lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found or does not belong to you.",
        });
      }

      const sellerItems =
        (order.items || []).filter(
          (item) =>
            item.seller?.toString() ===
            userId
        );

      const sellerTotal =
        sellerItems.reduce(
          (sum, item) =>
            sum +
            Number(item.price || 0) *
              Number(
                item.quantity || 0
              ),
          0
        );

      return res.json({
        success: true,

        order: {
          ...order,

          sellerItems,

          totalSellerItems:
            sellerItems.length,

          sellerTotal,
        },
      });
    } catch (error) {
      console.error(
        "Get seller order error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller order.",
      });
    }
  };

// ============================================================
// 9. UPDATE SELLER ORDER STATUS
// ============================================================

exports.updateSellerOrderStatus =
  async (req, res) => {
    try {
      const userId =
        getValidUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const { orderId } =
        req.params;

      const { status } =
        req.body;

      const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
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

      if (
        !mongoose.Types.ObjectId.isValid(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order ID.",
        });
      }

      const order =
        await Order.findOne({
          _id: orderId,
          "items.seller": userId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found or does not belong to you.",
        });
      }

      // Sellers cannot move a cancelled order
      // back into an active state.
      if (
        order.status ===
          "cancelled" &&
        status !== "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A cancelled order cannot be reopened.",
        });
      }

      order.status = status;

      await order.save();

      return res.json({
        success: true,

        message:
          "Order status updated successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "Update seller order status error:",
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
// 10. SELLER EARNINGS
// ============================================================

exports.getSellerEarnings =
  async (req, res) => {
    try {
      const userId =
        getValidUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const period =
        req.query.period || "all";

      const dateFilter =
        buildDateFilter(period);

      const orders =
        await Order.find({
          "items.seller": userId,
          ...dateFilter,
        }).lean();

      let totalEarnings = 0;
      let itemsSold = 0;

      const uniqueOrders = new Set();

      orders.forEach((order) => {
        let hasSellerItem = false;

        (order.items || []).forEach(
          (item) => {
            if (
              item.seller?.toString() !==
              userId
            ) {
              return;
            }

            hasSellerItem = true;

            if (
              order.status ===
              "cancelled"
            ) {
              return;
            }

            totalEarnings +=
              Number(item.price || 0) *
              Number(
                item.quantity || 0
              );

            itemsSold +=
              Number(
                item.quantity || 0
              );
          }
        );

        if (hasSellerItem) {
          uniqueOrders.add(
            order._id.toString()
          );
        }
      });

      return res.json({
        success: true,

        earnings: totalEarnings,

        itemsSold,

        orders:
          uniqueOrders.size,

        period,
      });
    } catch (error) {
      console.error(
        "Get seller earnings error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to calculate earnings.",
      });
    }
  };

// ============================================================
// 11. PUBLIC SELLER PROFILE
// ============================================================

exports.getPublicSellerProfile =
  async (req, res) => {
    try {
      const { sellerId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      const seller =
        await User.findById(
          sellerId
        )
          .select(
            [
              "_id",
              "name",
              "email",
              "phone",
              "location",

              "avatar",
              "profileImage",
              "photo",
              "photoURL",

              "shopName",
              "shopDescription",

              "businessType",
              "role",
              "sellerStatus",
              "sellerSince",

              "rating",

              "isVerified",
              "verifiedAt",
              "verificationStatus",

              "createdAt",
              "updatedAt",

              "lastActive",
              "lastSeen",
              "lastLogin",
            ].join(" ")
          )
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
        });
      }

      if (
        !["seller", "admin"].includes(
          seller.role
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
        });
      }

      if (
        seller.sellerStatus ===
        "suspended"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
        });
      }

      const productsCount =
        await Product.countDocuments({
          sellerId: seller._id,
          status: "active",
        });

      const avatar =
        seller.avatar ||
        seller.profileImage ||
        seller.photo ||
        seller.photoURL ||
        null;

      const memberSince =
        seller.sellerSince ||
        seller.createdAt ||
        null;

      const activityDate =
        seller.lastActive ||
        seller.lastSeen ||
        null;

      let isOnline = false;

      if (activityDate) {
        const activityTime =
          new Date(
            activityDate
          ).getTime();

        const difference =
          Date.now() -
          activityTime;

        isOnline =
          difference >= 0 &&
          difference <=
            5 * 60 * 1000;
      }

      const sellerVerified =
        seller.isVerified === true &&
        seller.verificationStatus ===
          "approved";

      const publicProfile = {
        _id: seller._id,

        name:
          seller.name || "Seller",

        email:
          seller.email || "",

        phone:
          seller.phone || "",

        location:
          seller.location || "",

        shopName:
          seller.shopName ||
          seller.name ||
          "Shop",

        shopDescription:
          seller.shopDescription ||
          "",

        businessType:
          seller.businessType ||
          "individual",

        role:
          seller.role || "seller",

        sellerStatus:
          seller.sellerStatus || "",

        // ====================================================
        // VERIFICATION
        // ====================================================

        isVerified:
          sellerVerified,

        verified:
          sellerVerified,

        verifiedAt:
          seller.verifiedAt || null,

        verificationStatus:
          seller.verificationStatus ||
          "not_submitted",

        // ====================================================
        // PROFILE IMAGE
        // ====================================================

        avatar,

        profileImage:
          seller.profileImage ||
          null,

        photo:
          seller.photo || null,

        photoURL:
          seller.photoURL || null,

        // ====================================================
        // DATES
        // ====================================================

        createdAt:
          seller.createdAt || null,

        sellerSince:
          seller.sellerSince || null,

        memberSince,

        // ====================================================
        // ACTIVITY
        // ====================================================

        lastActive:
          seller.lastActive || null,

        lastSeen:
          seller.lastSeen || null,

        lastLogin:
          seller.lastLogin || null,

        isOnline,

        // ====================================================
        // RATING
        // ====================================================

        rating:
          Number(
            seller.rating || 0
          ),

        productsCount,
      };

      return res.json({
        success: true,
        seller: publicProfile,
      });
    } catch (error) {
      console.error(
        "Get public seller profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller profile.",
      });
    }
  };

// ============================================================
// 12. PUBLIC SELLER PRODUCTS
// ============================================================

exports.getPublicSellerProducts =
  async (req, res) => {
    try {
      const { sellerId } =
        req.params;

      const {
        page = 1,
        limit = 20,
        sort = "-createdAt",
      } = req.query;

      if (
        !mongoose.Types.ObjectId.isValid(
          sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      const sellerExists =
        await User.exists({
          _id: sellerId,

          role: {
            $in: [
              "seller",
              "admin",
            ],
          },

          sellerStatus: {
            $ne: "suspended",
          },
        });

      if (!sellerExists) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
        });
      }

      const {
        page: pageNum,
        limit: limitNum,
        skip,
      } = getPagination(
        page,
        limit
      );

      const sortObj =
        parseSort(sort);

      const filter = {
        sellerId,
        status: "active",
      };

      const [
        products,
        total,
      ] = await Promise.all([
        Product.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum)
          .lean(),

        Product.countDocuments(
          filter
        ),
      ]);

      return res.json({
        success: true,

        products,

        pagination: {
          page: pageNum,
          limit: limitNum,
          total,

          totalPages:
            Math.ceil(
              total / limitNum
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get public seller products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller products.",
      });
    }
  };

// ============================================================
// 13. ADMIN VERIFY SELLER
// ============================================================

exports.verifySeller =
  async (req, res) => {
    try {
      const { sellerId } =
        req.params;

      const adminId =
        getUserId(req);

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      const seller =
        await User.findById(
          sellerId
        );

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
            "This user is not a seller.",
        });
      }

      seller.isVerified = true;

      seller.verificationStatus =
        "approved";

      seller.verifiedAt =
        new Date();

      seller.verifiedBy =
        adminId;

      seller.verificationRejectedReason =
        "";

      if (
        seller.sellerStatus ===
        "pending"
      ) {
        seller.sellerStatus =
          "active";
      }

      await seller.save();

      return res.json({
        success: true,

        message:
          "Seller verified successfully.",

        seller:
          sanitizeSeller(
            seller
          ),
      });
    } catch (error) {
      console.error(
        "Verify seller error:",
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
// 14. ADMIN REJECT SELLER
// ============================================================

exports.rejectSeller =
  async (req, res) => {
    try {
      const { sellerId } =
        req.params;

      const { reason = "" } =
        req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      const seller =
        await User.findById(
          sellerId
        );

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
            "This user is not a seller.",
        });
      }

      seller.isVerified = false;

      seller.verificationStatus =
        "rejected";

      seller.verifiedAt = null;

      seller.verifiedBy = null;

      seller.verificationRejectedReason =
        String(reason).trim();

      await seller.save();

      return res.json({
        success: true,

        message:
          "Seller verification rejected.",

        seller:
          sanitizeSeller(
            seller
          ),
      });
    } catch (error) {
      console.error(
        "Reject seller error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to reject seller.",
      });
    }
  };

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  registerSeller:
    exports.registerSeller,

  getSellerProfile:
    exports.getSellerProfile,

  updateSellerProfile:
    exports.updateSellerProfile,

  getSellerDashboard:
    exports.getSellerDashboard,

  getSellerAnalytics:
    exports.getSellerAnalytics,

  getMyProducts:
    exports.getMyProducts,

  getSellerOrders:
    exports.getSellerOrders,

  getSellerOrderById:
    exports.getSellerOrderById,

  updateSellerOrderStatus:
    exports.updateSellerOrderStatus,

  getSellerEarnings:
    exports.getSellerEarnings,

  getPublicSellerProfile:
    exports.getPublicSellerProfile,

  getPublicSellerProducts:
    exports.getPublicSellerProducts,

  verifySeller:
    exports.verifySeller,

  rejectSeller:
    exports.rejectSeller,
};