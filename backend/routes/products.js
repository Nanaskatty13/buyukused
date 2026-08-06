// routes/products.js
const express = require("express");
const path = require("path");
const Product = require("../models/Product");
const { verifyToken, isSeller } = require("../middleware/auth");
const upload = require("../config/multer");

const router = express.Router();

// ================================================================
//  GET all products (public)
// ================================================================
router.get("/", async (req, res) => {
  try {
    const { category, location, search, sellerId, status, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (location && location !== "all") filter.location = location;
    if (sellerId) filter.sellerId = sellerId;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("sellerId", "name phone email"), // removed "photoURL" – add it back if your User model has it
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  GET single product (public)
// ================================================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("sellerId", "name phone email"); // removed photoURL
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    product.views += 1;
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  CREATE product (with file upload) – Seller/Admin only
// ================================================================
router.post("/", verifyToken, isSeller, upload.array("files", 5), async (req, res) => {
  try {
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
      condition,
      storage,
      ram,
      color,
      status,
      // New fields
      batteryHealth,
      faceId,
      simStatus,
      negotiation,
      swapAccepted,
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: "Title and price are required" });
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    // Build file URLs
    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const baseUrl = `${protocol}://${host}`;

    const uploadedFiles = req.files.map((file) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      type: file.mimetype.startsWith("video/") ? "video" : "image",
    }));

    const images = uploadedFiles.filter((f) => f.type === "image").map((f) => f.url);
    const videos = uploadedFiles.filter((f) => f.type === "video").map((f) => f.url);

    const productData = {
      title,
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      category: category || "Other",
      location: location || "Ghana",
      description: description || "",
      sellerId: req.user._id || req.userId,
      sellerName: sellerName || req.user.name || "",
      sellerPhone: sellerPhone || req.user.phone || "",
      image: images.length > 0 ? images[0] : "https://placehold.co/400x300?text=No+Image",
      images: images,
      videos: videos,
      brand: brand || "",
      model: model || "",
      condition: condition || "Good",
      storage: storage || "",
      ram: ram || "",
      color: color || "",
      status: status || "active",
      // New fields – parse carefully
      batteryHealth: batteryHealth !== undefined && batteryHealth !== '' ? parseFloat(batteryHealth) : null,
      faceId: faceId || "",
      simStatus: simStatus || "",
      negotiation: negotiation === "true" || negotiation === true,
      swapAccepted: swapAccepted === "true" || swapAccepted === true,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  UPDATE product (Seller/Admin) – with image management
// ================================================================
router.put("/:id", verifyToken, upload.array("files", 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Authorization check
    const sellerId = req.user?._id || req.userId;
    if (product.sellerId.toString() !== sellerId.toString() && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // --- Update text fields ---
    const allowedFields = [
      "title", "price", "oldPrice", "category", "location", "description",
      "sellerName", "sellerPhone", "brand", "model",
      "condition", "storage", "ram", "color", "status", "promo", "verified",
      // New fields
      "batteryHealth", "faceId", "simStatus", "negotiation", "swapAccepted",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "price" || field === "oldPrice") {
          product[field] = parseFloat(req.body[field]) || 0;
        } else if (field === "promo" || field === "verified" || field === "negotiation" || field === "swapAccepted") {
          product[field] = req.body[field] === "true" || req.body[field] === true;
        } else if (field === "batteryHealth") {
          const val = req.body[field] !== undefined && req.body[field] !== '' ? parseFloat(req.body[field]) : null;
          product[field] = val;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    // --- Handle images ---
    let imagesToKeep = [];
    if (req.body.imagesToKeep) {
      try {
        imagesToKeep = JSON.parse(req.body.imagesToKeep);
        if (!Array.isArray(imagesToKeep)) imagesToKeep = [];
      } catch (e) {
        imagesToKeep = [];
      }
    }

    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const baseUrl = `${protocol}://${host}`;

    const newImageUrls = (req.files || [])
      .filter(file => !file.mimetype.startsWith("video/"))
      .map(file => `${baseUrl}/uploads/${file.filename}`);

    const finalImages = [...imagesToKeep, ...newImageUrls];
    product.images = finalImages;
    product.image = finalImages.length > 0 ? finalImages[0] : "https://placehold.co/400x300?text=No+Image";

    const newVideoUrls = (req.files || [])
      .filter(file => file.mimetype.startsWith("video/"))
      .map(file => `${baseUrl}/uploads/${file.filename}`);
    if (newVideoUrls.length) {
      product.videos = [...(product.videos || []), ...newVideoUrls];
    }

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  DELETE product (Seller/Admin)
// ================================================================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const sellerId = req.user?._id || req.userId;
    if (product.sellerId.toString() !== sellerId.toString() && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;