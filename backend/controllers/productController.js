// ============================================================
// backend/controllers/productController.js
// ============================================================

const mongoose = require("mongoose");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// ------------------------------------------------------------
// Convert multipart string booleans to actual booleans
// ------------------------------------------------------------

const toBoolean = (value, defaultValue = false) => {
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

  return (
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "1" ||
    String(value).toLowerCase() === "yes"
  );
};

// ------------------------------------------------------------
// Convert a value into a clean string
// ------------------------------------------------------------

const cleanString = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

// ------------------------------------------------------------
// Convert number safely
// ------------------------------------------------------------

const toNumber = (value, defaultValue = null) => {
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
// CATEGORY MAP
// ============================================================

const CATEGORY_MAP = {
  phones: "Phones",
  laptops: "Laptops",
  tablets: "Tablets",
  accessories: "Accessories",
  electronics: "Electronics",
  gameConsoles: "Game Consoles",
  smartwatches: "Smartwatches",
  tvs: "TVs",
  cars: "Cars",
  cosmetics: "Cosmetics",

  // Already-normalized values
  Phones: "Phones",
  Laptops: "Laptops",
  Tablets: "Tablets",
  Accessories: "Accessories",
  Electronics: "Electronics",
  "Game Consoles": "Game Consoles",
  Smartwatches: "Smartwatches",
  TVs: "TVs",
  Cars: "Cars",
  Cosmetics: "Cosmetics",
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadBufferToCloudinary = (
  buffer,
  options = {}
) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          resource_type:
            options.resource_type || "auto",

          folder:
            options.folder ||
            "buyukused/products",

          transformation:
            options.transformation || undefined,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(result);
        }
      );

    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream);
  });
};

// ============================================================
// VALIDATE CATEGORY
// ============================================================

const normalizeCategory = (category) => {
  const normalized =
    CATEGORY_MAP[
      cleanString(category)
    ];

  return normalized || null;
};

// ============================================================
// CREATE PRODUCT
// ============================================================

const createProduct = async (req, res) => {
  try {
    // ========================================================
    // AUTHENTICATION
    // ========================================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    // ========================================================
    // BASIC DATA
    // ========================================================

    const body = req.body || {};

    const title = cleanString(body.title);

    const price = toNumber(body.price);

    const category =
      normalizeCategory(body.category);

    const location =
      cleanString(body.location) ||
      "Ghana";

    const description =
      cleanString(body.description);

    const sellerName =
      cleanString(body.sellerName);

    const sellerPhone =
      cleanString(body.sellerPhone);

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!title) {
      return res.status(400).json({
        success: false,
        message:
          "Product title is required.",
      });
    }

    if (price === null) {
      return res.status(400).json({
        success: false,
        message:
          "A valid product price is required.",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Product price cannot be negative.",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product category.",
      });
    }

    if (!sellerPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Seller phone number is required.",
      });
    }

    // ========================================================
    // BASE PRODUCT
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

      condition:
        cleanString(body.condition) ||
        "Good",

      warranty:
        cleanString(body.warranty),

      negotiation: toBoolean(
        body.negotiation
      ),

      swapAccepted: toBoolean(
        body.swapAccepted
      ),
    };

    // ========================================================
    // OLD PRICE
    // ========================================================

    if (
      body.oldPrice !== undefined &&
      body.oldPrice !== ""
    ) {
      const oldPrice = toNumber(
        body.oldPrice
      );

      if (
        oldPrice !== null &&
        oldPrice >= 0
      ) {
        productData.oldPrice =
          oldPrice;
      }
    }

    // ========================================================
    // PHONE
    // ========================================================

    if (category === "Phones") {
      productData.storage =
        cleanString(body.storage);

      if (
        body.batteryHealth !==
          undefined &&
        body.batteryHealth !== ""
      ) {
        const batteryHealth =
          toNumber(
            body.batteryHealth
          );

        if (
          batteryHealth !== null &&
          batteryHealth >= 0 &&
          batteryHealth <= 100
        ) {
          productData.batteryHealth =
            batteryHealth;
        }
      }

      productData.faceId =
        cleanString(body.faceId);

      productData.simStatus =
        cleanString(body.simStatus);
    }

    // ========================================================
    // LAPTOPS
    // ========================================================

    if (category === "Laptops") {
      productData.processor =
        cleanString(body.processor);

      productData.ram =
        cleanString(body.ram);

      productData.storage =
        cleanString(body.storage);

      productData.screenSize =
        cleanString(body.screenSize);

      productData.graphics =
        cleanString(body.graphics);
    }

    // ========================================================
    // TABLETS
    // ========================================================

    if (category === "Tablets") {
      productData.storage =
        cleanString(body.storage);

      productData.year =
        cleanString(body.year);

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

      productData.compatibility =
        cleanString(body.compatibility);

      // PostAd sends accessoryColor but
      // Product stores the final color in color.
      if (body.accessoryColor) {
        productData.color =
          cleanString(
            body.accessoryColor
          );
      }

      productData.material =
        cleanString(body.material);
    }

    // ========================================================
    // GAME CONSOLES
    // ========================================================

    if (
      category === "Game Consoles"
    ) {
      productData.consoleType =
        cleanString(body.consoleType);

      productData.edition =
        cleanString(body.edition);

      productData.discDrive =
        cleanString(body.discDrive);

      productData.controllersIncluded =
        cleanString(
          body.controllersIncluded
        );

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
    }

    // ========================================================
    // SMARTWATCHES
    // ========================================================

    if (
      category === "Smartwatches"
    ) {
      productData.watchSize =
        cleanString(body.watchSize);

      productData.storage =
        cleanString(body.storage);

      productData.connectivity =
        cleanString(body.connectivity);

      productData.year =
        cleanString(body.year);

      if (
        body.batteryHealth !==
          undefined &&
        body.batteryHealth !== ""
      ) {
        const batteryHealth =
          toNumber(
            body.batteryHealth
          );

        if (
          batteryHealth !== null &&
          batteryHealth >= 0 &&
          batteryHealth <= 100
        ) {
          productData.batteryHealth =
            batteryHealth;
        }
      }
    }

    // ========================================================
    // TVs
    // ========================================================

    if (category === "TVs") {
      productData.tvType =
        cleanString(body.tvType);

      productData.displayTechnology =
        cleanString(
          body.displayTechnology
        );

      productData.refreshRate =
        cleanString(
          body.refreshRate
        );

      productData.operatingSystem =
        cleanString(
          body.operatingSystem
        );

      productData.hdr =
        cleanString(body.hdr);

      productData.hdmiPorts =
        cleanString(
          body.hdmiPorts
        );

      productData.usbPorts =
        cleanString(
          body.usbPorts
        );

      productData.smartTV =
        toBoolean(body.smartTV);

      productData.voiceControl =
        toBoolean(
          body.voiceControl
        );

      productData.wallMountable =
        toBoolean(
          body.wallMountable
        );

      productData.screenSize =
        cleanString(
          body.screenSize
        );

      productData.resolution =
        cleanString(
          body.resolution
        );

      productData.year =
        cleanString(body.year);

      productData.connectivity =
        cleanString(
          body.connectivity
        );
    }

    // ========================================================
    // CARS
    // ========================================================

    if (category === "Cars") {
      productData.mileage =
        cleanString(body.mileage);

      productData.bodyType =
        cleanString(body.bodyType);

      productData.fuelType =
        cleanString(body.fuelType);

      productData.transmission =
        cleanString(
          body.transmission
        );

      productData.driveType =
        cleanString(body.driveType);

      productData.engineSize =
        cleanString(
          body.engineSize
        );

      productData.seatingCapacity =
        cleanString(
          body.seatingCapacity
        );

      productData.exteriorColor =
        cleanString(
          body.exteriorColor
        );

      productData.interiorColor =
        cleanString(
          body.interiorColor
        );

      productData.year =
        cleanString(body.year);
    }

    // ========================================================
    // COSMETICS
    // ========================================================

    if (category === "Cosmetics") {
      productData.cosmeticType =
        cleanString(
          body.cosmeticType
        );

      productData.cosmeticSubcategory =
        cleanString(
          body.cosmeticSubcategory
        );

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
        cleanString(
          body.formulation
        );

      productData.finish =
        cleanString(body.finish);

      productData.fragrance =
        cleanString(body.fragrance);

      productData.ingredients =
        cleanString(
          body.ingredients
        );

      productData.benefits =
        cleanString(
          body.benefits
        );

      productData.suitableFor =
        cleanString(
          body.suitableFor
        );

      productData.skinConcern =
        cleanString(
          body.skinConcern
        );

      productData.spf =
        cleanString(body.spf);

      productData.expirationDate =
        cleanString(
          body.expirationDate
        );

      productData.batchNumber =
        cleanString(
          body.batchNumber
        );

      productData.countryOfOrigin =
        cleanString(
          body.countryOfOrigin
        );

      productData.authenticity =
        cleanString(
          body.authenticity
        );

      productData.sealed =
        toBoolean(body.sealed);

      // Cosmetics can use normal color
      // or a cosmetic-specific shade.
      if (
        !productData.color &&
        body.shade
      ) {
        productData.color =
          cleanString(body.shade);
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
        file.mimetype.startsWith(
          "image/"
        )
    );

    const videoFiles = files.filter(
      (file) =>
        file.mimetype &&
        file.mimetype.startsWith(
          "video/"
        )
    );

    // ========================================================
    // IMAGE LIMIT
    // ========================================================

    if (imageFiles.length > 5) {
      return res.status(400).json({
        success: false,
        message:
          "You can upload a maximum of 5 images.",
      });
    }

    // ========================================================
    // VIDEO LIMIT
    // ========================================================

    if (videoFiles.length > 1) {
      return res.status(400).json({
        success: false,
        message:
          "You can upload only one video.",
      });
    }

    // ========================================================
    // REQUIRE IMAGE
    // ========================================================

    if (imageFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product image is required.",
      });
    }

    // ========================================================
    // UPLOAD IMAGES
    // ========================================================

    const uploadedImages = [];

    for (const file of imageFiles) {
      const result =
        await uploadBufferToCloudinary(
          file.buffer,
          {
            resource_type: "image",
            folder:
              "buyukused/products/images",
          }
        );

      uploadedImages.push(
        result.secure_url
      );
    }

    // ========================================================
    // UPLOAD VIDEOS
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

      const result =
        await uploadBufferToCloudinary(
          file.buffer,
          {
            resource_type: "video",
            folder:
              "buyukused/products/videos",
          }
        );

      uploadedVideos.push(
        result.secure_url
      );
    }

    // ========================================================
    // SAVE MEDIA
    // ========================================================

    productData.images =
      uploadedImages;

    productData.videos =
      uploadedVideos;

    // Keep legacy image populated.
    productData.image =
      uploadedImages[0] || "";

    // ========================================================
    // CREATE PRODUCT
    // ========================================================

    const product =
      await Product.create(
        productData
      );

    // ========================================================
    // RESPONSE
    // ========================================================

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

    // ========================================================
    // MONGOOSE VALIDATION
    // ========================================================

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors = Object.values(
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

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error.code === 11000) {
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
      isActive: true,
      isSold: false,
    };

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (category) {
      const normalizedCategory =
        normalizeCategory(category);

      if (
        !normalizedCategory
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category.",
        });
      }

      filter.category =
        normalizedCategory;
    }

    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    if (location) {
      filter.location = {
        $regex: cleanString(
          location
        ),
        $options: "i",
      };
    }

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (minPrice !== undefined) {
        const min =
          toNumber(minPrice);

        if (min !== null) {
          filter.price.$gte = min;
        }
      }

      if (maxPrice !== undefined) {
        const max =
          toNumber(maxPrice);

        if (max !== null) {
          filter.price.$lte = max;
        }
      }
    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (
      search &&
      cleanString(search)
    ) {
      filter.$text = {
        $search:
          cleanString(search),
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

    const totalPages = Math.ceil(
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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID.",
      });
    }

    const product =
      await Product.findOne({
        _id: id,
        isActive: true,
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

    // Increment views without blocking
    await Product.updateOne(
      { _id: id },
      {
        $inc: {
          views: 1,
        },
      }
    );

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

const getProductsBySeller = async (
  req,
  res
) => {
  try {
    const sellerId =
      req.params.sellerId;

    if (
      !isValidObjectId(sellerId)
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
        isActive: true,
      })
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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
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

    // ========================================================
    // OWNERSHIP
    // ========================================================

    if (
      !product.sellerId ||
      String(
        product.sellerId
      ) !==
        String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this product.",
      });
    }

    const body = req.body || {};

    // ========================================================
    // SAFE COMMON FIELDS
    // ========================================================

    const allowedFields = [
      "title",
      "price",
      "oldPrice",
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
      "batteryHealth",
      "faceId",
      "simStatus",
      "processor",
      "ram",
      "screenSize",
      "graphics",
      "year",
      "connectivity",
      "accessoryType",
      "compatibility",
      "material",
      "consoleType",
      "edition",
      "discDrive",
      "controllersIncluded",
      "battery",
      "resolution",
      "videoOutput",
      "watchSize",
      "tvType",
      "displayTechnology",
      "refreshRate",
      "operatingSystem",
      "hdr",
      "hdmiPorts",
      "usbPorts",
      "mileage",
      "bodyType",
      "fuelType",
      "transmission",
      "driveType",
      "engineSize",
      "seatingCapacity",
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

    allowedFields.forEach(
      (field) => {
        if (
          body[field] !== undefined
        ) {
          if (
            [
              "price",
              "oldPrice",
              "batteryHealth",
            ].includes(field)
          ) {
            const number =
              toNumber(
                body[field]
              );

            if (
              number !== null
            ) {
              product[field] =
                number;
            }
          } else {
            product[field] =
              cleanString(
                body[field]
              );
          }
        }
      }
    );

    // ========================================================
    // BOOLEAN FIELDS
    // ========================================================

    [
      "negotiation",
      "swapAccepted",
      "smartTV",
      "voiceControl",
      "wallMountable",
      "sealed",
    ].forEach((field) => {
      if (
        body[field] !== undefined
      ) {
        product[field] =
          toBoolean(
            body[field]
          );
      }
    });

    // ========================================================
    // CATEGORY
    // ========================================================

    if (
      body.category !== undefined
    ) {
      const category =
        normalizeCategory(
          body.category
        );

      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product category.",
        });
      }

      product.category =
        category;
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
      return res.status(400).json({
        success: false,
        message:
          Object.values(
            error.errors
          )
            .map(
              (item) =>
                item.message
            )
            .join(", "),
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
    const { id } = req.params;

    if (!isValidObjectId(id)) {
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

    // ========================================================
    // OWNERSHIP
    // ========================================================

    if (
      String(
        product.sellerId
      ) !==
        String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this product.",
      });
    }

    // ========================================================
    // SOFT DELETE
    // ========================================================

    product.isActive = false;

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

const markProductAsSold = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
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

    product.isSold = true;

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
};