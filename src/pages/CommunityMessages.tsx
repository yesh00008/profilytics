
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import MessageList, { Message } from "@/components/messages/MessageList";
import MessageInputForm from "@/components/messages/MessageInputForm";

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
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser && communityId) {
      loadMessages();
      loadCommunityDetails();
      const unsubscribe = subscribeToNewMessages();
      return unsubscribe;
    }
  }, [currentUser, communityId]);

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

      // Ensure type property is specifically 'community'
      const typedMessages = data?.map(msg => ({
        ...msg,
        type: 'community' as const
      })) || [];
      
      setMessages(typedMessages);
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
          // Ensure the new message has the correct type
          const newMessage = {
            ...payload.new as Omit<Message, 'type'>,
            type: 'community' as const
          };
          setMessages(prev => [...prev, newMessage as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !communityId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content,
          sender_id: currentUser,
          community_id: communityId,
          type: 'community'
        });

      if (error) throw error;
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
          <MessageList 
            messages={messages} 
            currentUserId={currentUser} 
          />
          <MessageInputForm onSendMessage={handleSendMessage} />
        </Card>
      </div>
    </div>
  );
};

export default CommunityMessages;
