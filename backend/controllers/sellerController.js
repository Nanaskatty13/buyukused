// backend/controllers/sellerController.js

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
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;

  return obj;
};

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

  const skip =
    (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

const parseSort = (sortStr) => {
  if (!sortStr) {
    return {
      createdAt: -1,
    };
  }

  const fields =
    String(sortStr).split(",");

  const sortObj = {};

  fields.forEach((field) => {
    const isDesc =
      field.startsWith("-");

    const key = isDesc
      ? field.slice(1)
      : field;

    if (key) {
      sortObj[key] =
        isDesc ? -1 : 1;
    }
  });

  return Object.keys(sortObj).length
    ? sortObj
    : {
        createdAt: -1,
      };
};

// ============================================================
// PROFILE IMAGE HELPER
// ============================================================

const getSellerAvatar = (seller) => {
  if (!seller) {
    return "";
  }

  // Preferred order.
  return (
    seller.avatar ||
    seller.photoURL ||
    seller.profileImage ||
    seller.photo ||
    ""
  );
};

// ============================================================
// 1. REGISTER SELLER
// ============================================================

exports.registerSeller = async (
  req,
  res
) => {
  try {
    const userId =
      req.user._id || req.user.id;

    const {
      shopName,
      description,
      phone,
      location,
      termsAccepted,
    } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message:
          "You must accept the terms and conditions.",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
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
      shopName?.trim() ||
      user.shopName ||
      user.name;

    user.shopDescription =
      description?.trim() ||
      user.shopDescription ||
      "";

    user.phone =
      phone?.trim() ||
      user.phone ||
      "";

    user.location =
      location?.trim() ||
      user.location ||
      "";

    user.role = "seller";

    user.sellerStatus = "active";

    // IMPORTANT:
    // Save the exact date the user became a seller.
    user.sellerSince =
      new Date();

    await user.save();

    return res.status(201).json({
      success: true,
      message:
        "Seller account created successfully.",
      seller:
        sanitizeSeller(user),
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
// 2. GET PRIVATE SELLER PROFILE
// ============================================================

exports.getSellerProfile =
  async (req, res) => {
    try {
      const userId =
        req.user._id ||
        req.user.id;

      const seller =
        await User.findById(userId)
          .select(
            "-password -resetPasswordToken -resetPasswordExpires -__v"
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
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You are not a seller.",
        });
      }

      const avatar =
        getSellerAvatar(seller);

      const memberSince =
        seller.sellerSince ||
        seller.createdAt ||
        null;

      return res.json({
        success: true,

        seller: {
          ...seller,

          avatar,

          profileImage:
            seller.profileImage ||
            null,

          photoURL:
            seller.photoURL ||
            null,

          photo:
            seller.photo ||
            null,

          memberSince,
        },
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

        // Profile image fields
        avatar,
        photoURL,
        profileImage,
        photo,

        businessType,
        taxId,
      } = req.body;

      const updates = {};

      // ------------------------------------------------------
      // SHOP NAME
      // ------------------------------------------------------

      if (
        shopName !== undefined
      ) {
        updates.shopName =
          String(shopName).trim();
      }

      // ------------------------------------------------------
      // SHOP DESCRIPTION
      // ------------------------------------------------------

      if (
        shopDescription !== undefined
      ) {
        updates.shopDescription =
          String(
            shopDescription
          ).trim();
      } else if (
        description !== undefined
      ) {
        updates.shopDescription =
          String(
            description
          ).trim();
      }

      // ------------------------------------------------------
      // PHONE
      // ------------------------------------------------------

      if (
        phone !== undefined
      ) {
        updates.phone =
          String(phone).trim();
      }

      // ------------------------------------------------------
      // LOCATION
      // ------------------------------------------------------

      if (
        location !== undefined
      ) {
        updates.location =
          String(location).trim();
      }

      // ------------------------------------------------------
      // PROFILE IMAGE
      // ------------------------------------------------------

      // If avatar is supplied, make it the primary image.
      if (
        avatar !== undefined
      ) {
        updates.avatar =
          String(avatar).trim();
      }

      // Support photoURL from older frontend code.
      if (
        photoURL !== undefined
      ) {
        updates.photoURL =
          String(photoURL).trim();
      }

      // Support profileImage.
      if (
        profileImage !== undefined
      ) {
        updates.profileImage =
          String(
            profileImage
          ).trim();
      }

      // Support photo.
      if (
        photo !== undefined
      ) {
        updates.photo =
          String(photo).trim();
      }

      // ------------------------------------------------------
      // BUSINESS INFORMATION
      // ------------------------------------------------------

      if (
        businessType !== undefined
      ) {
        updates.businessType =
          businessType;
      }

      if (
        taxId !== undefined
      ) {
        updates.taxId =
          String(taxId).trim();
      }

      // Never allow profile update
      // to change the user's role.
      delete updates.role;

      const seller =
        await User.findByIdAndUpdate(
          req.user._id,
          updates,
          {
            new: true,
            runValidators: true,
          }
        )
          .select(
            "-password -resetPasswordToken -resetPasswordExpires -__v"
          )
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
        });
      }

      const sellerAvatar =
        getSellerAvatar(seller);

      const memberSince =
        seller.sellerSince ||
        seller.createdAt ||
        null;

      return res.json({
        success: true,
        message:
          "Seller profile updated successfully.",

        seller: {
          ...seller,

          avatar:
            sellerAvatar,

          memberSince,
        },
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
        req.user._id.toString();

      const {
        period = "all",
      } = req.query;

      let dateFilter = {};

      if (period !== "all") {
        const now = new Date();
        let startDate;

        switch (period) {
          case "today":
            startDate =
              new Date(now);

            startDate.setHours(
              0,
              0,
              0,
              0
            );
            break;

          case "week":
            startDate =
              new Date(now);

            startDate.setDate(
              startDate.getDate() - 7
            );
            break;

          case "month":
            startDate =
              new Date(now);

            startDate.setMonth(
              startDate.getMonth() - 1
            );
            break;

          case "year":
            startDate =
              new Date(now);

            startDate.setFullYear(
              startDate.getFullYear() - 1
            );
            break;
        }

        if (startDate) {
          dateFilter = {
            createdAt: {
              $gte: startDate,
            },
          };
        }
      }

      const productsCount =
        await Product.countDocuments({
          sellerId: userId,
          ...dateFilter,
        });

      const orders =
        await Order.find({
          "items.sellerId":
            userId,
          ...dateFilter,
        });

      let totalSales = 0;
      let totalItemsSold = 0;

      const orderIds =
        new Set();

      orders.forEach(
        (order) => {
          (
            order.items || []
          ).forEach(
            (item) => {
              if (
                item.sellerId?.toString() ===
                userId
              ) {
                totalSales +=
                  Number(
                    item.price || 0
                  ) *
                  Number(
                    item.quantity || 0
                  );

                totalItemsSold +=
                  Number(
                    item.quantity || 0
                  );

                orderIds.add(
                  order._id.toString()
                );
              }
            }
          );
        }
      );

      const pendingOrders =
        await Order.countDocuments({
          "items.sellerId":
            userId,
          status: "pending",
        });

      return res.json({
        success: true,

        stats: {
          products:
            productsCount,

          orders:
            orderIds.size,

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
// 5. GET MY PRODUCTS
// ============================================================

exports.getMyProducts =
  async (req, res) => {
    try {
      const userId =
        req.user._id;

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
// 6. GET SELLER ORDERS
// ============================================================

exports.getSellerOrders =
  async (req, res) => {
    try {
      const userId =
        req.user._id.toString();

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
        "items.sellerId":
          userId,
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
            "items.productId",
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
        orders.map(
          (order) => {
            const sellerItems =
              (
                order.items || []
              ).filter(
                (item) =>
                  item.sellerId?.toString() ===
                  userId
              );

            return {
              ...order,

              sellerItems,

              totalSellerItems:
                sellerItems.length,

              sellerTotal:
                sellerItems.reduce(
                  (
                    sum,
                    item
                  ) =>
                    sum +
                    Number(
                      item.price || 0
                    ) *
                      Number(
                        item.quantity || 0
                      ),
                  0
                ),
            };
          }
        );

      return res.json({
        success: true,

        orders:
          processedOrders,

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
// 7. SELLER EARNINGS
// ============================================================

exports.getSellerEarnings =
  async (req, res) => {
    try {
      const userId =
        req.user._id.toString();

      const {
        period = "all",
      } = req.query;

      let dateFilter = {};

      if (period !== "all") {
        const now = new Date();
        let startDate;

        switch (period) {
          case "week":
            startDate =
              new Date(now);

            startDate.setDate(
              startDate.getDate() - 7
            );
            break;

          case "month":
            startDate =
              new Date(now);

            startDate.setMonth(
              startDate.getMonth() - 1
            );
            break;

          case "year":
            startDate =
              new Date(now);

            startDate.setFullYear(
              startDate.getFullYear() - 1
            );
            break;
        }

        if (startDate) {
          dateFilter = {
            createdAt: {
              $gte: startDate,
            },
          };
        }
      }

      const orders =
        await Order.find({
          "items.sellerId":
            userId,
          ...dateFilter,
        });

      let totalEarnings = 0;
      let itemsSold = 0;

      const uniqueOrders =
        new Set();

      orders.forEach(
        (order) => {
          let hasSellerItem =
            false;

          (
            order.items || []
          ).forEach(
            (item) => {
              if (
                item.sellerId?.toString() ===
                userId
              ) {
                totalEarnings +=
                  Number(
                    item.price || 0
                  ) *
                  Number(
                    item.quantity || 0
                  );

                itemsSold +=
                  Number(
                    item.quantity || 0
                  );

                hasSellerItem =
                  true;
              }
            }
          );

          if (
            hasSellerItem
          ) {
            uniqueOrders.add(
              order._id.toString()
            );
          }
        }
      );

      return res.json({
        success: true,

        earnings:
          totalEarnings,

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
// 8. PUBLIC SELLER PROFILE
// ============================================================

exports.getPublicSellerProfile =
  async (req, res) => {
    try {
      const {
        sellerId,
      } = req.params;

      // ------------------------------------------------------
      // VALIDATE SELLER ID
      // ------------------------------------------------------

      if (
        !mongoose.Types.ObjectId.isValid(
          sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID",
        });
      }

      // ------------------------------------------------------
      // FIND SELLER
      // ------------------------------------------------------

      const seller =
        await User.findById(
          sellerId
        )
          .select(
            [
              "_id",
              "name",
              "email",
              "shopName",
              "shopDescription",
              "location",

              // Profile images
              "avatar",
              "photoURL",
              "profileImage",
              "photo",

              // Seller info
              "role",
              "sellerStatus",
              "sellerSince",

              // Dates
              "createdAt",
              "updatedAt",
              "lastActive",
              "lastSeen",

              // Contact
              "phone",

              // Rating
              "rating",
            ].join(" ")
          )
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found",
        });
      }

      // ------------------------------------------------------
      // PRODUCT COUNT
      // ------------------------------------------------------

      const productsCount =
        await Product.countDocuments({
          sellerId:
            seller._id,

          status: "active",
        });

      // ------------------------------------------------------
      // PROFILE PICTURE
      // ------------------------------------------------------

      const avatar =
        getSellerAvatar(seller);

      // ------------------------------------------------------
      // SELLER DATE
      // ------------------------------------------------------

      const memberSince =
        seller.sellerSince ||
        seller.createdAt ||
        null;

      // ------------------------------------------------------
      // PUBLIC PROFILE
      // ------------------------------------------------------

      const publicProfile = {
        _id:
          seller._id,

        name:
          seller.name ||
          "Seller",

        email:
          seller.email ||
          "",

        shopName:
          seller.shopName ||
          seller.name ||
          "Shop",

        shopDescription:
          seller.shopDescription ||
          "",

        location:
          seller.location ||
          "",

        // PRIMARY PROFILE IMAGE
        avatar,

        // Compatibility fields
        photoURL:
          seller.photoURL ||
          null,

        profileImage:
          seller.profileImage ||
          null,

        photo:
          seller.photo ||
          null,

        phone:
          seller.phone ||
          "",

        role:
          seller.role ||
          "seller",

        sellerStatus:
          seller.sellerStatus ||
          "active",

        createdAt:
          seller.createdAt ||
          null,

        sellerSince:
          seller.sellerSince ||
          null,

        // Frontend can use this directly.
        memberSince,

        lastActive:
          seller.lastActive ||
          null,

        lastSeen:
          seller.lastSeen ||
          null,

        rating:
          Number(
            seller.rating || 0
          ),

        productsCount,
      };

      console.log(
        "👤 Public seller profile:",
        {
          sellerId,

          name:
            publicProfile.name,

          avatar:
            publicProfile.avatar,

          sellerSince:
            publicProfile.sellerSince,

          createdAt:
            publicProfile.createdAt,

          memberSince:
            publicProfile.memberSince,
        }
      );

      return res.json({
        success: true,

        seller:
          publicProfile,
      });
    } catch (error) {
      console.error(
        "❌ Get public seller profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller profile",
      });
    }
  };

// ============================================================
// 9. PUBLIC SELLER PRODUCTS
// ============================================================

exports.getPublicSellerProducts =
  async (req, res) => {
    try {
      const {
        sellerId,
      } = req.params;

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
            "Invalid seller ID",
        });
      }

      const sellerExists =
        await User.exists({
          _id: sellerId,
        });

      if (!sellerExists) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found",
        });
      }

      const pageNum =
        Math.max(
          1,
          parseInt(page, 10) || 1
        );

      const limitNum =
        Math.min(
          Math.max(
            1,
            parseInt(limit, 10) || 20
          ),
          50
        );

      const skip =
        (pageNum - 1) *
        limitNum;

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
              total /
                limitNum
            ),
        },
      });
    } catch (error) {
      console.error(
        "❌ Get public seller products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller products",
      });
    }
  };

// ============================================================
// EXPORTS
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

  getMyProducts:
    exports.getMyProducts,

  getSellerOrders:
    exports.getSellerOrders,

  getSellerEarnings:
    exports.getSellerEarnings,

  getPublicSellerProfile:
    exports.getPublicSellerProfile,

  getPublicSellerProducts:
    exports.getPublicSellerProducts,
};