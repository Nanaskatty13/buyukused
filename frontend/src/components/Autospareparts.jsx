// frontend/src/components/Autospareparts.jsx
"use client";

import React, { useMemo } from "react";

// ============================================================
// DATA
// ============================================================

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

// ============================================================
// COMPONENT
// ============================================================

export default function Autospareparts({
  formData,
  handleChange,
  handleCheckboxChange,
  errors = {},
}) {
  const subcategories = useMemo(() => {
    return PART_CATEGORIES[formData.sparePartCategory] || [];
  }, [formData.sparePartCategory]);

  const inputClass = (fieldName) => {
    const hasError = errors[fieldName];
    return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
      hasError
        ? "border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-black focus:ring-2 focus:ring-gray-200"
    }`;
  };

  const FieldError = ({ name }) => {
    if (!errors[name]) return null;
    return <p className="mt-1 text-sm text-red-600">{errors[name]}</p>;
  };

  return (
    <div className="space-y-6">
      {/* ==========================================================
          PART CATEGORY
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Main Category *
        </label>

        <select
          name="sparePartCategory"
          value={formData.sparePartCategory || ""}
          onChange={handleChange}
          className={inputClass("sparePartCategory")}
        >
          <option value="">Select category</option>

          {Object.keys(PART_CATEGORIES).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <FieldError name="sparePartCategory" />
      </div>

      {/* ==========================================================
          SPECIFIC PART
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Specific Part *
        </label>

        <select
          name="sparePartType"
          value={formData.sparePartType || ""}
          onChange={handleChange}
          disabled={!formData.sparePartCategory}
          className={inputClass("sparePartType")}
        >
          <option value="">
            {formData.sparePartCategory
              ? "Select specific part"
              : "Select category first"}
          </option>

          {subcategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <FieldError name="sparePartType" />
      </div>

      {/* ==========================================================
          CONDITION
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Condition *
        </label>

        <select
          name="sparePartCondition"
          value={formData.sparePartCondition || ""}
          onChange={handleChange}
          className={inputClass("sparePartCondition")}
        >
          <option value="">Select condition</option>

          {CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </select>

        <FieldError name="sparePartCondition" />
      </div>

      {/* ==========================================================
          PART TYPE (fixed name)
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Part Type *
        </label>

        <select
          name="sparePartType" // ✅ matches PostAd
          value={formData.sparePartType || ""}
          onChange={handleChange}
          className={inputClass("sparePartType")}
        >
          <option value="">Select part type</option>

          {PART_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <FieldError name="sparePartType" />
      </div>

      {/* ==========================================================
          PART NUMBER
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Part Number
        </label>

        <input
          type="text"
          name="sparePartPartNumber"
          value={formData.sparePartPartNumber || ""}
          onChange={handleChange}
          placeholder="e.g. 52119-0D120"
          className={inputClass("sparePartPartNumber")}
        />

        <FieldError name="sparePartPartNumber" />
      </div>

      {/* ==========================================================
          OEM NUMBER
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          OEM Number
        </label>

        <input
          type="text"
          name="sparePartOem"
          value={formData.sparePartOem || ""}
          onChange={handleChange}
          placeholder="OEM number"
          className={inputClass("sparePartOem")}
        />

        <FieldError name="sparePartOem" />
      </div>

      {/* ==========================================================
          BRAND / MANUFACTURER
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Brand / Manufacturer
        </label>

        <input
          type="text"
          name="sparePartBrand"
          value={formData.sparePartBrand || ""}
          onChange={handleChange}
          placeholder="e.g. Denso, Bosch"
          className={inputClass("sparePartBrand")}
        />

        <FieldError name="sparePartBrand" />
      </div>

      {/* ==========================================================
          VEHICLE MAKE
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Compatible Vehicle Make *
        </label>

        <select
          name="sparePartVehicleMake"
          value={formData.sparePartVehicleMake || ""}
          onChange={handleChange}
          className={inputClass("sparePartVehicleMake")}
        >
          <option value="">Select vehicle make</option>

          {VEHICLE_MAKES.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>

        <FieldError name="sparePartVehicleMake" />
      </div>

      {/* ==========================================================
          VEHICLE MODEL
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Compatible Vehicle Model *
        </label>

        <input
          type="text"
          name="sparePartVehicleModel"
          value={formData.sparePartVehicleModel || ""}
          onChange={handleChange}
          placeholder="e.g. Corolla"
          className={inputClass("sparePartVehicleModel")}
        />

        <FieldError name="sparePartVehicleModel" />
      </div>

      {/* ==========================================================
          YEAR FROM / TO
      ========================================================== */}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-group">
          <label className="mb-2 block text-sm font-medium">
            Year From
          </label>

          <input
            type="number"
            name="sparePartVehicleYearFrom"
            value={formData.sparePartVehicleYearFrom || ""}
            onChange={handleChange}
            placeholder="2015"
            min="1950"
            max="2100"
            className={inputClass("sparePartVehicleYearFrom")}
          />

          <FieldError name="sparePartVehicleYearFrom" />
        </div>

        <div className="form-group">
          <label className="mb-2 block text-sm font-medium">
            Year To
          </label>

          <input
            type="number"
            name="sparePartVehicleYearTo"
            value={formData.sparePartVehicleYearTo || ""}
            onChange={handleChange}
            placeholder="2020"
            min="1950"
            max="2100"
            className={inputClass("sparePartVehicleYearTo")}
          />

          <FieldError name="sparePartVehicleYearTo" />
        </div>
      </div>

      {/* ==========================================================
          POSITION
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Position
        </label>

        <select
          name="sparePartPosition"
          value={formData.sparePartPosition || ""}
          onChange={handleChange}
          className={inputClass("sparePartPosition")}
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

        <FieldError name="sparePartPosition" />
      </div>

      {/* ==========================================================
          SIDE
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Side
        </label>

        <select
          name="sparePartSide"
          value={formData.sparePartSide || ""}
          onChange={handleChange}
          className={inputClass("sparePartSide")}
        >
          <option value="">Select side</option>
          <option value="Left">Left</option>
          <option value="Right">Right</option>
          <option value="Both">Both</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>

        <FieldError name="sparePartSide" />
      </div>

      {/* ==========================================================
          COLOR
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Color
        </label>

        <input
          type="text"
          name="sparePartColor"
          value={formData.sparePartColor || ""}
          onChange={handleChange}
          placeholder="e.g. Black"
          className={inputClass("sparePartColor")}
        />

        <FieldError name="sparePartColor" />
      </div>

      {/* ==========================================================
          MATERIAL
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Material
        </label>

        <input
          type="text"
          name="sparePartMaterial"
          value={formData.sparePartMaterial || ""}
          onChange={handleChange}
          placeholder="e.g. Steel, Aluminum, Plastic"
          className={inputClass("sparePartMaterial")}
        />

        <FieldError name="sparePartMaterial" />
      </div>

      {/* ==========================================================
          QUANTITY
      ========================================================== */}

      <div className="form-group">
        <label className="mb-2 block text-sm font-medium">
          Quantity Available
        </label>

        <input
          type="number"
          name="sparePartQuantity"
          value={formData.sparePartQuantity || 1}
          onChange={handleChange}
          min="1"
          className={inputClass("sparePartQuantity")}
        />

        <FieldError name="sparePartQuantity" />
      </div>

      {/* ==========================================================
          WARRANTY (checkbox)
      ========================================================== */}

      <div className="form-group">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="sparePartWarranty"
            checked={formData.sparePartWarranty || false}
            onChange={handleCheckboxChange}
            className="h-4 w-4"
          />

          This part comes with a warranty
        </label>

        <FieldError name="sparePartWarranty" />
      </div>

      {/* ==========================================================
          NEW/USED toggles (optional)
      ========================================================== */}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-group">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="sparePartNewUsed"
              checked={formData.sparePartNewUsed || false}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />

            This is a new part
          </label>
        </div>

        <div className="form-group">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="sparePartOriginal"
              checked={formData.sparePartOriginal || false}
              onChange={handleCheckboxChange}
              className="h-4 w-4"
            />

            This is an original part
          </label>
        </div>
      </div>
    </div>
  );
}