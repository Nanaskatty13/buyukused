// frontend/src/components/FilterSidebar.jsx
import React from "react";

/**
 * FilterSidebar – Tonaton‑style sidebar filters for the Products page.
 * 
 * Props:
 * - filters: { category, location, search, ... }
 * - setFilters: function to update filters
 * - priceMin: string
 * - setPriceMin: function
 * - priceMax: string
 * - setPriceMax: function
 * - verifiedOnly: boolean
 * - setVerifiedOnly: function
 * - discountOnly: boolean
 * - setDiscountOnly: function
 * - onClearFilters: function
 * - categories: array (optional) – if not provided, default categories are used
 * - activeCategory: string (optional) – for highlighting the selected category
 */
const FilterSidebar = ({
  filters,
  setFilters,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  verifiedOnly,
  setVerifiedOnly,
  discountOnly,
  setDiscountOnly,
  onClearFilters,
  categories = [
    "Phones",
    "Laptops",
    "Tablets",
    "TVs",
    "Game Consoles",
    "Accessories",
  ],
  activeCategory,
}) => {
  return (
    <aside
      className="filter-sidebar"
      style={{
        width: "250px",
        flexShrink: 0,
      }}
    >
      {/* Categories */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Categories
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {categories.map((cat) => (
            <li
              key={cat}
              style={{
                padding: "6px 0",
                fontSize: "14px",
                color: activeCategory === cat ? "#0066cc" : "#333",
                fontWeight: activeCategory === cat ? 700 : 400,
                cursor: "pointer",
                borderBottom: "1px solid #f1f5f9",
              }}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  category: cat === "all" ? "all" : cat,
                }))
              }
            >
              {cat}
            </li>
          ))}
          <li
            style={{
              padding: "6px 0",
              fontSize: "14px",
              color: activeCategory === "all" ? "#0066cc" : "#0066cc",
              fontWeight: activeCategory === "all" ? 700 : 400,
              cursor: "pointer",
            }}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                category: "all",
              }))
            }
          >
            All Categories
          </li>
        </ul>
      </div>

      {/* Location Filter */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Location
        </h3>
        <input
          type="text"
          value={filters.location === "all" ? "" : filters.location}
          placeholder="Enter location"
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              location: e.target.value || "all",
            }))
          }
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: "4px",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      {/* Price Range Filter */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Price, GH₵
        </h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input
            type="number"
            placeholder="min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            style={{
              width: "50%",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <input
            type="number"
            placeholder="max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            style={{
              width: "50%",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={() => {
            setPriceMin("");
            setPriceMax("");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#0066cc",
            cursor: "pointer",
            fontSize: "13px",
            padding: 0,
          }}
        >
          Clear price
        </button>
      </div>

      {/* Verified Sellers */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Verified sellers
        </h3>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          Verified only
        </label>
      </div>

      {/* Discount */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Discount
        </h3>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={discountOnly}
            onChange={(e) => setDiscountOnly(e.target.checked)}
          />
          On sale
        </label>
      </div>

      {/* Clear All */}
      <button
        onClick={onClearFilters}
        style={{
          width: "100%",
          padding: "10px",
          background: "#f4f5f7",
          border: "1px solid #e5e7eb",
          borderRadius: "4px",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Clear All Filters
      </button>
    </aside>
  );
};

export default FilterSidebar;