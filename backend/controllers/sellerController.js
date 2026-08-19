// controllers/sellerController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");
// const logger = require("../utils/logger"); // optional

// ================================================================
// HELPERS
// ================================================================

const sanitizeSeller = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
};

const getPagination = (page = 1, limit = 20, maxLimit = 50) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), maxLimit);
  const skip = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, skip };
};

const parseSort = (sortStr) => {
  if (!sortStr) return { createdAt: -1 };
  const fields = sortStr.split(",");
  const sortObj = {};
  fields.forEach((field) => {
    const isDesc = field.startsWith("-");
    const key = isDesc ? field.slice(1) : field;
    sortObj[key] = isDesc ? -1 : 1;
  });
  return sortObj;
};

// ================================================================
// 1. REGISTER AS SELLER
// ================================================================

exports.registerSeller = async (req, res) => {
  try {
    const userId = req.user.id;

    const { shopName, description, phone, location, termsAccepted } = req.body;
    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "seller" || user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "You are already a seller or admin.",
      });
    }

    user.shopName = shopName?.trim() || user.shopName || user.name;
    user.shopDescription = description?.trim() || user.shopDescription || "";
    user.phone = phone?.trim() || user.phone || "";
    user.location = location?.trim() || user.location || "";
    user.role = "seller";
    user.sellerStatus = "active";
    user.sellerSince = new Date();

    await user.save();

    res.status(201).json({
      success: true,
      message: "Seller account created successfully.",
      seller: sanitizeSeller(user),
    });
  } catch (error) {
    console.error("Register seller error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to register as seller.",
    });
  }
};

// ================================================================
// 2. GET SELLER PROFILE (Private)
// ================================================================

exports.getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.user.id)
      .select("-password -__v")
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    if (!["seller", "admin"].includes(seller.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not a seller.",
      });
    }

    res.json({
      success: true,
      seller,
    });
  } catch (error) {
    console.error("Get seller profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller profile.",
    });
  }
};

// ================================================================
// 3. UPDATE SELLER PROFILE (Private)
// ================================================================

exports.updateSellerProfile = async (req, res) => {
  try {
    const { shopName, shopDescription, phone, location, avatar, businessType, taxId } = req.body;

    const updates = {};
    if (shopName !== undefined) updates.shopName = shopName.trim();
    if (shopDescription !== undefined) updates.shopDescription = shopDescription.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (location !== undefined) updates.location = location.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();
    if (businessType !== undefined) updates.businessType = businessType;
    if (taxId !== undefined) updates.taxId = taxId.trim();

    delete updates.role;

    const seller = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    )
      .select("-password -__v")
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    res.json({
      success: true,
      message: "Seller profile updated successfully.",
      seller,
    });
  } catch (error) {
    console.error("Update seller profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update seller profile.",
    });
  }
};

// ================================================================
// 4. SELLER DASHBOARD STATS (Private)
// ================================================================

exports.getSellerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "all" } = req.query;

    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate;
      switch (period) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }
      if (startDate) {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    const productsCount = await Product.countDocuments({
      sellerId: userId,
      ...dateFilter,
    });

    const orders = await Order.find({
      "items.sellerId": userId,
      ...dateFilter,
    });

    let totalSales = 0;
    let totalItemsSold = 0;
    const orderIds = new Set();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.sellerId?.toString() === userId) {
          totalSales += item.price * item.quantity;
          totalItemsSold += item.quantity;
          orderIds.add(order._id.toString());
        }
      });
    });

    const pendingOrders = await Order.countDocuments({
      "items.sellerId": userId,
      status: "pending",
    });

    res.json({
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
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard stats.",
    });
  }
};

// ================================================================
// 5. GET SELLER PRODUCTS (Private)
// ================================================================

exports.getMyProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const sort = parseSort(req.query.sort || "-createdAt");

    const filter = { sellerId: userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products.",
    });
  }
};

// ================================================================
// 6. GET SELLER ORDERS (Private)
// ================================================================

exports.getSellerOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const sort = parseSort(req.query.sort || "-createdAt");

    const filter = { "items.sellerId": userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .populate("items.productId", "title price images")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const processedOrders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.sellerId?.toString() === userId
      );
      return {
        ...order,
        sellerItems,
        totalSellerItems: sellerItems.length,
        sellerTotal: sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
    });

    res.json({
      success: true,
      orders: processedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders.",
    });
  }
};

// ================================================================
// 7. GET SELLER EARNINGS (Private)
// ================================================================

exports.getSellerEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "all" } = req.query;

    let dateFilter = {};
    if (period !== "all") {
      const now = new Date();
      let startDate;
      switch (period) {
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }
      if (startDate) {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    const orders = await Order.find({
      "items.sellerId": userId,
      ...dateFilter,
    });

    let totalEarnings = 0;
    let itemsSold = 0;
    const uniqueOrders = new Set();

    orders.forEach((order) => {
      let hasSellerItem = false;
      order.items.forEach((item) => {
        if (item.sellerId?.toString() === userId) {
          totalEarnings += item.price * item.quantity;
          itemsSold += item.quantity;
          hasSellerItem = true;
        }
      });
      if (hasSellerItem) {
        uniqueOrders.add(order._id.toString());
      }
    });

    res.json({
      success: true,
      earnings: totalEarnings,
      itemsSold,
      orders: uniqueOrders.size,
      period,
    });
  } catch (error) {
    console.error("Get seller earnings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate earnings.",
    });
  }
};

// ================================================================
// 8. GET PUBLIC SELLER PROFILE (Public – no auth)
// ================================================================

exports.getPublicSellerProfile = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const seller = await User.findById(sellerId)
      .select(
        "name shopName shopDescription location avatar role createdAt phone"
      )
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const productsCount = await Product.countDocuments({
      sellerId: sellerId,
      status: "active",
    });

    const publicProfile = {
      _id: seller._id,
      name: seller.name || "Seller",
      shopName: seller.shopName || seller.name || "Shop",
      shopDescription: seller.shopDescription || "",
      location: seller.location || "",
      avatar:
        seller.avatar ||
        seller.profileImage ||
        seller.photo ||
        null,
      role: seller.role || "seller",
      createdAt: seller.createdAt || "",
      phone: seller.phone || "",
      productsCount,
    };

    res.json({
      success: true,
      seller: publicProfile,
    });
  } catch (error) {
    console.error("❌ Get public seller profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller profile",
    });
  }
};

// ================================================================
// 9. GET PUBLIC SELLER PRODUCTS (Public – no auth)
// ================================================================

exports.getPublicSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20, sort = "-createdAt" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const sellerExists = await User.exists({ _id: sellerId });
    if (!sellerExists) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 50);
    const skip = (pageNum - 1) * limitNum;

    const sortObj = {};
    if (sort.startsWith("-")) {
      sortObj[sort.slice(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const filter = { sellerId, status: "active" };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("❌ Get public seller products error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller products",
    });
  }
};

// ================================================================
// EXPORT
// ================================================================

module.exports = {
  registerSeller: exports.registerSeller,
  getSellerProfile: exports.getSellerProfile,
  updateSellerProfile: exports.updateSellerProfile,
  getSellerDashboard: exports.getSellerDashboard,
  getMyProducts: exports.getMyProducts,
  getSellerOrders: exports.getSellerOrders,
  getSellerEarnings: exports.getSellerEarnings,
  getPublicSellerProfile: exports.getPublicSellerProfile,
  getPublicSellerProducts: exports.getPublicSellerProducts,
};