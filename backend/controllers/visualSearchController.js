// ============================================================
// backend/controllers/visualSearchController.js
// BuyUKUsed Visual Search Controller
// ============================================================

const Product = require("../models/Product");

// ============================================================
// POST /api/visual-search
// Visual product search using an uploaded image
// ============================================================

const visualSearch = async (req, res) => {
  try {
    // ----------------------------------------------------------
    // Make sure an image was uploaded
    // ----------------------------------------------------------
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    // ----------------------------------------------------------
    // Optional search filters
    // ----------------------------------------------------------
    const {
      category,
      location,
      minPrice,
      maxPrice,
      limit = 20,
    } = req.body;

    // ----------------------------------------------------------
    // Build MongoDB query
    // ----------------------------------------------------------
    const query = {
      isActive: { $ne: false },
    };

    // Category filter
    if (category && category.trim()) {
      query.category = category.trim();
    }

    // Location filter
    if (location && location.trim()) {
      query.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    // Minimum price
    if (minPrice !== undefined && minPrice !== "") {
      const parsedMinPrice = Number(minPrice);

      if (!Number.isNaN(parsedMinPrice)) {
        query.price = {
          ...(query.price || {}),
          $gte: parsedMinPrice,
        };
      }
    }

    // Maximum price
    if (maxPrice !== undefined && maxPrice !== "") {
      const parsedMaxPrice = Number(maxPrice);

      if (!Number.isNaN(parsedMaxPrice)) {
        query.price = {
          ...(query.price || {}),
          $lte: parsedMaxPrice,
        };
      }
    }

    // ----------------------------------------------------------
    // Limit protection
    // ----------------------------------------------------------
    const parsedLimit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    // ----------------------------------------------------------
    // IMPORTANT
    //
    // At this stage we return products based on the optional
    // filters. The uploaded image is accepted and can later be
    // connected to an AI/image-similarity service.
    //
    // This prevents the route from crashing while keeping the
    // visual-search API ready for AI matching.
    // ----------------------------------------------------------

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();

    // ----------------------------------------------------------
    // Return results
    // ----------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Visual search completed.",
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Visual search error:", error);

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
// EXPORTS
// ============================================================

module.exports = {
  visualSearch,
};