
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface Message {
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

interface Community {
  id: string;
  name: string;
  community_type: 'public' | 'private' | 'external';
}

const CommunityMessages = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser && communityId) {
      loadMessages();
      loadCommunityDetails();
      subscribeToNewMessages();
    }
  }, [currentUser, communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }
    setCurrentUser(user.id);
  };

  const loadCommunityDetails = async () => {
    if (!communityId) return;
    
    const { data, error } = await supabase
      .from('communities')
      .select('id, name, community_type')
      .eq('id', communityId)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading community",
        description: error.message,
      });
      return;
    }

    setCommunity(data);
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            full_name
          )
        `)
        .eq('community_id', communityId)
        .eq('type', 'community')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
      setLoading(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: error.message,
      });
    }
  };

  const subscribeToNewMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `community_id=eq.${communityId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !communityId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: currentUser,
          community_id: communityId,
          type: 'community'
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/communities')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
          {community && (
            <h1 className="text-2xl font-bold">{community.name}</h1>
          )}
        </div>

        <Card className="p-4 h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender_id === currentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.profiles.full_name} • {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CommunityMessages;
