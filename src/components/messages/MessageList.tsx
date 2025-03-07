
import React, { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  community_id: string | null;
  receiver_id?: string | null;
  created_at: string;
  type: 'community' | 'direct';
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            content={message.content}
            senderName={message.profiles.full_name}
            timestamp={message.created_at}
            isCurrentUser={message.sender_id === currentUserId}
            avatar={message.profiles.avatar_url}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
