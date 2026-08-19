// backend/controllers/sellerController.js

const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

// ============================================================
// HELPERS
// ============================================================

const sanitizeSeller = (
  user
) => {
  const obj = user.toObject
    ? user.toObject()
    : {
        ...user,
      };

  delete obj.password;
  delete obj.__v;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;

  return obj;
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

  const skip =
    (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

// ============================================================
// SORT
// ============================================================

const parseSort = (
  sortStr
) => {
  if (!sortStr) {
    return {
      createdAt: -1,
    };
  }

  const fields =
    String(sortStr).split(",");

  const sortObj = {};

  fields.forEach(
    (field) => {
      const isDesc =
        field.startsWith("-");

      const key = isDesc
        ? field.slice(1)
        : field;

      if (key) {
        sortObj[key] =
          isDesc ? -1 : 1;
      }
    }
  );

  return Object.keys(
    sortObj
  ).length
    ? sortObj
    : {
        createdAt: -1,
      };
};

// ============================================================
// 1. REGISTER SELLER
// ============================================================

exports.registerSeller =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user._id ||
        req.user.id;

      const {
        shopName,
        description,
        phone,
        location,
        termsAccepted,
        businessType,
        taxId,
      } = req.body;

      if (!termsAccepted) {
        return res.status(400).json({
          success: false,
          message:
            "You must accept the terms and conditions.",
        });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      if (
        user.role ===
          "seller" ||
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
        "Ghana";

      user.businessType =
        businessType ||
        user.businessType ||
        "individual";

      user.taxId =
        taxId?.trim() ||
        user.taxId ||
        "";

      user.role = "seller";

      user.sellerStatus =
        "active";

      user.sellerSince =
        new Date();

      // Initial activity
      user.lastActive =
        new Date();

      user.lastSeen =
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
// 2. PRIVATE SELLER PROFILE
// ============================================================

exports.getSellerProfile =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user._id ||
        req.user.id;

      const seller =
        await User.findById(
          userId
        )
          .select(
            "-password -__v -resetPasswordToken -resetPasswordExpires"
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
        ![
          "seller",
          "admin",
        ].includes(
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
  async (
    req,
    res
  ) => {
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

      if (
        shopName !== undefined
      ) {
        updates.shopName =
          String(
            shopName
          ).trim();
      }

      if (
        shopDescription !==
        undefined
      ) {
        updates.shopDescription =
          String(
            shopDescription
          ).trim();
      }

      if (
        description !==
          undefined &&
        shopDescription ===
          undefined
      ) {
        updates.shopDescription =
          String(
            description
          ).trim();
      }

      if (
        phone !== undefined
      ) {
        updates.phone =
          String(
            phone
          ).trim();
      }

      if (
        location !== undefined
      ) {
        updates.location =
          String(
            location
          ).trim();
      }

      if (
        avatar !== undefined
      ) {
        updates.avatar =
          String(
            avatar
          ).trim();
      }

      if (
        profileImage !==
        undefined
      ) {
        updates.profileImage =
          String(
            profileImage
          ).trim();
      }

      if (
        photo !== undefined
      ) {
        updates.photo =
          String(
            photo
          ).trim();
      }

      if (
        photoURL !== undefined
      ) {
        updates.photoURL =
          String(
            photoURL
          ).trim();
      }

      if (
        businessType !==
        undefined
      ) {
        updates.businessType =
          businessType;
      }

      if (
        taxId !== undefined
      ) {
        updates.taxId =
          String(
            taxId
          ).trim();
      }

      // Update activity as well
      updates.lastActive =
        new Date();

      updates.lastSeen =
        new Date();

      delete updates.role;

      const seller =
        await User.findByIdAndUpdate(
          req.user._id,
          {
            $set: updates,
          },
          {
            new: true,
            runValidators: true,
          }
        )
          .select(
            "-password -__v -resetPasswordToken -resetPasswordExpires"
          )
          .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message:
            "Seller not found.",
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
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user._id.toString();

      const {
        period = "all",
      } = req.query;

      let dateFilter = {};

      if (period !== "all") {
        const now =
          new Date();

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
              startDate.getDate() -
                7
            );

            break;

          case "month":
            startDate =
              new Date(now);

            startDate.setMonth(
              startDate.getMonth() -
                1
            );

            break;

          case "year":
            startDate =
              new Date(now);

            startDate.setFullYear(
              startDate.getFullYear() -
                1
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
        await Product.countDocuments(
          {
            sellerId: userId,
            ...dateFilter,
          }
        );

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
                    item.price ||
                      0
                  ) *
                  Number(
                    item.quantity ||
                      0
                  );

                totalItemsSold +=
                  Number(
                    item.quantity ||
                      0
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
        await Order.countDocuments(
          {
            "items.sellerId":
              userId,
            status: "pending",
          }
        );

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
  async (
    req,
    res
  ) => {
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

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      const [
        products,
        total,
      ] =
        await Promise.all([
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
// 6. SELLER ORDERS
// ============================================================

exports.getSellerOrders =
  async (
    req,
    res
  ) => {
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

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      const [
        orders,
        total,
      ] =
        await Promise.all([
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
                order.items ||
                []
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
                      item.price ||
                        0
                    ) *
                      Number(
                        item.quantity ||
                          0
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
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user._id.toString();

      const {
        period = "all",
      } = req.query;

      let dateFilter = {};

      if (period !== "all") {
        const now =
          new Date();

        let startDate;

        switch (period) {
          case "week":
            startDate =
              new Date(now);

            startDate.setDate(
              startDate.getDate() -
                7
            );

            break;

          case "month":
            startDate =
              new Date(now);

            startDate.setMonth(
              startDate.getMonth() -
                1
            );

            break;

          case "year":
            startDate =
              new Date(now);

            startDate.setFullYear(
              startDate.getFullYear() -
                1
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
                    item.price ||
                      0
                  ) *
                  Number(
                    item.quantity ||
                      0
                  );

                itemsSold +=
                  Number(
                    item.quantity ||
                      0
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
  async (
    req,
    res
  ) => {
    try {
      const {
        sellerId,
      } = req.params;

      // --------------------------------------------------------
      // Validate seller ID
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // Find seller
      // --------------------------------------------------------

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

              "createdAt",
              "updatedAt",

              "lastActive",
              "lastSeen",
              "lastLogin",

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

      // --------------------------------------------------------
      // Count active products
      // --------------------------------------------------------

      const productsCount =
        await Product.countDocuments(
          {
            sellerId:
              seller._id,

            status: "active",
          }
        );

      // --------------------------------------------------------
      // Profile picture
      //
      // Use the first available real image.
      // --------------------------------------------------------

      const avatar =
        seller.avatar ||
        seller.profileImage ||
        seller.photo ||
        seller.photoURL ||
        null;

      // --------------------------------------------------------
      // Member date
      //
      // sellerSince is preferred because this is when
      // the user became a seller.
      // --------------------------------------------------------

      const memberSince =
        seller.sellerSince ||
        seller.createdAt ||
        null;

      // --------------------------------------------------------
      // ACTIVITY
      // --------------------------------------------------------

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

        // Active if activity occurred within 5 minutes.
        isOnline =
          difference >= 0 &&
          difference <=
            5 * 60 * 1000;
      }

      // --------------------------------------------------------
      // PUBLIC PROFILE
      // --------------------------------------------------------

      const publicProfile = {
        _id:
          seller._id,

        name:
          seller.name ||
          "Seller",

        email:
          seller.email ||
          "",

        phone:
          seller.phone ||
          "",

        location:
          seller.location ||
          "",

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
          seller.role ||
          "seller",

        sellerStatus:
          seller.sellerStatus ||
          "",

        // Profile image
        avatar,

        profileImage:
          seller.profileImage ||
          null,

        photo:
          seller.photo ||
          null,

        photoURL:
          seller.photoURL ||
          null,

        // Dates
        createdAt:
          seller.createdAt ||
          null,

        sellerSince:
          seller.sellerSince ||
          null,

        memberSince,

        // Activity
        lastActive:
          seller.lastActive ||
          null,

        lastSeen:
          seller.lastSeen ||
          null,

        lastLogin:
          seller.lastLogin ||
          null,

        isOnline,

        // Other
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

          phone:
            publicProfile.phone,

          location:
            publicProfile.location,

          memberSince:
            publicProfile.memberSince,

          lastActive:
            publicProfile.lastActive,

          lastSeen:
            publicProfile.lastSeen,

          isOnline:
            publicProfile.isOnline,
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
  async (
    req,
    res
  ) => {
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
          role: {
            $in: [
              "seller",
              "admin",
            ],
          },
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
          parseInt(
            page,
            10
          ) || 1
        );

      const limitNum =
        Math.min(
          Math.max(
            1,
            parseInt(
              limit,
              10
            ) || 20
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
      ] =
        await Promise.all([
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