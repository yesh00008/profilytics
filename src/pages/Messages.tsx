
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import MessageList, { Message } from "@/components/messages/MessageList";
import MessageInputForm from "@/components/messages/MessageInputForm";

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser && userId) {
      loadMessages();
      loadReceiverProfile();
      const unsubscribe = subscribeToNewMessages();
      return unsubscribe;
    }
  }, [currentUser, userId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }
    setCurrentUser(user.id);
  };

  const loadReceiverProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setReceiverProfile(data);
    } catch (error: any) {
      console.error("Error loading receiver profile:", error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${currentUser},receiver_id.eq.${currentUser}`)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .is('community_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Ensure type property is specifically 'direct'
      const typedMessages = data?.map(msg => ({
        ...msg,
        type: 'direct' as const
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
      .channel('direct_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `community_id=is.null`
        }, 
        async (payload) => {
          const msg = payload.new as any;
          if ((msg.sender_id === currentUser && msg.receiver_id === userId) || 
              (msg.sender_id === userId && msg.receiver_id === currentUser)) {
            
            // Fetch the sender profile information
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', msg.sender_id)
              .single();
            
            // Ensure the new message has the correct type and profile info
            const newMessage = {
              ...msg,
              type: 'direct' as const,
              profiles: profileData || { full_name: 'Unknown User' }
            };
            
            setMessages(prev => [...prev, newMessage as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!currentUser || !userId) return;
    
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: content,
          sender_id: currentUser,
          receiver_id: userId,
          community_id: null,
          type: 'direct',
          read: false
        });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-500">Loading messages...</span>
          </div>
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
            onClick={() => navigate('/network')}
            className="mb-4 flex items-center hover:bg-green-50 hover:text-green-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Network
          </Button>
        </div>

        <Card className="p-4 h-[600px] flex flex-col shadow-md rounded-xl border-gray-200">
          <div className="flex items-center justify-between p-3 border-b mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {receiverProfile ? `Chat with ${receiverProfile.full_name}` : 'Messages'}
            </h2>
          </div>
          <MessageList 
            messages={messages} 
            currentUserId={currentUser} 
          />
          <MessageInputForm 
            onSendMessage={handleSendMessage} 
            disabled={sending}
          />
        </Card>
      </div>
    </div>
  );
};

export default Messages;
