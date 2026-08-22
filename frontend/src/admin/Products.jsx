// ============================================================
// frontend/src/admin/Products.jsx
// BuyUKUsed Products + Visual Product Search
// ============================================================

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { useSearchParams } from "react-router-dom";

import {
  getProducts,
  getCategories,
  getLocations,
} from "../../api";

import ProductCard from "../../components/ProductCard";
import Loader from "../../components/Loader";

// ============================================================
// API URL
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// ============================================================
// COMPONENT
// ============================================================

const Products = () => {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [
    filters,
    setFilters,
  ] = useState({
    category:
      searchParams.get(
        "category"
      ) || "",

    location:
      searchParams.get(
        "location"
      ) || "",

    search:
      searchParams.get(
        "search"
      ) || "",

    minPrice:
      searchParams.get(
        "minPrice"
      ) || "",

    maxPrice:
      searchParams.get(
        "maxPrice"
      ) || "",

    simStatus:
      searchParams.get(
        "simStatus"
      ) || "",

    limit: 0,
  });

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    total,
    setTotal,
  ] = useState(0);

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);

  // ==========================================================
  // LOCATIONS
  // ==========================================================

  const [
    locations,
    setLocations,
  ] = useState([]);

  const [
    locationsLoading,
    setLocationsLoading,
  ] = useState(true);

  // ==========================================================
  // VISUAL SEARCH
  // ==========================================================

  const [
    imageSearching,
    setImageSearching,
  ] = useState(false);

  const [
    imageSearchActive,
    setImageSearchActive,
  ] = useState(false);

  const [
    imageSearchInfo,
    setImageSearchInfo,
  ] = useState(null);

  const fileInputRef =
    useRef(null);

  // ==========================================================
  // SIM STATUS
  // ==========================================================

  const simStatusOptions = [
    "eSIM Unlocked",
    "SIM Unlocked",
    "Locked",
    "Bypass",
  ];

  // ==========================================================
  // FETCH CATEGORIES + LOCATIONS
  // ==========================================================

  useEffect(() => {
    const fetchData =
      async () => {
        try {
          const catData =
            await getCategories();

          const categoryNames =
            catData.categories.map(
              (cat) => cat.name
            );

          setCategories(
            categoryNames
          );
        } catch (err) {
          console.error(
            "Failed to fetch categories:",
            err
          );

          setCategories([
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
          ]);
        } finally {
          setCategoriesLoading(
            false
          );
        }

        try {
          const locData =
            await getLocations();

          setLocations(
            locData.locations ||
              []
          );
        } catch (err) {
          console.error(
            "Failed to fetch locations:",
            err
          );

          setLocations([
            "Ghana",
            "Accra",
            "Kumasi",
            "Takoradi",
            "Tamale",
            "Tema",
            "Cape Coast",
          ]);
        } finally {
          setLocationsLoading(
            false
          );
        }
      };

    fetchData();
  }, []);

  // ==========================================================
  // NORMAL PRODUCT SEARCH
  // ==========================================================

  const fetchProducts =
    useCallback(
      async () => {
        // Don't replace visual-search results
        // with the normal search request.
        if (imageSearchActive) {
          return;
        }

        setLoading(true);
        setError("");

        try {
          const params = {
            ...filters,
          };

          Object.keys(
            params
          ).forEach((key) => {
            if (
              params[key] === "" ||
              params[key] === null ||
              params[key] ===
                undefined
            ) {
              delete params[key];
            }
          });

          const data =
            await getProducts(
              params
            );

          setProducts(
            data.products || []
          );

          setTotal(
            data.total ||
              data.pagination
                ?.totalProducts ||
              0
          );
        } catch (err) {
          setError(
            err.message ||
              "Failed to load products"
          );

          setProducts([]);
        } finally {
          setLoading(false);
        }
      },
      [
        filters,
        imageSearchActive,
      ]
    );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==========================================================
  // UPDATE URL
  // ==========================================================

  useEffect(() => {
    if (imageSearchActive) {
      return;
    }

    const params = {};

    Object.keys(filters).forEach(
      (key) => {
        if (
          filters[key] &&
          key !== "limit"
        ) {
          params[key] =
            filters[key];
        }
      }
    );

    setSearchParams(params);
  }, [
    filters,
    setSearchParams,
    imageSearchActive,
  ]);

  // ==========================================================
  // FILTER CHANGE
  // ==========================================================

  const handleFilterChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setImageSearchActive(
        false
      );

      setImageSearchInfo(
        null
      );

      setFilters(
        (prev) => ({
          ...prev,
          [name]: value,
        })
      );
    };

  // ==========================================================
  // NORMAL SEARCH
  // ==========================================================

  const handleSearchSubmit =
    (e) => {
      e.preventDefault();

      setImageSearchActive(
        false
      );

      setImageSearchInfo(
        null
      );

      fetchProducts();
    };

  // ==========================================================
  // OPEN IMAGE PICKER
  // ==========================================================

  const openImagePicker =
    () => {
      if (
        fileInputRef.current
      ) {
        fileInputRef.current.click();
      }
    };

  // ==========================================================
  // IMAGE SEARCH
  // ==========================================================

  const handleImageSearch =
    async (e) => {
      const file =
        e.target.files?.[0];

      if (!file) {
        return;
      }

      // Reset input so the same image
      // can be selected again.
      e.target.value = "";

      // ------------------------------------------------------
      // Validate file
      // ------------------------------------------------------

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        setError(
          "Please select a JPG, PNG or WEBP image."
        );

        return;
      }

      if (
        file.size >
        8 * 1024 * 1024
      ) {
        setError(
          "Image must be smaller than 8MB."
        );

        return;
      }

      // ------------------------------------------------------
      // START
      // ------------------------------------------------------

      setImageSearching(
        true
      );

      setImageSearchActive(
        true
      );

      setImageSearchInfo(
        null
      );

      setError("");

      setLoading(false);

      try {
        const formData =
          new FormData();

        formData.append(
          "image",
          file
        );

        const response =
          await fetch(
            `${API_URL}/api/products/image-search`,
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Image search failed"
          );
        }

        setProducts(
          data.products || []
        );

        setTotal(
          data.total ||
            data.products
              ?.length ||
            0
        );

        setImageSearchInfo(
          data.analysis ||
            null
        );

        if (
          !data.products ||
          data.products.length === 0
        ) {
          setError(
            "No similar products were found."
          );
        }
      } catch (err) {
        console.error(
          "Image search error:",
          err
        );

        setError(
          err.message ||
            "Unable to search by image."
        );

        setProducts([]);
        setTotal(0);
      } finally {
        setImageSearching(
          false
        );
      }
    };

  // ==========================================================
  // EXIT IMAGE SEARCH
  // ==========================================================

  const clearImageSearch =
    async () => {
      setImageSearchActive(
        false
      );

      setImageSearchInfo(
        null
      );

      setError("");

      setFilters(
        (prev) => ({
          ...prev,
          search: "",
        })
      );
    };

  // ==========================================================
  // CLEAR ALL FILTERS
  // ==========================================================

  const clearFilters =
    () => {
      setImageSearchActive(
        false
      );

      setImageSearchInfo(
        null
      );

      setError("");

      setFilters({
        category: "",
        location: "",
        search: "",
        minPrice: "",
        maxPrice: "",
        simStatus: "",
        limit: 0,
      });
    };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="container"
      style={{
        padding:
          "40px 20px",
      }}
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <h1
        style={{
          fontSize: "32px",
          fontWeight: 800,
          marginBottom: "8px",
        }}
      >
        🛒 Browse Products
      </h1>

      <p
        style={{
          color:
            "var(--gray-500)",
          marginBottom:
            "24px",
        }}
      >
        {imageSearchActive
          ? `Found ${total} similar products`
          : total > 0
          ? `Showing all ${total} products`
          : "No products found"}
      </p>

      {/* ================================================== */}
      {/* FILTER BAR */}
      {/* ================================================== */}

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius:
            "var(--radius-lg)",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.06)",
          marginBottom:
            "32px",
        }}
      >
        <form
          onSubmit={
            handleSearchSubmit
          }
          style={{
            display:
              "flex",
            flexWrap:
              "wrap",
            gap: "12px",
            alignItems:
              "center",
          }}
        >
          {/* ================================================= */}
          {/* SEARCH INPUT + IMAGE ICON */}
          {/* ================================================= */}

          <div
            style={{
              position:
                "relative",
              flex:
                "1 1 280px",
              minWidth:
                "220px",
            }}
          >
            <input
              type="text"
              name="search"
              value={
                filters.search
              }
              onChange={
                handleFilterChange
              }
              placeholder={
                "Search products..."
              }
              style={{
                width:
                  "100%",
                boxSizing:
                  "border-box",
                padding:
                  "11px 48px 11px 14px",
                border:
                  "1.5px solid var(--gray-200)",
                borderRadius:
                  "var(--radius-md)",
                fontSize:
                  "14px",
                outline:
                  "none",
              }}
            />

            {/* Hidden file input */}

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={
                handleImageSearch
              }
              style={{
                display:
                  "none",
              }}
            />

            {/* IMAGE SEARCH BUTTON */}

            <button
              type="button"
              onClick={
                openImagePicker
              }
              disabled={
                imageSearching
              }
              title="Search by image"
              aria-label="Search by image"
              style={{
                position:
                  "absolute",
                right:
                  "7px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
                width:
                  "34px",
                height:
                  "34px",
                border:
                  "none",
                borderRadius:
                  "50%",
                background:
                  imageSearching
                    ? "#f3f4f6"
                    : "transparent",
                cursor:
                  imageSearching
                    ? "wait"
                    : "pointer",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontSize:
                  "18px",
              }}
            >
              {imageSearching
                ? "⏳"
                : "📷"}
            </button>
          </div>

          {/* ================================================= */}
          {/* CATEGORY */}
          {/* ================================================= */}

          <select
            name="category"
            value={
              filters.category
            }
            onChange={
              handleFilterChange
            }
            style={{
              padding:
                "10px 14px",
              border:
                "1.5px solid var(--gray-200)",
              borderRadius:
                "var(--radius-md)",
              fontSize:
                "14px",
              background:
                "white",
            }}
          >
            <option value="">
              All Categories
            </option>

            {categoriesLoading ? (
              <option disabled>
                Loading...
              </option>
            ) : (
              categories.map(
                (cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                )
              )
            )}
          </select>

          {/* ================================================= */}
          {/* LOCATION */}
          {/* ================================================= */}

          <select
            name="location"
            value={
              filters.location
            }
            onChange={
              handleFilterChange
            }
            style={{
              padding:
                "10px 14px",
              border:
                "1.5px solid var(--gray-200)",
              borderRadius:
                "var(--radius-md)",
              fontSize:
                "14px",
              background:
                "white",
            }}
          >
            <option value="">
              All Locations
            </option>

            {locationsLoading ? (
              <option disabled>
                Loading...
              </option>
            ) : (
              locations.map(
                (loc) => (
                  <option
                    key={loc}
                    value={loc}
                  >
                    {loc}
                  </option>
                )
              )
            )}
          </select>

          {/* ================================================= */}
          {/* SIM STATUS */}
          {/* ================================================= */}

          <select
            name="simStatus"
            value={
              filters.simStatus
            }
            onChange={
              handleFilterChange
            }
            style={{
              padding:
                "10px 14px",
              border:
                "1.5px solid var(--gray-200)",
              borderRadius:
                "var(--radius-md)",
              fontSize:
                "14px",
              background:
                "white",
            }}
          >
            <option value="">
              All SIM Status
            </option>

            {simStatusOptions.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          {/* ================================================= */}
          {/* PRICE */}
          {/* ================================================= */}

          <div
            style={{
              display:
                "flex",
              gap:
                "8px",
              alignItems:
                "center",
            }}
          >
            <input
              type="number"
              name="minPrice"
              value={
                filters.minPrice
              }
              onChange={
                handleFilterChange
              }
              placeholder="Min Price"
              style={{
                width:
                  "100px",
                padding:
                  "10px 14px",
                border:
                  "1.5px solid var(--gray-200)",
                borderRadius:
                  "var(--radius-md)",
                fontSize:
                  "14px",
              }}
            />

            <span>
              –
            </span>

            <input
              type="number"
              name="maxPrice"
              value={
                filters.maxPrice
              }
              onChange={
                handleFilterChange
              }
              placeholder="Max Price"
              style={{
                width:
                  "100px",
                padding:
                  "10px 14px",
                border:
                  "1.5px solid var(--gray-200)",
                borderRadius:
                  "var(--radius-md)",
                fontSize:
                  "14px",
              }}
            />
          </div>

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <button
            type="submit"
            disabled={
              imageSearching
            }
            style={{
              padding:
                "10px 24px",
              background:
                "var(--primary)",
              color:
                "white",
              border:
                "none",
              borderRadius:
                "var(--radius-full)",
              fontWeight:
                600,
              cursor:
                "pointer",
            }}
          >
            Search
          </button>

          {/* ================================================= */}
          {/* CLEAR */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={
              clearFilters
            }
            style={{
              padding:
                "10px 20px",
              background:
                "transparent",
              color:
                "var(--gray-600)",
              border:
                "1.5px solid var(--gray-200)",
              borderRadius:
                "var(--radius-full)",
              fontWeight:
                500,
              cursor:
                "pointer",
            }}
          >
            Clear Filters
          </button>
        </form>

        {/* ================================================== */}
        {/* VISUAL SEARCH STATUS */}
        {/* ================================================== */}

        {imageSearchActive &&
          imageSearchInfo && (
            <div
              style={{
                marginTop:
                  "16px",
                padding:
                  "14px 16px",
                background:
                  "#f8fafc",
                border:
                  "1px solid #e2e8f0",
                borderRadius:
                  "12px",
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap:
                  "8px",
                alignItems:
                  "center",
              }}
            >
              <strong>
                📷 Visual search:
              </strong>

              {imageSearchInfo.category && (
                <span>
                  {imageSearchInfo.category}
                </span>
              )}

              {imageSearchInfo.brand && (
                <span>
                  •{" "}
                  {
                    imageSearchInfo.brand
                  }
                </span>
              )}

              {imageSearchInfo.model && (
                <span>
                  •{" "}
                  {
                    imageSearchInfo.model
                  }
                </span>
              )}

              <button
                type="button"
                onClick={
                  clearImageSearch
                }
                style={{
                  marginLeft:
                    "auto",
                  border:
                    "none",
                  background:
                    "transparent",
                  color:
                    "var(--primary)",
                  fontWeight:
                    600,
                  cursor:
                    "pointer",
                }}
              >
                ← Normal search
              </button>
            </div>
          )}
      </div>

      {/* ================================================== */}
      {/* LOADING */}
      {/* ================================================== */}

      {loading &&
        !imageSearching && (
          <Loader />
        )}

      {/* ================================================== */}
      {/* IMAGE SEARCH LOADING */}
      {/* ================================================== */}

      {imageSearching && (
        <div
          style={{
            textAlign:
              "center",
            padding:
              "50px 20px",
          }}
        >
          <div
            style={{
              fontSize:
                "42px",
              marginBottom:
                "12px",
            }}
          >
            📷
          </div>

          <h3>
            Finding similar products...
          </h3>

          <p
            style={{
              color:
                "var(--gray-500)",
            }}
          >
            We're analyzing your
            picture and searching
            BuyUKUsed.
          </p>
        </div>
      )}

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && !imageSearching && (
        <div
          style={{
            background:
              "#fee2e2",
            color:
              "#dc2626",
            padding:
              "16px",
            borderRadius:
              "var(--radius-md)",
            marginBottom:
              "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* ================================================== */}
      {/* PRODUCTS */}
      {/* ================================================== */}

      {!loading &&
        !imageSearching &&
        !error && (
          <>
            {products.length ===
            0 ? (
              <div
                style={{
                  textAlign:
                    "center",
                  padding:
                    "60px 20px",
                }}
              >
                <h3
                  style={{
                    color:
                      "var(--gray-500)",
                    fontSize:
                      "20px",
                  }}
                >
                  No products found
                </h3>

                <p
                  style={{
                    color:
                      "var(--gray-400)",
                  }}
                >
                  Try adjusting
                  your filters or
                  search terms.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(240px, 1fr))",
                  gap:
                    "24px",
                }}
              >
                {products.map(
                  (product) => (
                    <ProductCard
                      key={
                        product._id
                      }
                      product={
                        product
                      }
                    />
                  )
                )}
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default Products;