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
const MAX_FILES = MAX_IMAGES + MAX_VIDEOS;

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Real Estate",
  "Jobs",
  "Electronics",
  "Fashion",
  "Home",
  "Other",
  "Laptops",
  "Tablets",
  "Accessories",
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
// GET USER ID
// ============================================================

const getCurrentUserId = (req) => {
  return (
    req.userId ||
    req.user?.id ||
    req.user?._id ||
    null
  );
};

// ============================================================
// GET USER ROLE
// ============================================================

const getCurrentUserRole = (req) => {
  return req.user?.role || null;
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
    const normalized = value
      .trim()
      .toLowerCase();

    if (
      ["true", "1", "yes", "on"].includes(
        normalized
      )
    ) {
      return true;
    }

    if (
      ["false", "0", "no", "off"].includes(
        normalized
      )
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

  return String(value).trim();
};

// ============================================================
// ESCAPE REGEX
// ============================================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
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
// NORMALIZE URL ARRAY
// ============================================================

const normalizeUrlArray = (
  value
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (url) =>
        typeof url === "string" &&
        url.trim()
    )
    .map((url) => url.trim());
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

    const uploadMarker = "/upload/";

    const uploadIndex =
      url.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = url.substring(
      uploadIndex +
        uploadMarker.length
    );

    const parts = publicId.split("/");

    // Remove transformations.
    while (
      parts.length > 0 &&
      (
        parts[0].includes("_") ||
        parts[0].includes(",")
      )
    ) {
      parts.shift();
    }

    publicId = parts.join("/");

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

const deleteFromCloudinary = async (
  fileUrl,
  resourceType = "image"
) => {
  try {
    const publicId =
      getCloudinaryPublicId(fileUrl);

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
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

        const mimetype =
          file.mimetype || "";

        const isVideo =
          mimetype.startsWith(
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
              public_id: publicId,
            },
            (error, result) => {
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
// UPLOAD MULTIPLE FILES
// ============================================================

const uploadFiles = async (
  files = []
) => {
  const safeFiles =
    Array.isArray(files)
      ? files
      : [];

  const imageFiles =
    safeFiles
      .filter(
        (file) =>
          file?.mimetype?.startsWith(
            "image/"
          )
      )
      .slice(
        0,
        MAX_IMAGES
      );

  const videoFiles =
    safeFiles
      .filter(
        (file) =>
          file?.mimetype?.startsWith(
            "video/"
          )
      )
      .slice(
        0,
        MAX_VIDEOS
      );

  const [
    imageResults,
    videoResults,
  ] = await Promise.all([
    Promise.all(
      imageFiles.map(
        uploadToCloudinary
      )
    ),

    Promise.all(
      videoFiles.map(
        uploadToCloudinary
      )
    ),
  ]);

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
// VALIDATE FILE COUNT
// ============================================================

const validateFiles = (
  files = []
) => {
  const imageCount =
    files.filter((file) =>
      file?.mimetype?.startsWith(
        "image/"
      )
    ).length;

  const videoCount =
    files.filter((file) =>
      file?.mimetype?.startsWith(
        "video/"
      )
    ).length;

  if (imageCount > MAX_IMAGES) {
    return {
      valid: false,
      message: `Maximum ${MAX_IMAGES} images are allowed.`,
    };
  }

  if (videoCount > MAX_VIDEOS) {
    return {
      valid: false,
      message: `Maximum ${MAX_VIDEOS} video is allowed.`,
    };
  }

  return {
    valid: true,
  };
};

// ============================================================
// SYNC LEGACY IMAGE FIELD
// ============================================================

const syncLegacyImage = (
  product
) => {
  const images =
    normalizeUrlArray(
      product.images
    );

  product.images = images;

  product.image =
    images.length > 0
      ? images[0]
      : "";
};

// ============================================================
// GET PRODUCT PUBLIC DATA
// ============================================================
//
// IMPORTANT:
// We do NOT inject iPhone/laptop specs here.
// The product is returned exactly according to
// the information stored for that product.
// ============================================================

const getProductResponse = (
  product
) => {
  return product;
};

// ============================================================
// TEST ROUTE
// ============================================================

router.get(
  "/test",
  (req, res) => {
    return res.json({
      success: true,
      message:
        "Products router is alive!",
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
      // CATEGORY
      // --------------------------------------------------------

      if (
        category &&
        category !== "all"
      ) {
        if (
          !VALID_CATEGORIES.includes(
            category
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product category",
          });
        }

        filter.category =
          category;
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
          escapeRegex(
            search.trim()
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
      // PAGINATION
      // --------------------------------------------------------

      const parsedLimit = Math.min(
        Math.max(
          parseInt(limit, 10) || 20,
          1
        ),
        100
      );

      const parsedPage = Math.max(
        parseInt(page, 10) || 1,
        1
      );

      const skip =
        (parsedPage - 1) *
        parsedLimit;

      // --------------------------------------------------------
      // QUERY
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
          total / parsedLimit
        );

      return res.json({
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

      return res.status(500).json({
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

      // --------------------------------------------------------
      // Increment views safely
      // --------------------------------------------------------

      product.views =
        Number(product.views || 0) +
        1;

      await product.save();

      return res.json({
        success: true,
        product:
          getProductResponse(
            product
          ),
      });
    } catch (error) {
      console.error(
        "❌ Error fetching product:",
        error
      );

      return res.status(500).json({
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
    MAX_FILES
  ),

  async (req, res) => {
    const uploadedImages = [];
    const uploadedVideos = [];

    try {
      console.log(
        "📩 POST /api/products"
      );

      console.log(
        "👤 User:",
        req.userId
      );

      console.log(
        "📦 Files:",
        req.files?.length || 0
      );

      // --------------------------------------------------------
      // AUTHENTICATION
      // --------------------------------------------------------

      const sellerId =
        getCurrentUserId(req);

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      if (
        !isValidObjectId(
          sellerId
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authenticated user",
        });
      }

      // --------------------------------------------------------
      // FILE VALIDATION
      // --------------------------------------------------------

      const fileValidation =
        validateFiles(
          req.files || []
        );

      if (!fileValidation.valid) {
        return res.status(400).json({
          success: false,
          message:
            fileValidation.message,
        });
      }

      // --------------------------------------------------------
      // BODY
      // --------------------------------------------------------

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

      if (cleanTitle.length > 200) {
        return res.status(400).json({
          success: false,
          message:
            "Product title cannot exceed 200 characters",
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
      // OLD PRICE
      // --------------------------------------------------------

      let parsedOldPrice = null;

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

      // --------------------------------------------------------
      // PHONE
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
      // CATEGORY
      // --------------------------------------------------------

      const selectedCategory =
        cleanString(
          category,
          "Other"
        ) || "Other";

      if (
        !VALID_CATEGORIES.includes(
          selectedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product category",
        });
      }

      // --------------------------------------------------------
      // CONDITION
      // --------------------------------------------------------

      const selectedCondition =
        cleanString(
          condition,
          "Good"
        ) || "Good";

      if (
        !VALID_CONDITIONS.includes(
          selectedCondition
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product condition",
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
          parseNumber(
            batteryHealth
          );

        if (
          parsedBatteryHealth ===
            null ||
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
      // UPLOAD FILES
      // --------------------------------------------------------

      const {
        images,
        videos,
      } = await uploadFiles(
        req.files || []
      );

      uploadedImages.push(
        ...images
      );

      uploadedVideos.push(
        ...videos
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
      // PRODUCT DATA
      // --------------------------------------------------------
      //
      // IMPORTANT:
      // These fields come ONLY from the submitted product.
      //
      // A laptop will not receive iPhone values.
      // A phone will not receive laptop values unless
      // the frontend actually sends them.
      // --------------------------------------------------------

      const productData = {
        title: cleanTitle,

        price: parsedPrice,

        oldPrice: parsedOldPrice,

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

        image:
          images.length > 0
            ? images[0]
            : "",

        status: "active",
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

      return res.status(201).json({
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
      // CLEAN UP CLOUDINARY IF DATABASE SAVE FAILS
      // --------------------------------------------------------

      for (
        const image of
          uploadedImages
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      for (
        const video of
          uploadedVideos
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      // --------------------------------------------------------
      // MONGOOSE VALIDATION
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

      return res.status(500).json({
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
    MAX_FILES
  ),

  async (req, res) => {
    const uploadedImages = [];
    const uploadedVideos = [];

    try {
      const { id } =
        req.params;

      // --------------------------------------------------------
      // VALIDATE ID
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
      // FILE VALIDATION
      // --------------------------------------------------------

      const fileValidation =
        validateFiles(
          req.files || []
        );

      if (!fileValidation.valid) {
        return res.status(400).json({
          success: false,
          message:
            fileValidation.message,
        });
      }

      // --------------------------------------------------------
      // FIND PRODUCT
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
      // AUTHENTICATION
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
      // AUTHORIZATION
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
      // BODY
      // --------------------------------------------------------

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
        const cleanTitle =
          cleanString(title);

        if (!cleanTitle) {
          return res.status(400).json({
            success: false,
            message:
              "Product title cannot be empty",
          });
        }

        if (
          cleanTitle.length > 200
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product title cannot exceed 200 characters",
          });
        }

        product.title =
          cleanTitle;
      }

      // --------------------------------------------------------
      // PRICE
      // --------------------------------------------------------

      if (
        price !== undefined &&
        price !== ""
      ) {
        const parsedPrice =
          parseNumber(price);

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
      // CATEGORY
      // --------------------------------------------------------

      if (
        category !== undefined
      ) {
        const selectedCategory =
          cleanString(
            category
          );

        if (
          !VALID_CATEGORIES.includes(
            selectedCategory
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product category",
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
      // BRAND
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
      // MODEL
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
          cleanString(
            color
          );
      }

      // --------------------------------------------------------
      // CONDITION
      // --------------------------------------------------------

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
              "Invalid product condition",
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
            parseNumber(
              batteryHealth
            );

          if (
            parsedBatteryHealth ===
              null ||
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

      // ========================================================
      // EXISTING IMAGES
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
        const normalizedImages =
          normalizeUrlArray(
            imagesToKeep
          ).slice(
            0,
            MAX_IMAGES
          );

        const oldImages =
          normalizeUrlArray(
            product.images
          );

        // Delete images removed by seller.
        for (
          const oldImage of oldImages
        ) {
          if (
            !normalizedImages.includes(
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
          normalizedImages;
      }

      // ========================================================
      // EXISTING VIDEOS
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
        const normalizedVideos =
          normalizeUrlArray(
            videosToKeep
          ).slice(
            0,
            MAX_VIDEOS
          );

        const oldVideos =
          normalizeUrlArray(
            product.videos
          );

        for (
          const oldVideo of oldVideos
        ) {
          if (
            !normalizedVideos.includes(
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
          normalizedVideos;
      }

      // ========================================================
      // NEW FILES
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

        uploadedImages.push(
          ...images
        );

        uploadedVideos.push(
          ...videos
        );

        // ------------------------------------------------------
        // ADD NEW IMAGES
        // ------------------------------------------------------

        if (
          images.length > 0
        ) {
          const currentImages =
            normalizeUrlArray(
              product.images
            );

          const remainingSlots =
            Math.max(
              MAX_IMAGES -
                currentImages.length,
              0
            );

          const imagesToAdd =
            images.slice(
              0,
              remainingSlots
            );

          product.images = [
            ...currentImages,
            ...imagesToAdd,
          ];
        }

        // ------------------------------------------------------
        // ADD NEW VIDEOS
        // ------------------------------------------------------

        if (
          videos.length > 0
        ) {
          const currentVideos =
            normalizeUrlArray(
              product.videos
            );

          const remainingVideoSlots =
            Math.max(
              MAX_VIDEOS -
                currentVideos.length,
              0
            );

          const videosToAdd =
            videos.slice(
              0,
              remainingVideoSlots
            );

          product.videos = [
            ...currentVideos,
            ...videosToAdd,
          ];
        }
      }

      // ========================================================
      // SYNCHRONIZE LEGACY IMAGE
      // ========================================================

      syncLegacyImage(
        product
      );

      // ========================================================
      // SAVE
      // ========================================================

      await product.save();

      console.log(
        `✅ Product updated: ${product._id}`
      );

      return res.json({
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

      // --------------------------------------------------------
      // CLEAN UP NEWLY UPLOADED FILES
      // --------------------------------------------------------

      for (
        const image of
          uploadedImages
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      for (
        const video of
          uploadedVideos
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      // --------------------------------------------------------
      // MONGOOSE VALIDATION
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

      return res.status(500).json({
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

      // --------------------------------------------------------
      // VALIDATE ID
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
      // FIND PRODUCT
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
      // AUTHENTICATION
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
      // AUTHORIZATION
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
            "Not authorized to delete this product",
        });
      }

      // --------------------------------------------------------
      // DELETE IMAGES
      // --------------------------------------------------------

      const images =
        normalizeUrlArray(
          product.images
        );

      for (
        const image of images
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      // --------------------------------------------------------
      // DELETE VIDEOS
      // --------------------------------------------------------

      const videos =
        normalizeUrlArray(
          product.videos
        );

      for (
        const video of videos
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      // --------------------------------------------------------
      // DELETE DATABASE RECORD
      // --------------------------------------------------------

      await product.deleteOne();

      console.log(
        `🗑️ Product deleted: ${id}`
      );

      return res.json({
        success: true,

        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "❌ Error deleting product:",
        error
      );

      return res.status(500).json({
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
      // VALIDATE STATUS
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
            "Invalid status. Allowed: active, pending, inactive, sold",
        });
      }

      // --------------------------------------------------------
      // VALIDATE ID
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
      // FIND PRODUCT
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
      // AUTHENTICATION
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
      // AUTHORIZATION
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
      // UPDATE STATUS
      // --------------------------------------------------------

      product.status =
        status;

      await product.save();

      console.log(
        `✅ Product ${id} status changed to ${status}`
      );

      return res.json({
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

      return res.status(500).json({
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