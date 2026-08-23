// ============================================================
// backend/controllers/visualSearchController.js
// BuyUKUsed Visual Search Controller
// ============================================================

const Product = require("../models/Product");

// ============================================================
// HELPERS
// ============================================================

const cleanString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const toNumber = (value, defaultValue = null) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : defaultValue;
};

// ============================================================
// VISUAL SEARCH
// ============================================================
//
// POST /api/visual-search
//
// Form-data:
// image = uploaded image
//
// Optional:
// category
// location
// minPrice
// maxPrice
// limit
//
// ============================================================

const visualSearch = async (req, res) => {
  try {
    // ========================================================
    // IMAGE REQUIRED
    // ========================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "An image is required for visual search.",
      });
    }

    // ========================================================
    // REQUEST OPTIONS
    // ========================================================

    const category = cleanString(req.body?.category);
    const location = cleanString(req.body?.location);

    const minPrice = toNumber(
      req.body?.minPrice
    );

    const maxPrice = toNumber(
      req.body?.maxPrice
    );

    const limit = Math.min(
      Math.max(
        Number(req.body?.limit) || 20,
        1
      ),
      50
    );

    // ========================================================
    // BASE FILTER
    // ========================================================

    const filter = {
      isActive: true,
      isSold: false,
    };

    // ========================================================
    // CATEGORY
    // ========================================================

    if (category) {
      const allowedCategories = [
        "Phones",
        "Laptops",
        "Tablets",
        "Accessories",
        "Electronics",
        "Game Consoles",
        "Smartwatches",
        "TVs",
        "Cars",
        "Cosmetics",
      ];

      const matchedCategory =
        allowedCategories.find(
          (item) =>
            item.toLowerCase() ===
            category.toLowerCase()
        );

      if (!matchedCategory) {
        return res.status(400).json({
          success: false,
          message: "Invalid category.",
        });
      }

      filter.category = matchedCategory;
    }

    // ========================================================
    // LOCATION
    // ========================================================

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // ========================================================
    // PRICE RANGE
    // ========================================================

    if (
      minPrice !== null ||
      maxPrice !== null
    ) {
      filter.price = {};

      if (minPrice !== null) {
        if (minPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Minimum price cannot be negative.",
          });
        }

        filter.price.$gte = minPrice;
      }

      if (maxPrice !== null) {
        if (maxPrice < 0) {
          return res.status(400).json({
            success: false,
            message: "Maximum price cannot be negative.",
          });
        }

        filter.price.$lte = maxPrice;
      }

      if (
        minPrice !== null &&
        maxPrice !== null &&
        minPrice > maxPrice
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Minimum price cannot be greater than maximum price.",
        });
      }
    }

    // ========================================================
    // VISUAL SEARCH PLACEHOLDER
    // ========================================================
    //
    // For now, the uploaded image is accepted successfully
    // and the database is searched using the supplied filters.
    //
    // Later this can be connected to:
    //
    // - Cloudinary image analysis
    // - OpenAI vision
    // - CLIP
    // - Google Vision
    // - another image embedding service
    //
    // ========================================================

    const products = await Product.find(filter)
      .populate(
        "sellerId",
        "name email phone"
      )
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .lean();

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Visual search completed successfully.",
      search: {
        category: category || null,
        location: location || null,
        minPrice,
        maxPrice,
        limit,
      },
      products,
      count: products.length,
    });
  } catch (error) {
    console.error(
      "❌ VISUAL SEARCH ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Visual search failed.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  visualSearch,
};