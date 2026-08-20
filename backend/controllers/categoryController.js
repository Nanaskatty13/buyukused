// backend/controllers/categoryController.js
const Category = require("../models/Category");

// ==========================
// DEFAULT CATEGORIES
// ==========================
const DEFAULT_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "TVs",
  "Game Consoles",
  "Smartwatches",
  "Accessories",
  "Electronics",
  "Fashion",
  "Home",
  "Real Estate",
  "Jobs",
  "Other",
];

// ==========================
// Ensure default categories exist (call on server start)
// ==========================
exports.ensureDefaultCategories = async () => {
  try {
    for (const name of DEFAULT_CATEGORIES) {
      const exists = await Category.findOne({ name });
      if (!exists) {
        await Category.create({
          name,
          description: "",
          image: "",
          isActive: true,
        });
        console.log(`✅ Category seeded: ${name}`);
      }
    }
    console.log("✅ Default categories check completed");
  } catch (error) {
    console.error("❌ Failed to seed default categories:", error.message);
  }
};

// ==========================
// Get All Categories
// ==========================
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Single Category
// ==========================
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Create Category
// ==========================
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Category
// ==========================
exports.updateCategory = async (req, res) => {
  try {
    // Prevent updating slug – it auto‑generates from name
    const updateData = { ...req.body };
    delete updateData.slug; // we don't allow manual slug change

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Delete Category
// ==========================
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};