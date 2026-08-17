// frontend/src/services/messageService.js

import axios from "axios";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

console.log("💬 Message API URL:", API_URL);

// ============================================================
// AUTH TOKEN
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

// ============================================================
// AUTH CONFIG
// ============================================================

const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  };
};

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

export const getMessages = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  try {
    const response = await axios.get(
      `${API_URL}/api/messages/${userId}`,
      authConfig()
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
      authConfig()
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
  messageId
) => {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  try {
    const response = await axios.put(
      `${API_URL}/api/messages/${messageId}/read`,
      {},
      authConfig()
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
  messageId
) => {
  if (!messageId) {
    throw new Error("Message ID is required.");
  }

  try {
    const response = await axios.delete(
      `${API_URL}/api/messages/${messageId}`,
      authConfig()
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
// GET CONVERSATION
// Client-side helper
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

  const messages = result?.messages || [];

  const conversation = messages.filter(
    (msg) => {
      const senderId =
        msg.sender?._id ||
        msg.sender?.id ||
        msg.sender;

      const receiverId =
        msg.receiver?._id ||
        msg.receiver?.id ||
        msg.receiver;

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
// Client-side helper
// ============================================================

export const markConversationRead = async (
  messages = [],
  currentUserId
) => {
  if (!currentUserId) {
    throw new Error("Current user ID is required.");
  }

  const unreadMessages = messages.filter(
    (msg) => {
      const receiverId =
        msg.receiver?._id ||
        msg.receiver?.id ||
        msg.receiver;

      return (
        !msg.read &&
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
    };
  }

  const results = await Promise.all(
    unreadMessages.map((msg) =>
      markMessageRead(msg._id)
    )
  );

  return {
    success: true,
    message: "Messages marked as read.",
    messages: results,
  };
};

// ============================================================
// UNREAD MESSAGE COUNT
// ============================================================

export const getUnreadMessageCount = (
  messages = [],
  currentUserId
) => {
  if (!currentUserId) {
    return 0;
  }

  return messages.filter((msg) => {
    const receiverId =
      msg.receiver?._id ||
      msg.receiver?.id ||
      msg.receiver;

    return (
      !msg.read &&
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

  messages.forEach((msg) => {
    const senderId =
      msg.sender?._id ||
      msg.sender?.id ||
      msg.sender;

    const receiverId =
      msg.receiver?._id ||
      msg.receiver?.id ||
      msg.receiver;

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
          new Date(a.createdAt) -
          new Date(b.createdAt)
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
  getConversation,
  markConversationRead,
  getUnreadMessageCount,
  groupMessagesByConversation,
};

export default messageService;