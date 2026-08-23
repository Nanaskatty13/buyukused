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

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  return (
    String(value).toLowerCase() === "true" ||
    String(value).toLowerCase() === "1" ||
    String(value).toLowerCase() === "yes"
  );
};

const cleanString = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const toNumber = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  const number = Number(value);
  return Number.isFinite(number) ? number : defaultValue;
};

// ============================================================
// CATEGORY MAP – CASE-INSENSITIVE
// ============================================================

const CATEGORY_MAP = new Map([
  ["phones", "Phones"],
  ["laptops", "Laptops"],
  ["tablets", "Tablets"],
  ["accessories", "Accessories"],
  ["electronics", "Electronics"],
  ["gameconsoles", "Game Consoles"],
  ["smartwatches", "Smartwatches"],
  ["tvs", "TVs"],
  ["cars", "Cars"],
  ["cosmetics", "Cosmetics"],
  // Already-capitalized versions
  ["Phones", "Phones"],
  ["Laptops", "Laptops"],
  ["Tablets", "Tablets"],
  ["Accessories", "Accessories"],
  ["Electronics", "Electronics"],
  ["Game Consoles", "Game Consoles"],
  ["Smartwatches", "Smartwatches"],
  ["TVs", "TVs"],
  ["Cars", "Cars"],
  ["Cosmetics", "Cosmetics"],
]);

const normalizeCategory = (category) => {
  const raw = cleanString(category);
  if (!raw) return null;

  // 1. Exact match
  if (CATEGORY_MAP.has(raw)) return CATEGORY_MAP.get(raw);
  // 2. Lowercase
  const lower = raw.toLowerCase();
  if (CATEGORY_MAP.has(lower)) return CATEGORY_MAP.get(lower);
  // 3. Remove spaces
  const noSpaces = lower.replace(/\s/g, "");
  if (CATEGORY_MAP.has(noSpaces)) return CATEGORY_MAP.get(noSpaces);
  // 4. Remove hyphens/spaces
  const noHyphen = lower.replace(/[\s-]/g, "");
  if (CATEGORY_MAP.has(noHyphen)) return CATEGORY_MAP.get(noHyphen);
  // 5. Partial match fallback
  for (const [key, value] of CATEGORY_MAP.entries()) {
    if (key.includes(noSpaces) || noSpaces.includes(key)) return value;
  }
  return null;
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || "auto",
        folder: options.folder || "buyukused/products",
        transformation: options.transformation || undefined,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const body = req.body || {};
    const title = cleanString(body.title);
    const price = toNumber(body.price);
    const category = normalizeCategory(body.category);
    const location = cleanString(body.location) || "Ghana";
    const description = cleanString(body.description);
    const sellerName = cleanString(body.sellerName);
    const sellerPhone = cleanString(body.sellerPhone);

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required.",
      });
    }

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

    if (!category) {
      console.error("❌ Invalid category received:", body.category);
      return res.status(400).json({
        success: false,
        message: `Invalid product category. Received: "${body.category}". Allowed: Phones, Laptops, Tablets, Accessories, Electronics, Game Consoles, Smartwatches, TVs, Cars, Cosmetics`,
      });
    }

    if (!sellerPhone) {
      return res.status(400).json({
        success: false,
        message: "Seller phone number is required.",
      });
    }

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
    };

    // Old price
    if (body.oldPrice !== undefined && body.oldPrice !== "") {
      const oldPrice = toNumber(body.oldPrice);
      if (oldPrice !== null && oldPrice >= 0) {
        productData.oldPrice = oldPrice;
      }
    }

    // Category-specific fields (keep your existing logic – I've included them all)
    if (category === "Phones") {
      productData.storage = cleanString(body.storage);
      if (body.batteryHealth !== undefined && body.batteryHealth !== "") {
        const batteryHealth = toNumber(body.batteryHealth);
        if (batteryHealth !== null && batteryHealth >= 0 && batteryHealth <= 100) {
          productData.batteryHealth = batteryHealth;
        }
      }
      productData.faceId = cleanString(body.faceId);
      productData.simStatus = cleanString(body.simStatus);
    }

    if (category === "Laptops") {
      productData.processor = cleanString(body.processor);
      productData.ram = cleanString(body.ram);
      productData.storage = cleanString(body.storage);
      productData.screenSize = cleanString(body.screenSize);
      productData.graphics = cleanString(body.graphics);
    }

    if (category === "Tablets") {
      productData.storage = cleanString(body.storage);
      productData.year = cleanString(body.year);
      productData.connectivity = cleanString(body.connectivity);
      productData.screenSize = cleanString(body.screenSize);
    }

    if (category === "Accessories") {
      productData.accessoryType = cleanString(body.accessoryType);
      productData.compatibility = cleanString(body.compatibility);
      if (body.accessoryColor) {
        productData.color = cleanString(body.accessoryColor);
      }
      productData.material = cleanString(body.material);
    }

    if (category === "Game Consoles") {
      productData.consoleType = cleanString(body.consoleType);
      productData.edition = cleanString(body.edition);
      productData.discDrive = cleanString(body.discDrive);
      productData.controllersIncluded = cleanString(body.controllersIncluded);
      productData.battery = cleanString(body.battery);
      productData.resolution = cleanString(body.resolution);
      productData.videoOutput = cleanString(body.videoOutput);
      productData.ram = cleanString(body.ram);
      productData.screenSize = cleanString(body.screenSize);
      productData.year = cleanString(body.year);
      productData.connectivity = cleanString(body.connectivity);
      productData.storage = cleanString(body.storage);
    }

    if (category === "Smartwatches") {
      productData.watchSize = cleanString(body.watchSize);
      productData.storage = cleanString(body.storage);
      productData.connectivity = cleanString(body.connectivity);
      productData.year = cleanString(body.year);
      if (body.batteryHealth !== undefined && body.batteryHealth !== "") {
        const batteryHealth = toNumber(body.batteryHealth);
        if (batteryHealth !== null && batteryHealth >= 0 && batteryHealth <= 100) {
          productData.batteryHealth = batteryHealth;
        }
      }
    }

    if (category === "TVs") {
      productData.tvType = cleanString(body.tvType);
      productData.displayTechnology = cleanString(body.displayTechnology);
      productData.refreshRate = cleanString(body.refreshRate);
      productData.operatingSystem = cleanString(body.operatingSystem);
      productData.hdr = cleanString(body.hdr);
      productData.hdmiPorts = cleanString(body.hdmiPorts);
      productData.usbPorts = cleanString(body.usbPorts);
      productData.smartTV = toBoolean(body.smartTV);
      productData.voiceControl = toBoolean(body.voiceControl);
      productData.wallMountable = toBoolean(body.wallMountable);
      productData.screenSize = cleanString(body.screenSize);
      productData.resolution = cleanString(body.resolution);
      productData.year = cleanString(body.year);
      productData.connectivity = cleanString(body.connectivity);
    }

    if (category === "Cars") {
      productData.mileage = cleanString(body.mileage);
      productData.bodyType = cleanString(body.bodyType);
      productData.fuelType = cleanString(body.fuelType);
      productData.transmission = cleanString(body.transmission);
      productData.driveType = cleanString(body.driveType);
      productData.engineSize = cleanString(body.engineSize);
      productData.seatingCapacity = cleanString(body.seatingCapacity);
      productData.exteriorColor = cleanString(body.exteriorColor);
      productData.interiorColor = cleanString(body.interiorColor);
      productData.year = cleanString(body.year);
    }

    if (category === "Cosmetics") {
      productData.cosmeticType = cleanString(body.cosmeticType);
      productData.cosmeticSubcategory = cleanString(body.cosmeticSubcategory);
      productData.gender = cleanString(body.gender);
      productData.skinType = cleanString(body.skinType);
      productData.hairType = cleanString(body.hairType);
      productData.shade = cleanString(body.shade);
      productData.volume = cleanString(body.volume);
      productData.formulation = cleanString(body.formulation);
      productData.finish = cleanString(body.finish);
      productData.fragrance = cleanString(body.fragrance);
      productData.ingredients = cleanString(body.ingredients);
      productData.benefits = cleanString(body.benefits);
      productData.suitableFor = cleanString(body.suitableFor);
      productData.skinConcern = cleanString(body.skinConcern);
      productData.spf = cleanString(body.spf);
      productData.expirationDate = cleanString(body.expirationDate);
      productData.batchNumber = cleanString(body.batchNumber);
      productData.countryOfOrigin = cleanString(body.countryOfOrigin);
      productData.authenticity = cleanString(body.authenticity);
      productData.sealed = toBoolean(body.sealed);
      if (!productData.color && body.shade) {
        productData.color = cleanString(body.shade);
      }
    }

    // -- FILES --
    const files = Array.isArray(req.files) ? req.files : [];
    const imageFiles = files.filter((f) => f.mimetype && f.mimetype.startsWith("image/"));
    const videoFiles = files.filter((f) => f.mimetype && f.mimetype.startsWith("video/"));

    if (imageFiles.length > 5) {
      return res.status(400).json({ success: false, message: "You can upload a maximum of 5 images." });
    }
    if (videoFiles.length > 1) {
      return res.status(400).json({ success: false, message: "You can upload only one video." });
    }
    if (imageFiles.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product image is required." });
    }

    // Upload images
    const uploadedImages = [];
    for (const file of imageFiles) {
      const result = await uploadBufferToCloudinary(file.buffer, {
        resource_type: "image",
        folder: "buyukused/products/images",
      });
      uploadedImages.push(result.secure_url);
    }

    const uploadedVideos = [];
    for (const file of videoFiles) {
      if (file.size > 50 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: "Video must be smaller than 50MB." });
      }
      const result = await uploadBufferToCloudinary(file.buffer, {
        resource_type: "video",
        folder: "buyukused/products/videos",
      });
      uploadedVideos.push(result.secure_url);
    }

    productData.images = uploadedImages;
    productData.videos = uploadedVideos;
    productData.image = uploadedImages[0] || "";

    const product = await Product.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product posted successfully.",
      product,
    });
  } catch (error) {
    console.error("❌ CREATE PRODUCT ERROR:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((item) => item.message);
      return res.status(400).json({ success: false, message: errors.join(", "), errors });
    }
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A product with this information already exists." });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create product.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

const getProducts = async (req, res) => {
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

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const filter = {
      isActive: true,
      isSold: false,
    };

    if (category) {
      const normalizedCategory = normalizeCategory(category);
      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,
          message: "Invalid category.",
        });
      }
      filter.category = normalizedCategory;
    }

    if (location) {
      filter.location = {
        $regex: cleanString(location),
        $options: "i",
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        const min = toNumber(minPrice);
        if (min !== null) filter.price.$gte = min;
      }
      if (maxPrice !== undefined) {
        const max = toNumber(maxPrice);
        if (max !== null) filter.price.$lte = max;
      }
    }

    if (search && cleanString(search)) {
      filter.$text = {
        $search: cleanString(search),
      };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "price-low") sortOption = { price: 1 };
    if (sort === "price-high") sortOption = { price: -1 };
    if (sort === "popular") sortOption = { views: -1, createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("sellerId", "name email phone")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("❌ GET PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }
    const product = await Product.findOne({ _id: id, isActive: true }).populate("sellerId", "name email phone");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    await Product.updateOne({ _id: id }, { $inc: { views: 1 } });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("❌ GET PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch product." });
  }
};

// ============================================================
// GET PRODUCTS BY SELLER
// ============================================================

const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({ success: false, message: "Invalid seller ID." });
    }
    const products = await Product.find({ sellerId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("❌ GET SELLER PRODUCTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch seller products." });
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (!product.sellerId || String(product.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not allowed to update this product." });
    }

    const body = req.body || {};
    const allowedFields = [
      "title", "price", "oldPrice", "location", "description", "sellerName", "sellerPhone",
      "brand", "model", "color", "condition", "warranty", "storage", "batteryHealth", "faceId",
      "simStatus", "processor", "ram", "screenSize", "graphics", "year", "connectivity",
      "accessoryType", "compatibility", "material", "consoleType", "edition", "discDrive",
      "controllersIncluded", "battery", "resolution", "videoOutput", "watchSize", "tvType",
      "displayTechnology", "refreshRate", "operatingSystem", "hdr", "hdmiPorts", "usbPorts",
      "mileage", "bodyType", "fuelType", "transmission", "driveType", "engineSize",
      "seatingCapacity", "exteriorColor", "interiorColor", "cosmeticType", "cosmeticSubcategory",
      "gender", "skinType", "hairType", "shade", "volume", "formulation", "finish", "fragrance",
      "ingredients", "benefits", "suitableFor", "skinConcern", "spf", "expirationDate",
      "batchNumber", "countryOfOrigin", "authenticity",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (["price", "oldPrice", "batteryHealth"].includes(field)) {
          const number = toNumber(body[field]);
          if (number !== null) product[field] = number;
        } else {
          product[field] = cleanString(body[field]);
        }
      }
    });

    const booleanFields = ["negotiation", "swapAccepted", "smartTV", "voiceControl", "wallMountable", "sealed"];
    booleanFields.forEach((field) => {
      if (body[field] !== undefined) product[field] = toBoolean(body[field]);
    });

    if (body.category !== undefined) {
      const category = normalizeCategory(body.category);
      if (!category) {
        return res.status(400).json({ success: false, message: "Invalid product category." });
      }
      product.category = category;
    }

    await product.save();
    return res.status(200).json({ success: true, message: "Product updated successfully.", product });
  } catch (error) {
    console.error("❌ UPDATE PRODUCT ERROR:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((item) => item.message).join(", "),
      });
    }
    return res.status(500).json({ success: false, message: "Failed to update product." });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (String(product.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not allowed to delete this product." });
    }
    product.isActive = false;
    await product.save();
    return res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("❌ DELETE PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product." });
  }
};

// ============================================================
// MARK PRODUCT AS SOLD
// ============================================================

const markProductAsSold = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    if (String(product.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You are not allowed to modify this product." });
    }
    product.isSold = true;
    await product.save();
    return res.status(200).json({ success: true, message: "Product marked as sold.", product });
  } catch (error) {
    console.error("❌ MARK SOLD ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to mark product as sold." });
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