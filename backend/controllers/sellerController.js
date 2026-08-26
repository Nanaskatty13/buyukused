
// ============================================================
// backend/controllers/sellerController.js
// BuyUKUsed Seller Controller
// ============================================================

const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Orders");

// Re-use the existing product controller.
// This keeps seller product creation/update/delete compatible
// with the current Product model and Cloudinary handling.
const productController =
  require("./productController");

// ============================================================
// HELPERS
// ============================================================

// ------------------------------------------------------------
// Sanitize seller/user object
// ------------------------------------------------------------

const sanitizeSeller = (user) => {
  const obj = user?.toObject
    ? user.toObject()
    : {
        ...(user || {}),
      };

  delete obj.password;
  delete obj.__v;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;

  return obj;
};

// ------------------------------------------------------------
// Get authenticated user ID
// ------------------------------------------------------------

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.userId ||
    null
  );
};

// ------------------------------------------------------------
// Get authenticated user role
// ------------------------------------------------------------

const getUserRole = (req) => {
  return (
    req.user?.role ||
    req.role ||
    null
  );
};

// ------------------------------------------------------------
// Make sure authenticated user is seller/admin
// ------------------------------------------------------------

const requireSellerAccount = async (
  req,
  res
) => {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return null;
  }

  const user =
    await User.findById(userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found.",
    });

    return null;
  }

  if (
    !["seller", "admin"].includes(
      user.role
    )
  ) {
    res.status(403).json({
      success: false,
      message:
        "Access denied. You are not a seller.",
    });

    return null;
  }

  return user;
};

// ------------------------------------------------------------
// Pagination
// ------------------------------------------------------------

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
    skip:
      (pageNum - 1) *
      limitNum,
  };
};

// ------------------------------------------------------------
// Sort
// ------------------------------------------------------------

const parseSort = (
  sortStr
) => {
  if (!sortStr) {
    return {
      createdAt: -1,
    };
  }

  const sortObj = {};

  String(sortStr)
    .split(",")
    .forEach((field) => {
      const cleanField =
        String(field).trim();

      if (!cleanField) {
        return;
      }

      const isDesc =
        cleanField.startsWith("-");

      const key = isDesc
        ? cleanField.slice(1)
        : cleanField;

      if (
        !key ||
        !/^[a-zA-Z0-9_]+$/.test(
          key
        )
      ) {
        return;
      }

      sortObj[key] =
        isDesc ? -1 : 1;
    });

  return Object.keys(sortObj)
    .length
    ? sortObj
    : {
        createdAt: -1,
      };
};

// ------------------------------------------------------------
// Date filter
// ------------------------------------------------------------

const getDateFilter = (
  period = "all"
) => {
  if (
    !period ||
    period === "all"
  ) {
    return {};
  }

  const now = new Date();
  let startDate = null;

  switch (period) {
    case "today":
      startDate = new Date(now);
      startDate.setHours(
        0,
        0,
        0,
        0
      );
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

const registerSeller = async (
  req,
  res
) => {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const {
      shopName,
      description,
      shopDescription,
      phone,
      location,
      termsAccepted,
      businessType,
      taxId,
    } = req.body || {};

    if (
      termsAccepted !== true &&
      termsAccepted !== "true"
    ) {
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

    const finalShopName =
      String(
        shopName ||
          user.shopName ||
          user.name ||
          "Seller"
      ).trim();

    const finalDescription =
      String(
        shopDescription ??
          description ??
          user.shopDescription ??
          ""
      ).trim();

    const finalPhone =
      String(
        phone ||
          user.phone ||
          ""
      ).trim();

    const finalLocation =
      String(
        location ||
          user.location ||
          "Ghana"
      ).trim();

    user.shopName =
      finalShopName;

    user.shopDescription =
      finalDescription;

    user.phone =
      finalPhone;

    user.location =
      finalLocation;

    user.businessType =
      businessType ||
      user.businessType ||
      "individual";

    user.taxId =
      String(
        taxId ||
          user.taxId ||
          ""
      ).trim();

    user.role = "seller";

    user.sellerStatus =
      "active";

    if (!user.sellerSince) {
      user.sellerSince =
        new Date();
    }

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
      "❌ Register seller error:",
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

const getSellerProfile =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const seller =
        await User.findById(userId)
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
        "❌ Get seller profile error:",
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

const updateSellerProfile =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

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
      } = req.body || {};

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
      } else if (
        description !==
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

      updates.lastActive =
        new Date();

      updates.lastSeen =
        new Date();

      // Never allow this endpoint
      // to change the user's role.
      delete updates.role;

      const seller =
        await User.findByIdAndUpdate(
          userId,
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
        "❌ Update seller profile error:",
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

const getSellerDashboard =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const userId =
        seller._id;

      const period =
        req.query.period ||
        "all";

      const dateFilter =
        getDateFilter(
          period
        );

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
        }).lean();

      const userIdString =
        userId.toString();

      let totalSales = 0;
      let totalItemsSold = 0;

      const orderIds =
        new Set();

      for (
        const order of orders
      ) {
        for (
          const item of
            order.items || []
        ) {
          if (
            item.sellerId &&
            item.sellerId.toString() ===
              userIdString
          ) {
            const price =
              Number(
                item.price || 0
              );

            const quantity =
              Number(
                item.quantity || 0
              );

            totalSales +=
              price *
              quantity;

            totalItemsSold +=
              quantity;

            orderIds.add(
              order._id.toString()
            );
          }
        }
      }

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
        "❌ Get seller dashboard error:",
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

const getMyProducts =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
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
        sellerId:
          seller._id,
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
        "❌ Get my products error:",
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
// 6. CREATE SELLER PRODUCT
// ============================================================
//
// Delegates to the existing product controller so that:
//
// - Product validation remains centralized.
// - Cloudinary upload remains centralized.
// - Images/videos remain compatible.
// - Product fields remain compatible with Product.js.
// - sellerId is assigned by the existing product controller.
//
// ============================================================

const createProductSeller =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      // Make sure the existing product
      // controller sees the authenticated seller.
      req.user = {
        ...(req.user || {}),
        _id: seller._id,
        id: seller._id,
        role: seller.role,
        name: seller.name,
        phone: seller.phone,
      };

      req.userId =
        seller._id;

      return productController.createProduct(
        req,
        res
      );
    } catch (error) {
      console.error(
        "❌ Create seller product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create product.",
      });
    }
  };

// ============================================================
// 7. UPDATE SELLER PRODUCT
// ============================================================
//
// Existing productController expects req.params.id.
// Seller routes use :productId.
// We map the parameter here.
//
// ============================================================

const updateProductSeller =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const {
        productId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          seller._id.toString();

      const isAdmin =
        seller.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this product.",
        });
      }

      req.params.id =
        productId;

      req.user = {
        ...(req.user || {}),
        _id: seller._id,
        id: seller._id,
        role: seller.role,
        name: seller.name,
        phone: seller.phone,
      };

      req.userId =
        seller._id;

      return productController.updateProduct(
        req,
        res
      );
    } catch (error) {
      console.error(
        "❌ Update seller product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product.",
      });
    }
  };

// ============================================================
// 8. DELETE SELLER PRODUCT
// ============================================================

const deleteProductSeller =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const {
        productId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          seller._id.toString();

      const isAdmin =
        seller.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to delete this product.",
        });
      }

      req.params.id =
        productId;

      req.user = {
        ...(req.user || {}),
        _id: seller._id,
        id: seller._id,
        role: seller.role,
      };

      req.userId =
        seller._id;

      return productController.deleteProduct(
        req,
        res
      );
    } catch (error) {
      console.error(
        "❌ Delete seller product error:",
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
// 9. SELLER ORDERS
// ============================================================

const getSellerOrders =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const userId =
        seller._id;

      const userIdString =
        userId.toString();

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
                order.items ||
                []
              ).filter(
                (item) =>
                  item.sellerId &&
                  item.sellerId.toString() ===
                    userIdString
              );

            const sellerTotal =
              sellerItems.reduce(
                (
                  sum,
                  item
                ) => {
                  return (
                    sum +
                    Number(
                      item.price || 0
                    ) *
                      Number(
                        item.quantity ||
                          0
                      )
                  );
                },
                0
              );

            return {
              ...order,

              sellerItems,

              totalSellerItems:
                sellerItems.length,

              sellerTotal,
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
        "❌ Get seller orders error:",
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
// 10. SELLER ORDER BY ID
// ============================================================

const getSellerOrderById =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const {
        orderId,
      } = req.params;

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
          "items.sellerId":
            seller._id,
        })
          .populate(
            "user",
            "name email phone"
          )
          .populate(
            "items.productId",
            "title price images"
          )
          .lean();

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      const userIdString =
        seller._id.toString();

      const sellerItems =
        (
          order.items || []
        ).filter(
          (item) =>
            item.sellerId &&
            item.sellerId.toString() ===
              userIdString
        );

      const sellerTotal =
        sellerItems.reduce(
          (
            sum,
            item
          ) => {
            return (
              sum +
              Number(
                item.price || 0
              ) *
                Number(
                  item.quantity || 0
                )
            );
          },
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
        "❌ Get seller order by ID error:",
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
// 11. UPDATE SELLER ORDER STATUS
// ============================================================

const updateSellerOrderStatus =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const {
        orderId,
      } = req.params;

      const {
        status,
      } = req.body || {};

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

      const allowedStatuses = [
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
          allowedStatuses,
        });
      }

      const order =
        await Order.findOne({
          _id: orderId,
          "items.sellerId":
            seller._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found or does not contain your products.",
        });
      }

      // Current Orders model uses one
      // global order status.
      order.status =
        status;

      await order.save();

      return res.json({
        success: true,
        message:
          "Order status updated successfully.",
        order,
      });
    } catch (error) {
      console.error(
        "❌ Update seller order status error:",
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
// 12. SELLER EARNINGS
// ============================================================

const getSellerEarnings =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const userId =
        seller._id;

      const userIdString =
        userId.toString();

      const period =
        req.query.period ||
        "all";

      const dateFilter =
        getDateFilter(
          period
        );

      const orders =
        await Order.find({
          "items.sellerId":
            userId,
          ...dateFilter,
        }).lean();

      let totalEarnings = 0;
      let itemsSold = 0;

      const uniqueOrders =
        new Set();

      for (
        const order of orders
      ) {
        let hasSellerItem =
          false;

        for (
          const item of
            order.items || []
        ) {
          if (
            item.sellerId &&
            item.sellerId.toString() ===
              userIdString
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

        if (
          hasSellerItem
        ) {
          uniqueOrders.add(
            order._id.toString()
          );
        }
      }

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
        "❌ Get seller earnings error:",
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
// 13. SELLER ANALYTICS
// ============================================================

const getSellerAnalytics =
  async (
    req,
    res
  ) => {
    try {
      const seller =
        await requireSellerAccount(
          req,
          res
        );

      if (!seller) {
        return;
      }

      const period =
        req.query.period ||
        "today";

      const dateFilter =
        getDateFilter(
          period
        );

      const filter = {
        sellerId:
          seller._id,
        ...dateFilter,
      };

      const [
        totalProducts,
        activeProducts,
        soldProducts,
      ] = await Promise.all([
        Product.countDocuments(
          filter
        ),

        Product.countDocuments({
          ...filter,
          status: "active",
        }),

        Product.countDocuments({
          ...filter,
          status: "sold",
        }),
      ]);

      const products =
        await Product.find(
          filter
        )
          .select(
            "views clicks favorites"
          )
          .lean();

      let totalViews = 0;
      let totalClicks = 0;
      let totalFavorites = 0;

      for (
        const product of products
      ) {
        totalViews +=
          Number(
            product.views || 0
          );

        totalClicks +=
          Number(
            product.clicks || 0
          );

        totalFavorites +=
          Number(
            product.favorites || 0
          );
      }

      return res.json({
        success: true,

        analytics: {
          period,

          products:
            totalProducts,

          activeProducts,

          soldProducts,

          views:
            totalViews,

          clicks:
            totalClicks,

          favorites:
            totalFavorites,
        },
      });
    } catch (error) {
      console.error(
        "❌ Get seller analytics error:",
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
// 14. PUBLIC SELLER PROFILE
// ============================================================

const getPublicSellerProfile =
  async (
    req,
    res
  ) => {
    try {
      const {
        sellerId,
      } = req.params;

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
        await User.findOne({
          _id: sellerId,
          role: {
            $in: [
              "seller",
              "admin",
            ],
          },
        })
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
              "isVerified",
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

      const productsCount =
        await Product.countDocuments({
          sellerId:
            seller._id,
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

        isVerified:
          seller.isVerified === true,

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

        createdAt:
          seller.createdAt ||
          null,

        sellerSince:
          seller.sellerSince ||
          null,

        memberSince,

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

          shopName:
            publicProfile.shopName,

          avatar:
            publicProfile.avatar,

          location:
            publicProfile.location,

          memberSince:
            publicProfile.memberSince,

          isOnline:
            publicProfile.isOnline,

          isVerified:
            publicProfile.isVerified,

          productsCount:
            publicProfile.productsCount,
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
          "Failed to fetch seller profile.",
      });
    }
  };

// ============================================================
// 15. PUBLIC SELLER PRODUCTS
// ============================================================

const getPublicSellerProducts =
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
        limit,
        50
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
          "Failed to fetch seller products.",
      });
    }
  };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  registerSeller,

  getSellerProfile,

  updateSellerProfile,

  getSellerDashboard,

  getMyProducts,

  createProductSeller,

  updateProductSeller,

  deleteProductSeller,

  getSellerOrders,

  getSellerOrderById,

  updateSellerOrderStatus,

  getSellerEarnings,

  getSellerAnalytics,

  getPublicSellerProfile,

  getPublicSellerProducts,
};