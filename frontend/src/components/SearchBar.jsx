// frontend/src/components/SearchBar.jsx

import React, { useEffect, useRef, useState } from "react";

const SearchBar = ({ onSearch, initialQuery = {} }) => {
  const [search, setSearch] = useState(initialQuery.search || "");
  const [category, setCategory] = useState(
    initialQuery.category || "all"
  );
  const [location, setLocation] = useState(
    initialQuery.location || "all"
  );

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef(null);

  // ============================================================
  // KEEP SEARCH BAR IN SYNC WITH PARENT
  // ============================================================

  useEffect(() => {
    setSearch(initialQuery.search || "");
    setCategory(initialQuery.category || "all");
    setLocation(initialQuery.location || "all");
  }, [
    initialQuery.search,
    initialQuery.category,
    initialQuery.location,
  ]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    onSearch({
      search: search.trim(),
      category,
      location,
      image: selectedImage || null,
    });
  };

  // ============================================================
  // OPEN FILE PICKER
  // ============================================================

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // ============================================================
  // IMAGE SELECT
  // ============================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // ----------------------------------------------------------
    // Validate file type
    // ----------------------------------------------------------

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }

    // ----------------------------------------------------------
    // Validate file size
    // ----------------------------------------------------------

    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (file.size > maxSize) {
      alert("Image must be smaller than 10 MB.");
      e.target.value = "";
      return;
    }

    // ----------------------------------------------------------
    // Clean up previous preview
    // ----------------------------------------------------------

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // ----------------------------------------------------------
    // Create preview
    // ----------------------------------------------------------

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreview(previewUrl);

    // ----------------------------------------------------------
    // Automatically notify parent
    // ----------------------------------------------------------

    onSearch({
      search: search.trim(),
      category,
      location,
      image: file,
    });
  };

  // ============================================================
  // REMOVE IMAGE
  // ============================================================

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onSearch({
      search: search.trim(),
      category,
      location,
      image: null,
    });
  };

  // ============================================================
  // CLEANUP OBJECT URL
  // ============================================================

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="search-wrapper">

      <form
        onSubmit={handleSubmit}
        className="search-box-modern"
      >

        {/* ======================================================
            PRIMARY SEARCH ROW
        ====================================================== */}

        <div
          className="search-primary"
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: "8px",
            width: "100%",
          }}
        >

          {/* SEARCH INPUT */}

          <div
            className="search-input-wrap"
            style={{
              flex: 1,
              minWidth: 0,
              position: "relative",
            }}
          >
            <i
              className="fas fa-search search-icon"
              aria-hidden="true"
            ></i>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products..."
              className="search-input"
              aria-label="Search for products"
            />
          </div>

          {/* ====================================================
              UPLOAD PICTURE BUTTON
          ==================================================== */}

          <button
            type="button"
            className="search-upload-button"
            onClick={handleUploadClick}
            title="Search using a picture"
            aria-label="Upload a picture"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              padding: "0 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              background: "#fff",
              color: "#333",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f7fa";
              e.currentTarget.style.borderColor = "#0066cc";
              e.currentTarget.style.color = "#0066cc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.color = "#333";
            }}
          >
            <i
              className="fas fa-camera"
              aria-hidden="true"
            ></i>

            <span>Search by image</span>
          </button>

          {/* HIDDEN FILE INPUT */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          {/* SEARCH BUTTON */}

          <button
            type="submit"
            className="search-submit"
          >
            <i
              className="fas fa-arrow-right"
              aria-hidden="true"
            ></i>

            <span>Search</span>
          </button>
        </div>

        {/* ======================================================
            IMAGE PREVIEW
        ====================================================== */}

        {imagePreview && (
          <div
            className="search-image-preview"
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#f9fafb",
            }}
          >
            <img
              src={imagePreview}
              alt="Selected search"
              style={{
                width: "64px",
                height: "64px",
                objectFit: "cover",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            />

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedImage?.name || "Selected picture"}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#777",
                  marginTop: "3px",
                }}
              >
                Picture selected for search
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="Remove selected picture"
              title="Remove picture"
              style={{
                width: "32px",
                height: "32px",
                border: "none",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i
                className="fas fa-times"
                aria-hidden="true"
              ></i>
            </button>
          </div>
        )}

        {/* ======================================================
            SECONDARY FILTER ROW
        ====================================================== */}

        <div className="search-filters">

          {/* LOCATION */}

          <div className="filter-group">

            <i
              className="fas fa-map-marker-alt filter-icon"
              aria-hidden="true"
            ></i>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="filter-select"
              aria-label="Filter by location"
            >
              <option value="all">
                All Locations
              </option>

              <option value="Accra">
                Accra
              </option>

              <option value="Kumasi">
                Kumasi
              </option>

              <option value="Tema">
                Tema
              </option>

              <option value="Takoradi">
                Takoradi
              </option>

              <option value="Tamale">
                Tamale
              </option>
            </select>
          </div>

          {/* CATEGORY */}

          <div className="filter-group">

            <i
              className="fas fa-list-ul filter-icon"
              aria-hidden="true"
            ></i>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
              aria-label="Filter by category"
            >
              <option value="all">
                All Categories
              </option>

              <option value="Phones">
                Phones
              </option>

              <option value="Laptops">
                Laptops
              </option>

              <option value="Tablets">
                Tablets
              </option>

              <option value="Accessories">
                Accessories
              </option>

              <option value="TV & Game Consoles">
                TV & Game Consoles
              </option>

              <option value="Electronics">
                Electronics
              </option>
            </select>
          </div>

        </div>
      </form>
    </div>
  );
};

export default SearchBar;