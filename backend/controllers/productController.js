// ============================================================
// backend/controllers/productController.js
// BuyUKUsed Product Controller – Full Version with Robust Category Normalization
// ============================================================

const mongoose = require("mongoose");
const streamifier = require("streamifier");
const Product = require("../models/Product");
const cloudinaryConfig = require("../config/cloudinary");

const cloudinary = cloudinaryConfig?.cloudinary || cloudinaryConfig;

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

const VALID_SIM_STATUS = [
  "eSIM Unlocked",
  "SIM Unlocked",
  "Locked",
  "Bypass",
  "Not Available",
  "",
];

const VALID_COSMETIC_TYPES = [
  "",
  "Makeup",
  "Skincare",
  "Haircare",
  "Fragrance",
  "Body Care",
  "Nail Care",
  "Men's Grooming",
  "Beauty Tools",
  "Other",
];

// ============================================================
// ROBUST CATEGORY NORMALIZATION
// ============================================================

const normalizeCategory = (category) => {
  if (!category || String(category).trim() === "") return "Other";

  const raw = String(category).trim();
  const lower = raw.toLowerCase();

  // 1. Direct aliases (most common first)
  const directAliases = {
    "cosmetics": "Cosmetics",
    "cosmetic": "Cosmetics",
    "beauty": "Cosmetics",
    "makeup": "Cosmetics",
    "cars": "Cars",
    "car": "Cars",
    "phones": "Phones",
    "phone": "Phones",
    "smartphones": "Phones",
    "laptops": "Laptops",
    "laptop": "Laptops",
    "tablets": "Tablets",
    "tablet": "Tablets",
    "accessories": "Accessories",
    "accessory": "Accessories",
    "real estate": "Real Estate",
    "realestate": "Real Estate",
    "jobs": "Jobs",
    "job": "Jobs",
    "electronics": "Electronics",
    "electronic": "Electronics",
    "fashion": "Fashion",
    "home": "Home",
    "tvs": "TVs",
    "tv": "TVs",
    "televisions": "TVs",
    "game consoles": "Game Consoles",
    "game console": "Game Consoles",
    "console": "Game Consoles",
    "smartwatches": "Smartwatches",
    "smartwatch": "Smartwatches",
    "smart watches": "Smartwatches",
    "other": "Other",
  };

  // Check direct alias first (case-insensitive)
  if (directAliases[lower]) return directAliases[lower];

  // 2. Check against VALID_CATEGORIES (case-insensitive)
  for (const valid of VALID_CATEGORIES) {
    if (valid.toLowerCase() === lower) return valid;
  }

  // 3. Normalize by replacing underscores/hyphens with spaces, collapse spaces
  const normalized = lower.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  // 4. Check alias map with normalized value
  if (directAliases[normalized]) return directAliases[normalized];

  // 5. Final fallback: check if raw is in VALID_CATEGORIES (case-insensitive) again
  for (const valid of VALID_CATEGORIES) {
    if (valid.toLowerCase() === lower) return valid;
  }

  // 6. One more check for "cosmetics" specifically (just in case)
  if (lower === "cosmetics" || lower === "cosmetic" || lower === "beauty" || lower === "makeup") {
    return "Cosmetics";
  }

  return null; // will cause a 400 error
};

// ============================================================
// HELPERS
// ============================================================

const getUserId = (req) => {
  return req.userId || req.user?.id || req.user?._id || null;
};

const getUserRole = (req) => {
  return (req.user?.role || req.userRole || "").toString().toLowerCase();
};

const isAdmin = (req) => {
  return getUserRole(req) === "admin";
};

const isOwner = (product, req) => {
  const userId = getUserId(req);
  if (!userId || !product?.sellerId) return false;
  return product.sellerId.toString() === userId.toString();
};

const isOwnerOrAdmin = (product, req) => {
  return isAdmin(req) || isOwner(product, req);
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") return true;
    if (v === "false" || v === "0" || v === "no") return false;
  }
  return Boolean(value);
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatProduct = (product) => {
  if (!product) return null;
  const data = typeof product.toObject === "function" ? product.toObject() : { ...product };
  return {
    ...data,
    category: normalizeCategory(data.category) || "Other",
    batteryHealth: data.batteryHealth != null ? Number(data.batteryHealth) : null,
    faceId: data.faceId || "",
    storage: data.storage || "",
    condition: data.condition || "Good",
    simStatus: data.simStatus || "",
    swapAccepted: data.swapAccepted === true,
    negotiation: data.negotiation === true,
    images: Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []),
    videos: Array.isArray(data.videos) ? data.videos : [],
    image: data.image || (Array.isArray(data.images) && data.images.length ? data.images[0] : ""),
    cosmeticType: data.cosmeticType || "",
  };
};

const parseArrayField = (value, fieldName) => {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") throw new Error(`${fieldName} must be an array`);
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed.filter((item) => typeof item === "string" && item.trim());
  } catch {
    throw new Error(`${fieldName} must be valid JSON`);
  }
};

// ============================================================
// CLOUDINARY HELPERS
// ============================================================

const uploadToCloudinary = (buffer, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    if (!cloudinary?.uploader) {
      return reject(new Error("Cloudinary is not configured correctly"));
    }
    const isVideo = resourceType === "video";
    const folder = isVideo ? "kn-classifieds/videos" : "kn-classifieds/images";
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isVideo ? "video" : "image",
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const getCloudinaryPublicId = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string" || !fileUrl.includes("res.cloudinary.com")) return null;
  const uploadIndex = fileUrl.indexOf("/upload/");
  if (uploadIndex === -1) return null;
  let publicId = fileUrl.substring(uploadIndex + 8);
  publicId = publicId.replace(/^v\d+\//, "");
  const parts = publicId.split("/");
  const transformationPatterns = [
    /^c_/,
    /^w_/,
    /^h_/,
    /^q_/,
    /^f_/,
    /^ar_/,
    /^g_/,
    /^dpr_/,
    /^e_/,
    /^bo_/,
    /^r_/,
    /^x_/,
    /^y_/,
  ];
  let startIndex = 0;
  while (
    startIndex < parts.length &&
    transformationPatterns.some((pattern) => pattern.test(parts[startIndex]))
  ) {
    startIndex++;
  }
  if (startIndex > 0) {
    publicId = parts.slice(startIndex).join("/");
  }
  return publicId.replace(/\.[^/.]+$/, "");
};

const deleteFromCloudinary = async (fileUrl, resourceType = "image") => {
  try {
    const publicId = getCloudinaryPublicId(fileUrl);
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`🗑️ Deleted Cloudinary ${resourceType}: ${publicId}`);
  } catch (error) {
    console.error("⚠️ Cloudinary delete error:", error.message);
  }
};

const uploadProductFiles = async (files = []) => {
  const imageFiles = files
    .filter((f) => f?.buffer && f?.mimetype?.startsWith("image/"))
    .slice(0, MAX_IMAGES);
  const videoFiles = files
    .filter((f) => f?.buffer && f?.mimetype?.startsWith("video/"))
    .slice(0, MAX_VIDEOS);
  const imageUrls = [];
  const videoUrls = [];
  for (const file of imageFiles) {
    const result = await uploadToCloudinary(file.buffer, "image");
    if (result?.secure_url) imageUrls.push(result.secure_url);
  }
  for (const file of videoFiles) {
    const result = await uploadToCloudinary(file.buffer, "video");
    if (result?.secure_url) videoUrls.push(result.secure_url);
  }
  return { imageUrls, videoUrls };
};

// ============================================================
// CRUD – GET ALL
// ============================================================

exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      sellerId,
      status,
      simStatus,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (category && String(category).trim().toLowerCase() !== "all") {
      const normalizedCategory = normalizeCategory(category);
      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,
          message: `Invalid product category: ${category}`,
          allowedCategories: VALID_CATEGORIES,
        });
      }
      query.category = normalizedCategory;
    }

    if (location && String(location).trim().toLowerCase() !== "all") {
      query.location = String(location).trim();
    }

    if (sellerId) {
      if (!mongoose.Types.ObjectId.isValid(sellerId)) {
        return res.status(400).json({ success: false, message: "Invalid seller ID" });
      }
      query.sellerId = sellerId;
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid product status" });
      }
      query.status = status;
    }

    if (simStatus && simStatus !== "all") {
      if (!VALID_SIM_STATUS.includes(simStatus)) {
        return res.status(400).json({ success: false, message: "Invalid SIM status" });
      }
      query.simStatus = simStatus;
    }

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { brand: { $regex: safeSearch, $options: "i" } },
        { model: { $regex: safeSearch, $options: "i" } },
        { cosmeticType: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("sellerId", "name email phone location avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments(query),
    ]);

    const formattedProducts = products.map(formatProduct);

    return res.json({
      success: true,
      products: formattedProducts,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalProducts: total,
      },
    });
  } catch (error) {
    console.error("❌ Get products error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

// ============================================================
// GET SINGLE
// ============================================================

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const product = await Product.findById(id).populate("sellerId", "name email phone location avatar role");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    product.views = (product.views || 0) + 1;
    await product.save();
    return res.json({ success: true, product: formatProduct(product) });
  } catch (error) {
    console.error("❌ Get product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

// ============================================================
// CREATE
// ============================================================

exports.createProduct = async (req, res) => {
  let uploadedImages = [];
  let uploadedVideos = [];

  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
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
      color,
      condition,
      warranty,
      storage,
      ram,
      processor,
      graphics,
      screenSize,
      year,
      connectivity,
      videoOutput,
      region,
      consoleType,
      edition,
      discDrive,
      controllersIncluded,
      battery,
      resolution,
      watchSize,
      tvType,
      displayTechnology,
      refreshRate,
      operatingSystem,
      hdr,
      hdmiPorts,
      usbPorts,
      smartTV,
      voiceControl,
      wallMountable,
      mileage,
      bodyType,
      fuelType,
      transmission,
      driveType,
      engineSize,
      seatingCapacity,
      exteriorColor,
      interiorColor,
      accessoryType,
      compatibleWith,
      compatibility,
      material,
      cableType,
      connectorType,
      powerOutput,
      capacity,
      batteryCapacity,
      wireless,
      original,
      batteryHealth,
      faceId,
      simStatus,
      cosmeticType,
      skinType,
      shade,
      size,
      gender,
      ingredients,
      expiryDate,
      volume,
      scent,
      negotiation,
      swapAccepted,
      oldPrice,
    } = req.body;

    // Validate required fields
    if (!title || String(title).trim().length < 2) {
      return res.status(400).json({ success: false, message: "Product title is required" });
    }

    const numericPrice = parseNumber(price);
    if (numericPrice === null || numericPrice < 0) {
      return res.status(400).json({ success: false, message: "A valid product price is required" });
    }

    if (!sellerPhone || !String(sellerPhone).trim()) {
      return res.status(400).json({ success: false, message: "Seller phone number is required" });
    }

    // Normalize category
    const selectedCategory = normalizeCategory(category);
    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: `Invalid product category: ${category}`,
        allowedCategories: VALID_CATEGORIES,
      });
    }

    // Condition
    const selectedCondition = condition || "Good";
    if (!VALID_CONDITIONS.includes(selectedCondition)) {
      return res.status(400).json({ success: false, message: "Invalid product condition" });
    }

    // Battery health
    let parsedBatteryHealth = null;
    if (batteryHealth !== undefined && batteryHealth !== "") {
      parsedBatteryHealth = parseNumber(batteryHealth);
      if (parsedBatteryHealth === null || parsedBatteryHealth < 0 || parsedBatteryHealth > 100) {
        return res.status(400).json({ success: false, message: "Battery health must be between 0 and 100" });
      }
    }

    // Face ID
    const selectedFaceId = String(faceId || "").trim();
    if (!VALID_FACE_ID.includes(selectedFaceId)) {
      return res.status(400).json({ success: false, message: "Invalid Face ID status" });
    }

    // SIM status
    const selectedSimStatus = String(simStatus || "").trim();
    if (!VALID_SIM_STATUS.includes(selectedSimStatus)) {
      return res.status(400).json({ success: false, message: "Invalid SIM status" });
    }

    // Cosmetic type
    const selectedCosmeticType = String(cosmeticType || "").trim();
    if (selectedCosmeticType && !VALID_COSMETIC_TYPES.includes(selectedCosmeticType)) {
      return res.status(400).json({ success: false, message: "Invalid cosmetic type" });
    }

    // Old price
    let parsedOldPrice = null;
    if (oldPrice !== undefined && oldPrice !== "") {
      parsedOldPrice = parseNumber(oldPrice);
      if (parsedOldPrice === null || parsedOldPrice < 0) {
        return res.status(400).json({ success: false, message: "Invalid old price" });
      }
    }

    // Upload files
    const files = req.files || [];
    const { imageUrls, videoUrls } = await uploadProductFiles(files);
    uploadedImages = imageUrls;
    uploadedVideos = videoUrls;

    // Build product data
    const productData = {
      title: String(title).trim(),
      price: numericPrice,
      oldPrice: parsedOldPrice,
      category: selectedCategory,
      location: String(location || "Ghana").trim(),
      description: String(description || "").trim(),
      sellerId: userId,
      sellerName: String(sellerName || req.user?.name || "").trim(),
      sellerPhone: String(sellerPhone).trim(),
      images: imageUrls,
      videos: videoUrls,
      image: imageUrls.length ? imageUrls[0] : "",
      brand: String(brand || "").trim(),
      model: String(model || "").trim(),
      color: String(color || "").trim(),
      condition: selectedCondition,
      warranty: String(warranty || "").trim(),
      storage: String(storage || "").trim(),
      ram: String(ram || "").trim(),
      processor: String(processor || "").trim(),
      graphics: String(graphics || "").trim(),
      screenSize: String(screenSize || "").trim(),
      year: String(year || "").trim(),
      connectivity: String(connectivity || "").trim(),
      videoOutput: String(videoOutput || "").trim(),
      region: String(region || "").trim(),
      consoleType: String(consoleType || "").trim(),
      edition: String(edition || "").trim(),
      discDrive: String(discDrive || "").trim(),
      controllersIncluded: String(controllersIncluded || "").trim(),
      battery: String(battery || "").trim(),
      resolution: String(resolution || "").trim(),
      watchSize: String(watchSize || "").trim(),
      tvType: String(tvType || "").trim(),
      displayTechnology: String(displayTechnology || "").trim(),
      refreshRate: String(refreshRate || "").trim(),
      operatingSystem: String(operatingSystem || "").trim(),
      hdr: String(hdr || "").trim(),
      hdmiPorts: String(hdmiPorts || "").trim(),
      usbPorts: String(usbPorts || "").trim(),
      smartTV: parseBoolean(smartTV),
      voiceControl: parseBoolean(voiceControl),
      wallMountable: parseBoolean(wallMountable),
      mileage: parseNumber(mileage),
      bodyType: String(bodyType || "").trim(),
      fuelType: String(fuelType || "").trim(),
      transmission: String(transmission || "").trim(),
      driveType: String(driveType || "").trim(),
      engineSize: String(engineSize || "").trim(),
      seatingCapacity: parseNumber(seatingCapacity),
      exteriorColor: String(exteriorColor || "").trim(),
      interiorColor: String(interiorColor || "").trim(),
      accessoryType: String(accessoryType || "").trim(),
      compatibleWith: String(compatibleWith || "").trim(),
      compatibility: String(compatibility || "").trim(),
      material: String(material || "").trim(),
      cableType: String(cableType || "").trim(),
      connectorType: String(connectorType || "").trim(),
      powerOutput: String(powerOutput || "").trim(),
      capacity: String(capacity || "").trim(),
      batteryCapacity: String(batteryCapacity || "").trim(),
      wireless: parseBoolean(wireless),
      original: parseBoolean(original),
      batteryHealth: parsedBatteryHealth,
      faceId: selectedFaceId,
      simStatus: selectedSimStatus,
      cosmeticType: selectedCosmeticType,
      skinType: String(skinType || "").trim(),
      shade: String(shade || "").trim(),
      size: String(size || "").trim(),
      gender: String(gender || "").trim(),
      ingredients: String(ingredients || "").trim(),
      expiryDate: String(expiryDate || "").trim(),
      volume: String(volume || "").trim(),
      scent: String(scent || "").trim(),
      negotiation: parseBoolean(negotiation),
      swapAccepted: parseBoolean(swapAccepted),
      status: "active",
    };

    const product = await Product.create(productData);

    console.log("✅ PRODUCT CREATED");
    console.log("ID:", product._id.toString());
    console.log("Category received:", category);
    console.log("Category saved:", product.category);
    console.log("Cosmetic type:", product.cosmeticType);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("❌ Create product error:", error);

    // Clean up uploaded files
    for (const image of uploadedImages) {
      await deleteFromCloudinary(image, "image");
    }
    for (const video of uploadedVideos) {
      await deleteFromCloudinary(video, "video");
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate product entry",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// ============================================================
// UPDATE
// ============================================================

exports.updateProduct = async (req, res) => {
  let newlyUploadedImages = [];
  let newlyUploadedVideos = [];

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!isOwnerOrAdmin(product, req)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product",
      });
    }

    const body = req.body;

    // Title
    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (title.length < 2) {
        return res.status(400).json({ success: false, message: "Product title is required" });
      }
      product.title = title;
    }

    // Price
    if (body.price !== undefined && body.price !== "") {
      const price = parseNumber(body.price);
      if (price === null || price < 0) {
        return res.status(400).json({ success: false, message: "Invalid price" });
      }
      product.price = price;
    }

    // Old price
    if (body.oldPrice !== undefined) {
      if (body.oldPrice === "") {
        product.oldPrice = null;
      } else {
        const oldPrice = parseNumber(body.oldPrice);
        if (oldPrice === null || oldPrice < 0) {
          return res.status(400).json({ success: false, message: "Invalid old price" });
        }
        product.oldPrice = oldPrice;
      }
    }

    // Category
    if (body.category !== undefined) {
      const normalizedCategory = normalizeCategory(body.category);
      if (!normalizedCategory) {
        return res.status(400).json({
          success: false,
          message: `Invalid product category: ${body.category}`,
          allowedCategories: VALID_CATEGORIES,
        });
      }
      product.category = normalizedCategory;
    }

    // Location
    if (body.location !== undefined) {
      product.location = String(body.location).trim();
    }

    // Description
    if (body.description !== undefined) {
      product.description = String(body.description).trim();
    }

    // Seller name / phone
    if (body.sellerName !== undefined) {
      product.sellerName = String(body.sellerName).trim();
    }
    if (body.sellerPhone !== undefined) {
      const phone = String(body.sellerPhone).trim();
      if (!phone) {
        return res.status(400).json({ success: false, message: "Seller phone number cannot be empty" });
      }
      product.sellerPhone = phone;
    }

    // String fields
    const stringFields = [
      "brand",
      "model",
      "color",
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
      "bodyType",
      "fuelType",
      "transmission",
      "driveType",
      "engineSize",
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
      "skinType",
      "shade",
      "size",
      "gender",
      "ingredients",
      "expiryDate",
      "volume",
      "scent",
    ];

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        product[field] = String(body[field]).trim();
      }
    }

    // Cosmetic type
    if (body.cosmeticType !== undefined) {
      const cosmeticType = String(body.cosmeticType).trim();
      if (cosmeticType && !VALID_COSMETIC_TYPES.includes(cosmeticType)) {
        return res.status(400).json({ success: false, message: "Invalid cosmetic type" });
      }
      product.cosmeticType = cosmeticType;
    }

    // Condition
    if (body.condition !== undefined) {
      if (!VALID_CONDITIONS.includes(body.condition)) {
        return res.status(400).json({ success: false, message: "Invalid product condition" });
      }
      product.condition = body.condition;
    }

    // SIM status
    if (body.simStatus !== undefined) {
      const simStatus = String(body.simStatus).trim();
      if (!VALID_SIM_STATUS.includes(simStatus)) {
        return res.status(400).json({ success: false, message: "Invalid SIM status" });
      }
      product.simStatus = simStatus;
    }

    // Battery health
    if (body.batteryHealth !== undefined) {
      if (body.batteryHealth === "") {
        product.batteryHealth = null;
      } else {
        const batteryHealth = parseNumber(body.batteryHealth);
        if (batteryHealth === null || batteryHealth < 0 || batteryHealth > 100) {
          return res.status(400).json({
            success: false,
            message: "Battery health must be between 0 and 100",
          });
        }
        product.batteryHealth = batteryHealth;
      }
    }

    // Face ID
    if (body.faceId !== undefined) {
      const faceId = String(body.faceId).trim();
      if (!VALID_FACE_ID.includes(faceId)) {
        return res.status(400).json({ success: false, message: "Invalid Face ID status" });
      }
      product.faceId = faceId;
    }

    // Numeric fields
    const numberFields = ["mileage", "seatingCapacity"];
    for (const field of numberFields) {
      if (body[field] !== undefined) {
        const value = parseNumber(body[field]);
        if (value !== null && value < 0) {
          return res.status(400).json({ success: false, message: `Invalid ${field}` });
        }
        product[field] = value;
      }
    }

    // Boolean fields
    const booleanFields = [
      "smartTV",
      "voiceControl",
      "wallMountable",
      "wireless",
      "original",
      "negotiation",
      "swapAccepted",
    ];
    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        product[field] = parseBoolean(body[field]);
      }
    }

    // Status
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return res.status(400).json({ success: false, message: "Invalid product status" });
      }
      product.status = body.status;
    }

    // Images to keep
    const imagesToKeep = parseArrayField(body.imagesToKeep, "imagesToKeep");
    if (Array.isArray(imagesToKeep)) {
      const oldImages = product.images || [];
      const cleanImages = imagesToKeep
        .filter((url) => typeof url === "string" && url.trim())
        .slice(0, MAX_IMAGES);
      for (const oldImage of oldImages) {
        if (!cleanImages.includes(oldImage)) {
          await deleteFromCloudinary(oldImage, "image");
        }
      }
      product.images = cleanImages;
    }

    // Videos to keep
    const videosToKeep = parseArrayField(body.videosToKeep, "videosToKeep");
    if (Array.isArray(videosToKeep)) {
      const oldVideos = product.videos || [];
      const cleanVideos = videosToKeep
        .filter((url) => typeof url === "string" && url.trim())
        .slice(0, MAX_VIDEOS);
      for (const oldVideo of oldVideos) {
        if (!cleanVideos.includes(oldVideo)) {
          await deleteFromCloudinary(oldVideo, "video");
        }
      }
      product.videos = cleanVideos;
    }

    // Upload new files
    const files = req.files || [];
    const newImageFiles = files.filter((f) => f?.buffer && f?.mimetype?.startsWith("image/"));
    const newVideoFiles = files.filter((f) => f?.buffer && f?.mimetype?.startsWith("video/"));

    const currentImages = Array.isArray(product.images) ? product.images : [];
    const currentVideos = Array.isArray(product.videos) ? product.videos : [];

    const imageCapacity = Math.max(MAX_IMAGES - currentImages.length, 0);
    const videoCapacity = Math.max(MAX_VIDEOS - currentVideos.length, 0);

    for (const file of newImageFiles.slice(0, imageCapacity)) {
      const result = await uploadToCloudinary(file.buffer, "image");
      if (result?.secure_url) {
        product.images.push(result.secure_url);
        newlyUploadedImages.push(result.secure_url);
      }
    }

    for (const file of newVideoFiles.slice(0, videoCapacity)) {
      const result = await uploadToCloudinary(file.buffer, "video");
      if (result?.secure_url) {
        product.videos.push(result.secure_url);
        newlyUploadedVideos.push(result.secure_url);
      }
    }

    // Enforce limits
    product.images = product.images.slice(0, MAX_IMAGES);
    product.videos = product.videos.slice(0, MAX_VIDEOS);
    product.image = product.images.length ? product.images[0] : "";

    await product.save();

    console.log(`✅ Product updated: ${product._id}`);

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("❌ Update product error:", error);

    // Clean up newly uploaded files
    for (const image of newlyUploadedImages) {
      await deleteFromCloudinary(image, "image");
    }
    for (const video of newlyUploadedVideos) {
      await deleteFromCloudinary(video, "video");
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// ============================================================
// DELETE
// ============================================================

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!isOwnerOrAdmin(product, req)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this product",
      });
    }

    // Delete images and videos from Cloudinary
    for (const image of product.images || []) {
      await deleteFromCloudinary(image, "image");
    }
    for (const video of product.videos || []) {
      await deleteFromCloudinary(video, "video");
    }

    await product.deleteOne();

    console.log(`🗑️ Product deleted: ${id}`);
    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

// ============================================================
// GET SELLER PRODUCTS
// ============================================================

exports.getSellerProducts = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const products = await Product.find({ sellerId: userId })
      .populate("sellerId", "name email phone location avatar role")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      products: products.map(formatProduct),
      total: products.length,
    });
  } catch (error) {
    console.error("❌ Get seller products error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch seller products",
    });
  }
};

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================

exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: active, pending, inactive, sold",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!isOwnerOrAdmin(product, req)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product",
      });
    }

    product.status = status;
    await product.save();

    return res.json({
      success: true,
      message: `Product status updated to ${status}`,
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("❌ Update product status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product status",
    });
  }
};

// ============================================================
// UPDATE STOCK (Not supported – kept for route compatibility)
// ============================================================

exports.updateStock = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Stock is not supported by the current Product model",
  });
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getProducts: exports.getProducts,
  getProductById: exports.getProductById,
  createProduct: exports.createProduct,
  updateProduct: exports.updateProduct,
  deleteProduct: exports.deleteProduct,
  updateStock: exports.updateStock,
  getSellerProducts: exports.getSellerProducts,
  updateProductStatus: exports.updateProductStatus,
};