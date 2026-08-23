// ============================================================
// frontend/src/pages/Messages.jsx
// BuyUKUsed - Messages / Chat Page
// ============================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import messageService from "../services/messageService";

// ============================================================
// API CONFIG
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://buyukused.onrender.com"
).replace(/\/+$/, "");

// ============================================================
// HELPERS
// ============================================================

const getCurrentUser = () => {
  try {
    const possibleKeys = [
      "user",
      "currentUser",
      "authUser",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (!value) {
        continue;
      }

      try {
        const parsed = JSON.parse(value);

        if (parsed) {
          return parsed;
        }
      } catch {
        // Ignore invalid JSON.
      }
    }

    return null;
  } catch {
    return null;
  }
};

// ============================================================
// GET USER ID
// ============================================================

const getUserId = (user) => {
  if (!user) {
    return null;
  }

  return (
    user._id ||
    user.id ||
    user.userId ||
    null
  );
};

// ============================================================
// GET TOKEN
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
};

// ============================================================
// GET USER DISPLAY NAME
// ============================================================

const getUserName = (user) => {
  if (!user) {
    return "User";
  }

  return (
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "User"
  );
};

// ============================================================
// GET USER IMAGE
// ============================================================

const getUserImage = (user) => {
  if (!user) {
    return null;
  }

  const image =
    user.photoURL ||
    user.profilePicture ||
    user.profileImage ||
    user.avatar ||
    user.image ||
    null;

  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return image;
};

// ============================================================
// FORMAT TIME
// ============================================================

const formatTime = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ============================================================
// MESSAGE ID
// ============================================================

const getMessageId = (message) => {
  return (
    message?._id ||
    message?.id ||
    null
  );
};

// ============================================================
// MESSAGE USER ID
// ============================================================

const getMessageUserId = (value) => {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  return String(
    value._id ||
      value.id ||
      value.userId ||
      ""
  );
};

// ============================================================
// PRODUCT IMAGE
// ============================================================

const getProductImage = (product) => {
  if (!product) {
    return null;
  }

  const image =
    product.image ||
    product.images?.[0] ||
    null;

  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  return image;
};

// ============================================================
// AVATAR COMPONENT
// ============================================================

const Avatar = ({
  user,
  size = 44,
}) => {
  const name = getUserName(user);
  const image = getUserImage(user);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #111827, #374151)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: Math.max(12, size * 0.32),
      }}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />
      ) : (
        initials || "U"
      )}
    </div>
  );
};

// ============================================================
// MESSAGE BUBBLE
// ============================================================

const MessageBubble = ({
  message,
  currentUserId,
  onRead,
  onDelete,
}) => {
  const senderId = getMessageUserId(
    message?.sender
  );

  const isMine =
    String(senderId) ===
    String(currentUserId);

  const product =
    message?.productId || null;

  const productImage =
    getProductImage(product);

  const isRead =
    message?.read === true;

  useEffect(() => {
    if (!isMine && !isRead) {
      const id = getMessageId(message);

      if (id) {
        onRead?.(id);
      }
    }
  }, [
    isMine,
    isRead,
    message,
    onRead,
  ]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine
          ? "flex-end"
          : "flex-start",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          maxWidth: "min(75%, 620px)",
        }}
      >
        <div
          style={{
            background: isMine
              ? "#111827"
              : "#f3f4f6",
            color: isMine
              ? "#ffffff"
              : "#111827",
            padding: "11px 14px",
            borderRadius: isMine
              ? "18px 18px 4px 18px"
              : "18px 18px 18px 4px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {product && (
            <div
              style={{
                marginBottom: 10,
                borderRadius: 12,
                overflow: "hidden",
                background: isMine
                  ? "rgba(255,255,255,0.08)"
                  : "#ffffff",
              }}
            >
              {productImage && (
                <img
                  src={productImage}
                  alt={product.title || "Product"}
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}

              <div
                style={{
                  padding: 10,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {product.title ||
                    "Product"}
                </div>

                {product.price !==
                  undefined &&
                  product.price !== null && (
                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 13,
                        opacity: 0.75,
                      }}
                    >
                      GH₵{" "}
                      {Number(
                        product.price
                      ).toLocaleString()}
                    </div>
                  )}
              </div>
            </div>
          )}

          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.5,
              fontSize: 14,
            }}
          >
            {message?.message}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 7,
              marginTop: 5,
              fontSize: 10,
              opacity: 0.65,
            }}
          >
            <span>
              {formatTime(
                message?.createdAt
              )}
            </span>

            {isMine && (
              <span>
                {isRead
                  ? "✓✓"
                  : "✓"}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onDelete?.(
              getMessageId(message)
            )
          }
          style={{
            border: 0,
            background: "transparent",
            color: "#9ca3af",
            fontSize: 10,
            cursor: "pointer",
            padding: "3px 5px",
            display: "block",
            marginLeft: isMine
              ? "auto"
              : 0,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// ============================================================
// MESSAGES PAGE
// ============================================================

const Messages = () => {
  const navigate = useNavigate();

  const {
    userId: routeUserId,
    productId: routeProductId,
  } = useParams();

  // ==========================================================
  // USER
  // ==========================================================

  const [currentUser, setCurrentUser] =
    useState(() =>
      getCurrentUser()
    );

  const currentUserId =
    getUserId(currentUser);

  // ==========================================================
  // STATE
  // ==========================================================

  const [messages, setMessages] =
    useState([]);

  const [selectedUserId, setSelectedUserId] =
    useState(routeUserId || null);

  const [
    conversationUsers,
    setConversationUsers,
  ] = useState({});

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    conversationLoading,
    setConversationLoading,
  ] = useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);

  // ==========================================================
  // REFRESH CURRENT USER
  // ==========================================================

  useEffect(() => {
    const refreshUser = () => {
      setCurrentUser(
        getCurrentUser()
      );
    };

    window.addEventListener(
      "storage",
      refreshUser
    );

    refreshUser();

    return () => {
      window.removeEventListener(
        "storage",
        refreshUser
      );
    };
  }, []);

  // ==========================================================
  // SELECT USER FROM URL
  // ==========================================================

  useEffect(() => {
    if (routeUserId) {
      setSelectedUserId(
        routeUserId
      );
    }
  }, [routeUserId]);

  // ==========================================================
  // AUTH CHECK
  // ==========================================================

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      setError(
        "Please log in to view your messages."
      );
    }
  }, []);

  // ==========================================================
  // LOAD ALL USER MESSAGES
  // ==========================================================

  const loadMessages = useCallback(
    async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setError("");

        const result =
          await messageService.getMessages(
            currentUserId
          );

        const allMessages =
          Array.isArray(
            result?.messages
          )
            ? result.messages
            : [];

        setMessages(allMessages);

        // ----------------------------------------------
        // Build user map
        // ----------------------------------------------

        const users = {};

        allMessages.forEach(
          (message) => {
            const sender =
              message?.sender;

            const receiver =
              message?.receiver;

            const senderId =
              getMessageUserId(
                sender
              );

            const receiverId =
              getMessageUserId(
                receiver
              );

            if (
              senderId &&
              String(senderId) !==
                String(currentUserId) &&
              typeof sender ===
                "object"
            ) {
              users[
                String(senderId)
              ] = sender;
            }

            if (
              receiverId &&
              String(receiverId) !==
                String(currentUserId) &&
              typeof receiver ===
                "object"
            ) {
              users[
                String(receiverId)
              ] = receiver;
            }
          }
        );

        setConversationUsers(
          users
        );

        const count =
          messageService.getUnreadMessageCount(
            allMessages,
            currentUserId
          );

        setUnreadCount(count);
      } catch (err) {
        console.error(
          "❌ Failed to load messages:",
          err
        );

        setError(
          err?.message ||
            "Unable to load messages."
        );
      } finally {
        setLoading(false);
      }
    },
    [currentUserId]
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ==========================================================
  // LOAD CONVERSATION
  // ==========================================================

  const loadConversation =
    useCallback(
      async (otherUserId) => {
        if (
          !currentUserId ||
          !otherUserId
        ) {
          return;
        }

        try {
          setConversationLoading(
            true
          );
          setError("");

          const result =
            await messageService.getConversation(
              currentUserId,
              otherUserId
            );

          const conversation =
            Array.isArray(
              result?.messages
            )
              ? result.messages
              : [];

          setMessages(
            (previous) => {
              const otherMessages =
                previous.filter(
                  (message) => {
                    const senderId =
                      getMessageUserId(
                        message?.sender
                      );

                    const receiverId =
                      getMessageUserId(
                        message?.receiver
                      );

                    return (
                      String(
                        senderId
                      ) ===
                        String(
                          otherUserId
                        ) ||
                      String(
                        receiverId
                      ) ===
                        String(
                          otherUserId
                        )
                    );
                  }
                );

              const ids = new Set(
                conversation.map(
                  (message) =>
                    String(
                      getMessageId(
                        message
                      )
                    )
                )
              );

              const unrelated =
                previous.filter(
                  (message) => {
                    return !ids.has(
                      String(
                        getMessageId(
                          message
                        )
                      )
                    );
                  }
                );

              return [
                ...unrelated,
                ...conversation,
              ];
            }
          );

          // --------------------------------------------
          // Mark incoming unread messages as read
          // --------------------------------------------

          const unread =
            conversation.filter(
              (message) => {
                const receiverId =
                  getMessageUserId(
                    message?.receiver
                  );

                return (
                  !message?.read &&
                  String(
                    receiverId
                  ) ===
                    String(
                      currentUserId
                    )
                );
              }
            );

          if (unread.length) {
            await Promise.all(
              unread.map(
                (message) =>
                  messageService.markMessageRead(
                    getMessageId(
                      message
                    )
                  )
              )
            );

            setMessages(
              (previous) =>
                previous.map(
                  (message) => {
                    const messageId =
                      String(
                        getMessageId(
                          message
                        )
                      );

                    const wasUnread =
                      unread.some(
                        (item) =>
                          String(
                            getMessageId(
                              item
                            )
                          ) ===
                          messageId
                      );

                    return wasUnread
                      ? {
                          ...message,
                          read: true,
                        }
                      : message;
                  }
                )
            );

            setUnreadCount(
              (value) =>
                Math.max(
                  0,
                  value -
                    unread.length
                )
            );
          }
        } catch (err) {
          console.error(
            "❌ Failed to load conversation:",
            err
          );

          setError(
            err?.message ||
              "Unable to load conversation."
          );
        } finally {
          setConversationLoading(
            false
          );
        }
      },
      [currentUserId]
    );

  // ==========================================================
  // ROUTE CONVERSATION
  // ==========================================================

  useEffect(() => {
    if (
      currentUserId &&
      selectedUserId
    ) {
      loadConversation(
        selectedUserId
      );
    }
  }, [
    currentUserId,
    selectedUserId,
    loadConversation,
  ]);

  // ==========================================================
  // SELECT CONVERSATION
  // ==========================================================

  const handleSelectConversation =
    (userId) => {
      if (!userId) {
        return;
      }

      setSelectedUserId(
        String(userId)
      );

      navigate(
        `/chat/${userId}`
      );
    };

  // ==========================================================
  // CONVERSATION GROUPS
  // ==========================================================

  const conversations =
    useMemo(() => {
      if (!currentUserId) {
        return [];
      }

      const grouped =
        messageService.groupMessagesByConversation(
          messages,
          currentUserId
        );

      return Object.entries(
        grouped
      )
        .map(
          ([
            partnerId,
            conversationMessages,
          ]) => {
            const sorted = [
              ...conversationMessages,
            ].sort(
              (a, b) =>
                new Date(
                  b.createdAt
                ) -
                new Date(
                  a.createdAt
                )
            );

            const lastMessage =
              sorted[0] || null;

            let partner =
              conversationUsers[
                partnerId
              ];

            if (!partner) {
              const source =
                lastMessage?.sender;

              const receiver =
                lastMessage?.receiver;

              const sourceId =
                getMessageUserId(
                  source
                );

              partner =
                String(
                  sourceId
                ) ===
                String(
                  currentUserId
                )
                  ? receiver
                  : source;
            }

            const unread =
              conversationMessages.filter(
                (message) => {
                  const receiverId =
                    getMessageUserId(
                      message?.receiver
                    );

                  return (
                    !message?.read &&
                    String(
                      receiverId
                    ) ===
                      String(
                        currentUserId
                      )
                  );
                }
              ).length;

            return {
              partnerId,
              partner,
              messages:
                sorted,
              lastMessage,
              unread,
            };
          }
        )
        .filter(
          (conversation) => {
            if (!search.trim()) {
              return true;
            }

            const name =
              getUserName(
                conversation.partner
              ).toLowerCase();

            const text =
              conversation
                .lastMessage?.message ||
              "";

            return (
              name.includes(
                search
                  .trim()
                  .toLowerCase()
              ) ||
              text
                .toLowerCase()
                .includes(
                  search
                    .trim()
                    .toLowerCase()
                )
            );
          }
        )
        .sort(
          (a, b) =>
            new Date(
              b.lastMessage
                ?.createdAt || 0
            ) -
            new Date(
              a.lastMessage
                ?.createdAt || 0
            )
        );
    }, [
      messages,
      currentUserId,
      conversationUsers,
      search,
    ]);

  // ==========================================================
  // CURRENT CONVERSATION
  // ==========================================================

  const currentConversation =
    useMemo(() => {
      if (
        !currentUserId ||
        !selectedUserId
      ) {
        return [];
      }

      return messages
        .filter((message) => {
          const senderId =
            getMessageUserId(
              message?.sender
            );

          const receiverId =
            getMessageUserId(
              message?.receiver
            );

          return (
            (
              String(senderId) ===
                String(
                  currentUserId
                ) &&
              String(receiverId) ===
                String(
                  selectedUserId
                )
            ) ||
            (
              String(senderId) ===
                String(
                  selectedUserId
                ) &&
              String(receiverId) ===
                String(
                  currentUserId
                )
            )
          );
        })
        .sort(
          (a, b) =>
            new Date(
              a.createdAt
            ) -
            new Date(
              b.createdAt
            )
        );
    }, [
      messages,
      currentUserId,
      selectedUserId,
    ]);

  // ==========================================================
  // CURRENT PARTNER
  // ==========================================================

  const currentPartner =
    useMemo(() => {
      if (!selectedUserId) {
        return null;
      }

      if (
        conversationUsers[
          selectedUserId
        ]
      ) {
        return conversationUsers[
          selectedUserId
        ];
      }

      const message =
        currentConversation[
          currentConversation.length -
            1
        ];

      if (!message) {
        return null;
      }

      const senderId =
        getMessageUserId(
          message.sender
        );

      return String(senderId) ===
        String(currentUserId)
        ? message.receiver
        : message.sender;
    }, [
      selectedUserId,
      conversationUsers,
      currentConversation,
      currentUserId,
    ]);

  // ==========================================================
  // SCROLL TO BOTTOM
  // ==========================================================

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }

    const timer = setTimeout(
      () => {
        messagesEndRef.current?.scrollIntoView(
          {
            behavior: "smooth",
          }
        );
      },
      100
    );

    return () =>
      clearTimeout(timer);
  }, [
    currentConversation.length,
    selectedUserId,
  ]);

  // ==========================================================
  // SELECT PRODUCT FROM URL
  // ==========================================================

  useEffect(() => {
    if (!routeProductId) {
      return;
    }

    const productFromMessages =
      messages.find((message) => {
        const product =
          message?.productId;

        const productId =
          product?._id ||
          product?.id;

        return (
          String(productId) ===
          String(routeProductId)
        );
      })?.productId;

    if (productFromMessages) {
      setSelectedProduct(
        productFromMessages
      );
    }
  }, [
    routeProductId,
    messages,
  ]);

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const handleSend = async (
    event
  ) => {
    event?.preventDefault();

    const text = input.trim();

    if (!text) {
      return;
    }

    if (!currentUserId) {
      setError(
        "Please log in before sending messages."
      );
      return;
    }

    if (!selectedUserId) {
      setError(
        "Please select a conversation."
      );
      return;
    }

    if (
      String(selectedUserId) ===
      String(currentUserId)
    ) {
      setError(
        "You cannot message yourself."
      );
      return;
    }

    try {
      setSending(true);
      setError("");

      const result =
        await messageService.sendMessage(
          {
            receiver:
              selectedUserId,

            productId:
              selectedProduct?._id ||
              selectedProduct?.id ||
              routeProductId ||
              null,

            message: text,
          }
        );

      const sentMessage =
        result?.message;

      if (sentMessage) {
        setMessages(
          (previous) => [
            ...previous,
            sentMessage,
          ]
        );

        // Update partner information
        const receiver =
          sentMessage.receiver;

        if (
          receiver &&
          typeof receiver ===
            "object"
        ) {
          const receiverId =
            getMessageUserId(
              receiver
            );

          if (receiverId) {
            setConversationUsers(
              (previous) => ({
                ...previous,
                [receiverId]:
                  receiver,
              })
            );
          }
        }
      }

      setInput("");

      inputRef.current?.focus();
    } catch (err) {
      console.error(
        "❌ Send message error:",
        err
      );

      setError(
        err?.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================================
  // MARK MESSAGE READ
  // ==========================================================

  const handleMarkRead =
    useCallback(
      async (messageId) => {
        if (!messageId) {
          return;
        }

        try {
          await messageService.markMessageRead(
            messageId
          );

          setMessages(
            (previous) =>
              previous.map(
                (message) =>
                  String(
                    getMessageId(
                      message
                    )
                  ) ===
                  String(messageId)
                    ? {
                        ...message,
                        read: true,
                      }
                    : message
              )
          );
        } catch (err) {
          console.error(
            "❌ Mark read error:",
            err
          );
        }
      },
      []
    );

  // ==========================================================
  // DELETE MESSAGE
  // ==========================================================

  const handleDelete =
    async (messageId) => {
      if (!messageId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this message?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await messageService.deleteMessage(
          messageId
        );

        setMessages(
          (previous) =>
            previous.filter(
              (message) =>
                String(
                  getMessageId(
                    message
                  )
                ) !==
                String(messageId)
            )
        );
      } catch (err) {
        console.error(
          "❌ Delete message error:",
          err
        );

        setError(
          err?.message ||
            "Unable to delete message."
        );
      }
    };

  // ==========================================================
  // START NEW CHAT FROM ROUTE
  // ==========================================================

  useEffect(() => {
    if (
      routeUserId &&
      !conversationUsers[
        routeUserId
      ]
    ) {
      // We don't need to fetch the
      // other user here because the
      // conversation endpoint will
      // provide populated sender/receiver
      // information if messages exist.
    }
  }, [
    routeUserId,
    conversationUsers,
  ]);

  // ==========================================================
  // NOT LOGGED IN
  // ==========================================================

  if (!getToken()) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#ffffff",
            borderRadius: 20,
            padding: 32,
            textAlign: "center",
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 14,
            }}
          >
            💬
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: 26,
              color: "#111827",
            }}
          >
            Your Messages
          </h1>

          <p
            style={{
              margin: "0 0 24px",
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            Log in to message sellers,
            buyers and other BuyUKUsed
            members.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            style={{
              width: "100%",
              border: 0,
              borderRadius: 12,
              padding: "13px 18px",
              background: "#111827",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      style={{
        minHeight:
          "calc(100vh - 80px)",
        background: "#f8fafc",
        padding:
          "24px 16px 40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          height:
            "calc(100vh - 130px)",
          minHeight: 600,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "320px minmax(0, 1fr)",
          background: "#ffffff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.08)",
          border:
            "1px solid #e5e7eb",
        }}
      >
        {/* ====================================================
            LEFT SIDEBAR
        ==================================================== */}

        <aside
          style={{
            borderRight:
              "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* HEADER */}

          <div
            style={{
              padding:
                "20px 18px 14px",
              borderBottom:
                "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 10,
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 21,
                    color: "#111827",
                  }}
                >
                  Messages
                </h1>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize: 12,
                    color:
                      "#6b7280",
                  }}
                >
                  BuyUKUsed chat
                </p>
              </div>

              {unreadCount > 0 && (
                <div
                  style={{
                    minWidth: 28,
                    height: 28,
                    padding:
                      "0 8px",
                    borderRadius:
                      999,
                    background:
                      "#111827",
                    color:
                      "#ffffff",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </div>
              )}
            </div>

            {/* SEARCH */}

            <div
              style={{
                marginTop: 14,
                position:
                  "relative",
              }}
            >
              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search conversations..."
                style={{
                  width: "100%",
                  boxSizing:
                    "border-box",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: 11,
                  padding:
                    "10px 12px 10px 36px",
                  outline: "none",
                  fontSize: 13,
                  background:
                    "#f9fafb",
                }}
              />

              <span
                style={{
                  position:
                    "absolute",
                  left: 12,
                  top: 9,
                  fontSize: 15,
                }}
              >
                🔎
              </span>
            </div>
          </div>

          {/* CONVERSATIONS */}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color:
                    "#6b7280",
                  fontSize: 13,
                }}
              >
                Loading messages...
              </div>
            ) : conversations.length ===
              0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color:
                    "#6b7280",
                }}
              >
                <div
                  style={{
                    fontSize: 38,
                    marginBottom: 10,
                  }}
                >
                  💬
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    color:
                      "#374151",
                    marginBottom: 5,
                  }}
                >
                  No conversations yet
                </div>

                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.5,
                  }}
                >
                  Message a seller or
                  buyer from a product
                  page to start chatting.
                </div>
              </div>
            ) : (
              conversations.map(
                (conversation) => {
                  const partner =
                    conversation.partner;

                  const active =
                    String(
                      selectedUserId
                    ) ===
                    String(
                      conversation.partnerId
                    );

                  return (
                    <button
                      key={
                        conversation.partnerId
                      }
                      type="button"
                      onClick={() =>
                        handleSelectConversation(
                          conversation.partnerId
                        )
                      }
                      style={{
                        width: "100%",
                        border: 0,
                        borderBottom:
                          "1px solid #f3f4f6",
                        background:
                          active
                            ? "#f3f4f6"
                            : "#ffffff",
                        padding:
                          "13px 14px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 11,
                        textAlign:
                          "left",
                        cursor:
                          "pointer",
                      }}
                    >
                      <Avatar
                        user={partner}
                        size={44}
                      />

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight:
                                conversation.unread >
                                0
                                  ? 800
                                  : 600,
                              color:
                                "#111827",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {getUserName(
                              partner
                            )}
                          </span>

                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: 10,
                              color:
                                "#9ca3af",
                            }}
                          >
                            {formatTime(
                              conversation
                                .lastMessage
                                ?.createdAt
                            )}
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: 6,
                            marginTop: 4,
                          }}
                        >
                          <span
                            style={{
                              flex: 1,
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                              fontSize: 12,
                              color:
                                conversation.unread >
                                0
                                  ? "#374151"
                                  : "#9ca3af",
                              fontWeight:
                                conversation.unread >
                                0
                                  ? 600
                                  : 400,
                            }}
                          >
                            {conversation
                              .lastMessage
                              ?.message ||
                              "No message"}
                          </span>

                          {conversation.unread >
                            0 && (
                            <span
                              style={{
                                minWidth: 19,
                                height: 19,
                                padding:
                                  "0 5px",
                                borderRadius:
                                  999,
                                background:
                                  "#111827",
                                color:
                                  "#ffffff",
                                fontSize: 10,
                                fontWeight:
                                  700,
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              {conversation.unread >
                              99
                                ? "99+"
                                : conversation.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </aside>

        {/* ====================================================
            CHAT AREA
        ==================================================== */}

        <main
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection:
              "column",
          }}
        >
          {!selectedUserId ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding: 30,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  maxWidth: 420,
                }}
              >
                <div
                  style={{
                    fontSize: 64,
                    marginBottom: 12,
                  }}
                >
                  💬
                </div>

                <h2
                  style={{
                    margin:
                      "0 0 8px",
                    fontSize: 24,
                    color:
                      "#111827",
                  }}
                >
                  Your conversations
                </h2>

                <p
                  style={{
                    margin: 0,
                    color:
                      "#6b7280",
                    lineHeight:
                      1.6,
                    fontSize: 14,
                  }}
                >
                  Select a conversation
                  to start chatting with
                  a BuyUKUsed member.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ==================================================
                  CHAT HEADER
              ================================================== */}

              <header
                style={{
                  minHeight: 70,
                  padding:
                    "12px 18px",
                  borderBottom:
                    "1px solid #e5e7eb",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 12,
                }}
              >
                <Avatar
                  user={
                    currentPartner
                  }
                  size={44}
                />

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color:
                        "#111827",
                    }}
                  >
                    {getUserName(
                      currentPartner
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 11,
                      color:
                        "#9ca3af",
                    }}
                  >
                    BuyUKUsed member
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/seller/${selectedUserId}`
                    )
                  }
                  style={{
                    border:
                      "1px solid #e5e7eb",
                    background:
                      "#ffffff",
                    borderRadius: 9,
                    padding:
                      "8px 11px",
                    cursor:
                      "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color:
                      "#374151",
                  }}
                >
                  View Profile
                </button>
              </header>

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div
                  style={{
                    margin:
                      "10px 14px 0",
                    padding:
                      "10px 12px",
                    borderRadius: 10,
                    background:
                      "#fef2f2",
                    color:
                      "#b91c1c",
                    fontSize: 12,
                    border:
                      "1px solid #fecaca",
                  }}
                >
                  {error}
                </div>
              )}

              {/* ==================================================
                  MESSAGES
              ================================================== */}

              <div
                style={{
                  flex: 1,
                  overflowY:
                    "auto",
                  padding:
                    "18px 20px",
                  background:
                    "#fafafa",
                }}
              >
                {conversationLoading ? (
                  <div
                    style={{
                      height:
                        "100%",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      color:
                        "#6b7280",
                      fontSize: 13,
                    }}
                  >
                    Loading conversation...
                  </div>
                ) : currentConversation.length ===
                  0 ? (
                  <div
                    style={{
                      height:
                        "100%",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      textAlign:
                        "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 45,
                          marginBottom: 10,
                        }}
                      >
                        👋
                      </div>

                      <div
                        style={{
                          fontWeight: 800,
                          color:
                            "#111827",
                          marginBottom: 5,
                        }}
                      >
                        Start the conversation
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color:
                            "#6b7280",
                        }}
                      >
                        Send your first
                        message below.
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {currentConversation.map(
                      (message, index) => {
                        const previous =
                          currentConversation[
                            index - 1
                          ];

                        const currentDate =
                          formatDate(
                            message.createdAt
                          );

                        const previousDate =
                          formatDate(
                            previous?.createdAt
                          );

                        const showDate =
                          currentDate !==
                          previousDate;

                        return (
                          <React.Fragment
                            key={
                              getMessageId(
                                message
                              ) ||
                              `message-${index}`
                            }
                          >
                            {showDate && (
                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "center",
                                  margin:
                                    "8px 0 14px",
                                }}
                              >
                                <span
                                  style={{
                                    background:
                                      "#e5e7eb",
                                    color:
                                      "#6b7280",
                                    padding:
                                      "4px 9px",
                                    borderRadius:
                                      999,
                                    fontSize:
                                      10,
                                  }}
                                >
                                  {
                                    currentDate
                                  }
                                </span>
                              </div>
                            )}

                            <MessageBubble
                              message={
                                message
                              }
                              currentUserId={
                                currentUserId
                              }
                              onRead={
                                handleMarkRead
                              }
                              onDelete={
                                handleDelete
                              }
                            />
                          </React.Fragment>
                        );
                      }
                    )}

                    <div
                      ref={
                        messagesEndRef
                      }
                    />
                  </>
                )}
              </div>

              {/* ==================================================
                  SELECTED PRODUCT
              ================================================== */}

              {selectedProduct && (
                <div
                  style={{
                    padding:
                      "8px 14px",
                    borderTop:
                      "1px solid #e5e7eb",
                    background:
                      "#ffffff",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 9,
                      padding:
                        "8px 10px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius:
                        10,
                    }}
                  >
                    {getProductImage(
                      selectedProduct
                    ) && (
                      <img
                        src={getProductImage(
                          selectedProduct
                        )}
                        alt={
                          selectedProduct.title ||
                          "Product"
                        }
                        style={{
                          width: 42,
                          height: 42,
                          objectFit:
                            "cover",
                          borderRadius:
                            7,
                        }}
                      />
                    )}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color:
                            "#9ca3af",
                        }}
                      >
                        Product
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          fontWeight:
                            700,
                          color:
                            "#111827",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          selectedProduct.title
                        }
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProduct(
                          null
                        )
                      }
                      style={{
                        border: 0,
                        background:
                          "transparent",
                        color:
                          "#9ca3af",
                        cursor:
                          "pointer",
                        fontSize:
                          16,
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================
                  COMPOSER
              ================================================== */}

              <form
                onSubmit={
                  handleSend
                }
                style={{
                  padding:
                    "12px 14px 14px",
                  borderTop:
                    "1px solid #e5e7eb",
                  background:
                    "#ffffff",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "flex-end",
                    gap: 9,
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(
                      event
                    ) =>
                      setInput(
                        event
                          .target
                          .value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        handleSend(
                          event
                        );
                      }
                    }}
                    placeholder="Write a message..."
                    maxLength={5000}
                    rows={1}
                    style={{
                      flex: 1,
                      resize:
                        "none",
                      minHeight: 44,
                      maxHeight: 130,
                      border:
                        "1px solid #d1d5db",
                      borderRadius: 13,
                      padding:
                        "12px 13px",
                      outline:
                        "none",
                      fontSize: 14,
                      lineHeight:
                        1.4,
                      fontFamily:
                        "inherit",
                      boxSizing:
                        "border-box",
                    }}
                  />

                  <button
                    type="submit"
                    disabled={
                      sending ||
                      !input.trim()
                    }
                    style={{
                      minWidth: 88,
                      height: 44,
                      border: 0,
                      borderRadius: 13,
                      background:
                        sending ||
                        !input.trim()
                          ? "#d1d5db"
                          : "#111827",
                      color:
                        "#ffffff",
                      fontWeight: 700,
                      cursor:
                        sending ||
                        !input.trim()
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {sending
                      ? "Sending..."
                      : "Send"}
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 5,
                    textAlign:
                      "right",
                    fontSize: 10,
                    color:
                      "#9ca3af",
                  }}
                >
                  {input.length}/5000
                </div>
              </form>
            </>
          )}
        </main>
      </div>

      {/* ======================================================
          MOBILE RESPONSIVE CSS
      ====================================================== */}

      <style>
        {`
          @media (max-width: 800px) {
            .buyukused-messages-shell {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 700px) {
            div[style*="grid-template-columns: 320px"] {
              grid-template-columns: 1fr !important;
              height: calc(100vh - 100px) !important;
              min-height: 500px !important;
            }

            div[style*="grid-template-columns: 320px"] aside {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default Messages;