// ============================================================
// src/components/VisualSearch.jsx
// BuyUKUsed Visual Search
// ============================================================

import React, {
  useRef,
  useState,
} from "react";

// ============================================================
// CONFIG
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// ============================================================
// COMPONENT
// ============================================================

export default function VisualSearch({
  onResults,
  onSearching,
  category = "",
  location = "",
  minPrice = "",
  maxPrice = "",
}) {
  const fileInputRef =
    useRef(null);

  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [resultCount, setResultCount] =
    useState(null);

  // ==========================================================
  // SELECT IMAGE
  // ==========================================================

  const handleImageSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setError(
        "Please select an image."
      );

      return;
    }

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);

    searchByImage(file);
  };

  // ==========================================================
  // VISUAL SEARCH
  // ==========================================================

  const searchByImage =
    async (file) => {
      try {
        setLoading(true);
        setError("");
        setResultCount(null);

        if (onSearching) {
          onSearching(true);
        }

        const formData =
          new FormData();

        formData.append(
          "image",
          file
        );

        if (category) {
          formData.append(
            "category",
            category
          );
        }

        if (location) {
          formData.append(
            "location",
            location
          );
        }

        if (minPrice !== "") {
          formData.append(
            "minPrice",
            minPrice
          );
        }

        if (maxPrice !== "") {
          formData.append(
            "maxPrice",
            maxPrice
          );
        }

        formData.append(
          "limit",
          "24"
        );

        const response =
          await fetch(
            `${API_URL}/api/visual-search`,
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
              "Visual search failed"
          );
        }

        const products =
          Array.isArray(
            data.products
          )
            ? data.products
            : [];

        setResultCount(
          products.length
        );

        if (onResults) {
          onResults(
            products,
            {
              visualSearch: true,
              count:
                products.length,
            }
          );
        }
      } catch (err) {
        console.error(
          "Visual search error:",
          err
        );

        setError(
          err.message ||
            "Unable to search by image."
        );

        if (onResults) {
          onResults([], {
            visualSearch: true,
            count: 0,
          });
        }
      } finally {
        setLoading(false);

        if (onSearching) {
          onSearching(false);
        }
      }
    };

  // ==========================================================
  // OPEN FILE PICKER
  // ==========================================================

  const openFilePicker =
    () => {
      fileInputRef.current?.click();
    };

  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {
    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setPreview("");
    setError("");
    setResultCount(null);

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }

    if (onResults) {
      onResults(null, {
        visualSearch: false,
      });
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={
          handleImageSelect
        }
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={
            openFilePicker
          }
          className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:shadow-md"
        >
          <span className="text-xl">
            📷
          </span>

          <span>
            Search by image
          </span>

          <span className="text-gray-400 transition group-hover:translate-x-1">
            →
          </span>
        </button>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={preview}
              alt="Visual search"
              className="h-20 w-20 rounded-xl object-cover"
            />

            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900">
                {loading
                  ? "Finding similar products..."
                  : "Visual search"}
              </div>

              {loading && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-gray-900" />
                </div>
              )}

              {!loading &&
                resultCount !==
                  null && (
                  <p className="mt-1 text-sm text-gray-500">
                    {resultCount} similar{" "}
                    {resultCount ===
                    1
                      ? "product"
                      : "products"}{" "}
                    found
                  </p>
                )}

              {error && (
                <p className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={
                clearSearch
              }
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label="Clear visual search"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}