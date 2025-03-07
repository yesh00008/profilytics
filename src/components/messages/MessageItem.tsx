
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface MessageItemProps {
  content: string;
  senderName: string;
  timestamp: string;
  isCurrentUser: boolean;
  avatar?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  content,
  senderName,
  timestamp,
  isCurrentUser,
  avatar,
}) => {
  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      {!isCurrentUser && (
        <div className="mr-2 flex-shrink-0">
          <Avatar className="h-8 w-8 bg-gray-200">
            {avatar ? (
              <img src={avatar} alt={senderName} />
            ) : (
              <span className="text-xs font-medium">
                {senderName.charAt(0).toUpperCase()}
              </span>
            )}
          </Avatar>
        </div>
      )}

      <div
        className={`max-w-[70%] p-4 rounded-lg shadow-sm ${
          isCurrentUser
            ? "bg-green-600 text-white rounded-tr-none"
            : "bg-gray-50 border border-gray-200 text-gray-800 rounded-tl-none"
        }`}
      >
        <p className="break-words text-[15px]">{content}</p>
        <div className={`text-xs mt-2 flex justify-between items-center ${isCurrentUser ? "text-green-100" : "text-gray-500"}`}>
          <span>{!isCurrentUser && `${senderName} • `}{new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          <span className="text-[10px]">{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
        </div>
      </div>

      {isCurrentUser && (
        <div className="ml-2 flex-shrink-0">
          <Avatar className="h-8 w-8 bg-gray-200">
            {avatar ? (
              <img src={avatar} alt={senderName} />
            ) : (
              <span className="text-xs font-medium">
                {senderName.charAt(0).toUpperCase()}
              </span>
            )}
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
