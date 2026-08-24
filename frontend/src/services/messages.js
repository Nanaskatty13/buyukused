// frontend/src/services/messages.js

import { API_URL } from './api';

// Helper: build headers with optional token
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

// Helper: parse response and handle errors
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }
  return data;
};

/**
 * Messages API – all functions require authentication (token)
 */
export const messages = {
  /**
   * Get all messages for a specific user
   * @param {string} userId - The user ID to fetch messages for
   * @param {string} token - JWT token
   * @returns {Promise<Object>} { success, messages }
   */
  getForUser: async (userId, token) => {
    const res = await fetch(`${API_URL}/api/messages/${userId}`, {
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  /**
   * Mark a single message as read
   * @param {string} messageId - The message ID to mark as read
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Updated message
   */
  markRead: async (messageId, token) => {
    const res = await fetch(`${API_URL}/api/messages/${messageId}/read`, {
      method: 'PUT',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  /**
   * Send a new message
   * @param {string} receiver - Recipient user ID (matches backend field)
   * @param {string} message - Message text
   * @param {string} productId - Related product ID (optional)
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Created message with populated sender/receiver
   */
  send: async (receiver, message, productId, token) => {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ receiver, message, productId }),
    });
    return handleResponse(res);
  },

  /**
   * Delete a message
   * @param {string} messageId - Message ID to delete
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Success message
   */
  delete: async (messageId, token) => {
    const res = await fetch(`${API_URL}/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};

// Default export
export default messages;