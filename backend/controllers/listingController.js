// backend/controllers/listingController.js

const Listing = require("../models/Listing");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// ---- Try to load your existing cloudinary service ----
let uploadToCloudinary = null;
try {
  // Attempt to require the service
  const cloudinaryService = require("../services/cloudinary");
  // Check for common export patterns
  if (cloudinaryService && typeof cloudinaryService.upload === "function") {
    uploadToCloudinary = cloudinaryService.upload;
  } else if (cloudinaryService && typeof cloudinaryService.uploadFile === "function") {
    uploadToCloudinary = cloudinaryService.uploadFile;
  } else if (cloudinaryService && typeof cloudinaryService.default === "object") {
    const def = cloudinaryService.default;
    if (def && typeof def.upload === "function") uploadToCloudinary = def.upload;
    else if (def && typeof def.uploadFile === "function") uploadToCloudinary = def.uploadFile;
  }
  // If we still don't have a function, check if the service itself is a function
  if (!uploadToCloudinary && typeof cloudinaryService === "function") {
    uploadToCloudinary = cloudinaryService;
  }
} catch {
  // No cloudinary service – fall back to local storage
  uploadToCloudinary = null;
}

// ---- Local storage fallback ----
const uploadDir = path.join(__dirname, "../public/uploads/listings");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Save a file buffer to Cloudinary or locally
 * Returns: { url: string, filename: string|null }
 */
const saveFile = async (buffer, originalName, mimetype) => {
  if (uploadToCloudinary) {
    try {
      const result = await uploadToCloudinary(buffer, {
        folder: "listings",
        public_id: `listing-${Date.now()}`,
        resource_type: "auto",
      });
      return { url: result.secure_url, filename: null };
    } catch (error) {
      console.warn("Cloudinary upload failed, falling back to local:", error.message);
      // Fall through to local
    }
  }

  // Local fallback
  const ext = path.extname(originalName) || ".jpg";
  const filename = `listing-${uuidv4()}${ext}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  const url = `/uploads/listings/${filename}`;
  return { url, filename };
};

/**
 * Delete a local file (used when not using Cloudinary)
 */
const deleteLocalFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, "../public", filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// ============================================================
// CONTROLLER FUNCTIONS
// ============================================================

/**
 * @desc    Get all listings (public)
 * @route   GET /api/listings
 */
exports.getListings = async (req, res) => {
  try {
    const {
      category,
      partType,
      condition,
      minPrice,
      maxPrice,
      make,
      model,
      year,
      status = "published",
      limit = 20,
      page = 1,
      sort = "-createdAt",
      search,
    } = req.query;

    const filter = { status: "published" };
    if (category) filter.category = category;
    if (partType) filter.partType = partType;
    if (condition) filter.condition = condition;
    if (make) filter["attributes.make"] = make;
    if (model) filter["attributes.model"] = model;
    if (year) filter["attributes.modelYear"] = parseInt(year);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await Listing.find(filter)
      .populate("user", "name email phone photoURL")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get single listing by ID
 * @route   GET /api/listings/:id
 */
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("user", "name email phone photoURL")
      .lean();
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  } catch (error) {
    console.error("❌ Error fetching listing:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Create a new listing (with images)
 * @route   POST /api/listings
 * @access  Private
 */
exports.createListing = async (req, res) => {
  try {
    const userId = req.user.id;

    // Extract all fields from request body
    const {
      make,
      model,
      modelYear,
      yearRange,
      generation,
      trim,
      engineSize,
      engineCode,
      fuelType,
      transmission,
      driveType,
      partCategory,
      partType,
      partName,
      partNumber,
      manufacturer,
      condition,
      quantity,
      position,
      color,
      material,
      description,
      price,
      negotiable,
      quantityAvailable,
      minOrderQty,
      wholesaleAvailable,
      wholesalePrice,
      originalPrice,
      currency,
      video,
      sellerLocation,
      pickupAvailable,
      deliveryAvailable,
      deliveryFee,
      freeDelivery,
      deliveryTime,
      warranty,
      returnPolicy,
      listingTitle,
      status = "draft",
    } = req.body;

    // ---- Build attributes (dynamic fields) ----
    const schemaFields = [
      "make",
      "model",
      "modelYear",
      "yearRange",
      "generation",
      "trim",
      "engineSize",
      "engineCode",
      "fuelType",
      "transmission",
      "driveType",
      "partCategory",
      "partType",
      "partName",
      "partNumber",
      "manufacturer",
      "condition",
      "quantity",
      "position",
      "color",
      "material",
      "description",
      "price",
      "negotiable",
      "quantityAvailable",
      "minOrderQty",
      "wholesaleAvailable",
      "wholesalePrice",
      "originalPrice",
      "currency",
      "video",
      "sellerLocation",
      "pickupAvailable",
      "deliveryAvailable",
      "deliveryFee",
      "freeDelivery",
      "deliveryTime",
      "warranty",
      "returnPolicy",
      "listingTitle",
      "status",
    ];

    const attributes = {};
    for (const key in req.body) {
      if (!schemaFields.includes(key) && !key.startsWith("_")) {
        attributes[key] = req.body[key];
      }
    }

    // ---- Handle images ----
    const mainFile = req.files?.mainImage?.[0];
    const additionalFiles = req.files?.additionalImages || [];

    if (!mainFile) {
      return res.status(400).json({ message: "Main image is required" });
    }

    const mainResult = await saveFile(
      mainFile.buffer,
      mainFile.originalname,
      mainFile.mimetype
    );

    const additionalResults = [];
    for (const file of additionalFiles) {
      const result = await saveFile(file.buffer, file.originalname, file.mimetype);
      additionalResults.push(result.url);
    }

    // ---- Build listing object ----
    const listingData = {
      user: userId,
      title:
        listingTitle ||
        `${make || ""} ${model || ""} ${partType || ""} ${partName || ""}`.trim(),
      category: partCategory,
      partType,
      partName,
      condition: condition || "New",
      price: parseFloat(price),
      currency: currency || "USD",
      quantityAvailable: parseInt(quantityAvailable) || 1,
      description,
      images: {
        main: mainResult.url,
        additional: additionalResults,
      },
      video: video || "",
      location: sellerLocation,
      negotiable: negotiable === "true" || negotiable === true,
      wholesaleAvailable: wholesaleAvailable === "true" || wholesaleAvailable === true,
      wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      minOrderQty: minOrderQty ? parseInt(minOrderQty) : 1,
      deliveryAvailable: deliveryAvailable === "true" || deliveryAvailable === true,
      deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 0,
      freeDelivery: freeDelivery === "true" || freeDelivery === true,
      deliveryTime: deliveryTime || "",
      warranty: warranty || "",
      returnPolicy: returnPolicy || "",
      pickupAvailable: pickupAvailable === "true" || pickupAvailable === true,
      attributes,
      status: status === "published" ? "published" : "draft",
    };

    const listing = new Listing(listingData);
    await listing.save();

    res.status(201).json({
      message: "Listing created successfully",
      listing,
    });
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update a listing
 * @route   PUT /api/listings/:id
 * @access  Private
 */
exports.updateListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    if (listing.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ---- Update core fields ----
    const {
      partCategory,
      partType,
      partName,
      condition,
      price,
      currency,
      quantityAvailable,
      description,
      video,
      sellerLocation,
      negotiable,
      wholesaleAvailable,
      wholesalePrice,
      originalPrice,
      minOrderQty,
      deliveryAvailable,
      deliveryFee,
      freeDelivery,
      deliveryTime,
      warranty,
      returnPolicy,
      pickupAvailable,
      listingTitle,
      status,
    } = req.body;

    if (partCategory) listing.category = partCategory;
    if (partType) listing.partType = partType;
    if (partName) listing.partName = partName;
    if (condition) listing.condition = condition;
    if (price) listing.price = parseFloat(price);
    if (currency) listing.currency = currency;
    if (quantityAvailable) listing.quantityAvailable = parseInt(quantityAvailable);
    if (description) listing.description = description;
    if (video) listing.video = video;
    if (sellerLocation) listing.location = sellerLocation;
    if (negotiable !== undefined) listing.negotiable = negotiable === "true" || negotiable === true;
    if (wholesaleAvailable !== undefined)
      listing.wholesaleAvailable = wholesaleAvailable === "true" || wholesaleAvailable === true;
    if (wholesalePrice) listing.wholesalePrice = parseFloat(wholesalePrice);
    if (originalPrice) listing.originalPrice = parseFloat(originalPrice);
    if (minOrderQty) listing.minOrderQty = parseInt(minOrderQty);
    if (deliveryAvailable !== undefined)
      listing.deliveryAvailable = deliveryAvailable === "true" || deliveryAvailable === true;
    if (deliveryFee) listing.deliveryFee = parseFloat(deliveryFee);
    if (freeDelivery !== undefined) listing.freeDelivery = freeDelivery === "true" || freeDelivery === true;
    if (deliveryTime) listing.deliveryTime = deliveryTime;
    if (warranty) listing.warranty = warranty;
    if (returnPolicy) listing.returnPolicy = returnPolicy;
    if (pickupAvailable !== undefined)
      listing.pickupAvailable = pickupAvailable === "true" || pickupAvailable === true;
    if (status) listing.status = status;
    if (listingTitle) listing.title = listingTitle;

    // ---- Update attributes ----
    const schemaFields = [
      "partCategory",
      "partType",
      "partName",
      "condition",
      "price",
      "currency",
      "quantityAvailable",
      "description",
      "video",
      "sellerLocation",
      "negotiable",
      "wholesaleAvailable",
      "wholesalePrice",
      "originalPrice",
      "minOrderQty",
      "deliveryAvailable",
      "deliveryFee",
      "freeDelivery",
      "deliveryTime",
      "warranty",
      "returnPolicy",
      "pickupAvailable",
      "listingTitle",
      "status",
    ];

    const newAttributes = { ...listing.attributes };
    for (const key in req.body) {
      if (!schemaFields.includes(key) && !key.startsWith("_")) {
        newAttributes[key] = req.body[key];
      }
    }
    listing.attributes = newAttributes;

    // ---- Handle new images ----
    const mainFile = req.files?.mainImage?.[0];
    const additionalFiles = req.files?.additionalImages || [];

    if (mainFile) {
      // Delete old local file if not using Cloudinary
      if (!uploadToCloudinary && listing.images.main && listing.images.main.startsWith("/uploads")) {
        deleteLocalFile(listing.images.main);
      }
      const result = await saveFile(
        mainFile.buffer,
        mainFile.originalname,
        mainFile.mimetype
      );
      listing.images.main = result.url;
    }

    if (additionalFiles.length > 0) {
      const newAdditional = [];
      for (const file of additionalFiles) {
        const result = await saveFile(file.buffer, file.originalname, file.mimetype);
        newAdditional.push(result.url);
      }
      listing.images.additional.push(...newAdditional);
    }

    listing.updatedAt = Date.now();
    await listing.save();

    res.json({
      message: "Listing updated successfully",
      listing,
    });
  } catch (error) {
    console.error("❌ Error updating listing:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Delete a listing
 * @route   DELETE /api/listings/:id
 * @access  Private
 */
exports.deleteListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete local images if not using Cloudinary
    if (!uploadToCloudinary) {
      if (listing.images.main && listing.images.main.startsWith("/uploads")) {
        deleteLocalFile(listing.images.main);
      }
      listing.images.additional.forEach((img) => {
        if (img.startsWith("/uploads")) deleteLocalFile(img);
      });
    }

    await listing.deleteOne();
    res.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting listing:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Get listings for authenticated user
 * @route   GET /api/listings/my
 * @access  Private
 */
exports.getMyListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 20, page = 1, sort = "-createdAt" } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await Listing.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    const total = await Listing.countDocuments(filter);

    res.json({
      listings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching my listings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update listing status
 * @route   PATCH /api/listings/:id/status
 * @access  Private
 */
exports.updateListingStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const listingId = req.params.id;
    const { status } = req.body;

    if (!status || !["draft", "published", "sold"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    listing.status = status;
    listing.updatedAt = Date.now();
    await listing.save();

    res.json({ message: "Status updated", status: listing.status });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "Server error" });
  }
};