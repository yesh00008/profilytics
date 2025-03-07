
import React, { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  community_id: string;
  created_at: string;
  type: 'community';
  profiles: {
    full_name: string;
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
    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          content={message.content}
          senderName={message.profiles.full_name}
          timestamp={message.created_at}
          isCurrentUser={message.sender_id === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
