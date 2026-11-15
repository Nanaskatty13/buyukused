// frontend/src/services/messages.js

import { API_URL } from './api';

// Helper: build headers with optional token
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token && { 'Authorization': `Bearer ${token}` }),
});

// Helper: parse response and handle errors
//
// ✅ FIXES vs. the previous version:
//   1. Handles 204 No Content without throwing SyntaxError.
//   2. Handles non-JSON error bodies (Render 502 HTML pages,
//      Express default error pages, cold-start HTML) by falling
//      back to text so the caller gets a usable message instead
//      of "Unexpected token '<'".
//   3. Includes HTTP status + statusText in thrown errors, so
//      debugging "why did this fail?" is instant.
const handleResponse = async (response) => {
  // 204 No Content (common for PUT/DELETE acknowledgements)
  if (response.status === 204) {
    return { success: true };
  }

  // Read the raw body as text first so a non-JSON error page
  // doesn't blow up in our face.
  const rawText = await response.text();

  let data = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      // Non-JSON body (HTML error page, empty-ish 200, etc.)
      // Wrap it so callers still get a .message they can display.
      data = { message: rawText };
    }
  }

  if (!response.ok) {
    const statusLabel = response.statusText
      ? `HTTP ${response.status} ${response.statusText}`
      : `HTTP ${response.status}`;

    const message =
      (data && (data.message || data.error)) ||
      statusLabel;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Empty body on a 2xx that isn't 204 → treat as success
  if (!data) return { success: true };

  return data;
};

// Helper: build a query string from a small object
const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ''
  );
  if (entries.length === 0) return '';
  const qs = new URLSearchParams();
  entries.forEach(([k, v]) => qs.append(k, String(v)));
  return `?${qs.toString()}`;
};

/**
 * Messages API – all functions require authentication (token)
 */
export const messages = {
  /**
   * Get all messages for a specific user
   * @param {string} userId - The user ID to fetch messages for
   * @param {string} token - JWT token
   * @param {Object} [options] - { page, limit, signal }
   * @returns {Promise<Object>} { success, messages, typing? }
   */
  getForUser: async (userId, token, options = {}) => {
    const { page, limit, signal } = options;

    const query = buildQuery({ page, limit });

    const res = await fetch(
      `${API_URL}/api/messages/${encodeURIComponent(userId)}${query}`,
      {
        headers: getHeaders(token),
        signal,
      }
    );

    return handleResponse(res);
  },

  /**
   * Get the conversation with a specific partner
   * @param {string} partnerId - The other user's ID
   * @param {string} token - JWT token
   * @param {Object} [options] - { page, limit, signal }
   * @returns {Promise<Object>} { success, messages }
   */
  getConversation: async (partnerId, token, options = {}) => {
    const { page, limit, signal } = options;

    const query = buildQuery({ page, limit });

    const res = await fetch(
      `${API_URL}/api/messages/conversation/${encodeURIComponent(partnerId)}${query}`,
      {
        headers: getHeaders(token),
        signal,
      }
    );

    return handleResponse(res);
  },

  /**
   * Get the unread message count for the authenticated user
   * @param {string} token - JWT token
   * @param {Object} [options] - { signal }
   * @returns {Promise<Object>} { success, count }
   */
  getUnreadCount: async (token, options = {}) => {
    const res = await fetch(`${API_URL}/api/messages/unread-count`, {
      headers: getHeaders(token),
      signal: options.signal,
    });

    return handleResponse(res);
  },

  /**
   * Mark a single message as read
   * @param {string} messageId - The message ID to mark as read
   * @param {string} token - JWT token
   * @param {Object} [options] - { signal }
   * @returns {Promise<Object>} { success } or updated message
   */
  markRead: async (messageId, token, options = {}) => {
    const res = await fetch(
      `${API_URL}/api/messages/${encodeURIComponent(messageId)}/read`,
      {
        method: 'PUT',
        headers: getHeaders(token),
        signal: options.signal,
      }
    );

    return handleResponse(res);
  },

  /**
   * Send a new message
   * @param {string} receiver - Recipient user ID (matches backend field)
   * @param {string} message - Message text
   * @param {string} productId - Related product ID (optional)
   * @param {string} token - JWT token
   * @param {Object} [options] - { signal }
   * @returns {Promise<Object>} Created message with populated sender/receiver
   */
  send: async (receiver, message, productId, token, options = {}) => {
    const res = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ receiver, message, productId }),
      signal: options.signal,
    });

    return handleResponse(res);
  },

  /**
   * Notify the backend that the user is typing / stopped typing.
   * Fire-and-forget on the caller side — safe to ignore errors.
   * @param {string} receiver - The partner's user ID
   * @param {boolean} isTyping - true to start, false to stop
   * @param {string} token - JWT token
   * @param {Object} [options] - { signal }
   * @returns {Promise<Object>} { success }
   */
  setTyping: async (receiver, isTyping, token, options = {}) => {
    const res = await fetch(`${API_URL}/api/messages/typing`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ receiver, isTyping: Boolean(isTyping) }),
      signal: options.signal,
    });

    return handleResponse(res);
  },

  /**
   * Delete a message
   * @param {string} messageId - Message ID to delete
   * @param {string} token - JWT token
   * @param {Object} [options] - { signal }
   * @returns {Promise<Object>} Success message
   */
  delete: async (messageId, token, options = {}) => {
    const res = await fetch(
      `${API_URL}/api/messages/${encodeURIComponent(messageId)}`,
      {
        method: 'DELETE',
        headers: getHeaders(token),
        signal: options.signal,
      }
    );

    return handleResponse(res);
  },
};

// Default export
export default messages;