// backend/scripts/seedCategories.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/Category");

dotenv.config();

const categories = [
  "Cars", "Phones", "Laptops", "Tablets", "TVs", "Game Consoles",
  "Smartwatches", "Accessories", "Electronics", "Fashion", "Home",
  "Real Estate", "Jobs", "Other"
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing (optional)
    await Category.deleteMany({});
    console.log("🗑️  Cleared existing categories");

    const docs = categories.map(name => ({
      name,
      description: "",
      image: "",
      isActive: true,
    }));
    const inserted = await Category.insertMany(docs);
    console.log(`✅ Seeded ${inserted.length} categories`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedCategories();