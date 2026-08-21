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

// ------------------------------------------------------------
// ObjectId validation
// ------------------------------------------------------------

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
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
    const normalized =
      value.trim().toLowerCase();

    if (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes"
    ) {
      return true;
    }

    if (
      normalized === "false" ||
      normalized === "0" ||
      normalized === "no"
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

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

const normalizeCategory = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "Other";
  }

  const category = String(value)
    .trim()
    .toLowerCase();

  const categoryMap = {
    // Cars
    car: "Cars",
    cars: "Cars",
    automobile: "Cars",
    automobiles: "Cars",
    vehicle: "Cars",
    vehicles: "Cars",

    // Phones
    phone: "Phones",
    phones: "Phones",
    mobile: "Phones",
    mobiles: "Phones",
    mobilephone: "Phones",
    mobilephones: "Phones",
    smartphone: "Phones",
    smartphones: "Phones",
    iphone: "Phones",
    iphones: "Phones",
    android: "Phones",

    // Laptops
    laptop: "Laptops",
    laptops: "Laptops",
    notebook: "Laptops",
    notebooks: "Laptops",
    computer: "Laptops",
    computers: "Laptops",
    pc: "Laptops",

    // Tablets
    tablet: "Tablets",
    tablets: "Tablets",
    ipad: "Tablets",
    ipads: "Tablets",

    // Accessories
    accessory: "Accessories",
    accessories: "Accessories",

    // Real Estate
    "real estate": "Real Estate",
    realestate: "Real Estate",
    property: "Real Estate",
    properties: "Real Estate",
    land: "Real Estate",
    house: "Real Estate",
    houses: "Real Estate",
    apartment: "Real Estate",
    apartments: "Real Estate",

    // Jobs
    job: "Jobs",
    jobs: "Jobs",
    employment: "Jobs",
    career: "Jobs",
    careers: "Jobs",

    // Electronics
    electronic: "Electronics",
    electronics: "Electronics",

    // Fashion
    fashion: "Fashion",
    clothing: "Fashion",
    clothes: "Fashion",

    // Home
    home: "Home",
    household: "Home",
    furniture: "Home",

    // Other
    other: "Other",
  };

  return categoryMap[category] || null;
};

// ============================================================
// CONDITION NORMALIZATION
// ============================================================

const normalizeCondition = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "Good";
  }

  const condition = String(value)
    .trim()
    .toLowerCase();

  const conditionMap = {
    "brand new": "Brand New",
    brandnew: "Brand New",
    new: "Brand New",

    "like new": "Like New",
    likenew: "Like New",

    excellent: "Excellent",
    excellentcondition: "Excellent",

    good: "Good",
    goodcondition: "Good",

    fair: "Fair",
    faircondition: "Fair",

    poor: "Poor",
    poorcondition: "Poor",
  };

  return conditionMap[condition] || null;
};

// ============================================================
// FACE ID NORMALIZATION
// ============================================================

const normalizeFaceId = (value) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "";
  }

  const faceId = String(value)
    .trim()
    .toLowerCase();

  if (faceId === "working") {
    return "Working";
  }

  if (
    faceId === "not working" ||
    faceId === "notworking"
  ) {
    return "Not Working";
  }

  if (
    faceId === "not available" ||
    faceId === "notavailable"
  ) {
    return "Not Available";
  }

  return null;
};

// ============================================================
// STATUS NORMALIZATION
// ============================================================

const normalizeStatus = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const status = String(value)
    .trim()
    .toLowerCase();

  if (
    VALID_STATUSES.includes(status)
  ) {
    return status;
  }

  return null;
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

    let publicId = url.substring(
      uploadIndex +
        uploadMarker.length
    );

    const parts =
      publicId.split("/");

    // Remove transformations.
    while (
      parts.length > 0 &&
      (
        parts[0].includes("_") ||
        parts[0].includes(",") ||
        parts[0].startsWith("c_") ||
        parts[0].startsWith("w_") ||
        parts[0].startsWith("h_") ||
        parts[0].startsWith("q_") ||
        parts[0].startsWith("f_")
      )
    ) {
      parts.shift();
    }

    publicId = parts.join("/");

    // Remove version.
    publicId =
      publicId.replace(
        /^v\d+\//,
        ""
      );

    // Remove extension.
    publicId =
      publicId.replace(
        /\.[^/.]+$/,
        ""
      );

    return publicId || null;
  } catch (error) {
    console.error(
      "❌ Failed to extract Cloudinary public ID:",
      error.message
    );

    return null;
  }
};

// ------------------------------------------------------------
// Delete Cloudinary file
// ------------------------------------------------------------

const deleteFromCloudinary = async (
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
      `🗑️ Cloudinary file deleted: ${publicId}`
    );
  } catch (error) {
    console.error(
      "❌ Cloudinary delete error:",
      error.message
    );
  }
};

// ------------------------------------------------------------
// Upload buffer to Cloudinary
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

// ------------------------------------------------------------
// Upload multiple files
// ------------------------------------------------------------

const uploadFiles = async (
  files
) => {
  const allFiles =
    Array.isArray(files)
      ? files
      : [];

  const imageFiles =
    allFiles
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
    allFiles
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
// ARRAY PARSER
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
        url.trim() !== ""
    )
    .map((url) =>
      url.trim()
    );
};

// ============================================================
// GET USER ID
// ============================================================

const getCurrentUserId = (
  req
) => {
  return (
    req.userId ||
    req.user?.id ||
    req.user?._id ||
    null
  );
};

// ============================================================
// CHECK PRODUCT OWNER
// ============================================================

const isProductOwnerOrAdmin = (
  product,
  req
) => {
  const currentUserId =
    getCurrentUserId(req);

  if (!currentUserId) {
    return false;
  }

  const isOwner =
    product.sellerId &&
    product.sellerId
      .toString() ===
      currentUserId.toString();

  const isAdmin =
    req.user?.role === "admin";

  return (
    isOwner ||
    isAdmin
  );
};

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

        if (!normalizedCategory) {
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
        const normalizedStatus =
          normalizeStatus(
            status
          );

        if (!normalizedStatus) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product status",
            allowedStatuses:
              VALID_STATUSES,
          });
        }

        filter.status =
          normalizedStatus;
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

      // Increment views.
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
    6
  ),

  async (req, res) => {
    let uploadedImages = [];
    let uploadedVideos = [];

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

      // --------------------------------------------------------
      // Authentication
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

      // --------------------------------------------------------
      // Request body
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
      } = req.body;

      // --------------------------------------------------------
      // Title
      // --------------------------------------------------------

      if (
        !title ||
        !String(title).trim()
      ) {
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
      // Seller phone
      // --------------------------------------------------------

      if (
        !sellerPhone ||
        !String(sellerPhone).trim()
      ) {
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
        normalizeCategory(
          category
        );

      if (!selectedCategory) {
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

      if (!selectedCondition) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product condition: ${condition}`,
          allowedConditions:
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
      // Face ID
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
      // Upload files
      // --------------------------------------------------------

      const {
        images,
        videos,
      } = await uploadFiles(
        req.files || []
      );

      uploadedImages =
        images;

      uploadedVideos =
        videos;

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
          String(title).trim(),

        price:
          parsedPrice,

        category:
          selectedCategory,

        location:
          location &&
          String(location).trim()
            ? String(
                location
              ).trim()
            : "Ghana",

        description:
          description
            ? String(
                description
              ).trim()
            : "",

        sellerId,

        sellerName:
          sellerName &&
          String(sellerName).trim()
            ? String(
                sellerName
              ).trim()
            : req.user?.name || "",

        sellerPhone:
          String(
            sellerPhone
          ).trim(),

        brand:
          brand
            ? String(
                brand
              ).trim()
            : "",

        model:
          model
            ? String(
                model
              ).trim()
            : "",

        ram:
          ram
            ? String(
                ram
              ).trim()
            : "",

        storage:
          storage
            ? String(
                storage
              ).trim()
            : "",

        color:
          color
            ? String(
                color
              ).trim()
            : "",

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
          simStatus
            ? String(
                simStatus
              ).trim()
            : "",

        batteryHealth:
          parsedBatteryHealth,

        faceId:
          selectedFaceId,

        images,

        videos,

        // Legacy image field.
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
      // Cleanup uploaded files if DB save fails
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

      if (
        error &&
        error.name ===
          "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors: Object.keys(
            error.errors || {}
          ).reduce(
            (acc, key) => {
              acc[key] =
                error.errors[key]
                  .message;

              return acc;
            },
            {}
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
    6
  ),

  async (req, res) => {
    let newlyUploadedImages = [];
    let newlyUploadedVideos = [];

    try {
      const { id } =
        req.params;

      // --------------------------------------------------------
      // Validate ID
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
      // Find product
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
      // Authentication
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

      if (
        !isProductOwnerOrAdmin(
          product,
          req
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to update this product",
        });
      }

      // --------------------------------------------------------
      // Request body
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
        status,
        oldPrice,
      } = req.body;

      // ========================================================
      // BASIC FIELDS
      // ========================================================

      // --------------------------------------------------------
      // Title
      // --------------------------------------------------------

      if (
        title !== undefined
      ) {
        const newTitle =
          String(title).trim();

        if (!newTitle) {
          return res.status(400).json({
            success: false,
            message:
              "Product title cannot be empty",
          });
        }

        product.title =
          newTitle;
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
      // Old price
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

      // ========================================================
      // CATEGORY
      // ========================================================

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
            allowedCategories:
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
          String(
            location
          ).trim();
      }

      // --------------------------------------------------------
      // Description
      // --------------------------------------------------------

      if (
        description !== undefined
      ) {
        product.description =
          String(
            description
          ).trim();
      }

      // --------------------------------------------------------
      // Seller name
      // --------------------------------------------------------

      if (
        sellerName !== undefined
      ) {
        product.sellerName =
          String(
            sellerName
          ).trim();
      }

      // --------------------------------------------------------
      // Seller phone
      // --------------------------------------------------------

      if (
        sellerPhone !== undefined
      ) {
        const phone =
          String(
            sellerPhone
          ).trim();

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
          String(
            brand
          ).trim();
      }

      // --------------------------------------------------------
      // Model
      // --------------------------------------------------------

      if (
        model !== undefined
      ) {
        product.model =
          String(
            model
          ).trim();
      }

      // --------------------------------------------------------
      // RAM
      // --------------------------------------------------------

      if (
        ram !== undefined
      ) {
        product.ram =
          String(
            ram
          ).trim();
      }

      // --------------------------------------------------------
      // Storage
      // --------------------------------------------------------

      if (
        storage !== undefined
      ) {
        product.storage =
          String(
            storage
          ).trim();
      }

      // --------------------------------------------------------
      // Color
      // --------------------------------------------------------

      if (
        color !== undefined
      ) {
        product.color =
          String(
            color
          ).trim();
      }

      // ========================================================
      // CONDITION
      // ========================================================

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
            allowedConditions:
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
        negotiation !== undefined
      ) {
        product.negotiation =
          parseBoolean(
            negotiation
          );
      }

      // --------------------------------------------------------
      // Swap
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
        simStatus !== undefined
      ) {
        product.simStatus =
          String(
            simStatus
          ).trim();
      }

      // ========================================================
      // BATTERY HEALTH
      // ========================================================

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

      // ========================================================
      // FACE ID
      // ========================================================

      if (
        faceId !== undefined
      ) {
        const normalizedFaceId =
          normalizeFaceId(
            faceId
          );

        if (
          normalizedFaceId ===
          null
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
          normalizedFaceId;
      }

      // ========================================================
      // STATUS
      // ========================================================

      if (
        status !== undefined
      ) {
        const normalizedStatus =
          normalizeStatus(
            status
          );

        if (!normalizedStatus) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid product status: ${status}`,
            allowedStatuses:
              VALID_STATUSES,
          });
        }

        product.status =
          normalizedStatus;
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
        const cleanedImages =
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

        // Delete removed images.
        for (
          const oldImage of
            oldImages
        ) {
          if (
            !cleanedImages.includes(
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
          cleanedImages;
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
        const cleanedVideos =
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

        // Delete removed videos.
        for (
          const oldVideo of
            oldVideos
        ) {
          if (
            !cleanedVideos.includes(
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
          cleanedVideos;
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

        newlyUploadedImages =
          images;

        newlyUploadedVideos =
          videos;

        // ------------------------------------------------------
        // Images
        // ------------------------------------------------------

        if (
          images.length > 0
        ) {
          const currentImages =
            cleanUrlArray(
              product.images
            );

          product.images = [
            ...currentImages,
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
          const currentVideos =
            cleanUrlArray(
              product.videos
            );

          product.videos = [
            ...currentVideos,
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

      // --------------------------------------------------------
      // Cleanup newly uploaded files if update fails
      // --------------------------------------------------------

      for (
        const image of
          newlyUploadedImages
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      for (
        const video of
          newlyUploadedVideos
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      if (
        error &&
        error.name ===
          "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors: Object.keys(
            error.errors || {}
          ).reduce(
            (acc, key) => {
              acc[key] =
                error.errors[key]
                  .message;

              return acc;
            },
            {}
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

      // --------------------------------------------------------
      // Validate ID
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
      // Find product
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
      // Authentication
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

      if (
        !isProductOwnerOrAdmin(
          product,
          req
        )
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

      const images =
        cleanUrlArray(
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
      // Delete videos
      // --------------------------------------------------------

      const videos =
        cleanUrlArray(
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
      // Delete DB record
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
      // Validate ID
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
      // Normalize status
      // --------------------------------------------------------

      const normalizedStatus =
        normalizeStatus(
          status
        );

      if (!normalizedStatus) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid status: ${status}`,
          allowedStatuses:
            VALID_STATUSES,
        });
      }

      // --------------------------------------------------------
      // Find product
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
      // Authentication
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

      if (
        !isProductOwnerOrAdmin(
          product,
          req
        )
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
        normalizedStatus;

      await product.save();

      console.log(
        `✅ Product ${id} status updated to ${normalizedStatus}`
      );

      res.json({
        success: true,
        message:
          `Product status updated to ${normalizedStatus}`,
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