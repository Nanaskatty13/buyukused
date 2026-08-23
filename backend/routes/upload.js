// ============================================================
// backend/routes/upload.js
// ============================================================

const express = require("express");
const router = express.Router();
const multer = require("multer");
const streamifier = require("streamifier");

const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const { verifyToken } = require("../middleware/auth");

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Videos
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    // Audio
    "audio/webm",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    // Documents / other
    "application/pdf",
    "text/plain",
    "text/vcard",
    "application/vcard",
    "application/vnd.vcard",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed: ${file.mimetype}. Allowed: images, videos, audio, vcards.`
      )
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file
    files: 1, // Only one file per upload request
  },
  fileFilter,
});

// ============================================================
// CLOUDINARY UPLOAD HELPER
// ============================================================

const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "buyukused/uploads",
        resource_type: options.resourceType || "auto",
        ...(options.publicId ? { public_id: options.publicId } : {}),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ============================================================
// GENERIC FILE UPLOAD (for messages, profile pictures, etc.)
// ============================================================

router.post(
  "/",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded.",
        });
      }

      const file = req.file;
      const isVideo = file.mimetype.startsWith("video/");
      const isAudio = file.mimetype.startsWith("audio/");
      const isImage = file.mimetype.startsWith("image/");

      let resourceType = "auto";
      let folder = "buyukused/uploads";

      if (isImage) {
        resourceType = "image";
        folder = "buyukused/images";
      } else if (isVideo) {
        resourceType = "video";
        folder = "buyukused/videos";
      } else if (isAudio) {
        resourceType = "video"; // Cloudinary treats audio as video resource
        folder = "buyukused/audio";
      } else {
        folder = "buyukused/files";
      }

      const result = await uploadToCloudinary(file.buffer, {
        folder,
        resourceType,
      });

      if (!result || !result.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      return res.status(200).json({
        success: true,
        url: result.secure_url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Upload failed.",
      });
    }
  }
);

// ============================================================
// PRODUCT UPLOAD (multiple files – used by PostAd)
// ============================================================

router.post(
  "/product",
  verifyToken,
  upload.array("files", 6),
  async (req, res) => {
    try {
      console.log("==========================================");
      console.log("📦 CREATE PRODUCT REQUEST");
      console.log("==========================================");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const files = req.files || [];
      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please upload at least one image.",
        });
      }

      // ─── Read form data ─────────────────────────────────────
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

      // ─── Basic validation ──────────────────────────────────
      if (!title || !String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Product title is required.",
        });
      }
      if (price === undefined || price === null || price === "" || isNaN(Number(price))) {
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

      // ─── Category normalization ────────────────────────────
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
      const normalizedCategory = categoryMap[rawCategory.toLowerCase()] || rawCategory;
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
        "Cosmetics",
        "Other",
      ];
      // Add cosmetics to the allowed list
      const finalCategory = allowedCategories.includes(normalizedCategory)
        ? normalizedCategory
        : "Other";

      // ─── Boolean helpers ──────────────────────────────────
      const toBoolean = (value) => {
        if (typeof value === "boolean") return value;
        if (value === undefined || value === null || value === "") return false;
        return String(value).toLowerCase() === "true";
      };

      const optionalNumber = (value) => {
        if (value === undefined || value === null || value === "" || isNaN(Number(value))) {
          return null;
        }
        return Number(value);
      };

      // ─── Upload files to Cloudinary ────────────────────────
      const images = [];
      const videos = [];

      console.log(`📤 Uploading ${files.length} file(s)...`);
      for (const file of files) {
        const isVideo = file.mimetype.startsWith("video/");
        console.log(`⬆️ Uploading ${file.originalname} (${file.mimetype})`);

        const result = await uploadToCloudinary(file.buffer, {
          folder: "buyukused/products",
          resourceType: isVideo ? "video" : "image",
        });

        if (!result || !result.secure_url) {
          throw new Error(`Cloudinary upload failed for ${file.originalname}`);
        }

        if (isVideo) {
          videos.push(result.secure_url);
        } else {
          images.push(result.secure_url);
        }
        console.log(`✅ Uploaded: ${result.secure_url}`);
      }

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

      // ─── Seller info ──────────────────────────────────────
      const authenticatedSellerName = sellerName?.trim() || req.user.name || "";
      const authenticatedSellerPhone = sellerPhone?.trim() || req.user.phone || "";

      // ─── Product data ──────────────────────────────────────
      const productData = {
        title: String(title).trim(),
        price: Number(price),
        oldPrice: oldPrice !== undefined && oldPrice !== null && oldPrice !== "" ? Number(oldPrice) : null,
        category: finalCategory,
        location: location && String(location).trim() ? String(location).trim() : "Ghana",
        description: description && String(description).trim() ? String(description).trim() : "",
        sellerId: req.user._id || req.user.id,
        sellerName: authenticatedSellerName,
        sellerPhone: authenticatedSellerPhone,
        image: images[0] || "",
        images,
        videos,
        brand: brand ? String(brand).trim() : "",
        model: model ? String(model).trim() : "",
        processor: processor ? String(processor).trim() : "",
        screenSize: screenSize ? String(screenSize).trim() : "",
        graphics: graphics ? String(graphics).trim() : "",
        year: year ? String(year).trim() : "",
        connectivity: connectivity ? String(connectivity).trim() : "",
        warranty: warranty ? String(warranty).trim() : "",
        condition: condition || "Good",
        storage: storage ? String(storage).trim() : "",
        ram: ram ? String(ram).trim() : "",
        color: color ? String(color).trim() : "",
        batteryHealth: optionalNumber(batteryHealth),
        faceId: faceId || "",
        simStatus: finalCategory === "Phones" ? (simStatus || "") : "",
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

      const product = await Product.create(productData);

      console.log("==========================================");
      console.log("✅ PRODUCT CREATED");
      console.log("ID:", product._id);
      console.log("CATEGORY:", product.category);
      console.log("==========================================");

      return res.status(201).json({
        success: true,
        message: "Product posted successfully.",
        product,
      });
    } catch (error) {
      console.error("❌ CREATE PRODUCT ERROR:", error);
      // ─── Multer errors ────────────────────────────────────
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
            message: "Too many files. Maximum is 5 images and 1 video.",
          });
        }
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.message && error.message.includes("Invalid file type")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message).join(", ");
        return res.status(400).json({
          success: false,
          message: messages || "Product validation failed.",
        });
      }
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A product with this information already exists. Please try again.",
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create product. Please try again.",
      });
    }
  }
);

module.exports = router;