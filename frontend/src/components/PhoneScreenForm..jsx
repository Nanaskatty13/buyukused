// frontend/src/components/PhoneScreenForm.jsx
import React from "react";

// ─── Option lists (same as in the original screen form) ──────────
const SCREEN_TYPES = [
  "Original",
  "Original Pulled",
  "OEM",
  "OEM Pulled",
  "Aftermarket",
  "Refurbished",
  "Incell",
  "OLED",
  "AMOLED",
  "LCD",
];

const SCREEN_CONDITIONS = [
  "Brand New",
  "New",
  "Used - Like New",
  "Used - Good",
  "Refurbished",
];

const TOUCH_OPTIONS = ["Fully Working", "Partially Working", "Not Working"];
const DISPLAY_OPTIONS = [
  "Fully Working",
  "Dead Pixels",
  "Lines on Display",
  "Burn-in",
  "Flickering",
  "Not Working",
];
const FRAME_OPTIONS = [
  "Screen Only",
  "Screen + Frame",
  "Complete Screen Assembly",
];
const WARRANTY_OPTIONS = [
  "No Warranty",
  "3 Days",
  "7 Days",
  "14 Days",
  "30 Days",
  "60 Days",
  "90 Days",
  "6 Months",
];
const SCREEN_COLORS = [
  "Black",
  "White",
  "Gold",
  "Silver",
  "Blue",
  "Green",
  "Purple",
  "Red",
  "Pink",
  "Titanium",
  "Other",
];

const PhoneScreenForm = ({
  formData,
  handleChange,
  handleCheckboxChange, // not used but kept for consistency
  errors = {},
}) => {
  // ─── Render ────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ margin: "0 0 6px", fontSize: "18px" }}>
        📱 Phone Screen Details
      </h3>
      <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "13px" }}>
        Provide details about the replacement screen.
      </p>

      {/* ─── Screen Type ─────────────────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Screen Type *
        </label>
        <select
          name="screenType"
          value={formData.screenType || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px" }}
        >
          <option value="">Select screen type</option>
          {SCREEN_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.screenType && (
          <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
            {errors.screenType}
          </div>
        )}
      </div>

      {/* ─── Screen Condition ────────────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Screen Condition *
        </label>
        <select
          name="screenCondition"
          value={formData.screenCondition || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px" }}
        >
          <option value="">Select condition</option>
          {SCREEN_CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </select>
        {errors.screenCondition && (
          <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
            {errors.screenCondition}
          </div>
        )}
      </div>

      {/* ─── Touch Condition ─────────────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Touch Condition *
        </label>
        <select
          name="touch"
          value={formData.touch || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px" }}
        >
          <option value="">Select touch condition</option>
          {TOUCH_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.touch && (
          <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
            {errors.touch}
          </div>
        )}
      </div>

      {/* ─── Display Condition ───────────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Display Condition *
        </label>
        <select
          name="display"
          value={formData.display || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px" }}
        >
          <option value="">Select display condition</option>
          {DISPLAY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.display && (
          <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
            {errors.display}
          </div>
        )}
      </div>

      {/* ─── Screen Package (Frame) ─────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Screen Package *
        </label>
        <select
          name="frame"
          value={formData.frame || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px" }}
        >
          <option value="">Select package</option>
          {FRAME_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.frame && (
          <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
            {errors.frame}
          </div>
        )}
      </div>

      {/* ─── Screen Color ────────────────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Screen Color
        </label>
        <select
          name="color"
          value={formData.color || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px" }}
        >
          <option value="">Select color</option>
          {SCREEN_COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Quantity ────────────────────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Quantity *
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity || "1"}
          onChange={handleChange}
          min="1"
          step="1"
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />
        {errors.quantity && (
          <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
            {errors.quantity}
          </div>
        )}
      </div>

      {/* ─── Warranty ────────────────────────────────────────────── */}
      <div className="form-group" style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
          Warranty *
        </label>
        <select
          name="warranty"
          value={formData.warranty || ""}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px 12px" }}
        >
          <option value="">Select warranty</option>
          {WARRANTY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {errors.warranty && (
          <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
            {errors.warranty}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneScreenForm;