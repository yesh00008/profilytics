
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Check, X, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Profile {
  id: string;
  full_name: string;
  headline: string;
  avatar_url: string;
  location: string;
  connection_status?: 'pending' | 'accepted' | 'rejected' | null;
}

const Network = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadProfiles();
    }
  }, [currentUser]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setCurrentUser(user.id);
  };

  const loadProfiles = async () => {
    try {
      if (!currentUser) return;

      // Get all profiles except current user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, headline, avatar_url, location')
        .neq('id', currentUser);

      if (profilesError) throw profilesError;

      // Get connection statuses
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${currentUser},addressee_id.eq.${currentUser}`);

      if (connectionsError) throw connectionsError;

      // Combine profiles with connection status
      const profilesWithStatus = profilesData.map((profile: Profile) => {
        const connection = connectionsData?.find(
          (conn: any) => (conn.requester_id === profile.id && conn.addressee_id === currentUser) || 
                        (conn.addressee_id === profile.id && conn.requester_id === currentUser)
        );
        return {
          ...profile,
          connection_status: connection ? connection.status : null
        };
      });

      setProfiles(profilesWithStatus);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading profiles",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: currentUser,
          addressee_id: profileId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection request sent",
        description: "They will be notified of your request.",
      });

      loadProfiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending connection request",
        description: error.message,
      });
    }
  };

  const handleResponse = async (profileId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`)
        .eq(currentUser === profileId ? 'requester_id' : 'addressee_id', currentUser);

      if (error) throw error;

      toast({
        title: accept ? "Connection accepted" : "Connection declined",
        description: accept ? "You are now connected!" : "The request has been declined.",
      });

      loadProfiles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating connection",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">My Network</h1>
          <p className="text-gray-600 mt-2">Connect with other professionals</p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <Card className="p-6">
            <p className="text-gray-600">No profiles found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg text-blue-600">
                          {profile.full_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{profile.full_name}</h3>
                      {profile.headline && (
                        <p className="text-sm text-gray-600">{profile.headline}</p>
                      )}
                      {profile.location && (
                        <p className="text-sm text-gray-500">{profile.location}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {!profile.connection_status && (
                    <Button
                      className="w-full"
                      onClick={() => handleConnect(profile.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {profile.connection_status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleResponse(profile.id, true)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleResponse(profile.id, false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}
                  {profile.connection_status === 'accepted' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/messages/${profile.id}`)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;
