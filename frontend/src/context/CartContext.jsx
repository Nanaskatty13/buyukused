// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Create the context
export const CartContext = createContext();

// Custom hook to use the cart/wishlist context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component
export const CartProvider = ({ children }) => {
  // Load favorites from localStorage with error handling
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure it's an array
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.warn('Error loading favorites from localStorage:', error);
      return [];
    }
  });

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.warn('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  // Add a favorite
  const addFavorite = useCallback((productId) => {
    if (!productId) return;
    setFavorites((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  }, []);

  // Remove a favorite
  const removeFavorite = useCallback((productId) => {
    if (!productId) return;
    setFavorites((prev) => prev.filter((id) => id !== productId));
  }, []);

  // Toggle a favorite – single state update for performance
  const toggleFavorite = useCallback((productId) => {
    if (!productId) return;
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  // Check if a product is favorited
  const isFavorite = useCallback((productId) => {
    if (!productId) return false;
    return favorites.includes(productId);
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  // Memoized value to prevent unnecessary re‑renders
  const value = useMemo(() => ({
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  }), [favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Also export the context directly (optional)
export default CartContext;