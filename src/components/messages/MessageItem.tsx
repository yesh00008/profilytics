
import React from "react";

interface MessageItemProps {
  content: string;
  senderName: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  content,
  senderName,
  timestamp,
  isCurrentUser,
}) => {
  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[70%] p-4 rounded-lg shadow-sm ${
          isCurrentUser
            ? "bg-green-600 text-white"
            : "bg-gray-50 border border-gray-200 text-gray-800"
        }`}
      >
        <p className="break-words text-[15px]">{content}</p>
        <span className={`text-xs mt-2 block ${isCurrentUser ? "text-green-100" : "text-gray-500"}`}>
          {senderName} • {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
