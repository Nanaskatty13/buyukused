// backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

// ============================================================
// OPTIONAL MIDDLEWARE
// ============================================================

// If you already have authentication middleware, replace this
// with your existing middleware, for example:
//
// const { protect } = require("../middleware/authMiddleware");

// ============================================================
// GET ALL PRODUCTS
// GET /api/products
// ============================================================

router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      status,
      sellerId,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const filter = {};

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    // Public marketplace should normally show active products.
    if (status) {
      filter.status = status;
    } else {
      filter.status = "active";
    }

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    if (
      category &&
      category !== "all" &&
      category.trim() !== ""
    ) {
      filter.category = category.trim();
    }

    // ----------------------------------------------------------
    // LOCATION
    // ----------------------------------------------------------

    if (
      location &&
      location !== "all" &&
      location.trim() !== ""
    ) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    // ----------------------------------------------------------
    // SELLER
    // ----------------------------------------------------------

    if (sellerId) {
      filter.sellerId = sellerId;
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search && search.trim() !== "") {
      const searchText = search.trim();

      filter.$or = [
        {
          title: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          model: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          category: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          location: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    // ----------------------------------------------------------
    // PAGINATION
    // ----------------------------------------------------------

    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const requestedLimit = Math.max(
      parseInt(limit, 10) || 20,
      1
    );

    const itemsPerPage = Math.min(
      requestedLimit,
      100
    );

    const skip =
      (currentPage - 1) * itemsPerPage;

    // ----------------------------------------------------------
    // SORTING
    // ----------------------------------------------------------

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "price-low":
        sortOption = {
          price: 1,
        };
        break;

      case "price-high":
        sortOption = {
          price: -1,
        };
        break;

      case "views":
        sortOption = {
          views: -1,
        };
        break;

      case "newest":
      default:
        sortOption = {
          createdAt: -1,
        };
        break;
    }

    // ----------------------------------------------------------
    // DATABASE QUERY
    // ----------------------------------------------------------

    const [products, total] =
      await Promise.all([
        Product.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(itemsPerPage)
          .lean(),

        Product.countDocuments(filter),
      ]);

    const totalPages = Math.ceil(
      total / itemsPerPage
    );

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages,
        hasNextPage:
          currentPage < totalPages,
        hasPreviousPage:
          currentPage > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
});

// ============================================================
// GET PRODUCT BY ID
// GET /api/products/:id
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // ----------------------------------------------------------
    // INCREMENT VIEWS
    // ----------------------------------------------------------

    await Product.findByIdAndUpdate(
      id,
      {
        $inc: {
          views: 1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      product: {
        ...product,
        views: (product.views || 0) + 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get product error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }
});

// ============================================================
// CREATE PRODUCT
// POST /api/products
// ============================================================

router.post("/", async (req, res) => {
  try {
    const {
      title,
      price,
      oldPrice,
      category,
      location,
      description,
      sellerId,
      sellerName,
      sellerPhone,
      image,
      images,
      videos,
      brand,
      model,
      condition,
      storage,
      ram,
      color,
      promo,
      verified,
      yearsOnPlatform,
      negotiation,
      swapAccepted,
      batteryHealth,
      faceId,
      simStatus,
      status,
    } = req.body;

    // ----------------------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------------------

    if (!title || String(title).trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Product title is required.",
      });
    }

    if (
      price === undefined ||
      price === null ||
      Number.isNaN(Number(price))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid product price is required.",
      });
    }

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required.",
      });
    }

    // ----------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------

    const product = await Product.create({
      title: String(title).trim(),

      price: Number(price),

      oldPrice:
        oldPrice !== undefined &&
        oldPrice !== null &&
        oldPrice !== ""
          ? Number(oldPrice)
          : null,

      category:
        category || "Other",

      location:
        location || "Ghana",

      description:
        description || "",

      sellerId,

      sellerName:
        sellerName || "",

      sellerPhone:
        sellerPhone || "",

      image:
        image || "",

      images:
        Array.isArray(images)
          ? images
          : [],

      videos:
        Array.isArray(videos)
          ? videos
          : [],

      brand:
        brand || "",

      model:
        model || "",

      condition:
        condition || "Good",

      storage:
        storage || "",

      ram:
        ram || "",

      color:
        color || "",

      promo:
        Boolean(promo),

      verified:
        Boolean(verified),

      yearsOnPlatform:
        Number(yearsOnPlatform) || 0,

      negotiation:
        Boolean(negotiation),

      swapAccepted:
        Boolean(swapAccepted),

      batteryHealth:
        batteryHealth !== undefined &&
        batteryHealth !== null &&
        batteryHealth !== ""
          ? Number(batteryHealth)
          : null,

      faceId:
        faceId || "",

      simStatus:
        simStatus || "",

      status:
        status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "❌ Create product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create product.",
    });
  }
});

// ============================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ============================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "title",
      "price",
      "oldPrice",
      "category",
      "location",
      "description",
      "sellerName",
      "sellerPhone",
      "image",
      "images",
      "videos",
      "brand",
      "model",
      "condition",
      "storage",
      "ram",
      "color",
      "promo",
      "verified",
      "yearsOnPlatform",
      "negotiation",
      "swapAccepted",
      "batteryHealth",
      "faceId",
      "simStatus",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (
        req.body[field] !== undefined
      ) {
        updates[field] =
          req.body[field];
      }
    }

    if (
      updates.price !== undefined
    ) {
      updates.price =
        Number(updates.price);
    }

    if (
      updates.oldPrice !== undefined &&
      updates.oldPrice !== null &&
      updates.oldPrice !== ""
    ) {
      updates.oldPrice =
        Number(updates.oldPrice);
    }

    if (
      updates.batteryHealth !==
        undefined &&
      updates.batteryHealth !== null &&
      updates.batteryHealth !== ""
    ) {
      updates.batteryHealth =
        Number(
          updates.batteryHealth
        );
    }

    if (
      updates.yearsOnPlatform !==
      undefined
    ) {
      updates.yearsOnPlatform =
        Number(
          updates.yearsOnPlatform
        ) || 0;
    }

    const product =
      await Product.findByIdAndUpdate(
        id,
        {
          $set: updates,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "❌ Update product error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to update product.",
    });
  }
});

// ============================================================
// UPDATE PRODUCT STATUS
// PATCH /api/products/:id/status
// ============================================================

router.patch(
  "/:id/status",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = [
        "active",
        "pending",
        "inactive",
        "sold",
      ];

      if (
        !validStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product status.",
        });
      }

      const product =
        await Product.findByIdAndUpdate(
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
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Product status updated successfully.",
        product,
      });
    } catch (error) {
      console.error(
        "❌ Update product status error:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          "Failed to update product status.",
      });
    }
  }
);

// ============================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ============================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ Delete product error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: "Invalid product ID.",
    });
  }
});

module.exports = router;