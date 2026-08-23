// ============================================================
// backend/controllers/productController.js
// BuyUKUsed Product Controller
// ============================================================

const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ============================================================
// CONSTANTS
// ============================================================

const PRODUCT_CATEGORIES = [
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
  "Cosmetics",
  "Other",
];

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ------------------------------------------------------------
// Clean string
// ------------------------------------------------------------

const cleanString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

// ------------------------------------------------------------
// Convert to number
// ------------------------------------------------------------

const toNumber = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : defaultValue;
};

// ------------------------------------------------------------
// Convert multipart/form-data booleans
// ------------------------------------------------------------

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  );
};

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

const CATEGORY_MAP = new Map([
  // Phones
  ["phones", "Phones"],
  ["phone", "Phones"],

  // Laptops
  ["laptops", "Laptops"],
  ["laptop", "Laptops"],

  // Tablets
  ["tablets", "Tablets"],
  ["tablet", "Tablets"],

  // Accessories
  ["accessories", "Accessories"],
  ["accessory", "Accessories"],

  // Electronics
  ["electronics", "Electronics"],
  ["electronic", "Electronics"],

  // Game Consoles
  ["game consoles", "Game Consoles"],
  ["game console", "Game Consoles"],
  ["gameconsoles", "Game Consoles"],
  ["gameconsole", "Game Consoles"],
  ["gaming consoles", "Game Consoles"],
  ["gaming console", "Game Consoles"],

  // Smartwatches
  ["smartwatches", "Smartwatches"],
  ["smartwatch", "Smartwatches"],
  ["smart watches", "Smartwatches"],
  ["smart watch", "Smartwatches"],
  ["smart-watches", "Smartwatches"],

  // TVs
  ["tvs", "TVs"],
  ["tv", "TVs"],
  ["televisions", "TVs"],
  ["television", "TVs"],

  // Cars
  ["cars", "Cars"],
  ["car", "Cars"],
  ["vehicles", "Cars"],
  ["vehicle", "Cars"],

  // Cosmetics
  ["cosmetics", "Cosmetics"],
  ["cosmetic", "Cosmetics"],
  ["beauty", "Cosmetics"],
  ["beauty products", "Cosmetics"],
  ["beauty product", "Cosmetics"],
  ["makeup", "Cosmetics"],
  ["make-up", "Cosmetics"],

  // Real Estate
  ["real estate", "Real Estate"],
  ["realestate", "Real Estate"],
  ["property", "Real Estate"],
  ["properties", "Real Estate"],

  // Jobs
  ["jobs", "Jobs"],
  ["job", "Jobs"],

  // Fashion
  ["fashion", "Fashion"],

  // Home
  ["home", "Home"],

  // Other
  ["other", "Other"],
]);

// ------------------------------------------------------------
// Normalize category
// ------------------------------------------------------------

const normalizeCategory = (category) => {
  const raw = cleanString(category);

  if (!raw) {
    return null;
  }

  // Already canonical
  if (PRODUCT_CATEGORIES.includes(raw)) {
    return raw;
  }

  const lower = raw.toLowerCase();

  // Direct lookup
  if (CATEGORY_MAP.has(lower)) {
    return CATEGORY_MAP.get(lower);
  }

  // Remove spaces
  const noSpaces = lower.replace(/\s+/g, "");

  if (CATEGORY_MAP.has(noSpaces)) {
    return CATEGORY_MAP.get(noSpaces);
  }

  // Remove spaces and hyphens
  const normalized = lower.replace(/[\s_-]+/g, "");

  if (CATEGORY_MAP.has(normalized)) {
    return CATEGORY_MAP.get(normalized);
  }

  return null;
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      reject(new Error("No file buffer supplied."));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || "auto",
        folder: options.folder || "buyukused/products",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ============================================================
// CREATE PRODUCT
// ============================================================

const createProduct = async (req, res) => {
  try {
    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const body = req.body || {};

    // --------------------------------------------------------
    // Basic information
    // --------------------------------------------------------

    const title = cleanString(body.title);
    const price = toNumber(body.price);
    const category = normalizeCategory(body.category);
    const location = cleanString(body.location) || "Ghana";
    const description = cleanString(body.description);

    const sellerName =
      cleanString(body.sellerName) ||
      cleanString(req.user.name);

    const sellerPhone =
      cleanString(body.sellerPhone) ||
      cleanString(req.user.phone);

    // --------------------------------------------------------
    // Validate title
    // --------------------------------------------------------

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required.",
      });
    }

    // --------------------------------------------------------
    // Validate price
    // --------------------------------------------------------

    if (price === null) {
      return res.status(400).json({
        success: false,
        message: "A valid product price is required.",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Product price cannot be negative.",
      });
    }

    // --------------------------------------------------------
    // Validate category
    // --------------------------------------------------------

    if (!category) {
      console.error(
        "❌ Invalid category received:",
        body.category
      );

      return res.status(400).json({
        success: false,
        message:
          `Invalid product category: ${body.category}. ` +
          `Allowed categories: ${PRODUCT_CATEGORIES.join(", ")}`,
      });
    }

    // --------------------------------------------------------
    // Seller phone
    // --------------------------------------------------------

    if (!sellerPhone) {
      return res.status(400).json({
        success: false,
        message: "Seller phone number is required.",
      });
    }

    // ========================================================
    // BASE PRODUCT DATA
    // ========================================================

    const productData = {
      title,
      price,
      category,
      location,
      description,

      sellerId: req.user._id,

      sellerName,
      sellerPhone,

      brand: cleanString(body.brand),
      model: cleanString(body.model),
      color: cleanString(body.color),
      condition: cleanString(body.condition) || "Good",
      warranty: cleanString(body.warranty),

      negotiation: toBoolean(body.negotiation),
      swapAccepted: toBoolean(body.swapAccepted),

      status: "active",

      promo: toBoolean(body.promo),
      verified: false,

      views: 0,
      yearsOnPlatform: 0,
    };

    // ========================================================
    // OLD PRICE
    // ========================================================

    if (
      body.oldPrice !== undefined &&
      body.oldPrice !== ""
    ) {
      const oldPrice = toNumber(body.oldPrice);

      if (oldPrice !== null && oldPrice >= 0) {
        productData.oldPrice = oldPrice;
      }
    }

    // ========================================================
    // PHONE
    // ========================================================

    if (category === "Phones") {
      productData.storage = cleanString(body.storage);

      productData.batteryHealth = toNumber(
        body.batteryHealth
      );

      if (
        productData.batteryHealth !== null &&
        (productData.batteryHealth < 0 ||
          productData.batteryHealth > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Battery health must be between 0 and 100.",
        });
      }

      productData.faceId = cleanString(body.faceId);
      productData.simStatus = cleanString(body.simStatus);

      productData.connectivity =
        cleanString(body.connectivity);

      productData.year = cleanString(body.year);
    }

    // ========================================================
    // LAPTOPS
    // ========================================================

    if (category === "Laptops") {
      productData.processor = cleanString(body.processor);
      productData.ram = cleanString(body.ram);
      productData.storage = cleanString(body.storage);
      productData.screenSize = cleanString(body.screenSize);
      productData.graphics = cleanString(body.graphics);
      productData.year = cleanString(body.year);
      productData.connectivity =
        cleanString(body.connectivity);
    }

    // ========================================================
    // TABLETS
    // ========================================================

    if (category === "Tablets") {
      productData.storage = cleanString(body.storage);
      productData.year = cleanString(body.year);
      productData.connectivity =
        cleanString(body.connectivity);
      productData.screenSize =
        cleanString(body.screenSize);
    }

    // ========================================================
    // ACCESSORIES
    // ========================================================

    if (category === "Accessories") {
      productData.accessoryType =
        cleanString(body.accessoryType);

      productData.compatibleWith =
        cleanString(body.compatibleWith);

      productData.compatibility =
        cleanString(body.compatibility);

      productData.material =
        cleanString(body.material);

      productData.cableType =
        cleanString(body.cableType);

      productData.connectorType =
        cleanString(body.connectorType);

      productData.powerOutput =
        cleanString(body.powerOutput);

      productData.capacity =
        cleanString(body.capacity);

      productData.batteryCapacity =
        cleanString(body.batteryCapacity);

      productData.wireless =
        toBoolean(body.wireless);

      productData.original =
        toBoolean(body.original);

      if (body.accessoryColor) {
        productData.color =
          cleanString(body.accessoryColor);
      }
    }

    // ========================================================
    // GAME CONSOLES
    // ========================================================

    if (category === "Game Consoles") {
      productData.consoleType =
        cleanString(body.consoleType);

      productData.edition =
        cleanString(body.edition);

      productData.discDrive =
        cleanString(body.discDrive);

      productData.controllersIncluded =
        cleanString(body.controllersIncluded);

      productData.battery =
        cleanString(body.battery);

      productData.resolution =
        cleanString(body.resolution);

      productData.videoOutput =
        cleanString(body.videoOutput);

      productData.ram =
        cleanString(body.ram);

      productData.screenSize =
        cleanString(body.screenSize);

      productData.year =
        cleanString(body.year);

      productData.connectivity =
        cleanString(body.connectivity);

      productData.storage =
        cleanString(body.storage);

      productData.region =
        cleanString(body.region);
    }

    // ========================================================
    // SMARTWATCHES
    // ========================================================

    if (category === "Smartwatches") {
      productData.watchSize =
        cleanString(body.watchSize);

      productData.storage =
        cleanString(body.storage);

      productData.connectivity =
        cleanString(body.connectivity);

      productData.year =
        cleanString(body.year);

      productData.batteryHealth =
        toNumber(body.batteryHealth);

      if (
        productData.batteryHealth !== null &&
        (productData.batteryHealth < 0 ||
          productData.batteryHealth > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Battery health must be between 0 and 100.",
        });
      }
    }

    // ========================================================
    // TVs
    // ========================================================

    if (category === "TVs") {
      productData.tvType =
        cleanString(body.tvType);

      productData.displayTechnology =
        cleanString(body.displayTechnology);

      productData.refreshRate =
        cleanString(body.refreshRate);

      productData.operatingSystem =
        cleanString(body.operatingSystem);

      productData.hdr =
        cleanString(body.hdr);

      productData.hdmiPorts =
        cleanString(body.hdmiPorts);

      productData.usbPorts =
        cleanString(body.usbPorts);

      productData.smartTV =
        toBoolean(body.smartTV);

      productData.voiceControl =
        toBoolean(body.voiceControl);

      productData.wallMountable =
        toBoolean(body.wallMountable);

      productData.screenSize =
        cleanString(body.screenSize);

      productData.resolution =
        cleanString(body.resolution);

      productData.year =
        cleanString(body.year);

      productData.connectivity =
        cleanString(body.connectivity);
    }

    // ========================================================
    // CARS
    // ========================================================

    if (category === "Cars") {
      productData.mileage =
        toNumber(body.mileage);

      productData.bodyType =
        cleanString(body.bodyType);

      productData.fuelType =
        cleanString(body.fuelType);

      productData.transmission =
        cleanString(body.transmission);

      productData.driveType =
        cleanString(body.driveType);

      productData.engineSize =
        cleanString(body.engineSize);

      productData.seatingCapacity =
        toNumber(body.seatingCapacity);

      productData.exteriorColor =
        cleanString(body.exteriorColor);

      productData.interiorColor =
        cleanString(body.interiorColor);

      productData.year =
        cleanString(body.year);
    }

    // ========================================================
    // COSMETICS
    // ========================================================

    if (category === "Cosmetics") {
      productData.cosmeticType =
        cleanString(body.cosmeticType);

      productData.cosmeticSubcategory =
        cleanString(body.cosmeticSubcategory);

      productData.gender =
        cleanString(body.gender);

      productData.skinType =
        cleanString(body.skinType);

      productData.hairType =
        cleanString(body.hairType);

      productData.shade =
        cleanString(body.shade);

      productData.volume =
        cleanString(body.volume);

      productData.formulation =
        cleanString(body.formulation);

      productData.finish =
        cleanString(body.finish);

      productData.fragrance =
        cleanString(body.fragrance);

      productData.ingredients =
        cleanString(body.ingredients);

      productData.benefits =
        cleanString(body.benefits);

      productData.suitableFor =
        cleanString(body.suitableFor);

      productData.skinConcern =
        cleanString(body.skinConcern);

      productData.spf =
        cleanString(body.spf);

      productData.expirationDate =
        cleanString(body.expirationDate);

      productData.batchNumber =
        cleanString(body.batchNumber);

      productData.countryOfOrigin =
        cleanString(body.countryOfOrigin);

      productData.authenticity =
        cleanString(body.authenticity);

      productData.sealed =
        toBoolean(body.sealed);

      // Use shade as color when no general color exists
      if (
        !productData.color &&
        productData.shade
      ) {
        productData.color =
          productData.shade;
      }
    }

    // ========================================================
    // FILES
    // ========================================================

    const files = Array.isArray(req.files)
      ? req.files
      : [];

    const imageFiles = files.filter(
      (file) =>
        file.mimetype &&
        file.mimetype.startsWith("image/")
    );

    const videoFiles = files.filter(
      (file) =>
        file.mimetype &&
        file.mimetype.startsWith("video/")
    );

    // --------------------------------------------------------
    // Images
    // --------------------------------------------------------

    if (imageFiles.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 5 images.",
      });
    }

    if (imageFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required.",
      });
    }

    // --------------------------------------------------------
    // Videos
    // --------------------------------------------------------

    if (videoFiles.length > 1) {
      return res.status(400).json({
        success: false,
        message: "You can upload only one video.",
      });
    }

    // ========================================================
    // UPLOAD IMAGES
    // ========================================================

    const uploadedImages = [];

    for (const file of imageFiles) {
      if (!file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid image file.",
        });
      }

      const result =
        await uploadBufferToCloudinary(
          file.buffer,
          {
            resource_type: "image",
            folder:
              "buyukused/products/images",
          }
        );

      if (!result || !result.secure_url) {
        throw new Error(
          "Image upload failed."
        );
      }

      uploadedImages.push(
        result.secure_url
      );
    }

    // ========================================================
    // UPLOAD VIDEO
    // ========================================================

    const uploadedVideos = [];

    for (const file of videoFiles) {
      if (
        file.size >
        50 * 1024 * 1024
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Video must be smaller than 50MB.",
        });
      }

      if (!file.buffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid video file.",
        });
      }

      const result =
        await uploadBufferToCloudinary(
          file.buffer,
          {
            resource_type: "video",
            folder:
              "buyukused/products/videos",
          }
        );

      if (!result || !result.secure_url) {
        throw new Error(
          "Video upload failed."
        );
      }

      uploadedVideos.push(
        result.secure_url
      );
    }

    // ========================================================
    // MEDIA DATA
    // ========================================================

    productData.images =
      uploadedImages;

    productData.videos =
      uploadedVideos;

    productData.image =
      uploadedImages[0] || "";

    // ========================================================
    // CREATE PRODUCT
    // ========================================================

    const product =
      await Product.create(
        productData
      );

    return res.status(201).json({
      success: true,
      message:
        "Product posted successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "❌ CREATE PRODUCT ERROR:",
      error
    );

    // Mongoose validation
    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (item) => item.message
        );

      return res.status(400).json({
        success: false,
        message:
          errors.join(", "),
        errors,
      });
    }

    // Duplicate
    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A product with this information already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create product.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

const getProducts = async (
  req,
  res
) => {
  try {
    const {
      category,
      search,
      location,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        Number(limit) || 20,
        1
      ),
      100
    );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    // ========================================================
    // FILTER
    // ========================================================

    const filter = {
      status: "active",
    };

    // --------------------------------------------------------
    // Category
    // --------------------------------------------------------

    if (category) {
      const normalizedCategory =
        normalizeCategory(
          category
        );

      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid category: ${category}.`,
        });
      }

      filter.category =
        normalizedCategory;
    }

    // --------------------------------------------------------
    // Location
    // --------------------------------------------------------

    if (location) {
      const cleanLocation =
        cleanString(location);

      if (cleanLocation) {
        filter.location = {
          $regex:
            cleanLocation,
          $options: "i",
        };
      }
    }

    // --------------------------------------------------------
    // Price
    // --------------------------------------------------------

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (
        minPrice !== undefined
      ) {
        const min =
          toNumber(minPrice);

        if (min !== null) {
          filter.price.$gte =
            min;
        }
      }

      if (
        maxPrice !== undefined
      ) {
        const max =
          toNumber(maxPrice);

        if (max !== null) {
          filter.price.$lte =
            max;
        }
      }

      if (
        Object.keys(
          filter.price
        ).length === 0
      ) {
        delete filter.price;
      }
    }

    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------

    const searchText =
      cleanString(search);

    if (searchText) {
      filter.$text = {
        $search: searchText,
      };
    }

    // ========================================================
    // SORT
    // ========================================================

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "price-low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "popular") {
      sortOption = {
        views: -1,
        createdAt: -1,
      };
    }

    // ========================================================
    // QUERY
    // ========================================================

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .populate(
          "sellerId",
          "name email phone"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Product.countDocuments(
        filter
      ),
    ]);

    const totalPages =
      Math.ceil(
        total / limitNumber
      );

    return res.status(200).json({
      success: true,
      products,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,

        hasNextPage:
          pageNumber <
          totalPages,

        hasPreviousPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "❌ GET PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch products.",
    });
  }
};

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

const getProductById = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findOne({
        _id: id,
        status: "active",
      }).populate(
        "sellerId",
        "name email phone"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    // Increment views
    await Product.updateOne(
      { _id: id },
      {
        $inc: {
          views: 1,
        },
      }
    );

    // Return updated view count
    product.views += 1;

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "❌ GET PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch product.",
    });
  }
};

// ============================================================
// GET PRODUCTS BY SELLER
// ============================================================

const getProductsBySeller =
  async (req, res) => {
    try {
      const sellerId =
        req.params.sellerId;

      if (
        !isValidObjectId(
          sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID.",
        });
      }

      const products =
        await Product.find({
          sellerId,
          status: {
            $ne: "inactive",
          },
        })
          .populate(
            "sellerId",
            "name email phone"
          )
          .sort({
            createdAt: -1,
          })
          .lean();

      return res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      console.error(
        "❌ GET SELLER PRODUCTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch seller products.",
      });
    }
  };

// ============================================================
// UPDATE PRODUCT
// ============================================================

const updateProduct = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const { id } =
      req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    // --------------------------------------------------------
    // Ownership
    // --------------------------------------------------------

    if (
      !product.sellerId ||
      String(product.sellerId) !==
        String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this product.",
      });
    }

    const body =
      req.body || {};

    // ========================================================
    // CATEGORY
    // ========================================================

    if (
      body.category !==
      undefined
    ) {
      const category =
        normalizeCategory(
          body.category
        );

      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product category: ${body.category}.`,
        });
      }

      product.category =
        category;
    }

    // ========================================================
    // STRING FIELDS
    // ========================================================

    const stringFields = [
      "title",
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

      "accessoryType",
      "compatibleWith",
      "compatibility",
      "material",
      "cableType",
      "connectorType",
      "powerOutput",
      "capacity",
      "batteryCapacity",

      "faceId",
      "simStatus",

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

      "bodyType",
      "fuelType",
      "transmission",
      "driveType",
      "engineSize",
      "exteriorColor",
      "interiorColor",

      // Cosmetics
      "cosmeticType",
      "cosmeticSubcategory",
      "gender",
      "skinType",
      "hairType",
      "shade",
      "volume",
      "formulation",
      "finish",
      "fragrance",
      "ingredients",
      "benefits",
      "suitableFor",
      "skinConcern",
      "spf",
      "expirationDate",
      "batchNumber",
      "countryOfOrigin",
      "authenticity",
    ];

    stringFields.forEach(
      (field) => {
        if (
          body[field] !==
          undefined
        ) {
          product[field] =
            cleanString(
              body[field]
            );
        }
      }
    );

    // ========================================================
    // NUMBER FIELDS
    // ========================================================

    const numberFields = [
      "price",
      "oldPrice",
      "batteryHealth",
      "mileage",
      "seatingCapacity",
      "views",
      "yearsOnPlatform",
    ];

    numberFields.forEach(
      (field) => {
        if (
          body[field] !==
          undefined
        ) {
          const number =
            toNumber(
              body[field]
            );

          if (number !== null) {
            product[field] =
              number;
          }
        }
      }
    );

    // --------------------------------------------------------
    // Validate price
    // --------------------------------------------------------

    if (
      product.price < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price cannot be negative.",
      });
    }

    // --------------------------------------------------------
    // Validate battery health
    // --------------------------------------------------------

    if (
      product.batteryHealth !==
        null &&
      product.batteryHealth !==
        undefined &&
      (product.batteryHealth <
        0 ||
        product.batteryHealth >
          100)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Battery health must be between 0 and 100.",
      });
    }

    // ========================================================
    // BOOLEAN FIELDS
    // ========================================================

    const booleanFields = [
      "negotiation",
      "swapAccepted",
      "smartTV",
      "voiceControl",
      "wallMountable",
      "wireless",
      "original",
      "sealed",
      "promo",
    ];

    booleanFields.forEach(
      (field) => {
        if (
          body[field] !==
          undefined
        ) {
          product[field] =
            toBoolean(
              body[field]
            );
        }
      }
    );

    // ========================================================
    // STATUS
    // ========================================================

    if (
      body.status !==
      undefined
    ) {
      const allowedStatuses = [
        "active",
        "pending",
        "inactive",
        "sold",
      ];

      const status =
        cleanString(
          body.status
        ).toLowerCase();

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product status.",
        });
      }

      product.status =
        status;
    }

    // ========================================================
    // UPDATE SLUG WHEN TITLE CHANGES
    // ========================================================

    if (
      body.title !==
        undefined &&
      cleanString(
        body.title
      )
    ) {
      const baseSlug =
        cleanString(
          body.title
        )
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );

      product.slug =
        `${baseSlug || "product"}-${Date.now()}`;
    }

    // ========================================================
    // SAVE
    // ========================================================

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "❌ UPDATE PRODUCT ERROR:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors
        ).map(
          (item) => item.message
        );

      return res.status(400).json({
        success: false,
        message:
          errors.join(", "),
        errors,
      });
    }

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A product with this information already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update product.",
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

const deleteProduct = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const { id } =
      req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    if (
      String(product.sellerId) !==
      String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this product.",
      });
    }

    // Soft delete
    product.status =
      "inactive";

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "❌ DELETE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete product.",
    });
  }
};

// ============================================================
// MARK PRODUCT AS SOLD
// ============================================================

const markProductAsSold =
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      const product =
        await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      if (
        String(
          product.sellerId
        ) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to modify this product.",
        });
      }

      product.status =
        "sold";

      await product.save();

      return res.status(200).json({
        success: true,
        message:
          "Product marked as sold.",
        product,
      });
    } catch (error) {
      console.error(
        "❌ MARK SOLD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to mark product as sold.",
      });
    }
  };

// ============================================================
// RESTORE PRODUCT
// ============================================================

const restoreProduct = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const { id } =
      req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    if (
      String(product.sellerId) !==
      String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to restore this product.",
      });
    }

    product.status =
      "active";

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product restored successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "❌ RESTORE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to restore product.",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductsBySeller,
  updateProduct,
  deleteProduct,
  markProductAsSold,
  restoreProduct,
};