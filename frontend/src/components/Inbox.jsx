// frontend/src/components/chat/Inbox.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Inbox({
  selectedUserId,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadConversations = async () => {
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data =
        await api.messages.getConversations();

      const list =
        data?.conversations ||
        data?.messages ||
        data?.data ||
        [];

      setConversations(
        Array.isArray(list)
          ? list
          : []
      );
    } catch (error) {
      console.error(
        "❌ Failed to load conversations:",
        error
      );

      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    const interval =
      setInterval(
        loadConversations,
        5000
      );

    return () =>
      clearInterval(interval);
  }, [user?._id, user?.id]);

  const getOtherUser = (conversation) => {
    if (!conversation) {
      return null;
    }

    if (
      conversation.otherUser
    ) {
      return conversation.otherUser;
    }

    if (
      conversation.user
    ) {
      return conversation.user;
    }

    if (
      conversation.sender &&
      conversation.receiver
    ) {
      const currentId =
        String(
          user?._id ||
            user?.id
        );

      const senderId =
        String(
          conversation.sender?._id ||
            conversation.sender
        );

      return senderId === currentId
        ? conversation.receiver
        : conversation.sender;
    }

    return null;
  };

  const getLastMessage = (
    conversation
  ) => {
    const message =
      conversation?.lastMessage ||
      conversation?.message ||
      "";

    if (
      typeof message !==
      "string"
    ) {
      return "";
    }

    // Don't display the entire Cloudinary URL
    if (
      message.includes(
        "📷 Image:"
      )
    ) {
      return "📷 Image";
    }

    if (
      message.includes(
        "https://res.cloudinary.com/"
      )
    ) {
      return "📷 Image";
    }

    return message;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32" />

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="flex gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200" />

                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          Messages
        </h2>
      </div>

      <div className="max-h-[650px] overflow-y-auto">
        {conversations.length ===
        0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-3xl mb-2">
              💬
            </div>

            <p>
              No conversations yet.
            </p>
          </div>
        ) : (
          conversations.map(
            (
              conversation,
              index
            ) => {
              const otherUser =
                getOtherUser(
                  conversation
                );

              const otherId =
                otherUser?._id ||
                otherUser?.id ||
                conversation?.otherUserId;

              if (!otherId) {
                return null;
              }

              const name =
                otherUser?.name ||
                otherUser?.email ||
                "User";

              const photo =
                otherUser?.photoURL ||
                otherUser?.avatar ||
                otherUser?.profileImage ||
                "";

              const isSelected =
                String(
                  selectedUserId
                ) ===
                String(
                  otherId
                );

              return (
                <button
                  key={
                    conversation._id ||
                    otherId ||
                    index
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      `/messages?user=${otherId}`
                    )
                  }
                  className={`w-full flex items-center gap-3 p-4 text-left border-b hover:bg-gray-50 transition ${
                    isSelected
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                      {name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      {name}
                    </div>

                    <div className="text-sm text-gray-500 truncate">
                      {getLastMessage(
                        conversation
                      )}
                    </div>
                  </div>
                </button>
              );
            }
          )
        )}
      </div>
    </div>
  );
}