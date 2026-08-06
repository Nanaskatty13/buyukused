const Product = require("../models/Product");

// ==========================
// Get All Products (Public)
// ==========================
exports.getProducts = async (req, res) => {
  try {
    const { search, category, location, page = 1, limit = 12 } = req.query;

    let query = {};

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Location filter
    if (location && location !== "all") {
      query.location = location;
    }

    // Only show active products by default (you can remove if you want all)
    // query.status = "active";

    const products = await Product.find(query)
      .populate("sellerId", "name email phone")
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
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Single Product (Public)
// ==========================
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "name email phone"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Create Product (Seller/Admin)
// ==========================
exports.createProduct = async (req, res) => {
  try {
    // req.userId is set by verifyToken middleware
    const productData = {
      ...req.body,
      sellerId: req.userId, // 👈 use sellerId
    };

    // Convert checkbox strings to booleans
    if (req.body.negotiation !== undefined) {
      productData.negotiation = req.body.negotiation === "true" || req.body.negotiation === true;
    }
    if (req.body.swapAccepted !== undefined) {
      productData.swapAccepted = req.body.swapAccepted === "true" || req.body.swapAccepted === true;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Product (Seller/Admin)
// ==========================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (product.sellerId.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this product",
      });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Product (Seller/Admin)
// ==========================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check ownership
    if (product.sellerId.toString() !== req.userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this product",
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Stock (optional)
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
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Stock updated",
      product,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Seller Products
// ==========================
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({
      sellerId: req.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};