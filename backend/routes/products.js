// routes/products.js
const express = require("express");
const mongoose = require("mongoose");
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
  // Dummy model to prevent crashes (routes will fail gracefully)
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
//  TEST ROUTE
// ================================================================
router.get("/test", (req, res) => {
  console.log("🔍 /test route hit");
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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(id).populate("sellerId", "name phone email");
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
  console.log("📩 POST /api/products received");
  console.log("👤 User ID:", req.userId);
  console.log("📦 Body fields:", Object.keys(req.body));
  console.log("📎 Files count:", req.files?.length || 0);

  try {
    const {
      title,
      price,
      category,
      location,
      description,
      sellerName,
      sellerPhone,
      storage,
      color,
      condition,
      negotiation,      // sent as string "true" / "false"
      swapAccepted,     // sent as string "true" / "false"
      simStatus,
      batteryHealth,
      faceId,
    } = req.body;

    // Basic validation
    if (!title || !price || !sellerPhone) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and phone number are required",
      });
    }

    // Build product object
    const productData = {
      title,
      price: parseFloat(price),
      category: category || "Other",
      location: location || "Ghana",
      description: description || "",
      sellerId: req.userId,
      sellerName: sellerName || req.user?.name || "",
      sellerPhone,
      storage: storage || "",
      color: color || "",
      condition: condition || "Good",
      negotiation: negotiation === "true",
      swapAccepted: swapAccepted === "true",
      simStatus: simStatus || "Unlocked",
      batteryHealth: batteryHealth ? parseInt(batteryHealth, 10) : undefined,
      faceId: faceId || "Working",
      status: "active",
    };

    // Handle file uploads
    const files = req.files || [];
    const imageUrls = [];
    let videoUrl = null;

    for (const file of files) {
      // In production, you'd upload to cloud storage.
      // For now, we store the file path (or a placeholder).
      // We'll simulate by using the file's original name and path.
      // Better: use a cloud storage service like Cloudinary, S3, etc.
      const filePath = `/uploads/${file.filename}`;
      if (file.mimetype.startsWith("video/")) {
        videoUrl = filePath;
      } else {
        imageUrls.push(filePath);
      }
    }

    // If no images, you might want to set a default placeholder.
    if (imageUrls.length === 0) {
      // Optionally, you could add a default image.
    }

    productData.images = imageUrls;
    productData.video = videoUrl;

    const product = new Product(productData);
    await product.save();

    console.log(`✅ Product created: ${product._id}`);

    res.status(201).json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    // Handle multer errors (they are passed to the error handler, but we also catch here)
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate entry" });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Failed to create product",
    });
  }
});

// ================================================================
//  UPDATE product – Seller/Admin
// ================================================================
router.put("/:id", verifyToken, upload.array("files", 5), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check permission: only seller or admin can update
    if (product.sellerId.toString() !== req.userId && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const {
      title,
      price,
      category,
      location,
      description,
      sellerName,
      sellerPhone,
      storage,
      color,
      condition,
      negotiation,
      swapAccepted,
      simStatus,
      batteryHealth,
      faceId,
    } = req.body;

    // Update fields if provided
    if (title) product.title = title;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (location) product.location = location;
    if (description) product.description = description;
    if (sellerName) product.sellerName = sellerName;
    if (sellerPhone) product.sellerPhone = sellerPhone;
    if (storage) product.storage = storage;
    if (color) product.color = color;
    if (condition) product.condition = condition;
    if (negotiation !== undefined) product.negotiation = negotiation === "true";
    if (swapAccepted !== undefined) product.swapAccepted = swapAccepted === "true";
    if (simStatus) product.simStatus = simStatus;
    if (batteryHealth) product.batteryHealth = parseInt(batteryHealth, 10);
    if (faceId) product.faceId = faceId;

    // Handle new files (append to existing)
    const files = req.files || [];
    for (const file of files) {
      const filePath = `/uploads/${file.filename}`;
      if (file.mimetype.startsWith("video/")) {
        product.video = filePath;
      } else {
        product.images.push(filePath);
      }
    }

    await product.save();
    res.json({ success: true, product, message: "Product updated" });
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
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check permission
    if (product.sellerId.toString() !== req.userId && req.user?.role !== "admin") {
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