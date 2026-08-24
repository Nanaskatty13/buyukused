import React, { useMemo, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://buyukused.onrender.com";

const PART_CATEGORIES = {
  "Engine Parts": [
    "Engine",
    "Cylinder Head",
    "Cylinder Block",
    "Pistons",
    "Piston Rings",
    "Connecting Rods",
    "Crankshaft",
    "Camshaft",
    "Timing Belt",
    "Timing Chain",
    "Timing Kit",
    "Engine Mount",
    "Oil Pump",
    "Water Pump",
    "Fuel Pump",
    "Oil Pan",
    "Gaskets",
    "Seals",
    "Valves",
    "Rocker Arm",
    "Tappets",
    "Turbocharger",
    "Supercharger",
    "Other Engine Part",
  ],

  "Transmission & Drivetrain": [
    "Transmission",
    "Automatic Transmission",
    "Manual Transmission",
    "CVT Transmission",
    "Transmission Control Module",
    "Clutch",
    "Clutch Kit",
    "Flywheel",
    "Torque Converter",
    "Gearbox",
    "Gear Selector",
    "Driveshaft",
    "Propeller Shaft",
    "CV Joint",
    "Axle",
    "Differential",
    "Transfer Case",
    "Other Transmission Part",
  ],

  "Electrical & Electronics": [
    "Alternator",
    "Starter Motor",
    "Battery",
    "ECU",
    "TCU",
    "BCM",
    "Airbag Module",
    "ABS Module",
    "Fuse Box",
    "Wiring Harness",
    "Ignition Coil",
    "Spark Plug",
    "Glow Plug",
    "Sensors",
    "Oxygen Sensor",
    "MAF Sensor",
    "MAP Sensor",
    "Crankshaft Sensor",
    "Camshaft Sensor",
    "Parking Sensor",
    "Headlight",
    "Tail Light",
    "Fog Light",
    "LED Light",
    "Interior Light",
    "Other Electrical Part",
  ],

  "Braking System": [
    "Brake Pad",
    "Brake Disc",
    "Brake Rotor",
    "Brake Caliper",
    "Brake Master Cylinder",
    "Brake Booster",
    "Brake Drum",
    "Brake Shoe",
    "ABS Sensor",
    "Brake Hose",
    "Brake Line",
    "Other Brake Part",
  ],

  "Suspension & Steering": [
    "Shock Absorber",
    "Strut",
    "Coil Spring",
    "Leaf Spring",
    "Control Arm",
    "Ball Joint",
    "Tie Rod",
    "Tie Rod End",
    "Rack End",
    "Steering Rack",
    "Power Steering Pump",
    "Steering Wheel",
    "Wheel Hub",
    "Wheel Bearing",
    "Stabilizer Link",
    "Stabilizer Bar",
    "Bush",
    "Other Suspension Part",
  ],

  "Body Parts": [
    "Bonnet",
    "Hood",
    "Front Bumper",
    "Rear Bumper",
    "Fender",
    "Front Door",
    "Rear Door",
    "Door Handle",
    "Door Mirror",
    "Side Mirror",
    "Roof",
    "Trunk",
    "Tailgate",
    "Grille",
    "Quarter Panel",
    "Radiator Support",
    "Chassis",
    "Body Kit",
    "Other Body Part",
  ],

  "Cooling System": [
    "Radiator",
    "Radiator Fan",
    "Radiator Fan Motor",
    "Thermostat",
    "Water Pump",
    "Coolant Reservoir",
    "Radiator Hose",
    "Intercooler",
    "Oil Cooler",
    "Other Cooling Part",
  ],

  "Air Conditioning & Heating": [
    "AC Compressor",
    "AC Condenser",
    "AC Evaporator",
    "AC Blower Motor",
    "AC Fan",
    "AC Control Panel",
    "Heater Core",
    "AC Hose",
    "AC Receiver Drier",
    "Other AC Part",
  ],

  "Fuel System": [
    "Fuel Pump",
    "Fuel Injector",
    "Fuel Tank",
    "Fuel Rail",
    "Fuel Filter",
    "Throttle Body",
    "Carburetor",
    "Fuel Pressure Regulator",
    "Other Fuel Part",
  ],

  "Exhaust System": [
    "Exhaust Manifold",
    "Catalytic Converter",
    "Muffler",
    "Silencer",
    "Exhaust Pipe",
    "Downpipe",
    "EGR Valve",
    "DPF",
    "Other Exhaust Part",
  ],

  "Interior Parts": [
    "Dashboard",
    "Instrument Cluster",
    "Center Console",
    "Car Seat",
    "Seat Cover",
    "Door Panel",
    "Floor Mat",
    "Steering Wheel",
    "Gear Knob",
    "Hand Brake",
    "Headliner",
    "Sun Visor",
    "Interior Trim",
    "Other Interior Part",
  ],

  "Wheels & Tyres": [
    "Alloy Wheel",
    "Steel Wheel",
    "Wheel Rim",
    "Tyre",
    "Wheel Cover",
    "Wheel Nut",
    "Wheel Spacer",
    "Other Wheel Part",
  ],

  Accessories: [
    "Roof Rack",
    "Tow Bar",
    "Bull Bar",
    "Spoiler",
    "Running Board",
    "Step Board",
    "Car Alarm",
    "Remote Key",
    "Key Fob",
    "Dash Camera",
    "Car Stereo",
    "Android Screen",
    "Speakers",
    "Other Accessory",
  ],

  "Maintenance Parts": [
    "Oil Filter",
    "Air Filter",
    "Cabin Filter",
    "Fuel Filter",
    "Spark Plug",
    "Glow Plug",
    "Wiper Blade",
    "Wiper Motor",
    "Belts",
    "Fluids",
    "Other Maintenance Part",
  ],

  "Other Spare Parts": ["Other Car Part"],
};

const VEHICLE_MAKES = [
  "Toyota",
  "Lexus",
  "Honda",
  "Nissan",
  "Mazda",
  "Mitsubishi",
  "Hyundai",
  "Kia",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Volkswagen",
  "Ford",
  "Chevrolet",
  "Jeep",
  "Dodge",
  "Chrysler",
  "Subaru",
  "Suzuki",
  "Isuzu",
  "Volvo",
  "Land Rover",
  "Range Rover",
  "Peugeot",
  "Renault",
  "Citroën",
  "Fiat",
  "Opel",
  "Porsche",
  "Jaguar",
  "Tesla",
  "Other",
];

const CONDITIONS = [
  "Brand New",
  "New Old Stock",
  "Used",
  "Refurbished",
  "Reconditioned",
  "Imported Used",
  "Original Used",
];

const PART_TYPES = [
  "Genuine / OEM",
  "Original",
  "Aftermarket",
  "Replacement",
  "Reconditioned",
  "Replica",
  "Unknown",
];

const initialForm = {
  title: "",
  price: "",
  negotiable: false,

  category: "",
  subcategory: "",

  condition: "",
  partType: "",

  description: "",

  partNumber: "",
  oemNumber: "",
  manufacturer: "",
  serialNumber: "",

  vehicleMake: "",
  vehicleModel: "",
  vehicleYearFrom: "",
  vehicleYearTo: "",
  engineSize: "",
  engineType: "",
  transmissionType: "",

  color: "",
  material: "",
  position: "",
  side: "",

  mileage: "",
  mileageUnit: "km",

  quantity: "1",

  location: "Ghana",
  city: "",
  region: "",

  warranty: false,
  warrantyPeriod: "",

  deliveryAvailable: true,
  pickupAvailable: true,

  whatsapp: "",
  phone: "",
};

export default function Autospareparts({
  onSuccess,
  onCancel,
  existingProduct = null,
}) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(existingProduct || {}),
  }));

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subcategories = useMemo(() => {
    return PART_CATEGORIES[form.category] || [];
  }, [form.category]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;

    setForm((previous) => ({
      ...previous,
      category,
      subcategory: "",
    }));

    setErrors((previous) => ({
      ...previous,
      category: "",
      subcategory: "",
    }));

    setSubmitError("");
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const validFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        setSubmitError(`${file.name} is not a valid image.`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSubmitError(`${file.name} is larger than 5MB.`);
        continue;
      }

      validFiles.push(file);

      newPreviews.push({
        file,
        url: URL.createObjectURL(file),
      });
    }

    const availableSlots = 10 - images.length;

    const filesToAdd = validFiles.slice(0, availableSlots);
    const previewsToAdd = newPreviews.slice(0, availableSlots);

    setImages((previous) => [...previous, ...filesToAdd]);
    setImagePreviews((previous) => [...previous, ...previewsToAdd]);

    event.target.value = "";
  };

  const removeImage = (index) => {
    const preview = imagePreviews[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setImages((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );

    setImagePreviews((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );

    setErrors((previous) => ({
      ...previous,
      images: "",
    }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!form.title.trim()) {
      validationErrors.title = "Enter a title for the spare part.";
    }

    if (!form.price) {
      validationErrors.price = "Enter the selling price.";
    } else if (Number(form.price) <= 0) {
      validationErrors.price = "Price must be greater than 0.";
    }

    if (!form.category) {
      validationErrors.category = "Select a part category.";
    }

    if (!form.subcategory) {
      validationErrors.subcategory = "Select the specific part.";
    }

    if (!form.condition) {
      validationErrors.condition = "Select the part condition.";
    }

    if (!form.partType) {
      validationErrors.partType = "Select the part type.";
    }

    if (!form.description.trim()) {
      validationErrors.description = "Describe the spare part.";
    } else if (form.description.trim().length < 20) {
      validationErrors.description =
        "Description should contain at least 20 characters.";
    }

    if (!form.vehicleMake) {
      validationErrors.vehicleMake =
        "Select the vehicle make the part fits.";
    }

    if (!form.vehicleModel.trim()) {
      validationErrors.vehicleModel =
        "Enter the compatible vehicle model.";
    }

    if (
      form.vehicleYearFrom &&
      form.vehicleYearTo &&
      Number(form.vehicleYearFrom) > Number(form.vehicleYearTo)
    ) {
      validationErrors.vehicleYearTo =
        "End year cannot be earlier than start year.";
    }

    if (!form.city.trim()) {
      validationErrors.city = "Enter the location.";
    }

    if (!form.phone.trim()) {
      validationErrors.phone = "Enter a contact phone number.";
    }

    if (images.length === 0 && !existingProduct?.images?.length) {
      validationErrors.images = "Upload at least one image.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const buildProductData = () => {
    return {
      title: form.title.trim(),
      price: Number(form.price),

      category: "Auto Spare Parts",
      subcategory: form.category,

      sparePartCategory: form.category,
      sparePartSubcategory: form.subcategory,

      condition: form.condition,
      partType: form.partType,

      description: form.description.trim(),

      partNumber: form.partNumber.trim(),
      oemNumber: form.oemNumber.trim(),
      manufacturer: form.manufacturer.trim(),
      serialNumber: form.serialNumber.trim(),

      vehicleCompatibility: {
        make: form.vehicleMake,
        model: form.vehicleModel.trim(),
        yearFrom: form.vehicleYearFrom
          ? Number(form.vehicleYearFrom)
          : null,
        yearTo: form.vehicleYearTo ? Number(form.vehicleYearTo) : null,
        engineSize: form.engineSize.trim(),
        engineType: form.engineType,
        transmissionType: form.transmissionType,
      },

      specifications: {
        color: form.color.trim(),
        material: form.material.trim(),
        position: form.position,
        side: form.side,
      },

      quantity: Number(form.quantity) || 1,

      mileage: form.mileage
        ? {
            value: Number(form.mileage),
            unit: form.mileageUnit,
          }
        : null,

      negotiable: Boolean(form.negotiable),

      warranty: {
        available: Boolean(form.warranty),
        period: form.warranty ? form.warrantyPeriod.trim() : "",
      },

      location: {
        country: form.location,
        city: form.city.trim(),
        region: form.region.trim(),
      },

      deliveryAvailable: Boolean(form.deliveryAvailable),
      pickupAvailable: Boolean(form.pickupAvailable),

      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSuccessMessage("");

    if (!validate()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const productData = buildProductData();
      const formData = new FormData();

      formData.append("productData", JSON.stringify(productData));

      images.forEach((image) => {
        formData.append("images", image);
      });

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const url = existingProduct?._id
        ? `${API_URL}/api/products/${existingProduct._id}`
        : `${API_URL}/api/products`;

      const response = await fetch(url, {
        method: existingProduct?._id ? "PUT" : "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";

      let result;

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = {
          message: await response.text(),
        };
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Failed to save the spare-part listing."
        );
      }

      setSuccessMessage(
        result?.message ||
          (existingProduct
            ? "Spare-part listing updated successfully."
            : "Spare-part listing created successfully.")
      );

      if (typeof onSuccess === "function") {
        onSuccess(result);
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Auto spare part submission error:", error);

      setSubmitError(
        error?.message ||
          "Something went wrong while saving the listing."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ name }) => {
    if (!errors[name]) return null;

    return (
      <p className="mt-1 text-sm text-red-600">
        {errors[name]}
      </p>
    );
  };

  const inputClass = (name) =>
    `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
      errors[name]
        ? "border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200"
    }`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Sell Auto Spare Parts
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Add accurate details about the spare part and the vehicles it fits.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Basic Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Listing Title *
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Toyota Corolla 2018 Front Bumper"
                className={inputClass("title")}
                maxLength={150}
              />

              <FieldError name="title" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (GH₵) *
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputClass("price")}
              />

              <FieldError name="price" />
            </div>

            <div className="flex items-center pt-7">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={form.negotiable}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                Price is negotiable
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Main Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                className={inputClass("category")}
              >
                <option value="">Select category</option>

                {Object.keys(PART_CATEGORIES).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <FieldError name="category" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Specific Part *
              </label>

              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                disabled={!form.category}
                className={inputClass("subcategory")}
              >
                <option value="">
                  {form.category
                    ? "Select specific part"
                    : "Select category first"}
                </option>

                {subcategories.map((subcategory) => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>

              <FieldError name="subcategory" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Condition *
              </label>

              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className={inputClass("condition")}
              >
                <option value="">Select condition</option>

                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>

              <FieldError name="condition" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Part Type *
              </label>

              <select
                name="partType"
                value={form.partType}
                onChange={handleChange}
                className={inputClass("partType")}
              >
                <option value="">Select part type</option>

                {PART_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <FieldError name="partType" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Part Details
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Part Number
              </label>

              <input
                name="partNumber"
                value={form.partNumber}
                onChange={handleChange}
                placeholder="e.g. 52119-0D120"
                className={inputClass("partNumber")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                OEM Number
              </label>

              <input
                name="oemNumber"
                value={form.oemNumber}
                onChange={handleChange}
                placeholder="OEM / manufacturer number"
                className={inputClass("oemNumber")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Manufacturer
              </label>

              <input
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Denso"
                className={inputClass("manufacturer")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Serial Number
              </label>

              <input
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                placeholder="Serial number if applicable"
                className={inputClass("serialNumber")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Position
              </label>

              <select
                name="position"
                value={form.position}
                onChange={handleChange}
                className={inputClass("position")}
              >
                <option value="">Select position</option>
                <option value="Front">Front</option>
                <option value="Rear">Rear</option>
                <option value="Center">Center</option>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Front Left">Front Left</option>
                <option value="Front Right">Front Right</option>
                <option value="Rear Left">Rear Left</option>
                <option value="Rear Right">Rear Right</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Side
              </label>

              <select
                name="side"
                value={form.side}
                onChange={handleChange}
                className={inputClass("side")}
              >
                <option value="">Select side</option>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Both">Both</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Color
              </label>

              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="e.g. Black"
                className={inputClass("color")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Material
              </label>

              <input
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="e.g. Plastic, Steel, Aluminium"
                className={inputClass("material")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Vehicle Compatibility
          </h2>

          <p className="mb-5 text-sm text-gray-600">
            Tell buyers exactly which vehicle this part fits.
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Vehicle Make *
              </label>

              <select
                name="vehicleMake"
                value={form.vehicleMake}
                onChange={handleChange}
                className={inputClass("vehicleMake")}
              >
                <option value="">Select vehicle make</option>

                {VEHICLE_MAKES.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>

              <FieldError name="vehicleMake" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Vehicle Model *
              </label>

              <input
                name="vehicleModel"
                value={form.vehicleModel}
                onChange={handleChange}
                placeholder="e.g. Corolla"
                className={inputClass("vehicleModel")}
              />

              <FieldError name="vehicleModel" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Year From
              </label>

              <input
                type="number"
                name="vehicleYearFrom"
                value={form.vehicleYearFrom}
                onChange={handleChange}
                placeholder="2015"
                min="1950"
                max="2100"
                className={inputClass("vehicleYearFrom")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Year To
              </label>

              <input
                type="number"
                name="vehicleYearTo"
                value={form.vehicleYearTo}
                onChange={handleChange}
                placeholder="2020"
                min="1950"
                max="2100"
                className={inputClass("vehicleYearTo")}
              />

              <FieldError name="vehicleYearTo" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Engine Size
              </label>

              <input
                name="engineSize"
                value={form.engineSize}
                onChange={handleChange}
                placeholder="e.g. 1.8L"
                className={inputClass("engineSize")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Engine Type
              </label>

              <select
                name="engineType"
                value={form.engineType}
                onChange={handleChange}
                className={inputClass("engineType")}
              >
                <option value="">Select engine type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Transmission
              </label>

              <select
                name="transmissionType"
                value={form.transmissionType}
                onChange={handleChange}
                className={inputClass("transmissionType")}
              >
                <option value="">Select transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
                <option value="DCT">DCT</option>
                <option value="AMT">AMT</option>
                <option value="Not Applicable">Not Applicable</option>
              </select>
            </div>
          </div>
        </section>

        {(form.condition === "Used" ||
          form.condition === "Imported Used" ||
          form.condition === "Original Used") && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 text-lg font-semibold text-gray-900">
              Used Part Information
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Mileage
                </label>

                <input
                  type="number"
                  name="mileage"
                  value={form.mileage}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 85000"
                  className={inputClass("mileage")}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Mileage Unit
                </label>

                <select
                  name="mileageUnit"
                  value={form.mileageUnit}
                  onChange={handleChange}
                  className={inputClass("mileageUnit")}
                >
                  <option value="km">Kilometres</option>
                  <option value="miles">Miles</option>
                </select>
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Description
          </h2>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={7}
            maxLength={5000}
            placeholder="Describe the part, condition, compatibility, defects, installation information, and anything else buyers should know..."
            className={inputClass("description")}
          />

          <div className="mt-2 flex justify-between">
            <FieldError name="description" />

            <span className="ml-auto text-xs text-gray-500">
              {form.description.length}/5000
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Photos *
          </h2>

          <p className="mb-5 text-sm text-gray-600">
            Upload up to 10 clear photos. Maximum 5MB per image.
          </p>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-gray-500">
            <span className="text-3xl">📷</span>

            <span className="mt-3 text-sm font-medium text-gray-900">
              Click to upload photos
            </span>

            <span className="mt-1 text-xs text-gray-500">
              JPG, JPEG, PNG or WebP
            </span>

            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={images.length >= 10}
            />
          </label>

          <FieldError name="images" />

          {imagePreviews.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {imagePreviews.map((preview, index) => (
                <div
                  key={`${preview.url}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-gray-200"
                >
                  <img
                    src={preview.url}
                    alt={`Spare part ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-black px-2 py-1 text-xs text-white">
                      Main
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            {images.length}/10 images selected
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Location & Contact
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Country
              </label>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass("location")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Region
              </label>

              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="e.g. Greater Accra"
                className={inputClass("region")}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                City / Area *
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Accra"
                className={inputClass("city")}
              />

              <FieldError name="city" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone *
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 024XXXXXXX"
                className={inputClass("phone")}
              />

              <FieldError name="phone" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                WhatsApp
              </label>

              <input
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="WhatsApp number"
                className={inputClass("whatsapp")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Delivery & Pickup
          </h2>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="deliveryAvailable"
                checked={form.deliveryAvailable}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Delivery available
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="pickupAvailable"
                checked={form.pickupAvailable}
                onChange={handleChange}
                className="h-4 w-4"
              />
              Buyer can pick up
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Warranty
          </h2>

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="warranty"
              checked={form.warranty}
              onChange={handleChange}
              className="h-4 w-4"
            />
            This part comes with a warranty
          </label>

          {form.warranty && (
            <div className="mt-4 max-w-md">
              <label className="mb-2 block text-sm font-medium">
                Warranty Period
              </label>

              <input
                name="warrantyPeriod"
                value={form.warrantyPeriod}
                onChange={handleChange}
                placeholder="e.g. 3 months"
                className={inputClass("warrantyPeriod")}
              />
            </div>
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Publishing..."
              : existingProduct
                ? "Update Listing"
                : "Publish Spare Part"}
          </button>
        </div>
      </form>
    </div>
  );
}