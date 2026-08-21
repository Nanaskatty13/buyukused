// ============================================================
// backend/constants/productCategories.js
// BuyUKUsed - Canonical Product Categories
// ============================================================

const PRODUCT_CATEGORIES = [
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
  "Other",
];

// ============================================================
// CATEGORY NORMALIZATION
// ============================================================

const normalizeCategory = (value) => {
  if (value === undefined || value === null) {
    return "Other";
  }

  // FormData can sometimes produce arrays
  if (Array.isArray(value)) {
    value = value[0];
  }

  // Handle objects such as { value: "Game Consoles" }
  if (typeof value === "object" && value !== null) {
    value =
      value.value ??
      value.name ??
      value.label ??
      "";
  }

  const raw = String(value).trim();

  if (!raw) {
    return "Other";
  }

  const normalized = raw
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[&/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // ==========================================================
  // CATEGORY MAP
  // ==========================================================

  const categoryMap = {
    // --------------------------------------------------------
    // CARS
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // PHONES
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // LAPTOPS
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // TABLETS
    // --------------------------------------------------------
    tablet: "Tablets",
    tablets: "Tablets",
    ipad: "Tablets",
    ipads: "Tablets",
    "tablet computer": "Tablets",
    "tablet computers": "Tablets",

    // --------------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------------
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
    earbuds: "Accessories",

    // --------------------------------------------------------
    // REAL ESTATE
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // JOBS
    // --------------------------------------------------------
    job: "Jobs",
    jobs: "Jobs",
    employment: "Jobs",
    vacancy: "Jobs",
    vacancies: "Jobs",
    career: "Jobs",
    careers: "Jobs",

    // --------------------------------------------------------
    // ELECTRONICS
    // --------------------------------------------------------
    electronic: "Electronics",
    electronics: "Electronics",
    gadget: "Electronics",
    gadgets: "Electronics",
    device: "Electronics",
    devices: "Electronics",

    // --------------------------------------------------------
    // FASHION
    // --------------------------------------------------------
    fashion: "Fashion",
    clothing: "Fashion",
    clothes: "Fashion",
    shoe: "Fashion",
    shoes: "Fashion",
    bag: "Fashion",
    bags: "Fashion",

    // --------------------------------------------------------
    // HOME
    // --------------------------------------------------------
    home: "Home",
    homes: "Home",
    furniture: "Home",
    household: "Home",
    appliance: "Home",
    appliances: "Home",
    "home appliance": "Home",
    "home appliances": "Home",

    // --------------------------------------------------------
    // TVS
    // --------------------------------------------------------
    tv: "TVs",
    tvs: "TVs",
    television: "TVs",
    televisions: "TVs",
    "smart tv": "TVs",
    "smart tvs": "TVs",
    "smart television": "TVs",
    "smart televisions": "TVs",

    // --------------------------------------------------------
    // GAME CONSOLES
    // --------------------------------------------------------
    console: "Game Consoles",
    consoles: "Game Consoles",
    gaming: "Game Consoles",
    "game console": "Game Consoles",
    "game consoles": "Game Consoles",
    "gaming console": "Game Consoles",
    "gaming consoles": "Game Consoles",
    "game-console": "Game Consoles",
    "game_consoles": "Game Consoles",
    playstation: "Game Consoles",
    playstations: "Game Consoles",
    "play station": "Game Consoles",
    "play stations": "Game Consoles",
    playstation4: "Game Consoles",
    playstation5: "Game Consoles",
    ps4: "Game Consoles",
    ps5: "Game Consoles",
    xbox: "Game Consoles",
    "xbox console": "Game Consoles",
    "xbox series": "Game Consoles",
    nintendo: "Game Consoles",
    switch: "Game Consoles",
    "nintendo switch": "Game Consoles",

    // --------------------------------------------------------
    // SMARTWATCHES
    // --------------------------------------------------------
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

    // --------------------------------------------------------
    // OTHER
    // --------------------------------------------------------
    other: "Other",
  };

  if (categoryMap[normalized]) {
    return categoryMap[normalized];
  }

  // Exact canonical match
  const canonical = PRODUCT_CATEGORIES.find(
    (category) =>
      category.toLowerCase() === normalized
  );

  if (canonical) {
    return canonical;
  }

  // ==========================================================
  // FUZZY MATCHING
  // ==========================================================

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
    normalized.includes("accessor") ||
    normalized.includes("charger") ||
    normalized.includes("headphone") ||
    normalized.includes("earphone")
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
    normalized.includes("clothing")
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
    normalized === "ps5" ||
    normalized === "switch"
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
// VALIDATION
// ============================================================

const isValidCategory = (value) => {
  const normalized = normalizeCategory(value);

  return PRODUCT_CATEGORIES.includes(normalized);
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  PRODUCT_CATEGORIES,
  normalizeCategory,
  isValidCategory,
};