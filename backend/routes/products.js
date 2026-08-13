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
// CONSTANTS
// ============================================================

const MAX_IMAGES = 5;
const MAX_VIDEOS = 1;

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

const VALID_CATEGORIES = [
  "Cars",
  "Phones",
  "Real Estate",
  "Jobs",
  "Electronics",
  "Fashion",
  "Home",
  "Other",
];

const VALID_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

const VALID_FACE_ID = [
  "Working",
  "Not Working",
  "Not Available",
  "",
];

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ------------------------------------------------------------
// Boolean parser
// ------------------------------------------------------------

const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return defaultValue;
};

// ------------------------------------------------------------
// Number parser
// ------------------------------------------------------------

const parseNumber = (value, defaultValue = null) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : defaultValue;
};

// ------------------------------------------------------------
// Cloudinary public ID extraction
// ------------------------------------------------------------

const getCloudinaryPublicId = (url) => {
  try {
    if (
      !url ||
      typeof url !== "string" ||
      !url.includes("cloudinary.com")
    ) {
      return null;
    }

    const uploadMarker = "/upload/";

    const uploadIndex =
      url.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = url.substring(
      uploadIndex + uploadMarker.length
    );

    // Remove transformation section.
    // Example:
    // /upload/w_500,h_500/v123/folder/file.jpg
    const parts = publicId.split("/");

    while (
      parts.length > 0 &&
      (
        parts[0].includes("_") ||
        parts[0].includes(",")
      )
    ) {
      parts.shift();
    }

    publicId = parts.join("/");

    // Remove version.
    publicId = publicId.replace(
      /^v\d+\//,
      ""
    );

    // Remove extension.
    publicId = publicId.replace(
      /\.[^/.]+$/,
      ""
    );

    return publicId || null;
  } catch (error) {
    console.error(
      "❌ Failed to extract Cloudinary public ID:",
      error.message
    );

    return null;
  }
};

// ------------------------------------------------------------
// Delete Cloudinary file
// ------------------------------------------------------------

const deleteFromCloudinary = async (
  fileUrl,
  resourceType = "image"
) => {
  try {
    const publicId =
      getCloudinaryPublicId(fileUrl);

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
      }
    );

    console.log(
      `🗑️ Cloudinary file deleted: ${publicId}`
    );
  } catch (error) {
    console.error(
      "❌ Cloudinary delete error:",
      error.message
    );
  }
};

// ------------------------------------------------------------
// Upload buffer to Cloudinary
// ------------------------------------------------------------

const uploadToCloudinary = (
  file
) => {
  return new Promise(
    (resolve, reject) => {
      try {
        if (
          !file ||
          !file.buffer
        ) {
          return reject(
            new Error(
              "Invalid file buffer"
            )
          );
        }

        const isVideo =
          file.mimetype &&
          file.mimetype.startsWith(
            "video/"
          );

        const resourceType =
          isVideo
            ? "video"
            : "image";

        const folder =
          isVideo
            ? "kn-classifieds/videos"
            : "kn-classifieds/images";

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type:
                resourceType,

              public_id:
                `${Date.now()}-${Math.round(
                  Math.random() * 1e9
                )}`,
            },

            (error, result) => {
              if (error) {
                console.error(
                  "❌ Cloudinary upload error:",
                  error
                );

                return reject(error);
              }

              resolve({
                result,
                resourceType,
              });
            }
          );

        streamifier
          .createReadStream(
            file.buffer
          )
          .pipe(uploadStream);
      } catch (error) {
        reject(error);
      }
    }
  );
};

// ------------------------------------------------------------
// Upload multiple files
// ------------------------------------------------------------

const uploadFiles = async (
  files
) => {
  const imageFiles = (
    files || []
  )
    .filter(
      (file) =>
        file.mimetype &&
        file.mimetype.startsWith(
          "image/"
        )
    )
    .slice(0, MAX_IMAGES);

  const videoFiles = (
    files || []
  )
    .filter(
      (file) =>
        file.mimetype &&
        file.mimetype.startsWith(
          "video/"
        )
    )
    .slice(0, MAX_VIDEOS);

  const imageResults =
    await Promise.all(
      imageFiles.map(
        (file) =>
          uploadToCloudinary(
            file
          )
      )
    );

  const videoResults =
    await Promise.all(
      videoFiles.map(
        (file) =>
          uploadToCloudinary(
            file
          )
      )
    );

  const images =
    imageResults
      .map(
        (item) =>
          item.result?.secure_url
      )
      .filter(Boolean);

  const videos =
    videoResults
      .map(
        (item) =>
          item.result?.secure_url
      )
      .filter(Boolean);

  return {
    images,
    videos,
  };
};

// ------------------------------------------------------------
// Parse JSON array safely
// ------------------------------------------------------------

const parseJsonArray = (
  value,
  fieldName
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    if (!Array.isArray(parsed)) {
      throw new Error(
        `${fieldName} must be an array`
      );
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `${fieldName} must be valid JSON`
    );
  }
};

// ============================================================
// TEST
// ============================================================

router.get(
  "/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Products router is alive!",
    });
  }
);

// ============================================================
// GET ALL PRODUCTS
// ============================================================

router.get(
  "/",
  async (req, res) => {
    try {
      const {
        category,
        location,
        search,
        sellerId,
        status,
        page = 1,
        limit = 20,
      } = req.query;

      const filter = {};

      // --------------------------------------------------------
      // Category
      // --------------------------------------------------------

      if (
        category &&
        category !== "all"
      ) {
        filter.category =
          category;
      }

      // --------------------------------------------------------
      // Location
      // --------------------------------------------------------

      if (
        location &&
        location !== "all"
      ) {
        filter.location =
          location;
      }

      // --------------------------------------------------------
      // Seller
      // --------------------------------------------------------

      if (sellerId) {
        if (
          !isValidObjectId(
            sellerId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid seller ID",
          });
        }

        filter.sellerId =
          sellerId;
      }

      // --------------------------------------------------------
      // Status
      // --------------------------------------------------------

      if (status) {
        if (
          !VALID_STATUSES.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product status",
          });
        }

        filter.status =
          status;
      }

      // --------------------------------------------------------
      // Search
      // --------------------------------------------------------

      if (
        search &&
        search.trim()
      ) {
        const escapedSearch =
          search
            .trim()
            .replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            );

        filter.$or = [
          {
            title: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },

          {
            description: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },

          {
            brand: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },

          {
            model: {
              $regex:
                escapedSearch,
              $options: "i",
            },
          },
        ];
      }

      // --------------------------------------------------------
      // Pagination
      // --------------------------------------------------------

      const parsedLimit = Math.min(
        Math.max(
          parseInt(limit, 10) ||
            20,
          1
        ),
        100
      );

      const parsedPage = Math.max(
        parseInt(page, 10) || 1,
        1
      );

      const skip =
        (parsedPage - 1) *
        parsedLimit;

      // --------------------------------------------------------
      // Query
      // --------------------------------------------------------

      const [
        products,
        total,
      ] = await Promise.all([
        Product.find(filter)
          .populate(
            "sellerId",
            "name phone email location avatar role"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(parsedLimit)
          .lean(),

        Product.countDocuments(
          filter
        ),
      ]);

      res.json({
        success: true,

        products,

        total,

        page: parsedPage,

        limit: parsedLimit,

        totalPages:
          Math.ceil(
            total /
              parsedLimit
          ),

        pagination: {
          currentPage:
            parsedPage,

          totalPages:
            Math.ceil(
              total /
                parsedLimit
            ),

          totalProducts:
            total,

          limit:
            parsedLimit,
        },
      });
    } catch (error) {
      console.error(
        "❌ Error fetching products:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch products",
      });
    }
  }
);

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

router.get(
  "/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const product =
        await Product.findById(
          id
        ).populate(
          "sellerId",
          "name phone email location avatar role"
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Increment views
      // --------------------------------------------------------

      product.views =
        (product.views || 0) + 1;

      await product.save();

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Error fetching product:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch product",
      });
    }
  }
);

// ============================================================
// CREATE PRODUCT
// ============================================================

router.post(
  "/",
  verifyToken,
  isSeller,
  upload.array(
    "files",
    6
  ),

  async (req, res) => {
    try {
      console.log(
        "📩 POST /api/products received"
      );

      console.log(
        "👤 User:",
        req.userId
      );

      console.log(
        "📦 Files:",
        req.files?.length || 0
      );

      // --------------------------------------------------------
      // Authentication
      // --------------------------------------------------------

      const sellerId =
        req.userId ||
        req.user?.id ||
        req.user?._id;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // --------------------------------------------------------
      // Request body
      // --------------------------------------------------------

      const {
        title,
        price,
        category,
        location,
        description,
        sellerName,
        sellerPhone,
        brand,
        model,
        ram,
        storage,
        color,
        condition,
        negotiation,
        swapAccepted,
        simStatus,
        batteryHealth,
        faceId,
      } = req.body;

      // --------------------------------------------------------
      // Validate title
      // --------------------------------------------------------

      if (
        !title ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required",
        });
      }

      // --------------------------------------------------------
      // Validate price
      // --------------------------------------------------------

      const parsedPrice =
        Number(price);

      if (
        price === undefined ||
        price === null ||
        price === "" ||
        !Number.isFinite(
          parsedPrice
        ) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid product price is required",
        });
      }

      // --------------------------------------------------------
      // Validate phone
      // --------------------------------------------------------

      if (
        !sellerPhone ||
        !sellerPhone.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Seller phone number is required",
        });
      }

      // --------------------------------------------------------
      // Validate category
      // --------------------------------------------------------

      const selectedCategory =
        category || "Other";

      if (
        !VALID_CATEGORIES.includes(
          selectedCategory
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product category",
        });
      }

      // --------------------------------------------------------
      // Validate condition
      // --------------------------------------------------------

      const selectedCondition =
        condition || "Good";

      if (
        !VALID_CONDITIONS.includes(
          selectedCondition
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product condition",
        });
      }

      // --------------------------------------------------------
      // Battery health
      // --------------------------------------------------------

      let parsedBatteryHealth =
        null;

      if (
        batteryHealth !==
          undefined &&
        batteryHealth !== ""
      ) {
        parsedBatteryHealth =
          Number(
            batteryHealth
          );

        if (
          !Number.isFinite(
            parsedBatteryHealth
          ) ||
          parsedBatteryHealth <
            0 ||
          parsedBatteryHealth >
            100
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Battery health must be between 0 and 100",
          });
        }
      }

      // --------------------------------------------------------
      // Face ID
      // --------------------------------------------------------

      const selectedFaceId =
        faceId || "";

      if (
        !VALID_FACE_ID.includes(
          selectedFaceId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Face ID status",
        });
      }

      // --------------------------------------------------------
      // Upload files
      // --------------------------------------------------------

      const {
        images,
        videos,
      } = await uploadFiles(
        req.files || []
      );

      console.log(
        "🖼️ Images uploaded:",
        images.length
      );

      console.log(
        "🎬 Videos uploaded:",
        videos.length
      );

      // --------------------------------------------------------
      // Product data
      // --------------------------------------------------------

      const productData = {
        title:
          title.trim(),

        price:
          parsedPrice,

        category:
          selectedCategory,

        location:
          location?.trim() ||
          "Ghana",

        description:
          description?.trim() ||
          "",

        sellerId,

        sellerName:
          sellerName?.trim() ||
          req.user?.name ||
          "",

        sellerPhone:
          sellerPhone.trim(),

        brand:
          brand?.trim() ||
          "",

        model:
          model?.trim() ||
          "",

        ram:
          ram?.trim() ||
          "",

        storage:
          storage?.trim() ||
          "",

        color:
          color?.trim() ||
          "",

        condition:
          selectedCondition,

        negotiation:
          parseBoolean(
            negotiation
          ),

        swapAccepted:
          parseBoolean(
            swapAccepted
          ),

        simStatus:
          simStatus?.trim() ||
          "",

        batteryHealth:
          parsedBatteryHealth,

        faceId:
          selectedFaceId,

        images,

        videos,

        image:
          images.length
            ? images[0]
            : "",

        status:
          "active",
      };

      // --------------------------------------------------------
      // Save
      // --------------------------------------------------------

      const product =
        await Product.create(
          productData
        );

      console.log(
        `✅ Product created: ${product._id}`
      );

      res.status(201).json({
        success: true,

        message:
          "Product created successfully",

        product,
      });
    } catch (error) {
      console.error(
        "❌ Error creating product:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
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
  upload.array(
    "files",
    6
  ),

  async (req, res) => {
    try {
      const { id } =
        req.params;

      // --------------------------------------------------------
      // Validate ID
      // --------------------------------------------------------

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Find product
      // --------------------------------------------------------

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Authentication
      // --------------------------------------------------------

      const currentUserId =
        req.userId ||
        req.user?.id ||
        req.user?._id;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // --------------------------------------------------------
      // Ownership
      // --------------------------------------------------------

      const isOwner =
        product.sellerId &&
        product.sellerId
          .toString() ===
          currentUserId.toString();

      const isAdmin =
        req.user?.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to update this product",
        });
      }

      // --------------------------------------------------------
      // Update text fields
      // --------------------------------------------------------

      const {
        title,
        price,
        category,
        location,
        description,
        sellerName,
        sellerPhone,
        brand,
        model,
        ram,
        storage,
        color,
        condition,
        negotiation,
        swapAccepted,
        simStatus,
        batteryHealth,
        faceId,
        status,
        oldPrice,
      } = req.body;

      // Title
      if (
        title !== undefined
      ) {
        if (
          !String(title).trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product title cannot be empty",
          });
        }

        product.title =
          String(title).trim();
      }

      // Price
      if (
        price !== undefined &&
        price !== ""
      ) {
        const parsedPrice =
          Number(price);

        if (
          !Number.isFinite(
            parsedPrice
          ) ||
          parsedPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid price",
          });
        }

        product.price =
          parsedPrice;
      }

      // Old price
      if (
        oldPrice !== undefined
      ) {
        if (
          oldPrice === ""
        ) {
          product.oldPrice =
            null;
        } else {
          const parsedOldPrice =
            Number(oldPrice);

          if (
            !Number.isFinite(
              parsedOldPrice
            ) ||
            parsedOldPrice < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid old price",
            });
          }

          product.oldPrice =
            parsedOldPrice;
        }
      }

      // Category
      if (
        category !== undefined
      ) {
        if (
          !VALID_CATEGORIES.includes(
            category
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product category",
          });
        }

        product.category =
          category;
      }

      // Location
      if (
        location !== undefined
      ) {
        product.location =
          String(location).trim();
      }

      // Description
      if (
        description !== undefined
      ) {
        product.description =
          String(
            description
          ).trim();
      }

      // Seller name
      if (
        sellerName !== undefined
      ) {
        product.sellerName =
          String(
            sellerName
          ).trim();
      }

      // Seller phone
      if (
        sellerPhone !== undefined
      ) {
        product.sellerPhone =
          String(
            sellerPhone
          ).trim();
      }

      // Brand
      if (
        brand !== undefined
      ) {
        product.brand =
          String(
            brand
          ).trim();
      }

      // Model
      if (
        model !== undefined
      ) {
        product.model =
          String(
            model
          ).trim();
      }

      // RAM
      if (
        ram !== undefined
      ) {
        product.ram =
          String(
            ram
          ).trim();
      }

      // Storage
      if (
        storage !== undefined
      ) {
        product.storage =
          String(
            storage
          ).trim();
      }

      // Color
      if (
        color !== undefined
      ) {
        product.color =
          String(
            color
          ).trim();
      }

      // Condition
      if (
        condition !== undefined
      ) {
        if (
          !VALID_CONDITIONS.includes(
            condition
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product condition",
          });
        }

        product.condition =
          condition;
      }

      // Negotiation
      if (
        negotiation !== undefined
      ) {
        product.negotiation =
          parseBoolean(
            negotiation
          );
      }

      // Swap
      if (
        swapAccepted !==
        undefined
      ) {
        product.swapAccepted =
          parseBoolean(
            swapAccepted
          );
      }

      // SIM
      if (
        simStatus !== undefined
      ) {
        product.simStatus =
          String(
            simStatus
          ).trim();
      }

      // Battery
      if (
        batteryHealth !==
        undefined
      ) {
        if (
          batteryHealth === ""
        ) {
          product.batteryHealth =
            null;
        } else {
          const parsedBatteryHealth =
            Number(
              batteryHealth
            );

          if (
            !Number.isFinite(
              parsedBatteryHealth
            ) ||
            parsedBatteryHealth <
              0 ||
            parsedBatteryHealth >
              100
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Battery health must be between 0 and 100",
            });
          }

          product.batteryHealth =
            parsedBatteryHealth;
        }
      }

      // Face ID
      if (
        faceId !== undefined
      ) {
        if (
          !VALID_FACE_ID.includes(
            faceId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid Face ID status",
          });
        }

        product.faceId =
          faceId;
      }

      // Status
      if (
        status !== undefined
      ) {
        if (
          !VALID_STATUSES.includes(
            status
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product status",
          });
        }

        product.status =
          status;
      }

      // --------------------------------------------------------
      // Existing images to keep
      // --------------------------------------------------------

      const imagesToKeep =
        parseJsonArray(
          req.body.imagesToKeep,
          "imagesToKeep"
        );

      if (
        Array.isArray(
          imagesToKeep
        )
      ) {
        const oldImages =
          product.images || [];

        for (
          const oldImage of oldImages
        ) {
          if (
            !imagesToKeep.includes(
              oldImage
            )
          ) {
            await deleteFromCloudinary(
              oldImage,
              "image"
            );
          }
        }

        product.images =
          imagesToKeep
            .filter(
              (url) =>
                typeof url ===
                  "string" &&
                url.trim()
            )
            .slice(
              0,
              MAX_IMAGES
            );
      }

      // --------------------------------------------------------
      // Existing videos to keep
      // --------------------------------------------------------

      const videosToKeep =
        parseJsonArray(
          req.body.videosToKeep,
          "videosToKeep"
        );

      if (
        Array.isArray(
          videosToKeep
        )
      ) {
        const oldVideos =
          product.videos || [];

        for (
          const oldVideo of oldVideos
        ) {
          if (
            !videosToKeep.includes(
              oldVideo
            )
          ) {
            await deleteFromCloudinary(
              oldVideo,
              "video"
            );
          }
        }

        product.videos =
          videosToKeep
            .filter(
              (url) =>
                typeof url ===
                  "string" &&
                url.trim()
            )
            .slice(
              0,
              MAX_VIDEOS
            );
      }

      // --------------------------------------------------------
      // Upload new files
      // --------------------------------------------------------

      const newFiles =
        req.files || [];

      if (
        newFiles.length > 0
      ) {
        const {
          images,
          videos,
        } = await uploadFiles(
          newFiles
        );

        // Add images
        if (
          images.length > 0
        ) {
          product.images = [
            ...(product.images ||
              []),
            ...images,
          ].slice(
            0,
            MAX_IMAGES
          );
        }

        // Add videos
        if (
          videos.length > 0
        ) {
          product.videos = [
            ...(product.videos ||
              []),
            ...videos,
          ].slice(
            0,
            MAX_VIDEOS
          );
        }
      }

      // --------------------------------------------------------
      // Keep legacy image field synchronized
      // --------------------------------------------------------

      product.image =
        product.images &&
        product.images.length
          ? product.images[0]
          : "";

      // --------------------------------------------------------
      // Save
      // --------------------------------------------------------

      await product.save();

      console.log(
        `✅ Product updated: ${product._id}`
      );

      res.json({
        success: true,

        message:
          "Product updated successfully",

        product,
      });
    } catch (error) {
      console.error(
        "❌ Error updating product:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
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
      const { id } =
        req.params;

      // --------------------------------------------------------
      // Validate ID
      // --------------------------------------------------------

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Find product
      // --------------------------------------------------------

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Authentication
      // --------------------------------------------------------

      const currentUserId =
        req.userId ||
        req.user?.id ||
        req.user?._id;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // --------------------------------------------------------
      // Authorization
      // --------------------------------------------------------

      const isOwner =
        product.sellerId &&
        product.sellerId
          .toString() ===
          currentUserId.toString();

      const isAdmin =
        req.user?.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to delete this product",
        });
      }

      // --------------------------------------------------------
      // Delete Cloudinary images
      // --------------------------------------------------------

      for (
        const image of
          product.images || []
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      // --------------------------------------------------------
      // Delete Cloudinary videos
      // --------------------------------------------------------

      for (
        const video of
          product.videos || []
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      // --------------------------------------------------------
      // Delete database record
      // --------------------------------------------------------

      await product.deleteOne();

      console.log(
        `🗑️ Product deleted: ${id}`
      );

      res.json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "❌ Error deleting product:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete product",
      });
    }
  }
);

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================

router.patch(
  "/:id/status",
  verifyToken,

  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      // --------------------------------------------------------
      // Validate status
      // --------------------------------------------------------

      if (
        !status ||
        !VALID_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Allowed: active, pending, inactive, sold",
        });
      }

      // --------------------------------------------------------
      // Validate ID
      // --------------------------------------------------------

      if (
        !isValidObjectId(id)
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Find product
      // --------------------------------------------------------

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // Current user
      // --------------------------------------------------------

      const currentUserId =
        req.userId ||
        req.user?.id ||
        req.user?._id;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // --------------------------------------------------------
      // Authorization
      // --------------------------------------------------------

      const isOwner =
        product.sellerId &&
        product.sellerId
          .toString() ===
          currentUserId.toString();

      const isAdmin =
        req.user?.role ===
        "admin";

      if (
        !isOwner &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to update this product",
        });
      }

      // --------------------------------------------------------
      // Update
      // --------------------------------------------------------

      product.status =
        status;

      await product.save();

      console.log(
        `✅ Product ${id} status updated to ${status}`
      );

      res.json({
        success: true,

        message:
          `Product status updated to ${status}`,

        product,
      });
    } catch (error) {
      console.error(
        "❌ Error updating product status:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product status",
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;