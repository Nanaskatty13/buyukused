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

import GameConsoleForm from "../components/GameConsoleForm";
import AppleWatchForm from "../components/AppleWatchForm";
import TVForm from "../components/TVForm";
import CarForm from "../components/CarForm";

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
  Ahafo: [
    "Goaso",
    "Mim",
    "Hwidiem",
    "Bechem",
    "Kenyasi",
    "Duayaw Nkwanta",
    "Tepa",
  ],

  Ashanti: [
    "Kumasi",
    "Obuasi",
    "Tafo",
    "Bekwai",
    "Mampong",
    "Konongo",
    "Ejura",
    "Agogo",
    "Offinso",
    "Nkawie",
    "Oforikrom",
    "Asokore Mampong",
    "Suame",
    "Atwima",
    "Kwadaso",
    "Bantama",
    "Adum",
    "Bohyen",
    "Domeabra",
    "Mpatuam",
    "Effiduase",
    "Juaso",
    "Nhyiaeso",
    "Tepa",
    "Duayaw Nkwanta",
    "Kenyasi",
    "Kukuom",
    "Fomena",
    "Ahensan",
  ],

  Bono: [
    "Sunyani",
    "Berekum",
    "Dormaa Ahenkro",
    "Kintampo",
    "Japekrom",
    "Nsoatre",
    "Odumase",
    "Drobo",
  ],

  "Bono East": [
    "Techiman",
    "Yeji",
    "Kintampo",
    "Atebubu",
    "Pru",
    "Kwame Danso",
    "Sampa",
    "Badu",
    "Tuobodom",
  ],

  Central: [
    "Cape Coast",
    "Elmina",
    "Kasoa",
    "Winneba",
    "Mfantseman",
    "Abura Dunkwa",
    "Assin Fosu",
    "Asikuma",
    "Ajumako",
    "Awutu",
    "Bawjiase",
    "Senya Beraku",
    "Gomoa Fetteh",
    "Budumburam",
  ],

  Eastern: [
    "Koforidua",
    "Nkawkaw",
    "Oda",
    "Asamankese",
    "Akwatia",
    "Kibi",
    "Suhum",
    "Mpraeso",
    "Somanya",
    "Odumase",
    "Aburi",
    "Nsawam",
    "Akropong",
    "Begoro",
    "Hohoe",
    "Kpando",
    "Ho",
    "Peki",
    "Denu",
    "Aflao",
    "Keta",
  ],

  "Greater Accra": [
    "Accra",
    "Tema",
    "Ashaiman",
    "Madina",
    "Adenta",
    "Dansoman",
    "Kaneshie",
    "Osu",
    "Labone",
    "Labadi",
    "Dzorwulu",
    "Achimota",
    "Legon",
    "Okponglo",
    "Bawaleshie",
    "Nungua",
    "Teshie",
    "Sakumono",
    "Spintex",
    "Lashibi",
    "East Legon",
    "West Legon",
    "Dodowa",
    "Prampram",
    "Afienya",
    "Tema New Town",
    "Amasaman",
    "Weija",
    "Gbawe",
    "Mallam",
    "Bortianor",
    "Ablekuma",
    "Korle Bu",
    "Mamprobi",
    "Chorkor",
    "James Town",
    "Ussher Town",
    "Adabraka",
    "Asylum Down",
    "Cantoments",
    "Airport",
  ],

  "North East": [
    "Nalerigu",
    "Walewale",
    "Bawku",
    "Gambaga",
    "Bunkpurugu",
    "Yunyoo",
    "Chereponi",
  ],

  Northern: [
    "Tamale",
    "Savelugu",
    "Yendi",
    "Dalun",
    "Kpatinga",
    "Gushegu",
    "Karaga",
    "Zabzugu",
    "Tolon",
    "Kumbungu",
  ],

  Oti: [
    "Dambai",
    "Kpando",
    "Jasikan",
    "Nkwanta",
    "Brewaniase",
    "Worawora",
    "Gbi",
    "Apesokubi",
  ],

  Savannah: [
    "Damongo",
    "Bole",
    "Salaga",
    "Yapei",
    "Sawla",
    "Larabanga",
    "Daboya",
  ],

  "Upper East": [
    "Bolgatanga",
    "Bawku",
    "Navrongo",
    "Paga",
    "Sandema",
    "Zuarungu",
    "Tongo",
    "Garu",
    "Tempane",
    "Pusiga",
  ],

  "Upper West": [
    "Wa",
    "Jirapa",
    "Lawra",
    "Nandom",
    "Tumu",
    "Gwollu",
    "Kaleo",
    "Dere",
    "Duori",
  ],

  Volta: [
    "Ho",
    "Hohoe",
    "Keta",
    "Aflao",
    "Kpando",
    "Sogakope",
    "Anloga",
    "Kpedze",
    "Denu",
    "Akatsi",
    "Abor",
    "Dzodze",
    "Anyako",
    "Togoville",
    "Kedzi",
    "Agbledomi",
    "Klikor",
  ],

  Western: [
    "Sekondi",
    "Takoradi",
    "Tarkwa",
    "Shama",
    "Essikado",
    "Aboadze",
    "Fijai",
    "Effiakuma",
    "Kwesimintim",
    "Nkroful",
    "Axim",
    "Half Assini",
    "Agona",
    "Anyinam",
    "Enchi",
    "Juaboso",
  ],

  "Western North": [
    "Sefwi Wiawso",
    "Sefwi Debiso",
    "Bibiani",
    "Awiaso",
    "Asafo",
    "Sefwi Bekwai",
    "Akontombra",
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

// ============================================================
// COSMETICS OPTIONS
// ============================================================

const COSMETIC_TYPES = [
  "Makeup",
  "Skincare",
  "Haircare",
  "Fragrance",
  "Body Care",
  "Bath & Shower",
  "Nail Care",
  "Lip Care",
  "Sun Care",
  "Men's Grooming",
  "Women's Grooming",
  "Beauty Tools",
  "Personal Care",
  "Other",
];

const COSMETIC_SKIN_TYPES = [
  "All Skin Types",
  "Normal",
  "Dry",
  "Oily",
  "Combination",
  "Sensitive",
  "Acne-Prone",
  "Mature",
];

const COSMETIC_CONCERNS = [
  "None",
  "Acne",
  "Dark Spots",
  "Hyperpigmentation",
  "Dryness",
  "Oil Control",
  "Aging",
  "Fine Lines",
  "Dullness",
  "Uneven Skin Tone",
  "Sun Damage",
  "Hair Growth",
  "Hair Damage",
  "Other",
];

const COSMETIC_FINISHES = [
  "Natural",
  "Matte",
  "Dewy",
  "Glossy",
  "Satin",
  "Shimmer",
  "Metallic",
  "Cream",
  "Other",
];

const COSMETIC_COVERAGE = [
  "Sheer",
  "Light",
  "Medium",
  "Full",
  "Buildable",
  "Not Applicable",
];

const COSMETIC_SIZES = [
  "Travel Size",
  "Mini",
  "Small",
  "Medium",
  "Large",
  "Full Size",
  "Professional Size",
];

const COSMETIC_GENDERS = [
  "Unisex",
  "Women",
  "Men",
  "Children",
  "Babies",
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
  // MULTI-SELECT PHONE STATE
  // ==========================================================

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState([]);

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] = useState({
    // --------------------------------------------------------
    // BASIC
    // --------------------------------------------------------

    title: "",
    price: "",
    category: "electronics",
    location: "Ghana",
    description: "",

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    sellerName: "",
    sellerPhone: "",

    // --------------------------------------------------------
    // GENERAL
    // --------------------------------------------------------

    brand: "",
    model: "",
    color: "",
    condition: "Good",
    warranty: "",

    // --------------------------------------------------------
    // SELLING
    // --------------------------------------------------------

    negotiation: false,
    swapAccepted: false,

    // --------------------------------------------------------
    // PHONE
    // --------------------------------------------------------

    storage: "",
    batteryHealth: "",
    faceId: "",
    simStatus: "",

    // --------------------------------------------------------
    // LAPTOP
    // --------------------------------------------------------

    processor: "",
    ram: "",
    screenSize: "",
    graphics: "",

    // --------------------------------------------------------
    // TABLET
    // --------------------------------------------------------

    year: "",
    connectivity: "",

    // --------------------------------------------------------
    // ACCESSORIES
    // --------------------------------------------------------

    accessoryType: "",
    compatibility: "",
    accessoryColor: "",
    accessoryMaterial: "",

    // --------------------------------------------------------
    // GAME CONSOLE
    // --------------------------------------------------------

    consoleType: "",
    edition: "",
    discDrive: "",
    controllersIncluded: "",
    battery: "",
    resolution: "",
    videoOutput: "",

    // --------------------------------------------------------
    // SMARTWATCH
    // --------------------------------------------------------

    watchSize: "",

    // --------------------------------------------------------
    // TV
    // --------------------------------------------------------

    tvType: "",
    displayTechnology: "",
    refreshRate: "",
    operatingSystem: "",
    hdr: "",
    hdmiPorts: "",
    usbPorts: "",
    smartTV: false,
    voiceControl: false,
    wallMountable: false,

    // --------------------------------------------------------
    // CAR
    // --------------------------------------------------------

    mileage: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    driveType: "",
    engineSize: "",
    seatingCapacity: "",
    exteriorColor: "",
    interiorColor: "",

    // ========================================================
    // COSMETICS
    // ========================================================

    cosmeticType: "",
    cosmeticBrand: "",
    productLine: "",
    shade: "",
    skinType: "",
    skinConcern: "",
    finish: "",
    coverage: "",
    cosmeticSize: "",
    volume: "",
    scent: "",
    ingredients: "",
    expirationDate: "",
    batchNumber: "",
    cosmeticGender: "Unisex",
    suitableFor: "",
    sealed: false,
    authentic: true,
    crueltyFree: false,
    vegan: false,
    parabenFree: false,
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
    gameConsoles: "Game Consoles",
    smartwatches: "Smartwatches",
    tvs: "TVs",
    cars: "Cars",
    cosmetics: "Cosmetics",
  };

  // ==========================================================
  // CATEGORY FLAGS
  // ==========================================================

  const isPhone = formData.category === "phones";
  const isLaptop = formData.category === "laptops";
  const isTablet = formData.category === "tablets";
  const isAccessory = formData.category === "accessories";

  const isGameConsole =
    formData.category === "gameConsoles";

  const isSmartwatch =
    formData.category === "smartwatches";

  const isTV = formData.category === "tvs";

  const isCar = formData.category === "cars";

  const isCosmetics =
    formData.category === "cosmetics";

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
  }, [
    selectedCountry,
    selectedRegion,
    selectedCity,
  ]);

  // ==========================================================
  // MEDIA CLEANUP
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
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================================
  // CHECKBOX CHANGE
  // ==========================================================

  const handleCheckboxChange = (e) => {
    const {
      name,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ==========================================================
  // PHONE COLOR MULTI SELECT
  // ==========================================================

  const handleColorChange = (e) => {
    const value = e.target.value;

    if (!value) {
      return;
    }

    setSelectedColors((prev) => {
      if (prev.includes(value)) {
        return prev;
      }

      const updated = [
        ...prev,
        value,
      ];

      setFormData((current) => ({
        ...current,
        color: updated.join(", "),
      }));

      return updated;
    });

    e.target.value = "";
  };

  // ==========================================================
  // REMOVE COLOR
  // ==========================================================

  const removeColor = (colorToRemove) => {
    setSelectedColors((prev) => {
      const updated = prev.filter(
        (color) =>
          color !== colorToRemove
      );

      setFormData((current) => ({
        ...current,
        color: updated.join(", "),
      }));

      return updated;
    });
  };

  // ==========================================================
  // STORAGE MULTI SELECT
  // ==========================================================

  const handleStorageChange = (e) => {
    const value = e.target.value;

    if (!value) {
      return;
    }

    setSelectedStorage((prev) => {
      if (prev.includes(value)) {
        return prev;
      }

      const updated = [
        ...prev,
        value,
      ];

      setFormData((current) => ({
        ...current,
        storage: updated.join(", "),
      }));

      return updated;
    });

    e.target.value = "";
  };

  // ==========================================================
  // REMOVE STORAGE
  // ==========================================================

  const removeStorage = (storageToRemove) => {
    setSelectedStorage((prev) => {
      const updated = prev.filter(
        (storage) =>
          storage !== storageToRemove
      );

      setFormData((current) => ({
        ...current,
        storage: updated.join(", "),
      }));

      return updated;
    });
  };

  // ==========================================================
  // CATEGORY CHANGE
  // ==========================================================

  const handleCategoryChange = (e) => {
    const category = e.target.value;

    setFormData((prev) => ({
      ...prev,

      category,

      // ------------------------------------------------------
      // PHONE
      // ------------------------------------------------------

      ...(category !== "phones"
        ? {
            simStatus: "",
            batteryHealth: "",
            faceId: "",
          }
        : {}),

      // ------------------------------------------------------
      // LAPTOP
      // ------------------------------------------------------

      ...(category !== "laptops"
        ? {
            processor: "",
            ram: "",
            screenSize: "",
            graphics: "",
          }
        : {}),

      // ------------------------------------------------------
      // TABLET
      // ------------------------------------------------------

      ...(category !== "tablets"
        ? {
            year: "",
            connectivity: "",
          }
        : {}),

      // ------------------------------------------------------
      // ACCESSORY
      // ------------------------------------------------------

      ...(category !== "accessories"
        ? {
            accessoryType: "",
            compatibility: "",
            accessoryColor: "",
            accessoryMaterial: "",
          }
        : {}),

      // ------------------------------------------------------
      // GAME CONSOLE
      // ------------------------------------------------------

      ...(category !== "gameConsoles"
        ? {
            consoleType: "",
            edition: "",
            discDrive: "",
            controllersIncluded: "",
            battery: "",
            resolution: "",
            videoOutput: "",
          }
        : {}),

      // ------------------------------------------------------
      // SMARTWATCH
      // ------------------------------------------------------

      ...(category !== "smartwatches"
        ? {
            watchSize: "",
          }
        : {}),

      // ------------------------------------------------------
      // TV
      // ------------------------------------------------------

      ...(category !== "tvs"
        ? {
            tvType: "",
            displayTechnology: "",
            refreshRate: "",
            operatingSystem: "",
            hdr: "",
            hdmiPorts: "",
            usbPorts: "",
            smartTV: false,
            voiceControl: false,
            wallMountable: false,
          }
        : {}),

      // ------------------------------------------------------
      // CAR
      // ------------------------------------------------------

      ...(category !== "cars"
        ? {
            mileage: "",
            bodyType: "",
            fuelType: "",
            transmission: "",
            driveType: "",
            engineSize: "",
            seatingCapacity: "",
            exteriorColor: "",
            interiorColor: "",
          }
        : {}),

      // ======================================================
      // COSMETICS
      // ======================================================

      ...(category !== "cosmetics"
        ? {
            cosmeticType: "",
            cosmeticBrand: "",
            productLine: "",
            shade: "",
            skinType: "",
            skinConcern: "",
            finish: "",
            coverage: "",
            cosmeticSize: "",
            volume: "",
            scent: "",
            ingredients: "",
            expirationDate: "",
            batchNumber: "",
            cosmeticGender: "Unisex",
            suitableFor: "",
            sealed: false,
            authentic: true,
            crueltyFree: false,
            vegan: false,
            parabenFree: false,
          }
        : {}),
    }));

    if (category !== "phones") {
      setSelectedColors([]);
      setSelectedStorage([]);

      setFormData((prev) => ({
        ...prev,
        color: "",
        storage: "",
      }));
    }

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
    const selected = Array.from(
      e.target.files || []
    );

    if (!selected.length) {
      return;
    }

    const imageFiles = selected.filter(
      (file) =>
        file.type.startsWith("image/")
    );

    if (!imageFiles.length) {
      setError(
        "Please select valid image files."
      );

      e.target.value = "";
      return;
    }

    const existingImages =
      mediaItems.filter(
        (item) =>
          item.type === "image"
      ).length;

    const remaining =
      5 - existingImages;

    if (remaining <= 0) {
      setError(
        "You can upload a maximum of 5 images."
      );

      e.target.value = "";
      return;
    }

    const filesToAdd =
      imageFiles.slice(
        0,
        remaining
      );

    const newItems =
      filesToAdd.map(
        (file) => ({
          file,
          preview:
            URL.createObjectURL(
              file
            ),
          type: "image",
        })
      );

    setMediaItems((prev) => [
      ...prev,
      ...newItems,
    ]);

    if (
      imageFiles.length >
      remaining
    ) {
      setError(
        `Only ${remaining} more image${
          remaining === 1
            ? ""
            : "s"
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
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "video/"
      )
    ) {
      setError(
        "Please select a valid video file."
      );

      e.target.value = "";
      return;
    }

    const existingVideo =
      mediaItems.some(
        (item) =>
          item.type === "video"
      );

    if (existingVideo) {
      setError(
        "You can upload only one video."
      );

      e.target.value = "";
      return;
    }

    if (
      file.size >
      50 * 1024 * 1024
    ) {
      setError(
        "Video must be smaller than 50MB."
      );

      e.target.value = "";
      return;
    }

    setMediaItems((prev) => [
      ...prev,
      {
        file,
        preview:
          URL.createObjectURL(
            file
          ),
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
    const item =
      mediaItems[index];

    if (item?.preview) {
      URL.revokeObjectURL(
        item.preview
      );
    }

    setMediaItems((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  // ==========================================================
  // STEP 1 VALIDATION
  // ==========================================================

  const goToNextStep = () => {
    setError("");

    if (
      !formData.title.trim()
    ) {
      setError(
        "Please enter an ad title."
      );
      return;
    }

    if (
      formData.price === "" ||
      formData.price === null ||
      formData.price === undefined
    ) {
      setError(
        "Please enter a price."
      );
      return;
    }

    if (
      Number(formData.price) < 0
    ) {
      setError(
        "Price cannot be negative."
      );
      return;
    }

    if (
      !formData.sellerPhone.trim()
    ) {
      setError(
        "Please enter your phone number."
      );
      return;
    }

    // --------------------------------------------------------
    // LAPTOP
    // --------------------------------------------------------

    if (
      isLaptop &&
      !formData.brand
    ) {
      setError(
        "Please select a laptop brand."
      );
      return;
    }

    // --------------------------------------------------------
    // TABLET
    // --------------------------------------------------------

    if (
      isTablet &&
      !formData.brand
    ) {
      setError(
        "Please select a tablet brand."
      );
      return;
    }

    // --------------------------------------------------------
    // ACCESSORY
    // --------------------------------------------------------

    if (isAccessory) {
      if (
        !formData.accessoryType
      ) {
        setError(
          "Please select the accessory type."
        );
        return;
      }

      if (
        !formData.brand.trim()
      ) {
        setError(
          "Please enter the accessory brand."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // GAME CONSOLE
    // --------------------------------------------------------

    if (
      isGameConsole &&
      !formData.brand
    ) {
      setError(
        "Please select a console brand."
      );
      return;
    }

    // --------------------------------------------------------
    // SMARTWATCH
    // --------------------------------------------------------

    if (
      isSmartwatch &&
      !formData.brand
    ) {
      setError(
        "Please select a smartwatch brand."
      );
      return;
    }

    // --------------------------------------------------------
    // TV
    // --------------------------------------------------------

    if (
      isTV &&
      !formData.brand
    ) {
      setError(
        "Please select a TV brand."
      );
      return;
    }

    // --------------------------------------------------------
    // CAR
    // --------------------------------------------------------

    if (
      isCar &&
      !formData.brand
    ) {
      setError(
        "Please select a car brand."
      );
      return;
    }

    // ========================================================
    // COSMETICS
    // ========================================================

    if (isCosmetics) {
      if (
        !formData.cosmeticType
      ) {
        setError(
          "Please select the cosmetic type."
        );
        return;
      }

      if (
        !formData.brand.trim()
      ) {
        setError(
          "Please enter the cosmetic brand."
        );
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
    const form =
      new FormData();

    const mappedCategory =
      categoryMap[
        formData.category
      ] ||
      formData.category;

    // ========================================================
    // COMMON FIELDS
    // ========================================================

    const baseFields = {
      title:
        formData.title.trim(),

      price:
        formData.price,

      category:
        mappedCategory,

      location:
        formData.location,

      description:
        formData.description.trim(),

      sellerName:
        formData.sellerName.trim(),

      sellerPhone:
        formData.sellerPhone.trim(),

      brand:
        formData.brand.trim(),

      model:
        formData.model.trim(),

      color:
        formData.color.trim(),

      condition:
        formData.condition,

      warranty:
        formData.warranty,

      negotiation:
        String(
          formData.negotiation
        ),

      swapAccepted:
        String(
          formData.swapAccepted
        ),
    };

    // ========================================================
    // PHONE
    // ========================================================

    if (isPhone) {
      if (formData.storage) {
        baseFields.storage =
          formData.storage.trim();
      }

      if (
        formData.batteryHealth !==
        ""
      ) {
        baseFields.batteryHealth =
          String(
            formData.batteryHealth
          );
      }

      if (formData.faceId) {
        baseFields.faceId =
          formData.faceId;
      }

      if (formData.simStatus) {
        baseFields.simStatus =
          formData.simStatus;
      }

      if (formData.color) {
        baseFields.color =
          formData.color.trim();
      }
    }

    // ========================================================
    // LAPTOP
    // ========================================================

    if (isLaptop) {
      baseFields.processor =
        formData.processor.trim();

      baseFields.ram =
        formData.ram.trim();

      if (formData.storage) {
        baseFields.storage =
          formData.storage.trim();
      }

      baseFields.screenSize =
        formData.screenSize.trim();

      baseFields.graphics =
        formData.graphics.trim();
    }

    // ========================================================
    // TABLET
    // ========================================================

    if (isTablet) {
      if (formData.storage) {
        baseFields.storage =
          String(
            formData.storage
          ).trim();
      }

      if (formData.year) {
        baseFields.year =
          formData.year;
      }

      if (
        formData.connectivity
      ) {
        baseFields.connectivity =
          formData.connectivity;
      }

      if (formData.screenSize) {
        baseFields.screenSize =
          formData.screenSize;
      }
    }

    // ========================================================
    // ACCESSORY
    // ========================================================

    if (isAccessory) {
      baseFields.accessoryType =
        formData.accessoryType;

      if (
        formData.compatibility
      ) {
        baseFields.compatibility =
          formData.compatibility;
      }

      if (
        formData.accessoryColor
      ) {
        baseFields.color =
          formData.accessoryColor.trim();
      }

      if (
        formData.accessoryMaterial
      ) {
        baseFields.material =
          formData.accessoryMaterial.trim();
      }
    }

    // ========================================================
    // GAME CONSOLE
    // ========================================================

    if (isGameConsole) {
      const consoleFields = [
        "consoleType",
        "edition",
        "discDrive",
        "controllersIncluded",
        "battery",
        "resolution",
        "videoOutput",
        "ram",
        "screenSize",
        "year",
        "connectivity",
      ];

      consoleFields.forEach(
        (field) => {
          if (
            formData[field] &&
            formData[field] !== ""
          ) {
            baseFields[field] =
              formData[field];
          }
        }
      );

      if (formData.storage) {
        baseFields.storage =
          String(
            formData.storage
          ).trim();
      }
    }

    // ========================================================
    // SMARTWATCH
    // ========================================================

    if (isSmartwatch) {
      if (formData.watchSize) {
        baseFields.watchSize =
          formData.watchSize;
      }

      if (
        formData.batteryHealth !==
        ""
      ) {
        baseFields.batteryHealth =
          String(
            formData.batteryHealth
          );
      }

      if (
        formData.connectivity
      ) {
        baseFields.connectivity =
          formData.connectivity;
      }

      if (formData.storage) {
        baseFields.storage =
          String(
            formData.storage
          ).trim();
      }

      if (formData.year) {
        baseFields.year =
          formData.year;
      }
    }

    // ========================================================
    // TV
    // ========================================================

    if (isTV) {
      const tvFields = [
        "tvType",
        "displayTechnology",
        "refreshRate",
        "operatingSystem",
        "hdr",
        "hdmiPorts",
        "usbPorts",
      ];

      tvFields.forEach(
        (field) => {
          if (
            formData[field] &&
            formData[field] !== ""
          ) {
            baseFields[field] =
              formData[field];
          }
        }
      );

      baseFields.smartTV =
        String(
          formData.smartTV
        );

      baseFields.voiceControl =
        String(
          formData.voiceControl
        );

      baseFields.wallMountable =
        String(
          formData.wallMountable
        );

      if (formData.screenSize) {
        baseFields.screenSize =
          formData.screenSize;
      }

      if (formData.resolution) {
        baseFields.resolution =
          formData.resolution;
      }

      if (formData.year) {
        baseFields.year =
          formData.year;
      }

      if (
        formData.connectivity
      ) {
        baseFields.connectivity =
          formData.connectivity;
      }
    }

    // ========================================================
    // CAR
    // ========================================================

    if (isCar) {
      const carFields = [
        "mileage",
        "bodyType",
        "fuelType",
        "transmission",
        "driveType",
        "engineSize",
        "seatingCapacity",
        "exteriorColor",
        "interiorColor",
      ];

      carFields.forEach(
        (field) => {
          if (
            formData[field] &&
            formData[field] !== ""
          ) {
            baseFields[field] =
              formData[field];
          }
        }
      );

      if (formData.year) {
        baseFields.year =
          formData.year;
      }
    }

    // ========================================================
    // COSMETICS
    // ========================================================

    if (isCosmetics) {
      /*
       * Keep the main brand field populated.
       * This allows existing product cards,
       * search and filters to continue using `brand`.
       */

      baseFields.brand =
        formData.brand.trim();

      /*
       * Cosmetics-specific fields.
       */

      baseFields.cosmeticType =
        formData.cosmeticType;

      if (
        formData.cosmeticBrand
      ) {
        baseFields.cosmeticBrand =
          formData.cosmeticBrand.trim();
      }

      if (
        formData.productLine
      ) {
        baseFields.productLine =
          formData.productLine.trim();
      }

      if (formData.shade) {
        baseFields.shade =
          formData.shade.trim();
      }

      if (formData.skinType) {
        baseFields.skinType =
          formData.skinType;
      }

      if (
        formData.skinConcern
      ) {
        baseFields.skinConcern =
          formData.skinConcern;
      }

      if (formData.finish) {
        baseFields.finish =
          formData.finish;
      }

      if (formData.coverage) {
        baseFields.coverage =
          formData.coverage;
      }

      if (
        formData.cosmeticSize
      ) {
        baseFields.cosmeticSize =
          formData.cosmeticSize;
      }

      if (formData.volume) {
        baseFields.volume =
          formData.volume.trim();
      }

      if (formData.scent) {
        baseFields.scent =
          formData.scent.trim();
      }

      if (
        formData.ingredients
      ) {
        baseFields.ingredients =
          formData.ingredients.trim();
      }

      if (
        formData.expirationDate
      ) {
        baseFields.expirationDate =
          formData.expirationDate;
      }

      if (
        formData.batchNumber
      ) {
        baseFields.batchNumber =
          formData.batchNumber.trim();
      }

      if (
        formData.cosmeticGender
      ) {
        baseFields.cosmeticGender =
          formData.cosmeticGender;
      }

      if (
        formData.suitableFor
      ) {
        baseFields.suitableFor =
          formData.suitableFor.trim();
      }

      baseFields.sealed =
        String(
          formData.sealed
        );

      baseFields.authentic =
        String(
          formData.authentic
        );

      baseFields.crueltyFree =
        String(
          formData.crueltyFree
        );

      baseFields.vegan =
        String(
          formData.vegan
        );

      baseFields.parabenFree =
        String(
          formData.parabenFree
        );
    }

    // ========================================================
    // APPEND TEXT FIELDS
    // ========================================================

    Object.entries(
      baseFields
    ).forEach(
      ([key, value]) => {
        if (
          value !==
            undefined &&
          value !== null &&
          value !== ""
        ) {
          form.append(
            key,
            value
          );
        }
      }
    );

    // ========================================================
    // APPEND MEDIA
    // ========================================================

    mediaItems.forEach(
      (item) => {
        if (item?.file) {
          form.append(
            "files",
            item.file
          );
        }
      }
    );

    return form;
  };

  // ==========================================================
  // SUBMIT AD
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --------------------------------------------------------
    // AUTH
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

    const imageCount =
      mediaItems.filter(
        (item) =>
          item.type === "image"
      ).length;

    if (imageCount === 0) {
      setError(
        "Please upload at least one image for your ad."
      );

      setStep(1);
      return;
    }

    // --------------------------------------------------------
    // LAPTOP
    // --------------------------------------------------------

    if (isLaptop) {
      if (
        !formData.model.trim()
      ) {
        setError(
          "Please select a laptop model."
        );
        return;
      }

      const requiredFields = [
        "processor",
        "ram",
        "storage",
        "screenSize",
        "graphics",
      ];

      const missing =
        requiredFields.filter(
          (field) =>
            !String(
              formData[field] ||
                ""
            ).trim()
        );

      if (
        missing.length > 0
      ) {
        setError(
          `Please fill in: ${missing.join(
            ", "
          )}`
        );
        return;
      }
    }

    // --------------------------------------------------------
    // TABLET
    // --------------------------------------------------------

    if (isTablet) {
      if (
        !formData.model.trim()
      ) {
        setError(
          "Please select a tablet model."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // ACCESSORY
    // --------------------------------------------------------

    if (isAccessory) {
      if (
        !formData.accessoryType
      ) {
        setError(
          "Please select an accessory type."
        );
        return;
      }

      if (
        !formData.brand.trim()
      ) {
        setError(
          "Please enter the accessory brand."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // GAME CONSOLE
    // --------------------------------------------------------

    if (isGameConsole) {
      if (
        !formData.model.trim()
      ) {
        setError(
          "Please select a console model."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // SMARTWATCH
    // --------------------------------------------------------

    if (isSmartwatch) {
      if (
        !formData.model.trim()
      ) {
        setError(
          "Please select a smartwatch model."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // TV
    // --------------------------------------------------------

    if (isTV) {
      if (
        !formData.model.trim()
      ) {
        setError(
          "Please select a TV model."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // CAR
    // --------------------------------------------------------

    if (isCar) {
      if (
        !formData.model.trim()
      ) {
        setError(
          "Please select a car model."
        );
        return;
      }
    }

    // ========================================================
    // COSMETICS VALIDATION
    // ========================================================

    if (isCosmetics) {
      if (
        !formData.cosmeticType
      ) {
        setError(
          "Please select the cosmetic type."
        );
        return;
      }

      if (
        !formData.brand.trim()
      ) {
        setError(
          "Please enter the cosmetic brand."
        );
        return;
      }

      if (
        !formData.model.trim()
      ) {
        setError(
          "Please enter the product name or model."
        );
        return;
      }
    }

    // --------------------------------------------------------
    // START SUBMIT
    // --------------------------------------------------------

    setIsSubmitting(true);

    try {
      const form =
        buildProductFormData();

      console.log(
        "📤 Posting product:",
        {
          category:
            form.get(
              "category"
            ),
          title:
            form.get("title"),
          brand:
            form.get("brand"),
          cosmeticType:
            form.get(
              "cosmeticType"
            ),
        }
      );

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
        mediaItems.forEach(
          (item) => {
            if (
              item.preview
            ) {
              URL.revokeObjectURL(
                item.preview
              );
            }
          }
        );

        navigate(
          "/products"
        );

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
        err?.response?.data
          ?.message ||
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

  const handleAuthSubmit =
    async (e) => {
      e.preventDefault();

      setAuthError("");
      setAuthLoading(true);

      try {
        let result;

        if (
          authMode ===
          "login"
        ) {
          result =
            await login(
              authEmail,
              authPassword
            );
        } else {
          result =
            await register({
              name: authName,
              email: authEmail,
              password:
                authPassword,
              phone:
                authPhone,
            });
        }

        if (
          result?.success
        ) {
          setShowAuthModal(
            false
          );

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
        setAuthLoading(
          false
        );
      }
    };

  // ==========================================================
  // AUTH MODE
  // ==========================================================

  const switchAuthMode =
    (mode) => {
      setAuthMode(mode);
      setAuthError("");
    };

  const closeAuthModal =
    () => {
      setShowAuthModal(
        false
      );
      setAuthError("");
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="post-ad-container">
      <h2>
        📢 Post Free Ad
      </h2>

      <p className="subtitle">
        {step === 1
          ? "Step 1 of 2 – Basic details"
          : "Step 2 of 2 – Additional details"}
      </p>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
      >
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
                value={
                  formData.category
                }
                onChange={
                  handleCategoryChange
                }
                required
              >
                <option value="cars">
                  🚗 Cars
                </option>

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

                <option value="gameConsoles">
                  🎮 Game Consoles
                </option>

                <option value="smartwatches">
                  ⌚ Smartwatches
                </option>

                <option value="tvs">
                  📺 TVs
                </option>

                <option value="electronics">
                  🔌 Electronics
                </option>

                <option value="cosmetics">
                  💄 Cosmetics
                </option>
              </select>
            </div>

            {/* ==================================================
                COSMETIC TYPE
            ================================================== */}

            {isCosmetics && (
              <div className="form-group">
                <label>
                  Cosmetic Type *
                </label>

                <select
                  name="cosmeticType"
                  value={
                    formData.cosmeticType
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select cosmetic type
                  </option>

                  {COSMETIC_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {/* ==================================================
                ACCESSORY TYPE
            ================================================== */}

            {isAccessory && (
              <div className="form-group">
                <label>
                  Accessory Type *
                </label>

                <select
                  name="accessoryType"
                  value={
                    formData.accessoryType
                  }
                  onChange={
                    handleChange
                  }
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

            {/* ==================================================
                LAPTOP BRAND
            ================================================== */}

            {isLaptop && (
              <div className="form-group">
                <label>
                  Laptop Brand *
                </label>

                <select
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
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

            {/* ==================================================
                TABLET BRAND
            ================================================== */}

            {isTablet && (
              <div className="form-group">
                <label>
                  Tablet Brand *
                </label>

                <select
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
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

            {/* ==================================================
                CONSOLE BRAND
            ================================================== */}

            {isGameConsole && (
              <div className="form-group">
                <label>
                  Console Brand *
                </label>

                <select
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select brand
                  </option>

                  {[
                    "Sony",
                    "Microsoft",
                    "Nintendo",
                    "Valve",
                    "ASUS",
                    "Lenovo",
                    "AYANEO",
                    "Logitech",
                    "Steam Deck",
                    "Other",
                  ].map(
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

            {/* ==================================================
                SMARTWATCH BRAND
            ================================================== */}

            {isSmartwatch && (
              <div className="form-group">
                <label>
                  Smartwatch Brand *
                </label>

                <select
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select brand
                  </option>

                  {[
                    "Apple",
                    "Samsung",
                    "Garmin",
                    "Fitbit",
                    "Huawei",
                    "Xiaomi",
                    "Amazfit",
                    "Suunto",
                    "Polar",
                    "Other",
                  ].map(
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

            {/* ==================================================
                TV BRAND
            ================================================== */}

            {isTV && (
              <div className="form-group">
                <label>
                  TV Brand *
                </label>

                <select
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select brand
                  </option>

                  {[
                    "Samsung",
                    "LG",
                    "Sony",
                    "TCL",
                    "Hisense",
                    "Philips",
                    "Panasonic",
                    "Toshiba",
                    "Sharp",
                    "Skyworth",
                    "JVC",
                    "Haier",
                    "Xiaomi",
                    "Roku",
                    "Vizio",
                    "Other",
                  ].map(
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

            {/* ==================================================
                CAR BRAND
            ================================================== */}

            {isCar && (
              <div className="form-group">
                <label>
                  Car Brand (Make) *
                </label>

                <select
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select brand
                  </option>

                  {[
                    "Toyota",
                    "Honda",
                    "Ford",
                    "Chevrolet",
                    "Nissan",
                    "Hyundai",
                    "Kia",
                    "Volkswagen",
                    "Mercedes-Benz",
                    "BMW",
                    "Audi",
                    "Lexus",
                    "Subaru",
                    "Mazda",
                    "Jeep",
                    "Land Rover",
                    "Porsche",
                    "Ferrari",
                    "Lamborghini",
                    "Rolls-Royce",
                    "Bentley",
                    "Maserati",
                    "Jaguar",
                    "Volvo",
                    "Alfa Romeo",
                    "Fiat",
                    "Citroën",
                    "Peugeot",
                    "Renault",
                    "Dacia",
                    "Mitsubishi",
                    "Suzuki",
                    "Daihatsu",
                    "Isuzu",
                    "Hino",
                    "Other",
                  ].map(
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

            {/* ==================================================
                ACCESSORY BRAND
            ================================================== */}

            {isAccessory && (
              <div className="form-group">
                <label>
                  Brand *
                </label>

                <input
                  type="text"
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Apple, Samsung, Anker"
                  required
                />
              </div>
            )}

            {/* ==================================================
                COSMETIC BRAND
            ================================================== */}

            {isCosmetics && (
              <div className="form-group">
                <label>
                  Brand *
                </label>

                <input
                  type="text"
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. CeraVe, Maybelline, Nivea, MAC"
                  required
                />
              </div>
            )}

            {/* ==================================================
                TITLE
            ================================================== */}

            <div className="form-group">
              <label>
                Ad Title *
              </label>

              <input
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                placeholder={
                  isCosmetics
                    ? "e.g. CeraVe Hydrating Facial Cleanser 236ml"
                    : isAccessory
                    ? "e.g. Original Apple 20W Charger"
                    : isGameConsole
                    ? "e.g. PlayStation 5 Digital Edition"
                    : isSmartwatch
                    ? "e.g. Apple Watch Series 9 GPS"
                    : isTV
                    ? 'e.g. Samsung 55" Neo QLED 4K Smart TV'
                    : isCar
                    ? "e.g. 2022 Toyota Corolla LE"
                    : "e.g. iPhone 15 Pro Max 256GB"
                }
                maxLength={200}
                required
              />
            </div>

            {/* ==================================================
                PRICE
            ================================================== */}

            <div className="form-group">
              <label>
                Price (GH₵) *
              </label>

              <input
                type="number"
                name="price"
                value={
                  formData.price
                }
                onChange={
                  handleChange
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* ==================================================
                LOCATION
            ================================================== */}

            <div className="form-group">
              <label>
                Location *
              </label>

              <select
                value={
                  selectedCountry
                }
                onChange={
                  handleCountryChange
                }
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
                value={
                  selectedRegion
                }
                onChange={
                  handleRegionChange
                }
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
                value={
                  selectedCity
                }
                onChange={
                  handleCityChange
                }
                disabled={
                  !selectedRegion
                }
              >
                <option value="">
                  Select City
                </option>

                {selectedRegion &&
                  citiesByRegion[
                    selectedRegion
                  ]?.map(
                    (city) => (
                      <option
                        key={city}
                        value={city}
                      >
                        {city}
                      </option>
                    )
                  )}
              </select>

              <span className="hint">
                Your ad will appear as:{" "}
                <strong>
                  {
                    formData.location
                  }
                </strong>
              </span>
            </div>

            {/* ==================================================
                SELLER NAME
            ================================================== */}

            <div className="form-group">
              <label>
                Your Name
              </label>

              <input
                type="text"
                name="sellerName"
                value={
                  formData.sellerName
                }
                onChange={
                  handleChange
                }
                placeholder="Your name"
              />
            </div>

            {/* ==================================================
                PHONE
            ================================================== */}

            <div className="form-group">
              <label>
                Phone Number *
              </label>

              <input
                type="tel"
                name="sellerPhone"
                value={
                  formData.sellerPhone
                }
                onChange={
                  handleChange
                }
                placeholder="054 123 4567"
                required
              />
            </div>

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <div className="form-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                rows="5"
                maxLength={5000}
                placeholder={
                  isCosmetics
                    ? "Describe the product, authenticity, condition, size, benefits, expiry date, packaging, what's included, etc."
                    : isAccessory
                    ? "Describe the accessory, compatibility, condition, what's included, etc."
                    : isGameConsole
                    ? "Describe the console, condition, included games/accessories, etc."
                    : isSmartwatch
                    ? "Describe the smartwatch, condition, battery life, included strap, etc."
                    : isTV
                    ? "Describe the TV, screen quality, smart features, connectivity, included accessories, etc."
                    : isCar
                    ? "Describe the car, condition, features, maintenance history, etc."
                    : "Describe your item..."
                }
              />

              <span className="hint">
                {
                  formData
                    .description
                    .length
                }
                /5000
              </span>
            </div>

            {/* ==================================================
                IMAGES
            ================================================== */}

            <div className="form-group">
              <label>
                Upload Images *
              </label>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={
                  handleFileChange
                }
              />

              <span className="hint">
                Upload up to 5 images.
                At least 1 image is required.
              </span>
            </div>

            {/* ==================================================
                VIDEO
            ================================================== */}

            <div className="form-group">
              <label>
                Upload Video
              </label>

              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={
                  handleVideoChange
                }
              />

              <span className="hint">
                Optional. MP4, MOV, AVI or
                WEBM. Maximum 50MB.
              </span>
            </div>

            {/* ==================================================
                MEDIA PREVIEW
            ================================================== */}

            {mediaItems.length >
              0 && (
              <div className="media-grid">
                {mediaItems.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.file.name}-${index}`}
                      className="media-item"
                    >
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() =>
                          removeMedia(
                            index
                          )
                        }
                      >
                        ✕
                      </button>

                      {item.type ===
                      "video" ? (
                        <video
                          src={
                            item.preview
                          }
                          muted
                          playsInline
                          controls
                        />
                      ) : (
                        <img
                          src={
                            item.preview
                          }
                          alt={`Preview ${
                            index +
                            1
                          }`}
                        />
                      )}

                      {item.type ===
                        "video" && (
                        <span className="video-badge">
                          🎬
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* ==================================================
                NEXT
            ================================================== */}

            <button
              type="button"
              className="btn-primary"
              onClick={
                goToNextStep
              }
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
            {/* ==================================================
                LAPTOP
            ================================================== */}

            {isLaptop && (
              <LaptopForm
                formData={
                  formData
                }
                handleChange={
                  handleChange
                }
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* ==================================================
                TABLET
            ================================================== */}

            {isTablet && (
              <TabletForm
                formData={
                  formData
                }
                handleChange={
                  handleChange
                }
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* ==================================================
                GAME CONSOLE
            ================================================== */}

            {isGameConsole && (
              <GameConsoleForm
                formData={
                  formData
                }
                handleChange={
                  handleChange
                }
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* ==================================================
                SMARTWATCH
            ================================================== */}

            {isSmartwatch && (
              <AppleWatchForm
                formData={
                  formData
                }
                handleChange={
                  handleChange
                }
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* ==================================================
                TV
            ================================================== */}

            {isTV && (
              <TVForm
                formData={
                  formData
                }
                handleChange={
                  handleChange
                }
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* ==================================================
                CAR
            ================================================== */}

            {isCar && (
              <CarForm
                formData={
                  formData
                }
                handleChange={
                  handleChange
                }
                handleCheckboxChange={
                  handleCheckboxChange
                }
                errors={{}}
              />
            )}

            {/* ==================================================
                PHONE
            ================================================== */}

            {isPhone && (
              <>
                {/* STORAGE */}

                <div className="form-group">
                  <label>
                    Storage
                  </label>

                  <select
                    value=""
                    onChange={
                      handleStorageChange
                    }
                  >
                    <option value="">
                      Select storage
                    </option>

                    {[
                      "16GB",
                      "32GB",
                      "64GB",
                      "128GB",
                      "256GB",
                      "512GB",
                      "1TB",
                      "2TB",
                    ].map(
                      (storage) => (
                        <option
                          key={
                            storage
                          }
                          value={
                            storage
                          }
                        >
                          {
                            storage
                          }
                        </option>
                      )
                    )}
                  </select>

                  {selectedStorage.length >
                    0 && (
                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap: "8px",
                        marginTop:
                          "10px",
                      }}
                    >
                      {selectedStorage.map(
                        (
                          storage
                        ) => (
                          <span
                            key={
                              storage
                            }
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "7px",
                              padding:
                                "7px 10px",
                              background:
                                "#eff6ff",
                              border:
                                "1px solid #bfdbfe",
                              borderRadius:
                                "999px",
                              color:
                                "#1e40af",
                              fontSize:
                                "14px",
                              fontWeight:
                                "500",
                            }}
                          >
                            {
                              storage
                            }

                            <button
                              type="button"
                              onClick={() =>
                                removeStorage(
                                  storage
                                )
                              }
                              aria-label={`Remove ${storage}`}
                              style={{
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#1e40af",
                                cursor:
                                  "pointer",
                                padding:
                                  "0",
                                fontSize:
                                  "17px",
                                lineHeight:
                                  "1",
                                fontWeight:
                                  "700",
                              }}
                            >
                              ×
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <span className="hint">
                    Select all storage
                    options that apply.
                  </span>
                </div>

                {/* COLOR */}

                <div className="form-group">
                  <label>
                    Color
                  </label>

                  <select
                    value=""
                    onChange={
                      handleColorChange
                    }
                  >
                    <option value="">
                      Select color
                    </option>

                    {phoneColors.map(
                      (color) => (
                        <option
                          key={
                            color
                          }
                          value={
                            color
                          }
                        >
                          {
                            color
                          }
                        </option>
                      )
                    )}
                  </select>

                  {selectedColors.length >
                    0 && (
                    <div
                      style={{
                        display:
                          "flex",
                        flexWrap:
                          "wrap",
                        gap: "8px",
                        marginTop:
                          "10px",
                      }}
                    >
                      {selectedColors.map(
                        (
                          color
                        ) => (
                          <span
                            key={
                              color
                            }
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              gap: "7px",
                              padding:
                                "7px 10px",
                              background:
                                "#f8fafc",
                              border:
                                "1px solid #cbd5e1",
                              borderRadius:
                                "999px",
                              color:
                                "#334155",
                              fontSize:
                                "14px",
                              fontWeight:
                                "500",
                            }}
                          >
                            {
                              color
                            }

                            <button
                              type="button"
                              onClick={() =>
                                removeColor(
                                  color
                                )
                              }
                              aria-label={`Remove ${color}`}
                              style={{
                                border:
                                  "none",
                                background:
                                  "transparent",
                                color:
                                  "#475569",
                                cursor:
                                  "pointer",
                                padding:
                                  "0",
                                fontSize:
                                  "17px",
                                lineHeight:
                                  "1",
                                fontWeight:
                                  "700",
                              }}
                            >
                              ×
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <span className="hint">
                    Select all colors that
                    apply to this item.
                  </span>
                </div>

                {/* BATTERY HEALTH */}

                <div className="form-group">
                  <label>
                    Battery Health (%)
                  </label>

                  <input
                    type="number"
                    name="batteryHealth"
                    value={
                      formData.batteryHealth
                    }
                    onChange={
                      handleChange
                    }
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
                    value={
                      formData.simStatus
                    }
                    onChange={
                      handleChange
                    }
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
                    value={
                      formData.faceId
                    }
                    onChange={
                      handleChange
                    }
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

            {/* ==================================================
                ACCESSORIES
            ================================================== */}

            {isAccessory && (
              <>
                <div
                  style={{
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "10px",
                    padding:
                      "16px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 6px",
                      fontSize:
                        "18px",
                    }}
                  >
                    🎧 Accessory Details
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#64748b",
                      fontSize:
                        "13px",
                    }}
                  >
                    Add information buyers need
                    to understand your accessory.
                  </p>
                </div>

                <div className="form-group">
                  <label>
                    Accessory Type *
                  </label>

                  <select
                    name="accessoryType"
                    value={
                      formData.accessoryType
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="">
                      Select accessory
                    </option>

                    {ACCESSORY_TYPES.map(
                      (item) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Compatibility
                  </label>

                  <select
                    name="compatibility"
                    value={
                      formData.compatibility
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select compatibility
                    </option>

                    {ACCESSORY_COMPATIBILITY.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {
                            item
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Compatible Model
                  </label>

                  <input
                    type="text"
                    name="model"
                    value={
                      formData.model
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. iPhone 15 Pro"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Color
                  </label>

                  <input
                    type="text"
                    name="accessoryColor"
                    value={
                      formData.accessoryColor
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Black"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Material
                  </label>

                  <input
                    type="text"
                    name="accessoryMaterial"
                    value={
                      formData.accessoryMaterial
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Silicone, Leather, Aluminum"
                  />
                </div>
              </>
            )}

            {/* ==================================================
                COSMETICS
            ================================================== */}

            {isCosmetics && (
              <>
                <div
                  style={{
                    background:
                      "#fff7ed",
                    border:
                      "1px solid #fed7aa",
                    borderRadius:
                      "12px",
                    padding:
                      "18px",
                    marginBottom:
                      "20px",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 6px",
                      fontSize:
                        "20px",
                    }}
                  >
                    💄 Cosmetic Details
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#9a3412",
                      fontSize:
                        "13px",
                      lineHeight:
                        "1.5",
                    }}
                  >
                    Provide accurate product information
                    so buyers can easily understand the
                    cosmetic or beauty product.
                  </p>
                </div>

                {/* PRODUCT NAME / MODEL */}

                <div className="form-group">
                  <label>
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="model"
                    value={
                      formData.model
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Hydrating Facial Cleanser"
                    required
                  />
                </div>

                {/* COSMETIC BRAND */}

                <div className="form-group">
                  <label>
                    Brand
                  </label>

                  <input
                    type="text"
                    name="cosmeticBrand"
                    value={
                      formData.cosmeticBrand
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. CeraVe"
                  />
                </div>

                {/* PRODUCT LINE */}

                <div className="form-group">
                  <label>
                    Product Line / Collection
                  </label>

                  <input
                    type="text"
                    name="productLine"
                    value={
                      formData.productLine
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Hydrating Range"
                  />
                </div>

                {/* SHADE */}

                <div className="form-group">
                  <label>
                    Shade / Color
                  </label>

                  <input
                    type="text"
                    name="shade"
                    value={
                      formData.shade
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 220 Natural Beige"
                  />
                </div>

                {/* SKIN TYPE */}

                <div className="form-group">
                  <label>
                    Skin Type
                  </label>

                  <select
                    name="skinType"
                    value={
                      formData.skinType
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select skin type
                    </option>

                    {COSMETIC_SKIN_TYPES.map(
                      (type) => (
                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {
                            type
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* SKIN CONCERN */}

                <div className="form-group">
                  <label>
                    Skin / Beauty Concern
                  </label>

                  <select
                    name="skinConcern"
                    value={
                      formData.skinConcern
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select concern
                    </option>

                    {COSMETIC_CONCERNS.map(
                      (
                        concern
                      ) => (
                        <option
                          key={
                            concern
                          }
                          value={
                            concern
                          }
                        >
                          {
                            concern
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* FINISH */}

                <div className="form-group">
                  <label>
                    Finish
                  </label>

                  <select
                    name="finish"
                    value={
                      formData.finish
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select finish
                    </option>

                    {COSMETIC_FINISHES.map(
                      (finish) => (
                        <option
                          key={
                            finish
                          }
                          value={
                            finish
                          }
                        >
                          {
                            finish
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* COVERAGE */}

                <div className="form-group">
                  <label>
                    Coverage
                  </label>

                  <select
                    name="coverage"
                    value={
                      formData.coverage
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select coverage
                    </option>

                    {COSMETIC_COVERAGE.map(
                      (coverage) => (
                        <option
                          key={
                            coverage
                          }
                          value={
                            coverage
                          }
                        >
                          {
                            coverage
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* SIZE */}

                <div className="form-group">
                  <label>
                    Product Size
                  </label>

                  <select
                    name="cosmeticSize"
                    value={
                      formData.cosmeticSize
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select size
                    </option>

                    {COSMETIC_SIZES.map(
                      (size) => (
                        <option
                          key={
                            size
                          }
                          value={
                            size
                          }
                        >
                          {
                            size
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* VOLUME */}

                <div className="form-group">
                  <label>
                    Volume / Weight
                  </label>

                  <input
                    type="text"
                    name="volume"
                    value={
                      formData.volume
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. 236ml, 50g, 100ml"
                  />
                </div>

                {/* SCENT */}

                <div className="form-group">
                  <label>
                    Scent / Fragrance
                  </label>

                  <input
                    type="text"
                    name="scent"
                    value={
                      formData.scent
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Vanilla, Rose, Unscented"
                  />
                </div>

                {/* GENDER */}

                <div className="form-group">
                  <label>
                    Suitable For
                  </label>

                  <select
                    name="cosmeticGender"
                    value={
                      formData.cosmeticGender
                    }
                    onChange={
                      handleChange
                    }
                  >
                    {COSMETIC_GENDERS.map(
                      (gender) => (
                        <option
                          key={
                            gender
                          }
                          value={
                            gender
                          }
                        >
                          {
                            gender
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* SUITABLE FOR */}

                <div className="form-group">
                  <label>
                    Suitable For / Usage
                  </label>

                  <input
                    type="text"
                    name="suitableFor"
                    value={
                      formData.suitableFor
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Face, Body, Hair, Lips"
                  />
                </div>

                {/* INGREDIENTS */}

                <div className="form-group">
                  <label>
                    Ingredients
                  </label>

                  <textarea
                    name="ingredients"
                    value={
                      formData.ingredients
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="List the main ingredients if available."
                  />
                </div>

                {/* EXPIRATION */}

                <div className="form-group">
                  <label>
                    Expiration Date
                  </label>

                  <input
                    type="date"
                    name="expirationDate"
                    value={
                      formData.expirationDate
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                {/* BATCH NUMBER */}

                <div className="form-group">
                  <label>
                    Batch / Lot Number
                  </label>

                  <input
                    type="text"
                    name="batchNumber"
                    value={
                      formData.batchNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter batch or lot number if available"
                  />
                </div>

                {/* SEALED */}

                <div className="form-group">
                  <label>
                    Packaging
                  </label>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="sealed"
                      checked={
                        formData.sealed
                      }
                      onChange={
                        handleCheckboxChange
                      }
                    />

                    <span>
                      Product is sealed / unopened
                    </span>
                  </div>
                </div>

                {/* AUTHENTIC */}

                <div className="form-group">
                  <label>
                    Authenticity
                  </label>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="authentic"
                      checked={
                        formData.authentic
                      }
                      onChange={
                        handleCheckboxChange
                      }
                    />

                    <span>
                      I confirm this product is authentic
                    </span>
                  </div>
                </div>

                {/* CRUELTY FREE */}

                <div className="form-group">
                  <label>
                    Product Attributes
                  </label>

                  <div
                    className="checkbox-group"
                    style={{
                      marginBottom:
                        "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="crueltyFree"
                      checked={
                        formData.crueltyFree
                      }
                      onChange={
                        handleCheckboxChange
                      }
                    />

                    <span>
                      Cruelty-free
                    </span>
                  </div>

                  <div
                    className="checkbox-group"
                    style={{
                      marginBottom:
                        "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="vegan"
                      checked={
                        formData.vegan
                      }
                      onChange={
                        handleCheckboxChange
                      }
                    />

                    <span>
                      Vegan
                    </span>
                  </div>

                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      name="parabenFree"
                      checked={
                        formData.parabenFree
                      }
                      onChange={
                        handleCheckboxChange
                      }
                    />

                    <span>
                      Paraben-free
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ==================================================
                GENERIC ELECTRONICS
            ================================================== */}

            {!isPhone &&
              !isLaptop &&
              !isTablet &&
              !isAccessory &&
              !isGameConsole &&
              !isSmartwatch &&
              !isTV &&
              !isCar &&
              !isCosmetics && (
                <>
                  <div className="form-group">
                    <label>
                      Brand
                    </label>

                    <input
                      type="text"
                      name="brand"
                      value={
                        formData.brand
                      }
                      onChange={
                        handleChange
                      }
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
                      value={
                        formData.model
                      }
                      onChange={
                        handleChange
                      }
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
                      value={
                        formData.color
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Color"
                    />
                  </div>
                </>
              )}

            {/* ==================================================
                CONDITION
            ================================================== */}

            <div className="form-group">
              <label>
                Condition
              </label>

              <select
                name="condition"
                value={
                  formData.condition
                }
                onChange={
                  handleChange
                }
              >
                {CONDITIONS.map(
                  (
                    condition
                  ) => (
                    <option
                      key={
                        condition
                      }
                      value={
                        condition
                      }
                    >
                      {
                        condition
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* ==================================================
                WARRANTY
            ================================================== */}

            <div className="form-group">
              <label>
                Warranty Period
              </label>

              <select
                name="warranty"
                value={
                  formData.warranty
                }
                onChange={
                  handleChange
                }
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

            {/* ==================================================
                NEGOTIATION
            ================================================== */}

            <div className="form-group">
              <label>
                Negotiation
              </label>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="negotiation"
                  checked={
                    formData.negotiation
                  }
                  onChange={
                    handleCheckboxChange
                  }
                />

                <span>
                  Price is negotiable
                </span>
              </div>
            </div>

            {/* ==================================================
                SWAP
            ================================================== */}

            <div className="form-group">
              <label>
                Swap Accepted
              </label>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="swapAccepted"
                  checked={
                    formData.swapAccepted
                  }
                  onChange={
                    handleCheckboxChange
                  }
                />

                <span>
                  I accept trades / swaps
                </span>
              </div>
            </div>

            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div className="step-buttons">
              <button
                type="button"
                className="btn-outline"
                onClick={
                  goToPreviousStep
                }
                disabled={
                  isSubmitting
                }
              >
                ← Back
              </button>

              <button
                type="submit"
                className="btn-primary"
                disabled={
                  isSubmitting
                }
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
          onClick={
            closeAuthModal
          }
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
              onClick={
                closeAuthModal
              }
            >
              &times;
            </button>

            <h2>
              {authMode ===
              "login"
                ? "Welcome Back 👋"
                : "Join KN Classifieds 🚀"}
            </h2>

            <p className="auth-subtitle">
              {authMode ===
              "login"
                ? "Login to publish your ad"
                : "Create an account to publish your ad"}
            </p>

            {authError && (
              <div className="error-banner">
                {authError}
              </div>
            )}

            <form
              onSubmit={
                handleAuthSubmit
              }
            >
              {/* REGISTER NAME */}

              {authMode ===
                "register" && (
                <div className="form-group">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={
                      authName
                    }
                    onChange={(e) =>
                      setAuthName(
                        e.target
                          .value
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
                  value={
                    authEmail
                  }
                  onChange={(e) =>
                    setAuthEmail(
                      e.target
                        .value
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
                  value={
                    authPassword
                  }
                  onChange={(e) =>
                    setAuthPassword(
                      e.target
                        .value
                    )
                  }
                  placeholder={
                    authMode ===
                    "login"
                      ? "Enter your password"
                      : "Min 6 characters"
                  }
                  required
                  minLength="6"
                />
              </div>

              {/* REGISTER PHONE */}

              {authMode ===
                "register" && (
                <div className="form-group">
                  <label>
                    Phone (optional)
                  </label>

                  <input
                    type="tel"
                    value={
                      authPhone
                    }
                    onChange={(e) =>
                      setAuthPhone(
                        e.target
                          .value
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
                  authMode ===
                  "login"
                    ? "btn-primary"
                    : "btn-secondary"
                }
                disabled={
                  authLoading
                }
              >
                {authLoading
                  ? authMode ===
                    "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : authMode ===
                    "login"
                  ? "Log In →"
                  : "Create Account →"}
              </button>
            </form>

            {/* AUTH SWITCH */}

            <div className="auth-footer">
              {authMode ===
              "login" ? (
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