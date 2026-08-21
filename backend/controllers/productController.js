// ============================================================
// backend/controllers/productController.js
// BuyUKUsed Product Controller
// ============================================================

const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ============================================================
// CONSTANTS
// ============================================================

const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "Accessories",
  "Real Estate",
  "Jobs",
  "Electronics",
  "Fashion",
  "Home",
  "TVs",
  "Game Consoles",
  "Smartwatches",
  "Other",
];

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

const normalizeCategory = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "Other";
  }

  const raw = String(value)
    .trim()
    .toLowerCase();

  if (!raw) {
    return "Other";
  }

  const normalized = raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const categoryMap = {
    // Cars
    car: "Cars",
    cars: "Cars",
    automobile: "Cars",
    automobiles: "Cars",

    // Phones
    phone: "Phones",
    phones: "Phones",
    mobile: "Phones",
    mobiles: "Phones",
    smartphone: "Phones",
    smartphones: "Phones",

    // Laptops
    laptop: "Laptops",
    laptops: "Laptops",
    notebook: "Laptops",
    notebooks: "Laptops",

    // Tablets
    tablet: "Tablets",
    tablets: "Tablets",
    ipad: "Tablets",
    ipads: "Tablets",

    // Accessories
    accessory: "Accessories",
    accessories: "Accessories",

    // Real estate
    "real estate": "Real Estate",
    property: "Real Estate",
    properties: "Real Estate",

    // Jobs
    job: "Jobs",
    jobs: "Jobs",
    employment: "Jobs",

    // Electronics
    electronic: "Electronics",
    electronics: "Electronics",

    // Fashion
    fashion: "Fashion",
    clothing: "Fashion",
    clothes: "Fashion",

    // Home
    home: "Home",
    homes: "Home",

    // TVs
    tv: "TVs",
    tvs: "TVs",
    television: "TVs",
    televisions: "TVs",

    // Game consoles
    console: "Game Consoles",
    consoles: "Game Consoles",
    "game console": "Game Consoles",
    "game consoles": "Game Consoles",
    gaming: "Game Consoles",

    // Smartwatches
    watch: "Smartwatches",
    watches: "Smartwatches",
    smartwatch: "Smartwatches",
    smartwatches: "Smartwatches",
    "smart watch": "Smartwatches",
    "smart watches": "Smartwatches",

    // Other
    other: "Other",
  };

  return (
    categoryMap[normalized] ||
    VALID_CATEGORIES.find(
      (category) =>
        category.toLowerCase() ===
        normalized
    ) ||
    "Other"
  );
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

  const status = String(value)
    .trim()
    .toLowerCase();

  if (
    VALID_STATUSES.includes(status)
  ) {
    return status;
  }

  return "active";
};

// ============================================================
// HELPERS
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

  if (typeof value === "string") {
    return (
      value.toLowerCase() === "true"
    );
  }

  return Boolean(value);
};

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

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

  return typeof value === "string"
    ? value.trim()
    : String(value).trim();
};

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

const getUserRole = (req) => {
  return req.user?.role || "";
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadToCloudinary = (
  buffer,
  resourceType = "image",
  folder = "sell-platform/products"
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
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

const deleteFromCloudinary = async (
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
      fileUrl.indexOf("/upload/");

    if (uploadIndex === -1) {
      return;
    }

    let publicId = fileUrl.substring(
      uploadIndex + "/upload/".length
    );

    publicId = publicId.replace(
      /^v\d+\//,
      ""
    );

    publicId = publicId.replace(
      /\.[^/.]+$/,
      ""
    );

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
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

const uploadProductFiles = async (
  files
) => {
  const imageUrls = [];
  const videoUrls = [];

  if (
    !files ||
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
      file.mimetype &&
      file.mimetype.startsWith(
        "image/"
      )
    ) {
      const result =
        await uploadToCloudinary(
          file.buffer,
          "image"
        );

      if (result?.secure_url) {
        imageUrls.push(
          result.secure_url
        );
      }
    } else if (
      file.mimetype &&
      file.mimetype.startsWith(
        "video/"
      )
    ) {
      const result =
        await uploadToCloudinary(
          file.buffer,
          "video"
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
  return {
    // --------------------------------------------------------
    // BASIC
    // --------------------------------------------------------

    title: cleanString(body.title),

    price: toNumberOrNull(
      body.price
    ),

    oldPrice: toNumberOrNull(
      body.oldPrice
    ),

    // IMPORTANT:
    // Every category is normalized here.
    category: normalizeCategory(
      body.category
    ),

    location:
      cleanString(
        body.location
      ) || "Ghana",

    description:
      cleanString(
        body.description
      ),

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

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
      ),

    // --------------------------------------------------------
    // GENERAL
    // --------------------------------------------------------

    brand:
      cleanString(body.brand),

    model:
      cleanString(body.model),

    color:
      cleanString(body.color),

    condition:
      cleanString(
        body.condition
      ) || "Good",

    warranty:
      cleanString(body.warranty),

    // --------------------------------------------------------
    // COMPUTER / TABLET / WATCH
    // --------------------------------------------------------

    storage:
      cleanString(body.storage),

    ram:
      cleanString(body.ram),

    processor:
      cleanString(body.processor),

    graphics:
      cleanString(body.graphics),

    screenSize:
      cleanString(body.screenSize),

    year:
      cleanString(body.year),

    connectivity:
      cleanString(
        body.connectivity
      ),

    // --------------------------------------------------------
    // CONSOLE
    // --------------------------------------------------------

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
      cleanString(body.discDrive),

    controllersIncluded:
      cleanString(
        body.controllersIncluded
      ),

    battery:
      cleanString(body.battery),

    resolution:
      cleanString(
        body.resolution
      ),

    // --------------------------------------------------------
    // SMARTWATCH
    // --------------------------------------------------------

    watchSize:
      cleanString(body.watchSize),

    // --------------------------------------------------------
    // TV
    // --------------------------------------------------------

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

    operatingSystem:
      cleanString(
        body.operatingSystem
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

    // --------------------------------------------------------
    // CAR
    // --------------------------------------------------------

    mileage:
      toNumberOrNull(
        body.mileage
      ),

    bodyType:
      cleanString(body.bodyType),

    fuelType:
      cleanString(body.fuelType),

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

    // --------------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------------

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
      cleanString(body.material),

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

    // --------------------------------------------------------
    // PHONE
    // --------------------------------------------------------

    batteryHealth:
      toNumberOrNull(
        body.batteryHealth
      ),

    faceId:
      cleanString(body.faceId),

    simStatus:
      cleanString(
        body.simStatus
      ),

    // --------------------------------------------------------
    // SELLING
    // --------------------------------------------------------

    negotiation:
      toBoolean(
        body.negotiation
      ),

    swapAccepted:
      toBoolean(
        body.swapAccepted
      ),

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    status:
      normalizeStatus(
        body.status
      ),
  };
};

// ============================================================
// VALIDATE PRODUCT
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

  if (
    !data.sellerPhone ||
    !data.sellerPhone.trim()
  ) {
    errors.push(
      "Seller phone number is required"
    );
  }

  if (
    !VALID_CATEGORIES.includes(
      data.category
    )
  ) {
    errors.push(
      "Invalid product category"
    );
  }

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    errors.push(
      "Invalid product status"
    );
  }

  return errors;
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

      // ------------------------------------------------------
      // STATUS
      // ------------------------------------------------------

      if (status) {
        const normalizedStatus =
          normalizeStatus(status);

        if (
          VALID_STATUSES.includes(
            normalizedStatus
          )
        ) {
          query.status =
            normalizedStatus;
        }
      } else {
        query.status = "active";
      }

      // ------------------------------------------------------
      // CATEGORY
      // ------------------------------------------------------

      if (category) {
        const normalizedCategory =
          normalizeCategory(
            category
          );

        if (
          normalizedCategory !==
          "Other" ||
          String(category)
            .trim()
            .toLowerCase() ===
            "other"
        ) {
          query.category =
            normalizedCategory;
        }
      }

      // ------------------------------------------------------
      // LOCATION
      // ------------------------------------------------------

      if (location) {
        query.location = {
          $regex: String(
            location
          ).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          $options: "i",
        };
      }

      // ------------------------------------------------------
      // CONDITION
      // ------------------------------------------------------

      if (condition) {
        query.condition =
          condition;
      }

      // ------------------------------------------------------
      // BRAND
      // ------------------------------------------------------

      if (brand) {
        query.brand = {
          $regex: String(
            brand
          ).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          $options: "i",
        };
      }

      // ------------------------------------------------------
      // MODEL
      // ------------------------------------------------------

      if (model) {
        query.model = {
          $regex: String(
            model
          ).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          ),
          $options: "i",
        };
      }

      // ------------------------------------------------------
      // SELLER
      // ------------------------------------------------------

      if (sellerId) {
        query.sellerId =
          sellerId;
      }

      // ------------------------------------------------------
      // PRICE
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // SEARCH
      // ------------------------------------------------------

      if (search) {
        const safeSearch =
          String(search)
            .trim()
            .replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
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
            {
              tvType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
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

      // ------------------------------------------------------
      // DATABASE QUERY
      // ------------------------------------------------------

      const products =
        await Product.find(query)
          .populate(
            "sellerId",
            "name email phone location avatar"
          )
          .limit(limitNumber)
          .skip(
            (pageNumber - 1) *
              limitNumber
          )
          .sort({
            createdAt: -1,
          });

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

      const product =
        await Product.findById(
          id
        ).populate(
          "sellerId",
          "name email phone location avatar"
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      await Product.findByIdAndUpdate(
        id,
        {
          $inc: {
            views: 1,
          },
        }
      );

      product.views =
        (product.views || 0) +
        1;

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
        "========================================"
      );

      console.log(
        "📥 CREATE PRODUCT REQUEST"
      );

      console.log(
        "📦 Raw category:",
        req.body?.category
      );

      console.log(
        "📦 Raw title:",
        req.body?.title
      );

      console.log(
        "========================================"
      );

      // ------------------------------------------------------
      // AUTHENTICATION
      // ------------------------------------------------------

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // ------------------------------------------------------
      // BUILD PRODUCT
      // ------------------------------------------------------

      const productData =
        buildProductData(
          req.body,
          req
        );

      productData.sellerId =
        userId;

      // ------------------------------------------------------
      // SHOW NORMALIZED CATEGORY
      // ------------------------------------------------------

      console.log(
        "📂 Normalized category:",
        productData.category
      );

      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      const validationErrors =
        validateProductData(
          productData
        );

      if (
        validationErrors.length >
        0
      ) {
        console.error(
          "❌ Product validation:",
          validationErrors
        );

        return res.status(400).json({
          success: false,
          message:
            validationErrors[0],
          errors:
            validationErrors,
        });
      }

      // ------------------------------------------------------
      // UPLOAD FILES
      // ------------------------------------------------------

      const {
        imageUrls,
        videoUrls,
      } =
        await uploadProductFiles(
          req.files
        );

      // ------------------------------------------------------
      // MEDIA
      // ------------------------------------------------------

      productData.images =
        imageUrls;

      productData.videos =
        videoUrls;

      productData.image =
        imageUrls[0] || "";

      // ------------------------------------------------------
      // CREATE
      // ------------------------------------------------------

      const product =
        await Product.create(
          productData
        );

      console.log(
        "✅ Product created:",
        product._id.toString()
      );

      console.log(
        "📂 Category:",
        product.category
      );

      console.log(
        "🖼️ Images:",
        imageUrls.length
      );

      console.log(
        "🎥 Videos:",
        videoUrls.length
      );

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        product,
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
          errors: Object.values(
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
      // AUTHORIZATION
      // ------------------------------------------------------

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
        product.sellerId
          .toString() ===
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

      // ------------------------------------------------------
      // ALLOWED FIELDS
      // ------------------------------------------------------

      const allowedFields = [
        "title",
        "price",
        "oldPrice",
        "category",
        "location",
        "description",

        "sellerName",
        "sellerPhone",

        "brand",
        "model",
        "color",
        "condition",
        "warranty",

        "storage",
        "ram",
        "processor",
        "graphics",
        "screenSize",
        "year",
        "connectivity",

        "videoOutput",
        "region",
        "consoleType",
        "edition",
        "discDrive",
        "controllersIncluded",
        "battery",
        "resolution",

        "watchSize",

        "tvType",
        "displayTechnology",
        "refreshRate",
        "operatingSystem",
        "hdr",
        "hdmiPorts",
        "usbPorts",
        "smartTV",
        "voiceControl",
        "wallMountable",

        "mileage",
        "bodyType",
        "fuelType",
        "transmission",
        "driveType",
        "engineSize",
        "seatingCapacity",
        "exteriorColor",
        "interiorColor",

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

        "batteryHealth",
        "faceId",
        "simStatus",

        "negotiation",
        "swapAccepted",

        "status",
      ];

      const numericFields = [
        "price",
        "oldPrice",
        "batteryHealth",
        "mileage",
        "seatingCapacity",
      ];

      const booleanFields = [
        "negotiation",
        "swapAccepted",
        "smartTV",
        "voiceControl",
        "wallMountable",
        "wireless",
        "original",
      ];

      // ------------------------------------------------------
      // UPDATE FIELDS
      // ------------------------------------------------------

      for (
        const field of allowedFields
      ) {
        if (
          req.body[field] ===
          undefined
        ) {
          continue;
        }

        const value =
          req.body[field];

        // CATEGORY
        if (
          field === "category"
        ) {
          product.category =
            normalizeCategory(
              value
            );

          continue;
        }

        // STATUS
        if (
          field === "status"
        ) {
          product.status =
            normalizeStatus(
              value
            );

          continue;
        }

        // BOOLEAN
        if (
          booleanFields.includes(
            field
          )
        ) {
          product[field] =
            toBoolean(value);

          continue;
        }

        // NUMBER
        if (
          numericFields.includes(
            field
          )
        ) {
          product[field] =
            toNumberOrNull(
              value
            );

          continue;
        }

        // STRING
        product[field] =
          typeof value ===
          "string"
            ? value.trim()
            : value;
      }

      // ------------------------------------------------------
      // KEEP EXISTING IMAGES
      // ------------------------------------------------------

      let imagesToKeep =
        null;

      if (
        req.body.imagesToKeep !==
        undefined
      ) {
        try {
          imagesToKeep =
            Array.isArray(
              req.body.imagesToKeep
            )
              ? req.body
                  .imagesToKeep
              : JSON.parse(
                  req.body
                    .imagesToKeep
                );
        } catch {
          return res.status(400).json({
            success: false,
            message:
              "imagesToKeep must be valid JSON",
          });
        }
      }

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
          imagesToKeep;

        product.image =
          imagesToKeep[0] ||
          "";
      }

      // ------------------------------------------------------
      // KEEP EXISTING VIDEOS
      // ------------------------------------------------------

      let videosToKeep =
        null;

      if (
        req.body.videosToKeep !==
        undefined
      ) {
        try {
          videosToKeep =
            Array.isArray(
              req.body.videosToKeep
            )
              ? req.body
                  .videosToKeep
              : JSON.parse(
                  req.body
                    .videosToKeep
                );
        } catch {
          return res.status(400).json({
            success: false,
            message:
              "videosToKeep must be valid JSON",
          });
        }
      }

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
          videosToKeep;
      }

      // ------------------------------------------------------
      // UPLOAD NEW FILES
      // ------------------------------------------------------

      if (
        req.files &&
        req.files.length > 0
      ) {
        const {
          imageUrls,
          videoUrls,
        } =
          await uploadProductFiles(
            req.files
          );

        if (
          imageUrls.length > 0
        ) {
          if (
            !Array.isArray(
              product.images
            )
          ) {
            product.images =
              [];
          }

          product.images.push(
            ...imageUrls
          );
        }

        if (
          videoUrls.length > 0
        ) {
          if (
            !Array.isArray(
              product.videos
            )
          ) {
            product.videos =
              [];
          }

          product.videos.push(
            ...videoUrls
          );
        }

        product.image =
          product.images?.[0] ||
          "";
      }

      // ------------------------------------------------------
      // FINAL VALIDATION
      // ------------------------------------------------------

      if (
        !product.title ||
        product.title.trim()
          .length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required",
        });
      }

      if (
        product.price === null ||
        !Number.isFinite(
          product.price
        ) ||
        product.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid product price is required",
        });
      }

      if (
        !product.sellerPhone ||
        !product.sellerPhone.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Seller phone number is required",
        });
      }

      if (
        !VALID_CATEGORIES.includes(
          product.category
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product category",
        });
      }

      await product.save();

      console.log(
        "✅ Product updated:",
        product._id
      );

      console.log(
        "📂 Category:",
        product.category
      );

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
          errors: Object.values(
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
        product.sellerId
          .toString() ===
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

      // ------------------------------------------------------
      // DELETE IMAGES
      // ------------------------------------------------------

      for (
        const image of
          product.images || []
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      // ------------------------------------------------------
      // DELETE VIDEOS
      // ------------------------------------------------------

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
        "🗑️ Product deleted:",
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
            "name email phone location avatar"
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
        req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

      const normalizedStatus =
        normalizeStatus(status);

      if (
        !VALID_STATUSES.includes(
          normalizedStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status",
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
        product.sellerId
          .toString() ===
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

      console.log(
        `✅ Product ${id} status changed to ${normalizedStatus}`
      );

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
          "Server error updating product status",
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
};