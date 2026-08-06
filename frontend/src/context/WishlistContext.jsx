// frontend/src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth'; // or from '../context/AuthContext'
import api from '../api';

// Create context
export const WishlistContext = createContext();

// Custom hook to use wishlist
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Provider component
export const WishlistProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ----- Fetch wishlist from backend -----
  const fetchWishlist = useCallback(async () => {
    if (!user || !token) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.favorites.getAll(token);
      setWishlist(data.favorites || data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // ----- Add item to wishlist -----
  const addToWishlist = useCallback(async (productId) => {
    if (!token) {
      // Optionally store in localStorage for guest users
      console.warn('You must be logged in to add to wishlist');
      return;
    }
    // Optimistic update
    setWishlist(prev => [...prev, productId]);
    try {
      await api.favorites.add(productId, token);
    } catch (err) {
      // Revert on error
      setWishlist(prev => prev.filter(id => id !== productId));
      setError(err.message || 'Failed to add to wishlist');
      console.error('Error adding to wishlist:', err);
    }
  }, [token]);

  // ----- Remove item from wishlist -----
  const removeFromWishlist = useCallback(async (productId) => {
    if (!token) return;
    // Optimistic update
    setWishlist(prev => prev.filter(id => id !== productId));
    try {
      await api.favorites.remove(productId, token);
    } catch (err) {
      // Revert on error
      setWishlist(prev => [...prev, productId]);
      setError(err.message || 'Failed to remove from wishlist');
      console.error('Error removing from wishlist:', err);
    }
  }, [token]);

  // ----- Toggle wishlist item -----
  const toggleWishlist = useCallback(async (productId) => {
    if (!token) {
      // Optionally handle guest user
      return;
    }
    const isInWishlist = wishlist.includes(productId);
    if (isInWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }, [wishlist, addToWishlist, removeFromWishlist]);

  // ----- Check if product is in wishlist -----
  const isInWishlist = useCallback((productId) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  // ----- Clear wishlist (e.g., on logout) -----
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    setError(null);
  }, []);

  // ----- Auto‑fetch when user logs in -----
  useEffect(() => {
    if (user && token) {
      fetchWishlist();
    } else {
      clearWishlist();
    }
  }, [user, token, fetchWishlist, clearWishlist]);

  // ----- Memoize value -----
  const value = useMemo(() => ({
    wishlist,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    count: wishlist.length,
  }), [wishlist, loading, error, fetchWishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Also export the context itself
export default WishlistContext;