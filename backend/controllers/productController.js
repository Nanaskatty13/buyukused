
// backend/controllers/productController.js

const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// ======================================================
// Upload Buffer to Cloudinary
// ======================================================

const uploadToCloudinary = (
  buffer,
  resourceType = "image",
  folder = "sell-platform/products"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    streamifier
      .createReadStream(buffer)
      .pipe(uploadStream);
  });
};

// ======================================================
// Delete File From Cloudinary
// ======================================================

const deleteFromCloudinary = async (
  fileUrl,
  resourceType = "image"
) => {
  try {
    if (
      !fileUrl ||
      !fileUrl.includes("cloudinary.com")
    ) {
      return;
    }

    const uploadIndex =
      fileUrl.indexOf("/upload/");

    if (uploadIndex === -1) {
      return;
    }

    let publicId = fileUrl.substring(
      uploadIndex + "/upload/".length
    );

    // Remove version
    publicId = publicId.replace(
      /^v\d+\//,
      ""
    );

    // Remove transformations
    if (publicId.includes("/")) {
      const parts = publicId.split("/");

      const hasExtension =
        /\.[^/.]+$/.test(parts[parts.length - 1]);

      if (parts.length > 1 && !hasExtension) {
        publicId = parts.join("/");
      }
    }

    // Remove extension
    publicId = publicId.replace(
      /\.[^/.]+$/,
      ""
    );

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
      }
    );
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error.message
    );
  }
};

// ======================================================
// Get All Products
// ======================================================

exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(
      Number(page) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit) || 12, 1),
      100
    );

    const query = {};

    if (search) {
      query.$or = [
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

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate(
        "sellerId",
        "name email phone location avatar"
      )
      .limit(limitNumber)
      .skip(
        (pageNumber - 1) *
          limitNumber
      )
      .sort({
        createdAt: -1,
      });

    const total =
      await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(
          total / limitNumber
        ),
        totalProducts: total,
      },
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Get Single Product
// ======================================================

exports.getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      ).populate(
        "sellerId",
        "name email phone location avatar"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Create Product
// ======================================================

exports.createProduct = async (
  req,
  res
) => {
  try {
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
    } = req.body;

    // ------------------------------
    // Authentication
    // ------------------------------

    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    // ------------------------------
    // Validation
    // ------------------------------

    if (
      !title ||
      title.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Product title is required",
      });
    }

    const numericPrice =
      Number(price);

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid product price is required",
      });
    }

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

    // ------------------------------
    // Upload Files
    // ------------------------------

    const imageUrls = [];
    const videoUrls = [];

    if (
      req.files &&
      req.files.length > 0
    ) {
      for (const file of req.files) {
        if (!file.buffer) {
          continue;
        }

        if (
          file.mimetype.startsWith(
            "image/"
          )
        ) {
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
        } else if (
          file.mimetype.startsWith(
            "video/"
          )
        ) {
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
      }
    }

    // ------------------------------
    // Product Data
    // ------------------------------

    const productData = {
      title: title.trim(),

      price: numericPrice,

      category:
        category || "Other",

      location:
        location || "Ghana",

      description:
        description || "",

      sellerId:
        req.user.id,

      sellerName:
        sellerName ||
        req.user.name ||
        "",

      sellerPhone:
        sellerPhone.trim(),

      brand:
        brand || "",

      model:
        model || "",

      ram:
        ram || "",

      storage:
        storage || "",

      color:
        color || "",

      condition:
        condition || "Good",

      negotiation:
        negotiation === true ||
        negotiation === "true",

      swapAccepted:
        swapAccepted === true ||
        swapAccepted === "true",

      simStatus:
        simStatus || "",

      batteryHealth:
        batteryHealth !== undefined &&
        batteryHealth !== ""
          ? Number(batteryHealth)
          : null,

      faceId:
        faceId || "",

      images: imageUrls,

      videos: videoUrls,

      status: "active",
    };

    // ------------------------------
    // Save Product
    // ------------------------------

    const product =
      await Product.create(
        productData
      );

    console.log(
      "✅ Product created:",
      product._id
    );

    console.log(
      "🖼️ Images:",
      imageUrls.length
    );

    console.log(
      "🎥 Videos:",
      videoUrls.length
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

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Duplicate product entry",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product validation failed",
        errors: Object.values(
          error.errors
        ).map(
          (err) => err.message
        ),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Update Product
// ======================================================

exports.updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ------------------------------
    // Update Text Fields
    // ------------------------------

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
      "brand",
      "model",
      "ram",
      "oldPrice",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] ===
          undefined
        ) {
          return;
        }

        if (
          field ===
            "negotiation" ||
          field ===
            "swapAccepted"
        ) {
          product[field] =
            req.body[field] ===
              true ||
            req.body[field] ===
              "true";
        } else if (
          field === "price" ||
          field ===
            "batteryHealth" ||
          field === "oldPrice"
        ) {
          product[field] =
            req.body[field] ===
            ""
              ? null
              : Number(
                  req.body[field]
                );
        } else {
          product[field] =
            typeof req.body[field] ===
            "string"
              ? req.body[field].trim()
              : req.body[field];
        }
      }
    );

    // ------------------------------
    // Keep Existing Images
    // ------------------------------

    let imagesToKeep = null;

    if (req.body.imagesToKeep) {
      try {
        imagesToKeep =
          JSON.parse(
            req.body.imagesToKeep
          );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "imagesToKeep must be valid JSON",
        });
      }
    }

    if (
      Array.isArray(imagesToKeep)
    ) {
      const oldImages =
        product.images || [];

      for (const oldImage of oldImages) {
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
        imagesToKeep;
    }

    // ------------------------------
    // Keep Existing Videos
    // ------------------------------

    let videosToKeep = null;

    if (req.body.videosToKeep) {
      try {
        videosToKeep =
          JSON.parse(
            req.body.videosToKeep
          );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "videosToKeep must be valid JSON",
        });
      }
    }

    if (
      Array.isArray(videosToKeep)
    ) {
      const oldVideos =
        product.videos || [];

      for (const oldVideo of oldVideos) {
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
        videosToKeep;
    }

    // ------------------------------
    // Upload New Files
    // ------------------------------

    if (
      req.files &&
      req.files.length > 0
    ) {
      for (const file of req.files) {
        if (!file.buffer) {
          continue;
        }

        if (
          file.mimetype.startsWith(
            "image/"
          )
        ) {
          const result =
            await uploadToCloudinary(
              file.buffer,
              "image"
            );

          if (result?.secure_url) {
            product.images.push(
              result.secure_url
            );
          }
        } else if (
          file.mimetype.startsWith(
            "video/"
          )
        ) {
          const result =
            await uploadToCloudinary(
              file.buffer,
              "video"
            );

          if (result?.secure_url) {
            product.videos.push(
              result.secure_url
            );
          }
        }
      }
    }

    await product.save();

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

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Delete Product
// ======================================================

exports.deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images
    for (const image of
      product.images || []) {
      await deleteFromCloudinary(
        image,
        "image"
      );
    }

    // Delete videos
    for (const video of
      product.videos || []) {
      await deleteFromCloudinary(
        video,
        "video"
      );
    }

    await product.deleteOne();

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
      message: error.message,
    });
  }
};

// ======================================================
// Update Stock
// ======================================================

exports.updateStock = async (
  req,
  res
) => {
  try {
    const {
      stock,
    } = req.body;

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        { stock },
        {
          new: true,
          runValidators: true,
        }
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
    console.error(
      "Update stock error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// Get Seller Products
// ======================================================

exports.getSellerProducts = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    const products =
      await Product.find({
        sellerId: req.user.id,
      })
        .populate(
          "sellerId",
          "name email phone location avatar"
        )
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(
      "Get seller products error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};