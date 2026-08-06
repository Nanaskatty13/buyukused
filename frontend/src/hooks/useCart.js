// frontend/src/hooks/useCart.js
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

/**
 * Custom hook to access cart context.
 * Must be used within a CartProvider.
 *
 * @returns {Object} Cart context value (items, addItem, removeItem, clearCart, total, etc.)
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};