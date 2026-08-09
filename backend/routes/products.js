// backend/routes/products.js

const express = require("express");
const mongoose = require("mongoose");
const streamifier = require("streamifier");

const {
  verifyToken,
  isSeller,
} = require("../middleware/auth");

const Product = require("../models/Product");
const upload = require("../config/multer");
const { cloudinary } = require("../config/cloudinary");

const router = express.Router();

// ============================================================
// CLOUDINARY UPLOAD HELPER
// ============================================================

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const isVideo =
      file.mimetype &&
      file.mimetype.startsWith("video/");

    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: isVideo
            ? "kn-classifieds/videos"
            : "kn-classifieds/images",

          resource_type: isVideo
            ? "video"
            : "image",

          public_id: `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}`,
        },

        (error, result) => {
          if (error) {
            console.error(
              "❌ Cloudinary upload error:",
              error
            );

            reject(error);
          } else {
            resolve(result);
          }
        }
      );

    streamifier
      .createReadStream(file.buffer)
      .pipe(uploadStream);
  });
};

// ============================================================
// TEST
// ============================================================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Products router is alive!",
  });
});

// ============================================================
// GET ALL PRODUCTS
// ============================================================

router.get("/", async (req, res) => {
  try {
    const {
      category,
      location,
      search,
      sellerId,
      status,
      limit = 20,
      page = 1,
    } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (location && location !== "all") {
      filter.location = location;
    }

    if (sellerId) {
      filter.sellerId = sellerId;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const parsedLimit = Math.min(
      parseInt(limit, 10) || 20,
      100
    );

    const parsedPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const skip =
      (parsedPage - 1) * parsedLimit;

    const [products, total] =
      await Promise.all([
        Product.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
          .populate(
            "sellerId",
            "name phone email"
          ),

        Product.countDocuments(filter),
      ]);

    res.json({
      success: true,
      products,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(
        total / parsedLimit
      ),
    });
  } catch (err) {
    console.error(
      "❌ Error fetching products:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch products",
    });
  }
});

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product =
      await Product.findById(id).populate(
        "sellerId",
        "name phone email"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.views =
      (product.views || 0) + 1;

    await product.save();

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    console.error(
      "❌ Error fetching product:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        err.message ||
        "Failed to fetch product",
    });
  }
});

// ============================================================
// CREATE PRODUCT
// ============================================================

router.post(
  "/",
  verifyToken,
  isSeller,
  upload.array("files", 6),

  async (req, res) => {
    console.log(
      "📩 POST /api/products received"
    );

    try {
      // --------------------------------------------------------
      // DEBUG FILES
      // --------------------------------------------------------

      console.log(
        "📦 Number of files received:",
        req.files?.length || 0
      );

      // --------------------------------------------------------
      // BODY
      // --------------------------------------------------------

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

      if (
        !title ||
        !price ||
        !sellerPhone
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, price, and phone number are required",
        });
      }

      const parsedPrice =
        parseFloat(price);

      if (
        Number.isNaN(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }

      // --------------------------------------------------------
      // FILES
      // --------------------------------------------------------

      const files = req.files || [];

      // Maximum 5 images
      const imageFiles = files
        .filter(
          (file) =>
            file.mimetype &&
            file.mimetype.startsWith(
              "image/"
            )
        )
        .slice(0, 5);

      // Maximum 1 video
      const videoFiles = files
        .filter(
          (file) =>
            file.mimetype &&
            file.mimetype.startsWith(
              "video/"
            )
        )
        .slice(0, 1);

      console.log(
        "🖼️ Images to upload:",
        imageFiles.length
      );

      console.log(
        "🎬 Videos to upload:",
        videoFiles.length
      );

      // --------------------------------------------------------
      // UPLOAD IMAGES
      // --------------------------------------------------------

      const imageResults =
        await Promise.all(
          imageFiles.map(
            (file) =>
              uploadToCloudinary(file)
          )
        );

      // --------------------------------------------------------
      // UPLOAD VIDEOS
      // --------------------------------------------------------

      const videoResults =
        await Promise.all(
          videoFiles.map(
            (file) =>
              uploadToCloudinary(file)
          )
        );

      const imageUrls =
        imageResults
          .map(
            (result) =>
              result.secure_url
          )
          .filter(Boolean);

      const videoUrls =
        videoResults
          .map(
            (result) =>
              result.secure_url
          )
          .filter(Boolean);

      console.log(
        "🔗 Image URLs:",
        imageUrls
      );

      console.log(
        "🔗 Video URLs:",
        videoUrls
      );

      // --------------------------------------------------------
      // PRODUCT DATA
      // --------------------------------------------------------

      const productData = {
        title: title.trim(),

        price: parsedPrice,

        category:
          category || "Other",

        location:
          location || "Ghana",

        description:
          description || "",

        sellerId: req.userId,

        sellerName:
          sellerName ||
          req.user?.name ||
          "",

        sellerPhone,

        storage:
          storage || "",

        color:
          color || "",

        condition:
          condition || "Good",

        negotiation:
          negotiation === "true",

        swapAccepted:
          swapAccepted === "true",

        simStatus:
          simStatus ||
          "Unlocked",

        batteryHealth:
          batteryHealth !== undefined &&
          batteryHealth !== ""
            ? parseInt(
                batteryHealth,
                10
              )
            : null,

        faceId:
          faceId || "Working",

        status: "active",

        images: imageUrls,

        videos: videoUrls,

        image:
          imageUrls.length > 0
            ? imageUrls[0]
            : "",
      };

      // --------------------------------------------------------
      // SAVE
      // --------------------------------------------------------

      const product =
        new Product(productData);

      await product.save();

      console.log(
        `✅ Product created: ${product._id}`
      );

      console.log(
        `🖼️ Saved ${product.images.length} images`
      );

      console.log(
        `🎬 Saved ${product.videos.length} videos`
      );

      res.status(201).json({
        success: true,
        product,
        message:
          "Product created successfully",
      });
    } catch (err) {
      console.error(
        "❌ Error creating product:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          "Failed to create product",
      });
    }
  }
);

// ============================================================
// UPDATE PRODUCT
// ============================================================

router.put(
  "/:id",
  verifyToken,
  upload.array("files", 6),

  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const product =
        await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const isOwner =
        product.sellerId.toString() ===
        req.userId.toString();

      const isAdmin =
        req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }

      // --------------------------------------------------------
      // TEXT FIELDS
      // --------------------------------------------------------

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

      if (title)
        product.title = title.trim();

      if (price !== undefined && price !== "") {
        const parsedPrice =
          parseFloat(price);

        if (
          Number.isNaN(parsedPrice) ||
          parsedPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid price",
          });
        }

        product.price = parsedPrice;
      }

      if (category)
        product.category = category;

      if (location)
        product.location = location;

      if (description !== undefined)
        product.description =
          description;

      if (sellerName)
        product.sellerName =
          sellerName;

      if (sellerPhone)
        product.sellerPhone =
          sellerPhone;

      if (storage)
        product.storage = storage;

      if (color)
        product.color = color;

      if (condition)
        product.condition =
          condition;

      if (
        negotiation !== undefined
      ) {
        product.negotiation =
          negotiation === "true";
      }

      if (
        swapAccepted !== undefined
      ) {
        product.swapAccepted =
          swapAccepted === "true";
      }

      if (simStatus)
        product.simStatus =
          simStatus;

      if (
        batteryHealth !== undefined &&
        batteryHealth !== ""
      ) {
        product.batteryHealth =
          parseInt(
            batteryHealth,
            10
          );
      }

      if (faceId)
        product.faceId = faceId;

      // --------------------------------------------------------
      // KEEP EXISTING IMAGES
      // --------------------------------------------------------

      if (
        req.body.imagesToKeep !==
        undefined
      ) {
        try {
          const kept = JSON.parse(
            req.body.imagesToKeep
          );

          if (Array.isArray(kept)) {
            product.images = kept;
          }
        } catch (err) {
          console.warn(
            "⚠️ Invalid imagesToKeep"
          );
        }
      }

      // --------------------------------------------------------
      // KEEP EXISTING VIDEOS
      // --------------------------------------------------------

      if (
        req.body.videosToKeep !==
        undefined
      ) {
        try {
          const keptVideos =
            JSON.parse(
              req.body.videosToKeep
            );

          if (
            Array.isArray(
              keptVideos
            )
          ) {
            product.videos =
              keptVideos;
          }
        } catch (err) {
          console.warn(
            "⚠️ Invalid videosToKeep"
          );
        }
      }

      // --------------------------------------------------------
      // NEW FILES
      // --------------------------------------------------------

      const files =
        req.files || [];

      const newImages =
        files.filter(
          (file) =>
            file.mimetype &&
            file.mimetype.startsWith(
              "image/"
            )
        );

      const newVideos =
        files.filter(
          (file) =>
            file.mimetype &&
            file.mimetype.startsWith(
              "video/"
            )
        );

      // Upload new images
      const uploadedImages =
        await Promise.all(
          newImages.map(
            (file) =>
              uploadToCloudinary(file)
          )
        );

      // Upload new videos
      const uploadedVideos =
        await Promise.all(
          newVideos.map(
            (file) =>
              uploadToCloudinary(file)
          )
        );

      uploadedImages.forEach(
        (result) => {
          if (result.secure_url) {
            product.images.push(
              result.secure_url
            );
          }
        }
      );

      uploadedVideos.forEach(
        (result) => {
          if (result.secure_url) {
            product.videos.push(
              result.secure_url
            );
          }
        }
      );

      // Maximum 5 images
      product.images =
        product.images.slice(
          0,
          5
        );

      // Maximum 1 video
      product.videos =
        product.videos.slice(
          0,
          1
        );

      // First image
      product.image =
        product.images.length
          ? product.images[0]
          : "";

      await product.save();

      console.log(
        `✅ Product updated: ${product._id}`
      );

      console.log(
        "🖼️ Images:",
        product.images.length
      );

      console.log(
        "🎬 Videos:",
        product.videos.length
      );

      res.json({
        success: true,
        product,
        message:
          "Product updated",
      });
    } catch (err) {
      console.error(
        "❌ Error updating product:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          "Failed to update product",
      });
    }
  }
);

// ============================================================
// DELETE PRODUCT
// ============================================================

router.delete(
  "/:id",
  verifyToken,

  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const product =
        await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const isOwner =
        product.sellerId.toString() ===
        req.userId.toString();

      const isAdmin =
        req.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized",
        });
      }

      await product.deleteOne();

      res.json({
        success: true,
        message:
          "Product deleted",
      });
    } catch (err) {
      console.error(
        "❌ Error deleting product:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          "Failed to delete product",
      });
    }
  }
);

module.exports = router;