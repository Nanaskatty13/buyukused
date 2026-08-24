// frontend/src/context/CartContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";

// ============================================================
// CREATE CONTEXT
// ============================================================

export const CartContext = createContext(null);

// ============================================================
// CUSTOM HOOK
// ============================================================

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// ============================================================
// TOKEN HELPER
// ============================================================

const getToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      null
    );
  } catch (error) {
    console.warn("Unable to read authentication token:", error);
    return null;
  }
};

// ============================================================
// NORMALIZE PRODUCT ID
// ============================================================

const normalizeProductId = (productId) => {
  if (!productId) return null;

  if (typeof productId === "object") {
    return (
      productId._id ||
      productId.id ||
      productId.productId ||
      productId.product?._id ||
      productId.product?.id ||
      null
    );
  }

  return String(productId);
};

// ============================================================
// UNIQUE IDS
// ============================================================

const uniqueIds = (ids) => {
  return [...new Set(ids.map(normalizeProductId).filter(Boolean))];
};

// ============================================================
// SAFE JSON RESPONSE
// ============================================================

const getResponseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

// ============================================================
// API ERROR MESSAGE
// ============================================================

const getApiErrorMessage = (response, data = {}) => {
  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  if (response.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (response.status === 403) {
    return "You are not authorized to manage favorites.";
  }

  if (response.status === 404) {
    return "Favorites API endpoint not found.";
  }

  if (response.status >= 500) {
    return "Server error while saving your favorite.";
  }

  return `Favorites request failed (${response.status}).`;
};

// ============================================================
// PROVIDER
// ============================================================

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  // ==========================================================
  // FAVORITES
  // ==========================================================

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem("favorites");

      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return uniqueIds(parsed);
    } catch (error) {
      console.warn(
        "Error loading favorites from localStorage:",
        error
      );

      return [];
    }
  });

  // ==========================================================
  // LOADING
  // ==========================================================

  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // ==========================================================
  // ERROR
  // ==========================================================

  const [favoritesError, setFavoritesError] = useState(null);

  // ==========================================================
  // BACKEND AVAILABILITY
  //
  // If the deployed backend does not currently have
  // /api/favorites, do not repeatedly spam the console
  // with the same 404.
  // ==========================================================

  const [favoritesApiAvailable, setFavoritesApiAvailable] =
    useState(true);

  // ==========================================================
  // SAVE FAVORITES TO LOCAL STORAGE
  // ==========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "favorites",
        JSON.stringify(uniqueIds(favorites))
      );
    } catch (error) {
      console.warn(
        "Error saving favorites to localStorage:",
        error
      );
    }
  }, [favorites]);

  // ==========================================================
  // LOAD FAVORITES FROM BACKEND
  //
  // GET /api/favorites
  // ==========================================================

  const loadFavorites = useCallback(async () => {
    const token = getToken();

    // --------------------------------------------------------
    // Not logged in
    // --------------------------------------------------------

    if (!user || !token) {
      return;
    }

    // --------------------------------------------------------
    // If endpoint was previously confirmed missing,
    // keep local favorites instead.
    // --------------------------------------------------------

    if (!favoritesApiAvailable) {
      return;
    }

    setFavoritesLoading(true);
    setFavoritesError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/favorites`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ------------------------------------------------------
      // 404 = backend route currently missing
      // ------------------------------------------------------

      if (response.status === 404) {
        console.warn(
          "Favorites API is not available on the backend yet. " +
            "Using local favorites."
        );

        setFavoritesApiAvailable(false);
        return;
      }

      // ------------------------------------------------------
      // Unauthorized
      // ------------------------------------------------------

      if (response.status === 401) {
        console.warn(
          "Favorites request unauthorized."
        );

        return;
      }

      // ------------------------------------------------------
      // Other errors
      // ------------------------------------------------------

      if (!response.ok) {
        const data = await getResponseJson(response);

        throw new Error(
          getApiErrorMessage(response, data)
        );
      }

      const data = await getResponseJson(response);

      // ------------------------------------------------------
      // Support multiple response formats
      //
      // { favorites: [...] }
      // { data: [...] }
      // { items: [...] }
      // [...]
      // ------------------------------------------------------

      let backendFavorites = [];

      if (Array.isArray(data)) {
        backendFavorites = data;
      } else if (Array.isArray(data?.favorites)) {
        backendFavorites = data.favorites;
      } else if (Array.isArray(data?.data)) {
        backendFavorites = data.data;
      } else if (Array.isArray(data?.items)) {
        backendFavorites = data.items;
      }

      // ------------------------------------------------------
      // Convert favorites into product IDs
      // ------------------------------------------------------

      const ids = backendFavorites
        .map((favorite) => {
          if (typeof favorite === "string") {
            return favorite;
          }

          return normalizeProductId(
            favorite?.productId ||
              favorite?.product ||
              favorite
          );
        })
        .filter(Boolean);

      setFavorites(uniqueIds(ids));

      setFavoritesApiAvailable(true);
    } catch (error) {
      console.warn(
        "Failed to load favorites from backend:",
        error
      );

      setFavoritesError(error.message);
    } finally {
      setFavoritesLoading(false);
    }
  }, [user, favoritesApiAvailable]);

  // ==========================================================
  // LOAD FAVORITES WHEN USER LOGS IN
  // ==========================================================

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  // ==========================================================
  // ADD FAVORITE
  //
  // POST /api/favorites
  //
  // Body:
  // {
  //   productId: "PRODUCT_ID"
  // }
  // ==========================================================

  const addFavorite = useCallback(
    async (productId) => {
      const id = normalizeProductId(productId);

      if (!id) {
        return false;
      }

      const token = getToken();

      setFavoritesError(null);

      // ------------------------------------------------------
      // OPTIMISTIC UPDATE
      // ------------------------------------------------------

      setFavorites((prev) => {
        if (prev.includes(id)) {
          return prev;
        }

        return [...prev, id];
      });

      // ------------------------------------------------------
      // LOCAL ONLY IF NOT LOGGED IN
      // ------------------------------------------------------

      if (!user || !token) {
        return true;
      }

      // ------------------------------------------------------
      // Backend unavailable
      //
      // Keep favorite locally until backend is fixed.
      // ------------------------------------------------------

      if (!favoritesApiAvailable) {
        return true;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/favorites`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: id,
            }),
          }
        );

        // ----------------------------------------------------
        // 404
        // ----------------------------------------------------

        if (response.status === 404) {
          console.warn(
            "POST /api/favorites is not available on the backend. " +
              "Favorite saved locally."
          );

          setFavoritesApiAvailable(false);

          // Keep optimistic favorite.
          return true;
        }

        // ----------------------------------------------------
        // Unauthorized
        // ----------------------------------------------------

        if (response.status === 401) {
          console.warn(
            "Unable to save favorite: authentication expired."
          );

          setFavoritesError(
            "Please log in again to save favorites."
          );

          // Roll back because authentication failed.
          setFavorites((prev) =>
            prev.filter(
              (favoriteId) => favoriteId !== id
            )
          );

          return false;
        }

        // ----------------------------------------------------
        // Other errors
        // ----------------------------------------------------

        if (!response.ok) {
          const data = await getResponseJson(response);

          throw new Error(
            getApiErrorMessage(response, data)
          );
        }

        return true;
      } catch (error) {
        console.warn(
          "Failed to save favorite:",
          error
        );

        // ----------------------------------------------------
        // Roll back optimistic update
        // ----------------------------------------------------

        setFavorites((prev) =>
          prev.filter(
            (favoriteId) => favoriteId !== id
          )
        );

        setFavoritesError(error.message);

        return false;
      }
    },
    [user, favoritesApiAvailable]
  );

  // ==========================================================
  // REMOVE FAVORITE
  //
  // DELETE /api/favorites/:productId
  // ==========================================================

  const removeFavorite = useCallback(
    async (productId) => {
      const id = normalizeProductId(productId);

      if (!id) {
        return false;
      }

      const token = getToken();

      setFavoritesError(null);

      // ------------------------------------------------------
      // Remember previous state for rollback
      // ------------------------------------------------------

      setFavorites((prev) =>
        prev.filter(
          (favoriteId) => favoriteId !== id
        )
      );

      // ------------------------------------------------------
      // LOCAL ONLY
      // ------------------------------------------------------

      if (!user || !token) {
        return true;
      }

      // ------------------------------------------------------
      // Backend unavailable
      // ------------------------------------------------------

      if (!favoritesApiAvailable) {
        return true;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/favorites/${encodeURIComponent(
            id
          )}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // ----------------------------------------------------
        // 404
        // ----------------------------------------------------

        if (response.status === 404) {
          console.warn(
            "DELETE /api/favorites/:productId is not available " +
              "on the backend. Favorite removed locally."
          );

          setFavoritesApiAvailable(false);

          return true;
        }

        // ----------------------------------------------------
        // Unauthorized
        // ----------------------------------------------------

        if (response.status === 401) {
          console.warn(
            "Unable to remove favorite: authentication expired."
          );

          setFavoritesError(
            "Please log in again to manage favorites."
          );

          return false;
        }

        // ----------------------------------------------------
        // Other errors
        // ----------------------------------------------------

        if (!response.ok) {
          const data = await getResponseJson(response);

          throw new Error(
            getApiErrorMessage(response, data)
          );
        }

        return true;
      } catch (error) {
        console.warn(
          "Failed to remove favorite:",
          error
        );

        // ----------------------------------------------------
        // Restore favorite if backend failed
        // ----------------------------------------------------

        setFavorites((prev) => {
          if (prev.includes(id)) {
            return prev;
          }

          return [...prev, id];
        });

        setFavoritesError(error.message);

        return false;
      }
    },
    [user, favoritesApiAvailable]
  );

  // ==========================================================
  // TOGGLE FAVORITE
  // ==========================================================

  const toggleFavorite = useCallback(
    async (productId) => {
      const id = normalizeProductId(productId);

      if (!id) {
        return false;
      }

      const alreadyFavorite = favorites.includes(id);

      if (alreadyFavorite) {
        return await removeFavorite(id);
      }

      return await addFavorite(id);
    },
    [favorites, addFavorite, removeFavorite]
  );

  // ==========================================================
  // CHECK FAVORITE
  // ==========================================================

  const isFavorite = useCallback(
    (productId) => {
      const id = normalizeProductId(productId);

      if (!id) {
        return false;
      }

      return favorites.includes(id);
    },
    [favorites]
  );

  // ==========================================================
  // CLEAR FAVORITES
  // ==========================================================

  const clearFavorites = useCallback(async () => {
    const currentFavorites = [...favorites];

    // --------------------------------------------------------
    // Clear UI immediately
    // --------------------------------------------------------

    setFavorites([]);
    setFavoritesError(null);

    const token = getToken();

    // --------------------------------------------------------
    // Local only
    // --------------------------------------------------------

    if (!user || !token) {
      return true;
    }

    // --------------------------------------------------------
    // Backend unavailable
    // --------------------------------------------------------

    if (!favoritesApiAvailable) {
      return true;
    }

    try {
      const results = await Promise.all(
        currentFavorites.map(async (productId) => {
          try {
            const response = await fetch(
              `${API_URL}/api/favorites/${encodeURIComponent(
                productId
              )}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.status === 404) {
              setFavoritesApiAvailable(false);
              return true;
            }

            return response.ok;
          } catch (error) {
            console.warn(
              "Failed to remove favorite:",
              productId,
              error
            );

            return false;
          }
        })
      );

      // ------------------------------------------------------
      // If backend failed for one or more items,
      // restore the local list.
      // ------------------------------------------------------

      if (results.some((result) => result === false)) {
        setFavorites(currentFavorites);

        return false;
      }

      return true;
    } catch (error) {
      console.warn(
        "Failed to clear favorites:",
        error
      );

      setFavorites(currentFavorites);
      setFavoritesError(error.message);

      return false;
    }
  }, [favorites, user, favoritesApiAvailable]);

  // ==========================================================
  // USER CHANGE
  // ==========================================================

  useEffect(() => {
    // --------------------------------------------------------
    // Do NOT clear localStorage favorites on logout.
    //
    // This keeps the user's local wishlist available.
    // --------------------------------------------------------

    if (!user) {
      setFavoritesError(null);
    }
  }, [user]);

  // ==========================================================
  // FAVORITE COUNT
  // ==========================================================

  const favoriteCount = favorites.length;

  // ==========================================================
  // MEMOIZED CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      // ------------------------------------------------------
      // Favorites
      // ------------------------------------------------------

      favorites,

      // ------------------------------------------------------
      // Actions
      // ------------------------------------------------------

      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,

      // ------------------------------------------------------
      // Count
      // ------------------------------------------------------

      count: favoriteCount,
      favoriteCount,

      // ------------------------------------------------------
      // Loading / error
      // ------------------------------------------------------

      favoritesLoading,
      favoritesError,

      // ------------------------------------------------------
      // Backend status
      // ------------------------------------------------------

      favoritesApiAvailable,

      // ------------------------------------------------------
      // Reload
      // ------------------------------------------------------

      loadFavorites,
    }),
    [
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      favoriteCount,
      favoritesLoading,
      favoritesError,
      favoritesApiAvailable,
      loadFavorites,
    ]
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default CartContext;