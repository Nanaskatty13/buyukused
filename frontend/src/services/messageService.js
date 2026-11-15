// frontend/src/services/messageService.js

import axios from "axios";

// ============================================================
// API CONFIG
// ============================================================
//
// Fallback MUST match api.js / Login.jsx / Register.jsx —
// otherwise an unset VITE_API_URL routes every message call
// to the wrong backend and the whole page silently fails.
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused-y6cp.onrender.com"
).replace(/\/+$/, "");

console.log("💬 Message API URL:", API_URL);

// Render cold-starts can take 30–60s; don't hang forever.
const DEFAULT_TIMEOUT = 60000;

// ============================================================
// AUTH TOKEN
// ============================================================

const getToken = () => {
  // Guard for SSR / non-browser environments
  if (typeof window === "undefined") return "";

  try {
    return (
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("authToken") ||
      ""
    );
  } catch {
    return "";
  }
};

// ============================================================
// AUTH CONFIG
// ============================================================

const authConfig = (extra = {}) => {
  const token = getToken();

  return {
    timeout: DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    ...extra,
  };
};

// ============================================================
// SHARED HELPERS
//
// isReadFlag matches the identical helper in Messages.jsx
// so unread counts and mark-as-read stay consistent no
// matter which backend field the API actually returns.
// ============================================================

const isReadFlag = (msg) =>
  Boolean(msg?.read || msg?.isRead || msg?.readAt);

const getId = (val) =>
  typeof val === "string" ? val : val?._id || val?.id || "";

// ============================================================
// ERROR HANDLER
// ============================================================

const handleMessageError = (
  error,
  action = "Message request"
) => {
  console.error(`❌ ${action} failed:`, error);

  if (error.response) {
    console.error(
      `❌ ${action} status:`,
      error.response.status
    );

    console.error(
      `❌ ${action} response:`,
      error.response.data
    );

    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed with status ${error.response.status}`;

    if (error.response.status === 401) {
      throw new Error(
        "Your session has expired. Please log in again."
      );
    }

    if (error.response.status === 403) {
      throw new Error(
        error.response.data?.message ||
          "You are not authorized to access these messages."
      );
    }

    if (error.response.status === 404) {
      throw new Error(
        error.response.data?.message ||
          "Message endpoint was not found."
      );
    }

    throw new Error(message);
  }

  if (error.request) {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection."
    );
  }

  throw new Error(
    error.message || "Something went wrong."
  );
};

// ============================================================
// GET ALL MESSAGES FOR USER
// GET /api/messages/:userId
// ============================================================

export const getMessages = async (userId, options = {}) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const { page, limit, signal } = options;

  const params = {};
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.limit = limit;

  try {
    const response = await axios.get(
      `${API_URL}/api/messages/${encodeURIComponent(userId)}`,
      authConfig({
        params: Object.keys(params).length ? params : undefined,
        signal,
      })
    );

    return response.data;
  } catch (error) {
    return handleMessageError(
      error,
      "Get messages"
    );
  }
};

// Alias
export const getUserMessages = getMessages;

// ============================================================
// SEND MESSAGE
// POST /api/messages
// ============================================================

export const sendMessage = async ({
  receiver,
  productId = null,
  message,
  signal,
}) => {
  if (!receiver) {
    throw new Error("Receiver is required.");
  }

  if (!message?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/messages`,
      {
        receiver,
        productId: productId || null,
        message: message.trim(),
      },
      authConfig({ signal })
    );

    return response.data;
  } catch (error) {
    return handleMessageError(
      error,
      "Send message"
    );
  }
};

// ============================================================
// MARK MESSAGE AS READ
// PUT /api/messages/:id/read
// ============================================================

export const markMessageRead = async (
  messageId,
  options = {}
) => {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  try {
    const response = await axios.put(
      `${API_URL}/api/messages/${encodeURIComponent(messageId)}/read`,
      {},
      authConfig({ signal: options.signal })
    );

    return response.data;
  } catch (error) {
    return handleMessageError(
      error,
      "Mark message as read"
    );
  }
};

// ============================================================
// DELETE MESSAGE
// DELETE /api/messages/:id
// ============================================================

export const deleteMessage = async (
  messageId,
  options = {}
) => {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  try {
    const response = await axios.delete(
      `${API_URL}/api/messages/${encodeURIComponent(messageId)}`,
      authConfig({ signal: options.signal })
    );

    return response.data;
  } catch (error) {
    return handleMessageError(
      error,
      "Delete message"
    );
  }
};

// ============================================================
// GET UNREAD MESSAGE COUNT (SERVER)
// GET /api/messages/unread-count
//
// ✅ NEW — the app polls this endpoint from the navbar; expose
// it here instead of ad-hoc fetch() calls everywhere.
// ============================================================

export const getUnreadCount = async (options = {}) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/messages/unread-count`,
      authConfig({ signal: options.signal })
    );

    return response.data;
  } catch (error) {
    return handleMessageError(
      error,
      "Get unread count"
    );
  }
};

// ============================================================
// SET TYPING STATUS
// POST /api/messages/typing
//
// ✅ NEW — used by Messages.jsx for the typing indicator.
// Fire-and-forget: callers may ignore errors.
// ============================================================

export const setTyping = async (
  receiver,
  isTyping,
  options = {}
) => {
  if (!receiver) {
    throw new Error("Receiver is required.");
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/messages/typing`,
      {
        receiver,
        isTyping: Boolean(isTyping),
      },
      authConfig({ signal: options.signal })
    );

    return response.data;
  } catch (error) {
    return handleMessageError(
      error,
      "Set typing"
    );
  }
};

// ============================================================
// GET CONVERSATION FROM SERVER
// GET /api/messages/conversation/:partnerId
//
// ✅ NEW — used by ProductDetails.jsx's chat modal. Kept
// separate from the client-side getConversation() below so
// both signatures remain available.
// ============================================================

export const getConversationFromServer = async (
  partnerId,
  options = {}
) => {
  if (!partnerId) {
    throw new Error("Partner ID is required.");
  }

  const { page, limit, signal } = options;

  const params = {};
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.limit = limit;

  try {
    const response = await axios.get(
      `${API_URL}/api/messages/conversation/${encodeURIComponent(partnerId)}`,
      authConfig({
        params: Object.keys(params).length ? params : undefined,
        signal,
      })
    );

    return response.data;
  } catch (error) {
    return handleMessageError(
      error,
      "Get conversation"
    );
  }
};

// ============================================================
// GET CONVERSATION (CLIENT-SIDE)
// Filters already-fetched messages — used when you already
// have the full message list and just want to slice it.
// ============================================================

export const getConversation = async (
  currentUserId,
  otherUserId
) => {
  if (!currentUserId) {
    throw new Error("Current user ID is required.");
  }

  if (!otherUserId) {
    throw new Error("Other user ID is required.");
  }

  const result = await getMessages(
    currentUserId
  );

  const messages = Array.isArray(result?.messages)
    ? result.messages
    : [];

  const conversation = messages.filter(
    (msg) => {
      if (!msg) return false;

      const senderId = getId(msg.sender);
      const receiverId = getId(msg.receiver);

      return (
        (String(senderId) ===
          String(currentUserId) &&
          String(receiverId) ===
            String(otherUserId)) ||
        (String(senderId) ===
          String(otherUserId) &&
          String(receiverId) ===
            String(currentUserId))
      );
    }
  );

  return {
    ...result,
    messages: conversation,
  };
};

// ============================================================
// MARK ALL MESSAGES IN CONVERSATION AS READ
//
// ✅ Uses Promise.allSettled — one failed markRead no longer
// rejects the whole batch. Returns partial success info.
// ✅ Uses isReadFlag so isRead/readAt fields also work.
// ============================================================

export const markConversationRead = async (
  messages = [],
  currentUserId
) => {
  if (!currentUserId) {
    throw new Error("Current user ID is required.");
  }

  const unreadMessages = (Array.isArray(messages) ? messages : []).filter(
    (msg) => {
      if (!msg) return false;

      const receiverId = getId(msg.receiver);

      return (
        !isReadFlag(msg) &&
        String(receiverId) ===
          String(currentUserId)
      );
    }
  );

  if (unreadMessages.length === 0) {
    return {
      success: true,
      message: "No unread messages.",
      messages: [],
      failed: [],
    };
  }

  const settled = await Promise.allSettled(
    unreadMessages.map((msg) =>
      markMessageRead(msg._id)
    )
  );

  const succeeded = [];
  const failed = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      succeeded.push(result.value);
    } else {
      failed.push({
        messageId: unreadMessages[index]._id,
        error: result.reason,
      });
    }
  });

  return {
    success: failed.length === 0,
    message:
      failed.length === 0
        ? "Messages marked as read."
        : `${succeeded.length} of ${unreadMessages.length} messages marked as read.`,
    messages: succeeded,
    failed,
  };
};

// ============================================================
// UNREAD MESSAGE COUNT (CLIENT-SIDE)
//
// ✅ Uses isReadFlag so isRead/readAt are handled.
// ============================================================

export const getUnreadMessageCount = (
  messages = [],
  currentUserId
) => {
  if (!currentUserId) {
    return 0;
  }

  return (Array.isArray(messages) ? messages : []).filter((msg) => {
    if (!msg) return false;

    const receiverId = getId(msg.receiver);

    return (
      !isReadFlag(msg) &&
      String(receiverId) ===
        String(currentUserId)
    );
  }).length;
};

// ============================================================
// GROUP MESSAGES BY CONVERSATION
// ============================================================

export const groupMessagesByConversation = (
  messages = [],
  currentUserId
) => {
  if (!currentUserId) {
    return {};
  }

  const conversations = {};

  (Array.isArray(messages) ? messages : []).forEach((msg) => {
    if (!msg) return;

    const senderId = getId(msg.sender);
    const receiverId = getId(msg.receiver);

    const otherUserId =
      String(senderId) ===
      String(currentUserId)
        ? receiverId
        : senderId;

    if (!otherUserId) {
      return;
    }

    const key = String(otherUserId);

    if (!conversations[key]) {
      conversations[key] = [];
    }

    conversations[key].push(msg);
  });

  Object.keys(conversations).forEach(
    (key) => {
      conversations[key].sort(
        (a, b) =>
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
      );
    }
  );

  return conversations;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const messageService = {
  getMessages,
  getUserMessages,
  sendMessage,
  markMessageRead,
  deleteMessage,

  // New server endpoints
  getUnreadCount,
  setTyping,
  getConversationFromServer,

  // Client-side helpers
  getConversation,
  markConversationRead,
  getUnreadMessageCount,
  groupMessagesByConversation,
};

export default messageService;