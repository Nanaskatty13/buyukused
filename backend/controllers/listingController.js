// ============================================================
// backend/controllers/listingController.js
// BuyUKUsed - Listing Controller
// ============================================================
//
// This controller provides the legacy /api/listings API while
// using the existing Product model.
//
// Supported:
//   GET    /api/listings
//   GET    /api/listings/:id
//   GET    /api/listings/my
//   POST   /api/listings
//   PUT    /api/listings/:id
//   PATCH  /api/listings/:id/status
//   DELETE /api/listings/:id
//
// ============================================================

const mongoose = require("mongoose");
const Product = require("../models/Product");

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getUserId = (req) => {
  return (
    req.userId ||
    req.user?._id?.toString() ||
    req.user?.id?.toString() ||
    null
  );
};

const isAdmin = (req) => {
  return req.user?.role === "admin";
};

// ============================================================
// GET LISTINGS
// ============================================================
//
// GET /api/listings
//
// Public.
//
// Query:
//   page
//   limit
//   search
//   category
//   location
//
// ============================================================

const getListings = async (req, res) => {
  try {
    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) || 20,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    const filter = {};

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (req.query.search) {
      const search = String(
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
        ];
      }
    }

    // ----------------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------------

    if (req.query.category) {
      filter.category =
        String(req.query.category).trim();
    }

    // ----------------------------------------------------------
    // LOCATION
    // ----------------------------------------------------------

    if (req.query.location) {
      filter.location = {
        $regex:
          String(
            req.query.location
          ).trim(),
        $options: "i",
      };
    }

    // ----------------------------------------------------------
    // QUERY DATABASE
    // ----------------------------------------------------------

    const [products, total] =
      await Promise.all([
        Product.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Product.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      listings: products,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
        hasNextPage:
          page <
          Math.ceil(total / limit),
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ GET /api/listings failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch listings.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// GET LISTING BY ID
// ============================================================
//
// GET /api/listings/:id
//
// Public.
//
// ============================================================

const getListingById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID.",
      });
    }

    const product =
      await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Listing not found.",
      });
    }

    return res.status(200).json({
      success: true,
      listing: product,
      product,
    });
  } catch (error) {
    console.error(
      "❌ GET /api/listings/:id failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch listing.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// GET MY LISTINGS
// ============================================================
//
// GET /api/listings/my
//
// Authentication required.
//
// ============================================================

const getMyListings = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authenticated user ID.",
      });
    }

    const products =
      await Product.find({
        sellerId: userId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      listings: products,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error(
      "❌ GET /api/listings/my failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch your listings.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// CREATE LISTING
// ============================================================
//
// POST /api/listings
//
// Authentication required.
//
// Uses Product model.
//
// ============================================================

const createListing = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authenticated user ID.",
      });
    }

    const {
      title,
      price,
      oldPrice,
      category,
      location,
      description,
      sellerName,
      sellerPhone,
      image,
      images,
      videos,
      status,
    } = req.body;

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      !title ||
      !String(title).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Listing title is required.",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Listing price is required.",
      });
    }

    const numericPrice =
      Number(price);

    if (
      !Number.isFinite(
        numericPrice
      ) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Listing price must be a valid non-negative number.",
      });
    }

    // ----------------------------------------------------------
    // UPLOADED FILES
    // ----------------------------------------------------------

    let uploadedImages =
      Array.isArray(images)
        ? images
        : [];

    let uploadedVideos =
      Array.isArray(videos)
        ? videos
        : [];

    if (
      req.files &&
      Array.isArray(req.files)
    ) {
      const fileUrls =
        req.files
          .map(
            (file) =>
              file.path ||
              file.secure_url ||
              file.url
          )
          .filter(Boolean);

      if (fileUrls.length) {
        uploadedImages = [
          ...uploadedImages,
          ...fileUrls,
        ];
      }
    }

    // ----------------------------------------------------------
    // CREATE PRODUCT
    // ----------------------------------------------------------

    const product =
      new Product({
        title:
          String(title).trim(),

        price:
          numericPrice,

        ...(oldPrice !==
          undefined &&
          oldPrice !== ""
          ? {
              oldPrice:
                Number(oldPrice),
            }
          : {}),

        ...(category
          ? {
              category:
                String(
                  category
                ).trim(),
            }
          : {}),

        ...(location
          ? {
              location:
                String(
                  location
                ).trim(),
            }
          : {}),

        ...(description
          ? {
              description:
                String(
                  description
                ).trim(),
            }
          : {}),

        sellerId: userId,

        ...(sellerName
          ? {
              sellerName:
                String(
                  sellerName
                ).trim(),
            }
          : {}),

        ...(sellerPhone
          ? {
              sellerPhone:
                String(
                  sellerPhone
                ).trim(),
            }
          : {}),

        ...(image
          ? {
              image:
                String(image).trim(),
            }
          : {}),

        images:
          uploadedImages,

        videos:
          uploadedVideos,

        ...(status
          ? {
              status:
                String(status).trim(),
            }
          : {}),
      });

    await product.save();

    return res.status(201).json({
      success: true,
      message:
        "Listing created successfully.",
      listing: product,
      product,
    });
  } catch (error) {
    console.error(
      "============================================================"
    );
    console.error(
      "❌ CREATE LISTING ERROR"
    );
    console.error(
      "============================================================"
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "Name:",
      error.name
    );
    console.error(
      "Code:",
      error.code
    );
    console.error(
      "Stack:",
      error.stack
    );
    console.error(
      "Body:",
      req.body
    );
    console.error(
      "User:",
      req.user?._id
    );
    console.error(
      "============================================================"
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Listing validation failed.",
        errors:
          Object.fromEntries(
            Object.entries(
              error.errors || {}
            ).map(
              ([
                field,
                value,
              ]) => [
                field,
                value.message,
              ]
            )
          ),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create listing.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// UPDATE LISTING
// ============================================================
//
// PUT /api/listings/:id
//
// Owner OR admin only.
//
// ============================================================

const updateListing = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Listing not found.",
      });
    }

    // ----------------------------------------------------------
    // OWNER CHECK
    // ----------------------------------------------------------

    const ownerId =
      product.sellerId
        ? product.sellerId.toString()
        : null;

    if (
      !isAdmin(req) &&
      ownerId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only edit your own listings.",
      });
    }

    // ----------------------------------------------------------
    // ALLOWED FIELDS
    // ----------------------------------------------------------

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
    ];

    for (const field of allowedFields) {
      if (
        Object.prototype.hasOwnProperty.call(
          req.body,
          field
        )
      ) {
        product[field] =
          req.body[field];
      }
    }

    // ----------------------------------------------------------
    // FILES
    // ----------------------------------------------------------

    if (
      req.files &&
      Array.isArray(req.files) &&
      req.files.length
    ) {
      const fileUrls =
        req.files
          .map(
            (file) =>
              file.path ||
              file.secure_url ||
              file.url
          )
          .filter(Boolean);

      if (fileUrls.length) {
        product.images = [
          ...(Array.isArray(
            product.images
          )
            ? product.images
            : []),
          ...fileUrls,
        ];
      }
    }

    // ----------------------------------------------------------
    // NORMALIZE NUMBERS
    // ----------------------------------------------------------

    if (
      product.price !==
      undefined
    ) {
      const numericPrice =
        Number(product.price);

      if (
        !Number.isFinite(
          numericPrice
        ) ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Price must be a valid non-negative number.",
        });
      }

      product.price =
        numericPrice;
    }

    if (
      product.oldPrice !==
        undefined &&
      product.oldPrice !==
        null &&
      product.oldPrice !== ""
    ) {
      const numericOldPrice =
        Number(
          product.oldPrice
        );

      if (
        !Number.isFinite(
          numericOldPrice
        ) ||
        numericOldPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Old price must be a valid non-negative number.",
        });
      }

      product.oldPrice =
        numericOldPrice;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Listing updated successfully.",
      listing: product,
      product,
    });
  } catch (error) {
    console.error(
      "============================================================"
    );
    console.error(
      "❌ UPDATE LISTING ERROR"
    );
    console.error(
      "============================================================"
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "Name:",
      error.name
    );
    console.error(
      "Code:",
      error.code
    );
    console.error(
      "Stack:",
      error.stack
    );
    console.error(
      "Listing ID:",
      req.params.id
    );
    console.error(
      "User:",
      req.user?._id
    );
    console.error(
      "============================================================"
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update listing.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// UPDATE LISTING STATUS
// ============================================================
//
// PATCH /api/listings/:id/status
//
// Owner OR admin only.
//
// Accepted status values depend on the Product schema.
//
// ============================================================

const updateListingStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid listing ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Listing not found.",
      });
    }

    const ownerId =
      product.sellerId
        ? product.sellerId.toString()
        : null;

    if (
      !isAdmin(req) &&
      ownerId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only change the status of your own listings.",
      });
    }

    const newStatus =
      req.body.status;

    if (!newStatus) {
      return res.status(400).json({
        success: false,
        message:
          "Status is required.",
      });
    }

    product.status =
      String(newStatus).trim();

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Listing status updated successfully.",
      listing: product,
      product,
    });
  } catch (error) {
    console.error(
      "============================================================"
    );
    console.error(
      "❌ UPDATE LISTING STATUS ERROR"
    );
    console.error(
      "============================================================"
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "Name:",
      error.name
    );
    console.error(
      "Code:",
      error.code
    );
    console.error(
      "Stack:",
      error.stack
    );
    console.error(
      "Listing ID:",
      req.params.id
    );
    console.error(
      "Request body:",
      req.body
    );
    console.error(
      "User:",
      req.user?._id
    );
    console.error(
      "============================================================"
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update listing status.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// DELETE LISTING
// ============================================================
//
// DELETE /api/listings/:id
//
// Owner OR admin only.
//
// ============================================================

const deleteListing = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid listing ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Listing not found.",
      });
    }

    // ----------------------------------------------------------
    // OWNER-ONLY DELETE
    // ----------------------------------------------------------

    const ownerId =
      product.sellerId
        ? product.sellerId.toString()
        : null;

    if (
      !isAdmin(req) &&
      ownerId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own listings.",
      });
    }

    await Product.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "Listing deleted successfully.",
      listingId: id,
    });
  } catch (error) {
    console.error(
      "============================================================"
    );
    console.error(
      "❌ DELETE LISTING ERROR"
    );
    console.error(
      "============================================================"
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "Name:",
      error.name
    );
    console.error(
      "Code:",
      error.code
    );
    console.error(
      "Stack:",
      error.stack
    );
    console.error(
      "Listing ID:",
      req.params.id
    );
    console.error(
      "User:",
      req.user?._id
    );
    console.error(
      "============================================================"
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete listing.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getMyListings,
  updateListingStatus,
};