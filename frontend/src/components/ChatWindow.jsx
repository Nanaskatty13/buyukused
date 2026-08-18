// frontend/src/components/chat/ChatWindow.jsx

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ChatWindow({
  otherUserId,
}) {
  const { user } = useAuth();

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [text, setText] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const bottomRef =
    useRef(null);

  const currentUserId =
    String(
      user?._id ||
        user?.id ||
        ""
    );

  // ============================================================
  // EXTRACT CLOUDINARY IMAGE URL
  // ============================================================

  const extractImageUrl = (
    message
  ) => {
    if (
      typeof message !==
      "string"
    ) {
      return null;
    }

    const match =
      message.match(
        /https?:\/\/res\.cloudinary\.com\/[^\s]+/i
      );

    if (!match) {
      return null;
    }

    return match[0].replace(
      /[),]+$/,
      ""
    );
  };

  // ============================================================
  // IS IMAGE MESSAGE?
  // ============================================================

  const isImageMessage = (
    message
  ) => {
    if (
      typeof message !==
      "string"
    ) {
      return false;
    }

    return Boolean(
      message.includes(
        "📷 Image:"
      ) ||
        message.includes(
          "res.cloudinary.com"
        )
    );
  };

  // ============================================================
  // LOAD CONVERSATION
  // ============================================================

  const loadMessages = async () => {
    if (!otherUserId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);

      const data =
        await api.messages.getConversation(
          otherUserId
        );

      const list =
        data?.messages ||
        data?.conversation ||
        data?.data ||
        [];

      setMessages(
        Array.isArray(list)
          ? [...list].reverse()
          : []
      );
    } catch (error) {
      console.error(
        "❌ Failed to load messages:",
        error
      );

      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD WHEN USER CHANGES
  // ============================================================

  useEffect(() => {
    loadMessages();

    const interval =
      setInterval(
        loadMessages,
        3000
      );

    return () =>
      clearInterval(interval);
  }, [otherUserId]);

  // ============================================================
  // SCROLL TO BOTTOM
  // ============================================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ============================================================
  // SEND TEXT MESSAGE
  // ============================================================

  const sendTextMessage =
    async (event) => {
      event?.preventDefault();

      const cleanText =
        text.trim();

      if (
        !cleanText ||
        !otherUserId ||
        sending
      ) {
        return;
      }

      try {
        setSending(true);

        const response =
          await api.messages.send(
            otherUserId,
            cleanText,
            null
          );

        if (
          response?.message
        ) {
          setMessages(
            (previous) => [
              ...previous,
              response.message,
            ]
          );
        }

        setText("");
      } catch (error) {
        console.error(
          "❌ Failed to send message:",
          error
        );

        alert(
          error?.message ||
            "Failed to send message."
        );
      } finally {
        setSending(false);
      }
    };

  // ============================================================
  // RENDER MESSAGE CONTENT
  // ============================================================

  const renderMessage = (
    message
  ) => {
    const content =
      message?.message ||
      "";

    // ----------------------------------------------------------
    // IMAGE
    // ----------------------------------------------------------

    if (
      isImageMessage(
        content
      )
    ) {
      const imageUrl =
        extractImageUrl(
          content
        );

      if (imageUrl) {
        return (
          <div className="space-y-2">
            <img
              src={imageUrl}
              alt="Shared image"
              className="max-w-[280px] md:max-w-[360px] max-h-[400px] rounded-xl object-cover cursor-pointer border"
              onClick={() =>
                window.open(
                  imageUrl,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              onError={(event) => {
                console.error(
                  "❌ Image failed to load:",
                  imageUrl
                );

                event.currentTarget.style.display =
                  "none";
              }}
            />

            <div className="text-xs opacity-60">
              📷 Image
            </div>
          </div>
        );
      }
    }

    // ----------------------------------------------------------
    // NORMAL TEXT
    // ----------------------------------------------------------

    return (
      <p className="whitespace-pre-wrap break-words">
        {content}
      </p>
    );
  };

  // ============================================================
  // NO USER SELECTED
  // ============================================================

  if (!otherUserId) {
    return (
      <div className="bg-white rounded-2xl border min-h-[650px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-5xl mb-3">
            💬
          </div>

          <h2 className="text-lg font-semibold text-gray-700">
            Select a conversation
          </h2>

          <p className="text-sm mt-1">
            Choose someone from your
            messages.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // CHAT UI
  // ============================================================

  return (
    <div className="bg-white rounded-2xl border overflow-hidden flex flex-col min-h-[650px]">
      {/* HEADER */}

      <div className="px-5 py-4 border-b">
        <h2 className="font-semibold">
          Conversation
        </h2>
      </div>

      {/* MESSAGES */}

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {loading &&
        messages.length ===
          0 ? (
          <div className="text-center text-gray-500 py-10">
            Loading messages...
          </div>
        ) : messages.length ===
          0 ? (
          <div className="text-center text-gray-500 py-10">
            <div className="text-4xl mb-2">
              👋
            </div>

            <p>
              No messages yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(
              (
                message,
                index
              ) => {
                const senderId =
                  String(
                    message?.sender?._id ||
                      message?.sender?.id ||
                      message?.sender ||
                      ""
                  );

                const mine =
                  senderId ===
                  currentUserId;

                return (
                  <div
                    key={
                      message?._id ||
                      index
                    }
                    className={`flex ${
                      mine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        mine
                          ? "bg-black text-white rounded-br-md"
                          : "bg-white text-gray-900 border rounded-bl-md"
                      }`}
                    >
                      {renderMessage(
                        message
                      )}

                      <div
                        className={`text-[10px] mt-2 ${
                          mine
                            ? "text-white/60"
                            : "text-gray-400"
                        }`}
                      >
                        {message?.createdAt
                          ? new Date(
                              message.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              }
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* INPUT */}

      <form
        onSubmit={
          sendTextMessage
        }
        className="p-4 border-t bg-white flex gap-3"
      >
        <input
          type="text"
          value={text}
          onChange={(event) =>
            setText(
              event.target.value
            )
          }
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
          disabled={sending}
        />

        <button
          type="submit"
          disabled={
            sending ||
            !text.trim()
          }
          className="px-5 py-3 rounded-full bg-black text-white disabled:opacity-40"
        >
          {sending
            ? "..."
            : "Send"}
        </button>
      </form>
    </div>
  );
}