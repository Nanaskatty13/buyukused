// ============================================================
// backend/routes/products.js
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const streamifier = require("streamifier");

const {
  verifyToken,
  isSeller,
} = require("../middleware/auth");

const Product = require("../models/Product");
const upload = require("../config/multer");
const { cloudinary } = require("../config/cloudinary");

const router = express.Router();

// ============================================================
// CONSTANTS
// ============================================================

const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;

// ------------------------------------------------------------
// Product statuses
// ------------------------------------------------------------

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

// ------------------------------------------------------------
// Product categories
// ------------------------------------------------------------
// Keep this list synchronized with the frontend category list.
// IMPORTANT:
// "Game Consoles" and "Smartwatches" are included.
// ------------------------------------------------------------

const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "Smartwatches",
  "Game Consoles",
  "Accessories",
  "Electronics",
  "Real Estate",
  "Jobs",
  "Fashion",
  "Home",
  "Other",
];

// ------------------------------------------------------------
// Product conditions
// ------------------------------------------------------------

const VALID_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

// ------------------------------------------------------------
// Face ID statuses
// ------------------------------------------------------------

const VALID_FACE_ID = [
  "Working",
  "Not Working",
  "Not Available",
  "",
];

// ============================================================
// HELPERS
// ============================================================

// ------------------------------------------------------------
// ObjectId validation
// ------------------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ------------------------------------------------------------
// Get current authenticated user ID
// ------------------------------------------------------------

const getCurrentUserId = (req) => {
  return (
    req.userId ||
    req.user?.id ||
    req.user?._id ||
    null
  );
};

// ------------------------------------------------------------
// Get current authenticated user role
// ------------------------------------------------------------

const getCurrentUserRole = (req) => {
  return req.user?.role || null;
};

// ------------------------------------------------------------
// Boolean parser
// ------------------------------------------------------------

const parseBoolean = (
  value,
  defaultValue = false
) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    if (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes" ||
      normalized === "on"
    ) {
      return true;
    }

    if (
      normalized === "false" ||
      normalized === "0" ||
      normalized === "no" ||
      normalized === "off"
    ) {
      return false;
    }
  }

  return defaultValue;
};

// ------------------------------------------------------------
// Number parser
// ------------------------------------------------------------

const parseNumber = (
  value,
  defaultValue = null
) => {
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

// ------------------------------------------------------------
// Clean string
// ------------------------------------------------------------

const cleanString = (
  value,
  defaultValue = ""
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  return String(value).trim();
};

// ------------------------------------------------------------
// Escape regex
// ------------------------------------------------------------

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

/*
  Allows minor differences such as:

  game consoles
  Game Consoles
  GAME CONSOLES

  smartwatches
  Smartwatches

  smart watches
  Smart Watches

  The database still receives the official category name.
*/

const normalizeCategory = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const input = String(value).trim();

  if (!input) {
    return null;
  }

  const exactMatch =
    VALID_CATEGORIES.find(
      (category) =>
        category.toLowerCase() ===
        input.toLowerCase()
    );

  if (exactMatch) {
    return exactMatch;
  }

  const normalized = input
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const aliases = {
    "smart watches":
      "Smartwatches",

    smartwatch:
      "Smartwatches",

    "game console":
      "Game Consoles",

    "gaming console":
      "Game Consoles",

    "gaming consoles":
      "Game Consoles",

    console:
      "Game Consoles",

    consoles:
      "Game Consoles",

    mobile:
      "Phones",

    mobiles:
      "Phones",

    smartphones:
      "Phones",

    smartphone:
      "Phones",

    laptop:
      "Laptops",

    tablet:
      "Tablets",

    accessories:
      "Accessories",

    accessory:
      "Accessories",
  };

  return (
    aliases[normalized] ||
    null
  );
};

// ============================================================
// CONDITION NORMALIZATION
// ============================================================

const normalizeCondition = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Good";
  }

  const input = String(value).trim();

  const match =
    VALID_CONDITIONS.find(
      (condition) =>
        condition.toLowerCase() ===
        input.toLowerCase()
    );

  return match || null;
};

// ============================================================
// CLOUDINARY HELPERS
// ============================================================

// ------------------------------------------------------------
// Extract Cloudinary public ID
// ------------------------------------------------------------

const getCloudinaryPublicId = (
  url
) => {
  try {
    if (
      !url ||
      typeof url !== "string" ||
      !url.includes(
        "cloudinary.com"
      )
    ) {
      return null;
    }

    const uploadMarker =
      "/upload/";

    const uploadIndex =
      url.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = url.substring(
      uploadIndex +
        uploadMarker.length
    );

    let parts =
      publicId.split("/");

    // Remove transformation parameters.
    while (
      parts.length > 0 &&
      (
        parts[0].includes("_") ||
        parts[0].includes(",")
      )
    ) {
      parts.shift();
    }

    publicId =
      parts.join("/");

    // Remove version.
    publicId = publicId.replace(
      /^v\d+\//,
      ""
    );

    // Remove extension.
    publicId = publicId.replace(
      /\.[^/.]+$/,
      ""
    );

    return (
      publicId || null
    );
  } catch (error) {
    console.error(
      "❌ Cloudinary public ID error:",
      error.message
    );

    return null;
  }
};

// ------------------------------------------------------------
// Delete Cloudinary file
// ------------------------------------------------------------

const deleteFromCloudinary =
  async (
    fileUrl,
    resourceType = "image"
  ) => {
    try {
      const publicId =
        getCloudinaryPublicId(
          fileUrl
        );

      if (!publicId) {
        return;
      }

      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type:
            resourceType,
        }
      );

      console.log(
        `🗑️ Cloudinary deleted: ${publicId}`
      );
    } catch (error) {
      console.error(
        "❌ Cloudinary delete error:",
        error.message
      );
    }
  };

// ------------------------------------------------------------
// Upload one file to Cloudinary
// ------------------------------------------------------------

const uploadToCloudinary = (
  file
) => {
  return new Promise(
    (resolve, reject) => {
      try {
        if (
          !file ||
          !file.buffer
        ) {
          return reject(
            new Error(
              "Invalid file buffer"
            )
          );
        }

        const isVideo =
          file.mimetype &&
          file.mimetype.startsWith(
            "video/"
          );

        const resourceType =
          isVideo
            ? "video"
            : "image";

        const folder =
          isVideo
            ? "kn-classifieds/videos"
            : "kn-classifieds/images";

        const publicId =
          `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}`;

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type:
                resourceType,
              public_id:
                publicId,
            },
            (
              error,
              result
            ) => {
              if (error) {
                console.error(
                  "❌ Cloudinary upload error:",
                  error
                );

                return reject(error);
              }

              resolve({
                result,
                resourceType,
              });
            }
          );

        streamifier
          .createReadStream(
            file.buffer
          )
          .pipe(uploadStream);
      } catch (error) {
        reject(error);
      }
    }
  );
};

// ------------------------------------------------------------
// Upload multiple files
// ------------------------------------------------------------

const uploadFiles = async (
  files
) => {
  const safeFiles =
    Array.isArray(files)
      ? files
      : [];

  const imageFiles =
    safeFiles
      .filter(
        (file) =>
          file?.mimetype &&
          file.mimetype.startsWith(
            "image/"
          )
      )
      .slice(0, MAX_IMAGES);

  const videoFiles =
    safeFiles
      .filter(
        (file) =>
          file?.mimetype &&
          file.mimetype.startsWith(
            "video/"
          )
      )
      .slice(0, MAX_VIDEOS);

  const imageResults =
    await Promise.all(
      imageFiles.map(
        uploadToCloudinary
      )
    );

  const videoResults =
    await Promise.all(
      videoFiles.map(
        uploadToCloudinary
      )
    );

  const images =
    imageResults
      .map(
        (item) =>
          item.result?.secure_url
      )
      .filter(Boolean);

  const videos =
    videoResults
      .map(
        (item) =>
          item.result?.secure_url
      )
      .filter(Boolean);

  return {
    images,
    videos,
  };
};

// ============================================================
// JSON ARRAY PARSER
// ============================================================

const parseJsonArray = (
  value,
  fieldName
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    if (!Array.isArray(parsed)) {
      throw new Error(
        `${fieldName} must be an array`
      );
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `${fieldName} must be valid JSON`
    );
  }
};

// ============================================================
// CLEAN URL ARRAY
// ============================================================

const cleanUrlArray = (
  value
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (url) =>
        typeof url ===
          "string" &&
        url.trim()
    )
    .map((url) =>
      url.trim()
    );
};

// ============================================================
// TEST ROUTE
// ============================================================

router.get(
  "/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Products router is alive!",
      categories:
        VALID_CATEGORIES,
    });
  }
);

// ============================================================
// GET AVAILABLE CATEGORIES
// ============================================================

router.get(
  "/categories",
  (req, res) => {
    res.json({
      success: true,
      categories:
        VALID_CATEGORIES,
    });
  }
);

// ============================================================
// GET ALL PRODUCTS
// ============================================================

router.get(
  "/",
  async (req, res) => {
    try {
      const {
        category,
        location,
        search,
        sellerId,
        status,
        page = 1,
        limit = 20,
      } = req.query;

      const filter = {};

      // --------------------------------------------------------
      // Category
      // --------------------------------------------------------

      if (
        category &&
        category !== "all"
      ) {
        const normalizedCategory =
          normalizeCategory(
            category
          );

        if (
          !normalizedCategory
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product category: ${category}`,
            validCategories:
              VALID_CATEGORIES,
          });
        }

        filter.category =
          normalizedCategory;
      }

      // --------------------------------------------------------
      // Location
      // --------------------------------------------------------

      if (
        location &&
        location !== "all"
      ) {
        filter.location =
          cleanString(location);
      }

      // --------------------------------------------------------
      // Seller
      // --------------------------------------------------------

      if (sellerId) {
        if (
          !isValidObjectId(
            sellerId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid seller ID",
          });
        }

        filter.sellerId =
          sellerId;
      }

      // --------------------------------------------------------
      // Status
      // --------------------------------------------------------

      if (status) {
        if (
          !VALID_STATUSES.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product status",
            validStatuses:
              VALID_STATUSES,
          });
        }

        filter.status =
          status;
      }

      // --------------------------------------------------------
      // Search
      // --------------------------------------------------------

      if (
        search &&
        String(search).trim()
      ) {
        const escapedSearch =
          escapeRegex(
            String(search).trim()
          );

        filter.$or = [
          {
            title: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
          {
            description: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
          {
            brand: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
          {
            model: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
          {
            category: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
        ];
      }

      // --------------------------------------------------------
      // Pagination
      // --------------------------------------------------------

      const parsedLimit =
        Math.min(
          Math.max(
            parseInt(
              limit,
              10
            ) || 20,
            1
          ),
          100
        );

      const parsedPage =
        Math.max(
          parseInt(
            page,
            10
          ) || 1,
          1
        );

      const skip =
        (parsedPage - 1) *
        parsedLimit;

      // --------------------------------------------------------
      // Query
      // --------------------------------------------------------

      const [
        products,
        total,
      ] = await Promise.all([
        Product.find(filter)
          .populate(
            "sellerId",
            "name phone email location avatar role"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(parsedLimit)
          .lean(),

        Product.countDocuments(
          filter
        ),
      ]);

      const totalPages =
        Math.ceil(
          total /
            parsedLimit
        );

      res.json({
        success: true,
        products,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages,
        pagination: {
          currentPage:
            parsedPage,
          totalPages,
          totalProducts:
            total,
          limit:
            parsedLimit,
        },
      });
    } catch (error) {
      console.error(
        "❌ Error fetching products:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch products",
      });
    }
  }
);

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

router.get(
  "/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const product =
        await Product.findById(
          id
        ).populate(
          "sellerId",
          "name phone email location avatar role"
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Increment views
      // --------------------------------------------------------

      product.views =
        (product.views || 0) + 1;

      await product.save();

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Error fetching product:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch product",
      });
    }
  }
);

// ============================================================
// CREATE PRODUCT
// ============================================================

router.post(
  "/",
  verifyToken,
  isSeller,
  upload.array(
    "files",
    MAX_IMAGES + MAX_VIDEOS
  ),
  async (req, res) => {
    try {
      console.log(
        "📩 POST /api/products received"
      );

      console.log(
        "👤 User:",
        req.userId ||
          req.user?.id ||
          req.user?._id
      );

      console.log(
        "📦 Files:",
        req.files?.length || 0
      );

      const sellerId =
        getCurrentUserId(req);

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
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
        brand,
        model,
        ram,
        storage,
        color,
        condition,
        negotiation,
        swapAccepted,
        simStatus,
        batteryHealth,
        faceId,
      } = req.body;

      // --------------------------------------------------------
      // Title
      // --------------------------------------------------------

      const cleanTitle =
        cleanString(title);

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required",
        });
      }

      // --------------------------------------------------------
      // Price
      // --------------------------------------------------------

      const parsedPrice =
        parseNumber(price);

      if (
        parsedPrice === null ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid product price is required",
        });
      }

      // --------------------------------------------------------
      // Old price
      // --------------------------------------------------------

      let parsedOldPrice = null;

      if (
        oldPrice !==
          undefined &&
        oldPrice !== ""
      ) {
        parsedOldPrice =
          parseNumber(
            oldPrice
          );

        if (
          parsedOldPrice ===
            null ||
          parsedOldPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid old price",
          });
        }
      }

      // --------------------------------------------------------
      // Seller phone
      // --------------------------------------------------------

      const cleanSellerPhone =
        cleanString(
          sellerPhone
        );

      if (!cleanSellerPhone) {
        return res.status(400).json({
          success: false,
          message:
            "Seller phone number is required",
        });
      }

      // --------------------------------------------------------
      // Category
      // --------------------------------------------------------

      const selectedCategory =
        normalizeCategory(
          category || "Other"
        );

      if (!selectedCategory) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product category: ${category}`,
          validCategories:
            VALID_CATEGORIES,
        });
      }

      // --------------------------------------------------------
      // Condition
      // --------------------------------------------------------

      const selectedCondition =
        normalizeCondition(
          condition
        );

      if (!selectedCondition) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product condition: ${condition}`,
          validConditions:
            VALID_CONDITIONS,
        });
      }

      // --------------------------------------------------------
      // Battery health
      // --------------------------------------------------------

      let parsedBatteryHealth =
        null;

      if (
        batteryHealth !==
          undefined &&
        batteryHealth !== ""
      ) {
        parsedBatteryHealth =
          parseNumber(
            batteryHealth
          );

        if (
          parsedBatteryHealth ===
            null ||
          parsedBatteryHealth <
            0 ||
          parsedBatteryHealth >
            100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Battery health must be between 0 and 100",
          });
        }
      }

      // --------------------------------------------------------
      // Face ID
      // --------------------------------------------------------

      const selectedFaceId =
        cleanString(
          faceId
        );

      if (
        !VALID_FACE_ID.includes(
          selectedFaceId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Face ID status",
        });
      }

      // --------------------------------------------------------
      // Upload files
      // --------------------------------------------------------

      const {
        images,
        videos,
      } = await uploadFiles(
        req.files || []
      );

      console.log(
        "🖼️ Images uploaded:",
        images.length
      );

      console.log(
        "🎬 Videos uploaded:",
        videos.length
      );

      // --------------------------------------------------------
      // Product data
      // --------------------------------------------------------

      const productData = {
        title:
          cleanTitle,

        price:
          parsedPrice,

        oldPrice:
          parsedOldPrice,

        category:
          selectedCategory,

        location:
          cleanString(
            location,
            "Ghana"
          ) || "Ghana",

        description:
          cleanString(
            description
          ),

        sellerId,

        sellerName:
          cleanString(
            sellerName
          ) ||
          cleanString(
            req.user?.name
          ),

        sellerPhone:
          cleanSellerPhone,

        brand:
          cleanString(
            brand
          ),

        model:
          cleanString(
            model
          ),

        ram:
          cleanString(
            ram
          ),

        storage:
          cleanString(
            storage
          ),

        color:
          cleanString(
            color
          ),

        condition:
          selectedCondition,

        negotiation:
          parseBoolean(
            negotiation
          ),

        swapAccepted:
          parseBoolean(
            swapAccepted
          ),

        simStatus:
          cleanString(
            simStatus
          ),

        batteryHealth:
          parsedBatteryHealth,

        faceId:
          selectedFaceId,

        images,

        videos,

        // Legacy single image field.
        image:
          images.length > 0
            ? images[0]
            : "",

        status:
          "active",
      };

      // --------------------------------------------------------
      // Save
      // --------------------------------------------------------

      const product =
        await Product.create(
          productData
        );

      console.log(
        `✅ Product created: ${product._id}`
      );

      res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        product,
      });
    } catch (error) {
      console.error(
        "❌ Error creating product:",
        error
      );

      // --------------------------------------------------------
      // Mongoose validation error
      // --------------------------------------------------------

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors:
            Object.values(
              error.errors
            ).map(
              (err) => err.message
            ),
        });
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create product",
      });
    }
  }
);

// ============================================================
// UPDATE PRODUCT
// ============================================================

router.put(
  "/:id",
  verifyToken,
  upload.array(
    "files",
    MAX_IMAGES + MAX_VIDEOS
  ),
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const currentUserId =
        getCurrentUserId(req);

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const isOwner =
        product.sellerId &&
        product.sellerId
          .toString() ===
          currentUserId.toString();

      const isAdmin =
        getCurrentUserRole(req) ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to update this product",
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
        brand,
        model,
        ram,
        storage,
        color,
        condition,
        negotiation,
        swapAccepted,
        simStatus,
        batteryHealth,
        faceId,
        status,
      } = req.body;

      // --------------------------------------------------------
      // Title
      // --------------------------------------------------------

      if (
        title !== undefined
      ) {
        const cleanTitle =
          cleanString(title);

        if (!cleanTitle) {
          return res.status(400).json({
            success: false,
            message:
              "Product title cannot be empty",
          });
        }

        product.title =
          cleanTitle;
      }

      // --------------------------------------------------------
      // Price
      // --------------------------------------------------------

      if (
        price !== undefined &&
        price !== ""
      ) {
        const parsedPrice =
          parseNumber(price);

        if (
          parsedPrice ===
            null ||
          parsedPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid price",
          });
        }

        product.price =
          parsedPrice;
      }

      // --------------------------------------------------------
      // Old price
      // --------------------------------------------------------

      if (
        oldPrice !== undefined
      ) {
        if (oldPrice === "") {
          product.oldPrice =
            null;
        } else {
          const parsedOldPrice =
            parseNumber(
              oldPrice
            );

          if (
            parsedOldPrice ===
              null ||
            parsedOldPrice < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid old price",
            });
          }

          product.oldPrice =
            parsedOldPrice;
        }
      }

      // --------------------------------------------------------
      // Category
      // --------------------------------------------------------

      if (
        category !== undefined
      ) {
        const normalizedCategory =
          normalizeCategory(
            category
          );

        if (
          !normalizedCategory
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product category: ${category}`,
            validCategories:
              VALID_CATEGORIES,
          });
        }

        product.category =
          normalizedCategory;
      }

      // --------------------------------------------------------
      // Location
      // --------------------------------------------------------

      if (
        location !== undefined
      ) {
        product.location =
          cleanString(
            location
          );
      }

      // --------------------------------------------------------
      // Description
      // --------------------------------------------------------

      if (
        description !==
        undefined
      ) {
        product.description =
          cleanString(
            description
          );
      }

      // --------------------------------------------------------
      // Seller name
      // --------------------------------------------------------

      if (
        sellerName !==
        undefined
      ) {
        product.sellerName =
          cleanString(
            sellerName
          );
      }

      // --------------------------------------------------------
      // Seller phone
      // --------------------------------------------------------

      if (
        sellerPhone !==
        undefined
      ) {
        const phone =
          cleanString(
            sellerPhone
          );

        if (!phone) {
          return res.status(400).json({
            success: false,
            message:
              "Seller phone number cannot be empty",
          });
        }

        product.sellerPhone =
          phone;
      }

      // --------------------------------------------------------
      // Brand
      // --------------------------------------------------------

      if (
        brand !== undefined
      ) {
        product.brand =
          cleanString(
            brand
          );
      }

      // --------------------------------------------------------
      // Model
      // --------------------------------------------------------

      if (
        model !== undefined
      ) {
        product.model =
          cleanString(
            model
          );
      }

      // --------------------------------------------------------
      // RAM
      // --------------------------------------------------------

      if (
        ram !== undefined
      ) {
        product.ram =
          cleanString(
            ram
          );
      }

      // --------------------------------------------------------
      // Storage
      // --------------------------------------------------------

      if (
        storage !== undefined
      ) {
        product.storage =
          cleanString(
            storage
          );
      }

      // --------------------------------------------------------
      // Color
      // --------------------------------------------------------

      if (
        color !== undefined
      ) {
        product.color =
          cleanString(
            color
          );
      }

      // --------------------------------------------------------
      // Condition
      // --------------------------------------------------------

      if (
        condition !== undefined
      ) {
        const normalizedCondition =
          normalizeCondition(
            condition
          );

        if (
          !normalizedCondition
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product condition: ${condition}`,
            validConditions:
              VALID_CONDITIONS,
          });
        }

        product.condition =
          normalizedCondition;
      }

      // --------------------------------------------------------
      // Negotiation
      // --------------------------------------------------------

      if (
        negotiation !==
        undefined
      ) {
        product.negotiation =
          parseBoolean(
            negotiation
          );
      }

      // --------------------------------------------------------
      // Swap accepted
      // --------------------------------------------------------

      if (
        swapAccepted !==
        undefined
      ) {
        product.swapAccepted =
          parseBoolean(
            swapAccepted
          );
      }

      // --------------------------------------------------------
      // SIM status
      // --------------------------------------------------------

      if (
        simStatus !==
        undefined
      ) {
        product.simStatus =
          cleanString(
            simStatus
          );
      }

      // --------------------------------------------------------
      // Battery health
      // --------------------------------------------------------

      if (
        batteryHealth !==
        undefined
      ) {
        if (
          batteryHealth === ""
        ) {
          product.batteryHealth =
            null;
        } else {
          const parsedBatteryHealth =
            parseNumber(
              batteryHealth
            );

          if (
            parsedBatteryHealth ===
              null ||
            parsedBatteryHealth <
              0 ||
            parsedBatteryHealth >
              100
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Battery health must be between 0 and 100",
            });
          }

          product.batteryHealth =
            parsedBatteryHealth;
        }
      }

      // --------------------------------------------------------
      // Face ID
      // --------------------------------------------------------

      if (
        faceId !== undefined
      ) {
        const selectedFaceId =
          cleanString(
            faceId
          );

        if (
          !VALID_FACE_ID.includes(
            selectedFaceId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid Face ID status",
          });
        }

        product.faceId =
          selectedFaceId;
      }

      // --------------------------------------------------------
      // Status
      // --------------------------------------------------------

      if (
        status !== undefined
      ) {
        if (
          !VALID_STATUSES.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product status",
            validStatuses:
              VALID_STATUSES,
          });
        }

        product.status =
          status;
      }

      // ========================================================
      // EXISTING IMAGES TO KEEP
      // ========================================================

      const imagesToKeep =
        parseJsonArray(
          req.body.imagesToKeep,
          "imagesToKeep"
        );

      if (
        Array.isArray(
          imagesToKeep
        )
      ) {
        const cleanImages =
          cleanUrlArray(
            imagesToKeep
          ).slice(
            0,
            MAX_IMAGES
          );

        const oldImages =
          cleanUrlArray(
            product.images
          );

        for (
          const oldImage of oldImages
        ) {
          if (
            !cleanImages.includes(
              oldImage
            )
          ) {
            await deleteFromCloudinary(
              oldImage,
              "image"
            );
          }
        }

        product.images =
          cleanImages;
      }

      // ========================================================
      // EXISTING VIDEOS TO KEEP
      // ========================================================

      const videosToKeep =
        parseJsonArray(
          req.body.videosToKeep,
          "videosToKeep"
        );

      if (
        Array.isArray(
          videosToKeep
        )
      ) {
        const cleanVideos =
          cleanUrlArray(
            videosToKeep
          ).slice(
            0,
            MAX_VIDEOS
          );

        const oldVideos =
          cleanUrlArray(
            product.videos
          );

        for (
          const oldVideo of oldVideos
        ) {
          if (
            !cleanVideos.includes(
              oldVideo
            )
          ) {
            await deleteFromCloudinary(
              oldVideo,
              "video"
            );
          }
        }

        product.videos =
          cleanVideos;
      }

      // ========================================================
      // UPLOAD NEW FILES
      // ========================================================

      const newFiles =
        req.files || [];

      if (
        newFiles.length > 0
      ) {
        const {
          images,
          videos,
        } = await uploadFiles(
          newFiles
        );

        // ------------------------------------------------------
        // Images
        // ------------------------------------------------------

        if (
          images.length > 0
        ) {
          product.images =
            [
              ...(product.images ||
                []),
              ...images,
            ].slice(
              0,
              MAX_IMAGES
            );
        }

        // ------------------------------------------------------
        // Videos
        // ------------------------------------------------------

        if (
          videos.length > 0
        ) {
          product.videos =
            [
              ...(product.videos ||
                []),
              ...videos,
            ].slice(
              0,
              MAX_VIDEOS
            );
        }
      }

      // ========================================================
      // SYNCHRONIZE LEGACY IMAGE
      // ========================================================

      product.image =
        product.images &&
        product.images.length > 0
          ? product.images[0]
          : "";

      // ========================================================
      // SAVE
      // ========================================================

      await product.save();

      console.log(
        `✅ Product updated: ${product._id}`
      );

      res.json({
        success: true,
        message:
          "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error(
        "❌ Error updating product:",
        error
      );

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors:
            Object.values(
              error.errors
            ).map(
              (err) => err.message
            ),
        });
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product",
      });
    }
  }
);

// ============================================================
// DELETE PRODUCT
// ============================================================

router.delete(
  "/:id",
  verifyToken,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const currentUserId =
        getCurrentUserId(req);

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const isOwner =
        product.sellerId &&
        product.sellerId
          .toString() ===
          currentUserId.toString();

      const isAdmin =
        getCurrentUserRole(req) ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to delete this product",
        });
      }

      // --------------------------------------------------------
      // Delete images
      // --------------------------------------------------------

      for (
        const image of
          product.images || []
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      // --------------------------------------------------------
      // Delete videos
      // --------------------------------------------------------

      for (
        const video of
          product.videos || []
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      // --------------------------------------------------------
      // Delete product
      // --------------------------------------------------------

      await product.deleteOne();

      console.log(
        `🗑️ Product deleted: ${id}`
      );

      res.json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "❌ Error deleting product:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete product",
      });
    }
  }
);

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================

router.patch(
  "/:id/status",
  verifyToken,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      // --------------------------------------------------------
      // Status
      // --------------------------------------------------------

      if (
        !status ||
        !VALID_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status",
          validStatuses:
            VALID_STATUSES,
        });
      }

      // --------------------------------------------------------
      // ID
      // --------------------------------------------------------

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Product
      // --------------------------------------------------------

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // User
      // --------------------------------------------------------

      const currentUserId =
        getCurrentUserId(req);

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // --------------------------------------------------------
      // Authorization
      // --------------------------------------------------------

      const isOwner =
        product.sellerId &&
        product.sellerId
          .toString() ===
          currentUserId.toString();

      const isAdmin =
        getCurrentUserRole(req) ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to update this product",
        });
      }

      // --------------------------------------------------------
      // Update
      // --------------------------------------------------------

      product.status =
        status;

      await product.save();

      console.log(
        `✅ Product ${id} status updated to ${status}`
      );

      res.json({
        success: true,
        message:
          `Product status updated to ${status}`,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Error updating product status:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product status",
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;