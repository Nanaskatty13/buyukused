// backend/routes/products.js
const express = require("express");
const mongoose = require("mongoose");
const { verifyToken, isSeller } = require("../middleware/auth");

// ─── Load Product model ──────────────────────────────────────────
let Product;
try {
  Product = require("../models/Product");
  console.log("✅ Product model loaded successfully");
} catch (err) {
  console.error("❌ Failed to load Product model:", err.message);
  const dummySchema = new mongoose.Schema({}, { strict: false });
  Product = mongoose.model("Product", dummySchema, "products");
}

// ─── Load multer (expects Cloudinary storage) ───────────────────
let upload;
try {
  const multerModule = require("../config/multer");
  if (multerModule && typeof multerModule === 'object' && multerModule.upload) {
    upload = multerModule.upload;
  } else {
    upload = multerModule;
  }
  if (typeof upload.array !== 'function') {
    throw new Error('Multer instance invalid');
  }
  console.log("✅ Multer config loaded (Cloudinary)");
} catch (e) {
  console.warn("⚠️ Multer config fallback used:", e.message);
  const multer = require("multer");
  upload = multer({ storage: multer.memoryStorage() });
}

const router = express.Router();

// ─── Test route ──────────────────────────────────────────────────
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Products router is alive!" });
});

// ─── GET all products ────────────────────────────────────────────
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

// ─── GET single product ──────────────────────────────────────────
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

// ─── CREATE product ──────────────────────────────────────────────
router.post("/", verifyToken, isSeller, upload.array("files", 5), async (req, res) => {
  console.log("📩 POST /api/products received");
  try {
    const {
      title, price, category, location, description,
      sellerName, sellerPhone, storage, color, condition,
      negotiation, swapAccepted, simStatus, batteryHealth, faceId
    } = req.body;

    if (!title || !price || !sellerPhone) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and phone number are required",
      });
    }

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

    // ✅ Use Cloudinary URLs (file.path) – full URLs
    const files = req.files || [];
    const imageUrls = files
      .filter(file => !file.mimetype.startsWith("video/"))
      .map(file => file.path);  // Cloudinary full URL

    productData.images = imageUrls;

    const product = new Product(productData);
    await product.save();
    console.log(`✅ Product created: ${product._id}`);
    res.status(201).json({ success: true, product, message: "Product created successfully" });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate entry" });
    }
    res.status(500).json({ success: false, message: err.message || "Failed to create product" });
  }
});

// ─── UPDATE product – with image removal & Cloudinary URLs ──────
router.put("/:id", verifyToken, upload.array("files", 5), async (req, res) => {
  console.log(`🔍 PUT /api/products/${req.params.id} – update request`);

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const isOwner = product.sellerId.equals(req.userId) ||
                    product.sellerId.toString() === req.userId.toString();
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized – you do not own this product",
      });
    }

    // 1. Update text fields
    const {
      title, price, category, location, description,
      sellerName, sellerPhone, storage, color, condition,
      negotiation, swapAccepted, simStatus, batteryHealth, faceId
    } = req.body;

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

    // 2. Handle images safely – replace with kept list (if provided)
    if (req.body.imagesToKeep !== undefined) {
      try {
        const kept = JSON.parse(req.body.imagesToKeep);
        if (Array.isArray(kept)) {
          // imagesToKeep contains full Cloudinary URLs (or local URLs if mixed)
          // Replace the images array with the kept list
          product.images = kept;
          console.log(`✅ imagesToKeep applied: ${kept.length} images kept`);
        } else {
          console.warn("⚠️ imagesToKeep is not an array – keeping existing images");
        }
      } catch (e) {
        console.warn("⚠️ Failed to parse imagesToKeep – keeping existing images");
      }
    } else {
      console.log("ℹ️ imagesToKeep not provided – keeping existing images");
    }

    // 3. Append newly uploaded files (Cloudinary URLs)
    const files = req.files || [];
    for (const file of files) {
      if (!file.mimetype.startsWith("video/")) {
        // file.path is the full Cloudinary URL
        product.images.push(file.path);
      }
    }

    await product.save();
    console.log(`✅ Product ${product._id} updated, images: ${product.images.length}`);
    res.json({ success: true, product, message: "Product updated" });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE product ──────────────────────────────────────────────
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
    const isOwner = product.sellerId.equals(req.userId) ||
                    product.sellerId.toString() === req.userId.toString();
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized – you do not own this product",
      });
    }
    await product.deleteOne();
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;