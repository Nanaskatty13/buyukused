// ============================================================
// backend/controllers/productController.js
// ============================================================

const mongoose = require("mongoose");
const streamifier = require("streamifier");

const Product = require("../models/Product");
const cloudinaryConfig = require("../config/cloudinary");

// ============================================================
// CLOUDINARY
// ============================================================

// Supports either:
// module.exports = cloudinary
// OR
// module.exports = { cloudinary }

const cloudinary =
  cloudinaryConfig?.cloudinary ||
  cloudinaryConfig;

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

const getUserId = (req) => {
  return (
    req.userId ||
    req.user?.id ||
    req.user?._id ||
    null
  );
};

const getUserRole = (req) => {
  return (
    req.user?.role ||
    req.userRole ||
    ""
  ).toString().toLowerCase();
};

const isAdmin = (req) => {
  return getUserRole(req) === "admin";
};

const isOwner = (product, req) => {
  const userId = getUserId(req);

  if (!userId || !product?.sellerId) {
    return false;
  }

  return (
    product.sellerId.toString() ===
    userId.toString()
  );
};

const isOwnerOrAdmin = (product, req) => {
  return (
    isAdmin(req) ||
    isOwner(product, req)
  );
};

// ============================================================
// BOOLEAN PARSER
// ============================================================

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized =
      value.trim().toLowerCase();

    if (
      normalized === "true" ||
      normalized === "1" ||
      normalized === "yes"
    ) {
      return true;
    }

    if (
      normalized === "false" ||
      normalized === "0" ||
      normalized === "no"
    ) {
      return false;
    }
  }

  return Boolean(value);
};

// ============================================================
// NUMBER PARSER
// ============================================================

const parseNumber = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadToCloudinary = (
  buffer,
  resourceType = "image"
) => {
  return new Promise(
    (resolve, reject) => {
      if (!cloudinary?.uploader) {
        return reject(
          new Error(
            "Cloudinary is not configured correctly"
          )
        );
      }

      const isVideo =
        resourceType === "video";

      const folder = isVideo
        ? "kn-classifieds/videos"
        : "kn-classifieds/images";

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type:
              isVideo
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

              return reject(error);
            }

            resolve(result);
          }
        );

      streamifier
        .createReadStream(buffer)
        .pipe(uploadStream);
    }
  );
};

// ============================================================
// CLOUDINARY PUBLIC ID
// ============================================================

const getCloudinaryPublicId = (
  fileUrl
) => {
  if (
    !fileUrl ||
    typeof fileUrl !== "string"
  ) {
    return null;
  }

  if (
    !fileUrl.includes(
      "res.cloudinary.com"
    )
  ) {
    return null;
  }

  const uploadIndex =
    fileUrl.indexOf("/upload/");

  if (uploadIndex === -1) {
    return null;
  }

  let publicId =
    fileUrl.substring(
      uploadIndex + 8
    );

  // Remove version
  publicId = publicId.replace(
    /^v\d+\//,
    ""
  );

  // Remove transformations.
  //
  // Example:
  // /upload/c_fill,w_500/v123/folder/image.jpg
  //
  // We keep everything after the version.
  const parts =
    publicId.split("/");

  const transformationPatterns = [
    /^c_/,
    /^w_/,
    /^h_/,
    /^q_/,
    /^f_/,
    /^ar_/,
    /^g_/,
    /^dpr_/,
    /^e_/,
    /^bo_/,
    /^r_/,
    /^x_/,
    /^y_/,
  ];

  let startIndex = 0;

  while (
    startIndex < parts.length &&
    transformationPatterns.some(
      (pattern) =>
        pattern.test(
          parts[startIndex]
        )
    )
  ) {
    startIndex++;
  }

  if (
    startIndex > 0
  ) {
    publicId =
      parts
        .slice(startIndex)
        .join("/");
  }

  // Remove file extension
  publicId = publicId.replace(
    /\.[^/.]+$/,
    ""
  );

  return publicId;
};

// ============================================================
// CLOUDINARY DELETE
// ============================================================

const deleteFromCloudinary = async (
  fileUrl,
  resourceType = "image"
) => {
  try {
    const publicId =
      getCloudinaryPublicId(
        fileUrl
      );

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          resourceType,
      }
    );

    console.log(
      `🗑️ Deleted Cloudinary ${resourceType}: ${publicId}`
    );
  } catch (error) {
    console.error(
      "⚠️ Cloudinary delete error:",
      error.message
    );
  }
};

// ============================================================
// FILE UPLOAD PROCESSOR
// ============================================================

const uploadProductFiles = async (
  files = []
) => {
  const imageFiles = files
    .filter(
      (file) =>
        file?.buffer &&
        file?.mimetype?.startsWith(
          "image/"
        )
    )
    .slice(0, MAX_IMAGES);

  const videoFiles = files
    .filter(
      (file) =>
        file?.buffer &&
        file?.mimetype?.startsWith(
          "video/"
        )
    )
    .slice(0, MAX_VIDEOS);

  const imageUrls = [];
  const videoUrls = [];

  // Images
  for (const file of imageFiles) {
    const result =
      await uploadToCloudinary(
        file.buffer,
        "image"
      );

    if (result?.secure_url) {
      imageUrls.push(
        result.secure_url
      );
    }
  }

  // Videos
  for (const file of videoFiles) {
    const result =
      await uploadToCloudinary(
        file.buffer,
        "video"
      );

    if (result?.secure_url) {
      videoUrls.push(
        result.secure_url
      );
    }
  }

  return {
    imageUrls,
    videoUrls,
  };
};

// ============================================================
// PARSE ARRAY FROM FORM DATA
// ============================================================

const parseArrayField = (
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

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    throw new Error(
      `${fieldName} must be an array`
    );
  }

  try {
    const parsed =
      JSON.parse(value);

    if (!Array.isArray(parsed)) {
      throw new Error();
    }

    return parsed.filter(
      (item) =>
        typeof item === "string" &&
        item.trim()
    );
  } catch {
    throw new Error(
      `${fieldName} must be valid JSON`
    );
  }
};

// ============================================================
// GET ALL PRODUCTS
// ============================================================

exports.getProducts = async (
  req,
  res
) => {
  try {
    const {
      search,
      category,
      location,
      sellerId,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(
        parseInt(limit, 10) || 20,
        1
      ),
      100
    );

    const query = {};

    // Category
    if (
      category &&
      category !== "all"
    ) {
      query.category =
        category;
    }

    // Location
    if (
      location &&
      location !== "all"
    ) {
      query.location =
        location;
    }

    // Seller
    if (sellerId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          sellerId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid seller ID",
        });
      }

      query.sellerId =
        sellerId;
    }

    // Status
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

      query.status = status;
    }

    // Search
    if (
      search &&
      search.trim()
    ) {
      const safeSearch =
        search
          .trim()
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

      query.$or = [
        {
          title: {
            $regex:
              safeSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex:
              safeSearch,
            $options: "i",
          },
        },
        {
          brand: {
            $regex:
              safeSearch,
            $options: "i",
          },
        },
        {
          model: {
            $regex:
              safeSearch,
            $options: "i",
          },
        },
      ];
    }

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(query)
        .populate(
          "sellerId",
          "name email phone location avatar role"
        )
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Product.countDocuments(
        query
      ),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages:
        Math.ceil(
          total /
            limitNumber
        ),

      pagination: {
        currentPage:
          pageNumber,

        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),

        totalProducts:
          total,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch products",
    });
  }
};

// ============================================================
// GET SINGLE PRODUCT
// ============================================================

exports.getProductById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
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
          "name email phone location avatar role"
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // Increment views
      product.views =
        (product.views || 0) +
        1;

      await product.save();

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Get product error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch product",
      });
    }
  };

// ============================================================
// CREATE PRODUCT
// ============================================================

exports.createProduct =
  async (req, res) => {
    let uploadedImages = [];
    let uploadedVideos = [];

    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

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
        brand,
        model,
        ram,
        oldPrice,
      } = req.body;

      // --------------------------------------------------------
      // TITLE
      // --------------------------------------------------------

      if (
        !title ||
        title.trim().length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required",
        });
      }

      // --------------------------------------------------------
      // PRICE
      // --------------------------------------------------------

      const numericPrice =
        parseNumber(price);

      if (
        numericPrice === null ||
        numericPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid product price is required",
        });
      }

      // --------------------------------------------------------
      // SELLER PHONE
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
      // CATEGORY
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
      // CONDITION
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
      // BATTERY HEALTH
      // --------------------------------------------------------

      let parsedBatteryHealth =
        null;

      if (
        batteryHealth !==
          undefined &&
        batteryHealth !== ""
      ) {
        parsedBatteryHealth =
          parseNumber(
            batteryHealth
          );

        if (
          parsedBatteryHealth ===
            null ||
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
      // FACE ID
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
      // OLD PRICE
      // --------------------------------------------------------

      let parsedOldPrice =
        null;

      if (
        oldPrice !==
          undefined &&
        oldPrice !== ""
      ) {
        parsedOldPrice =
          parseNumber(oldPrice);

        if (
          parsedOldPrice ===
            null ||
          parsedOldPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid old price",
          });
        }
      }

      // --------------------------------------------------------
      // FILES
      // --------------------------------------------------------

      const files =
        req.files || [];

      const {
        imageUrls,
        videoUrls,
      } =
        await uploadProductFiles(
          files
        );

      uploadedImages =
        imageUrls;

      uploadedVideos =
        videoUrls;

      // --------------------------------------------------------
      // PRODUCT DATA
      // --------------------------------------------------------

      const productData = {
        title:
          title.trim(),

        price:
          numericPrice,

        oldPrice:
          parsedOldPrice,

        category:
          selectedCategory,

        location:
          location?.trim() ||
          "Ghana",

        description:
          description?.trim() ||
          "",

        sellerId:
          userId,

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

        images:
          imageUrls,

        videos:
          videoUrls,

        image:
          imageUrls.length
            ? imageUrls[0]
            : "",

        status:
          "active",
      };

      // --------------------------------------------------------
      // SAVE
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
        "❌ Create product error:",
        error
      );

      // --------------------------------------------------------
      // CLEAN UP CLOUDINARY FILES
      // IF DATABASE SAVE FAILS
      // --------------------------------------------------------

      for (const image of
        uploadedImages) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      for (const video of
        uploadedVideos) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors:
            Object.values(
              error.errors
            ).map(
              (item) =>
                item.message
            ),
        });
      }

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Duplicate product entry",
        });
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create product",
      });
    }
  };

// ============================================================
// UPDATE PRODUCT
// ============================================================

exports.updateProduct =
  async (req, res) => {
    let newlyUploadedImages =
      [];

    let newlyUploadedVideos =
      [];

    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
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

      // --------------------------------------------------------
      // AUTHORIZATION
      // --------------------------------------------------------

      if (
        !isOwnerOrAdmin(
          product,
          req
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this product",
        });
      }

      // --------------------------------------------------------
      // TEXT FIELDS
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
        storage,
        color,
        condition,
        negotiation,
        swapAccepted,
        simStatus,
        batteryHealth,
        faceId,
        brand,
        model,
        ram,
        status,
      } = req.body;

      // Title
      if (
        title !== undefined
      ) {
        if (
          !title ||
          title.trim().length < 2
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Product title is required",
          });
        }

        product.title =
          title.trim();
      }

      // Price
      if (
        price !== undefined &&
        price !== ""
      ) {
        const numericPrice =
          parseNumber(price);

        if (
          numericPrice ===
            null ||
          numericPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid price",
          });
        }

        product.price =
          numericPrice;
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
          const numericOldPrice =
            parseNumber(
              oldPrice
            );

          if (
            numericOldPrice ===
              null ||
            numericOldPrice < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid old price",
            });
          }

          product.oldPrice =
            numericOldPrice;
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
          location.trim();
      }

      // Description
      if (
        description !==
        undefined
      ) {
        product.description =
          description.trim();
      }

      // Seller name
      if (
        sellerName !== undefined
      ) {
        product.sellerName =
          sellerName.trim();
      }

      // Seller phone
      if (
        sellerPhone !== undefined
      ) {
        if (
          !sellerPhone.trim()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Seller phone number cannot be empty",
          });
        }

        product.sellerPhone =
          sellerPhone.trim();
      }

      // Brand
      if (
        brand !== undefined
      ) {
        product.brand =
          brand.trim();
      }

      // Model
      if (
        model !== undefined
      ) {
        product.model =
          model.trim();
      }

      // RAM
      if (
        ram !== undefined
      ) {
        product.ram =
          ram.trim();
      }

      // Storage
      if (
        storage !== undefined
      ) {
        product.storage =
          storage.trim();
      }

      // Color
      if (
        color !== undefined
      ) {
        product.color =
          color.trim();
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
          simStatus.trim();
      }

      // Battery health
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
          const numericBattery =
            parseNumber(
              batteryHealth
            );

          if (
            numericBattery ===
              null ||
            numericBattery < 0 ||
            numericBattery > 100
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Battery health must be between 0 and 100",
            });
          }

          product.batteryHealth =
            numericBattery;
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
      // EXISTING IMAGES
      // --------------------------------------------------------

      const imagesToKeep =
        parseArrayField(
          req.body.imagesToKeep,
          "imagesToKeep"
        );

      if (
        Array.isArray(
          imagesToKeep
        )
      ) {
        const oldImages =
          product.images ||
          [];

        // Only keep actual existing image URLs
        const cleanImages =
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

        // Delete removed images
        for (const oldImage of
          oldImages) {
          if (
            !cleanImages.includes(
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
          cleanImages;
      }

      // --------------------------------------------------------
      // EXISTING VIDEOS
      // --------------------------------------------------------

      const videosToKeep =
        parseArrayField(
          req.body.videosToKeep,
          "videosToKeep"
        );

      if (
        Array.isArray(
          videosToKeep
        )
      ) {
        const oldVideos =
          product.videos ||
          [];

        const cleanVideos =
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

        // Delete removed videos
        for (const oldVideo of
          oldVideos) {
          if (
            !cleanVideos.includes(
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
          cleanVideos;
      }

      // --------------------------------------------------------
      // NEW FILES
      // --------------------------------------------------------

      const files =
        req.files || [];

      const newImageFiles =
        files
          .filter(
            (file) =>
              file?.buffer &&
              file?.mimetype?.startsWith(
                "image/"
              )
          );

      const newVideoFiles =
        files
          .filter(
            (file) =>
              file?.buffer &&
              file?.mimetype?.startsWith(
                "video/"
              )
          );

      // Remaining image capacity
      const imageCapacity =
        Math.max(
          MAX_IMAGES -
            product.images.length,
          0
        );

      const videoCapacity =
        Math.max(
          MAX_VIDEOS -
            product.videos.length,
          0
        );

      // Upload images
      for (
        const file of
        newImageFiles.slice(
          0,
          imageCapacity
        )
      ) {
        const result =
          await uploadToCloudinary(
            file.buffer,
            "image"
          );

        if (
          result?.secure_url
        ) {
          product.images.push(
            result.secure_url
          );

          newlyUploadedImages.push(
            result.secure_url
          );
        }
      }

      // Upload videos
      for (
        const file of
        newVideoFiles.slice(
          0,
          videoCapacity
        )
      ) {
        const result =
          await uploadToCloudinary(
            file.buffer,
            "video"
          );

        if (
          result?.secure_url
        ) {
          product.videos.push(
            result.secure_url
          );

          newlyUploadedVideos.push(
            result.secure_url
          );
        }
      }

      // Enforce limits
      product.images =
        product.images.slice(
          0,
          MAX_IMAGES
        );

      product.videos =
        product.videos.slice(
          0,
          MAX_VIDEOS
        );

      // Legacy image field
      product.image =
        product.images.length
          ? product.images[0]
          : "";

      // --------------------------------------------------------
      // SAVE
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
        "❌ Update product error:",
        error
      );

      // Delete newly uploaded files
      // if database update fails
      for (const image of
        newlyUploadedImages) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      for (const video of
        newlyUploadedVideos) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      if (
        error.name ===
        "ValidationError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product validation failed",
          errors:
            Object.values(
              error.errors
            ).map(
              (item) =>
                item.message
            ),
        });
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product",
      });
    }
  };

// ============================================================
// DELETE PRODUCT
// ============================================================

exports.deleteProduct =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
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

      // --------------------------------------------------------
      // AUTHORIZATION
      // --------------------------------------------------------

      if (
        !isOwnerOrAdmin(
          product,
          req
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to delete this product",
        });
      }

      // --------------------------------------------------------
      // CLOUDINARY
      // --------------------------------------------------------

      for (const image of
        product.images || []) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      for (const video of
        product.videos || []) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      // --------------------------------------------------------
      // DATABASE
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
        "❌ Delete product error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete product",
      });
    }
  };

// ============================================================
// GET SELLER PRODUCTS
// ============================================================

exports.getSellerProducts =
  async (req, res) => {
    try {
      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const products =
        await Product.find({
          sellerId: userId,
        })
          .populate(
            "sellerId",
            "name email phone location avatar role"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        products,
        total:
          products.length,
      });
    } catch (error) {
      console.error(
        "❌ Get seller products error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to fetch seller products",
      });
    }
  };

// ============================================================
// UPDATE PRODUCT STATUS
// ============================================================

exports.updateProductStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

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

      const product =
        await Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // --------------------------------------------------------
      // AUTHORIZATION
      // --------------------------------------------------------

      if (
        !isOwnerOrAdmin(
          product,
          req
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this product",
        });
      }

      product.status =
        status;

      await product.save();

      console.log(
        `✅ Product ${id} status changed to ${status}`
      );

      res.json({
        success: true,
        message:
          `Product status updated to ${status}`,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Update product status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product status",
      });
    }
  };

// ============================================================
// UPDATE STOCK
// ============================================================
//
// NOTE:
// Your current Product.js does NOT contain a `stock` field.
// Therefore this endpoint is intentionally disabled instead
// of pretending stock is being saved.
//

exports.updateStock =
  async (req, res) => {
    return res.status(400).json({
      success: false,
      message:
        "Stock is not supported by the current Product model",
    });
  };

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getProducts:
    exports.getProducts,

  getProductById:
    exports.getProductById,

  createProduct:
    exports.createProduct,

  updateProduct:
    exports.updateProduct,

  deleteProduct:
    exports.deleteProduct,

  updateStock:
    exports.updateStock,

  getSellerProducts:
    exports.getSellerProducts,

  updateProductStatus:
    exports.updateProductStatus,
};