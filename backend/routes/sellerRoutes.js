// ============================================================
// backend/routes/sellerRoutes.js
// BuyUKUsed - Public Seller Routes
// ============================================================

const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Product = require("../models/Product");

const router = express.Router();

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const safeNumber = (value, fallback, min, max) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    Math.max(Math.floor(number), min),
    max
  );
};

// ============================================================
// GET PUBLIC SELLER PROFILE
//
// GET /api/sellers/:sellerId
// ============================================================

router.get("/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required.",
      });
    }

    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID.",
      });
    }

    const seller = await User.findById(sellerId)
      .select(
        [
          "_id",
          "name",
          "email",
          "phone",
          "profileImage",
          "photo",
          "avatar",
          "picture",
          "role",
          "location",
          "city",
          "bio",
          "description",
          "createdAt",
          "updatedAt",
          "isActive",
        ].join(" ")
      )
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    // Do not expose inactive accounts publicly.
    if (seller.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    // Only sellers/admins should be publicly treated as sellers.
    if (
      seller.role !== "seller" &&
      seller.role !== "admin"
    ) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    // --------------------------------------------------------
    // PRODUCT STATISTICS
    // --------------------------------------------------------

    const productFilter = {
      sellerId: seller._id,
    };

    const productCount =
      await Product.countDocuments(productFilter);

    // --------------------------------------------------------
    // REVIEW STATISTICS
    //
    // Keep this independent so missing review model does not
    // break the seller profile endpoint.
    // --------------------------------------------------------

    let reviewCount = 0;
    let averageRating = 0;

    try {
      const Review = require("../models/Review");

      const reviewStats =
        await Review.aggregate([
          {
            $match: {
              sellerId: seller._id,
            },
          },
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
              average: {
                $avg: "$rating",
              },
            },
          },
        ]);

      if (reviewStats.length > 0) {
        reviewCount =
          Number(reviewStats[0].count) || 0;

        averageRating =
          Number(reviewStats[0].average) || 0;
      }
    } catch {
      // Review model/field structure should never
      // prevent the seller profile from loading.
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.json({
      success: true,

      seller: {
        ...seller,

        productCount,

        reviewCount,

        averageRating:
          Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error(
      "❌ Public seller profile error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load seller profile.",
    });
  }
});

// ============================================================
// GET PUBLIC SELLER PRODUCTS
//
// GET /api/sellers/:sellerId/products
// ============================================================

router.get(
  "/:sellerId/products",
  async (req, res) => {
    try {
      const { sellerId } = req.params;

      if (!sellerId) {
        return res.status(400).json({
          success: false,
          message: "Seller ID is required.",
        });
      }

      if (!isValidObjectId(sellerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid seller ID.",
        });
      }

      // ------------------------------------------------------
      // VERIFY SELLER
      // ------------------------------------------------------

      const seller = await User.findById(sellerId)
        .select("_id name role isActive")
        .lean();

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller not found.",
        });
      }

      if (seller.isActive === false) {
        return res.status(404).json({
          success: false,
          message: "Seller not found.",
        });
      }

      if (
        seller.role !== "seller" &&
        seller.role !== "admin"
      ) {
        return res.status(404).json({
          success: false,
          message: "Seller not found.",
        });
      }

      // ------------------------------------------------------
      // PAGINATION
      // ------------------------------------------------------

      const page = safeNumber(
        req.query.page,
        1,
        1,
        100000
      );

      const limit = safeNumber(
        req.query.limit,
        20,
        1,
        100
      );

      const skip = (page - 1) * limit;

      // ------------------------------------------------------
      // SORT
      // ------------------------------------------------------

      const sortQuery =
        String(req.query.sort || "-createdAt");

      let sort = {
        createdAt: -1,
      };

      if (sortQuery === "createdAt") {
        sort = {
          createdAt: 1,
        };
      }

      if (sortQuery === "-createdAt") {
        sort = {
          createdAt: -1,
        };
      }

      if (sortQuery === "price") {
        sort = {
          price: 1,
        };
      }

      if (sortQuery === "-price") {
        sort = {
          price: -1,
        };
      }

      // ------------------------------------------------------
      // PRODUCT FILTER
      // ------------------------------------------------------

      const filter = {
        sellerId: seller._id,
      };

      // If your Product model uses isActive,
      // only return active listings.
      //
      // We deliberately don't force isActive here because
      // older products in your database may not have the field.

      // ------------------------------------------------------
      // QUERY
      // ------------------------------------------------------

      const [products, total] =
        await Promise.all([
          Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

          Product.countDocuments(filter),
        ]);

      const totalPages =
        Math.max(
          1,
          Math.ceil(total / limit)
        );

      // ------------------------------------------------------
      // RESPONSE
      // ------------------------------------------------------

      return res.json({
        success: true,

        seller: {
          _id: seller._id,
          name: seller.name,
        },

        products,

        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage:
            page < totalPages,
          hasPreviousPage:
            page > 1,
        },
      });
    } catch (error) {
      console.error(
        "❌ Public seller products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to load seller products.",
      });
    }
  }
);

module.exports = router;