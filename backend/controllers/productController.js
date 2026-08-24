// ============================================================
// backend/controllers/productController.js
// BuyUKUsed Product Controller
// ============================================================

const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const PRODUCT_CATEGORIES = require("../constants/productCategories");

const {
  createImageEmbeddingFromBuffer,
  MODEL_ID,
  EMBEDDING_DIMENSIONS,
} = require("../services/imageEmbeddingService");

// ============================================================
// CONSTANTS
// ============================================================

const VALID_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

const VALID_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

const VECTOR_INDEX_NAME =
  "product_image_vector_index";

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

const normalizeCategory = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "Other";
  }

  if (Array.isArray(value)) {
    value = value[0];
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    value =
      value.value ||
      value.name ||
      value.label ||
      "";
  }

  const raw = String(value)
    .trim()
    .toLowerCase();

  if (!raw) {
    return "Other";
  }

  const normalized = raw
    .replace(/[_-]+/g, " ")
    .replace(/[&/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const categoryMap = {
    // Cars
    car: "Cars",
    cars: "Cars",
    automobile: "Cars",
    automobiles: "Cars",
    auto: "Cars",
    autos: "Cars",
    vehicle: "Cars",
    vehicles: "Cars",
    motor: "Cars",
    motors: "Cars",
    "motor vehicle": "Cars",
    "motor vehicles": "Cars",

    // Phones
    phone: "Phones",
    phones: "Phones",
    mobile: "Phones",
    mobiles: "Phones",
    smartphone: "Phones",
    smartphones: "Phones",
    "mobile phone": "Phones",
    "mobile phones": "Phones",
    "smart phone": "Phones",
    "smart phones": "Phones",
    iphone: "Phones",
    iphones: "Phones",
    samsung: "Phones",
    android: "Phones",
    "cell phone": "Phones",
    "cell phones": "Phones",

    // Laptops
    laptop: "Laptops",
    laptops: "Laptops",
    notebook: "Laptops",
    notebooks: "Laptops",
    computer: "Laptops",
    computers: "Laptops",
    "personal computer": "Laptops",
    pc: "Laptops",
    macbook: "Laptops",
    macbooks: "Laptops",

    // Tablets
    tablet: "Tablets",
    tablets: "Tablets",
    ipad: "Tablets",
    ipads: "Tablets",
    "tablet computer": "Tablets",
    "tablet computers": "Tablets",

    // Accessories
    accessory: "Accessories",
    accessories: "Accessories",
    "phone accessory": "Accessories",
    "phone accessories": "Accessories",
    "computer accessory": "Accessories",
    "computer accessories": "Accessories",
    charger: "Accessories",
    chargers: "Accessories",
    cable: "Accessories",
    cables: "Accessories",
    earphone: "Accessories",
    earphones: "Accessories",
    headphone: "Accessories",
    headphones: "Accessories",
    earbud: "Accessories",
    earbuds: "Accessories",

    // Real Estate
    "real estate": "Real Estate",
    realestate: "Real Estate",
    property: "Real Estate",
    properties: "Real Estate",
    house: "Real Estate",
    houses: "Real Estate",
    land: "Real Estate",
    lands: "Real Estate",
    apartment: "Real Estate",
    apartments: "Real Estate",

    // Jobs
    job: "Jobs",
    jobs: "Jobs",
    employment: "Jobs",
    vacancy: "Jobs",
    vacancies: "Jobs",
    career: "Jobs",
    careers: "Jobs",

    // Electronics
    electronic: "Electronics",
    electronics: "Electronics",
    gadget: "Electronics",
    gadgets: "Electronics",
    device: "Electronics",
    devices: "Electronics",

    // Fashion
    fashion: "Fashion",
    clothing: "Fashion",
    clothes: "Fashion",
    shoe: "Fashion",
    shoes: "Fashion",
    bag: "Fashion",
    bags: "Fashion",

    // Home
    home: "Home",
    homes: "Home",
    furniture: "Home",
    household: "Home",
    "home appliance": "Home",
    "home appliances": "Home",
    appliance: "Home",
    appliances: "Home",

    // TVs
    tv: "TVs",
    tvs: "TVs",
    television: "TVs",
    televisions: "TVs",
    "smart tv": "TVs",
    "smart tvs": "TVs",
    "smart television": "TVs",
    "smart televisions": "TVs",

    // Game Consoles
    console: "Game Consoles",
    consoles: "Game Consoles",
    gaming: "Game Consoles",
    "game console": "Game Consoles",
    "game consoles": "Game Consoles",
    "gaming console": "Game Consoles",
    "gaming consoles": "Game Consoles",
    playstation: "Game Consoles",
    playstations: "Game Consoles",
    "play station": "Game Consoles",
    "play stations": "Game Consoles",
    ps4: "Game Consoles",
    ps5: "Game Consoles",
    xbox: "Game Consoles",
    "xbox console": "Game Consoles",
    "xbox series": "Game Consoles",
    nintendo: "Game Consoles",
    "nintendo switch": "Game Consoles",
    switch: "Game Consoles",

    // Smartwatches
    watch: "Smartwatches",
    watches: "Smartwatches",
    smartwatch: "Smartwatches",
    smartwatches: "Smartwatches",
    "smart watch": "Smartwatches",
    "smart watches": "Smartwatches",
    "smart wristwatch": "Smartwatches",
    "smart wristwatches": "Smartwatches",
    applewatch: "Smartwatches",
    "apple watch": "Smartwatches",

    // Cosmetics / Beauty
    cosmetic: "Cosmetics",
    cosmetics: "Cosmetics",
    beauty: "Cosmetics",
    makeup: "Cosmetics",
    makeups: "Cosmetics",
    skincare: "Cosmetics",
    "skin care": "Cosmetics",
    haircare: "Cosmetics",
    "hair care": "Cosmetics",
    bodycare: "Cosmetics",
    "body care": "Cosmetics",
    perfume: "Cosmetics",
    perfumes: "Cosmetics",
    fragrance: "Cosmetics",
    fragrances: "Cosmetics",
    lotion: "Cosmetics",
    lotions: "Cosmetics",
    cream: "Cosmetics",
    creams: "Cosmetics",
    shampoo: "Cosmetics",
    shampoos: "Cosmetics",
    conditioner: "Cosmetics",
    conditioners: "Cosmetics",
    "hair product": "Cosmetics",
    "hair products": "Cosmetics",
    "skin product": "Cosmetics",
    "skin products": "Cosmetics",
    "beauty product": "Cosmetics",
    "beauty products": "Cosmetics",

    // Other
    other: "Other",
  };

  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  const canonicalCategory =
    PRODUCT_CATEGORIES.find(
      (category) =>
        String(category)
          .trim()
          .toLowerCase() === normalized
    );

  if (canonicalCategory) {
    return canonicalCategory;
  }

  // ─── Fallback matching ──────────────────────────────────
  if (
    normalized.includes("phone") ||
    normalized.includes("mobile") ||
    normalized.includes("smartphone") ||
    normalized.includes("iphone")
  ) {
    return "Phones";
  }

  if (
    normalized.includes("laptop") ||
    normalized.includes("notebook") ||
    normalized === "computer" ||
    normalized === "computers" ||
    normalized === "pc"
  ) {
    return "Laptops";
  }

  if (
    normalized.includes("tablet") ||
    normalized.includes("ipad")
  ) {
    return "Tablets";
  }

  if (
    normalized.includes("car") ||
    normalized.includes("automobile") ||
    normalized.includes("vehicle")
  ) {
    return "Cars";
  }

  if (
    normalized.includes("accessor")
  ) {
    return "Accessories";
  }

  if (
    normalized.includes("real estate") ||
    normalized.includes("property") ||
    normalized.includes("house") ||
    normalized.includes("land")
  ) {
    return "Real Estate";
  }

  if (
    normalized.includes("job") ||
    normalized.includes("employment") ||
    normalized.includes("career")
  ) {
    return "Jobs";
  }

  if (
    normalized.includes("fashion") ||
    normalized.includes("clothing") ||
    normalized.includes("shoe") ||
    normalized.includes("bag")
  ) {
    return "Fashion";
  }

  if (
    normalized.includes("television") ||
    normalized === "tv" ||
    normalized === "tvs"
  ) {
    return "TVs";
  }

  if (
    normalized.includes("console") ||
    normalized.includes("playstation") ||
    normalized.includes("xbox") ||
    normalized.includes("nintendo") ||
    normalized === "ps4" ||
    normalized === "ps5"
  ) {
    return "Game Consoles";
  }

  if (
    normalized.includes("watch") ||
    normalized.includes("smartwatch")
  ) {
    return "Smartwatches";
  }

  if (
    normalized.includes("cosmetic") ||
    normalized.includes("beauty") ||
    normalized.includes("makeup") ||
    normalized.includes("skincare") ||
    normalized.includes("skin care") ||
    normalized.includes("haircare") ||
    normalized.includes("hair care") ||
    normalized.includes("bodycare") ||
    normalized.includes("body care") ||
    normalized.includes("perfume") ||
    normalized.includes("fragrance")
  ) {
    return "Cosmetics";
  }

  if (
    normalized.includes("electronic") ||
    normalized.includes("gadget") ||
    normalized.includes("device")
  ) {
    return "Electronics";
  }

  if (
    normalized.includes("home") ||
    normalized.includes("furniture") ||
    normalized.includes("appliance")
  ) {
    return "Home";
  }

  return "Other";
};

// ============================================================
// STATUS NORMALIZATION
// ============================================================

const normalizeStatus = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "active";
  }

  const status = String(value)
    .trim()
    .toLowerCase();

  return VALID_STATUSES.includes(status)
    ? status
    : "active";
};

// ============================================================
// CONDITION NORMALIZATION
// ============================================================

const normalizeCondition = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "Good";
  }

  const normalized = String(value)
    .trim()
    .toLowerCase();

  const match = VALID_CONDITIONS.find(
    (condition) =>
      condition.toLowerCase() === normalized
  );

  return match || "Good";
};

// ============================================================
// BOOLEAN HELPER
// ============================================================

const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    if (
      [
        "true",
        "1",
        "yes",
        "on",
      ].includes(normalized)
    ) {
      return true;
    }

    if (
      [
        "false",
        "0",
        "no",
        "off",
      ].includes(normalized)
    ) {
      return false;
    }
  }

  return Boolean(value);
};

// ============================================================
// NUMBER HELPER
// ============================================================

const toNumberOrNull = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "string") {
    value = value
      .replace(/,/g, "")
      .trim();
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

// ============================================================
// STRING HELPER
// ============================================================

const cleanString = (
  value,
  defaultValue = ""
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  if (Array.isArray(value)) {
    value = value[0];
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    value =
      value.value ||
      value.name ||
      value.label ||
      "";
  }

  return String(value).trim();
};

// ============================================================
// USER HELPERS
// ============================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    null
  );
};

const getUserRole = (req) => {
  return req.user?.role || "";
};

// ============================================================
// ESCAPE REGEX
// ============================================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

const uploadToCloudinary = (
  buffer,
  resourceType = "image",
  folder = "buyukused/products"
) => {
  return new Promise(
    (resolve, reject) => {
      if (!buffer || !Buffer.isBuffer(buffer)) {
        return reject(
          new Error(
            "Invalid file buffer"
          )
        );
      }

      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type:
              resourceType,
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
    }
  );
};

// ============================================================
// CLOUDINARY DELETE
// ============================================================

const deleteFromCloudinary =
  async (
    fileUrl,
    resourceType = "image"
  ) => {
    try {
      if (
        !fileUrl ||
        !fileUrl.includes(
          "cloudinary.com"
        )
      ) {
        return;
      }

      const uploadIndex =
        fileUrl.indexOf(
          "/upload/"
        );

      if (uploadIndex === -1) {
        return;
      }

      let publicId =
        fileUrl.substring(
          uploadIndex +
            "/upload/".length
        );

      publicId =
        publicId.replace(
          /^v\d+\//,
          ""
        );

      publicId =
        publicId.replace(
          /\.[^/.]+$/,
          ""
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
    } catch (error) {
      console.error(
        "❌ Cloudinary delete error:",
        error.message
      );
    }
  };

// ============================================================
// UPLOAD PRODUCT FILES
// ============================================================

const uploadProductFiles =
  async (files) => {
    const imageUrls = [];
    const videoUrls = [];

    if (
      !files ||
      !Array.isArray(files) ||
      files.length === 0
    ) {
      return {
        imageUrls,
        videoUrls,
      };
    }

    for (const file of files) {
      if (
        !file ||
        !file.buffer
      ) {
        continue;
      }

      try {
        if (
          file.mimetype &&
          file.mimetype.startsWith(
            "image/"
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
            imageUrls.push(
              result.secure_url
            );
          }
        } else if (
          file.mimetype &&
          file.mimetype.startsWith(
            "video/"
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
            videoUrls.push(
              result.secure_url
            );
          }
        }
      } catch (uploadError) {
        console.error(
          "❌ File upload error:",
          uploadError.message
        );

        throw uploadError;
      }
    }

    return {
      imageUrls,
      videoUrls,
    };
  };

// ============================================================
// BUILD PRODUCT DATA
// ============================================================

const buildProductData = (body, req) => {
  const normalizedCategory =
    normalizeCategory(body?.category);

  return {
    // --------------------------------------------------------
    // BASIC PRODUCT INFORMATION
    // --------------------------------------------------------

    title: cleanString(body.title),
    price: toNumberOrNull(body.price),
    oldPrice: toNumberOrNull(body.oldPrice),
    category: normalizedCategory,
    location: cleanString(body.location) || "Ghana",
    description: cleanString(body.description),

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    sellerId: getUserId(req),
    sellerName: cleanString(body.sellerName) || cleanString(req.user?.name),
    sellerPhone: cleanString(body.sellerPhone) || cleanString(req.user?.phone),

    // --------------------------------------------------------
    // GENERAL
    // --------------------------------------------------------

    brand: cleanString(body.brand),
    model: cleanString(body.model),
    color: cleanString(body.color),
    condition: normalizeCondition(body.condition),
    warranty: cleanString(body.warranty),

    // --------------------------------------------------------
    // PHONES / LAPTOPS / TABLETS
    // --------------------------------------------------------

    storage: cleanString(body.storage),
    ram: cleanString(body.ram),
    processor: cleanString(body.processor),
    graphics: cleanString(body.graphics),
    screenSize: cleanString(body.screenSize),
    year: cleanString(body.year),
    connectivity: cleanString(body.connectivity),
    battery: cleanString(body.battery),
    resolution: cleanString(body.resolution),
    operatingSystem: cleanString(body.operatingSystem),
    batteryHealth: toNumberOrNull(body.batteryHealth),
    faceId: cleanString(body.faceId),
    simStatus: cleanString(body.simStatus),

    // --------------------------------------------------------
    // GAME CONSOLES
    // --------------------------------------------------------

    videoOutput: cleanString(body.videoOutput),
    region: cleanString(body.region),
    consoleType: cleanString(body.consoleType),
    edition: cleanString(body.edition),
    discDrive: cleanString(body.discDrive),
    controllersIncluded: cleanString(body.controllersIncluded),

    // --------------------------------------------------------
    // SMARTWATCHES
    // --------------------------------------------------------

    watchSize: cleanString(body.watchSize),

    // --------------------------------------------------------
    // TV
    // --------------------------------------------------------

    tvType: cleanString(body.tvType),
    displayTechnology: cleanString(body.displayTechnology),
    refreshRate: cleanString(body.refreshRate),
    hdr: cleanString(body.hdr),
    hdmiPorts: cleanString(body.hdmiPorts),
    usbPorts: cleanString(body.usbPorts),

    // --------------------------------------------------------
    // CARS
    // --------------------------------------------------------

    mileage: toNumberOrNull(body.mileage),
    bodyType: cleanString(body.bodyType),
    fuelType: cleanString(body.fuelType),
    transmission: cleanString(body.transmission),
    driveType: cleanString(body.driveType),
    engineSize: cleanString(body.engineSize),
    seatingCapacity: toNumberOrNull(body.seatingCapacity),
    exteriorColor: cleanString(body.exteriorColor),
    interiorColor: cleanString(body.interiorColor),

    // --------------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------------

    accessoryType: cleanString(body.accessoryType),
    compatibleWith: cleanString(body.compatibleWith),
    compatibility: cleanString(body.compatibility),
    material: cleanString(body.material),
    cableType: cleanString(body.cableType),
    connectorType: cleanString(body.connectorType),
    powerOutput: cleanString(body.powerOutput),
    capacity: cleanString(body.capacity),
    batteryCapacity: cleanString(body.batteryCapacity),

    // --------------------------------------------------------
    // COSMETICS / BEAUTY – All fields from frontend
    // --------------------------------------------------------

    cosmeticType: cleanString(body.cosmeticType),
    productType: cleanString(body.productType),     // may be used for subcategory
    skinType: cleanString(body.skinType),
    hairType: cleanString(body.hairType),
    gender: cleanString(body.gender),
    shade: cleanString(body.shade),
    volume: cleanString(body.volume),
    ingredients: cleanString(body.ingredients),
    expiryDate: cleanString(body.expiryDate),

    // ─── Additional cosmetics fields ──────────────────────────
    productLine: cleanString(body.productLine),
    scent: cleanString(body.scent),
    coverage: cleanString(body.coverage),
    cosmeticSize: cleanString(body.cosmeticSize),
    benefits: cleanString(body.benefits),
    skinConcern: cleanString(body.skinConcern),
    spf: cleanString(body.spf),
    expirationDate: cleanString(body.expirationDate),
    batchNumber: cleanString(body.batchNumber),
    countryOfOrigin: cleanString(body.countryOfOrigin),

    // ─── Cosmetics booleans ──────────────────────────────────
    sealed: toBoolean(body.sealed),
    authentic: toBoolean(body.authentic),
    crueltyFree: toBoolean(body.crueltyFree),
    vegan: toBoolean(body.vegan),
    parabenFree: toBoolean(body.parabenFree),

    // --------------------------------------------------------
    // BOOLEAN FIELDS (general)
    // --------------------------------------------------------

    smartTV: toBoolean(body.smartTV),
    voiceControl: toBoolean(body.voiceControl),
    wallMountable: toBoolean(body.wallMountable),
    wireless: toBoolean(body.wireless),
    original: toBoolean(body.original),
    negotiation: toBoolean(body.negotiation),
    swapAccepted: toBoolean(body.swapAccepted),

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    status: normalizeStatus(body.status),
  };
};

// ============================================================
// VALIDATE PRODUCT DATA
// ============================================================

const validateProductData = (
  data
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
    data.price === null ||
    !Number.isFinite(
      data.price
    ) ||
    data.price < 0
  ) {
    errors.push(
      "A valid product price is required"
    );
  }

  if (!data.sellerId) {
    errors.push(
      "Seller authentication is required"
    );
  }

  if (
    !data.sellerPhone ||
    !data.sellerPhone.trim()
  ) {
    errors.push(
      "Seller phone number is required"
    );
  }

  if (
    !PRODUCT_CATEGORIES.includes(
      data.category
    )
  ) {
    errors.push(
      `Invalid product category: ${data.category}`
    );
  }

  if (
    !VALID_STATUSES.includes(
      data.status
    )
  ) {
    errors.push(
      `Invalid product status: ${data.status}`
    );
  }

  if (
    !VALID_CONDITIONS.includes(
      data.condition
    )
  ) {
    errors.push(
      `Invalid product condition: ${data.condition}`
    );
  }

  return errors;
};

// ============================================================
// CREATE VISUAL EMBEDDING
// ============================================================

const createProductVisualEmbedding =
  async (
    imageBuffer
  ) => {
    if (
      !imageBuffer ||
      !Buffer.isBuffer(imageBuffer)
    ) {
      return null;
    }

    try {
      const embedding =
        await createImageEmbeddingFromBuffer(
          imageBuffer
        );

      if (
        !Array.isArray(
          embedding
        ) ||
        embedding.length !==
          EMBEDDING_DIMENSIONS
      ) {
        throw new Error(
          `Expected ${EMBEDDING_DIMENSIONS}-dimension embedding`
        );
      }

      return embedding;
    } catch (error) {
      console.error(
        "⚠️ Visual embedding generation failed:",
        error.message
      );

      return null;
    }
  };

// ============================================================
// GET PRODUCTS
// ============================================================

exports.getProducts =
  async (req, res) => {
    try {
      const {
        search,
        category,
        location,
        condition,
        brand,
        model,
        status,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12,
        sellerId,
      } = req.query;

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 12,
            1
          ),
          100
        );

      const query = {};

      query.status = status
        ? normalizeStatus(status)
        : "active";

      if (category) {
        query.category =
          normalizeCategory(
            category
          );
      }

      if (location) {
        query.location = {
          $regex:
            escapeRegex(
              location
            ),
          $options: "i",
        };
      }

      if (condition) {
        query.condition =
          normalizeCondition(
            condition
          );
      }

      if (brand) {
        query.brand = {
          $regex:
            escapeRegex(
              brand
            ),
          $options: "i",
        };
      }

      if (model) {
        query.model = {
          $regex:
            escapeRegex(
              model
            ),
          $options: "i",
        };
      }

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

      const min =
        toNumberOrNull(
          minPrice
        );

      const max =
        toNumberOrNull(
          maxPrice
        );

      if (
        min !== null ||
        max !== null
      ) {
        query.price = {};

        if (min !== null) {
          query.price.$gte = min;
        }

        if (max !== null) {
          query.price.$lte = max;
        }
      }

      if (search) {
        const safeSearch =
          escapeRegex(
            String(search).trim()
          );

        if (safeSearch) {
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
            {
              accessoryType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              compatibleWith: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              compatibility: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              cosmeticType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              productType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              skinType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              hairType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              tvType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
            {
              consoleType: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
          ];
        }
      }

      const products =
        await Product.find(query)
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
        await Product.countDocuments(
          query
        );

      return res.json({
        success: true,
        products,
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
          limit:
            limitNumber,
        },
      });
    } catch (error) {
      console.error(
        "❌ Get products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get products",
      });
    }
  };

// ============================================================
// VISUAL SEARCH
// ============================================================

exports.visualSearch =
  async (req, res) => {
    try {
      const file =
        Array.isArray(req.files)
          ? req.files[0]
          : req.file;

      if (
        !file ||
        !file.buffer
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload an image",
        });
      }

      if (
        !file.mimetype ||
        !file.mimetype.startsWith(
          "image/"
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Only image files are supported",
        });
      }

      const {
        category,
        location,
        minPrice,
        maxPrice,
        limit = 24,
      } = req.body || {};

      const queryEmbedding =
        await createImageEmbeddingFromBuffer(
          file.buffer
        );

      if (
        !queryEmbedding ||
        queryEmbedding.length !==
          EMBEDDING_DIMENSIONS
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to create image embedding",
        });
      }

      const safeLimit =
        Math.min(
          Math.max(
            Number(limit) || 24,
            1
          ),
          100
        );

      const filter = {
        status: "active",
      };

      if (category) {
        filter.category =
          normalizeCategory(
            category
          );
      }

      if (location) {
        filter.location = {
          $regex:
            escapeRegex(
              location
            ),
          $options: "i",
        };
      }

      const min =
        toNumberOrNull(
          minPrice
        );

      const max =
        toNumberOrNull(
          maxPrice
        );

      if (
        min !== null ||
        max !== null
      ) {
        filter.price = {};

        if (min !== null) {
          filter.price.$gte =
            min;
        }

        if (max !== null) {
          filter.price.$lte =
            max;
        }
      }

      const candidates =
        Math.max(
          safeLimit * 10,
          100
        );

      const pipeline = [
        {
          $vectorSearch: {
            index:
              VECTOR_INDEX_NAME,
            path:
              "imageEmbedding",
            queryVector:
              queryEmbedding,
            numCandidates:
              candidates,
            limit:
              safeLimit,
            filter,
          },
        },

        {
          $addFields: {
            visualSimilarity: {
              $meta:
                "vectorSearchScore",
            },
          },
        },

        {
          $project: {
            imageEmbedding: 0,
            imageEmbeddingModel: 0,
            imageEmbeddingUpdatedAt: 0,
          },
        },

        {
          $lookup: {
            from: "users",
            localField:
              "sellerId",
            foreignField:
              "_id",
            as: "seller",
          },
        },

        {
          $unwind: {
            path: "$seller",
            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $addFields: {
            sellerId: {
              _id: "$seller._id",
              name: "$seller.name",
              email: "$seller.email",
              phone: "$seller.phone",
              location:
                "$seller.location",
              avatar:
                "$seller.avatar",
            },
          },
        },

        {
          $project: {
            seller: 0,
          },
        },
      ];

      const products =
        await Product.aggregate(
          pipeline
        );

      return res.json({
        success: true,
        message:
          "Visual search completed",
        products,
        count:
          products.length,
        visualSearch: true,
        model: MODEL_ID,
        dimensions:
          EMBEDDING_DIMENSIONS,
      });
    } catch (error) {
      console.error(
        "❌ Visual search error:",
        error
      );

      if (
        error.message?.includes(
          "index"
        ) &&
        error.message?.includes(
          "vector"
        )
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Visual search index is not configured in MongoDB Atlas",
          error:
            error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Visual search failed",
      });
    }
  };

// ============================================================
// GET SINGLE PRODUCT (with view tracking + notification)
// ============================================================

exports.getProductById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

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
        await Product.findById(
          id
        ).populate(
          "sellerId",
          "name email phone location avatar isVerified profileImage"
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      // ─── Increment view count ──────────────────────────────────
      await Product.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } }
      );
      product.views = (product.views || 0) + 1;

      // ─── Send notification to seller (if viewer logged in & not owner) ──
      const viewerId = getUserId(req);
      const sellerId = product.sellerId?._id || product.sellerId;

      if (
        viewerId &&
        sellerId &&
        viewerId.toString() !== sellerId.toString()
      ) {
        // Run asynchronously – don’t block response
        setImmediate(async () => {
          try {
            const viewer = await User.findById(viewerId).select('name').lean();
            const viewerName = viewer?.name || 'Someone';

            // Optional: avoid duplicate notifications within 1 minute
            const recent = await Notification.findOne({
              user: sellerId,
              sender: viewerId,
              type: 'product_viewed',
              link: `/product/${product._id}`,
              createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
            });
            if (recent) return;

            const notification = new Notification({
              user: sellerId,
              sender: viewerId,
              title: '📢 Product Viewed',
              message: `${viewerName} viewed your product “${product.title}”`,
              link: `/product/${product._id}`,
              type: 'product_viewed',
              read: false,
            });
            await notification.save();
            console.log(`🔔 Notification sent: ${viewerName} viewed product ${product._id}`);
          } catch (notifErr) {
            console.error('❌ Failed to create product view notification:', notifErr);
          }
        });
      }

      return res.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Get product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get product",
      });
    }
  };

// ============================================================
// CREATE PRODUCT
// ============================================================

exports.createProduct =
  async (req, res) => {
    try {
      console.log(
        "📦 Creating product..."
      );

      const userId =
        getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const productData =
        buildProductData(
          req.body || {},
          req
        );

      productData.sellerId =
        userId;

      console.log(
        "📦 Product category:",
        productData.category
      );

      console.log(
        "📦 Product title:",
        productData.title
      );

      console.log(
        "📦 Incoming files:",
        Array.isArray(req.files)
          ? req.files.length
          : 0
      );

      const validationErrors =
        validateProductData(
          productData
        );

      if (
        validationErrors.length > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            validationErrors[0],
          errors:
            validationErrors,
        });
      }

      const {
        imageUrls,
        videoUrls,
      } =
        await uploadProductFiles(
          req.files
        );

      productData.images =
        imageUrls;

      productData.videos =
        videoUrls;

      productData.image =
        imageUrls[0] || "";

      // --------------------------------------------------------
      // VISUAL EMBEDDING
      // --------------------------------------------------------

      if (
        req.files &&
        Array.isArray(req.files)
      ) {
        const firstImage =
          req.files.find(
            (file) =>
              file?.mimetype?.startsWith(
                "image/"
              )
          );

        if (firstImage) {
          const embedding =
            await createProductVisualEmbedding(
              firstImage.buffer
            );

          if (embedding) {
            productData.imageEmbedding =
              embedding;

            productData.imageEmbeddingModel =
              MODEL_ID;

            productData.imageEmbeddingUpdatedAt =
              new Date();
          }
        }
      }

      const product =
        await Product.create(
          productData
        );

      console.log(
        "✅ Product created:",
        product._id.toString()
      );

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        product,
        visualSearchIndexed:
          Boolean(
            productData.imageEmbedding
          ),
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
            error.errors || {}
          ).map(
            (err) =>
              err.message
          ),
        });
      }

      return res.status(500).json({
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
    try {
      const { id } =
        req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

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
        await Product.findById(
          id
        ).select(
          "+imageEmbedding +imageEmbeddingModel +imageEmbeddingUpdatedAt"
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const userId =
        getUserId(req);

      const role =
        getUserRole(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const isAdmin =
        role === "admin";

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          userId.toString();

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this product",
        });
      }

      // --------------------------------------------------------
      // ALLOWED FIELDS – includes all cosmetics fields
      // --------------------------------------------------------

      const allowedFields = [
        "title",
        "price",
        "oldPrice",
        "category",
        "location",
        "description",

        "sellerName",
        "sellerPhone",

        "brand",
        "model",
        "color",
        "condition",
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

        "mileage",
        "bodyType",
        "fuelType",
        "transmission",
        "driveType",
        "engineSize",
        "seatingCapacity",
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

        // ─── Cosmetics ────────────────────────────────────────
        "cosmeticType",
        "productType",
        "skinType",
        "hairType",
        "gender",
        "shade",
        "volume",
        "ingredients",
        "expiryDate",
        "productLine",
        "scent",
        "coverage",
        "cosmeticSize",
        "benefits",
        "skinConcern",
        "spf",
        "expirationDate",
        "batchNumber",
        "countryOfOrigin",

        // ─── Other ────────────────────────────────────────────
        "batteryHealth",
        "faceId",
        "simStatus",

        "negotiation",
        "swapAccepted",

        "smartTV",
        "voiceControl",
        "wallMountable",
        "wireless",
        "original",

        "sealed",
        "authentic",
        "crueltyFree",
        "vegan",
        "parabenFree",

        "status",
      ];

      const numericFields = [
        "price",
        "oldPrice",
        "batteryHealth",
        "mileage",
        "seatingCapacity",
      ];

      const booleanFields = [
        "negotiation",
        "swapAccepted",
        "smartTV",
        "voiceControl",
        "wallMountable",
        "wireless",
        "original",
        "sealed",
        "authentic",
        "crueltyFree",
        "vegan",
        "parabenFree",
      ];

      // --------------------------------------------------------
      // UPDATE FIELDS
      // --------------------------------------------------------

      for (
        const field of allowedFields
      ) {
        if (
          req.body[field] ===
          undefined
        ) {
          continue;
        }

        const value =
          req.body[field];

        if (
          field === "category"
        ) {
          product.category =
            normalizeCategory(
              value
            );

          continue;
        }

        if (
          field === "status"
        ) {
          product.status =
            normalizeStatus(
              value
            );

          continue;
        }

        if (
          field === "condition"
        ) {
          product.condition =
            normalizeCondition(
              value
            );

          continue;
        }

        if (
          booleanFields.includes(
            field
          )
        ) {
          product[field] =
            toBoolean(value);

          continue;
        }

        if (
          numericFields.includes(
            field
          )
        ) {
          product[field] =
            toNumberOrNull(
              value
            );

          continue;
        }

        product[field] =
          cleanString(value);
      }

      // --------------------------------------------------------
      // KEEP EXISTING IMAGES
      // --------------------------------------------------------

      let imagesToKeep = null;

      if (
        req.body.imagesToKeep !==
        undefined
      ) {
        try {
          imagesToKeep =
            Array.isArray(
              req.body.imagesToKeep
            )
              ? req.body.imagesToKeep
              : JSON.parse(
                  req.body.imagesToKeep
                );
        } catch {
          return res.status(400).json({
            success: false,
            message:
              "imagesToKeep must be valid JSON",
          });
        }
      }

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
          imagesToKeep;

        product.image =
          imagesToKeep[0] || "";
      }

      // --------------------------------------------------------
      // KEEP EXISTING VIDEOS
      // --------------------------------------------------------

      let videosToKeep = null;

      if (
        req.body.videosToKeep !==
        undefined
      ) {
        try {
          videosToKeep =
            Array.isArray(
              req.body.videosToKeep
            )
              ? req.body.videosToKeep
              : JSON.parse(
                  req.body.videosToKeep
                );
        } catch {
          return res.status(400).json({
            success: false,
            message:
              "videosToKeep must be valid JSON",
          });
        }
      }

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
          videosToKeep;
      }

      // --------------------------------------------------------
      // UPLOAD NEW FILES
      // --------------------------------------------------------

      let newImageUploaded =
        false;

      let firstNewImageBuffer =
        null;

      if (
        req.files &&
        Array.isArray(req.files) &&
        req.files.length > 0
      ) {
        const {
          imageUrls,
          videoUrls,
        } =
          await uploadProductFiles(
            req.files
          );

        if (
          imageUrls.length > 0
        ) {
          if (
            !Array.isArray(
              product.images
            )
          ) {
            product.images = [];
          }

          product.images.push(
            ...imageUrls
          );

          newImageUploaded =
            true;
        }

        if (
          videoUrls.length > 0
        ) {
          if (
            !Array.isArray(
              product.videos
            )
          ) {
            product.videos = [];
          }

          product.videos.push(
            ...videoUrls
          );
        }

        product.image =
          product.images?.[0] ||
          "";

        const firstNewImage =
          req.files.find(
            (file) =>
              file?.mimetype?.startsWith(
                "image/"
              )
          );

        if (firstNewImage) {
          firstNewImageBuffer =
            firstNewImage.buffer;
        }
      }

      // --------------------------------------------------------
      // REGENERATE VISUAL EMBEDDING
      // --------------------------------------------------------

      if (
        newImageUploaded &&
        firstNewImageBuffer
      ) {
        const embedding =
          await createProductVisualEmbedding(
            firstNewImageBuffer
          );

        if (embedding) {
          product.imageEmbedding =
            embedding;

          product.imageEmbeddingModel =
            MODEL_ID;

          product.imageEmbeddingUpdatedAt =
            new Date();
        }
      }

      // --------------------------------------------------------
      // FINAL VALIDATION
      // --------------------------------------------------------

      if (
        !product.title ||
        product.title.trim()
          .length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required",
        });
      }

      if (
        product.price === null ||
        !Number.isFinite(
          product.price
        ) ||
        product.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid product price is required",
        });
      }

      if (
        !product.sellerPhone ||
        !product.sellerPhone.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Seller phone number is required",
        });
      }

      if (
        !PRODUCT_CATEGORIES.includes(
          product.category
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product category: ${product.category}`,
        });
      }

      if (
        !VALID_STATUSES.includes(
          product.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product status: ${product.status}`,
        });
      }

      if (
        !VALID_CONDITIONS.includes(
          product.condition
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid product condition: ${product.condition}`,
        });
      }

      await product.save();

      return res.json({
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
            error.errors || {}
          ).map(
            (err) =>
              err.message
          ),
        });
      }

      return res.status(500).json({
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

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

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

      const userId =
        getUserId(req);

      const role =
        getUserRole(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const isAdmin =
        role === "admin";

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          userId.toString();

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to delete this product",
        });
      }

      for (
        const image of
          product.images || []
      ) {
        await deleteFromCloudinary(
          image,
          "image"
        );
      }

      for (
        const video of
          product.videos || []
      ) {
        await deleteFromCloudinary(
          video,
          "video"
        );
      }

      await product.deleteOne();

      return res.json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "❌ Delete product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete product",
      });
    }
  };

// ============================================================
// UPDATE STOCK
// ============================================================

exports.updateStock =
  async (req, res) => {
    return res.status(400).json({
      success: false,
      message:
        "Stock is not supported by the current Product model",
    });
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
            "name email phone location avatar"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        products,
      });
    } catch (error) {
      console.error(
        "❌ Get seller products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get seller products",
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
        req.body || {};

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
      }

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

      const normalizedStatus =
        normalizeStatus(
          status
        );

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

      const userId =
        getUserId(req);

      const role =
        getUserRole(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const isAdmin =
        role === "admin";

      const isOwner =
        product.sellerId &&
        product.sellerId.toString() ===
          userId.toString();

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this product",
        });
      }

      product.status =
        normalizedStatus;

      await product.save();

      return res.json({
        success: true,
        message:
          `Product status updated to ${normalizedStatus}`,
        product,
      });
    } catch (error) {
      console.error(
        "❌ Update product status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Server error updating product status",
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

  visualSearch:
    exports.visualSearch,
};