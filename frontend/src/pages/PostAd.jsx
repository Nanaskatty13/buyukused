// ============================================================
// frontend/src/pages/PostAd.jsx
// ============================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProductWithFiles } from "../services/api";

import LaptopForm, {
  LAPTOP_BRANDS,
} from "../components/LaptopForm";

import TabletForm, {
  TABLET_BRANDS,
} from "../components/TabletForm";

// ============================================================
// LOCATION DATA
// ============================================================

const countries = ["Ghana"];

const regions = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

const citiesByRegion = {
  "Greater Accra": [
    "Accra",
    "Kwame Nkrumah Circle",
    "Tema",
    "Ashaiman",
    "Madina",
    "Adenta",
    "Dzorwulu",
    "Kaneshie",
    "Achimota",
    "Legon",
    "Osu",
    "Labone",
    "Cantonments",
    "Airport Residential",
    "East Legon",
    "Lakeside Estate",
    "Sakumono",
    "Spintex",
    "Atomic",
    "Ablekuma",
    "Mamprobi",
    "Chorkor",
    "Korle Bu",
    "Dansoman",
    "Kisseman",
    "Avenor",
    "Bubuashie",
    "Aboabo",
    "Nima",
    "Maamobi",
    "Alajo",
    "Kokomlemle",
    "Tesano",
    "Abelemkpe",
    "Kotobabi",
    "Roman Ridge",
    "Ringway",
    "Tudor",
    "Asylum Down",
    "North Ridge",
    "South Ridge",
    "Independence Avenue",
    "Sarakawa",
    "La",
    "Teshie",
    "Nungua",
    "Prampram",
    "Dodowa",
    "Aburi",
    "Nsawam",
    "Amasaman",
    "Weija",
    "Kasoa",
    "Bawjiase",
  ],

  Ashanti: [
    "Kumasi",
    "Obuasi",
    "Tafo",
    "Bekwai",
    "Mampong",
    "Ejisu",
    "Kwadaso",
    "Asokwa",
    "Suame",
    "Oforikrom",
    "Nhyiaeso",
    "Bantama",
    "Adum",
    "Kejetia",
    "Manhyia",
  ],

  Central: [
    "Cape Coast",
    "Elmina",
    "Saltpond",
    "Winneba",
    "Mfantsiman",
    "Assin Foso",
    "Twifo Praso",
    "Kasoa",
  ],

  Eastern: [
    "Koforidua",
    "Nkawkaw",
    "Akropong",
    "Mpraeso",
    "Akwatia",
    "Nsawam",
    "Aburi",
    "Suhum",
    "Asamankese",
  ],

  Western: [
    "Sekondi-Takoradi",
    "Tarkwa",
    "Prestea",
    "Axim",
    "Shama",
    "Apollonia",
    "Elubo",
  ],

  Volta: [
    "Ho",
    "Hohoe",
    "Keta",
    "Akatsi",
    "Sogakope",
    "Jasikan",
    "Kpeve",
  ],

  Northern: [
    "Tamale",
    "Yendi",
    "Bimbilla",
    "Walewale",
    "Kpandai",
    "Savelugu",
  ],

  "Upper East": [
    "Bolgatanga",
    "Bawku",
    "Navrongo",
    "Paga",
    "Zuarungu",
  ],

  "Upper West": [
    "Wa",
    "Lawra",
    "Jirapa",
    "Nandom",
    "Tumu",
  ],

  Ahafo: [
    "Goaso",
    "Mim",
    "Ahafo",
    "Kukuom",
    "Sankore",
  ],

  Bono: [
    "Sunyani",
    "Techiman",
    "Berekum",
    "Dormaa Ahenkro",
    "Nkoranza",
  ],

  "Bono East": [
    "Techiman",
    "Atebubu",
    "Kintampo",
    "Jema",
    "Yeji",
  ],

  "North East": [
    "Nalerigu",
    "Bunkpurugu",
    "Gambaga",
    "Walewale",
  ],

  Oti: [
    "Dambai",
    "Jasikan",
    "Kpandae",
    "Nkwanta",
    "Worawora",
  ],

  Savannah: [
    "Damongo",
    "Bole",
    "Sawla",
    "Tuna",
    "Kpandai",
  ],

  "Western North": [
    "Sefwi Wiawso",
    "Bibiani",
    "Aowin",
    "Juaboso",
    "Enchi",
  ],
};

// ============================================================
// PHONE COLORS
// ============================================================

const phoneColors = [
  "Space Gray",
  "Orange",
  "Deep Blue",
  "Silver",
  "Gold",
  "Black",
  "White",
  "Blue",
  "Coral",
  "Yellow",
  "Red",
  "Purple",
  "Green",
  "Midnight Green",
  "Graphite",
  "Pacific Blue",
  "Midnight",
  "Starlight",
  "Pink",
  "Sierra Blue",
  "Alpine Green",
  "Deep Purple",
  "Space Black",
  "Black Titanium",
  "White Titanium",
  "Blue Titanium",
  "Natural Titanium",
  "Desert Titanium",
  "Teal",
  "Ultramarine",
  "Product Red",
  "Rose Gold",
  "Matte Black",
  "Jet Black",
];

// ============================================================
// ACCESSORY OPTIONS
// ============================================================

const ACCESSORY_TYPES = [
  "Phone Case",
  "Screen Protector",
  "Charger",
  "Charging Cable",
  "Power Bank",
  "Earphones",
  "Headphones",
  "Bluetooth Speaker",
  "Smart Watch",
  "Watch Strap",
  "Wireless Charger",
  "Car Charger",
  "Car Mount",
  "Phone Holder",
  "Laptop Bag",
  "Laptop Sleeve",
  "Laptop Charger",
  "USB Hub",
  "Keyboard",
  "Mouse",
  "Mouse Pad",
  "HDMI Cable",
  "Adapter",
  "Memory Card",
  "USB Flash Drive",
  "Game Controller",
  "Other",
];

const ACCESSORY_COMPATIBILITY = [
  "iPhone",
  "Samsung",
  "Google Pixel",
  "Tecno",
  "Infinix",
  "Xiaomi",
  "Huawei",
  "OnePlus",
  "Nokia",
  "Oppo",
  "Vivo",
  "Universal",
  "MacBook",
  "Windows Laptop",
  "iPad",
  "Android Tablet",
  "PlayStation",
  "Xbox",
  "Nintendo",
  "Other",
];

const CONDITIONS = [
  "Brand New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
];

// ============================================================
// COMPONENT
// ============================================================

const PostAd = () => {
  const { user, token, login, register } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [selectedCountry, setSelectedCountry] = useState("Ghana");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] = useState({
    // Basic
    title: "",
    price: "",
    category: "electronics",
    location: "Ghana",
    description: "",

    // Seller
    sellerName: "",
    sellerPhone: "",

    // General
    brand: "",
    model: "",
    color: "",
    condition: "Good",
    warranty: "",

    // Selling
    negotiation: false,
    swapAccepted: false,

    // Phone
    storage: "",
    batteryHealth: "",
    faceId: "",
    simStatus: "",

    // Laptop
    processor: "",
    ram: "",
    screenSize: "",
    graphics: "",

    // Tablet
    year: "",
    connectivity: "",

    // Accessories
    accessoryType: "",
    compatibility: "",
    accessoryColor: "",
    accessoryMaterial: "",
  });

  // ==========================================================
  // MEDIA
  // ==========================================================

  const [mediaItems, setMediaItems] = useState([]);

  // ==========================================================
  // AUTH FORM
  // ==========================================================

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ==========================================================
  // CATEGORY MAP
  // ==========================================================

  const categoryMap = {
    phones: "Phones",
    laptops: "Laptops",
    tablets: "Tablets",
    accessories: "Accessories",
    electronics: "Electronics",
  };

  // ==========================================================
  // CATEGORY FLAGS
  // ==========================================================

  const isPhone = formData.category === "phones";
  const isLaptop = formData.category === "laptops";
  const isTablet = formData.category === "tablets";
  const isAccessory = formData.category === "accessories";

  // ==========================================================
  // LOCATION EFFECT
  // ==========================================================

  useEffect(() => {
    let location = selectedCountry;

    if (selectedRegion) {
      location = `${selectedRegion}, ${location}`;
    }

    if (selectedCity) {
      location = `${selectedCity}, ${location}`;
    }

    setFormData((prev) => ({
      ...prev,
      location,
    }));
  }, [selectedCountry, selectedRegion, selectedCity]);

  // ==========================================================
  // CLEANUP MEDIA PREVIEWS
  // ==========================================================

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  // ==========================================================
  // GENERIC CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================================
  // CHECKBOX CHANGE
  // ==========================================================

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ==========================================================
  // CATEGORY CHANGE
  // ==========================================================

  const handleCategoryChange = (e) => {
    const category = e.target.value;

    setFormData((prev) => ({
      ...prev,
      category,

      // Clear phone fields
      ...(category !== "phones"
        ? {
            simStatus: "",
            batteryHealth: "",
            faceId: "",
          }
        : {}),

      // Clear laptop fields
      ...(category !== "laptops"
        ? {
            processor: "",
            ram: "",
            screenSize: "",
            graphics: "",
          }
        : {}),

      // Clear tablet fields
      ...(category !== "tablets"
        ? {
            year: "",
            connectivity: "",
          }
        : {}),

      // Clear accessory fields
      ...(category !== "accessories"
        ? {
            accessoryType: "",
            compatibility: "",
            accessoryColor: "",
            accessoryMaterial: "",
          }
        : {}),
    }));

    setError("");
  };

  // ==========================================================
  // LOCATION HANDLERS
  // ==========================================================

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSelectedRegion("");
    setSelectedCity("");
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
    setSelectedCity("");
  };

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);

    if (!selected.length) return;

    const imageFiles = selected.filter((file) =>
      file.type.startsWith("image/")
    );

    if (!imageFiles.length) {
      setError("Please select valid image files.");
      e.target.value = "";
      return;
    }

    const existingImages = mediaItems.filter(
      (item) => item.type === "image"
    ).length;

    const remaining = 5 - existingImages;

    if (remaining <= 0) {
      setError("You can upload a maximum of 5 images.");
      e.target.value = "";
      return;
    }

    const filesToAdd = imageFiles.slice(0, remaining);

    const newItems = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: "image",
    }));

    setMediaItems((prev) => [...prev, ...newItems]);

    if (imageFiles.length > remaining) {
      setError(
        `Only ${remaining} more image${
          remaining === 1 ? "" : "s"
        } can be added.`
      );
    } else {
      setError("");
    }

    e.target.value = "";
  };

  // ==========================================================
  // VIDEO UPLOAD
  // ==========================================================

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      e.target.value = "";
      return;
    }

    const existingVideo = mediaItems.some(
      (item) => item.type === "video"
    );

    if (existingVideo) {
      setError("You can upload only one video.");
      e.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Video must be smaller than 50MB.");
      e.target.value = "";
      return;
    }

    setMediaItems((prev) => [
      ...prev,
      {
        file,
        preview: URL.createObjectURL(file),
        type: "video",
      },
    ]);

    setError("");
    e.target.value = "";
  };

  // ==========================================================
  // REMOVE MEDIA
  // ==========================================================

  const removeMedia = (index) => {
    const item = mediaItems[index];

    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }

    setMediaItems((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ==========================================================
  // STEP 1 VALIDATION
  // ==========================================================

  const goToNextStep = () => {
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter an ad title.");
      return;
    }

    if (
      formData.price === "" ||
      formData.price === null ||
      formData.price === undefined
    ) {
      setError("Please enter a price.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Price cannot be negative.");
      return;
    }

    if (!formData.sellerPhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (isLaptop && !formData.brand) {
      setError("Please select a laptop brand.");
      return;
    }

    if (isTablet && !formData.brand) {
      setError("Please select a tablet brand.");
      return;
    }

    if (isAccessory) {
      if (!formData.accessoryType) {
        setError("Please select the accessory type.");
        return;
      }

      if (!formData.brand.trim()) {
        setError("Please enter the accessory brand.");
        return;
      }
    }

    setStep(2);
  };

  // ==========================================================
  // PREVIOUS STEP
  // ==========================================================

  const goToPreviousStep = () => {
    setStep(1);
    setError("");
  };

  // ==========================================================
  // BUILD PRODUCT FORM DATA
  // ==========================================================

  const buildProductFormData = () => {
    const form = new FormData();

    const mappedCategory =
      categoryMap[formData.category] ||
      formData.category;

    // --------------------------------------------------------
    // COMMON FIELDS
    // --------------------------------------------------------

    const baseFields = {
      title: formData.title.trim(),
      price: formData.price,
      category: mappedCategory,
      location: formData.location,

      description: formData.description.trim(),

      sellerName: formData.sellerName.trim(),
      sellerPhone: formData.sellerPhone.trim(),

      brand: formData.brand.trim(),
      model: formData.model.trim(),
      color: formData.color.trim(),

      condition: formData.condition,
      warranty: formData.warranty,

      negotiation: String(formData.negotiation),
      swapAccepted: String(formData.swapAccepted),
    };

    // --------------------------------------------------------
    // PHONE ONLY
    // --------------------------------------------------------

    if (isPhone) {
      if (formData.storage) {
        baseFields.storage = formData.storage;
      }

      if (formData.batteryHealth !== "") {
        baseFields.batteryHealth =
          String(formData.batteryHealth);
      }

      if (formData.faceId) {
        baseFields.faceId = formData.faceId;
      }

      if (formData.simStatus) {
        baseFields.simStatus = formData.simStatus;
      }
    }

    // --------------------------------------------------------
    // LAPTOP ONLY
    // --------------------------------------------------------

    if (isLaptop) {
      baseFields.processor =
        formData.processor.trim();

      baseFields.ram =
        formData.ram.trim();

      baseFields.storage =
        formData.storage.trim();

      baseFields.screenSize =
        formData.screenSize.trim();

      baseFields.graphics =
        formData.graphics.trim();
    }

    // --------------------------------------------------------
    // TABLET ONLY
    // --------------------------------------------------------

    if (isTablet) {
      if (formData.storage) {
        baseFields.storage = formData.storage;
      }

      if (formData.year) {
        baseFields.year = formData.year;
      }

      if (formData.connectivity) {
        baseFields.connectivity =
          formData.connectivity;
      }

      if (formData.screenSize) {
        baseFields.screenSize =
          formData.screenSize;
      }
    }

    // --------------------------------------------------------
    // ACCESSORY ONLY
    // --------------------------------------------------------

    if (isAccessory) {
      baseFields.accessoryType =
        formData.accessoryType;

      if (formData.compatibility) {
        baseFields.compatibility =
          formData.compatibility;
      }

      /*
       * IMPORTANT:
       * Product.js currently does not have accessoryColor
       * or accessoryMaterial fields.
       *
       * Therefore we store accessory color in the normal
       * "color" field and accessory material in "material".
       */

      if (formData.accessoryColor) {
        baseFields.color =
          formData.accessoryColor.trim();
      }

      if (formData.accessoryMaterial) {
        baseFields.material =
          formData.accessoryMaterial.trim();
      }
    }

    // --------------------------------------------------------
    // APPEND TEXT FIELDS
    // --------------------------------------------------------

    Object.entries(baseFields).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          form.append(key, value);
        }
      }
    );

    // --------------------------------------------------------
    // APPEND MEDIA
    // --------------------------------------------------------

    mediaItems.forEach((item) => {
      if (item?.file) {
        form.append("files", item.file);
      }
    });

    return form;
  };

  // ==========================================================
  // SUBMIT AD
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!token) {
      setError(
        "You are not authenticated. Please log in again."
      );
      return;
    }

    // --------------------------------------------------------
    // MEDIA
    // --------------------------------------------------------

    const imageCount = mediaItems.filter(
      (item) => item.type === "image"
    ).length;

    if (imageCount === 0) {
      setError(
        "Please upload at least one image for your ad."
      );
      setStep(1);
      return;
    }

    // --------------------------------------------------------
    // LAPTOP VALIDATION
    // --------------------------------------------------------

    if (isLaptop) {
      if (!formData.model.trim()) {
        setError("Please select a laptop model.");
        return;
      }

      const requiredFields = [
        "processor",
        "ram",
        "storage",
        "screenSize",
        "graphics",
      ];

      const missing = requiredFields.filter(
        (field) =>
          !String(formData[field] || "").trim()
      );

      if (missing.length > 0) {
        setError(
          `Please fill in: ${missing.join(", ")}`
        );
        return;
      }
    }

    // --------------------------------------------------------
    // TABLET VALIDATION
    // --------------------------------------------------------

    if (isTablet) {
      if (!formData.model.trim()) {
        setError("Please select a tablet model.");
        return;
      }
    }

    // --------------------------------------------------------
    // ACCESSORY VALIDATION
    // --------------------------------------------------------

    if (isAccessory) {
      if (!formData.accessoryType) {
        setError("Please select an accessory type.");
        return;
      }

      if (!formData.brand.trim()) {
        setError("Please enter the accessory brand.");
        return;
      }
    }

    // --------------------------------------------------------
    // START SUBMIT
    // --------------------------------------------------------

    setIsSubmitting(true);

    try {
      const form = buildProductFormData();

      console.log("📤 Posting product:", {
        category:
          categoryMap[formData.category] ||
          formData.category,

        title: formData.title,

        brand: formData.brand,

        model: formData.model,

        simStatus: isPhone
          ? formData.simStatus || "NOT SET"
          : "NOT SENT",

        accessoryType: isAccessory
          ? formData.accessoryType
          : "NOT SENT",

        images: mediaItems.filter(
          (item) => item.type === "image"
        ).length,

        videos: mediaItems.filter(
          (item) => item.type === "video"
        ).length,
      });

      const data =
        await createProductWithFiles(
          form,
          token
        );

      console.log(
        "✅ Product upload response:",
        data
      );

      if (data?.product) {
        // Clean previews
        mediaItems.forEach((item) => {
          if (item.preview) {
            URL.revokeObjectURL(item.preview);
          }
        });

        // Go to products
        navigate("/products");
        return;
      }

      setError(
        data?.message ||
          "Failed to post ad."
      );
    } catch (err) {
      console.error(
        "❌ Post ad error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================
  // AUTH SUBMIT
  // ==========================================================

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    setAuthError("");
    setAuthLoading(true);

    try {
      let result;

      if (authMode === "login") {
        result = await login(
          authEmail,
          authPassword
        );
      } else {
        result = await register({
          name: authName,
          email: authEmail,
          password: authPassword,
          phone: authPhone,
        });
      }

      if (result?.success) {
        setShowAuthModal(false);

        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
        setAuthPhone("");
        setAuthError("");
      } else {
        setAuthError(
          result?.error ||
            "Authentication failed."
        );
      }
    } catch (err) {
      setAuthError(
        err?.message ||
          "Something went wrong."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================================
  // AUTH MODE
  // ==========================================================

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setAuthError("");
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError("");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="post-ad-container">

      <h2>📢 Post Free Ad</h2>

      <p className="subtitle">
        {step === 1
          ? "Step 1 of 2 – Basic details"
          : "Step 2 of 2 – Additional details"}
      </p>

      {/* ERROR */}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ==================================================
            STEP 1
        ================================================== */}

        {step === 1 && (
          <>

            {/* CATEGORY */}

            <div className="form-group">
              <label>
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="phones">
                  📱 Phones
                </option>

                <option value="laptops">
                  💻 Laptops
                </option>

                <option value="tablets">
                  📲 Tablets
                </option>

                <option value="accessories">
                  🎧 Accessories
                </option>

                <option value="electronics">
                  📺 Electronics
                </option>
              </select>
            </div>

            {/* ACCESSORY TYPE */}

            {isAccessory && (
              <div className="form-group">
                <label>
                  Accessory Type *
                </label>

                <select
                  name="accessoryType"
                  value={formData.accessoryType}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select accessory
                  </option>

                  {ACCESSORY_TYPES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {/* LAPTOP BRAND */}

            {isLaptop && (
              <div className="form-group">
                <label>
                  Laptop Brand *
                </label>

                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select brand
                  </option>

                  {LAPTOP_BRANDS.map(
                    (brand) => (
                      <option
                        key={brand}
                        value={brand}
                      >
                        {brand}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {/* TABLET BRAND */}

            {isTablet && (
              <div className="form-group">
                <label>
                  Tablet Brand *
                </label>

                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select brand
                  </option>

                  {TABLET_BRANDS.map(
                    (brand) => (
                      <option
                        key={brand}
                        value={brand}
                      >
                        {brand}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {/* ACCESSORY BRAND */}

            {isAccessory && (
              <div className="form-group">
                <label>
                  Brand *
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Apple, Samsung, Anker"
                  required
                />
              </div>
            )}

            {/* TITLE */}

            <div className="form-group">
              <label>
                Ad Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={
                  isAccessory
                    ? "e.g. Original Apple 20W Charger"
                    : "e.g. iPhone 15 Pro Max 256GB"
                }
                maxLength={200}
                required
              />
            </div>

            {/* PRICE */}

            <div className="form-group">
              <label>
                Price (GH₵) *
              </label>

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* LOCATION */}

            <div className="form-group">
              <label>
                Location *
              </label>

              <select
                value={selectedCountry}
                onChange={handleCountryChange}
              >
                {countries.map(
                  (country) => (
                    <option
                      key={country}
                      value={country}
                    >
                      {country}
                    </option>
                  )
                )}
              </select>

              <select
                value={selectedRegion}
                onChange={handleRegionChange}
              >
                <option value="">
                  Select Region
                </option>

                {regions.map(
                  (region) => (
                    <option
                      key={region}
                      value={region}
                    >
                      {region}
                    </option>
                  )
                )}
              </select>

              <select
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedRegion}
              >
                <option value="">
                  Select City
                </option>

                {selectedRegion &&
                  citiesByRegion[
                    selectedRegion
                  ]?.map((city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  ))}
              </select>

              <span className="hint">
                Your ad will appear as:{" "}
                <strong>
                  {formData.location}
                </strong>
              </span>
            </div>

            {/* SELLER NAME */}

            <div className="form-group">
              <label>
                Your Name
              </label>

              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            {/* PHONE */}

            <div className="form-group">
              <label>
                Phone Number *
              </label>

              <input
                type="tel"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="054 123 4567"
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                maxLength={5000}
                placeholder={
                  isAccessory
                    ? "Describe the accessory, compatibility, condition, what's included, etc."
                    : "Describe your item..."
                }
              />

              <span className="hint">
                {formData.description.length}/5000
              </span>
            </div>

            {/* IMAGES */}

            <div className="form-group">
              <label>
                Upload Images *
              </label>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
              />

              <span className="hint">
                Upload up to 5 images.
                At least 1 image is required.
              </span>
            </div>

            {/* VIDEO */}

            <div className="form-group">
              <label>
                Upload Video
              </label>

              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleVideoChange}
              />

              <span className="hint">
                Optional. MP4, MOV, AVI or WEBM.
                Maximum 50MB.
              </span>
            </div>

            {/* MEDIA PREVIEW */}

            {mediaItems.length > 0 && (
              <div className="media-grid">

                {mediaItems.map(
                  (item, index) => (
                    <div
                      key={`${item.file.name}-${index}`}
                      className="media-item"
                    >

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() =>
                          removeMedia(index)
                        }
                      >
                        ✕
                      </button>

                      {item.type === "video" ? (
                        <video
                          src={item.preview}
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <img
                          src={item.preview}
                          alt={`Preview ${index + 1}`}
                        />
                      )}

                      {item.type === "video" && (
                        <span className="video-badge">
                          🎬
                        </span>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

            {/* NEXT */}

            <button
              type="button"
              className="btn-primary"
              onClick={goToNextStep}
            >
              Next: Additional Details →
            </button>
          </>
        )}

        {/* ==================================================
            STEP 2
        ================================================== */}

        {step === 2 && (
          <>

            {/* LAPTOP */}

            {isLaptop && (
              <LaptopForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* TABLET */}

            {isTablet && (
              <TabletForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* PHONE */}

            {isPhone && (
              <>

                {/* STORAGE */}

                <div className="form-group">
                  <label>
                    Storage
                  </label>

                  <select
                    name="storage"
                    value={formData.storage}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select storage
                    </option>

                    <option value="16GB">
                      16GB
                    </option>

                    <option value="32GB">
                      32GB
                    </option>

                    <option value="64GB">
                      64GB
                    </option>

                    <option value="128GB">
                      128GB
                    </option>

                    <option value="256GB">
                      256GB
                    </option>

                    <option value="512GB">
                      512GB
                    </option>

                    <option value="1TB">
                      1TB
                    </option>

                    <option value="2TB">
                      2TB
                    </option>
                  </select>
                </div>

                {/* COLOR */}

                <div className="form-group">
                  <label>
                    Color
                  </label>

                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select color
                    </option>

                    {phoneColors.map(
                      (color) => (
                        <option
                          key={color}
                          value={color}
                        >
                          {color}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* BATTERY HEALTH */}

                <div className="form-group">
                  <label>
                    Battery Health (%)
                  </label>

                  <input
                    type="number"
                    name="batteryHealth"
                    value={formData.batteryHealth}
                    onChange={handleChange}
                    placeholder="e.g. 85"
                    min="0"
                    max="100"
                  />
                </div>

                {/* SIM STATUS */}

                <div className="form-group">
                  <label>
                    SIM Status
                  </label>

                  <select
                    name="simStatus"
                    value={formData.simStatus}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select SIM status
                    </option>

                    <option value="SIM Unlocked">
                      SIM Unlocked
                    </option>

                    <option value="eSIM Unlocked">
                      eSIM Unlocked
                    </option>

                    <option value="Locked">
                      Locked
                    </option>

                    <option value="Bypass">
                      Bypass
                    </option>

                    <option value="Not Available">
                      Not Available
                    </option>
                  </select>
                </div>

                {/* FACE ID */}

                <div className="form-group">
                  <label>
                    Face ID
                  </label>

                  <select
                    name="faceId"
                    value={formData.faceId}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select
                    </option>

                    <option value="Working">
                      Working
                    </option>

                    <option value="Not Working">
                      Not Working
                    </option>

                    <option value="Not Available">
                      Not Available
                    </option>
                  </select>
                </div>

              </>
            )}

            {/* ACCESSORIES */}

            {isAccessory && (
              <>

                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: "18px",
                    }}
                  >
                    🎧 Accessory Details
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Add information buyers need
                    to understand your accessory.
                  </p>
                </div>

                {/* ACCESSORY TYPE */}

                <div className="form-group">
                  <label>
                    Accessory Type *
                  </label>

                  <select
                    name="accessoryType"
                    value={formData.accessoryType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select accessory
                    </option>

                    {ACCESSORY_TYPES.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* COMPATIBILITY */}

                <div className="form-group">
                  <label>
                    Compatibility
                  </label>

                  <select
                    name="compatibility"
                    value={formData.compatibility}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select compatibility
                    </option>

                    {ACCESSORY_COMPATIBILITY.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* COMPATIBLE MODEL */}

                <div className="form-group">
                  <label>
                    Compatible Model
                  </label>

                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. iPhone 15 Pro"
                  />
                </div>

                {/* ACCESSORY COLOR */}

                <div className="form-group">
                  <label>
                    Color
                  </label>

                  <input
                    type="text"
                    name="accessoryColor"
                    value={formData.accessoryColor}
                    onChange={handleChange}
                    placeholder="e.g. Black"
                  />
                </div>

                {/* MATERIAL */}

                <div className="form-group">
                  <label>
                    Material
                  </label>

                  <input
                    type="text"
                    name="accessoryMaterial"
                    value={formData.accessoryMaterial}
                    onChange={handleChange}
                    placeholder="e.g. Silicone, Leather, Aluminum"
                  />
                </div>

              </>
            )}

            {/* GENERIC ELECTRONICS */}

            {!isPhone &&
              !isLaptop &&
              !isTablet &&
              !isAccessory && (
                <>
                  <div className="form-group">
                    <label>
                      Brand
                    </label>

                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Brand"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Model
                    </label>

                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Model"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Color
                    </label>

                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      placeholder="Color"
                    />
                  </div>
                </>
              )}

            {/* CONDITION */}

            <div className="form-group">
              <label>
                Condition
              </label>

              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                {CONDITIONS.map(
                  (condition) => (
                    <option
                      key={condition}
                      value={condition}
                    >
                      {condition}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* WARRANTY */}

            <div className="form-group">
              <label>
                Warranty Period
              </label>

              <select
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
              >
                <option value="">
                  No warranty
                </option>

                <option value="1 week">
                  1 week
                </option>

                <option value="2 weeks">
                  2 weeks
                </option>

                <option value="3 weeks">
                  3 weeks
                </option>

                <option value="1 month">
                  1 month
                </option>

                <option value="3 months">
                  3 months
                </option>

                <option value="6 months">
                  6 months
                </option>

                <option value="1 year">
                  1 year
                </option>
              </select>
            </div>

            {/* NEGOTIATION */}

            <div className="form-group">
              <label>
                Negotiation
              </label>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="negotiation"
                  checked={formData.negotiation}
                  onChange={handleCheckboxChange}
                />

                <span>
                  Price is negotiable
                </span>
              </div>
            </div>

            {/* SWAP */}

            <div className="form-group">
              <label>
                Swap Accepted
              </label>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="swapAccepted"
                  checked={formData.swapAccepted}
                  onChange={handleCheckboxChange}
                />

                <span>
                  I accept trades / swaps
                </span>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="step-buttons">

              <button
                type="button"
                className="btn-outline"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  flex: 2,
                }}
              >
                {isSubmitting
                  ? "Publishing..."
                  : "Publish Ad →"}
              </button>

            </div>

          </>
        )}
      </form>

      {/* ========================================================
          AUTH MODAL
      ======================================================== */}

      {showAuthModal && (
        <div
          className="auth-overlay"
          onClick={closeAuthModal}
        >
          <div
            className="auth-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="close-btn"
              onClick={closeAuthModal}
            >
              &times;
            </button>

            <h2>
              {authMode === "login"
                ? "Welcome Back 👋"
                : "Join KN Classifieds 🚀"}
            </h2>

            <p className="auth-subtitle">
              {authMode === "login"
                ? "Login to publish your ad"
                : "Create an account to publish your ad"}
            </p>

            {authError && (
              <div className="error-banner">
                {authError}
              </div>
            )}

            <form
              onSubmit={handleAuthSubmit}
            >

              {/* REGISTER NAME */}

              {authMode === "register" && (
                <div className="form-group">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={authName}
                    onChange={(e) =>
                      setAuthName(
                        e.target.value
                      )
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              {/* EMAIL */}

              <div className="form-group">
                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) =>
                    setAuthEmail(
                      e.target.value
                    )
                  }
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="form-group">
                <label>
                  Password
                </label>

                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) =>
                    setAuthPassword(
                      e.target.value
                    )
                  }
                  placeholder={
                    authMode === "login"
                      ? "Enter your password"
                      : "Min 6 characters"
                  }
                  required
                  minLength="6"
                />
              </div>

              {/* REGISTER PHONE */}

              {authMode === "register" && (
                <div className="form-group">
                  <label>
                    Phone (optional)
                  </label>

                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) =>
                      setAuthPhone(
                        e.target.value
                      )
                    }
                    placeholder="054 123 4567"
                  />
                </div>
              )}

              {/* SUBMIT */}

              <button
                type="submit"
                className={
                  authMode === "login"
                    ? "btn-primary"
                    : "btn-secondary"
                }
                disabled={authLoading}
              >
                {authLoading
                  ? authMode === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : authMode === "login"
                  ? "Log In →"
                  : "Create Account →"}
              </button>

            </form>

            {/* AUTH SWITCH */}

            <div className="auth-footer">

              {authMode === "login" ? (
                <>
                  No account?{" "}
                  <span
                    onClick={() =>
                      switchAuthMode(
                        "register"
                      )
                    }
                  >
                    Create free account
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() =>
                      switchAuthMode(
                        "login"
                      )
                    }
                  >
                    Sign in
                  </span>
                </>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PostAd;