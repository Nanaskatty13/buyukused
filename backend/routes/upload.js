// ============================================================
// backend/routes/upload.js
// ============================================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");

const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// ✅ FIX: Import the verifyToken function directly
const { verifyToken } = require("../middleware/auth");

// ============================================================
// MULTER
// ============================================================

// Store uploaded files temporarily in memory.
// PostAd.jsx sends files using:
// form.append("files", item.file)
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 6, // Maximum 5 images + 1 video
    fileSize: 50 * 1024 * 1024, // 50MB
  },

  fileFilter: (req, file, cb) => {
    const allowedImages = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    const allowedVideos = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];

    if (
      allowedImages.includes(file.mimetype) ||
      allowedVideos.includes(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Invalid file type. Only JPG, PNG, GIF, WEBP, MP4, MOV, AVI and WEBM files are allowed."
      )
    );
  },
});

// ============================================================
// CLOUDINARY UPLOAD HELPER
// ============================================================

const uploadToCloudinary = (buffer, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "buyukused/products",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ============================================================
// POST PRODUCT
// ============================================================

router.post(
  "/product",
  verifyToken, // ✅ Now verifyToken is a function
  upload.array("files", 6),
  async (req, res) => {
    try {
      console.log("==========================================");
      console.log("📦 CREATE PRODUCT REQUEST");
      console.log("==========================================");

      // --------------------------------------------------------
      // CHECK AUTHENTICATION
      // --------------------------------------------------------

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // --------------------------------------------------------
      // CHECK FILES
      // --------------------------------------------------------

      const files = req.files || [];

      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please upload at least one image.",
        });
      }

      // --------------------------------------------------------
      // READ FORM DATA
      // --------------------------------------------------------

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
        processor,
        screenSize,
        graphics,
        year,
        connectivity,

        warranty,
        condition,
        storage,
        ram,
        color,

        batteryHealth,
        faceId,
        simStatus,

        negotiation,
        swapAccepted,
      } = req.body;

      // --------------------------------------------------------
      // BASIC VALIDATION
      // --------------------------------------------------------

      if (!title || !String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product title is required.",
        });
      }

      if (
        price === undefined ||
        price === null ||
        price === "" ||
        Number.isNaN(Number(price))
      ) {
        return res.status(400).json({
          success: false,
          message: "A valid product price is required.",
        });
      }

      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative.",
        });
      }

      // --------------------------------------------------------
      // CATEGORY NORMALIZATION
      // --------------------------------------------------------

      const categoryMap = {
        phones: "Phones",
        phone: "Phones",

        laptops: "Laptops",
        laptop: "Laptops",

        tablets: "Tablets",
        tablet: "Tablets",

        accessories: "Accessories",
        accessory: "Accessories",

        electronics: "Electronics",
        electronic: "Electronics",

        cars: "Cars",
        car: "Cars",

        "real estate": "Real Estate",
        realestate: "Real Estate",

        jobs: "Jobs",
        job: "Jobs",

        fashion: "Fashion",

        home: "Home",

        other: "Other",
      };

      const rawCategory = String(category || "Other").trim();

      const normalizedCategory =
        categoryMap[rawCategory.toLowerCase()] || rawCategory;

      const allowedCategories = [
        "Cars",
        "Phones",
        "Laptops",
        "Tablets",
        "Accessories",
        "Real Estate",
        "Jobs",
        "Electronics",
        "Fashion",
        "Home",
        "Other",
      ];

      const finalCategory = allowedCategories.includes(normalizedCategory)
        ? normalizedCategory
        : "Other";

      // --------------------------------------------------------
      // CONVERT BOOLEAN VALUES
      // --------------------------------------------------------

      const toBoolean = (value) => {
        if (typeof value === "boolean") {
          return value;
        }

        if (value === undefined || value === null || value === "") {
          return false;
        }

        return String(value).toLowerCase() === "true";
      };

      // --------------------------------------------------------
      // CONVERT OPTIONAL NUMBER
      // --------------------------------------------------------

      const optionalNumber = (value) => {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          Number.isNaN(Number(value))
        ) {
          return null;
        }

        return Number(value);
      };

      // --------------------------------------------------------
      // UPLOAD FILES TO CLOUDINARY
      // --------------------------------------------------------

      const images = [];
      const videos = [];

      console.log(`📤 Uploading ${files.length} file(s)...`);

      for (const file of files) {
        const isVideo = file.mimetype.startsWith("video/");

        console.log(
          `⬆️ Uploading ${file.originalname} (${file.mimetype})`
        );

        const result = await uploadToCloudinary(
          file.buffer,
          isVideo ? "video" : "image"
        );

        if (!result || !result.secure_url) {
          throw new Error(
            `Cloudinary upload failed for ${file.originalname}`
          );
        }

        if (isVideo) {
          videos.push(result.secure_url);
        } else {
          images.push(result.secure_url);
        }

        console.log(`✅ Uploaded: ${result.secure_url}`);
      }

      // --------------------------------------------------------
      // IMAGE VALIDATION
      // --------------------------------------------------------

      if (images.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one product image is required.",
        });
      }

      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message: "You can upload a maximum of 5 images.",
        });
      }

      if (videos.length > 1) {
        return res.status(400).json({
          success: false,
          message: "You can upload only one video.",
        });
      }

      // --------------------------------------------------------
      // SELLER INFORMATION
      // --------------------------------------------------------

      const authenticatedSellerName =
        sellerName?.trim() ||
        req.user.name ||
        "";

      const authenticatedSellerPhone =
        sellerPhone?.trim() ||
        req.user.phone ||
        "";

      // --------------------------------------------------------
      // CREATE PRODUCT
      // --------------------------------------------------------

      const productData = {
        title: String(title).trim(),

        price: Number(price),

        oldPrice:
          oldPrice !== undefined &&
          oldPrice !== null &&
          oldPrice !== ""
            ? Number(oldPrice)
            : null,

        category: finalCategory,

        location:
          location && String(location).trim()
            ? String(location).trim()
            : "Ghana",

        description:
          description && String(description).trim()
            ? String(description).trim()
            : "",

        // Seller
        sellerId: req.user._id || req.user.id,

        sellerName: authenticatedSellerName,

        sellerPhone: authenticatedSellerPhone,

        // Media
        image: images[0] || "",

        images,

        videos,

        // General product information
        brand: brand ? String(brand).trim() : "",

        model: model ? String(model).trim() : "",

        processor: processor ? String(processor).trim() : "",

        screenSize: screenSize
          ? String(screenSize).trim()
          : "",

        graphics: graphics
          ? String(graphics).trim()
          : "",

        year: year ? String(year).trim() : "",

        connectivity: connectivity
          ? String(connectivity).trim()
          : "",

        warranty: warranty
          ? String(warranty).trim()
          : "",

        condition: condition || "Good",

        storage: storage
          ? String(storage).trim()
          : "",

        ram: ram ? String(ram).trim() : "",

        color: color ? String(color).trim() : "",

        // Phone-specific fields
        batteryHealth: optionalNumber(batteryHealth),

        faceId: faceId || "",

        // IMPORTANT:
        // SIM status is saved exactly as submitted.
        // Accessories do NOT automatically receive SIM status.
        simStatus:
          finalCategory === "Phones"
            ? simStatus || ""
            : "",

        // Marketplace options
        negotiation: toBoolean(negotiation),

        swapAccepted: toBoolean(swapAccepted),

        status: "active",
      };

      console.log("🧾 Product data:");
      console.log({
        title: productData.title,
        category: productData.category,
        price: productData.price,
        images: productData.images.length,
        videos: productData.videos.length,
        simStatus: productData.simStatus,
      });

      // --------------------------------------------------------
      // SAVE TO MONGODB
      // --------------------------------------------------------

      const product = await Product.create(productData);

      console.log("==========================================");
      console.log("✅ PRODUCT CREATED");
      console.log("ID:", product._id);
      console.log("CATEGORY:", product.category);
      console.log("==========================================");

      // --------------------------------------------------------
      // RESPONSE
      // --------------------------------------------------------

      return res.status(201).json({
        success: true,
        message: "Product posted successfully.",
        product,
      });
    } catch (error) {
      console.error("==========================================");
      console.error("❌ CREATE PRODUCT ERROR");
      console.error(error);
      console.error("==========================================");

      // Multer errors
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "A file is too large. Maximum size is 50MB.",
          });
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            success: false,
            message:
              "Too many files. Maximum is 5 images and 1 video.",
          });
        }

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // File filter errors
      if (
        error.message &&
        error.message.includes("Invalid file type")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Mongoose validation error
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((err) => err.message)
          .join(", ");

        return res.status(400).json({
          success: false,
          message: messages || "Product validation failed.",
        });
      }

      // Duplicate slug
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "A product with this information already exists. Please try again.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create product. Please try again.",
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;