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
const MAX_UPLOAD_FILES = MAX_IMAGES + MAX_VIDEOS;

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

// ============================================================
// ALL SUPPORTED PRODUCT CATEGORIES
// ============================================================

const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "Smartwatches",
  "TVs",
  "Game Consoles",
  "Accessories",
  "Electronics",
  "Cameras",
  "Audio",
  "Computers",
  "Printers",
  "Networking",
  "Appliances",
  "Fashion",
  "Home",
  "Furniture",
  "Real Estate",
  "Jobs",
  "Services",
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
// CATEGORY ALIASES
// ============================================================

const CATEGORY_ALIASES = {
  phone: "Phones",
  phones: "Phones",

  mobile: "Phones",
  mobiles: "Phones",
  smartphone: "Phones",
  smartphones: "Phones",

  laptop: "Laptops",
  laptops: "Laptops",
  notebook: "Laptops",
  notebooks: "Laptops",

  tablet: "Tablets",
  tablets: "Tablets",

  smartwatch: "Smartwatches",
  smartwatches: "Smartwatches",
  "smart watch": "Smartwatches",
  "smart watches": "Smartwatches",

  tv: "TVs",
  tvs: "TVs",
  television: "TVs",
  televisions: "TVs",

  console: "Game Consoles",
  consoles: "Game Consoles",
  "game console": "Game Consoles",
  "game consoles": "Game Consoles",
  gaming: "Game Consoles",

  accessory: "Accessories",
  accessories: "Accessories",

  car: "Cars",
  cars: "Cars",
  automobile: "Cars",
  automobiles: "Cars",
  vehicle: "Cars",
  vehicles: "Cars",

  camera: "Cameras",
  cameras: "Cameras",

  audio: "Audio",
  headphones: "Audio",
  earphones: "Audio",
  speakers: "Audio",

  computer: "Computers",
  computers: "Computers",
  desktop: "Computers",
  desktops: "Computers",

  printer: "Printers",
  printers: "Printers",

  networking: "Networking",
  network: "Networking",
  routers: "Networking",
  router: "Networking",

  appliance: "Appliances",
  appliances: "Appliances",

  fashion: "Fashion",
  clothing: "Fashion",
  clothes: "Fashion",

  home: "Home",

  furniture: "Furniture",

  "real estate": "Real Estate",
  realestate: "Real Estate",
  property: "Real Estate",
  properties: "Real Estate",

  job: "Jobs",
  jobs: "Jobs",

  service: "Services",
  services: "Services",

  electronics: "Electronics",
  electronic: "Electronics",

  other: "Other",
};

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// STRING HELPER
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

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized =
      value.trim().toLowerCase();

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
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Other";
  }

  const original = String(value).trim();

  if (!original) {
    return "Other";
  }

  // Exact category match
  const exactMatch =
    VALID_CATEGORIES.find(
      (category) =>
        category.toLowerCase() ===
        original.toLowerCase()
    );

  if (exactMatch) {
    return exactMatch;
  }

  // Alias match
  const aliasKey =
    original.toLowerCase();

  if (
    CATEGORY_ALIASES[aliasKey]
  ) {
    return CATEGORY_ALIASES[
      aliasKey
    ];
  }

  // Normalize common spacing
  const normalized =
    original
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  if (
    CATEGORY_ALIASES[normalized]
  ) {
    return CATEGORY_ALIASES[
      normalized
    ];
  }

  return null;
};

// ============================================================
// VALIDATE CATEGORY
// ============================================================

const validateCategory = (
  value
) => {
  const normalized =
    normalizeCategory(value);

  if (!normalized) {
    return {
      valid: false,
      category: null,
    };
  }

  return {
    valid: true,
    category: normalized,
  };
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

    // Remove transformations
    while (
      parts.length > 0 &&
      (
        parts[0].includes("_") ||
        parts[0].includes(",") ||
        parts[0] === "q_auto" ||
        parts[0] === "f_auto"
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
        `🗑️ Deleted Cloudinary ${resourceType}: ${publicId}`
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

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,

              resource_type:
                resourceType,

              public_id:
                `${Date.now()}-${Math.round(
                  Math.random() * 1e9
                )}`,
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

                return reject(
                  error
                );
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
// UPLOAD MULTIPLE FILES
// ============================================================

const uploadFiles = async (
  files = []
) => {
  const imageFiles =
    files
      .filter(
        (file) =>
          file &&
          file.mimetype &&
          file.mimetype.startsWith(
            "image/"
          )
      )
      .slice(
        0,
        MAX_IMAGES
      );

  const videoFiles =
    files
      .filter(
        (file) =>
          file &&
          file.mimetype &&
          file.mimetype.startsWith(
            "video/"
          )
      )
      .slice(
        0,
        MAX_VIDEOS
      );

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
          item.result &&
          item.result.secure_url
      )
      .filter(Boolean);

  const videos =
    videoResults
      .map(
        (item) =>
          item.result &&
          item.result.secure_url
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
      throw new Error(
        `${fieldName} must be an array`
      );
    }

    return parsed;
  } catch {
    throw new Error(
      `${fieldName} must be valid JSON`
    );
  }
};

// ============================================================
// GET SUPPORTED CATEGORIES
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
// TEST
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
        const categoryResult =
          validateCategory(
            category
          );

        if (
          !categoryResult.valid
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product category: ${category}`,
            categories:
              VALID_CATEGORIES,
          });
        }

        filter.category =
          categoryResult.category;
      }

      // --------------------------------------------------------
      // Location
      // --------------------------------------------------------

      if (
        location &&
        location !== "all"
      ) {
        filter.location =
          String(location).trim();
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
          String(search)
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
      ] =
        await Promise.all([
          Product.find(
            filter
          )
            .populate(
              "sellerId",
              "name phone email location avatar role"
            )
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(
              parsedLimit
            )
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

        page:
          parsedPage,

        limit:
          parsedLimit,

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
    MAX_UPLOAD_FILES
  ),

  async (req, res) => {
    try {
      console.log(
        "📩 POST /api/products received"
      );

      console.log(
        "👤 User:",
        req.userId
      );

      console.log(
        "📦 Files:",
        req.files?.length || 0
      );

      // ------------------------------------------------------
      // Authentication
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Body
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Title
      // ------------------------------------------------------

      const cleanTitle =
        cleanString(title);

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required",
        });
      }

      // ------------------------------------------------------
      // Price
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Old Price
      // ------------------------------------------------------

      let parsedOldPrice =
        null;

      if (
        oldPrice !== undefined &&
        oldPrice !== ""
      ) {
        parsedOldPrice =
          parseNumber(
            oldPrice
          );

        if (
          parsedOldPrice === null ||
          parsedOldPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid old price",
          });
        }
      }

      // ------------------------------------------------------
      // Phone
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // CATEGORY
      // ------------------------------------------------------

      const categoryResult =
        validateCategory(
          category
        );

      if (
        !categoryResult.valid
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product category: ${category}`,
          categories:
            VALID_CATEGORIES,
        });
      }

      const selectedCategory =
        categoryResult.category;

      console.log(
        "🏷️ Category:",
        category,
        "→",
        selectedCategory
      );

      // ------------------------------------------------------
      // Condition
      // ------------------------------------------------------

      const selectedCondition =
        cleanString(
          condition,
          "Good"
        );

      if (
        !VALID_CONDITIONS.includes(
          selectedCondition
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product condition: ${selectedCondition}`,
        });
      }

      // ------------------------------------------------------
      // Battery health
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Face ID
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Upload files
      // ------------------------------------------------------

      const {
        images,
        videos,
      } =
        await uploadFiles(
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

      // ------------------------------------------------------
      // Product data
      // ------------------------------------------------------

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

        image:
          images.length > 0
            ? images[0]
            : "",

        status:
          "active",
      };

      // ------------------------------------------------------
      // Save
      // ------------------------------------------------------

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

      // Mongoose validation error
      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors:
            Object.fromEntries(
              Object.entries(
                error.errors
              ).map(
                ([
                  key,
                  value,
                ]) => [
                  key,
                  value.message,
                ]
              )
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
    MAX_UPLOAD_FILES
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

      // ------------------------------------------------------
      // Authentication
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Authorization
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Body
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Title
      // ------------------------------------------------------

      if (
        title !== undefined
      ) {
        const cleanTitle =
          cleanString(
            title
          );

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

      // ------------------------------------------------------
      // Price
      // ------------------------------------------------------

      if (
        price !== undefined &&
        price !== ""
      ) {
        const parsedPrice =
          parseNumber(
            price
          );

        if (
          parsedPrice === null ||
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

      // ------------------------------------------------------
      // Old Price
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // CATEGORY
      // ------------------------------------------------------

      if (
        category !== undefined
      ) {
        const categoryResult =
          validateCategory(
            category
          );

        if (
          !categoryResult.valid
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product category: ${category}`,
            categories:
              VALID_CATEGORIES,
          });
        }

        product.category =
          categoryResult.category;
      }

      // ------------------------------------------------------
      // Location
      // ------------------------------------------------------

      if (
        location !== undefined
      ) {
        product.location =
          cleanString(
            location
          );
      }

      // ------------------------------------------------------
      // Description
      // ------------------------------------------------------

      if (
        description !== undefined
      ) {
        product.description =
          cleanString(
            description
          );
      }

      // ------------------------------------------------------
      // Seller Name
      // ------------------------------------------------------

      if (
        sellerName !== undefined
      ) {
        product.sellerName =
          cleanString(
            sellerName
          );
      }

      // ------------------------------------------------------
      // Seller Phone
      // ------------------------------------------------------

      if (
        sellerPhone !== undefined
      ) {
        const cleanPhone =
          cleanString(
            sellerPhone
          );

        if (!cleanPhone) {
          return res.status(400).json({
            success: false,
            message:
              "Seller phone number cannot be empty",
          });
        }

        product.sellerPhone =
          cleanPhone;
      }

      // ------------------------------------------------------
      // Brand
      // ------------------------------------------------------

      if (
        brand !== undefined
      ) {
        product.brand =
          cleanString(
            brand
          );
      }

      // ------------------------------------------------------
      // Model
      // ------------------------------------------------------

      if (
        model !== undefined
      ) {
        product.model =
          cleanString(
            model
          );
      }

      // ------------------------------------------------------
      // RAM
      // ------------------------------------------------------

      if (
        ram !== undefined
      ) {
        product.ram =
          cleanString(
            ram
          );
      }

      // ------------------------------------------------------
      // Storage
      // ------------------------------------------------------

      if (
        storage !== undefined
      ) {
        product.storage =
          cleanString(
            storage
          );
      }

      // ------------------------------------------------------
      // Color
      // ------------------------------------------------------

      if (
        color !== undefined
      ) {
        product.color =
          cleanString(
            color
          );
      }

      // ------------------------------------------------------
      // Condition
      // ------------------------------------------------------

      if (
        condition !== undefined
      ) {
        const selectedCondition =
          cleanString(
            condition
          );

        if (
          !VALID_CONDITIONS.includes(
            selectedCondition
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product condition: ${selectedCondition}`,
          });
        }

        product.condition =
          selectedCondition;
      }

      // ------------------------------------------------------
      // Negotiation
      // ------------------------------------------------------

      if (
        negotiation !== undefined
      ) {
        product.negotiation =
          parseBoolean(
            negotiation
          );
      }

      // ------------------------------------------------------
      // Swap
      // ------------------------------------------------------

      if (
        swapAccepted !==
        undefined
      ) {
        product.swapAccepted =
          parseBoolean(
            swapAccepted
          );
      }

      // ------------------------------------------------------
      // SIM
      // ------------------------------------------------------

      if (
        simStatus !== undefined
      ) {
        product.simStatus =
          cleanString(
            simStatus
          );
      }

      // ------------------------------------------------------
      // Battery
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Face ID
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Status
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // Existing images to keep
      // ------------------------------------------------------

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
          const oldImage of
            oldImages
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

      // ------------------------------------------------------
      // Existing videos to keep
      // ------------------------------------------------------

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
          const oldVideo of
            oldVideos
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

      // ------------------------------------------------------
      // Upload new files
      // ------------------------------------------------------

      const newFiles =
        req.files || [];

      if (
        newFiles.length > 0
      ) {
        const {
          images,
          videos,
        } =
          await uploadFiles(
            newFiles
          );

        if (
          images.length > 0
        ) {
          product.images = [
            ...(product.images ||
              []),
            ...images,
          ].slice(
            0,
            MAX_IMAGES
          );
        }

        if (
          videos.length > 0
        ) {
          product.videos = [
            ...(product.videos ||
              []),
            ...videos,
          ].slice(
            0,
            MAX_VIDEOS
          );
        }
      }

      // ------------------------------------------------------
      // Synchronize legacy image
      // ------------------------------------------------------

      product.image =
        product.images &&
        product.images.length > 0
          ? product.images[0]
          : "";

      // ------------------------------------------------------
      // Save
      // ------------------------------------------------------

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
            Object.fromEntries(
              Object.entries(
                error.errors
              ).map(
                ([
                  key,
                  value,
                ]) => [
                  key,
                  value.message,
                ]
              )
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
        !status ||
        !VALID_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Allowed: active, pending, inactive, sold",
        });
      }

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