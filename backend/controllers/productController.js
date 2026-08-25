
// ============================================================
// backend/controllers/productController.js
// BuyUKUsed Product Controller
// ============================================================

"use strict";

const mongoose = require("mongoose");

const Product = require("../models/Product");
const User = require("../models/User");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// IMPORTANT:
// This is the canonical category source.
// Do NOT do:
// const PRODUCT_CATEGORIES = require("../src/constants/productCategories");
//
// because that returns an object.
//
// We destructure the actual exports instead.
const {
  PRODUCT_CATEGORIES,
  normalizeProductCategory,
} = require("../src/constants/productCategories");

const {
  createImageEmbeddingFromBuffer,
  MODEL_ID,
  EMBEDDING_DIMENSIONS,
} = require("../services/imageEmbeddingService");

// ============================================================
// CONSTANTS
// ============================================================

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

const VALID_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

const VECTOR_INDEX_NAME =
  "product_image_vector_index";

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

const normalizeCategory = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Other";
  }

  if (Array.isArray(value)) {
    value = value[0];
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    value =
      value.value ||
      value.name ||
      value.label ||
      "";
  }

  return normalizeProductCategory(value);
};

// ============================================================
// STATUS NORMALIZATION
// ============================================================

const normalizeStatus = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "active";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  return VALID_STATUSES.includes(normalized)
    ? normalized
    : "active";
};

// ============================================================
// CONDITION NORMALIZATION
// ============================================================

const normalizeCondition = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Good";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  const match = VALID_CONDITIONS.find(
    (condition) =>
      condition.toLowerCase() === normalized
  );

  return match || "Good";
};

// ============================================================
// BOOLEAN HELPER
// ============================================================

const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

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
      [
        "true",
        "1",
        "yes",
        "on",
      ].includes(normalized)
    ) {
      return true;
    }

    if (
      [
        "false",
        "0",
        "no",
        "off",
      ].includes(normalized)
    ) {
      return false;
    }
  }

  return Boolean(value);
};

// ============================================================
// NUMBER HELPER
// ============================================================

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "string") {
    value = value
      .replace(/,/g, "")
      .trim();
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

// ============================================================
// STRING HELPER
// ============================================================

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

  if (Array.isArray(value)) {
    value = value[0];
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    value =
      value.value ||
      value.name ||
      value.label ||
      "";
  }

  return String(value).trim();
};

// ============================================================
// USER HELPERS
// ============================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

const getUserRole = (req) => {
  return (
    req.user?.role ||
    ""
  );
};

// ============================================================
// REGEX HELPER
// ============================================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ============================================================
// FILE HELPER
// ============================================================

const getUploadedFiles = (req) => {
  if (!req) {
    return [];
  }

  if (Array.isArray(req.files)) {
    return req.files;
  }

  if (
    req.files &&
    typeof req.files === "object"
  ) {
    return Object.values(req.files)
      .flat()
      .filter(Boolean);
  }

  if (req.file) {
    return [req.file];
  }

  return [];
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadToCloudinary = (
  buffer,
  resourceType = "image",
  folder = "buyukused/products"
) => {
  return new Promise(
    (resolve, reject) => {
      if (
        !buffer ||
        !Buffer.isBuffer(buffer)
      ) {
        return reject(
          new Error(
            "Invalid file buffer"
          )
        );
      }

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type:
              resourceType,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            resolve(result);
          }
        );

      streamifier
        .createReadStream(buffer)
        .pipe(uploadStream);
    }
  );
};

// ============================================================
// CLOUDINARY DELETE
// ============================================================

const deleteFromCloudinary =
  async (
    fileUrl,
    resourceType = "image"
  ) => {
    try {
      if (
        !fileUrl ||
        !fileUrl.includes(
          "cloudinary.com"
        )
      ) {
        return;
      }

      const uploadIndex =
        fileUrl.indexOf(
          "/upload/"
        );

      if (uploadIndex === -1) {
        return;
      }

      let publicId =
        fileUrl.substring(
          uploadIndex +
            "/upload/".length
        );

      publicId =
        publicId.replace(
          /^v\d+\//,
          ""
        );

      publicId =
        publicId.replace(
          /\.[^/.]+$/,
          ""
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
    } catch (error) {
      console.error(
        "❌ Cloudinary delete error:",
        error.message
      );
    }
  };

// ============================================================
// UPLOAD PRODUCT FILES
// ============================================================

const uploadProductFiles =
  async (files) => {
    const imageUrls = [];
    const videoUrls = [];

    if (
      !Array.isArray(files) ||
      files.length === 0
    ) {
      return {
        imageUrls,
        videoUrls,
      };
    }

    for (const file of files) {
      if (
        !file ||
        !file.buffer
      ) {
        continue;
      }

      if (
        file.mimetype?.startsWith(
          "image/"
        )
      ) {
        const result =
          await uploadToCloudinary(
            file.buffer,
            "image",
            "buyukused/products"
          );

        if (result?.secure_url) {
          imageUrls.push(
            result.secure_url
          );
        }
      } else if (
        file.mimetype?.startsWith(
          "video/"
        )
      ) {
        const result =
          await uploadToCloudinary(
            file.buffer,
            "video",
            "buyukused/products/videos"
          );

        if (result?.secure_url) {
          videoUrls.push(
            result.secure_url
          );
        }
      }
    }

    return {
      imageUrls,
      videoUrls,
    };
  };

// ============================================================
// BUILD PRODUCT DATA
// ============================================================

const buildProductData = (
  body,
  req
) => {
  const normalizedCategory =
    normalizeCategory(
      body?.category
    );

  const data = {
    // ========================================================
    // BASIC
    // ========================================================

    title: cleanString(
      body.title
    ),

    price: toNumberOrNull(
      body.price
    ),

    oldPrice: toNumberOrNull(
      body.oldPrice
    ),

    category:
      normalizedCategory,

    location:
      cleanString(
        body.location
      ) || "Ghana",

    description:
      cleanString(
        body.description
      ),

    // ========================================================
    // SELLER
    // ========================================================

    sellerId:
      getUserId(req),

    sellerName:
      cleanString(
        body.sellerName
      ) ||
      cleanString(
        req.user?.name
      ),

    sellerPhone:
      cleanString(
        body.sellerPhone
      ) ||
      cleanString(
        req.user?.phone
      ),

    // ========================================================
    // GENERAL
    // ========================================================

    brand:
      cleanString(body.brand),

    model:
      cleanString(body.model),

    color:
      cleanString(body.color),

    condition:
      normalizeCondition(
        body.condition
      ),

    warranty:
      cleanString(
        body.warranty
      ),

    // ========================================================
    // COMPUTER / PHONE / TABLET
    // ========================================================

    storage:
      cleanString(body.storage),

    ram:
      cleanString(body.ram),

    processor:
      cleanString(body.processor),

    graphics:
      cleanString(body.graphics),

    screenSize:
      cleanString(
        body.screenSize
      ),

    year:
      cleanString(body.year),

    connectivity:
      cleanString(
        body.connectivity
      ),

    operatingSystem:
      cleanString(
        body.operatingSystem
      ),

    battery:
      cleanString(body.battery),

    resolution:
      cleanString(
        body.resolution
      ),

    // ========================================================
    // PHONE
    // ========================================================

    batteryHealth:
      toNumberOrNull(
        body.batteryHealth
      ),

    faceId:
      cleanString(
        body.faceId
      ),

    simStatus:
      cleanString(
        body.simStatus
      ),

    // ========================================================
    // GAME CONSOLES
    // ========================================================

    videoOutput:
      cleanString(
        body.videoOutput
      ),

    region:
      cleanString(body.region),

    consoleType:
      cleanString(
        body.consoleType
      ),

    edition:
      cleanString(body.edition),

    discDrive:
      cleanString(
        body.discDrive
      ),

    controllersIncluded:
      cleanString(
        body.controllersIncluded
      ),

    // ========================================================
    // SMARTWATCH
    // ========================================================

    watchSize:
      cleanString(
        body.watchSize
      ),

    // ========================================================
    // TV
    // ========================================================

    tvType:
      cleanString(body.tvType),

    displayTechnology:
      cleanString(
        body.displayTechnology
      ),

    refreshRate:
      cleanString(
        body.refreshRate
      ),

    hdr:
      cleanString(body.hdr),

    hdmiPorts:
      cleanString(
        body.hdmiPorts
      ),

    usbPorts:
      cleanString(
        body.usbPorts
      ),

    smartTV:
      toBoolean(body.smartTV),

    voiceControl:
      toBoolean(
        body.voiceControl
      ),

    wallMountable:
      toBoolean(
        body.wallMountable
      ),

    // ========================================================
    // CARS
    // ========================================================

    mileage:
      toNumberOrNull(
        body.mileage
      ),

    bodyType:
      cleanString(
        body.bodyType
      ),

    fuelType:
      cleanString(
        body.fuelType
      ),

    transmission:
      cleanString(
        body.transmission
      ),

    driveType:
      cleanString(
        body.driveType
      ),

    engineSize:
      cleanString(
        body.engineSize
      ),

    seatingCapacity:
      toNumberOrNull(
        body.seatingCapacity
      ),

    exteriorColor:
      cleanString(
        body.exteriorColor
      ),

    interiorColor:
      cleanString(
        body.interiorColor
      ),

    // ========================================================
    // ACCESSORIES
    // ========================================================

    accessoryType:
      cleanString(
        body.accessoryType
      ),

    compatibleWith:
      cleanString(
        body.compatibleWith
      ),

    compatibility:
      cleanString(
        body.compatibility
      ),

    material:
      cleanString(
        body.material
      ),

    cableType:
      cleanString(
        body.cableType
      ),

    connectorType:
      cleanString(
        body.connectorType
      ),

    powerOutput:
      cleanString(
        body.powerOutput
      ),

    capacity:
      cleanString(
        body.capacity
      ),

    batteryCapacity:
      cleanString(
        body.batteryCapacity
      ),

    wireless:
      toBoolean(body.wireless),

    original:
      toBoolean(body.original),

    // ========================================================
    // SPARE PARTS
    // ========================================================

    sparePartType:
      cleanString(
        body.sparePartType
      ),

    partNumber:
      cleanString(
        body.partNumber
      ),

    oemNumber:
      cleanString(
        body.oemNumber
      ),

    partBrand:
      cleanString(
        body.partBrand
      ),

    vehicleMake:
      cleanString(
        body.vehicleMake
      ),

    vehicleModel:
      cleanString(
        body.vehicleModel
      ),

    vehicleYear:
      cleanString(
        body.vehicleYear
      ),

    vehicleGeneration:
      cleanString(
        body.vehicleGeneration
      ),

    vehicleEngine:
      cleanString(
        body.vehicleEngine
      ),

    vehicleTrim:
      cleanString(
        body.vehicleTrim
      ),

    partPosition:
      cleanString(
        body.partPosition
      ),

    partSide:
      cleanString(
        body.partSide
      ),

    partMaterial:
      cleanString(
        body.partMaterial
      ),

    partColor:
      cleanString(
        body.partColor
      ),

    partCondition:
      cleanString(
        body.partCondition
      ),

    isOEM:
      toBoolean(body.isOEM),

    isAftermarket:
      toBoolean(
        body.isAftermarket
      ),

    isGenuine:
      toBoolean(
        body.isGenuine
      ),

    isUsedPart:
      toBoolean(
        body.isUsedPart
      ),

    isNewPart:
      toBoolean(
        body.isNewPart
      ),

    // ========================================================
    // COSMETICS
    // ========================================================

    cosmeticType:
      cleanString(
        body.cosmeticType
      ),

    cosmeticBrand:
      cleanString(
        body.cosmeticBrand
      ),

    productSize:
      cleanString(
        body.productSize
      ),

    volume:
      cleanString(body.volume),

    skinType:
      cleanString(
        body.skinType
      ),

    hairType:
      cleanString(
        body.hairType
      ),

    shade:
      cleanString(body.shade),

    scent:
      cleanString(body.scent),

    gender:
      cleanString(body.gender),

    ageGroup:
      cleanString(
        body.ageGroup
      ),

    expiryDate:
      cleanString(
        body.expiryDate
      ),

    ingredients:
      cleanString(
        body.ingredients
      ),

    benefits:
      cleanString(
        body.benefits
      ),

    usageInstructions:
      cleanString(
        body.usageInstructions
      ),

    countryOfOrigin:
      cleanString(
        body.countryOfOrigin
      ),

    crueltyFree:
      toBoolean(
        body.crueltyFree
      ),

    vegan:
      toBoolean(body.vegan),

    organic:
      toBoolean(
        body.organic
      ),

    sealed:
      toBoolean(body.sealed),

    // ========================================================
    // SELLING OPTIONS
    // ========================================================

    negotiation:
      toBoolean(
        body.negotiation
      ),

    swapAccepted:
      toBoolean(
        body.swapAccepted
      ),

    // ========================================================
    // STATUS
    // ========================================================

    status:
      normalizeStatus(
        body.status
      ),

    // ========================================================
    // PROMOTION
    // ========================================================

    promo:
      toBoolean(body.promo),

    verified:
      toBoolean(
        body.verified
      ),

    yearsOnPlatform:
      toNumberOrNull(
        body.yearsOnPlatform
      ) ?? 0,
  };

  return data;
};

// ============================================================
// VALIDATE PRODUCT DATA
// ============================================================

const validateProductData = (
  data
) => {
  const errors = [];

  if (
    !data.title ||
    data.title.length < 2
  ) {
    errors.push(
      "Product title is required"
    );
  }

  if (
    data.price === null ||
    !Number.isFinite(
      data.price
    ) ||
    data.price < 0
  ) {
    errors.push(
      "A valid product price is required"
    );
  }

  if (!data.sellerId) {
    errors.push(
      "Seller authentication is required"
    );
  }

  if (
    !data.sellerPhone ||
    !data.sellerPhone.trim()
  ) {
    errors.push(
      "Seller phone number is required"
    );
  }

  if (
    !PRODUCT_CATEGORIES.includes(
      data.category
    )
  ) {
    errors.push(
      `Invalid product category: ${data.category}`
    );
  }

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    errors.push(
      `Invalid product status: ${data.status}`
    );
  }

  if (
    !VALID_CONDITIONS.includes(
      data.condition
    )
  ) {
    errors.push(
      `Invalid product condition: ${data.condition}`
    );
  }

  return errors;
};

// ============================================================
// VISUAL EMBEDDING
// ============================================================

const createProductVisualEmbedding =
  async (imageBuffer) => {
    if (
      !imageBuffer ||
      !Buffer.isBuffer(
        imageBuffer
      )
    ) {
      return null;
    }

    try {
      const embedding =
        await createImageEmbeddingFromBuffer(
          imageBuffer
        );

      if (
        !Array.isArray(
          embedding
        ) ||
        embedding.length !==
          EMBEDDING_DIMENSIONS
      ) {
        throw new Error(
          `Expected ${EMBEDDING_DIMENSIONS}-dimension embedding`
        );
      }

      return embedding;
    } catch (error) {
      console.error(
        "⚠️ Visual embedding generation failed:",
        error.message
      );

      return null;
    }
  };

// ============================================================
// GET PRODUCTS
// ============================================================

exports.getProducts =
  async (req, res) => {
    try {
      const {
        search,
        category,
        location,
        condition,
        brand,
        model,
        status,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12,
        sellerId,
      } = req.query;

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 12,
            1
          ),
          100
        );

      const query = {};

      // --------------------------------------------------------
      // STATUS
      // --------------------------------------------------------

      query.status = status
        ? normalizeStatus(status)
        : "active";

      // --------------------------------------------------------
      // CATEGORY
      // --------------------------------------------------------

      if (category) {
        query.category =
          normalizeCategory(
            category
          );
      }

      // --------------------------------------------------------
      // LOCATION
      // --------------------------------------------------------

      if (location) {
        query.location = {
          $regex:
            escapeRegex(
              location
            ),
          $options: "i",
        };
      }

      // --------------------------------------------------------
      // CONDITION
      // --------------------------------------------------------

      if (condition) {
        query.condition =
          normalizeCondition(
            condition
          );
      }

      // --------------------------------------------------------
      // BRAND
      // --------------------------------------------------------

      if (brand) {
        query.brand = {
          $regex:
            escapeRegex(brand),
          $options: "i",
        };
      }

      // --------------------------------------------------------
      // MODEL
      // --------------------------------------------------------

      if (model) {
        query.model = {
          $regex:
            escapeRegex(model),
          $options: "i",
        };
      }

      // --------------------------------------------------------
      // SELLER
      // --------------------------------------------------------

      if (sellerId) {
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

        query.sellerId =
          sellerId;
      }

      // --------------------------------------------------------
      // PRICE
      // --------------------------------------------------------

      const min =
        toNumberOrNull(
          minPrice
        );

      const max =
        toNumberOrNull(
          maxPrice
        );

      if (
        min !== null ||
        max !== null
      ) {
        query.price = {};

        if (min !== null) {
          query.price.$gte =
            min;
        }

        if (max !== null) {
          query.price.$lte =
            max;
        }
      }

      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      if (search) {
        const safeSearch =
          escapeRegex(
            String(search).trim()
          );

        if (safeSearch) {
          query.$or = [
            {
              title: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              description: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              brand: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              model: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },

            // Accessories
            {
              accessoryType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              compatibleWith: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              compatibility: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },

            // Spare Parts
            {
              sparePartType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              partNumber: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              oemNumber: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              partBrand: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              vehicleMake: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              vehicleModel: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },

            // Cosmetics
            {
              cosmeticType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              cosmeticBrand: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              skinType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              hairType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              ingredients: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              benefits: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },

            // TV
            {
              tvType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },

            // Game Consoles
            {
              consoleType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
          ];
        }
      }

      const products =
        await Product.find(query)
          .populate(
            "sellerId",
            "name email phone location avatar isVerified profileImage"
          )
          .select(
            "-imageEmbedding -imageEmbeddingModel -imageEmbeddingUpdatedAt"
          )
          .limit(limitNumber)
          .skip(
            (pageNumber - 1) *
              limitNumber
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      const total =
        await Product.countDocuments(
          query
        );

      return res.json({
        success: true,
        products,
        pagination: {
          currentPage:
            pageNumber,
          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
          totalProducts:
            total,
          limit:
            limitNumber,
        },
      });
    } catch (error) {
      console.error(
        "❌ Get products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get products",
      });
    }
  };

// ============================================================
// VISUAL SEARCH
// ============================================================

exports.visualSearch =
  async (req, res) => {
    try {
      const files =
        getUploadedFiles(req);

      const file =
        files.find(
          (item) =>
            item?.mimetype?.startsWith(
              "image/"
            )
        );

      if (
        !file ||
        !file.buffer
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload an image",
        });
      }

      const {
        category,
        location,
        minPrice,
        maxPrice,
        limit = 24,
      } = req.body || {};

      const queryEmbedding =
        await createImageEmbeddingFromBuffer(
          file.buffer
        );

      if (
        !queryEmbedding ||
        queryEmbedding.length !==
          EMBEDDING_DIMENSIONS
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to create image embedding",
        });
      }

      const safeLimit =
        Math.min(
          Math.max(
            Number(limit) || 24,
            1
          ),
          100
        );

      const filter = {
        status: "active",
      };

      if (category) {
        filter.category =
          normalizeCategory(
            category
          );
      }

      if (location) {
        filter.location = {
          $regex:
            escapeRegex(
              location
            ),
          $options: "i",
        };
      }

      const min =
        toNumberOrNull(
          minPrice
        );

      const max =
        toNumberOrNull(
          maxPrice
        );

      if (
        min !== null ||
        max !== null
      ) {
        filter.price = {};

        if (min !== null) {
          filter.price.$gte =
            min;
        }

        if (max !== null) {
          filter.price.$lte =
            max;
        }
      }

      const candidates =
        Math.max(
          safeLimit * 10,
          100
        );

      const pipeline = [
        {
          $vectorSearch: {
            index:
              VECTOR_INDEX_NAME,
            path:
              "imageEmbedding",
            queryVector:
              queryEmbedding,
            numCandidates:
              candidates,
            limit:
              safeLimit,
            filter,
          },
        },

        {
          $addFields: {
            visualSimilarity: {
              $meta:
                "vectorSearchScore",
            },
          },
        },

        {
          $project: {
            imageEmbedding: 0,
            imageEmbeddingModel: 0,
            imageEmbeddingUpdatedAt: 0,
          },
        },

        {
          $lookup: {
            from: "users",
            localField:
              "sellerId",
            foreignField:
              "_id",
            as: "seller",
          },
        },

        {
          $unwind: {
            path: "$seller",
            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $addFields: {
            sellerId: {
              _id: "$seller._id",
              name: "$seller.name",
              email: "$seller.email",
              phone: "$seller.phone",
              location:
                "$seller.location",
              avatar:
                "$seller.avatar",
            },
          },
        },

        {
          $project: {
            seller: 0,
          },
        },
      ];

      const products =
        await Product.aggregate(
          pipeline
        );

      return res.json({
        success: true,
        message:
          "Visual search completed",
        products,
        count:
          products.length,
        visualSearch: true,
        model:
          MODEL_ID,
        dimensions:
          EMBEDDING_DIMENSIONS,
      });
    } catch (error) {
      console.error(
        "❌ Visual search error:",
        error
      );

      if (
        error.message?.includes(
          "index"
        ) &&
        error.message?.includes(
          "vector"
        )
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Visual search index is not configured in MongoDB Atlas",
          error:
            error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Visual search failed",
      });
    }
  };

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

exports.getProductById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findById(id)
          .populate(
            "sellerId",
            "name email phone location avatar isVerified profileImage"
          )
          .select(
            "-imageEmbedding -imageEmbeddingModel -imageEmbeddingUpdatedAt"
          );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // VIEW COUNT
      // --------------------------------------------------------

      await Product.findByIdAndUpdate(
        id,
        {
          $inc: {
            views: 1,
          },
        }
      );

      product.views =
        (product.views || 0) + 1;

      // --------------------------------------------------------
      // SELLER NOTIFICATION
      // --------------------------------------------------------

      const viewerId =
        getUserId(req);

      const sellerId =
        product.sellerId?._id ||
        product.sellerId;

      if (
        viewerId &&
        sellerId &&
        viewerId.toString() !==
          sellerId.toString()
      ) {
        setImmediate(
          async () => {
            try {
              const viewer =
                await User.findById(
                  viewerId
                )
                  .select("name")
                  .lean();

              const viewerName =
                viewer?.name ||
                "Someone";

              // Your Notification model uses userId.
              const recent =
                await Notification.findOne(
                  {
                    userId:
                      sellerId,
                    title:
                      "📢 Product Viewed",
                    message: {
                      $regex:
                        escapeRegex(
                          product.title
                        ),
                      $options: "i",
                    },
                    timestamp: {
                      $gte:
                        new Date(
                          Date.now() -
                            60 *
                              1000
                        ),
                    },
                  }
                );

              if (recent) {
                return;
              }

              await Notification.create(
                {
                  userId:
                    sellerId,

                  title:
                    "📢 Product Viewed",

                  message:
                    `${viewerName} viewed your product "${product.title}"`,

                  read: false,

                  timestamp:
                    new Date(),
                }
              );

              console.log(
                `🔔 Product view notification created for seller ${sellerId}`
              );
            } catch (notificationError) {
              console.error(
                "❌ Product view notification error:",
                notificationError.message
              );
            }
          }
        );
      }

      return res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Get product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get product",
      });
    }
  };

// ============================================================
// CREATE PRODUCT
// ============================================================

exports.createProduct =
  async (req, res) => {
    try {
      console.log(
        "📦 Creating product..."
      );

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const productData =
        buildProductData(
          req.body || {},
          req
        );

      productData.sellerId =
        userId;

      console.log(
        "📦 Category:",
        productData.category
      );

      console.log(
        "📦 Title:",
        productData.title
      );

      const validationErrors =
        validateProductData(
          productData
        );

      if (
        validationErrors.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            validationErrors[0],
          errors:
            validationErrors,
        });
      }

      // --------------------------------------------------------
      // UPLOAD FILES
      // --------------------------------------------------------

      const files =
        getUploadedFiles(req);

      const {
        imageUrls,
        videoUrls,
      } =
        await uploadProductFiles(
          files
        );

      productData.images =
        imageUrls;

      productData.videos =
        videoUrls;

      productData.image =
        imageUrls[0] || "";

      // --------------------------------------------------------
      // VISUAL EMBEDDING
      // --------------------------------------------------------

      const firstImage =
        files.find(
          (file) =>
            file?.mimetype?.startsWith(
              "image/"
            )
        );

      if (firstImage) {
        const embedding =
          await createProductVisualEmbedding(
            firstImage.buffer
          );

        if (embedding) {
          productData.imageEmbedding =
            embedding;

          productData.imageEmbeddingModel =
            MODEL_ID;

          productData.imageEmbeddingUpdatedAt =
            new Date();
        }
      }

      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      const product =
        await Product.create(
          productData
        );

      console.log(
        "✅ Product created:",
        product._id.toString()
      );

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        product,
        visualSearchIndexed:
          Boolean(
            productData.imageEmbedding
          ),
      });
    } catch (error) {
      console.error(
        "❌ Create product error:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Duplicate product entry",
          error:
            error.keyValue || null,
        });
      }

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
              error.errors || {}
            ).map(
              (err) =>
                err.message
            ),
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create product",
      });
    }
  };

// ============================================================
// UPDATE PRODUCT
// ============================================================

exports.updateProduct =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findById(id).select(
          "+imageEmbedding +imageEmbeddingModel +imageEmbeddingUpdatedAt"
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const role =
        getUserRole(req);

      const isAdmin =
        role === "admin";

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          userId.toString();

      if (
        !isAdmin &&
        !isOwner
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this product",
        });
      }

      // ========================================================
      // ALL FIELDS THAT EXIST IN Product.js
      // ========================================================

      const allowedFields = [
        // Basic
        "title",
        "price",
        "oldPrice",
        "category",
        "location",
        "description",

        // Seller
        "sellerName",
        "sellerPhone",

        // General
        "brand",
        "model",
        "color",
        "condition",
        "warranty",

        // Computer / Phone / Tablet
        "storage",
        "ram",
        "processor",
        "graphics",
        "screenSize",
        "year",
        "connectivity",
        "operatingSystem",
        "battery",
        "resolution",

        // Phone
        "batteryHealth",
        "faceId",
        "simStatus",

        // Game Console
        "videoOutput",
        "region",
        "consoleType",
        "edition",
        "discDrive",
        "controllersIncluded",

        // Smartwatch
        "watchSize",

        // TV
        "tvType",
        "displayTechnology",
        "refreshRate",
        "hdr",
        "hdmiPorts",
        "usbPorts",
        "smartTV",
        "voiceControl",
        "wallMountable",

        // Cars
        "mileage",
        "bodyType",
        "fuelType",
        "transmission",
        "driveType",
        "engineSize",
        "seatingCapacity",
        "exteriorColor",
        "interiorColor",

        // Accessories
        "accessoryType",
        "compatibleWith",
        "compatibility",
        "material",
        "cableType",
        "connectorType",
        "powerOutput",
        "capacity",
        "batteryCapacity",
        "wireless",
        "original",

        // Spare Parts
        "sparePartType",
        "partNumber",
        "oemNumber",
        "partBrand",
        "vehicleMake",
        "vehicleModel",
        "vehicleYear",
        "vehicleGeneration",
        "vehicleEngine",
        "vehicleTrim",
        "partPosition",
        "partSide",
        "partMaterial",
        "partColor",
        "partCondition",
        "isOEM",
        "isAftermarket",
        "isGenuine",
        "isUsedPart",
        "isNewPart",

        // Cosmetics
        "cosmeticType",
        "cosmeticBrand",
        "productSize",
        "volume",
        "skinType",
        "hairType",
        "shade",
        "scent",
        "gender",
        "ageGroup",
        "expiryDate",
        "ingredients",
        "benefits",
        "usageInstructions",
        "countryOfOrigin",
        "crueltyFree",
        "vegan",
        "organic",
        "sealed",

        // Selling
        "negotiation",
        "swapAccepted",

        // Status
        "status",

        // Promotion
        "promo",
        "verified",
        "yearsOnPlatform",
      ];

      // ========================================================
      // APPLY FIELDS
      // ========================================================

      for (
        const field of allowedFields
      ) {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body || {},
            field
          )
        ) {
          let value =
            req.body[field];

          // ----------------------------------------------
          // CATEGORY
          // ----------------------------------------------

          if (
            field ===
            "category"
          ) {
            value =
              normalizeCategory(
                value
              );
          }

          // ----------------------------------------------
          // STATUS
          // ----------------------------------------------

          else if (
            field ===
            "status"
          ) {
            value =
              normalizeStatus(
                value
              );
          }

          // ----------------------------------------------
          // CONDITION
          // ----------------------------------------------

          else if (
            field ===
            "condition"
          ) {
            value =
              normalizeCondition(
                value
              );
          }

          // ----------------------------------------------
          // NUMBERS
          // ----------------------------------------------

          else if (
            [
              "price",
              "oldPrice",
              "mileage",
              "seatingCapacity",
              "batteryHealth",
              "yearsOnPlatform",
            ].includes(field)
          ) {
            value =
              toNumberOrNull(
                value
              );

            if (
              value === null &&
              field ===
                "yearsOnPlatform"
            ) {
              value = 0;
            }
          }

          // ----------------------------------------------
          // BOOLEANS
          // ----------------------------------------------

          else if (
            [
              "smartTV",
              "voiceControl",
              "wallMountable",
              "wireless",
              "original",
              "isOEM",
              "isAftermarket",
              "isGenuine",
              "isUsedPart",
              "isNewPart",
              "crueltyFree",
              "vegan",
              "organic",
              "sealed",
              "negotiation",
              "swapAccepted",
              "promo",
              "verified",
            ].includes(field)
          ) {
            value =
              toBoolean(value);
          }

          // ----------------------------------------------
          // STRINGS
          // ----------------------------------------------

          else {
            value =
              cleanString(value);
          }

          product[field] =
            value;
        }
      }

      // ========================================================
      // NEW FILES
      // ========================================================

      const files =
        getUploadedFiles(req);

      if (files.length > 0) {
        const {
          imageUrls,
          videoUrls,
        } =
          await uploadProductFiles(
            files
          );

        // ----------------------------------------------------
        // IMAGES
        // ----------------------------------------------------

        if (
          imageUrls.length > 0
        ) {
          const oldImages =
            Array.isArray(
              product.images
            )
              ? [
                  ...product.images,
                ]
              : [];

          for (
            const oldImage of oldImages
          ) {
            await deleteFromCloudinary(
              oldImage,
              "image"
            );
          }

          product.images =
            imageUrls;

          product.image =
            imageUrls[0];
        }

        // ----------------------------------------------------
        // VIDEOS
        // ----------------------------------------------------

        if (
          videoUrls.length > 0
        ) {
          const oldVideos =
            Array.isArray(
              product.videos
            )
              ? [
                  ...product.videos,
                ]
              : [];

          for (
            const oldVideo of oldVideos
          ) {
            await deleteFromCloudinary(
              oldVideo,
              "video"
            );
          }

          product.videos =
            videoUrls;
        }

        // ----------------------------------------------------
        // UPDATE VISUAL EMBEDDING
        // ----------------------------------------------------

        const firstImage =
          files.find(
            (file) =>
              file?.mimetype?.startsWith(
                "image/"
              )
          );

        if (firstImage) {
          const embedding =
            await createProductVisualEmbedding(
              firstImage.buffer
            );

          if (embedding) {
            product.imageEmbedding =
              embedding;

            product.imageEmbeddingModel =
              MODEL_ID;

            product.imageEmbeddingUpdatedAt =
              new Date();
          }
        }
      }

      await product.save();

      return res.json({
        success: true,
        message:
          "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error(
        "❌ Update product error:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Duplicate product entry",
        });
      }

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
              error.errors || {}
            ).map(
              (err) =>
                err.message
            ),
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product",
      });
    }
  };

// ============================================================
// DELETE PRODUCT
// ============================================================

exports.deleteProduct =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const userId =
        getUserId(req);

      const role =
        getUserRole(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const isAdmin =
        role === "admin";

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          userId.toString();

      if (
        !isAdmin &&
        !isOwner
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to delete this product",
        });
      }

      // --------------------------------------------------------
      // DELETE IMAGES
      // --------------------------------------------------------

      if (
        Array.isArray(
          product.images
        )
      ) {
        for (
          const image of
            product.images
        ) {
          await deleteFromCloudinary(
            image,
            "image"
          );
        }
      }

      // Legacy image
      if (
        product.image &&
        !product.images?.includes(
          product.image
        )
      ) {
        await deleteFromCloudinary(
          product.image,
          "image"
        );
      }

      // --------------------------------------------------------
      // DELETE VIDEOS
      // --------------------------------------------------------

      if (
        Array.isArray(
          product.videos
        )
      ) {
        for (
          const video of
            product.videos
        ) {
          await deleteFromCloudinary(
            video,
            "video"
          );
        }
      }

      await Product.findByIdAndDelete(
        id
      );

      return res.json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "❌ Delete product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete product",
      });
    }
  };

// ============================================================
// UPDATE STOCK
// ============================================================
//
// Your current Product.js does not have a stock/quantity field.
// Do not pretend stock exists.
//

exports.updateStock =
  async (req, res) => {
    return res.status(400).json({
      success: false,
      message:
        "Stock is not supported by the current Product model",
    });
  };

// ============================================================
// GET SELLER PRODUCTS
// ============================================================

exports.getSellerProducts =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const products =
        await Product.find({
          sellerId: userId,
        })
          .populate(
            "sellerId",
            "name email phone location avatar isVerified profileImage"
          )
          .select(
            "-imageEmbedding -imageEmbeddingModel -imageEmbeddingUpdatedAt"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        products,
      });
    } catch (error) {
      console.error(
        "❌ Get seller products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get seller products",
      });
    }
  };

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================

exports.updateProductStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body || {};

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      if (
        !VALID_STATUSES.includes(
          String(status)
            .trim()
            .toLowerCase()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product status. Allowed: ${VALID_STATUSES.join(
              ", "
            )}`,
        });
      }

      const normalizedStatus =
        normalizeStatus(
          status
        );

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

      const userId =
        getUserId(req);

      const role =
        getUserRole(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const isAdmin =
        role === "admin";

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          userId.toString();

      if (
        !isAdmin &&
        !isOwner
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this product",
        });
      }

      product.status =
        normalizedStatus;

      await product.save();

      return res.json({
        success: true,
        message:
          `Product status updated to ${normalizedStatus}`,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Update product status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product status",
      });
    }
  };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getProducts:
    exports.getProducts,

  getProductById:
    exports.getProductById,

  createProduct:
    exports.createProduct,

  updateProduct:
    exports.updateProduct,

  deleteProduct:
    exports.deleteProduct,

  updateStock:
    exports.updateStock,

  getSellerProducts:
    exports.getSellerProducts,

  updateProductStatus:
    exports.updateProductStatus,

  visualSearch:
    exports.visualSearch,
};