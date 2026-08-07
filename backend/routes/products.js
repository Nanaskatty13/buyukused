// routes/products.js
const express = require("express");
const mongoose = require("mongoose"); // 👈 for ObjectId validation
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
//  TEST ROUTE – to verify the router is reachable
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
    // Validate that id is a valid ObjectId
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
  // ... (unchanged, see previous version)
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
    // ... rest unchanged
  } catch (err) {
    // ...
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
    // ... rest unchanged
  } catch (err) {
    // ...
  }
});

module.exports = router;