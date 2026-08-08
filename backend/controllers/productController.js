const Product = require("../models/Product");

// ==========================
// Get All Products
// ==========================
exports.getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    let query = {};

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate("seller", "name email phone")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Get Single Product
// ==========================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email phone"
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Create Product (with Cloudinary images)
// ==========================
exports.createProduct = async (req, res) => {
  try {
    // Destructure all text fields from req.body
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

    // Basic validation
    if (!title || !price || !sellerPhone) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and phone number are required",
      });
    }

    // Prepare product data
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

    // Handle uploaded files – using Cloudinary URLs
    const files = req.files || [];
    // For images, we take only non-video files and store their Cloudinary URL
    const imageUrls = files
      .filter((file) => !file.mimetype.startsWith("video/"))
      .map((file) => file.path); // ✅ Cloudinary full URL

    productData.images = imageUrls;

    // Create and save product
    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Duplicate entry" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Update Product (with Cloudinary support)
// ==========================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 1. Update text fields
    const allowedFields = [
      "title",
      "price",
      "description",
      "category",
      "location",
      "condition",
      "storage",
      "color",
      "status",
      "sellerPhone",
      "batteryHealth",
      "faceId",
      "simStatus",
      "negotiation",
      "swapAccepted",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "negotiation" || field === "swapAccepted") {
          product[field] = req.body[field] === "true";
        } else if (field === "price" || field === "batteryHealth") {
          product[field] = req.body[field] === "" ? null : Number(req.body[field]);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    // 2. Handle images – keep only those in imagesToKeep
    let imagesToKeep = [];
    if (req.body.imagesToKeep) {
      try {
        imagesToKeep = JSON.parse(req.body.imagesToKeep);
      } catch (e) {
        imagesToKeep = [];
      }
    }
    if (Array.isArray(imagesToKeep)) {
      product.images = imagesToKeep; // Removes images not in the list
    }

    // 3. Append newly uploaded files – using Cloudinary URLs
    if (req.files && req.files.length > 0) {
      // Get only non-video files and map to Cloudinary URL (file.path)
      const newImageUrls = req.files
        .filter((file) => !file.mimetype.startsWith("video/"))
        .map((file) => file.path);
      product.images = [...product.images, ...newImageUrls];
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Delete Product
// ==========================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Update Stock
// ==========================
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Stock updated", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================
// Get Seller Products
// ==========================
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};