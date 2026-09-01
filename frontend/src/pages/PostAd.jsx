// frontend/src/pages/PostAd.jsx

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
import AutoSpareParts from "../components/Autospareparts";

// ✅ IMPORT THE DEDICATED ACCESSORIES FORM
import AccessoriesForm from "../components/AccessoriesForm";

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
    "Kwame Nkrumah Circle",
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
// ACCESSORIES (used only for the dropdown in Step 1)
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

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [selectedCountry, setSelectedCountry] = useState("Ghana");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState([]);

  // ==========================================================
  // FORM DATA
  // ==========================================================

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "electronics",
    location: "Ghana",
    description: "",
    sellerName: "",
    sellerPhone: "",
    brand: "",
    model: "",
    color: "",
    condition: "Good",
    warranty: "",
    negotiation: false,
    swapAccepted: false,
    storage: "",
    batteryHealth: "",
    faceId: "",
    simStatus: "",
    processor: "",
    ram: "",
    screenSize: "",
    graphics: "",
    year: "",
    connectivity: "",
    accessoryType: "",
    compatibility: "",
    accessoryColor: "",
    accessoryMaterial: "",
    consoleType: "",
    edition: "",
    discDrive: "",
    controllersIncluded: "",
    battery: "",
    resolution: "",
    videoOutput: "",
    watchSize: "",
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
    mileage: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    driveType: "",
    engineSize: "",
    seatingCapacity: "",
    exteriorColor: "",
    interiorColor: "",
    sparePartCategory: "",
    sparePartType: "",
    sparePartBrand: "",
    sparePartPartNumber: "",
    sparePartCondition: "",
    sparePartCompatibility: "",
    sparePartVehicleMake: "",
    sparePartVehicleModel: "",
    sparePartVehicleYearFrom: "",
    sparePartVehicleYearTo: "",
    sparePartPosition: "",
    sparePartSide: "",
    sparePartMaterial: "",
    sparePartColor: "",
    sparePartQuantity: "",
    sparePartWarranty: "",
    sparePartNewUsed: "",
    sparePartOriginal: "",
    sparePartOem: "",
  });

  const [mediaItems, setMediaItems] = useState([]);

  // Auth state
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ==========================================================
  // CATEGORY MAP – FIXED for Car Spare Parts
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
    carSpareParts: "Spare Parts",   // ✅ changed from "Car Spare Parts" / "Auto Spare Parts"
  };

  // ==========================================================
  // CATEGORY FLAGS
  // ==========================================================

  const isPhone = formData.category === "phones";
  const isLaptop = formData.category === "laptops";
  const isTablet = formData.category === "tablets";
  const isAccessory = formData.category === "accessories";
  const isGameConsole = formData.category === "gameConsoles";
  const isSmartwatch = formData.category === "smartwatches";
  const isTV = formData.category === "tvs";
  const isCar = formData.category === "cars";
  const isCarSpareParts = formData.category === "carSpareParts";

  // ==========================================================
  // LOCATION EFFECT
  // ==========================================================

  useEffect(() => {
    let location = selectedCountry;
    if (selectedRegion) location = `${selectedRegion}, ${location}`;
    if (selectedCity) location = `${selectedCity}, ${location}`;
    setFormData((prev) => ({ ...prev, location }));
  }, [selectedCountry, selectedRegion, selectedCity]);

  // ==========================================================
  // CLEANUP MEDIA
  // ==========================================================

  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
    };
  }, []);

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleColorChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    setSelectedColors((prev) => {
      if (prev.includes(value)) return prev;
      const updated = [...prev, value];
      setFormData((current) => ({ ...current, color: updated.join(", ") }));
      return updated;
    });
    e.target.value = "";
  };

  const removeColor = (colorToRemove) => {
    setSelectedColors((prev) => {
      const updated = prev.filter((color) => color !== colorToRemove);
      setFormData((current) => ({ ...current, color: updated.join(", ") }));
      return updated;
    });
  };

  const handleStorageChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    setSelectedStorage((prev) => {
      if (prev.includes(value)) return prev;
      const updated = [...prev, value];
      setFormData((current) => ({ ...current, storage: updated.join(", ") }));
      return updated;
    });
    e.target.value = "";
  };

  const removeStorage = (storageToRemove) => {
    setSelectedStorage((prev) => {
      const updated = prev.filter((storage) => storage !== storageToRemove);
      setFormData((current) => ({ ...current, storage: updated.join(", ") }));
      return updated;
    });
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData((prev) => ({
      ...prev,
      category,
      ...(category !== "phones" ? { simStatus: "", batteryHealth: "", faceId: "" } : {}),
      ...(category !== "laptops" ? { processor: "", ram: "", screenSize: "", graphics: "" } : {}),
      ...(category !== "tablets" ? { year: "", connectivity: "" } : {}),
      ...(category !== "accessories" ? { accessoryType: "", compatibility: "", accessoryColor: "", accessoryMaterial: "" } : {}),
      ...(category !== "gameConsoles" ? { consoleType: "", edition: "", discDrive: "", controllersIncluded: "", battery: "", resolution: "", videoOutput: "" } : {}),
      ...(category !== "smartwatches" ? { watchSize: "" } : {}),
      ...(category !== "tvs" ? { tvType: "", displayTechnology: "", refreshRate: "", operatingSystem: "", hdr: "", hdmiPorts: "", usbPorts: "", smartTV: false, voiceControl: false, wallMountable: false } : {}),
      ...(category !== "cars" ? { mileage: "", bodyType: "", fuelType: "", transmission: "", driveType: "", engineSize: "", seatingCapacity: "", exteriorColor: "", interiorColor: "" } : {}),
      ...(category !== "carSpareParts"
        ? {
            sparePartCategory: "",
            sparePartType: "",
            sparePartBrand: "",
            sparePartPartNumber: "",
            sparePartCondition: "",
            sparePartCompatibility: "",
            sparePartVehicleMake: "",
            sparePartVehicleModel: "",
            sparePartVehicleYearFrom: "",
            sparePartVehicleYearTo: "",
            sparePartPosition: "",
            sparePartSide: "",
            sparePartMaterial: "",
            sparePartColor: "",
            sparePartQuantity: "",
            sparePartWarranty: "",
            sparePartNewUsed: "",
            sparePartOriginal: "",
            sparePartOem: "",
          }
        : {}),
    }));
    if (category !== "phones") {
      setSelectedColors([]);
      setSelectedStorage([]);
      setFormData((prev) => ({ ...prev, color: "", storage: "" }));
    }
    setError("");
  };

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

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const imageFiles = selected.filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length) {
      setError("Please select valid image files.");
      e.target.value = "";
      return;
    }
    const existingImages = mediaItems.filter((item) => item.type === "image").length;
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
      setError(`Only ${remaining} more image${remaining === 1 ? "" : "s"} can be added.`);
    } else {
      setError("");
    }
    e.target.value = "";
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      e.target.value = "";
      return;
    }
    if (mediaItems.some((item) => item.type === "video")) {
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

  const removeMedia = (index) => {
    const item = mediaItems[index];
    if (item?.preview) URL.revokeObjectURL(item.preview);
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================================
  // STEP 1 VALIDATION – accessory brand check REMOVED
  // ==========================================================

  const goToNextStep = () => {
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter an ad title.");
      return;
    }
    if (formData.price === "" || formData.price === null || formData.price === undefined) {
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
    // ✅ Accessory: only type is required now; brand will be checked in Step 2 (handleSubmit)
    if (isAccessory) {
      if (!formData.accessoryType) {
        setError("Please select the accessory type.");
        return;
      }
      // brand check removed – moved to handleSubmit
    }
    if (isGameConsole && !formData.brand) {
      setError("Please select a console brand.");
      return;
    }
    if (isSmartwatch && !formData.brand) {
      setError("Please select a smartwatch brand.");
      return;
    }
    if (isTV && !formData.brand) {
      setError("Please select a TV brand.");
      return;
    }
    if (isCar && !formData.brand) {
      setError("Please select a car brand.");
      return;
    }

    setStep(2);
  };

  const goToPreviousStep = () => {
    setStep(1);
    setError("");
  };

  // ==========================================================
  // BUILD PRODUCT FORM DATA
  // ==========================================================

  const buildProductFormData = () => {
    const form = new FormData();
    const mappedCategory = categoryMap[formData.category] || formData.category;

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

    // Phone
    if (isPhone) {
      if (formData.storage) baseFields.storage = formData.storage.trim();
      if (formData.batteryHealth !== "") baseFields.batteryHealth = String(formData.batteryHealth);
      if (formData.faceId) baseFields.faceId = formData.faceId;
      if (formData.simStatus) baseFields.simStatus = formData.simStatus;
    }

    // Laptop
    if (isLaptop) {
      baseFields.processor = formData.processor.trim();
      baseFields.ram = formData.ram.trim();
      if (formData.storage) baseFields.storage = formData.storage.trim();
      baseFields.screenSize = formData.screenSize.trim();
      baseFields.graphics = formData.graphics.trim();
    }

    // Tablet
    if (isTablet) {
      if (formData.storage) baseFields.storage = String(formData.storage).trim();
      if (formData.year) baseFields.year = formData.year;
      if (formData.connectivity) baseFields.connectivity = formData.connectivity;
      if (formData.screenSize) baseFields.screenSize = formData.screenSize;
    }

    // Accessory
    if (isAccessory) {
      baseFields.accessoryType = formData.accessoryType;
      if (formData.compatibility) baseFields.compatibility = formData.compatibility;
      if (formData.accessoryColor) baseFields.color = formData.accessoryColor.trim();
      if (formData.accessoryMaterial) baseFields.material = formData.accessoryMaterial.trim();
    }

    // Game Console
    if (isGameConsole) {
      const consoleFields = ["consoleType", "edition", "discDrive", "controllersIncluded", "battery", "resolution", "videoOutput", "ram", "screenSize", "year", "connectivity"];
      consoleFields.forEach((field) => {
        if (formData[field] && formData[field] !== "") baseFields[field] = formData[field];
      });
      if (formData.storage) baseFields.storage = String(formData.storage).trim();
    }

    // Smartwatch
    if (isSmartwatch) {
      if (formData.watchSize) baseFields.watchSize = formData.watchSize;
      if (formData.batteryHealth !== "") baseFields.batteryHealth = String(formData.batteryHealth);
      if (formData.connectivity) baseFields.connectivity = formData.connectivity;
      if (formData.storage) baseFields.storage = String(formData.storage).trim();
      if (formData.year) baseFields.year = formData.year;
    }

    // TV
    if (isTV) {
      const tvFields = ["tvType", "displayTechnology", "refreshRate", "operatingSystem", "hdr", "hdmiPorts", "usbPorts"];
      tvFields.forEach((field) => {
        if (formData[field] && formData[field] !== "") baseFields[field] = formData[field];
      });
      baseFields.smartTV = String(formData.smartTV);
      baseFields.voiceControl = String(formData.voiceControl);
      baseFields.wallMountable = String(formData.wallMountable);
      if (formData.screenSize) baseFields.screenSize = formData.screenSize;
      if (formData.resolution) baseFields.resolution = formData.resolution;
      if (formData.year) baseFields.year = formData.year;
      if (formData.connectivity) baseFields.connectivity = formData.connectivity;
    }

    // Car
    if (isCar) {
      const carFields = ["mileage", "bodyType", "fuelType", "transmission", "driveType", "engineSize", "seatingCapacity", "exteriorColor", "interiorColor"];
      carFields.forEach((field) => {
        if (formData[field] && formData[field] !== "") baseFields[field] = formData[field];
      });
      if (formData.year) baseFields.year = formData.year;
    }

    // Car Spare Parts
    if (isCarSpareParts) {
      const sparePartFields = [
        "sparePartCategory",
        "sparePartType",
        "sparePartBrand",
        "sparePartPartNumber",
        "sparePartCondition",
        "sparePartCompatibility",
        "sparePartVehicleMake",
        "sparePartVehicleModel",
        "sparePartVehicleYearFrom",
        "sparePartVehicleYearTo",
        "sparePartPosition",
        "sparePartSide",
        "sparePartMaterial",
        "sparePartColor",
        "sparePartQuantity",
        "sparePartWarranty",
        "sparePartNewUsed",
        "sparePartOriginal",
        "sparePartOem",
      ];
      sparePartFields.forEach((field) => {
        if (formData[field] !== undefined && formData[field] !== null && String(formData[field]).trim() !== "") {
          baseFields[field] = String(formData[field]).trim();
        }
      });
      if (formData.sparePartBrand) baseFields.brand = formData.sparePartBrand.trim();
      if (formData.sparePartVehicleMake) baseFields.vehicleMake = formData.sparePartVehicleMake;
      if (formData.sparePartVehicleModel) baseFields.vehicleModel = formData.sparePartVehicleModel;
    }

    // Append text fields
    Object.entries(baseFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        form.append(key, value);
      }
    });

    // Append media
    mediaItems.forEach((item) => {
      if (item?.file) form.append("files", item.file);
    });

    return form;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!token) {
      setError("You are not authenticated. Please log in again.");
      return;
    }

    const imageCount = mediaItems.filter((item) => item.type === "image").length;
    if (imageCount === 0) {
      setError("Please upload at least one image for your ad.");
      setStep(1);
      return;
    }

    // Laptop validation
    if (isLaptop) {
      if (!formData.model.trim()) {
        setError("Please select a laptop model.");
        return;
      }
      const requiredFields = ["processor", "ram", "storage", "screenSize", "graphics"];
      const missing = requiredFields.filter((field) => !String(formData[field] || "").trim());
      if (missing.length > 0) {
        setError(`Please fill in: ${missing.join(", ")}`);
        return;
      }
    }

    // Tablet
    if (isTablet) {
      if (!formData.model.trim()) {
        setError("Please select a tablet model.");
        return;
      }
    }

    // ✅ Accessory – brand validation now here (Step 2)
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

    // Game Console
    if (isGameConsole) {
      if (!formData.model.trim()) {
        setError("Please select a console model.");
        return;
      }
    }

    // Smartwatch
    if (isSmartwatch) {
      if (!formData.model.trim()) {
        setError("Please select a smartwatch model.");
        return;
      }
    }

    // TV
    if (isTV) {
      if (!formData.model.trim()) {
        setError("Please select a TV model.");
        return;
      }
    }

    // Car
    if (isCar) {
      if (!formData.model.trim()) {
        setError("Please select a car model.");
        return;
      }
    }

    // Car Spare Parts
    if (isCarSpareParts) {
      if (!formData.sparePartCategory) {
        setError("Please select a spare parts category.");
        return;
      }
      if (!formData.sparePartType) {
        setError("Please select the spare part type.");
        return;
      }
      if (!formData.sparePartVehicleMake) {
        setError("Please select the vehicle make.");
        return;
      }
      if (!formData.sparePartVehicleModel) {
        setError("Please enter the compatible vehicle model.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const form = buildProductFormData();
      const data = await createProductWithFiles(form, token);
      if (data?.product) {
        mediaItems.forEach((item) => {
          if (item.preview) URL.revokeObjectURL(item.preview);
        });
        navigate("/products");
        return;
      }
      setError(data?.message || "Failed to post ad.");
    } catch (err) {
      console.error("❌ Post ad error:", err);
      setError(err?.response?.data?.message || err?.message || "Something went wrong. Please try again.");
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
        result = await login(authEmail, authPassword);
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
        setAuthError(result?.error || "Authentication failed.");
      }
    } catch (err) {
      setAuthError(err?.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  };

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
        {step === 1 ? "Step 1 of 2 – Basic details" : "Step 2 of 2 – Additional details"}
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* STEP 1 */}
        {step === 1 && (
          <>
            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleCategoryChange} required>
                <option value="cars">🚗 Cars</option>
                <option value="carSpareParts">🔧 Car Spare Parts</option>
                <option value="phones">📱 Phones</option>
                <option value="laptops">💻 Laptops</option>
                <option value="tablets">📲 Tablets</option>
                <option value="accessories">🎧 Accessories</option>
                <option value="gameConsoles">🎮 Game Consoles</option>
                <option value="smartwatches">⌚ Smartwatches</option>
                <option value="tvs">📺 TVs</option>
                <option value="electronics">📺 Electronics</option>
              </select>
            </div>

            {/* Car Spare Parts info box */}
            {isCarSpareParts && (
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>🔧 Car Spare Parts</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  Select the type of vehicle spare part you are selling.
                </p>
              </div>
            )}

            {/* Accessory Type in Step 1 (only type) */}
            {isAccessory && (
              <div className="form-group">
                <label>Accessory Type *</label>
                <select name="accessoryType" value={formData.accessoryType} onChange={handleChange} required>
                  <option value="">Select accessory</option>
                  {ACCESSORY_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand selects for other categories (unchanged) */}
            {isLaptop && (
              <div className="form-group">
                <label>Laptop Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {LAPTOP_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {isTablet && (
              <div className="form-group">
                <label>Tablet Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {TABLET_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {isGameConsole && (
              <div className="form-group">
                <label>Console Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {["Sony", "Microsoft", "Nintendo", "Valve", "ASUS", "Lenovo", "AYANEO", "Logitech", "Steam Deck", "Other"].map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {isSmartwatch && (
              <div className="form-group">
                <label>Smartwatch Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {["Apple", "Samsung", "Garmin", "Fitbit", "Huawei", "Xiaomi", "Amazfit", "Suunto", "Polar", "Other"].map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {isTV && (
              <div className="form-group">
                <label>TV Brand *</label>
                <select name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {["Samsung", "LG", "Sony", "TCL", "Hisense", "Philips", "Panasonic", "Toshiba", "Sharp", "Skyworth", "JVC", "Haier", "Xiaomi", "Roku", "Vizio", "Other"].map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {isCar && (
              <div className="form-group">
                <label>Car Brand (Make) *</label>
                <select name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select brand</option>
                  {["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Hyundai", "Kia", "Volkswagen", "Mercedes-Benz", "BMW", "Audi", "Lexus", "Subaru", "Mazda", "Jeep", "Land Rover", "Porsche", "Ferrari", "Lamborghini", "Rolls-Royce", "Bentley", "Maserati", "Jaguar", "Volvo", "Alfa Romeo", "Fiat", "Citroën", "Peugeot", "Renault", "Dacia", "Mitsubishi", "Suzuki", "Daihatsu", "Isuzu", "Hino", "Other"].map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Title, Price, Location, Seller, Description, Images, Video (unchanged) */}
            <div className="form-group">
              <label>Ad Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={
                  isCarSpareParts
                    ? "e.g. Genuine Toyota Corolla Front Brake Pads"
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

            <div className="form-group">
              <label>Price (GH₵) *</label>
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

            <div className="form-group">
              <label>Location *</label>
              <select value={selectedCountry} onChange={handleCountryChange}>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <select value={selectedRegion} onChange={handleRegionChange}>
                <option value="">Select Region</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select value={selectedCity} onChange={handleCityChange} disabled={!selectedRegion}>
                <option value="">Select City</option>
                {selectedRegion &&
                  citiesByRegion[selectedRegion]?.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
              </select>
              <span className="hint">
                Your ad will appear as: <strong>{formData.location}</strong>
              </span>
            </div>

            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="sellerPhone"
                value={formData.sellerPhone}
                onChange={handleChange}
                placeholder="054 123 4567"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="8"
                maxLength={10000}
                placeholder={
                  isCarSpareParts
                    ? "Describe the spare part, compatible vehicles, condition, OEM information, installation details, etc. (max 10,000 characters)"
                    : isAccessory
                    ? "Describe the accessory, compatibility, condition, what's included, etc. (max 10,000 characters)"
                    : isGameConsole
                    ? "Describe the console, condition, included games/accessories, etc. (max 10,000 characters)"
                    : isSmartwatch
                    ? "Describe the smartwatch, condition, battery life, included strap, etc. (max 10,000 characters)"
                    : isTV
                    ? "Describe the TV, screen quality, smart features, connectivity, included accessories, etc. (max 10,000 characters)"
                    : isCar
                    ? "Describe the car, condition, features, maintenance history, etc. (max 10,000 characters)"
                    : "Describe your item in detail – condition, features, what's included, etc. (max 10,000 characters)"
                }
              />
              <span className="hint">{formData.description.length}/10000</span>
            </div>

            <div className="form-group">
              <label>Upload Images *</label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
              />
              <span className="hint">Upload up to 5 images. At least 1 image is required.</span>
            </div>

            <div className="form-group">
              <label>Upload Video</label>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleVideoChange}
              />
              <span className="hint">Optional. MP4, MOV, AVI or WEBM. Maximum 50MB.</span>
            </div>

            {mediaItems.length > 0 && (
              <div className="media-grid">
                {mediaItems.map((item, index) => (
                  <div key={`${item.file.name}-${index}`} className="media-item">
                    <button type="button" className="remove-btn" onClick={() => removeMedia(index)}>✕</button>
                    {item.type === "video" ? (
                      <video src={item.preview} muted playsInline controls />
                    ) : (
                      <img src={item.preview} alt={`Preview ${index + 1}`} />
                    )}
                    {item.type === "video" && <span className="video-badge">🎬</span>}
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="btn-primary" onClick={goToNextStep}>
              Next: Additional Details →
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            {isCarSpareParts && (
              <AutoSpareParts
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {isLaptop && (
              <LaptopForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {isTablet && (
              <TabletForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {isGameConsole && (
              <GameConsoleForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {isSmartwatch && (
              <AppleWatchForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {isTV && (
              <TVForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {isCar && (
              <CarForm
                formData={formData}
                handleChange={handleChange}
                handleCheckboxChange={handleCheckboxChange}
                errors={{}}
              />
            )}

            {/* ==================================================
                ACCESSORIES – using the dedicated component
            ================================================== */}
            {isAccessory && (
              <AccessoriesForm
                formData={formData}
                handleChange={handleChange}
              />
            )}

            {/* Phone fields (unchanged) */}
            {isPhone && (
              <>
                <div className="form-group">
                  <label>Storage</label>
                  <select value="" onChange={handleStorageChange}>
                    <option value="">Select storage</option>
                    {["16GB","32GB","64GB","128GB","256GB","512GB","1TB","2TB"].map((storage) => (
                      <option key={storage} value={storage}>{storage}</option>
                    ))}
                  </select>
                  {selectedStorage.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                      {selectedStorage.map((storage) => (
                        <span key={storage} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "999px", color: "#1e40af", fontSize: "14px", fontWeight: "500" }}>
                          {storage}
                          <button type="button" onClick={() => removeStorage(storage)} style={{ border: "none", background: "transparent", color: "#1e40af", cursor: "pointer", padding: "0", fontSize: "17px", lineHeight: "1", fontWeight: "700" }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="hint">Select all storage options that apply.</span>
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <select value="" onChange={handleColorChange}>
                    <option value="">Select color</option>
                    {phoneColors.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  {selectedColors.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                      {selectedColors.map((color) => (
                        <span key={color} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "999px", color: "#334155", fontSize: "14px", fontWeight: "500" }}>
                          {color}
                          <button type="button" onClick={() => removeColor(color)} style={{ border: "none", background: "transparent", color: "#475569", cursor: "pointer", padding: "0", fontSize: "17px", lineHeight: "1", fontWeight: "700" }}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Battery Health (%)</label>
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

                <div className="form-group">
                  <label>SIM Status</label>
                  <select name="simStatus" value={formData.simStatus} onChange={handleChange}>
                    <option value="">Select SIM status</option>
                    <option value="SIM Unlocked">SIM Unlocked</option>
                    <option value="eSIM Unlocked">eSIM Unlocked</option>
                    <option value="Locked">Locked</option>
                    <option value="Bypass">Bypass</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Face ID</label>
                  <select name="faceId" value={formData.faceId} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Working">Working</option>
                    <option value="Not Working">Not Working</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </>
            )}

            {/* Generic electronics */}
            {!isPhone &&
              !isLaptop &&
              !isTablet &&
              !isAccessory &&
              !isGameConsole &&
              !isSmartwatch &&
              !isTV &&
              !isCar &&
              !isCarSpareParts && (
                <>
                  <div className="form-group">
                    <label>Brand</label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand" />
                  </div>
                  <div className="form-group">
                    <label>Model</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="Model" />
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="Color" />
                  </div>
                </>
              )}

            {/* Condition & Warranty – skip for accessories (already in AccessoriesForm) */}
            {!isAccessory && (
              <>
                <div className="form-group">
                  <label>Condition</label>
                  <select name="condition" value={formData.condition} onChange={handleChange}>
                    {CONDITIONS.map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Warranty Period</label>
                  <select name="warranty" value={formData.warranty} onChange={handleChange}>
                    <option value="">No warranty</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3 weeks">3 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                    <option value="1 year">1 year</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Negotiation</label>
              <div className="checkbox-group">
                <input type="checkbox" name="negotiation" checked={formData.negotiation} onChange={handleCheckboxChange} />
                <span>Price is negotiable</span>
              </div>
            </div>

            <div className="form-group">
              <label>Swap Accepted</label>
              <div className="checkbox-group">
                <input type="checkbox" name="swapAccepted" checked={formData.swapAccepted} onChange={handleCheckboxChange} />
                <span>I accept trades / swaps</span>
              </div>
            </div>

            <div className="step-buttons">
              <button type="button" className="btn-outline" onClick={goToPreviousStep} disabled={isSubmitting}>
                ← Back
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                {isSubmitting ? "Publishing..." : "Publish Ad →"}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Auth Modal (unchanged) */}
      {showAuthModal && (
        <div className="auth-overlay" onClick={closeAuthModal}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close-btn" onClick={closeAuthModal}>&times;</button>
            <h2>{authMode === "login" ? "Welcome Back 👋" : "Join KN Classifieds 🚀"}</h2>
            <p className="auth-subtitle">
              {authMode === "login" ? "Login to publish your ad" : "Create an account to publish your ad"}
            </p>
            {authError && <div className="error-banner">{authError}</div>}
            <form onSubmit={handleAuthSubmit}>
              {authMode === "register" && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="John Doe" required />
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder={authMode === "login" ? "Enter your password" : "Min 6 characters"} required minLength="6" />
              </div>
              {authMode === "register" && (
                <div className="form-group">
                  <label>Phone (optional)</label>
                  <input type="tel" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="054 123 4567" />
                </div>
              )}
              <button type="submit" className={authMode === "login" ? "btn-primary" : "btn-secondary"} disabled={authLoading}>
                {authLoading
                  ? authMode === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : authMode === "login"
                  ? "Log In →"
                  : "Create Account →"}
              </button>
            </form>
            <div className="auth-footer">
              {authMode === "login" ? (
                <>
                  No account? <span onClick={() => switchAuthMode("register")}>Create free account</span>
                </>
              ) : (
                <>
                  Already have an account? <span onClick={() => switchAuthMode("login")}>Sign in</span>
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