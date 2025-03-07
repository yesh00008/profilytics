
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

interface MessageInputFormProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

const MessageInputForm: React.FC<MessageInputFormProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || disabled) return;
    
    await onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4 py-3 border-t">
      <Input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
        disabled={disabled}
      />
      <Button type="submit" disabled={!newMessage.trim() || disabled} className="bg-green-600 hover:bg-green-700">
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Send
      </Button>
    </form>
  );
};

export default MessageInputForm;
