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

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

// IMPORTANT:
// Keep this list synchronized with Product.js
const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "Game Consoles",
  "Accessories",
  "Electronics",
  "Real Estate",
  "Jobs",
  "Fashion",
  "Home",
  "Other",
];

const VALID_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

const VALID_FACE_ID = [
  "Working",
  "Not Working",
  "Not Available",
  "",
];

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// SAFE STRING
// ============================================================

const cleanString = (value, defaultValue = "") => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  return String(value).trim();
};

// ============================================================
// BOOLEAN PARSER
// ============================================================

const parseBoolean = (
  value,
  defaultValue = false
) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized =
      value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  if (typeof value === "number") {
    return value === 1;
  }

  return defaultValue;
};

// ============================================================
// NUMBER PARSER
// ============================================================

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

// ============================================================
// CATEGORY NORMALIZER
// ============================================================

const normalizeCategory = (value) => {
  const category =
    cleanString(value);

  if (!category) {
    return "Other";
  }

  // Exact match first
  const exactMatch =
    VALID_CATEGORIES.find(
      (item) => item === category
    );

  if (exactMatch) {
    return exactMatch;
  }

  // Case-insensitive match
  const caseInsensitiveMatch =
    VALID_CATEGORIES.find(
      (item) =>
        item.toLowerCase() ===
        category.toLowerCase()
    );

  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch;
  }

  return null;
};

// ============================================================
// CONDITION NORMALIZER
// ============================================================

const normalizeCondition = (value) => {
  const condition =
    cleanString(value);

  if (!condition) {
    return "Good";
  }

  const match =
    VALID_CONDITIONS.find(
      (item) =>
        item.toLowerCase() ===
        condition.toLowerCase()
    );

  return match || null;
};

// ============================================================
// FACE ID NORMALIZER
// ============================================================

const normalizeFaceId = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const faceId =
    cleanString(value);

  const match =
    VALID_FACE_ID.find(
      (item) =>
        item.toLowerCase() ===
        faceId.toLowerCase()
    );

  return match !== undefined
    ? match
    : null;
};

// ============================================================
// CLOUDINARY PUBLIC ID
// ============================================================

const getCloudinaryPublicId = (
  url
) => {
  try {
    if (
      !url ||
      typeof url !== "string" ||
      !url.includes("cloudinary.com")
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

    let publicId =
      url.substring(
        uploadIndex +
          uploadMarker.length
      );

    const parts =
      publicId.split("/");

    // Remove transformation parameters
    while (
      parts.length > 0 &&
      (
        parts[0].includes("_") ||
        parts[0].includes(",") ||
        /^w_\d+/.test(parts[0]) ||
        /^h_\d+/.test(parts[0]) ||
        /^c_/.test(parts[0]) ||
        /^q_/.test(parts[0]) ||
        /^f_/.test(parts[0])
      )
    ) {
      parts.shift();
    }

    publicId =
      parts.join("/");

    // Remove version
    publicId =
      publicId.replace(
        /^v\d+\//,
        ""
      );

    // Remove extension
    publicId =
      publicId.replace(
        /\.[^/.]+$/,
        ""
      );

    return publicId || null;
  } catch (error) {
    console.error(
      "❌ Cloudinary public ID error:",
      error.message
    );

    return null;
  }
};

// ============================================================
// DELETE CLOUDINARY FILE
// ============================================================

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

// ============================================================
// UPLOAD BUFFER TO CLOUDINARY
// ============================================================

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

// ============================================================
// UPLOAD FILES
// ============================================================

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
          file &&
          file.mimetype &&
          file.mimetype.startsWith(
            "image/"
          )
      )
      .slice(0, MAX_IMAGES);

  const videoFiles =
    safeFiles
      .filter(
        (file) =>
          file &&
          file.mimetype &&
          file.mimetype.startsWith(
            "video/"
          )
      )
      .slice(0, MAX_VIDEOS);

  const imageResults =
    await Promise.all(
      imageFiles.map(
        (file) =>
          uploadToCloudinary(
            file
          )
      )
    );

  const videoResults =
    await Promise.all(
      videoFiles.map(
        (file) =>
          uploadToCloudinary(
            file
          )
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
// PARSE JSON ARRAY
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

    if (
      !Array.isArray(parsed)
    ) {
      throw new Error();
    }

    return parsed;
  } catch {
    throw new Error(
      `${fieldName} must be a valid JSON array`
    );
  }
};

// ============================================================
// GET ROUTE TEST
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
      } = req.query;

      const page =
        Math.max(
          parseInt(
            req.query.page,
            10
          ) || 1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            parseInt(
              req.query.limit,
              10
            ) || 20,
            1
          ),
          100
        );

      const filter = {};

      // --------------------------------------------------------
      // CATEGORY
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
              "Invalid product category",
            allowedCategories:
              VALID_CATEGORIES,
          });
        }

        filter.category =
          normalizedCategory;
      }

      // --------------------------------------------------------
      // LOCATION
      // --------------------------------------------------------

      if (
        location &&
        location !== "all"
      ) {
        filter.location =
          cleanString(location);
      }

      // --------------------------------------------------------
      // SELLER
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
      // STATUS
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
          });
        }

        filter.status =
          status;
      }

      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      if (
        search &&
        search.trim()
      ) {
        const escapedSearch =
          search
            .trim()
            .replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
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

      const skip =
        (page - 1) *
        limit;

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
          .limit(limit)
          .lean(),

        Product.countDocuments(
          filter
        ),
      ]);

      const totalPages =
        Math.ceil(
          total / limit
        );

      res.json({
        success: true,
        products,
        total,
        page,
        limit,
        totalPages,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts:
            total,
          limit,
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
          "Failed to fetch products",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
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
        "📩 POST /api/products"
      );

      const sellerId =
        req.userId ||
        req.user?.id ||
        req.user?._id;

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
        oldPrice,
      } = req.body;

      // --------------------------------------------------------
      // TITLE
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
      // PRICE
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
      // CATEGORY
      // --------------------------------------------------------

      const selectedCategory =
        normalizeCategory(
          category
        );

      if (
        !selectedCategory
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product category: ${category}`,
          allowedCategories:
            VALID_CATEGORIES,
        });
      }

      // --------------------------------------------------------
      // CONDITION
      // --------------------------------------------------------

      const selectedCondition =
        normalizeCondition(
          condition
        );

      if (
        !selectedCondition
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product condition: ${condition}`,
          allowedConditions:
            VALID_CONDITIONS,
        });
      }

      // --------------------------------------------------------
      // SELLER PHONE
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
      // BATTERY HEALTH
      // --------------------------------------------------------

      let parsedBatteryHealth =
        null;

      if (
        batteryHealth !==
          undefined &&
        batteryHealth !== ""
      ) {
        parsedBatteryHealth =
          Number(
            batteryHealth
          );

        if (
          !Number.isFinite(
            parsedBatteryHealth
          ) ||
          parsedBatteryHealth < 0 ||
          parsedBatteryHealth > 100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Battery health must be between 0 and 100",
          });
        }
      }

      // --------------------------------------------------------
      // FACE ID
      // --------------------------------------------------------

      const selectedFaceId =
        normalizeFaceId(
          faceId
        );

      if (
        selectedFaceId === null
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid Face ID status: ${faceId}`,
          allowedFaceId:
            VALID_FACE_ID,
        });
      }

      // --------------------------------------------------------
      // OLD PRICE
      // --------------------------------------------------------

      let parsedOldPrice =
        null;

      if (
        oldPrice !== undefined &&
        oldPrice !== ""
      ) {
        parsedOldPrice =
          Number(oldPrice);

        if (
          !Number.isFinite(
            parsedOldPrice
          ) ||
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
      // UPLOAD FILES
      // --------------------------------------------------------

      const {
        images,
        videos,
      } = await uploadFiles(
        req.files || []
      );

      // --------------------------------------------------------
      // PRODUCT DATA
      // --------------------------------------------------------

      const productData = {
        title: cleanTitle,

        price: parsedPrice,

        oldPrice:
          parsedOldPrice,

        category:
          selectedCategory,

        location:
          cleanString(
            location,
            "Ghana"
          ),

        description:
          cleanString(
            description
          ),

        sellerId,

        sellerName:
          cleanString(
            sellerName,
            req.user?.name || ""
          ),

        sellerPhone:
          cleanSellerPhone,

        brand:
          cleanString(brand),

        model:
          cleanString(model),

        ram:
          cleanString(ram),

        storage:
          cleanString(storage),

        color:
          cleanString(color),

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

        image:
          images.length > 0
            ? images[0]
            : "",

        status:
          "active",
      };

      // --------------------------------------------------------
      // CREATE
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

      // Mongoose validation
      if (
        error.name ===
        "ValidationError"
      ) {
        const validationErrors =
          Object.values(
            error.errors
          ).map(
            (err) => err.message
          );

        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors:
            validationErrors,
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
        req.userId ||
        req.user?.id ||
        req.user?._id;

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
        req.user?.role ===
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
      // TITLE
      // --------------------------------------------------------

      if (
        title !== undefined
      ) {
        const value =
          cleanString(title);

        if (!value) {
          return res.status(400).json({
            success: false,
            message:
              "Product title cannot be empty",
          });
        }

        product.title =
          value;
      }

      // --------------------------------------------------------
      // PRICE
      // --------------------------------------------------------

      if (
        price !== undefined &&
        price !== ""
      ) {
        const parsedPrice =
          Number(price);

        if (
          !Number.isFinite(
            parsedPrice
          ) ||
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
      // OLD PRICE
      // --------------------------------------------------------

      if (
        oldPrice !== undefined
      ) {
        if (
          oldPrice === ""
        ) {
          product.oldPrice =
            null;
        } else {
          const parsedOldPrice =
            Number(oldPrice);

          if (
            !Number.isFinite(
              parsedOldPrice
            ) ||
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
      // CATEGORY
      // --------------------------------------------------------

      if (
        category !== undefined
      ) {
        const selectedCategory =
          normalizeCategory(
            category
          );

        if (
          !selectedCategory
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product category: ${category}`,
            allowedCategories:
              VALID_CATEGORIES,
          });
        }

        product.category =
          selectedCategory;
      }

      // --------------------------------------------------------
      // LOCATION
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
      // DESCRIPTION
      // --------------------------------------------------------

      if (
        description !== undefined
      ) {
        product.description =
          cleanString(
            description
          );
      }

      // --------------------------------------------------------
      // SELLER NAME
      // --------------------------------------------------------

      if (
        sellerName !== undefined
      ) {
        product.sellerName =
          cleanString(
            sellerName
          );
      }

      // --------------------------------------------------------
      // SELLER PHONE
      // --------------------------------------------------------

      if (
        sellerPhone !== undefined
      ) {
        product.sellerPhone =
          cleanString(
            sellerPhone
          );
      }

      // --------------------------------------------------------
      // BRAND
      // --------------------------------------------------------

      if (
        brand !== undefined
      ) {
        product.brand =
          cleanString(brand);
      }

      // --------------------------------------------------------
      // MODEL
      // --------------------------------------------------------

      if (
        model !== undefined
      ) {
        product.model =
          cleanString(model);
      }

      // --------------------------------------------------------
      // RAM
      // --------------------------------------------------------

      if (
        ram !== undefined
      ) {
        product.ram =
          cleanString(ram);
      }

      // --------------------------------------------------------
      // STORAGE
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
      // COLOR
      // --------------------------------------------------------

      if (
        color !== undefined
      ) {
        product.color =
          cleanString(color);
      }

      // --------------------------------------------------------
      // CONDITION
      // --------------------------------------------------------

      if (
        condition !== undefined
      ) {
        const selectedCondition =
          normalizeCondition(
            condition
          );

        if (
          !selectedCondition
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product condition: ${condition}`,
            allowedConditions:
              VALID_CONDITIONS,
          });
        }

        product.condition =
          selectedCondition;
      }

      // --------------------------------------------------------
      // NEGOTIATION
      // --------------------------------------------------------

      if (
        negotiation !== undefined
      ) {
        product.negotiation =
          parseBoolean(
            negotiation
          );
      }

      // --------------------------------------------------------
      // SWAP
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
      // SIM STATUS
      // --------------------------------------------------------

      if (
        simStatus !== undefined
      ) {
        product.simStatus =
          cleanString(
            simStatus
          );
      }

      // --------------------------------------------------------
      // BATTERY HEALTH
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
            Number(
              batteryHealth
            );

          if (
            !Number.isFinite(
              parsedBatteryHealth
            ) ||
            parsedBatteryHealth < 0 ||
            parsedBatteryHealth > 100
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
      // FACE ID
      // --------------------------------------------------------

      if (
        faceId !== undefined
      ) {
        const selectedFaceId =
          normalizeFaceId(
            faceId
          );

        if (
          selectedFaceId === null
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid Face ID status: ${faceId}`,
            allowedFaceId:
              VALID_FACE_ID,
          });
        }

        product.faceId =
          selectedFaceId;
      }

      // --------------------------------------------------------
      // STATUS
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
          });
        }

        product.status =
          status;
      }

      // --------------------------------------------------------
      // EXISTING IMAGES
      // --------------------------------------------------------

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
        const oldImages =
          product.images || [];

        for (
          const oldImage of oldImages
        ) {
          if (
            !imagesToKeep.includes(
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
          imagesToKeep
            .filter(
              (url) =>
                typeof url ===
                  "string" &&
                url.trim()
            )
            .slice(
              0,
              MAX_IMAGES
            );
      }

      // --------------------------------------------------------
      // EXISTING VIDEOS
      // --------------------------------------------------------

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
        const oldVideos =
          product.videos || [];

        for (
          const oldVideo of oldVideos
        ) {
          if (
            !videosToKeep.includes(
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
          videosToKeep
            .filter(
              (url) =>
                typeof url ===
                  "string" &&
                url.trim()
            )
            .slice(
              0,
              MAX_VIDEOS
            );
      }

      // --------------------------------------------------------
      // NEW FILES
      // --------------------------------------------------------

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

        const existingImages =
          product.images || [];

        const existingVideos =
          product.videos || [];

        product.images = [
          ...existingImages,
          ...images,
        ].slice(
          0,
          MAX_IMAGES
        );

        product.videos = [
          ...existingVideos,
          ...videos,
        ].slice(
          0,
          MAX_VIDEOS
        );
      }

      // --------------------------------------------------------
      // LEGACY IMAGE FIELD
      // --------------------------------------------------------

      product.image =
        product.images &&
        product.images.length > 0
          ? product.images[0]
          : "";

      // --------------------------------------------------------
      // SAVE
      // --------------------------------------------------------

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
        req.userId ||
        req.user?.id ||
        req.user?._id;

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
        req.user?.role ===
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

      // Delete images
      for (
        const image of
          product.images || []
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      // Delete videos
      for (
        const video of
          product.videos || []
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

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

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

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
          allowedStatuses:
            VALID_STATUSES,
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
        req.userId ||
        req.user?.id ||
        req.user?._id;

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
        req.user?.role ===
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

      product.status =
        status;

      await product.save();

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