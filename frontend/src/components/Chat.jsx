// frontend/src/components/chat/Chat.jsx

import React from "react";
import { useLocation } from "react-router-dom";

import Inbox from "./Inbox";
import ChatWindow from "./ChatWindow";

export default function Chat() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const userId = params.get("user");

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
          <Inbox selectedUserId={userId} />

          <ChatWindow
            otherUserId={userId}
          />
        </div>
      </div>
    </div>
  );
}