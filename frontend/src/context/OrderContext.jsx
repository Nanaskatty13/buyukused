// frontend/src/context/OrderContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth'; // or from '../context/AuthContext' if you prefer
import api from '../api'; // adjust path if needed

// Create the context
export const OrderContext = createContext();

// Custom hook to use the order context
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

// Provider component
export const OrderProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- Fetch all orders for the current user ---
  const fetchOrders = useCallback(async (params = {}) => {
    if (!token) {
      setError('You must be logged in to view orders.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getAll(params, token);
      setOrders(data.orders || []);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- Fetch a single order by ID ---
  const getOrder = useCallback(async (orderId) => {
    if (!token) {
      setError('You must be logged in to view order details.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.getById(orderId, token);
      setSelectedOrder(data.order);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // --- Create a new order ---
  const createOrder = useCallback(async (orderData) => {
    if (!token) {
      setError('You must be logged in to create an order.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.create(orderData, token);
      // Refresh the orders list
      await fetchOrders();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create order');
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  }, [token, fetchOrders]);

  // --- Update order status (admin/seller) ---
  const updateOrderStatus = useCallback(async (orderId, status) => {
    if (!token) {
      setError('You must be logged in to update an order.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.update(orderId, { status }, token);
      // Update the local orders list
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.order?.status || status } : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: data.order?.status || status }));
      }
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      console.error('Error updating order:', err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedOrder]);

  // --- Delete an order (admin only) ---
  const deleteOrder = useCallback(async (orderId) => {
    if (!token) {
      setError('You must be logged in to delete an order.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.orders.delete(orderId, token);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
      return data;
    } catch (err) {
      setError(err.message || 'Failed to delete order');
      console.error('Error deleting order:', err);
    } finally {
      setLoading(false);
    }
  }, [token, selectedOrder]);

  // --- Clear error ---
  const clearError = useCallback(() => setError(null), []);

  // --- Auto‑fetch orders on mount if user is logged in ---
  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [user, token, fetchOrders]);

  // Memoize the context value
  const value = useMemo(() => ({
    orders,
    selectedOrder,
    loading,
    error,
    fetchOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    clearError,
  }), [orders, selectedOrder, loading, error, fetchOrders, getOrder, createOrder, updateOrderStatus, deleteOrder, clearError]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Also export the context itself
export default OrderContext;