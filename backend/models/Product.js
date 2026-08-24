const mongoose = require("mongoose");

const PRODUCT_CATEGORIES = [
  "Cars",
  "Phones",
  "Laptops",
  "Tablets",
  "Accessories",
  "Spare Parts",
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

const PRODUCT_STATUSES = [
  "active",
  "pending",
  "inactive",
  "sold",
];

const PRODUCT_CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      default: "Other",
      trim: true,
    },

    location: {
      type: String,
      default: "Ghana",
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sellerName: {
      type: String,
      default: "",
      trim: true,
    },

    sellerPhone: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

    imageEmbedding: {
      type: [Number],
      default: undefined,
      select: false,
    },

    imageEmbeddingModel: {
      type: String,
      default: "",
      trim: true,
      select: false,
    },

    imageEmbeddingUpdatedAt: {
      type: Date,
      default: null,
      select: false,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    model: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
    },

    condition: {
      type: String,
      enum: PRODUCT_CONDITIONS,
      default: "Good",
      trim: true,
    },

    warranty: {
      type: String,
      default: "",
      trim: true,
    },

    storage: {
      type: String,
      default: "",
      trim: true,
    },

    ram: {
      type: String,
      default: "",
      trim: true,
    },

    processor: {
      type: String,
      default: "",
      trim: true,
    },

    graphics: {
      type: String,
      default: "",
      trim: true,
    },

    screenSize: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: String,
      default: "",
      trim: true,
    },

    connectivity: {
      type: String,
      default: "",
      trim: true,
    },

    videoOutput: {
      type: String,
      default: "",
      trim: true,
    },

    region: {
      type: String,
      default: "",
      trim: true,
    },

    consoleType: {
      type: String,
      default: "",
      trim: true,
    },

    edition: {
      type: String,
      default: "",
      trim: true,
    },

    discDrive: {
      type: String,
      default: "",
      trim: true,
    },

    controllersIncluded: {
      type: String,
      default: "",
      trim: true,
    },

    battery: {
      type: String,
      default: "",
      trim: true,
    },

    resolution: {
      type: String,
      default: "",
      trim: true,
    },

    watchSize: {
      type: String,
      default: "",
      trim: true,
    },

    tvType: {
      type: String,
      default: "",
      trim: true,
    },

    displayTechnology: {
      type: String,
      default: "",
      trim: true,
    },

    refreshRate: {
      type: String,
      default: "",
      trim: true,
    },

    operatingSystem: {
      type: String,
      default: "",
      trim: true,
    },

    hdr: {
      type: String,
      default: "",
      trim: true,
    },

    hdmiPorts: {
      type: String,
      default: "",
      trim: true,
    },

    usbPorts: {
      type: String,
      default: "",
      trim: true,
    },

    smartTV: {
      type: Boolean,
      default: false,
    },

    voiceControl: {
      type: Boolean,
      default: false,
    },

    wallMountable: {
      type: Boolean,
      default: false,
    },

    mileage: {
      type: Number,
      default: null,
      min: 0,
    },

    bodyType: {
      type: String,
      default: "",
      trim: true,
    },

    fuelType: {
      type: String,
      default: "",
      trim: true,
    },

    transmission: {
      type: String,
      default: "",
      trim: true,
    },

    driveType: {
      type: String,
      default: "",
      trim: true,
    },

    engineSize: {
      type: String,
      default: "",
      trim: true,
    },

    seatingCapacity: {
      type: Number,
      default: null,
      min: 0,
    },

    exteriorColor: {
      type: String,
      default: "",
      trim: true,
    },

    interiorColor: {
      type: String,
      default: "",
      trim: true,
    },

    sparePartType: {
      type: String,
      default: "",
      trim: true,
    },

    sparePartCategory: {
      type: String,
      default: "",
      trim: true,
    },

    partNumber: {
      type: String,
      default: "",
      trim: true,
    },

    oemNumber: {
      type: String,
      default: "",
      trim: true,
    },

    manufacturerPartNumber: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleMake: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleModel: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleYear: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleGeneration: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleTrim: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleEngine: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleEngineCode: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleTransmission: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleFuelType: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleDriveType: {
      type: String,
      default: "",
      trim: true,
    },

    compatibilityYearFrom: {
      type: String,
      default: "",
      trim: true,
    },

    compatibilityYearTo: {
      type: String,
      default: "",
      trim: true,
    },

    partCondition: {
      type: String,
      enum: [
        "",
        "Brand New",
        "Genuine",
        "OEM",
        "Aftermarket",
        "Used",
        "Refurbished",
        "Reconditioned",
      ],
      default: "",
      trim: true,
    },

    partBrand: {
      type: String,
      default: "",
      trim: true,
    },

    partManufacturer: {
      type: String,
      default: "",
      trim: true,
    },

    partMaterial: {
      type: String,
      default: "",
      trim: true,
    },

    partColor: {
      type: String,
      default: "",
      trim: true,
    },

    partPosition: {
      type: String,
      default: "",
      trim: true,
    },

    partSide: {
      type: String,
      default: "",
      trim: true,
    },

    partPlacement: {
      type: String,
      default: "",
      trim: true,
    },

    installationType: {
      type: String,
      default: "",
      trim: true,
    },

    mountingType: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: null,
      min: 0,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    packageIncludes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    partCompatibility: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    interchangePartNumbers: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    vinCompatibility: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    installationAvailable: {
      type: Boolean,
      default: false,
    },

    installationFee: {
      type: Number,
      default: null,
      min: 0,
    },

    originalPart: {
      type: Boolean,
      default: false,
    },

    genuinePart: {
      type: Boolean,
      default: false,
    },

    oemPart: {
      type: Boolean,
      default: false,
    },

    aftermarketPart: {
      type: Boolean,
      default: false,
    },

    importedPart: {
      type: Boolean,
      default: false,
    },

    accessoryType: {
      type: String,
      default: "",
      trim: true,
    },

    compatibleWith: {
      type: String,
      default: "",
      trim: true,
    },

    compatibility: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    material: {
      type: String,
      default: "",
      trim: true,
    },

    cableType: {
      type: String,
      default: "",
      trim: true,
    },

    connectorType: {
      type: String,
      default: "",
      trim: true,
    },

    powerOutput: {
      type: String,
      default: "",
      trim: true,
    },

    capacity: {
      type: String,
      default: "",
      trim: true,
    },

    batteryCapacity: {
      type: String,
      default: "",
      trim: true,
    },

    wireless: {
      type: Boolean,
      default: false,
    },

    original: {
      type: Boolean,
      default: false,
    },

    batteryHealth: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    faceId: {
      type: String,
      enum: [
        "Working",
        "Not Working",
        "Not Available",
        "",
      ],
      default: "",
    },

    simStatus: {
      type: String,
      enum: [
        "eSIM Unlocked",
        "SIM Unlocked",
        "Locked",
        "Bypass",
        "Not Available",
        "",
      ],
      default: "",
      trim: true,
    },

    productType: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticType: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticBrand: {
      type: String,
      default: "",
      trim: true,
    },

    productLine: {
      type: String,
      default: "",
      trim: true,
    },

    shade: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticShade: {
      type: String,
      default: "",
      trim: true,
    },

    scent: {
      type: String,
      default: "",
      trim: true,
    },

    coverage: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticSize: {
      type: String,
      default: "",
      trim: true,
    },

    volume: {
      type: String,
      default: "",
      trim: true,
    },

    skinType: {
      type: String,
      default: "",
      trim: true,
    },

    skinConcern: {
      type: String,
      default: "",
      trim: true,
    },

    hairType: {
      type: String,
      default: "",
      trim: true,
    },

    hairConcern: {
      type: String,
      default: "",
      trim: true,
    },

    benefits: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    ingredients: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    spf: {
      type: String,
      default: "",
      trim: true,
    },

    expirationDate: {
      type: String,
      default: "",
      trim: true,
    },

    expiryDate: {
      type: String,
      default: "",
      trim: true,
    },

    batchNumber: {
      type: String,
      default: "",
      trim: true,
    },

    countryOfOrigin: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticMaterial: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticFinish: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticForm: {
      type: String,
      default: "",
      trim: true,
    },

    cosmeticSizeUnit: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      default: "",
      trim: true,
    },

    sealed: {
      type: Boolean,
      default: false,
    },

    authentic: {
      type: Boolean,
      default: false,
    },

    crueltyFree: {
      type: Boolean,
      default: false,
    },

    vegan: {
      type: Boolean,
      default: false,
    },

    parabenFree: {
      type: Boolean,
      default: false,
    },

    negotiation: {
      type: Boolean,
      default: false,
    },

    swapAccepted: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: "active",
      index: true,
    },

    promo: {
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    yearsOnPlatform: {
      type: Number,
      default: 0,
      min: 0,
    },

    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    this.slug = `${baseSlug || "product"}-${Date.now()}`;
  }

  next();
});

productSchema.virtual("seller", {
  ref: "User",
  localField: "sellerId",
  foreignField: "_id",
  justOne: true,
});

productSchema.methods.isSellerVerified = function () {
  const seller = this.seller || this.sellerId;

  if (!seller) {
    return false;
  }

  return seller.isVerified === true;
};

productSchema.index({
  title: "text",
  description: "text",
  brand: "text",
  model: "text",
  accessoryType: "text",
  compatibleWith: "text",
  compatibility: "text",
  sparePartType: "text",
  sparePartCategory: "text",
  partNumber: "text",
  oemNumber: "text",
  manufacturerPartNumber: "text",
  vehicleMake: "text",
  vehicleModel: "text",
  vehicleEngine: "text",
  partBrand: "text",
  partManufacturer: "text",
  partCompatibility: "text",
  interchangePartNumbers: "text",
  productType: "text",
  cosmeticType: "text",
  cosmeticBrand: "text",
  cosmeticShade: "text",
  shade: "text",
  skinType: "text",
  hairType: "text",
  hairConcern: "text",
  ingredients: "text",
  productLine: "text",
  benefits: "text",
  skinConcern: "text",
});

productSchema.index({
  category: 1,
  location: 1,
  status: 1,
});

productSchema.index({
  sellerId: 1,
  createdAt: -1,
});

productSchema.index({
  createdAt: -1,
});

productSchema.index({
  price: 1,
});

productSchema.index({
  simStatus: 1,
});

productSchema.index({
  batteryHealth: 1,
});

productSchema.index({
  accessoryType: 1,
});

productSchema.index({
  compatibleWith: 1,
});

productSchema.index({
  wireless: 1,
});

productSchema.index({
  original: 1,
});

productSchema.index({
  brand: 1,
});

productSchema.index({
  model: 1,
});

productSchema.index({
  videoOutput: 1,
});

productSchema.index({
  region: 1,
});

productSchema.index({
  resolution: 1,
});

productSchema.index({
  watchSize: 1,
});

productSchema.index({
  tvType: 1,
});

productSchema.index({
  displayTechnology: 1,
});

productSchema.index({
  refreshRate: 1,
});

productSchema.index({
  operatingSystem: 1,
});

productSchema.index({
  hdr: 1,
});

productSchema.index({
  smartTV: 1,
});

productSchema.index({
  mileage: 1,
});

productSchema.index({
  fuelType: 1,
});

productSchema.index({
  transmission: 1,
});

productSchema.index({
  bodyType: 1,
});

productSchema.index({
  sparePartType: 1,
});

productSchema.index({
  sparePartCategory: 1,
});

productSchema.index({
  partNumber: 1,
});

productSchema.index({
  oemNumber: 1,
});

productSchema.index({
  manufacturerPartNumber: 1,
});

productSchema.index({
  vehicleMake: 1,
});

productSchema.index({
  vehicleModel: 1,
});

productSchema.index({
  vehicleYear: 1,
});

productSchema.index({
  vehicleEngine: 1,
});

productSchema.index({
  vehicleFuelType: 1,
});

productSchema.index({
  vehicleTransmission: 1,
});

productSchema.index({
  partCondition: 1,
});

productSchema.index({
  partBrand: 1,
});

productSchema.index({
  partManufacturer: 1,
});

productSchema.index({
  partPosition: 1,
});

productSchema.index({
  partSide: 1,
});

productSchema.index({
  installationAvailable: 1,
});

productSchema.index({
  genuinePart: 1,
});

productSchema.index({
  oemPart: 1,
});

productSchema.index({
  aftermarketPart: 1,
});

productSchema.index({
  productType: 1,
});

productSchema.index({
  cosmeticType: 1,
});

productSchema.index({
  cosmeticBrand: 1,
});

productSchema.index({
  skinType: 1,
});

productSchema.index({
  hairType: 1,
});

productSchema.index({
  gender: 1,
});

productSchema.index({
  cosmeticShade: 1,
});

productSchema.index({
  scent: 1,
});

productSchema.index({
  coverage: 1,
});

productSchema.index({
  sealed: 1,
});

productSchema.index({
  authentic: 1,
});

productSchema.index({
  crueltyFree: 1,
});

productSchema.index({
  vegan: 1,
});

productSchema.index({
  parabenFree: 1,
});

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

module.exports = Product;