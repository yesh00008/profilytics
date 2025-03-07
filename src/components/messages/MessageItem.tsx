
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
        className={`max-w-[70%] p-3 rounded-lg ${
          isCurrentUser
            ? "bg-blue-500 text-white"
            : "bg-gray-100"
        }`}
      >
        <p className="break-words">{content}</p>
        <span className="text-xs opacity-70 mt-1 block">
          {senderName} • {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MessageItem;
