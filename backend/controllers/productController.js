// ============================================================
// backend/controllers/productController.js
// BuyUKUsed Product Controller
// Complete Production Version
// ============================================================

const mongoose = require("mongoose");
const streamifier = require("streamifier");

const Product = require("../models/Product");
const cloudinaryConfig = require("../config/cloudinary");

// ============================================================
// CLOUDINARY
// ============================================================

const cloudinary =
  cloudinaryConfig?.cloudinary || cloudinaryConfig;

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
  "Laptops",
  "Tablets",
  "Accessories",
  "Real Estate",
  "Jobs",
  "Electronics",
  "Fashion",
  "Home",
  "TVs",
  "Game Consoles",
  "Smartwatches",
  "Cosmetics",
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

const VALID_SIM_STATUS = [
  "eSIM Unlocked",
  "SIM Unlocked",
  "Locked",
  "Bypass",
  "Not Available",
  "",
];

const VALID_COSMETIC_TYPES = [
  "",
  "Makeup",
  "Skincare",
  "Haircare",
  "Fragrance",
  "Body Care",
  "Nail Care",
  "Men's Grooming",
  "Beauty Tools",
  "Other",
];

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

const normalizeCategory = (category) => {
  if (
    category === undefined ||
    category === null ||
    String(category).trim() === ""
  ) {
    return "Other";
  }

  const raw = String(category).trim();
  const lower = raw.toLowerCase();

  const aliases = {
    cars: "Cars",
    car: "Cars",

    phones: "Phones",
    phone: "Phones",
    smartphone: "Phones",
    smartphones: "Phones",
    mobile: "Phones",
    mobiles: "Phones",

    laptops: "Laptops",
    laptop: "Laptops",
    notebooks: "Laptops",

    tablets: "Tablets",
    tablet: "Tablets",

    accessories: "Accessories",
    accessory: "Accessories",

    "real estate": "Real Estate",
    realestate: "Real Estate",
    property: "Real Estate",
    properties: "Real Estate",

    jobs: "Jobs",
    job: "Jobs",

    electronics: "Electronics",
    electronic: "Electronics",

    fashion: "Fashion",

    home: "Home",

    tv: "TVs",
    tvs: "TVs",
    television: "TVs",
    televisions: "TVs",

    "game console": "Game Consoles",
    "game consoles": "Game Consoles",
    console: "Game Consoles",
    consoles: "Game Consoles",
    playstation: "Game Consoles",
    xbox: "Game Consoles",

    smartwatch: "Smartwatches",
    smartwatches: "Smartwatches",
    "smart watch": "Smartwatches",
    "smart watches": "Smartwatches",

    cosmetics: "Cosmetics",
    cosmetic: "Cosmetics",
    beauty: "Cosmetics",
    makeup: "Cosmetics",

    other: "Other",
  };

  if (aliases[lower]) {
    return aliases[lower];
  }

  const normalized = lower
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (aliases[normalized]) {
    return aliases[normalized];
  }

  const exact = VALID_CATEGORIES.find(
    (item) => item.toLowerCase() === normalized
  );

  return exact || null;
};

// ============================================================
// HELPERS
// ============================================================

const getUserId = (req) => {
  return (
    req.userId ||
    req.user?.id ||
    req.user?._id ||
    req.auth?.userId ||
    null
  );
};

const getUserRole = (req) => {
  return String(
    req.user?.role ||
      req.userRole ||
      req.auth?.role ||
      ""
  ).toLowerCase();
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
  return isAdmin(req) || isOwner(product, req);
};

// ============================================================
// BOOLEAN PARSER
// ============================================================

const parseBoolean = (
  value,
  defaultValue = false
) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    if (
      ["true", "1", "yes", "on"].includes(
        normalized
      )
    ) {
      return true;
    }

    if (
      ["false", "0", "no", "off"].includes(
        normalized
      )
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

  const cleaned =
    typeof value === "string"
      ? value.replace(/,/g, "").trim()
      : value;

  const number = Number(cleaned);

  return Number.isFinite(number)
    ? number
    : null;
};

// ============================================================
// ARRAY PARSER
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
    return value.filter(
      (item) =>
        typeof item === "string" &&
        item.trim()
    );
  }

  if (typeof value !== "string") {
    throw new Error(
      `${fieldName} must be an array`
    );
  }

  try {
    const parsed = JSON.parse(value);

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
// PRODUCT FORMATTER
// ============================================================

const formatProduct = (product) => {
  if (!product) {
    return null;
  }

  const data =
    typeof product.toObject === "function"
      ? product.toObject()
      : { ...product };

  const images = Array.isArray(data.images)
    ? data.images.filter(Boolean)
    : [];

  const videos = Array.isArray(data.videos)
    ? data.videos.filter(Boolean)
    : [];

  const image =
    data.image ||
    images[0] ||
    "";

  return {
    ...data,

    category:
      normalizeCategory(data.category) ||
      "Other",

    image,

    images:
      images.length > 0
        ? images
        : image
        ? [image]
        : [],

    videos,

    batteryHealth:
      data.batteryHealth !== null &&
      data.batteryHealth !== undefined
        ? Number(data.batteryHealth)
        : null,

    mileage:
      data.mileage !== null &&
      data.mileage !== undefined
        ? Number(data.mileage)
        : null,

    seatingCapacity:
      data.seatingCapacity !== null &&
      data.seatingCapacity !== undefined
        ? Number(data.seatingCapacity)
        : null,

    faceId: data.faceId || "",

    simStatus: data.simStatus || "",

    condition:
      data.condition || "Good",

    storage: data.storage || "",

    ram: data.ram || "",

    processor:
      data.processor || "",

    graphics:
      data.graphics || "",

    screenSize:
      data.screenSize || "",

    cosmeticType:
      data.cosmeticType || "",

    swapAccepted:
      data.swapAccepted === true,

    negotiation:
      data.negotiation === true,

    wireless:
      data.wireless === true,

    original:
      data.original === true,

    smartTV:
      data.smartTV === true,

    voiceControl:
      data.voiceControl === true,

    wallMountable:
      data.wallMountable === true,

    promo:
      data.promo === true,

    verified:
      data.verified === true,
  };
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadToCloudinary = (
  buffer,
  resourceType = "image"
) => {
  return new Promise((resolve, reject) => {
    if (!cloudinary?.uploader) {
      return reject(
        new Error(
          "Cloudinary is not configured"
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

          resource_type: isVideo
            ? "video"
            : "image",

          public_id: `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}`,
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

// ============================================================
// CLOUDINARY PUBLIC ID
// ============================================================

const getCloudinaryPublicId = (
  fileUrl
) => {
  if (
    !fileUrl ||
    typeof fileUrl !== "string" ||
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

  let publicId = fileUrl
    .substring(uploadIndex + 8)
    .replace(/^v\d+\//, "");

  const parts = publicId.split("/");

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
        pattern.test(parts[startIndex])
    )
  ) {
    startIndex++;
  }

  if (startIndex > 0) {
    publicId = parts
      .slice(startIndex)
      .join("/");
  }

  return publicId.replace(
    /\.[^/.]+$/,
    ""
  );
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
      getCloudinaryPublicId(fileUrl);

    if (!publicId) {
      return;
    }

    if (!cloudinary?.uploader) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type:
          resourceType === "video"
            ? "video"
            : "image",
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
// UPLOAD PRODUCT FILES
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
// DELETE UPLOADED FILES
// ============================================================

const cleanupUploadedFiles = async (
  imageUrls = [],
  videoUrls = []
) => {
  for (const url of imageUrls) {
    await deleteFromCloudinary(
      url,
      "image"
    );
  }

  for (const url of videoUrls) {
    await deleteFromCloudinary(
      url,
      "video"
    );
  }
};

// ============================================================
// BUILD PRODUCT DATA
// ============================================================

const buildProductData = (
  body,
  userId,
  imageUrls = [],
  videoUrls = [],
  req = null
) => {
  const category =
    normalizeCategory(body.category);

  const sellerName = String(
    body.sellerName ||
      req?.user?.name ||
      req?.user?.username ||
      ""
  ).trim();

  const sellerPhone = String(
    body.sellerPhone ||
      req?.user?.phone ||
      ""
  ).trim();

  const data = {
    // --------------------------------------------------------
    // BASIC
    // --------------------------------------------------------

    title: String(
      body.title || ""
    ).trim(),

    price: parseNumber(body.price),

    oldPrice: parseNumber(
      body.oldPrice
    ),

    category,

    location: String(
      body.location || "Ghana"
    ).trim(),

    description: String(
      body.description || ""
    ).trim(),

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    sellerId: userId,

    sellerName,

    sellerPhone,

    // --------------------------------------------------------
    // MEDIA
    // --------------------------------------------------------

    images: imageUrls,

    videos: videoUrls,

    image:
      imageUrls.length > 0
        ? imageUrls[0]
        : "",

    // --------------------------------------------------------
    // GENERAL
    // --------------------------------------------------------

    brand: String(
      body.brand || ""
    ).trim(),

    model: String(
      body.model || ""
    ).trim(),

    color: String(
      body.color || ""
    ).trim(),

    condition:
      body.condition || "Good",

    warranty: String(
      body.warranty || ""
    ).trim(),

    // --------------------------------------------------------
    // COMPUTER / TABLET
    // --------------------------------------------------------

    storage: String(
      body.storage || ""
    ).trim(),

    ram: String(
      body.ram || ""
    ).trim(),

    processor: String(
      body.processor || ""
    ).trim(),

    graphics: String(
      body.graphics || ""
    ).trim(),

    screenSize: String(
      body.screenSize || ""
    ).trim(),

    year: String(
      body.year || ""
    ).trim(),

    connectivity: String(
      body.connectivity || ""
    ).trim(),

    // --------------------------------------------------------
    // GAME CONSOLE
    // --------------------------------------------------------

    videoOutput: String(
      body.videoOutput || ""
    ).trim(),

    region: String(
      body.region || ""
    ).trim(),

    consoleType: String(
      body.consoleType || ""
    ).trim(),

    edition: String(
      body.edition || ""
    ).trim(),

    discDrive: String(
      body.discDrive || ""
    ).trim(),

    controllersIncluded: String(
      body.controllersIncluded || ""
    ).trim(),

    battery: String(
      body.battery || ""
    ).trim(),

    resolution: String(
      body.resolution || ""
    ).trim(),

    // --------------------------------------------------------
    // SMARTWATCH
    // --------------------------------------------------------

    watchSize: String(
      body.watchSize || ""
    ).trim(),

    // --------------------------------------------------------
    // TV
    // --------------------------------------------------------

    tvType: String(
      body.tvType || ""
    ).trim(),

    displayTechnology: String(
      body.displayTechnology || ""
    ).trim(),

    refreshRate: String(
      body.refreshRate || ""
    ).trim(),

    operatingSystem: String(
      body.operatingSystem || ""
    ).trim(),

    hdr: String(
      body.hdr || ""
    ).trim(),

    hdmiPorts: String(
      body.hdmiPorts || ""
    ).trim(),

    usbPorts: String(
      body.usbPorts || ""
    ).trim(),

    smartTV: parseBoolean(
      body.smartTV
    ),

    voiceControl: parseBoolean(
      body.voiceControl
    ),

    wallMountable: parseBoolean(
      body.wallMountable
    ),

    // --------------------------------------------------------
    // CAR
    // --------------------------------------------------------

    mileage: parseNumber(
      body.mileage
    ),

    bodyType: String(
      body.bodyType || ""
    ).trim(),

    fuelType: String(
      body.fuelType || ""
    ).trim(),

    transmission: String(
      body.transmission || ""
    ).trim(),

    driveType: String(
      body.driveType || ""
    ).trim(),

    engineSize: String(
      body.engineSize || ""
    ).trim(),

    seatingCapacity:
      parseNumber(
        body.seatingCapacity
      ),

    exteriorColor: String(
      body.exteriorColor || ""
    ).trim(),

    interiorColor: String(
      body.interiorColor || ""
    ).trim(),

    // --------------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------------

    accessoryType: String(
      body.accessoryType || ""
    ).trim(),

    compatibleWith: String(
      body.compatibleWith || ""
    ).trim(),

    compatibility: String(
      body.compatibility || ""
    ).trim(),

    material: String(
      body.material || ""
    ).trim(),

    cableType: String(
      body.cableType || ""
    ).trim(),

    connectorType: String(
      body.connectorType || ""
    ).trim(),

    powerOutput: String(
      body.powerOutput || ""
    ).trim(),

    capacity: String(
      body.capacity || ""
    ).trim(),

    batteryCapacity: String(
      body.batteryCapacity || ""
    ).trim(),

    wireless: parseBoolean(
      body.wireless
    ),

    original: parseBoolean(
      body.original
    ),

    // --------------------------------------------------------
    // PHONE
    // --------------------------------------------------------

    batteryHealth:
      parseNumber(
        body.batteryHealth
      ),

    faceId:
      body.faceId || "",

    simStatus:
      body.simStatus || "",

    // --------------------------------------------------------
    // COSMETICS
    // --------------------------------------------------------

    cosmeticType: String(
      body.cosmeticType || ""
    ).trim(),

    skinType: String(
      body.skinType || ""
    ).trim(),

    shade: String(
      body.shade || ""
    ).trim(),

    volume: String(
      body.volume || ""
    ).trim(),

    expiryDate: String(
      body.expiryDate || ""
    ).trim(),

    gender: String(
      body.gender || ""
    ).trim(),

    ingredients: String(
      body.ingredients || ""
    ).trim(),

    // --------------------------------------------------------
    // SELLING OPTIONS
    // --------------------------------------------------------

    negotiation: parseBoolean(
      body.negotiation
    ),

    swapAccepted: parseBoolean(
      body.swapAccepted
    ),

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    status:
      body.status &&
      VALID_STATUSES.includes(
        body.status
      )
        ? body.status
        : "active",

    // --------------------------------------------------------
    // PROMOTION
    // --------------------------------------------------------

    promo: parseBoolean(
      body.promo
    ),

    verified: false,

    yearsOnPlatform:
      parseNumber(
        body.yearsOnPlatform
      ) || 0,
  };

  return data;
};

// ============================================================
// VALIDATE PRODUCT DATA
// ============================================================

const validateProductData = (
  data,
  body
) => {
  const errors = [];

  if (
    !data.title ||
    data.title.length < 2
  ) {
    errors.push(
      "Product title is required"
    );
  }

  if (
    data.title &&
    data.title.length > 200
  ) {
    errors.push(
      "Product title cannot exceed 200 characters"
    );
  }

  if (
    data.price === null ||
    data.price === undefined ||
    data.price < 0
  ) {
    errors.push(
      "A valid product price is required"
    );
  }

  if (!data.sellerPhone) {
    errors.push(
      "Seller phone number is required"
    );
  }

  if (!data.category) {
    errors.push(
      `Invalid product category: ${body.category}`
    );
  }

  if (
    data.category &&
    !VALID_CATEGORIES.includes(
      data.category
    )
  ) {
    errors.push(
      `Invalid product category: ${body.category}`
    );
  }

  if (
    !VALID_CONDITIONS.includes(
      data.condition
    )
  ) {
    errors.push(
      "Invalid product condition"
    );
  }

  if (
    data.faceId &&
    !VALID_FACE_ID.includes(
      data.faceId
    )
  ) {
    errors.push(
      "Invalid Face ID status"
    );
  }

  if (
    data.simStatus &&
    !VALID_SIM_STATUS.includes(
      data.simStatus
    )
  ) {
    errors.push(
      "Invalid SIM status"
    );
  }

  if (
    data.batteryHealth !== null &&
    (data.batteryHealth < 0 ||
      data.batteryHealth > 100)
  ) {
    errors.push(
      "Battery health must be between 0 and 100"
    );
  }

  if (
    data.mileage !== null &&
    data.mileage < 0
  ) {
    errors.push(
      "Mileage cannot be negative"
    );
  }

  if (
    data.seatingCapacity !== null &&
    data.seatingCapacity < 0
  ) {
    errors.push(
      "Seating capacity cannot be negative"
    );
  }

  if (
    data.cosmeticType &&
    !VALID_COSMETIC_TYPES.includes(
      data.cosmeticType
    )
  ) {
    errors.push(
      "Invalid cosmetic type"
    );
  }

  return errors;
};

// ============================================================
// GET PRODUCTS
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
      status,
      sellerId,
      minPrice,
      maxPrice,
      condition,
      brand,
      model,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const perPage = Math.min(
      Math.max(
        parseInt(limit, 10) || 20,
        1
      ),
      100
    );

    const query = {};

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (status) {
      if (
        VALID_STATUSES.includes(status)
      ) {
        query.status = status;
      }
    } else {
      query.status = "active";
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (category) {
      const normalized =
        normalizeCategory(category);

      if (normalized) {
        query.category = normalized;
      }
    }

    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    if (location) {
      query.location = {
        $regex: String(location).trim(),
        $options: "i",
      };
    }

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    if (sellerId) {
      if (
        mongoose.Types.ObjectId.isValid(
          sellerId
        )
      ) {
        query.sellerId = sellerId;
      }
    }

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    const minimum =
      parseNumber(minPrice);

    const maximum =
      parseNumber(maxPrice);

    if (
      minimum !== null ||
      maximum !== null
    ) {
      query.price = {};

      if (minimum !== null) {
        query.price.$gte = minimum;
      }

      if (maximum !== null) {
        query.price.$lte = maximum;
      }
    }

    // --------------------------------------------------------
    // CONDITION
    // --------------------------------------------------------

    if (
      condition &&
      VALID_CONDITIONS.includes(
        condition
      )
    ) {
      query.condition = condition;
    }

    // --------------------------------------------------------
    // BRAND
    // --------------------------------------------------------

    if (brand) {
      query.brand = {
        $regex: String(brand).trim(),
        $options: "i",
      };
    }

    // --------------------------------------------------------
    // MODEL
    // --------------------------------------------------------

    if (model) {
      query.model = {
        $regex: String(model).trim(),
        $options: "i",
      };
    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (search) {
      const searchText =
        String(search).trim();

      if (searchText) {
        query.$or = [
          {
            title: {
              $regex: searchText,
              $options: "i",
            },
          },
          {
            description: {
              $regex: searchText,
              $options: "i",
            },
          },
          {
            brand: {
              $regex: searchText,
              $options: "i",
            },
          },
          {
            model: {
              $regex: searchText,
              $options: "i",
            },
          },
          {
            category: {
              $regex: searchText,
              $options: "i",
            },
          },
          {
            location: {
              $regex: searchText,
              $options: "i",
            },
          },
        ];
      }
    }

    // --------------------------------------------------------
    // SORT
    // --------------------------------------------------------

    let sortQuery = {
      createdAt: -1,
    };

    switch (String(sort || "").toLowerCase()) {
      case "price_asc":
      case "price-low":
        sortQuery = {
          price: 1,
        };
        break;

      case "price_desc":
      case "price-high":
        sortQuery = {
          price: -1,
        };
        break;

      case "oldest":
        sortQuery = {
          createdAt: 1,
        };
        break;

      case "views":
        sortQuery = {
          views: -1,
        };
        break;

      case "newest":
      default:
        sortQuery = {
          createdAt: -1,
        };
        break;
    }

    const skip =
      (currentPage - 1) *
      perPage;

    const [products, total] =
      await Promise.all([
        Product.find(query)
          .sort(sortQuery)
          .skip(skip)
          .limit(perPage)
          .lean(),

        Product.countDocuments(query),
      ]);

    const formattedProducts =
      products.map(formatProduct);

    return res.status(200).json({
      success: true,

      products: formattedProducts,

      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        pages: Math.ceil(
          total / perPage
        ),
        hasNextPage:
          currentPage * perPage <
          total,
        hasPreviousPage:
          currentPage > 1,
      },

      total,
    });
  } catch (error) {
    console.error(
      "❌ getProducts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch products",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// GET PRODUCT BY ID
// ============================================================

exports.getProductById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
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

    // --------------------------------------------------------
    // Increment views
    // --------------------------------------------------------

    await Product.findByIdAndUpdate(
      id,
      {
        $inc: {
          views: 1,
        },
      }
    );

    product.views =
      Number(product.views || 0) + 1;

    return res.status(200).json({
      success: true,
      product: formatProduct(product),
    });
  } catch (error) {
    console.error(
      "❌ getProductById error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch product",
    });
  }
};

// ============================================================
// CREATE PRODUCT
// ============================================================

exports.createProduct = async (
  req,
  res
) => {
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

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid authenticated user",
      });
    }

    const body = req.body || {};

    // --------------------------------------------------------
    // BUILD DATA
    // --------------------------------------------------------

    const category =
      normalizeCategory(
        body.category
      );

    const files = Array.isArray(
      req.files
    )
      ? req.files
      : req.files
      ? Object.values(req.files).flat()
      : [];

    // --------------------------------------------------------
    // VALIDATE CATEGORY BEFORE UPLOAD
    // --------------------------------------------------------

    if (!category) {
      return res.status(400).json({
        success: false,
        message: `Invalid product category: ${body.category}`,
        receivedCategory:
          body.category,
        allowedCategories:
          VALID_CATEGORIES,
      });
    }

    const data =
      buildProductData(
        {
          ...body,
          category,
        },
        userId,
        [],
        [],
        req
      );

    const errors =
      validateProductData(
        data,
        {
          ...body,
          category,
        }
      );

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    // --------------------------------------------------------
    // UPLOAD MEDIA
    // --------------------------------------------------------

    const uploaded =
      await uploadProductFiles(files);

    uploadedImages =
      uploaded.imageUrls;

    uploadedVideos =
      uploaded.videoUrls;

    // --------------------------------------------------------
    // ADD MEDIA
    // --------------------------------------------------------

    data.images =
      uploadedImages;

    data.videos =
      uploadedVideos;

    data.image =
      uploadedImages.length
        ? uploadedImages[0]
        : "";

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const product =
      await Product.create(data);

    console.log(
      "============================================"
    );

    console.log(
      "✅ PRODUCT CREATED"
    );

    console.log(
      "Category received:",
      body.category
    );

    console.log(
      "Category normalized:",
      category
    );

    console.log(
      "Category saved:",
      product.category
    );

    console.log(
      "============================================"
    );

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product:
        formatProduct(product),
    });
  } catch (error) {
    console.error(
      "❌ createProduct error:",
      error
    );

    // --------------------------------------------------------
    // CLEAN CLOUDINARY FILES IF DB CREATION FAILS
    // --------------------------------------------------------

    if (
      uploadedImages.length ||
      uploadedVideos.length
    ) {
      await cleanupUploadedFiles(
        uploadedImages,
        uploadedVideos
      );
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product validation failed",
        errors: Object.values(
          error.errors || {}
        ).map(
          (item) => item.message
        ),
      });
    }

    if (
      error?.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "A product with this information already exists",
        duplicate:
          error.keyValue || {},
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create product",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// UPDATE PRODUCT
// ============================================================

exports.updateProduct = async (
  req,
  res
) => {
  let uploadedImages = [];
  let uploadedVideos = [];

  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
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

    const body = req.body || {};

    const updateData = {};

    // --------------------------------------------------------
    // BASIC
    // --------------------------------------------------------

    if (
      body.title !== undefined
    ) {
      const title = String(
        body.title
      ).trim();

      if (
        !title ||
        title.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required",
        });
      }

      updateData.title = title;
    }

    if (
      body.price !== undefined
    ) {
      const price =
        parseNumber(body.price);

      if (
        price === null ||
        price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product price",
        });
      }

      updateData.price = price;
    }

    if (
      body.oldPrice !== undefined
    ) {
      updateData.oldPrice =
        parseNumber(
          body.oldPrice
        );
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    if (
      body.category !== undefined
    ) {
      const category =
        normalizeCategory(
          body.category
        );

      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Invalid product category: ${body.category}`,
          allowedCategories:
            VALID_CATEGORIES,
        });
      }

      updateData.category =
        category;
    }

    // --------------------------------------------------------
    // GENERAL FIELDS
    // --------------------------------------------------------

    const stringFields = [
      "location",
      "description",
      "sellerName",
      "sellerPhone",
      "brand",
      "model",
      "color",
      "warranty",

      "storage",
      "ram",
      "processor",
      "graphics",
      "screenSize",
      "year",
      "connectivity",

      "videoOutput",
      "region",
      "consoleType",
      "edition",
      "discDrive",
      "controllersIncluded",
      "battery",
      "resolution",

      "watchSize",

      "tvType",
      "displayTechnology",
      "refreshRate",
      "operatingSystem",
      "hdr",
      "hdmiPorts",
      "usbPorts",

      "bodyType",
      "fuelType",
      "transmission",
      "driveType",
      "engineSize",
      "exteriorColor",
      "interiorColor",

      "accessoryType",
      "compatibleWith",
      "compatibility",
      "material",
      "cableType",
      "connectorType",
      "powerOutput",
      "capacity",
      "batteryCapacity",

      "cosmeticType",
      "skinType",
      "shade",
      "volume",
      "expiryDate",
      "gender",
      "ingredients",
    ];

    for (const field of stringFields) {
      if (
        body[field] !== undefined
      ) {
        updateData[field] =
          String(
            body[field] ?? ""
          ).trim();
      }
    }

    // --------------------------------------------------------
    // CONDITION
    // --------------------------------------------------------

    if (
      body.condition !== undefined
    ) {
      if (
        !VALID_CONDITIONS.includes(
          body.condition
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product condition",
        });
      }

      updateData.condition =
        body.condition;
    }

    // --------------------------------------------------------
    // PHONE FIELDS
    // --------------------------------------------------------

    if (
      body.faceId !== undefined
    ) {
      if (
        !VALID_FACE_ID.includes(
          body.faceId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Face ID status",
        });
      }

      updateData.faceId =
        body.faceId;
    }

    if (
      body.simStatus !== undefined
    ) {
      if (
        !VALID_SIM_STATUS.includes(
          body.simStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid SIM status",
        });
      }

      updateData.simStatus =
        body.simStatus;
    }

    if (
      body.batteryHealth !==
      undefined
    ) {
      const batteryHealth =
        parseNumber(
          body.batteryHealth
        );

      if (
        batteryHealth !== null &&
        (batteryHealth < 0 ||
          batteryHealth > 100)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Battery health must be between 0 and 100",
        });
      }

      updateData.batteryHealth =
        batteryHealth;
    }

    // --------------------------------------------------------
    // NUMERIC FIELDS
    // --------------------------------------------------------

    const numericFields = [
      "mileage",
      "seatingCapacity",
      "yearsOnPlatform",
      "views",
    ];

    for (const field of numericFields) {
      if (
        body[field] !== undefined
      ) {
        const value =
          parseNumber(
            body[field]
          );

        if (
          value !== null &&
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be negative`,
          });
        }

        updateData[field] =
          value;
      }
    }

    // --------------------------------------------------------
    // BOOLEAN FIELDS
    // --------------------------------------------------------

    const booleanFields = [
      "smartTV",
      "voiceControl",
      "wallMountable",
      "wireless",
      "original",
      "negotiation",
      "swapAccepted",
      "promo",
    ];

    for (const field of booleanFields) {
      if (
        body[field] !== undefined
      ) {
        updateData[field] =
          parseBoolean(
            body[field]
          );
      }
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (
      body.status !== undefined
    ) {
      if (
        !VALID_STATUSES.includes(
          body.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product status",
        });
      }

      updateData.status =
        body.status;
    }

    // --------------------------------------------------------
    // MEDIA
    // --------------------------------------------------------

    const files = Array.isArray(
      req.files
    )
      ? req.files
      : req.files
      ? Object.values(req.files).flat()
      : [];

    if (files.length > 0) {
      const uploaded =
        await uploadProductFiles(
          files
        );

      uploadedImages =
        uploaded.imageUrls;

      uploadedVideos =
        uploaded.videoUrls;

      // ------------------------------------------------------
      // Replace existing images/videos
      // ------------------------------------------------------

      const oldImages =
        Array.isArray(
          product.images
        )
          ? product.images
          : product.image
          ? [product.image]
          : [];

      const oldVideos =
        Array.isArray(
          product.videos
        )
          ? product.videos
          : [];

      updateData.images =
        uploadedImages;

      updateData.videos =
        uploadedVideos;

      updateData.image =
        uploadedImages.length
          ? uploadedImages[0]
          : "";

      // Delete old media after successful upload.
      for (const url of oldImages) {
        if (
          url &&
          !uploadedImages.includes(
            url
          )
        ) {
          await deleteFromCloudinary(
            url,
            "image"
          );
        }
      }

      for (const url of oldVideos) {
        if (
          url &&
          !uploadedVideos.includes(
            url
          )
        ) {
          await deleteFromCloudinary(
            url,
            "video"
          );
        }
      }
    }

    // --------------------------------------------------------
    // VALIDATE COSMETIC TYPE
    // --------------------------------------------------------

    if (
      updateData.cosmeticType !==
        undefined &&
      !VALID_COSMETIC_TYPES.includes(
        updateData.cosmeticType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid cosmetic type",
        allowedCosmeticTypes:
          VALID_COSMETIC_TYPES,
      });
    }

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    Object.assign(
      product,
      updateData
    );

    await product.save();

    console.log(
      "✅ PRODUCT UPDATED:",
      product._id.toString()
    );

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product:
        formatProduct(product),
    });
  } catch (error) {
    console.error(
      "❌ updateProduct error:",
      error
    );

    if (
      uploadedImages.length ||
      uploadedVideos.length
    ) {
      await cleanupUploadedFiles(
        uploadedImages,
        uploadedVideos
      );
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product validation failed",
        errors: Object.values(
          error.errors || {}
        ).map(
          (item) => item.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update product",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

// ============================================================
// DELETE PRODUCT
// ============================================================

exports.deleteProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
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

    const images =
      Array.isArray(product.images)
        ? product.images
        : product.image
        ? [product.image]
        : [];

    const videos =
      Array.isArray(product.videos)
        ? product.videos
        : [];

    await Product.findByIdAndDelete(
      id
    );

    // --------------------------------------------------------
    // Delete Cloudinary media
    // --------------------------------------------------------

    for (const image of images) {
      await deleteFromCloudinary(
        image,
        "image"
      );
    }

    for (const video of videos) {
      await deleteFromCloudinary(
        video,
        "video"
      );
    }

    console.log(
      "🗑️ PRODUCT DELETED:",
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ deleteProduct error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete product",
    });
  }
};

// ============================================================
// GET SELLER PRODUCTS
// ============================================================

exports.getSellerProducts = async (
  req,
  res
) => {
  try {
    const authenticatedUserId =
      getUserId(req);

    const requestedSellerId =
      req.params.sellerId ||
      req.query.sellerId;

    const sellerId =
      requestedSellerId ||
      authenticatedUserId;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

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

    const products =
      await Product.find({
        sellerId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      products:
        products.map(
          formatProduct
        ),
      total: products.length,
    });
  } catch (error) {
    console.error(
      "❌ getSellerProducts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
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

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
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

      if (
        !isOwnerOrAdmin(
          product,
          req
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to change this product",
        });
      }

      const status =
        String(
          req.body?.status ||
            ""
        ).trim();

      if (
        !VALID_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product status",
          allowedStatuses:
            VALID_STATUSES,
        });
      }

      product.status =
        status;

      await product.save();

      return res.status(200).json({
        success: true,
        message:
          "Product status updated successfully",
        product:
          formatProduct(product),
      });
    } catch (error) {
      console.error(
        "❌ updateProductStatus error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update product status",
      });
    }
  };

// ============================================================
// UPDATE STOCK
// ============================================================
// Compatibility endpoint.
// BuyUKUsed does not currently have a stock field in Product.js.
// Therefore this endpoint changes status when a stock-like
// request is received.

exports.updateStock = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
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

    const sold =
      parseBoolean(
        req.body?.sold,
        false
      );

    product.status = sold
      ? "sold"
      : "active";

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        sold
          ? "Product marked as sold"
          : "Product marked as active",
      product:
        formatProduct(product),
    });
  } catch (error) {
    console.error(
      "❌ updateStock error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update product stock",
    });
  }
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