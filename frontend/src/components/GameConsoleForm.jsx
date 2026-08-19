// ============================================================
// frontend/src/components/GameConsoleForm.jsx
// ============================================================

import React from "react";

// ============================================================
// CONSOLE BRANDS
// ============================================================

export const CONSOLE_BRANDS = [
  "Sony",
  "Microsoft",
  "Nintendo",
  "Valve",
  "Sega",
  "Atari",
  "Other",
];

// ============================================================
// CONSOLE TYPES
// ============================================================

export const CONSOLE_TYPES = [
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Steam Deck",
  "Gaming PC",
  "Other",
];

// ============================================================
// PLAYSTATION MODELS
// ============================================================

export const PLAYSTATION_MODELS = [
  "PlayStation 5",
  "PlayStation 5 Slim",
  "PlayStation 5 Pro",
  "PlayStation 4",
  "PlayStation 4 Slim",
  "PlayStation 4 Pro",
  "PlayStation 3",
  "PlayStation 2",
  "PlayStation",
  "PS Vita",
  "Other",
];

// ============================================================
// XBOX MODELS
// ============================================================

export const XBOX_MODELS = [
  "Xbox Series X",
  "Xbox Series S",
  "Xbox One X",
  "Xbox One S",
  "Xbox One",
  "Xbox 360",
  "Xbox",
  "Other",
];

// ============================================================
// NINTENDO MODELS
// ============================================================

export const NINTENDO_MODELS = [
  "Nintendo Switch OLED",
  "Nintendo Switch",
  "Nintendo Switch Lite",
  "Nintendo Wii U",
  "Nintendo Wii",
  "Nintendo 3DS",
  "Nintendo 2DS",
  "Nintendo DS",
  "Other",
];

// ============================================================
// COMPONENT
// ============================================================

const GameConsoleForm = ({
  formData = {},
  handleChange,
  setFormData,
}) => {
  // ----------------------------------------------------------
  // Safe change handler
  // ----------------------------------------------------------

  const onChange = (event) => {
    if (typeof handleChange === "function") {
      handleChange(event);
      return;
    }

    if (typeof setFormData === "function") {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      }));
    }
  };

  // ----------------------------------------------------------
  // Values
  // ----------------------------------------------------------

  const consoleBrand =
    formData.consoleBrand ||
    formData.brand ||
    "";

  const consoleType =
    formData.consoleType ||
    "";

  const consoleModel =
    formData.consoleModel ||
    formData.model ||
    "";

  const storage =
    formData.storage ||
    "";

  const condition =
    formData.condition ||
    "";

  const color =
    formData.color ||
    "";

  const warranty =
    formData.warranty ||
    "";

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="game-console-form">
      {/* ======================================================
          BRAND
      ====================================================== */}

      <div className="form-group">
        <label htmlFor="consoleBrand">
          Console Brand
        </label>

        <select
          id="consoleBrand"
          name="consoleBrand"
          value={consoleBrand}
          onChange={onChange}
        >
          <option value="">
            Select console brand
          </option>

          {CONSOLE_BRANDS.map(
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

      {/* ======================================================
          CONSOLE TYPE
      ====================================================== */}

      <div className="form-group">
        <label htmlFor="consoleType">
          Console Type
        </label>

        <select
          id="consoleType"
          name="consoleType"
          value={consoleType}
          onChange={onChange}
        >
          <option value="">
            Select console type
          </option>

          {CONSOLE_TYPES.map(
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

      {/* ======================================================
          MODEL
      ====================================================== */}

      <div className="form-group">
        <label htmlFor="consoleModel">
          Model
        </label>

        <input
          id="consoleModel"
          type="text"
          name="consoleModel"
          value={consoleModel}
          onChange={onChange}
          placeholder="e.g. PlayStation 5 Slim"
        />
      </div>

      {/* ======================================================
          STORAGE
      ====================================================== */}

      <div className="form-group">
        <label htmlFor="storage">
          Storage
        </label>

        <select
          id="storage"
          name="storage"
          value={storage}
          onChange={onChange}
        >
          <option value="">
            Select storage
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

          <option value="Other">
            Other
          </option>
        </select>
      </div>

      {/* ======================================================
          CONDITION
      ====================================================== */}

      <div className="form-group">
        <label htmlFor="condition">
          Condition
        </label>

        <select
          id="condition"
          name="condition"
          value={condition}
          onChange={onChange}
        >
          <option value="">
            Select condition
          </option>

          <option value="Brand New">
            Brand New
          </option>

          <option value="Like New">
            Like New
          </option>

          <option value="Excellent">
            Excellent
          </option>

          <option value="Good">
            Good
          </option>

          <option value="Fair">
            Fair
          </option>

          <option value="Poor">
            Poor
          </option>
        </select>
      </div>

      {/* ======================================================
          COLOR
      ====================================================== */}

      <div className="form-group">
        <label htmlFor="color">
          Color
        </label>

        <input
          id="color"
          type="text"
          name="color"
          value={color}
          onChange={onChange}
          placeholder="e.g. Black"
        />
      </div>

      {/* ======================================================
          WARRANTY
      ====================================================== */}

      <div className="form-group">
        <label htmlFor="warranty">
          Warranty
        </label>

        <select
          id="warranty"
          name="warranty"
          value={warranty}
          onChange={onChange}
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

          <option value="4 weeks">
            4 weeks
          </option>

          {Array.from(
            { length: 12 },
            (_, index) => {
              const months =
                index + 1;

              return (
                <option
                  key={months}
                  value={`${months} month${
                    months > 1
                      ? "s"
                      : ""
                  }`}
                >
                  {months} month
                  {months > 1
                    ? "s"
                    : ""}
                </option>
              );
            }
          )}

          <option value="1 year">
            1 year
          </option>
        </select>
      </div>

      {/* ======================================================
          NOTES
      ====================================================== */}

      <div
        style={{
          marginTop: "12px",
          padding: "12px",
          borderRadius: "8px",
          background: "#f8fafc",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        Enter the correct console brand,
        model, storage, condition and
        warranty information for this
        gaming console.
      </div>
    </div>
  );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default GameConsoleForm;