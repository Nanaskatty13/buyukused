// routes/products.js
const express = require("express");
const { verifyToken, isSeller } = require("../middleware/auth");

// ===============================
// SAFELY LOAD THE PRODUCT MODEL
// ===============================
let Product;
try {
  Product = require("../models/Product");
  console.log("✅ Product model loaded successfully");
} catch (err) {
  console.error("❌ Failed to load Product model:", err.message);
  // Create a dummy model to prevent crashes (but routes will fail gracefully)
  const mongoose = require("mongoose");
  const dummySchema = new mongoose.Schema({}, { strict: false });
  Product = mongoose.model("Product", dummySchema, "products");
}

// ===============================
// SAFELY LOAD MULTER CONFIG
// ===============================
let upload;
try {
  upload = require("../config/multer");
  console.log("✅ Multer config loaded from /config/multer");
} catch (e) {
  console.warn("⚠️ Multer config not found, using fallback (memory storage)");
  const multer = require("multer");
  upload = multer({ storage: multer.memoryStorage() });
}

const router = express.Router();
console.log("✅ Products route mounted");

// ================================================================
//  TEST ROUTE – to verify the router is reachable
// ================================================================
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Products router is alive!" });
});

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

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate("sellerId", "name phone email"),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  GET single product (public)
// ================================================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("sellerId", "name phone email");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    product.views += 1;
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  CREATE product – Seller/Admin only
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

    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const baseUrl = `${protocol}://${host}`;

    const uploadedFiles = (req.files || []).map((file) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      type: file.mimetype && file.mimetype.startsWith("video/") ? "video" : "image",
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
      images,
      videos,
      brand: brand || "",
      model: model || "",
      condition: condition || "Good",
      storage: storage || "",
      ram: ram || "",
      color: color || "",
      status: status || "active",
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
    console.error("❌ Error creating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  UPDATE product – Seller/Admin
// ================================================================
router.put("/:id", verifyToken, upload.array("files", 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const sellerId = req.user?._id || req.userId;
    if (product.sellerId.toString() !== sellerId.toString() && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const allowedFields = [
      "title", "price", "oldPrice", "category", "location", "description",
      "sellerName", "sellerPhone", "brand", "model",
      "condition", "storage", "ram", "color", "status", "promo", "verified",
      "batteryHealth", "faceId", "simStatus", "negotiation", "swapAccepted",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (["price", "oldPrice"].includes(field)) {
          product[field] = parseFloat(req.body[field]) || 0;
        } else if (["promo", "verified", "negotiation", "swapAccepted"].includes(field)) {
          product[field] = req.body[field] === "true" || req.body[field] === true;
        } else if (field === "batteryHealth") {
          product[field] = req.body[field] !== undefined && req.body[field] !== '' ? parseFloat(req.body[field]) : null;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    let imagesToKeep = [];
    if (req.body.imagesToKeep) {
      try {
        imagesToKeep = JSON.parse(req.body.imagesToKeep);
        if (!Array.isArray(imagesToKeep)) imagesToKeep = [];
      } catch (e) { /* ignore */ }
    }

    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const baseUrl = `${protocol}://${host}`;

    const newImageUrls = (req.files || [])
      .filter(file => !file.mimetype || !file.mimetype.startsWith("video/"))
      .map(file => `${baseUrl}/uploads/${file.filename}`);

    const finalImages = [...imagesToKeep, ...newImageUrls];
    product.images = finalImages;
    product.image = finalImages.length > 0 ? finalImages[0] : "https://placehold.co/400x300?text=No+Image";

    const newVideoUrls = (req.files || [])
      .filter(file => file.mimetype && file.mimetype.startsWith("video/"))
      .map(file => `${baseUrl}/uploads/${file.filename}`);
    if (newVideoUrls.length) {
      product.videos = [...(product.videos || []), ...newVideoUrls];
    }

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================================================================
//  DELETE product – Seller/Admin
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
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;